import Link from "next/link";
import { Gauge, Sparkles, ArrowRight, BellOff } from "lucide-react";
import { type Prediction, levelCopy } from "@/lib/prediction";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GasGauge } from "@/components/gas-gauge";
import { ConsumptionCurve } from "@/components/consumption-curve";
import { SmartRefillActions } from "@/components/smart-refill-actions";
import { cn } from "@/lib/utils";

const DAY = 24 * 60 * 60 * 1000;

export function PredictionCard({
  prediction,
  fromProfile = false,
  snoozedUntil = null,
}: {
  prediction: Extract<Prediction, { hasData: true }>;
  fromProfile?: boolean;
  snoozedUntil?: Date | null;
}) {
  const copy = levelCopy(prediction.level);
  const daysSinceFill = (Date.now() - prediction.lastDeliveredAt.getTime()) / DAY;
  const isLow = prediction.level === "empty" || prediction.level === "low";
  const snoozed = !!snoozedUntil && snoozedUntil.getTime() > Date.now();
  const urgent = isLow && !snoozed;

  const description = fromProfile
    ? "Estimated from your setup — your first delivery makes it exact"
    : prediction.method === "history"
      ? `Learned from your refill cadence (~${Math.round(prediction.cycleDays)} days)`
      : "Estimated — one more refill personalises this";

  return (
    <Card className={cn("overflow-hidden", urgent && "gradient-border")}>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10">
              <Gauge className="h-4 w-4 text-primary" />
            </span>
            Your gas level
          </CardTitle>
          <CardDescription className="mt-1.5">{description}</CardDescription>
        </div>
        <Badge variant="accent">
          <Sparkles className="h-3 w-3" /> {fromProfile ? "Estimated" : "Predictive"}
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

        {isLow && !snoozed ? (
          // Smart, proactive choices when running low.
          <SmartRefillActions />
        ) : isLow && snoozed ? (
          // Snoozed: muted, with an escape hatch to order anyway.
          <div className="mt-5 space-y-3">
            <p className="flex items-center justify-center gap-2 rounded-lg border border-border/50 bg-muted/40 px-3 py-2.5 text-sm text-muted-foreground">
              <BellOff className="h-4 w-4" /> We&apos;ll remind you tomorrow.
            </p>
            <Button asChild size="lg" variant="outline" className="w-full">
              <Link href="/student/order">
                Order now anyway <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        ) : (
          <Button asChild size="lg" className="mt-5 w-full" variant="outline">
            <Link href="/student/order">
              Order a refill <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        )}

        {fromProfile && (
          <Link
            href="/student/setup"
            className="mt-3 block text-center text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            Adjust my gas setup
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
