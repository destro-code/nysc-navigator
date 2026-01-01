import { useUser, UserProfile } from "@/contexts/UserContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, AlertTriangle } from "lucide-react";

interface UserCardProps {
  user: UserProfile;
  onClick?: () => void;
}

const getStatusStyle = (status: UserProfile["status"]) => {
  switch (status) {
    case "cleared":
      return { bg: "bg-success", text: "text-success-foreground", icon: <CheckCircle size={10} /> };
    case "serving":
      return { bg: "bg-warning", text: "text-warning-foreground", icon: <Clock size={10} /> };
    case "in-camp":
      return { bg: "bg-primary", text: "text-primary-foreground", icon: <AlertTriangle size={10} /> };
  }
};

export function UserCard({ user, onClick }: UserCardProps) {
  const { currentUser, isFollowing, followUser, unfollowUser } = useUser();
  const statusStyle = getStatusStyle(user.status);
  const isOwnProfile = currentUser?.id === user.id;

  const initials = user.username
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleFollowToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFollowing(user.id)) {
      unfollowUser(user.id);
    } else {
      followUser(user.id);
    }
  };

  return (
    <div
      onClick={onClick}
      className="flex items-center justify-between p-3 bg-card border border-border rounded-xl cursor-pointer hover:bg-accent transition-colors"
    >
      <div className="flex items-center gap-3">
        <Avatar className="w-10 h-10">
          <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium text-foreground">{user.username}</p>
            <span className={`flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full ${statusStyle.bg} ${statusStyle.text}`}>
              {statusStyle.icon}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">{user.state} • {user.batch}</p>
        </div>
      </div>

      {!isOwnProfile && (
        <Button
          size="sm"
          variant={isFollowing(user.id) ? "outline" : "default"}
          onClick={handleFollowToggle}
          className="text-xs h-8"
        >
          {isFollowing(user.id) ? "Following" : "Follow"}
        </Button>
      )}
    </div>
  );
}
