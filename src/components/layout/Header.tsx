import { Link } from "react-router-dom";
import { Settings, LogOut, Shield } from "lucide-react";
import { NotificationsDropdown } from "@/components/notifications/NotificationsDropdown";
import { LogoutDialog } from "@/components/auth/LogoutDialog";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function Header() {
  const { isAuthenticated, user, isAdmin } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="flex items-center justify-between px-4 py-3 max-w-lg mx-auto">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">N</span>
          </div>
          <div>
            <h1 className="font-bold text-foreground text-lg leading-none">NYSC Buddy</h1>
            <p className="text-[10px] text-muted-foreground">Survive service year</p>
          </div>
        </Link>
        
        <div className="flex items-center gap-1">
          {isAuthenticated && <NotificationsDropdown />}
          
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                aria-label="Open account menu"
                className="p-1 rounded-full hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {user?.email?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {isAdmin && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="cursor-pointer"><Shield size={16} className="mr-2" />Admin Panel</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem asChild><Link to="/privacy" className="cursor-pointer">Privacy Policy</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/terms" className="cursor-pointer">Terms of Use</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/contact" className="cursor-pointer">Contact Support</Link></DropdownMenuItem>
                <DropdownMenuSeparator />
                <LogoutDialog trigger={<DropdownMenuItem onSelect={(e) => e.preventDefault()}><LogOut size={16} className="mr-2" />Logout</DropdownMenuItem>} />
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/login" className="text-sm font-medium text-primary hover:underline px-3 py-1.5">Login</Link>
          )}
        </div>
      </div>
    </header>
  );
}
