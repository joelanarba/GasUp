import Link from "next/link";
import { Gauge, Sparkles, ArrowRight } from "lucide-react";
import { type Prediction, levelCopy } from "@/lib/prediction";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GasGauge } from "@/components/gas-gauge";
import { ConsumptionCurve } from "@/components/consumption-curve";
import { cn } from "@/lib/utils";

const DAY = 24 * 60 * 60 * 1000;

export function PredictionCard({ prediction }: { prediction: Extract<Prediction, { hasData: true }> }) {
  const copy = levelCopy(prediction.level);
  const daysSinceFill = (Date.now() - prediction.lastDeliveredAt.getTime()) / DAY;
  const urgent = prediction.level === "empty" || prediction.level === "low";

  return (
    <Card className={cn(
      "overflow-hidden",
      urgent && "gradient-border",
    )}>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10">
              <Gauge className="h-4 w-4 text-primary" />
            </span>
            Your gas level
          </CardTitle>
          <CardDescription className="mt-1.5">
            {prediction.method === "history"
              ? `Learned from your refill cadence (~${Math.round(prediction.cycleDays)} days)`
              : "Estimated — one more refill personalises this"}
          </CardDescription>
        </div>
        <Badge variant="accent">
          <Sparkles className="h-3 w-3" /> Predictive
        </Badge>
      </CardHeader>
      <CardContent>
        <GasGauge percent={prediction.percent} daysLeft={prediction.daysLeft} level={prediction.level} />

        <div className={cn("mt-3 text-center font-display text-xl font-semibold", copy.tone)}>
          {copy.headline}
        </div>

        <div className="mt-5 rounded-lg border border-border/40 bg-muted/30 p-3">
          <ConsumptionCurve
            curve={prediction.curve}
            daysSinceFill={daysSinceFill}
            lastFillKg={prediction.lastFillKg}
          />
        </div>

        <Button asChild size="lg" className={cn("mt-5 w-full", urgent && "pulse-glow")} variant={urgent ? "default" : "outline"}>
          <Link href="/student/order">
            {urgent ? "Refill now" : "Order a refill"} <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
