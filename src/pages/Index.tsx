import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { BottomNav, TabType } from "@/components/layout/BottomNav";
import { HomePage } from "@/components/home/HomePage";
import { PostingTracker } from "@/components/posting/PostingTracker";
import { AllowanceTracker } from "@/components/allowance/AllowanceTracker";
import { ClearanceChecklist } from "@/components/clearance/ClearanceChecklist";
import { Forum } from "@/components/forum/Forum";

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
      default:
        return <HomePage onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-lg mx-auto">{renderContent()}</main>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
