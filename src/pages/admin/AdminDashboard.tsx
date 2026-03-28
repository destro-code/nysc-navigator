import { useState, useEffect } from "react";
import { LayoutDashboard, Users, MessageSquare, Megaphone, Settings, BarChart3, LogOut, Menu, X, Flag, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type AdminTab = "overview" | "users" | "posts" | "announcements" | "settings";

const sidebarItems = [
  { id: "overview" as const, label: "Overview", icon: LayoutDashboard },
  { id: "users" as const, label: "Users", icon: Users },
  { id: "posts" as const, label: "Post Moderation", icon: MessageSquare },
  { id: "announcements" as const, label: "Announcements", icon: Megaphone },
  { id: "settings" as const, label: "Settings", icon: Settings },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [stats, setStats] = useState({ totalUsers: 0, totalPosts: 0, reportedPosts: 0 });
  const [reportedPosts, setReportedPosts] = useState<any[]>([]);
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementContent, setAnnouncementContent] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      const [{ count: userCount }, { count: postCount }, { count: reportCount }] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("forum_posts").select("*", { count: "exact", head: true }).eq("is_deleted", false),
        supabase.from("post_reports").select("*", { count: "exact", head: true }).eq("status", "pending"),
      ]);
      setStats({ totalUsers: userCount || 0, totalPosts: postCount || 0, reportedPosts: reportCount || 0 });
    };

    const fetchReports = async () => {
      const { data } = await supabase
        .from("post_reports")
        .select("*, forum_posts(content, user_id)")
        .eq("status", "pending")
        .order("created_at", { ascending: false });
      setReportedPosts(data || []);
    };

    fetchStats();
    fetchReports();
  }, []);

  const handleLogout = async () => { await logout(); navigate("/"); };

  const handleApprovePost = async (reportId: string) => {
    await supabase.from("post_reports").update({ status: "dismissed" }).eq("id", reportId);
    setReportedPosts((prev) => prev.filter((r) => r.id !== reportId));
    toast({ title: "Report dismissed" });
  };

  const handleRemovePost = async (reportId: string, postId: string) => {
    await supabase.from("forum_posts").update({ is_deleted: true }).eq("id", postId);
    await supabase.from("post_reports").update({ status: "reviewed" }).eq("id", reportId);
    setReportedPosts((prev) => prev.filter((r) => r.id !== reportId));
    toast({ title: "Post removed" });
  };

  const handleCreateAnnouncement = async () => {
    if (!announcementTitle.trim() || !announcementContent.trim() || !user) return;
    const { error } = await supabase.from("announcements").insert({
      title: announcementTitle.trim(),
      content: announcementContent.trim(),
      created_by: user.id,
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Announcement created!" });
      setAnnouncementTitle("");
      setAnnouncementContent("");
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground">Dashboard Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle><Users size={18} className="text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.totalUsers}</div></CardContent></Card>
              <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Posts</CardTitle><MessageSquare size={18} className="text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.totalPosts}</div></CardContent></Card>
              <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Reported</CardTitle><Flag size={18} className="text-danger" /></CardHeader><CardContent><div className="text-2xl font-bold text-danger">{stats.reportedPosts}</div></CardContent></Card>
            </div>
          </div>
        );
      case "posts":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground">Post Moderation</h2>
            {reportedPosts.length === 0 ? (
              <Card><CardContent className="p-8 text-center"><p className="text-muted-foreground">No pending reports 🎉</p></CardContent></Card>
            ) : (
              <div className="space-y-4">
                {reportedPosts.map((report) => (
                  <Card key={report.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-warning/10 text-warning">Pending</span>
                          <p className="text-sm text-foreground mt-2">{report.forum_posts?.content || "Post content unavailable"}</p>
                          <p className="text-xs text-muted-foreground mt-1">Reason: {report.reason}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="text-success border-success hover:bg-success/10" onClick={() => handleApprovePost(report.id)}>
                            <CheckCircle size={14} className="mr-1" /> Dismiss
                          </Button>
                          <Button size="sm" variant="outline" className="text-danger border-danger hover:bg-danger/10" onClick={() => handleRemovePost(report.id, report.post_id)}>
                            <AlertTriangle size={14} className="mr-1" /> Remove
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );
      case "announcements":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground">Create Announcement</h2>
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2"><Label>Title</Label><Input value={announcementTitle} onChange={(e) => setAnnouncementTitle(e.target.value)} placeholder="Announcement title" /></div>
                <div className="space-y-2"><Label>Content</Label><Textarea value={announcementContent} onChange={(e) => setAnnouncementContent(e.target.value)} placeholder="Write your announcement..." className="min-h-[120px]" /></div>
                <Button onClick={handleCreateAnnouncement} disabled={!announcementTitle.trim() || !announcementContent.trim()}>
                  <Megaphone size={16} className="mr-2" /> Publish Announcement
                </Button>
              </CardContent>
            </Card>
          </div>
        );
      default:
        return <div className="text-center py-12"><p className="text-muted-foreground">Coming soon</p></div>;
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform lg:transform-none ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center"><span className="text-primary-foreground font-bold text-sm">N</span></div>
              <span className="font-bold text-foreground">Admin Panel</span>
            </div>
            <button className="lg:hidden p-1 hover:bg-muted rounded" onClick={() => setSidebarOpen(false)}><X size={20} /></button>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            {sidebarItems.map((item) => (
              <button key={item.id} onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === item.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
                <item.icon size={18} /> {item.label}
              </button>
            ))}
          </nav>
          <div className="p-4 border-t border-border">
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              <LogOut size={18} /> Logout
            </button>
          </div>
        </div>
      </aside>
      <main className="flex-1 min-w-0">
        <header className="lg:hidden sticky top-0 z-30 bg-background border-b border-border p-4">
          <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-muted rounded-lg"><Menu size={20} /></button>
        </header>
        <div className="p-4 lg:p-8">{renderContent()}</div>
      </main>
    </div>
  );
}
