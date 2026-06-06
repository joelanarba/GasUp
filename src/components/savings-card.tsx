import { PiggyBank, Users, Route, TrendingDown, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SAVING_PER_POOLED_ORDER } from "@/lib/impact";
import { DELIVERY_FEE_SOLO, DELIVERY_FEE_POOLED, formatGhs } from "@/lib/pricing";

// Student-facing savings/impact summary. Reinforces "GasUp saves money" — even
// at zero, by showing the pooling value prop. Money figures are real (the GHS 5
// pooled-delivery discount); trips reduced is labelled an estimate.
export function SavingsCard({
  pooledCount,
  totalOrders,
  style,
}: {
  pooledCount: number;
  totalOrders: number;
  style?: React.CSSProperties;
}) {
  const saved = pooledCount * SAVING_PER_POOLED_ORDER;
  const avgPerRefill = totalOrders > 0 ? saved / totalOrders : 0;
  const tripsReduced = pooledCount; // each pooled refill ≈ one solo run avoided
  const hasSavings = pooledCount > 0;

  const stats = [
    { icon: Users, label: "Pooled refills", value: pooledCount.toString() },
    { icon: Route, label: "Est. trips reduced", value: tripsReduced.toString() },
    { icon: TrendingDown, label: "Avg saved / refill", value: formatGhs(avgPerRefill) },
  ];

  return (
    <Card className="overflow-hidden" style={style}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-success/12">
            <PiggyBank className="h-4 w-4 text-success" />
          </span>
          Your savings
        </CardTitle>
        <CardDescription>
          {hasSavings
            ? "What pooling your refills has saved you so far."
            : "Pool a refill to start cutting your delivery costs."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Headline total */}
        <div className="rounded-xl border border-success/20 bg-success/[0.06] p-5 text-center">
          <p className="font-display text-4xl font-semibold tracking-tight text-success">
            {formatGhs(saved)}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">saved by pooling</p>
        </div>

        {hasSavings ? (
          <>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {stats.map((s) => (
                <div key={s.label} className="rounded-lg border border-border/50 bg-muted/30 p-3 text-center">
                  <s.icon className="mx-auto h-4 w-4 text-muted-foreground" />
                  <p className="mt-1.5 font-display text-lg font-semibold leading-none">{s.value}</p>
                  <p className="mt-1 text-[11px] leading-tight text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-center text-[11px] text-muted-foreground">
              Estimates assume each pooled refill replaces one solo delivery run.
            </p>
          </>
        ) : (
          // Encouraging zero-state — still says "GasUp saves money".
          <div className="mt-4 space-y-3">
            <p className="text-sm text-muted-foreground">
              When a neighbour orders near you within 90 minutes, your
              delivery fee drops from{" "}
              <span className="font-semibold text-foreground">{formatGhs(DELIVERY_FEE_SOLO)}</span> to{" "}
              <span className="font-semibold text-success">{formatGhs(DELIVERY_FEE_POOLED)}</span> —
              automatically.
            </p>
            <Link
              href="/student/order"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
            >
              Order a refill <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
