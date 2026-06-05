"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowRight, CalendarClock } from "lucide-react";
import { type CylinderSize } from "@prisma/client";
import { CYLINDERS } from "@/lib/cylinders";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const selectClass =
  "flex h-11 w-full rounded-md border border-input bg-card px-3.5 text-base shadow-sm focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/40";

export function GasSetupForm({
  defaultSize,
  defaultHousehold,
  defaultDate,
}: {
  defaultSize: CylinderSize | null;
  defaultHousehold: number;
  defaultDate: string;
}) {
  const router = useRouter();
  const [size, setSize] = useState<CylinderSize>(defaultSize ?? "KG_6");
  const [household, setHousehold] = useState(String(defaultHousehold || 1));
  const [date, setDate] = useState(defaultDate);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = new Date().toISOString().slice(0, 10);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/student/gas-profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cylinderSize: size, householdSize: household, lastRefillDate: date }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Couldn't save. Try again.");
      setLoading(false);
      return;
    }
    router.push("/student");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="mt-8 space-y-7">
      {/* Cylinder size */}
      <section>
        <h2 className="font-display text-lg font-semibold">Your usual cylinder</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {CYLINDERS.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setSize(c.value)}
              className={cn(
                "rounded-lg border p-3 text-left transition-all",
                size === c.value
                  ? "border-primary bg-primary/5 shadow-warm"
                  : "border-border bg-card hover:border-primary/40",
              )}
            >
              <p className="font-display text-xl font-semibold">{c.label}</p>
              <p className="text-xs text-muted-foreground">{c.blurb}</p>
            </button>
          ))}
        </div>
      </section>

      {/* People sharing */}
      <section className="space-y-2">
        <Label htmlFor="household">People sharing this cylinder</Label>
        <select
          id="household"
          value={household}
          onChange={(e) => setHousehold(e.target.value)}
          className={selectClass}
        >
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <option key={n} value={n}>
              {n === 6 ? "6+" : n} {n === 1 ? "person" : "people"}
            </option>
          ))}
        </select>
        <p className="text-xs text-muted-foreground">More people means the cylinder runs down faster.</p>
      </section>

      {/* Last refill date */}
      <section className="space-y-2">
        <Label htmlFor="lastRefill">When did you last refill?</Label>
        <div className="relative">
          <CalendarClock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            id="lastRefill"
            type="date"
            value={date}
            max={today}
            onChange={(e) => setDate(e.target.value)}
            className={cn(selectClass, "pl-9")}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Not sure? Leave it blank and we&apos;ll assume a full cylinder for now.
        </p>
      </section>

      {error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">{error}</p>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {loading ? "Saving…" : "See my prediction"}
        {!loading && <ArrowRight className="h-4 w-4" />}
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        This is just an estimate to start. Your first real delivery makes it exact.
      </p>
    </form>
  );
}
