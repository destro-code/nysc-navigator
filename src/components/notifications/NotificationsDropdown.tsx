import { useState } from "react";
import { Bell, CheckCircle, Clock, Megaphone, Wallet, X } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Notification {
  id: string;
  type: "clearance" | "allowance" | "announcement" | "general";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "clearance",
    title: "Clearance Reminder",
    message: "Don't forget to complete your February clearance before the 28th!",
    timestamp: "2h ago",
    read: false,
  },
  {
    id: "2",
    type: "allowance",
    title: "Allowance Update",
    message: "January allowance has been disbursed. Check your account.",
    timestamp: "1d ago",
    read: false,
  },
  {
    id: "3",
    type: "announcement",
    title: "NYSC Announcement",
    message: "SAED entrepreneurship training registration now open.",
    timestamp: "2d ago",
    read: true,
  },
  {
    id: "4",
    type: "general",
    title: "Profile Complete",
    message: "Your profile is now 80% complete. Add your PPA details.",
    timestamp: "3d ago",
    read: true,
  },
];

const getNotificationIcon = (type: Notification["type"]) => {
  switch (type) {
    case "clearance":
      return <CheckCircle size={16} className="text-success" />;
    case "allowance":
      return <Wallet size={16} className="text-warning" />;
    case "announcement":
      return <Megaphone size={16} className="text-primary" />;
    default:
      return <Clock size={16} className="text-muted-foreground" />;
  }
};

export function NotificationsDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button className="relative p-2 rounded-full hover:bg-muted transition-colors">
          <Bell size={20} className="text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-danger rounded-full text-[10px] text-danger-foreground flex items-center justify-center font-medium">
              {unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-semibold text-foreground">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-primary"
              onClick={markAllAsRead}
            >
              Mark all as read
            </Button>
          )}
        </div>

        <ScrollArea className="max-h-[400px]">
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell size={40} className="mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">No notifications yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                We'll notify you about important updates
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-muted/50 transition-colors cursor-pointer ${
                    !notification.read ? "bg-primary/5" : ""
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={`text-sm ${
                            !notification.read
                              ? "font-semibold text-foreground"
                              : "font-medium text-foreground"
                          }`}
                        >
                          {notification.title}
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeNotification(notification.id);
                          }}
                          className="text-muted-foreground hover:text-foreground flex-shrink-0"
                        >
                          <X size={14} />
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {notification.timestamp}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1.5" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="p-3 border-t border-border">
          <Button variant="ghost" className="w-full text-sm" size="sm">
            View all notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
