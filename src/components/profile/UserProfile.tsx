import { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, Clock, AlertTriangle, Edit2, Settings } from "lucide-react";
import { ProfileEditDialog } from "./ProfileEditDialog";

const getStatusStyle = (status: string) => {
  switch (status) {
    case "cleared":
      return { bg: "bg-success", text: "text-success-foreground", label: "Cleared", icon: <CheckCircle size={12} /> };
    case "serving":
      return { bg: "bg-warning", text: "text-warning-foreground", label: "Serving", icon: <Clock size={12} /> };
    case "in-camp":
      return { bg: "bg-primary", text: "text-primary-foreground", label: "In Camp", icon: <AlertTriangle size={12} /> };
    default:
      return { bg: "bg-muted", text: "text-muted-foreground", label: "Unknown", icon: <Clock size={12} /> };
  }
};

export function UserProfile() {
  const { currentUser, isLoading } = useUser();
  const { user } = useAuth();
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  if (isLoading || !currentUser) {
    return (
      <div className="px-4 py-6 pb-24 animate-fade-in">
        <p className="text-muted-foreground text-center">Loading profile...</p>
      </div>
    );
  }

  const statusStyle = getStatusStyle(currentUser.status);
  const initials = currentUser.username.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="px-4 py-6 pb-24 animate-fade-in">
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
          <Button variant="outline" size="icon" onClick={() => setEditDialogOpen(true)}>
            <Edit2 size={18} />
          </Button>
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

      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="w-full bg-muted rounded-xl p-1 mb-4">
          <TabsTrigger value="posts" className="flex-1 rounded-lg">Posts</TabsTrigger>
          <TabsTrigger value="likes" className="flex-1 rounded-lg">Likes</TabsTrigger>
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
      </Tabs>

      <ProfileEditDialog open={editDialogOpen} onOpenChange={setEditDialogOpen} />
    </div>
  );
}
