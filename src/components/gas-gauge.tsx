import { type PredictionLevel } from "@/lib/prediction";
import { cn } from "@/lib/utils";

const ARC_LEN = Math.PI * 90; // semicircle radius 90

const levelColor: Record<PredictionLevel, string> = {
  empty: "text-destructive",
  low: "text-destructive",
  soon: "text-accent",
  ok: "text-success",
};

const levelGlow: Record<PredictionLevel, string> = {
  empty: "drop-shadow-[0_0_8px_hsl(0_72%_47%/0.4)]",
  low: "drop-shadow-[0_0_8px_hsl(0_72%_47%/0.3)]",
  soon: "drop-shadow-[0_0_8px_hsl(38_92%_50%/0.3)]",
  ok: "drop-shadow-[0_0_8px_hsl(152_46%_38%/0.3)]",
};

const levelGradient: Record<PredictionLevel, [string, string]> = {
  empty: ["hsl(0 72% 47%)", "hsl(0 72% 60%)"],
  low: ["hsl(0 72% 47%)", "hsl(15 82% 49%)"],
  soon: ["hsl(15 82% 49%)", "hsl(38 92% 50%)"],
  ok: ["hsl(152 46% 38%)", "hsl(152 56% 48%)"],
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
  const [startColor, endColor] = levelGradient[level];
  const gradId = `gauge-grad-${level}`;

  return (
    <div className="relative mx-auto w-full max-w-[260px]">
      <svg viewBox="0 0 200 120" className={cn("w-full", levelGlow[level])} role="img" aria-label={`About ${days} days of gas left`}>
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={startColor} />
            <stop offset="100%" stopColor={endColor} />
          </linearGradient>
        </defs>
        {/* track */}
        <path
          d="M 10 105 A 90 90 0 0 1 190 105"
          fill="none"
          stroke="hsl(38 36% 91%)"
          strokeWidth={16}
          strokeLinecap="round"
          opacity={0.5}
        />
        {/* fill */}
        <path
          d="M 10 105 A 90 90 0 0 1 190 105"
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth={16}
          strokeLinecap="round"
          strokeDasharray={`${fill} ${ARC_LEN}`}
          style={{ transition: "stroke-dasharray 1s cubic-bezier(0.22, 1, 0.36, 1)" }}
        />
      </svg>
      <div className="absolute inset-x-0 bottom-2 flex flex-col items-center">
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
