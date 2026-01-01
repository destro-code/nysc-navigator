import { Bell } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="flex items-center justify-between px-4 py-3 max-w-lg mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">N</span>
          </div>
          <div>
            <h1 className="font-bold text-foreground text-lg leading-none">
              NYSC Buddy
            </h1>
            <p className="text-[10px] text-muted-foreground">
              Survive service year
            </p>
          </div>
        </div>
        <button className="relative p-2 rounded-full hover:bg-muted transition-colors">
          <Bell size={20} className="text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full" />
        </button>
      </div>
    </header>
  );
}
