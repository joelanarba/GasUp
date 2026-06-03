import { type PredictionLevel } from "@/lib/prediction";
import { cn } from "@/lib/utils";

const ARC_LEN = Math.PI * 90; // semicircle radius 90

const levelColor: Record<PredictionLevel, string> = {
  empty: "text-destructive",
  low: "text-destructive",
  soon: "text-accent",
  ok: "text-success",
};

export function GasGauge({
  percent,
  daysLeft,
  level,
}: {
  percent: number; // 0..1
  daysLeft: number;
  level: PredictionLevel;
}) {
  const clamped = Math.max(0, Math.min(1, percent));
  const fill = clamped * ARC_LEN;
  const days = daysLeft < 1 ? "0" : Math.round(daysLeft).toString();

  return (
    <div className="relative mx-auto w-full max-w-[240px]">
      <svg viewBox="0 0 200 116" className="w-full" role="img" aria-label={`About ${days} days of gas left`}>
        {/* track */}
        <path
          d="M 10 100 A 90 90 0 0 1 190 100"
          fill="none"
          className="text-muted"
          stroke="currentColor"
          strokeWidth={14}
          strokeLinecap="round"
        />
        {/* fill */}
        <path
          d="M 10 100 A 90 90 0 0 1 190 100"
          fill="none"
          className={levelColor[level]}
          stroke="currentColor"
          strokeWidth={14}
          strokeLinecap="round"
          strokeDasharray={`${fill} ${ARC_LEN}`}
        />
      </svg>
      <div className="absolute inset-x-0 bottom-1 flex flex-col items-center">
        <span className="font-display text-5xl font-semibold leading-none tracking-tight">
          ≈{days}
        </span>
        <span className="mt-1 text-sm font-medium text-muted-foreground">
          {days === "1" ? "day left" : "days left"}
        </span>
        <span className={cn("mt-0.5 text-xs font-semibold", levelColor[level])}>
          {Math.round(clamped * 100)}% remaining
        </span>
      </div>
    </div>
  );
}
