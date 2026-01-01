import { cn } from "@/lib/utils";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  variant?: "default" | "primary";
}

export function FeatureCard({
  icon,
  title,
  description,
  onClick,
  variant = "default",
}: FeatureCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full p-5 rounded-2xl text-left transition-all duration-200 group",
        "shadow-soft hover:shadow-card active:scale-[0.98]",
        variant === "primary"
          ? "bg-primary text-primary-foreground"
          : "bg-card border border-border hover:border-primary/30"
      )}
    >
      <div
        className={cn(
          "w-11 h-11 rounded-xl flex items-center justify-center mb-3 transition-transform duration-200 group-hover:scale-110",
          variant === "primary"
            ? "bg-primary-foreground/20"
            : "bg-primary-light text-primary"
        )}
      >
        {icon}
      </div>
      <h3 className="font-semibold text-base mb-1">{title}</h3>
      <p
        className={cn(
          "text-sm",
          variant === "primary"
            ? "text-primary-foreground/80"
            : "text-muted-foreground"
        )}
      >
        {description}
      </p>
    </button>
  );
}
