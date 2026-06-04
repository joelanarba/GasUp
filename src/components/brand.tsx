import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

export function Brand({
  className,
  size = "md",
  inverted = false,
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
  inverted?: boolean;
}) {
  const text =
    size === "lg" ? "text-3xl" : size === "sm" ? "text-lg" : "text-2xl";
  const mark =
    size === "lg" ? "h-11 w-11" : size === "sm" ? "h-8 w-8" : "h-9 w-9";
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "grid place-items-center rounded-xl flame-gradient shadow-lg shadow-orange-900/20",
          inverted ? "text-white" : "text-primary-foreground",
          mark,
        )}
      >
        <Flame className="h-1/2 w-1/2" strokeWidth={2.5} />
      </span>
      <span className={cn(
        "font-display font-semibold tracking-tight",
        inverted ? "text-white" : "",
        text,
      )}>
        Gas<span className={inverted ? "text-amber-400" : "flame-text"}>Up</span>
      </span>
    </span>
  );
}
