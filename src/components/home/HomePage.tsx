import { MapPin, Wallet, CheckSquare, MessageCircle, Sparkles } from "lucide-react";
import { FeatureCard } from "./FeatureCard";
import { OfficialUpdates } from "./OfficialUpdates";
import type { TabType } from "../layout/BottomNav";
import { useActiveBatch } from "@/hooks/useActiveBatch";
import { useDashboardStats } from "@/hooks/useDashboardStats";

interface HomePageProps {
  onNavigate: (tab: TabType) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  const { activeBatchLabel } = useActiveBatch();
  const { daysRemaining, clearancePercentage, isLoading } = useDashboardStats();

  return (
    <div className="px-4 py-6 pb-24 animate-fade-in">
      {/* Hero Section */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={16} className="text-warning" />
          <span className="text-xs font-medium text-warning">{activeBatchLabel}</span>
        </div>
        <h2 className="text-3xl font-bold text-foreground leading-tight mb-2">
          Survive NYSC.
          <br />
          <span className="text-primary">One tap at a time.</span>
        </h2>
        <p className="text-muted-foreground text-base">
          Track posting. Track money. Clear stress. Complain together.
        </p>
      </section>

      {/* Quick Stats */}
      <section className="grid grid-cols-2 gap-3 mb-8">
        <div className="bg-accent rounded-2xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Days Remaining</p>
          <p className="text-2xl font-bold text-foreground">
            {isLoading ? "--" : (daysRemaining ?? "N/A")}
          </p>
        </div>
        <div className="bg-primary-light rounded-2xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Clearance</p>
          <p className="text-2xl font-bold text-primary">
            {isLoading ? "--" : (clearancePercentage !== null ? `${clearancePercentage}%` : "N/A")}
          </p>
        </div>
      </section>

      <OfficialUpdates />

      {/* Feature Cards */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Quick Actions
        </h3>
        
        <div className="grid grid-cols-1 gap-4">
          <FeatureCard
            icon={<MapPin size={24} />}
            title="Posting Tracker"
            description="Track your posting status and timeline"
            onClick={() => onNavigate("posting")}
            variant="primary"
          />
          
          <div className="grid grid-cols-2 gap-4">
            <FeatureCard
              icon={<Wallet size={22} />}
              title="Allawee"
              description="Track allowance"
              onClick={() => onNavigate("allowance")}
            />
            <FeatureCard
              icon={<CheckSquare size={22} />}
              title="Clearance"
              description="Your checklist"
              onClick={() => onNavigate("clearance")}
            />
          </div>
          
          <FeatureCard
            icon={<MessageCircle size={24} />}
            title="Batch Forum"
            description="Connect with corpers, share experiences, ask questions"
            onClick={() => onNavigate("forum")}
          />
        </div>
      </section>
    </div>
  );
}
