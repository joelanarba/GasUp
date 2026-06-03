"use client";

import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const FLAME = "#E0521E";
const AMBER = "#F59E0B";
const INK = "hsl(24 12% 38%)";
const GRID = "hsl(36 34% 84%)";

export type StatusDatum = { name: string; value: number };
export type SupplierDatum = { name: string; deliveries: number };

export function OrdersByStatusChart({ data }: { data: StatusDatum[] }) {
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
          <XAxis dataKey="name" tick={{ fontSize: 10, fill: INK }} stroke={GRID} interval={0} angle={-18} textAnchor="end" height={48} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: INK }} stroke={GRID} width={28} />
          <Tooltip contentStyle={{ borderRadius: 10, border: `1px solid ${GRID}`, fontSize: 12 }} />
          <Bar dataKey="value" radius={[6, 6, 0, 0]} fill={FLAME} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TopSuppliersChart({ data }: { data: SupplierDatum[] }) {
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart layout="vertical" data={data} margin={{ top: 4, right: 12, bottom: 0, left: 8 }}>
          <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: INK }} stroke={GRID} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: INK }} stroke={GRID} width={120} />
          <Tooltip contentStyle={{ borderRadius: 10, border: `1px solid ${GRID}`, fontSize: 12 }} />
          <Bar dataKey="deliveries" radius={[0, 6, 6, 0]} fill={AMBER} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PoolingDonut({ pooled, solo }: { pooled: number; solo: number }) {
  const data = [
    { name: "Pooled", value: pooled },
    { name: "Solo", value: solo },
  ];
  const total = pooled + solo;
  const pct = total > 0 ? Math.round((pooled / total) * 100) : 0;
  return (
    <div className="relative h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" innerRadius={58} outerRadius={84} paddingAngle={2} startAngle={90} endAngle={-270}>
            <Cell fill={FLAME} />
            <Cell fill={GRID} />
          </Pie>
          <Tooltip contentStyle={{ borderRadius: 10, border: `1px solid ${GRID}`, fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-3xl font-semibold">{pct}%</span>
        <span className="text-xs text-muted-foreground">pooled</span>
      </div>
    </div>
  );
}
