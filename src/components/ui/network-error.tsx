import { WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NetworkErrorProps {
  onRetry?: () => void;
  message?: string;
}

export function NetworkError({ onRetry, message }: NetworkErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 bg-danger/10 rounded-full flex items-center justify-center mb-4">
        <WifiOff size={32} className="text-danger" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">Connection Error</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">
        {message || "Unable to connect. Please check your internet connection and try again."}
      </p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          <RefreshCw size={16} className="mr-2" />
          Try Again
        </Button>
      )}
    </div>
  );
}
