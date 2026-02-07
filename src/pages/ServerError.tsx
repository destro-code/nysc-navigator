import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function ServerError() {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-danger/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle size={40} className="text-danger" />
        </div>
        
        <h1 className="text-4xl font-bold text-foreground mb-2">500</h1>
        <h2 className="text-xl font-semibold text-foreground mb-4">Server Error</h2>
        
        <p className="text-muted-foreground mb-8">
          Oops! Something went wrong on our end. Our team has been notified and we're working to fix it.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw size={18} className="mr-2" />
            Try Again
          </Button>
          <Button asChild>
            <Link to="/">
              <Home size={18} className="mr-2" />
              Go Home
            </Link>
          </Button>
        </div>

        <p className="text-sm text-muted-foreground mt-8">
          If this problem persists, please{" "}
          <Link to="/contact" className="text-primary hover:underline">
            contact support
          </Link>
        </p>
      </div>
    </div>
  );
}
