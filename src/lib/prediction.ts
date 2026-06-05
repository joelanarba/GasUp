// Predictive refill — the headline differentiator.
// Forecasts remaining gas + days-left from a student's own refill history.

const DAY = 24 * 60 * 60 * 1000;

// Fallback burn rate before we have ≥2 refills to learn a real cadence from.
// Rough campus cooking estimate per person, scaled by household size.
export const BASE_BURN_PER_PERSON = 0.18; // kg/day

export type Delivery = { deliveredAt: Date; kg: number };

export type PredictionLevel = "empty" | "low" | "soon" | "ok";

export type Prediction =
  | { hasData: false }
  | {
      hasData: true;
      method: "history" | "estimate";
      lastFillKg: number;
      lastDeliveredAt: Date;
      burnPerDay: number;
      cycleDays: number;
      remainingKg: number;
      percent: number; // 0..1
      daysLeft: number;
      level: PredictionLevel;
      curve: { day: number; kg: number }[];
    };

function levelFor(daysLeft: number): PredictionLevel {
  if (daysLeft <= 0.5) return "empty";
  if (daysLeft <= 3) return "low";
  if (daysLeft <= 7) return "soon";
  return "ok";
}

export function computePrediction(
  deliveries: Delivery[],
  householdSize: number,
  now: Date = new Date(),
): Prediction {
  if (deliveries.length === 0) return { hasData: false };

  const sorted = [...deliveries].sort(
    (a, b) => a.deliveredAt.getTime() - b.deliveredAt.getTime(),
  );
  const last = sorted[sorted.length - 1];
  const lastFillKg = last.kg;
  const daysSince = Math.max(0, (now.getTime() - last.deliveredAt.getTime()) / DAY);

  let burnPerDay: number;
  let cycleDays: number;
  let method: "history" | "estimate";

  if (sorted.length >= 2) {
    // Learn cadence from the gaps between consecutive refills.
    const span = (last.deliveredAt.getTime() - sorted[0].deliveredAt.getTime()) / DAY;
    cycleDays = span / (sorted.length - 1);
    const avgFill = sorted.reduce((s, d) => s + d.kg, 0) / sorted.length;
    burnPerDay = cycleDays > 0 ? avgFill / cycleDays : BASE_BURN_PER_PERSON * householdSize;
    method = "history";
  } else {
    burnPerDay = BASE_BURN_PER_PERSON * Math.max(1, householdSize);
    cycleDays = burnPerDay > 0 ? lastFillKg / burnPerDay : 0;
    method = "estimate";
  }

  const consumed = burnPerDay * daysSince;
  const remainingKg = Math.min(lastFillKg, Math.max(0, lastFillKg - consumed));
  const percent = lastFillKg > 0 ? remainingKg / lastFillKg : 0;
  const daysLeft = burnPerDay > 0 ? remainingKg / burnPerDay : 0;

  // Consumption curve: full cylinder at day 0 down to empty.
  const totalDays = burnPerDay > 0 ? lastFillKg / burnPerDay : 0;
  const steps = Math.max(2, Math.min(30, Math.ceil(totalDays)));
  const curve: { day: number; kg: number }[] = [];
  for (let i = 0; i <= steps; i++) {
    const day = (totalDays * i) / steps;
    curve.push({ day: Math.round(day * 10) / 10, kg: Math.max(0, lastFillKg - burnPerDay * day) });
  }

  return {
    hasData: true,
    method,
    lastFillKg,
    lastDeliveredAt: last.deliveredAt,
    burnPerDay,
    cycleDays,
    remainingKg,
    percent,
    daysLeft,
    level: levelFor(daysLeft),
    curve,
  };
}

/**
 * Day-One prediction. Before a student has any real refill history, build an
 * estimate from their onboarding "gas profile": usual cylinder size, household
 * size, and their best guess at when they last refilled. We synthesise a single
 * virtual refill and run it through the SAME engine, so it reads as method
 * "estimate" and is automatically superseded once a real delivery lands.
 *
 * No last-refill date → assume a fresh fill (today): an honest "full, ~N days"
 * baseline rather than fake precision.
 */
export function estimateFromProfile(
  cylinderKg: number,
  householdSize: number,
  lastRefillAt: Date | null,
  now: Date = new Date(),
): Prediction {
  if (!cylinderKg || cylinderKg <= 0) return { hasData: false };
  const deliveredAt =
    lastRefillAt && lastRefillAt.getTime() <= now.getTime() ? lastRefillAt : now;
  return computePrediction([{ deliveredAt, kg: cylinderKg }], householdSize, now);
}

export function levelCopy(level: PredictionLevel): { headline: string; tone: string } {
  switch (level) {
    case "empty":
      return { headline: "You're likely out of gas", tone: "text-destructive" };
    case "low":
      return { headline: "Running low — refill now", tone: "text-destructive" };
    case "soon":
      return { headline: "Plan a refill this week", tone: "text-accent-foreground" };
    default:
      return { headline: "You're good for now", tone: "text-success" };
  }
}
