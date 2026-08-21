import { useEffect, useMemo, useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, Clock, AlertTriangle, Edit2, ChevronLeft, ChevronRight, MessageCircle, ThumbsUp, Settings } from "lucide-react";
import { ProfileEditDialog } from "./ProfileEditDialog";
import { EmptyState } from "@/components/ui/empty-state";
import { forumService } from "@/services/forum.service";
import type { ForumPost } from "@/types";

const POSTS_PER_PAGE = 5;

const getStatusStyle = (status: string) => {
  switch (status) {
    case "cleared": return { bg: "bg-success", text: "text-success-foreground", label: "Cleared", icon: <CheckCircle size={12} /> };
    case "serving": return { bg: "bg-warning", text: "text-warning-foreground", label: "Serving", icon: <Clock size={12} /> };
    case "in-camp": return { bg: "bg-primary", text: "text-primary-foreground", label: "In Camp", icon: <AlertTriangle size={12} /> };
    default: return { bg: "bg-muted", text: "text-muted-foreground", label: "Unknown", icon: <Clock size={12} /> };
  }
};

export function UserProfile() {
  const { currentUser, isLoading, isProfileComplete, missingRequiredFields } = useUser();
  const { user } = useAuth();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [likedPosts, setLikedPosts] = useState<ForumPost[]>([]);
  const [activeTab, setActiveTab] = useState("posts");
  const [postsPage, setPostsPage] = useState(1);
  const [likesPage, setLikesPage] = useState(1);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [authored, liked] = await Promise.all([
        forumService.listUserPosts(user.id),
        forumService.listLikedPosts(user.id),
      ]);
      setPosts(authored);
      setLikedPosts(liked);
    })();
  }, [user]);

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const paginate = (items: ForumPost[], currentPage: number) => {
    const totalPages = Math.max(1, Math.ceil(items.length / POSTS_PER_PAGE));
    const pageItems = items.slice((currentPage - 1) * POSTS_PER_PAGE, currentPage * POSTS_PER_PAGE);
    return { totalPages, pageItems };
  };

  const paginatedPosts = useMemo(() => paginate(posts, postsPage), [posts, postsPage]);
  const paginatedLikes = useMemo(() => paginate(likedPosts, likesPage), [likedPosts, likesPage]);

  if (isLoading || !currentUser) {
    return <div className="px-4 py-6 pb-24 animate-fade-in"><p className="text-muted-foreground text-center">Loading profile...</p></div>;
  }

  const statusStyle = getStatusStyle(currentUser.status);
  const initials = currentUser.username.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const renderPostList = (items: ForumPost[], totalPages: number, currentPage: number, setPage: (p: number) => void, emptyTitle: string, emptyDescription: string) => {
    if (items.length === 0) return <EmptyState icon={<MessageCircle size={28} />} title={emptyTitle} description={emptyDescription} />;
    return (
      <>
        <div className="space-y-4">
          {items.map((post) => (
            <div key={post.id} className="bg-card border border-border rounded-2xl p-4 shadow-soft">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-foreground">{post.author_username}</p>
                <p className="text-xs text-muted-foreground">{timeAgo(post.created_at)}</p>
              </div>
              <p className="text-foreground mb-3">{post.content}</p>
              <div className="flex items-center gap-4 pt-3 border-t border-border text-muted-foreground">
                <span className="flex items-center gap-1 text-sm"><ThumbsUp size={15} />{post.upvotes}</span>
                <span className="flex items-center gap-1 text-sm"><MessageCircle size={15} />{post.comments_count}</span>
              </div>
            </div>
          ))}
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <Button variant="outline" size="sm" onClick={() => setPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}><ChevronLeft size={16} /></Button>
            <span className="text-sm text-muted-foreground px-3">Page {currentPage} of {totalPages}</span>
            <Button variant="outline" size="sm" onClick={() => setPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}><ChevronRight size={16} /></Button>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="px-4 py-6 pb-24 animate-fade-in">
      {!isProfileComplete && (
        <Alert className="mb-4 border-warning/40 bg-warning/10">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Complete your profile</AlertTitle>
          <AlertDescription className="mt-2">
            Add your {missingRequiredFields.join(", ")} to unlock posting calculations and forum posting.
            <Button size="sm" className="mt-3" onClick={() => setEditDialogOpen(true)}>
              <Settings size={14} className="mr-1" /> Edit profile
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="bg-card border border-border rounded-2xl p-6 shadow-soft mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16 border-2 border-primary">
              <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-bold text-foreground">{currentUser.username}</h2>
              <p className="text-sm text-muted-foreground">{currentUser.batch} • {currentUser.stream}</p>
              <p className="text-sm text-muted-foreground">{currentUser.state || "No state set"}</p>
            </div>
          </div>
          <Button variant="outline" size="icon" onClick={() => setEditDialogOpen(true)}><Edit2 size={18} /></Button>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <span className={`flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full ${statusStyle.bg} ${statusStyle.text}`}>
            {statusStyle.icon} {statusStyle.label}
          </span>
        </div>

        <p className="text-foreground mb-4">{currentUser.bio || "No bio yet"}</p>

        <div className="flex items-center gap-6 py-4 border-t border-border">
          <div className="text-center">
            <p className="text-xl font-bold text-foreground">{currentUser.follower_count}</p>
            <p className="text-xs text-muted-foreground">Followers</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-foreground">{currentUser.following_count}</p>
            <p className="text-xs text-muted-foreground">Following</p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full bg-muted rounded-xl p-1 mb-4">
          <TabsTrigger value="posts" className="flex-1 rounded-lg">Posts</TabsTrigger>
          <TabsTrigger value="likes" className="flex-1 rounded-lg">Likes</TabsTrigger>
        </TabsList>
        <TabsContent value="posts">
          {renderPostList(paginatedPosts.pageItems, paginatedPosts.totalPages, postsPage, setPostsPage, "No posts published yet", "When you share your first update in the forum, it will appear here.")}
        </TabsContent>
        <TabsContent value="likes">
          {renderPostList(paginatedLikes.pageItems, paginatedLikes.totalPages, likesPage, setLikesPage, "No liked posts yet", "Posts you upvote in the forum will show up in this tab.")}
        </TabsContent>
      </Tabs>

      <ProfileEditDialog open={editDialogOpen} onOpenChange={setEditDialogOpen} />
    </div>
  );
}
