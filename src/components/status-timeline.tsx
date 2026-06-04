import { Check, X } from "lucide-react";
import { type OrderStatus } from "@prisma/client";
import { ORDER_TIMELINE, STATUS_META } from "@/lib/order-status";
import { cn } from "@/lib/utils";

export function StatusTimeline({ status }: { status: OrderStatus }) {
  // Terminal off-path states get their own simple banner.
  if (status === "CANCELLED" || status === "DISPUTED") {
    return (
      <div className="flex items-center gap-3 rounded-xl bg-destructive/8 border border-destructive/20 px-4 py-3.5 text-destructive">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-destructive/15">
          <X className="h-4 w-4" />
        </span>
        <span className="font-medium">{STATUS_META[status].description}</span>
      </div>
    );
  }

  const current = ORDER_TIMELINE.indexOf(status);

  return (
    <ol className="space-y-0">
      {ORDER_TIMELINE.map((step, i) => {
        const done = i < current;
        const active = i === current;
        const last = i === ORDER_TIMELINE.length - 1;
        return (
          <li key={step} className="flex gap-3.5">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "grid h-8 w-8 place-items-center rounded-full text-xs font-semibold transition-all duration-300",
                  done && "bg-success text-white shadow-sm",
                  active && "flame-gradient text-white shadow-glow-sm",
                  !done && !active && "border-2 border-border bg-card text-muted-foreground",
                )}
              >
                {done ? <Check className="h-4 w-4" /> : i + 1}
              </span>
              {!last && (
                <span
                  className={cn(
                    "my-1 w-0.5 flex-1 rounded-full transition-colors duration-300",
                    done ? "bg-success/60" : "bg-border",
                  )}
                />
              )}
            </div>
            <div className={cn("pb-5", last && "pb-0")}>
              <p
                className={cn(
                  "font-medium leading-8",
                  active ? "text-foreground" : done ? "text-foreground/80" : "text-muted-foreground",
                )}
              >
                {STATUS_META[step].label}
              </p>
              {active && (
                <p className="text-sm text-muted-foreground">{STATUS_META[step].description}</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
