import { Check, X } from "lucide-react";
import { type OrderStatus } from "@prisma/client";
import { ORDER_TIMELINE, STATUS_META } from "@/lib/order-status";
import { cn } from "@/lib/utils";

export function StatusTimeline({ status }: { status: OrderStatus }) {
  // Terminal off-path states get their own simple banner.
  if (status === "CANCELLED" || status === "DISPUTED") {
    return (
      <div className="flex items-center gap-3 rounded-md bg-destructive/10 px-4 py-3 text-destructive">
        <X className="h-5 w-5" />
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
          <li key={step} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "grid h-7 w-7 place-items-center rounded-full border text-xs font-semibold transition-colors",
                  done && "border-transparent bg-success text-white",
                  active && "border-transparent flame-gradient text-white shadow-warm",
                  !done && !active && "border-border bg-card text-muted-foreground",
                )}
              >
                {done ? <Check className="h-4 w-4" /> : i + 1}
              </span>
              {!last && (
                <span
                  className={cn(
                    "my-1 w-px flex-1",
                    done ? "bg-success" : "bg-border",
                  )}
                />
              )}
            </div>
            <div className={cn("pb-5", last && "pb-0")}>
              <p
                className={cn(
                  "font-medium leading-7",
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
