import { useState } from "react";
import { useUser, UserProfile as UserProfileType } from "@/contexts/UserContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, CheckCircle, Clock, AlertTriangle, Edit2 } from "lucide-react";
import { ProfileEditDialog } from "./ProfileEditDialog";

interface UserProfileProps {
  userId?: string;
}

const getStatusStyle = (status: UserProfileType["status"]) => {
  switch (status) {
    case "cleared":
      return { bg: "bg-success", text: "text-success-foreground", label: "Cleared", icon: <CheckCircle size={12} /> };
    case "serving":
      return { bg: "bg-warning", text: "text-warning-foreground", label: "Serving", icon: <Clock size={12} /> };
    case "in-camp":
      return { bg: "bg-primary", text: "text-primary-foreground", label: "In Camp", icon: <AlertTriangle size={12} /> };
  }
};

export function UserProfile({ userId }: UserProfileProps) {
  const { currentUser, getUserById, isFollowing, followUser, unfollowUser } = useUser();
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const isOwnProfile = !userId || userId === currentUser?.id;
  const user = isOwnProfile ? currentUser : getUserById(userId);

  if (!user) {
    return (
      <div className="px-4 py-6 pb-24 animate-fade-in">
        <p className="text-muted-foreground text-center">User not found</p>
      </div>
    );
  }

  const statusStyle = getStatusStyle(user.status);
  const initials = user.username
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleFollowToggle = () => {
    if (isFollowing(user.id)) {
      unfollowUser(user.id);
    } else {
      followUser(user.id);
    }
  };

  return (
    <div className="px-4 py-6 pb-24 animate-fade-in">
      {/* Profile Header */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-soft mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16 border-2 border-primary">
              <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-bold text-foreground">{user.username}</h2>
              <p className="text-sm text-muted-foreground">
                {user.batch} • {user.stream}
              </p>
              <p className="text-sm text-muted-foreground">{user.state} State</p>
            </div>
          </div>
          {isOwnProfile ? (
            <Button variant="outline" size="icon" onClick={() => setEditDialogOpen(true)}>
              <Edit2 size={18} />
            </Button>
          ) : (
            <Button variant="outline" size="icon">
              <Settings size={18} />
            </Button>
          )}
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2 mb-4">
          <span
            className={`flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full ${statusStyle.bg} ${statusStyle.text}`}
          >
            {statusStyle.icon}
            {statusStyle.label}
          </span>
        </div>

        {/* Bio */}
        <p className="text-foreground mb-4">{user.bio}</p>

        {/* Stats */}
        <div className="flex items-center gap-6 py-4 border-t border-border">
          <div className="text-center">
            <p className="text-xl font-bold text-foreground">{user.posts}</p>
            <p className="text-xs text-muted-foreground">Posts</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-foreground">{user.followers.length}</p>
            <p className="text-xs text-muted-foreground">Followers</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-foreground">{user.following.length}</p>
            <p className="text-xs text-muted-foreground">Following</p>
          </div>
        </div>

        {/* Follow Button (for other users) */}
        {!isOwnProfile && (
          <Button
            onClick={handleFollowToggle}
            className="w-full mt-4"
            variant={isFollowing(user.id) ? "outline" : "default"}
          >
            {isFollowing(user.id) ? "Following" : "Follow"}
          </Button>
        )}
      </div>

      {/* Profile Tabs */}
      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="w-full bg-muted rounded-xl p-1 mb-4">
          <TabsTrigger value="posts" className="flex-1 rounded-lg">
            Posts
          </TabsTrigger>
          <TabsTrigger value="likes" className="flex-1 rounded-lg">
            Likes
          </TabsTrigger>
          <TabsTrigger value="comments" className="flex-1 rounded-lg">
            Comments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts">
          <div className="text-center py-8 text-muted-foreground">
            <p>No posts yet</p>
            <p className="text-sm mt-1">Posts will appear here</p>
          </div>
        </TabsContent>

        <TabsContent value="likes">
          <div className="text-center py-8 text-muted-foreground">
            <p>No liked posts yet</p>
            <p className="text-sm mt-1">Posts you like will appear here</p>
          </div>
        </TabsContent>

        <TabsContent value="comments">
          <div className="text-center py-8 text-muted-foreground">
            <p>No comments yet</p>
            <p className="text-sm mt-1">Your comments will appear here</p>
          </div>
        </TabsContent>
      </Tabs>

      {isOwnProfile && <ProfileEditDialog open={editDialogOpen} onOpenChange={setEditDialogOpen} />}
    </div>
  );
}
