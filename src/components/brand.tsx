import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

export function Brand({
  className,
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const text =
    size === "lg" ? "text-3xl" : size === "sm" ? "text-lg" : "text-2xl";
  const mark =
    size === "lg" ? "h-11 w-11" : size === "sm" ? "h-8 w-8" : "h-9 w-9";
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span
        className={cn(
          "grid place-items-center rounded-xl flame-gradient text-primary-foreground shadow-warm",
          mark,
        )}
      >
        <Flame className="h-1/2 w-1/2" strokeWidth={2.5} />
      </span>
      <span className={cn("font-display font-semibold tracking-tight", text)}>
        Gas<span className="flame-text">Up</span>
      </span>
    </span>
  );
}
