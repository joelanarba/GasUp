"use client";

import {
  Area,
  AreaChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function ConsumptionCurve({
  curve,
  daysSinceFill,
  lastFillKg,
}: {
  curve: { day: number; kg: number }[];
  daysSinceFill: number;
  lastFillKg: number;
}) {
  return (
    <div className="h-44 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={curve} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
          <defs>
            <linearGradient id="gasFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(15 82% 49%)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="hsl(15 82% 49%)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="day"
            type="number"
            domain={[0, "dataMax"]}
            tickFormatter={(d) => `${Math.round(d)}d`}
            tick={{ fontSize: 11, fill: "hsl(24 12% 38%)" }}
            stroke="hsl(36 34% 84%)"
          />
          <YAxis
            domain={[0, Math.ceil(lastFillKg)]}
            tick={{ fontSize: 11, fill: "hsl(24 12% 38%)" }}
            stroke="hsl(36 34% 84%)"
            width={36}
            tickFormatter={(v) => `${v}kg`}
          />
          <Tooltip
            formatter={(v) => [`${Number(v).toFixed(1)} kg`, "Remaining"]}
            labelFormatter={(d) => `Day ${Math.round(Number(d))}`}
            contentStyle={{
              borderRadius: 10,
              border: "1px solid hsl(36 34% 84%)",
              fontSize: 12,
            }}
          />
          <Area
            type="monotone"
            dataKey="kg"
            stroke="hsl(15 82% 49%)"
            strokeWidth={2.5}
            fill="url(#gasFill)"
          />
          <ReferenceLine
            x={Math.round(daysSinceFill * 10) / 10}
            stroke="hsl(38 92% 50%)"
            strokeDasharray="4 4"
            label={{ value: "today", position: "top", fontSize: 11, fill: "hsl(38 92% 40%)" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
