import { useLocation, useNavigate, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, Search, HelpCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* 404 illustration */}
        <div className="relative mb-8">
          <div className="text-[120px] font-bold text-muted-foreground/10 leading-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
              <Search size={40} className="text-primary" />
            </div>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-2">Page Not Found</h1>
        <p className="text-muted-foreground mb-8">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} className="mr-2" />
            Go Back
          </Button>
          <Button asChild>
            <Link to="/">
              <Home size={18} className="mr-2" />
              Go Home
            </Link>
          </Button>
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground mb-4">Need help?</p>
          <div className="flex justify-center gap-4">
            <Link to="/contact" className="flex items-center gap-2 text-sm text-primary hover:underline">
              <HelpCircle size={16} />
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
