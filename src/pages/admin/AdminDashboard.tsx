import { useState } from "react";
import { 
  LayoutDashboard, 
  Users, 
  MessageSquare, 
  Megaphone, 
  Settings, 
  BarChart3,
  LogOut,
  Menu,
  X,
  Flag,
  CheckCircle,
  Clock,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

type AdminTab = "overview" | "users" | "posts" | "announcements" | "settings";

const sidebarItems = [
  { id: "overview" as const, label: "Overview", icon: LayoutDashboard },
  { id: "users" as const, label: "Users", icon: Users },
  { id: "posts" as const, label: "Post Moderation", icon: MessageSquare },
  { id: "announcements" as const, label: "Announcements", icon: Megaphone },
  { id: "settings" as const, label: "Settings", icon: Settings },
];

const mockStats = {
  totalUsers: 1234,
  activeToday: 89,
  totalPosts: 567,
  reportedPosts: 12,
  pendingAnnouncements: 3,
};

const mockReportedPosts = [
  { id: "1", content: "Inappropriate content example...", author: "user123", reports: 5, status: "pending" },
  { id: "2", content: "Spam post example...", author: "user456", reports: 3, status: "pending" },
  { id: "3", content: "Misleading information...", author: "user789", reports: 8, status: "reviewed" },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground">Dashboard Overview</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
                  <Users size={18} className="text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mockStats.totalUsers.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground mt-1">+12% from last month</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Active Today</CardTitle>
                  <BarChart3 size={18} className="text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mockStats.activeToday}</div>
                  <p className="text-xs text-muted-foreground mt-1">Currently online</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Posts</CardTitle>
                  <MessageSquare size={18} className="text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mockStats.totalPosts}</div>
                  <p className="text-xs text-muted-foreground mt-1">This month</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Reported</CardTitle>
                  <Flag size={18} className="text-danger" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-danger">{mockStats.reportedPosts}</div>
                  <p className="text-xs text-muted-foreground mt-1">Needs review</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users size={14} className="text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">New user registered</p>
                        <p className="text-xs text-muted-foreground">{i * 2} hours ago</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );
        
      case "posts":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">Post Moderation</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Clock size={16} className="mr-2" />
                  Pending ({mockReportedPosts.filter(p => p.status === "pending").length})
                </Button>
              </div>
            </div>
            
            <div className="space-y-4">
              {mockReportedPosts.map((post) => (
                <Card key={post.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            post.status === "pending" 
                              ? "bg-warning/10 text-warning" 
                              : "bg-success/10 text-success"
                          }`}>
                            {post.status === "pending" ? "Pending Review" : "Reviewed"}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Flag size={12} />
                            {post.reports} reports
                          </span>
                        </div>
                        <p className="text-sm text-foreground mb-2">{post.content}</p>
                        <p className="text-xs text-muted-foreground">Posted by: {post.author}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="text-success border-success hover:bg-success/10">
                          <CheckCircle size={14} className="mr-1" />
                          Approve
                        </Button>
                        <Button size="sm" variant="outline" className="text-danger border-danger hover:bg-danger/10">
                          <AlertTriangle size={14} className="mr-1" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
        
      case "announcements":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">Announcements</h2>
              <Button>
                <Megaphone size={16} className="mr-2" />
                Create Announcement
              </Button>
            </div>
            
            <Card>
              <CardContent className="p-6">
                <div className="text-center py-8">
                  <Megaphone size={48} className="mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">Create an Announcement</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Send important updates to all corps members
                  </p>
                  <Button>Create New</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
        
      default:
        return (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Select a section from the sidebar</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform lg:transform-none ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">N</span>
              </div>
              <span className="font-bold text-foreground">Admin Panel</span>
            </div>
            <button 
              className="lg:hidden p-1 hover:bg-muted rounded"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={20} />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 p-4 space-y-1">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === item.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </button>
            ))}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-border">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-30 bg-background border-b border-border p-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-muted rounded-lg"
          >
            <Menu size={20} />
          </button>
        </header>

        <div className="p-4 lg:p-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
