import { useState } from "react";
import { MessageCircle, ThumbsUp, ThumbsDown, Plus, Clock, CheckCircle, AlertTriangle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/UserContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ForumPost {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  timestamp: string;
  upvotes: number;
  downvotes: number;
  comments: number;
  flair: "cleared" | "stuck" | "question" | "info";
}

const posts: ForumPost[] = [
  {
    id: "1",
    content: "Has anyone seen the LG inspector this week? Been waiting for 3 days now 😭",
    authorId: "user_3",
    authorName: "Frustrated Corper",
    timestamp: "2h ago",
    upvotes: 24,
    downvotes: 2,
    comments: 12,
    flair: "question",
  },
  {
    id: "2",
    content: "Finally got my PPA clearance! The trick is to go early morning before 8am. You're welcome 🙌",
    authorId: "user_1",
    authorName: "Lagos Corper",
    timestamp: "5h ago",
    upvotes: 45,
    downvotes: 0,
    comments: 8,
    flair: "cleared",
  },
  {
    id: "3",
    content: "State allowance for January still pending. Anyone else experiencing this?",
    authorId: "user_3",
    authorName: "Frustrated Corper",
    timestamp: "1d ago",
    upvotes: 89,
    downvotes: 1,
    comments: 34,
    flair: "stuck",
  },
  {
    id: "4",
    content: "Quick reminder: SAED project submission deadline is next Friday. Don't sleep on it!",
    authorId: "user_2",
    authorName: "Helpful Senior",
    timestamp: "2d ago",
    upvotes: 67,
    downvotes: 0,
    comments: 15,
    flair: "info",
  },
];

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

export function Forum() {
  const { currentUser, isFollowing, hasLikedPost, likePost, unlikePost, allUsers } = useUser();
  const [votedPosts, setVotedPosts] = useState<Record<string, "up" | "down" | null>>({});
  const [activeFilter, setActiveFilter] = useState("All");

  const handleVote = (postId: string, type: "up" | "down") => {
    if (type === "up") {
      if (hasLikedPost(postId)) {
        unlikePost(postId);
      } else {
        likePost(postId);
      }
    }
    setVotedPosts((prev) => ({
      ...prev,
      [postId]: prev[postId] === type ? null : type,
    }));
  };

  // Sort posts: following first, then by batch, then others
  const sortedPosts = [...posts].sort((a, b) => {
    const aIsFollowing = isFollowing(a.authorId);
    const bIsFollowing = isFollowing(b.authorId);
    if (aIsFollowing && !bIsFollowing) return -1;
    if (!aIsFollowing && bIsFollowing) return 1;
    return 0;
  });

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getUserStatus = (authorId: string) => {
    const user = allUsers.find((u) => u.id === authorId);
    return user?.status || "serving";
  };

  return (
    <div className="px-4 py-6 pb-24 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Batch Forum</h2>
          <p className="text-muted-foreground text-sm">Connect with fellow corpers</p>
        </div>
        <Button size="sm" className="rounded-full">
          <Plus size={18} className="mr-1" />
          Post
        </Button>
      </div>

      {/* Following indicator */}
      {currentUser && currentUser.following.length > 0 && (
        <div className="flex items-center gap-2 mb-4 p-3 bg-primary/5 rounded-xl border border-primary/20">
          <Users size={16} className="text-primary" />
          <p className="text-sm text-foreground">
            Showing posts from <span className="font-medium text-primary">{currentUser.following.length} people</span> you follow first
          </p>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {["All", "Questions", "Cleared", "Stuck", "Info"].map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              filter === activeFilter
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Posts */}
      <div className="space-y-4">
        {sortedPosts.map((post) => {
          const flairStyle = getFlairStyle(post.flair);
          const userVote = votedPosts[post.id];
          const isFollowingAuthor = isFollowing(post.authorId);
          const authorStatus = getUserStatus(post.authorId);

          return (
            <div
              key={post.id}
              className={`bg-card border rounded-2xl p-4 shadow-soft ${
                isFollowingAuthor ? "border-primary/30" : "border-border"
              }`}
            >
              {/* Author with Avatar */}
              <div className="flex items-center gap-3 mb-3">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
                    {getInitials(post.authorName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{post.authorName}</p>
                    {isFollowingAuthor && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                        Following
                      </span>
                    )}
                    {authorStatus === "cleared" && (
                      <CheckCircle size={12} className="text-success" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{post.timestamp}</p>
                </div>
                {/* Flair */}
                <span
                  className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${flairStyle.bg} ${flairStyle.text}`}
                >
                  {flairStyle.icon}
                  {post.flair.charAt(0).toUpperCase() + post.flair.slice(1)}
                </span>
              </div>

              {/* Content */}
              <p className="text-foreground mb-3">{post.content}</p>

              {/* Social proof */}
              {post.upvotes > 20 && (
                <p className="text-xs text-muted-foreground mb-3">
                  🔥 {post.upvotes} corp members agree
                </p>
              )}

              {/* Actions */}
              <div className="flex items-center gap-4 pt-3 border-t border-border">
                <button
                  onClick={() => handleVote(post.id, "up")}
                  className={`flex items-center gap-1 text-sm transition-colors ${
                    userVote === "up" || hasLikedPost(post.id)
                      ? "text-success"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <ThumbsUp size={16} />
                  <span>{post.upvotes + (userVote === "up" ? 1 : 0)}</span>
                </button>
                <button
                  onClick={() => handleVote(post.id, "down")}
                  className={`flex items-center gap-1 text-sm transition-colors ${
                    userVote === "down"
                      ? "text-danger"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <ThumbsDown size={16} />
                  <span>{post.downvotes + (userVote === "down" ? 1 : 0)}</span>
                </button>
                <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground ml-auto">
                  <MessageCircle size={16} />
                  <span>{post.comments}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}