import { Leaf, PiggyBank, Route } from "lucide-react";
import { type Impact } from "@/lib/impact";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatGhs } from "@/lib/pricing";

// Admin headline: pooling turned into a memorable, measurable impact stat.
export function ImpactCard({ impact, style }: { impact: Impact; style?: React.CSSProperties }) {
  const metrics = [
    { icon: PiggyBank, label: "Student savings", value: formatGhs(impact.savingsGhs) },
    { icon: Route, label: "Rider trips saved", value: impact.tripsReduced.toString() },
    { icon: Leaf, label: "Est. CO\u2082 avoided", value: `${impact.co2SavedKg} kg` },
  ];
  return (
    <Card className="reveal mt-6 overflow-hidden flame-gradient text-primary-foreground border-0 shadow-lg shadow-orange-900/30" style={style}>
      <CardHeader>
        <CardTitle className="text-primary-foreground">GasUp Impact</CardTitle>
        <CardDescription className="text-primary-foreground/75">
          What pooling has delivered across {impact.pooledOrders} pooled orders.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-3 gap-3">
        {metrics.map((m) => (
          <div key={m.label} className="rounded-xl bg-white/[0.12] p-4 text-center backdrop-blur-sm transition-colors hover:bg-white/[0.18]">
            <m.icon className="mx-auto h-5 w-5 opacity-90" />
            <p className="mt-2.5 font-display text-xl font-semibold leading-tight sm:text-2xl">{m.value}</p>
            <p className="mt-1 text-xs text-primary-foreground/75">{m.label}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
