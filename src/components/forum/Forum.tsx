import { useState, useEffect, useCallback } from "react";
import { MessageCircle, ThumbsUp, ThumbsDown, Plus, Clock, CheckCircle, AlertTriangle, Users, MoreHorizontal, Edit, Trash2, Flag, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useUser } from "@/contexts/UserContext";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CreatePostDialog } from "./CreatePostDialog";
import { DeletePostDialog } from "./DeletePostDialog";
import { ReportPostDialog } from "./ReportPostDialog";
import { EmptyState } from "@/components/ui/empty-state";
import { PostSkeleton } from "@/components/ui/loading-skeleton";
import { forumService } from "@/services/forum.service";
import { normalizeApiError } from "@/lib/api-error";
import { NetworkError } from "@/components/ui/network-error";
import type { ForumPost, VoteType } from "@/types";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const getFlairStyle = (flair: ForumPost["flair"]) => {
  switch (flair) {
    case "cleared": return { bg: "bg-success/10", text: "text-success", icon: <CheckCircle size={12} /> };
    case "stuck": return { bg: "bg-danger/10", text: "text-danger", icon: <AlertTriangle size={12} /> };
    case "question": return { bg: "bg-primary/10", text: "text-primary", icon: <MessageCircle size={12} /> };
    case "info": return { bg: "bg-warning/10", text: "text-warning", icon: <Clock size={12} /> };
  }
};

const POSTS_PER_PAGE = 10;
const FILTER_TO_FLAIR_MAP = {
  All: "all", Questions: "question", Cleared: "cleared", Stuck: "stuck", Info: "info",
} as const;
type FilterLabel = keyof typeof FILTER_TO_FLAIR_MAP;

export function Forum() {
  const { user } = useAuth();
  const { isFollowing, followingIds, isProfileComplete, missingRequiredFields } = useUser();
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [userVotes, setUserVotes] = useState<Record<string, VoteType>>({});
  const [activeFilter, setActiveFilter] = useState<FilterLabel>("All");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [pendingVotes, setPendingVotes] = useState<Record<string, VoteType>>({});

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const [postsData, votes] = await Promise.all([
        forumService.listPosts(),
        user ? forumService.getUserVotes(user.id) : Promise.resolve({} as Record<string, VoteType>),
      ]);
      setPosts(postsData);
      setUserVotes(votes);
    } catch (error) {
      setErrorMessage(normalizeApiError(error, "Unable to load forum posts right now."));
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const handleVote = async (postId: string, type: VoteType) => {
    if (!user || pendingVotes[postId]) return;
    setPendingVotes((prev) => ({ ...prev, [postId]: type }));
    try {
      const result = await forumService.vote(user.id, postId, type);
      setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, upvotes: result.upvotes, downvotes: result.downvotes } : p)));
      setUserVotes((prev) => {
        const next = { ...prev };
        if (result.user_vote) next[postId] = result.user_vote; else delete next[postId];
        return next;
      });
    } finally {
      setPendingVotes((prev) => { const next = { ...prev }; delete next[postId]; return next; });
    }
  };

  const sortedPosts = [...posts].sort((a, b) => (isFollowing(b.user_id) ? 1 : 0) - (isFollowing(a.user_id) ? 1 : 0));
  const filteredPosts = sortedPosts.filter((post) => {
    const mapped = FILTER_TO_FLAIR_MAP[activeFilter];
    return mapped === "all" || post.flair === mapped;
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
        <Button size="sm" className="rounded-full" onClick={() => setCreateDialogOpen(true)} disabled={!isProfileComplete}>
          <Plus size={18} className="mr-1" /> Post
        </Button>
      </div>

      {!isProfileComplete && (
        <Alert className="mb-4 border-warning/40 bg-warning/10">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Finish your profile to post</AlertTitle>
          <AlertDescription>
            Add your {missingRequiredFields.join(", ")} in Profile to create forum posts.
          </AlertDescription>
        </Alert>
      )}

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
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filter === activeFilter ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"}`}
          >{filter}</button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-4">{[1, 2, 3].map((i) => <PostSkeleton key={i} />)}</div>
      ) : errorMessage ? (
        <NetworkError message={errorMessage} onRetry={fetchPosts} />
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
                      <DropdownMenuTrigger className="p-1 hover:bg-muted rounded-full transition-colors">
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
                    <button onClick={() => handleVote(post.id, "up")} disabled={Boolean(pendingVotes[post.id])}
                      className={`flex items-center gap-1 text-sm transition-colors ${userVote === "up" ? "text-success" : "text-muted-foreground hover:text-foreground"} ${pendingVotes[post.id] === "up" ? "opacity-70" : ""}`}>
                      <ThumbsUp size={16} /> <span>{post.upvotes}</span>
                    </button>
                    <button onClick={() => handleVote(post.id, "down")} disabled={Boolean(pendingVotes[post.id])}
                      className={`flex items-center gap-1 text-sm transition-colors ${userVote === "down" ? "text-danger" : "text-muted-foreground hover:text-foreground"} ${pendingVotes[post.id] === "down" ? "opacity-70" : ""}`}>
                      <ThumbsDown size={16} /> <span>{post.downvotes}</span>
                    </button>
                    <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground ml-auto">
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
