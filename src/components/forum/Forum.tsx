import { useState, useEffect } from "react";
import { MessageCircle, ThumbsUp, ThumbsDown, Plus, Clock, CheckCircle, AlertTriangle, Users, MoreHorizontal, Edit, Trash2, Flag, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/UserContext";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CreatePostDialog } from "./CreatePostDialog";
import { DeletePostDialog } from "./DeletePostDialog";
import { ReportPostDialog } from "./ReportPostDialog";
import { EmptyState } from "@/components/ui/empty-state";
import { PostSkeleton } from "@/components/ui/loading-skeleton";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ForumPost {
  id: string;
  content: string;
  user_id: string;
  author_username: string;
  author_status: string;
  created_at: string;
  upvotes: number;
  downvotes: number;
  comments_count: number;
  flair: "cleared" | "stuck" | "question" | "info";
  user_vote?: "up" | "down" | null;
}

const getFlairStyle = (flair: ForumPost["flair"]) => {
  switch (flair) {
    case "cleared":
      return { bg: "bg-success/10", text: "text-success", icon: <CheckCircle size={12} /> };
    case "stuck":
      return { bg: "bg-danger/10", text: "text-danger", icon: <AlertTriangle size={12} /> };
    case "question":
      return { bg: "bg-primary/10", text: "text-primary", icon: <MessageCircle size={12} /> };
    case "info":
      return { bg: "bg-warning/10", text: "text-warning", icon: <Clock size={12} /> };
  }
};

const POSTS_PER_PAGE = 10;
const FILTER_TO_FLAIR_MAP = {
  All: "all",
  Questions: "question",
  Cleared: "cleared",
  Stuck: "stuck",
  Info: "info",
} as const;

type FilterLabel = keyof typeof FILTER_TO_FLAIR_MAP;

export function Forum() {
  const { user } = useAuth();
  const { isFollowing, followingIds } = useUser();
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [userVotes, setUserVotes] = useState<Record<string, "up" | "down">>({});
  const [activeFilter, setActiveFilter] = useState<FilterLabel>("All");
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  const fetchPosts = async () => {
    setIsLoading(true);
    const { data: postsData } = await supabase
      .from("forum_posts")
      .select("*")
      .eq("is_deleted", false)
      .order("created_at", { ascending: false });

    if (!postsData) { setIsLoading(false); return; }

    // Fetch author profiles
    const userIds = [...new Set(postsData.map((p) => p.user_id))];
    const { data: profiles } = await supabase.from("profiles").select("user_id, username, status").in("user_id", userIds);
    const profileMap = new Map(profiles?.map((p) => [p.user_id, p]) || []);

    // Fetch user votes
    if (user) {
      const { data: votes } = await supabase.from("post_votes").select("post_id, vote_type").eq("user_id", user.id);
      const voteMap: Record<string, "up" | "down"> = {};
      votes?.forEach((v) => { voteMap[v.post_id] = v.vote_type as "up" | "down"; });
      setUserVotes(voteMap);
    }

    setPosts(
      postsData.map((p) => {
        const profile = profileMap.get(p.user_id);
        return {
          id: p.id,
          content: p.content,
          user_id: p.user_id,
          author_username: profile?.username || "Corper",
          author_status: profile?.status || "serving",
          created_at: p.created_at,
          upvotes: p.upvotes,
          downvotes: p.downvotes,
          comments_count: p.comments_count,
          flair: p.flair as ForumPost["flair"],
        };
      })
    );
    setIsLoading(false);
  };

  useEffect(() => { fetchPosts(); }, [user]);

  const handleVote = async (postId: string, type: "up" | "down") => {
    if (!user) return;
    const currentVote = userVotes[postId];

    if (currentVote === type) {
      // Remove vote
      await supabase.from("post_votes").delete().eq("user_id", user.id).eq("post_id", postId);
      setUserVotes((prev) => { const n = { ...prev }; delete n[postId]; return n; });
      // Update post counts
      await supabase.from("forum_posts").update({
        [type === "up" ? "upvotes" : "downvotes"]: posts.find((p) => p.id === postId)?.[type === "up" ? "upvotes" : "downvotes"]! - 1,
      }).eq("id", postId);
    } else {
      if (currentVote) {
        // Change vote
        await supabase.from("post_votes").update({ vote_type: type }).eq("user_id", user.id).eq("post_id", postId);
      } else {
        await supabase.from("post_votes").insert({ user_id: user.id, post_id: postId, vote_type: type });
      }
      setUserVotes((prev) => ({ ...prev, [postId]: type }));
    }
    fetchPosts();
  };

  // Sort: following first
  const sortedPosts = [...posts].sort((a, b) => {
    const aFollow = isFollowing(a.user_id) ? -1 : 0;
    const bFollow = isFollowing(b.user_id) ? -1 : 0;
    return aFollow - bFollow;
  });

  const filteredPosts = sortedPosts.filter((post) => {
    const mappedFlair = FILTER_TO_FLAIR_MAP[activeFilter];
    if (mappedFlair === "all") return true;
    return post.flair === mappedFlair;
  });

  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const paginatedPosts = filteredPosts.slice((currentPage - 1) * POSTS_PER_PAGE, currentPage * POSTS_PER_PAGE);

  const getInitials = (name: string) => name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="px-4 py-6 pb-24 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Batch Forum</h2>
          <p className="text-muted-foreground text-sm">Connect with fellow corpers</p>
        </div>
        <Button size="sm" className="rounded-full" onClick={() => setCreateDialogOpen(true)}>
          <Plus size={18} className="mr-1" /> Post
        </Button>
      </div>

      {followingIds.length > 0 && (
        <div className="flex items-center gap-2 mb-4 p-3 bg-primary/5 rounded-xl border border-primary/20">
          <Users size={16} className="text-primary" />
          <p className="text-sm text-foreground">
            Showing posts from <span className="font-medium text-primary">{followingIds.length} people</span> you follow first
          </p>
        </div>
      )}

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {(Object.keys(FILTER_TO_FLAIR_MAP) as FilterLabel[]).map((filter) => (
          <button key={filter} onClick={() => { setActiveFilter(filter); setCurrentPage(1); }}
            aria-pressed={filter === activeFilter}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${filter === activeFilter ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"}`}
          >{filter}</button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-4">{[1, 2, 3].map((i) => <PostSkeleton key={i} />)}</div>
      ) : paginatedPosts.length === 0 ? (
        <EmptyState icon={<MessageCircle size={32} />} title="No posts yet"
          description={activeFilter === "All" ? "Be the first to start a conversation!" : `No ${activeFilter.toLowerCase()} posts yet.`}
          action={{ label: "Create Post", onClick: () => setCreateDialogOpen(true) }} />
      ) : (
        <>
          <div className="space-y-4">
            {paginatedPosts.map((post) => {
              const flairStyle = getFlairStyle(post.flair);
              const userVote = userVotes[post.id];
              const isFollowingAuthor = isFollowing(post.user_id);
              const isOwnPost = post.user_id === user?.id;

              return (
                <div key={post.id} className={`bg-card border rounded-2xl p-4 shadow-soft ${isFollowingAuthor ? "border-primary/30" : "border-border"}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
                        {getInitials(post.author_username)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground">{post.author_username}</p>
                        {isFollowingAuthor && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">Following</span>}
                        {post.author_status === "cleared" && <CheckCircle size={12} className="text-success" />}
                      </div>
                      <p className="text-xs text-muted-foreground">{timeAgo(post.created_at)}</p>
                    </div>
                    <span className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${flairStyle.bg} ${flairStyle.text}`}>
                      {flairStyle.icon} {post.flair.charAt(0).toUpperCase() + post.flair.slice(1)}
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        aria-label={`Open post actions for ${post.author_username}`}
                        className="p-1 hover:bg-muted rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        <MoreHorizontal size={16} className="text-muted-foreground" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {isOwnPost ? (
                          <>
                            <DropdownMenuItem><Edit size={14} className="mr-2" /> Edit Post</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-danger focus:text-danger" onClick={() => { setSelectedPostId(post.id); setDeleteDialogOpen(true); }}>
                              <Trash2 size={14} className="mr-2" /> Delete Post
                            </DropdownMenuItem>
                          </>
                        ) : (
                          <DropdownMenuItem onClick={() => { setSelectedPostId(post.id); setReportDialogOpen(true); }}>
                            <Flag size={14} className="mr-2" /> Report Post
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <p className="text-foreground mb-3">{post.content}</p>
                  {post.upvotes > 20 && <p className="text-xs text-muted-foreground mb-3">🔥 {post.upvotes} corp members agree</p>}

                  <div className="flex items-center gap-4 pt-3 border-t border-border">
                    <button
                      onClick={() => handleVote(post.id, "up")}
                      aria-label={`Upvote post by ${post.author_username}`}
                      aria-pressed={userVote === "up"}
                      className={`flex items-center gap-1 text-sm transition-colors rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${userVote === "up" ? "text-success" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      <ThumbsUp size={16} /> <span>{post.upvotes}</span>
                    </button>
                    <button
                      onClick={() => handleVote(post.id, "down")}
                      aria-label={`Downvote post by ${post.author_username}`}
                      aria-pressed={userVote === "down"}
                      className={`flex items-center gap-1 text-sm transition-colors rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${userVote === "down" ? "text-danger" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      <ThumbsDown size={16} /> <span>{post.downvotes}</span>
                    </button>
                    <button
                      aria-label={`Open comments for post by ${post.author_username}`}
                      className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground ml-auto rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <MessageCircle size={16} /> <span>{post.comments_count}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}><ChevronLeft size={16} /></Button>
              <span className="text-sm text-muted-foreground px-3">Page {currentPage} of {totalPages}</span>
              <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}><ChevronRight size={16} /></Button>
            </div>
          )}
        </>
      )}

      <CreatePostDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} onPostCreated={fetchPosts} />
      <DeletePostDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} postId={selectedPostId || ""} onDeleted={fetchPosts} />
      <ReportPostDialog open={reportDialogOpen} onOpenChange={setReportDialogOpen} postId={selectedPostId || ""} />
    </div>
  );
}
