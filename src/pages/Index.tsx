import { lazy, Suspense, useState } from "react";
import { Header } from "@/components/layout/Header";
import { BottomNav, TabType } from "@/components/layout/BottomNav";
import { HomePage } from "@/components/home/HomePage";

const PostingTracker = lazy(() => import("@/components/posting/PostingTracker").then((module) => ({ default: module.PostingTracker })));
const AllowanceTracker = lazy(() => import("@/components/allowance/AllowanceTracker").then((module) => ({ default: module.AllowanceTracker })));
const ClearanceChecklist = lazy(() => import("@/components/clearance/ClearanceChecklist").then((module) => ({ default: module.ClearanceChecklist })));
const Forum = lazy(() => import("@/components/forum/Forum").then((module) => ({ default: module.Forum })));
const UserProfile = lazy(() => import("@/components/profile/UserProfile").then((module) => ({ default: module.UserProfile })));

const TabFallback = () => (
  <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-6">
    <div className="text-center">
      <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" aria-hidden="true" />
      <p className="text-sm text-muted-foreground">Loading section…</p>
    </div>
  </div>
);

const Index = () => {
  const [activeTab, setActiveTab] = useState<TabType>("home");

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return <HomePage onNavigate={setActiveTab} />;
      case "posting":
        return <PostingTracker />;
      case "allowance":
        return <AllowanceTracker />;
      case "clearance":
        return <ClearanceChecklist />;
      case "forum":
        return <Forum />;
      case "profile":
        return <UserProfile />;
      default:
        return <HomePage onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-lg mx-auto">
        <Suspense fallback={<TabFallback />}>
          {renderContent()}
        </Suspense>
      </main>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
