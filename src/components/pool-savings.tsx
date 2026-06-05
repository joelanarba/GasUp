import { Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DELIVERY_FEE_SOLO, DELIVERY_FEE_POOLED, formatGhs } from "@/lib/pricing";

// Reusable pooling breakdown: shows exactly what pooling did to the delivery
// fee. Numbers reflect the real model — a flat GHS 5 pooled delivery fee — so
// there's no fake precision. Used on the order detail page.
export function PoolSavings({ poolSize }: { poolSize: number }) {
  const discount = DELIVERY_FEE_SOLO - DELIVERY_FEE_POOLED;
  const others = Math.max(0, poolSize - 1);

  return (
    <div className="overflow-hidden rounded-xl border border-success/30 bg-success/[0.05]">
      <div className="flex items-center justify-between gap-3 border-b border-success/20 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-success/15">
            <Users className="h-4 w-4 text-success" />
          </span>
          <div>
            <p className="text-sm font-semibold text-success">Pooled delivery</p>
            <p className="text-xs text-muted-foreground">
              Shared with {others} neighbour{others === 1 ? "" : "s"} — one rider trip
            </p>
          </div>
        </div>
        <Badge variant="success">{poolSize} students</Badge>
      </div>

      <div className="space-y-2 px-4 py-3 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Original delivery fee</span>
          <span className="text-muted-foreground line-through">{formatGhs(DELIVERY_FEE_SOLO)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Pool discount</span>
          <span className="font-medium text-success">−{formatGhs(discount)}</span>
        </div>
        <div className="flex justify-between border-t border-success/20 pt-2">
          <span className="font-medium">Your delivery fee</span>
          <span className="font-display text-base font-semibold">{formatGhs(DELIVERY_FEE_POOLED)}</span>
        </div>
      </div>

      <div className="bg-success/10 px-4 py-2.5 text-center text-sm font-semibold text-success">
        You saved {formatGhs(discount)} on delivery
      </div>
    </div>
  );
}
