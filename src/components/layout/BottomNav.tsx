import { Home, MapPin, Wallet, CheckSquare, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type TabType = "home" | "posting" | "allowance" | "clearance" | "forum";

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const navItems: { id: TabType; label: string; icon: React.ReactNode }[] = [
  { id: "home", label: "Home", icon: <Home size={22} /> },
  { id: "posting", label: "Posting", icon: <MapPin size={22} /> },
  { id: "allowance", label: "Allawee", icon: <Wallet size={22} /> },
  { id: "clearance", label: "Clearance", icon: <CheckSquare size={22} /> },
  { id: "forum", label: "Forum", icon: <MessageCircle size={22} /> },
];

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={cn(
              "flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-all duration-200",
              activeTab === item.id
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <div
              className={cn(
                "p-1.5 rounded-xl transition-all duration-200",
                activeTab === item.id && "bg-primary-light"
              )}
            >
              {item.icon}
            </div>
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
      </div>
      {/* Safe area padding for mobile */}
      <div className="h-safe-area-inset-bottom bg-card" />
    </nav>
  );
}

export type { TabType };
