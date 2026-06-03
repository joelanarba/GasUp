"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Star, MapPin, Check } from "lucide-react";
import { type CylinderSize } from "@prisma/client";
import { CYLINDERS, kgFor } from "@/lib/cylinders";
import { computeFee, formatGhs } from "@/lib/pricing";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type SupplierChoice = {
  id: string;
  businessName: string;
  vehicleType: string;
  pricePerKg: number;
  ratingAvg: number;
  ratingCount: number;
};

export function OrderForm({
  suppliers,
  deliverTo,
}: {
  suppliers: SupplierChoice[];
  deliverTo: string | null;
}) {
  const router = useRouter();
  const [size, setSize] = useState<CylinderSize>("KG_6");
  const [supplierId, setSupplierId] = useState<string>(suppliers[0]?.id ?? "");
  const [instructions, setInstructions] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const kg = kgFor(size);
  const supplier = suppliers.find((s) => s.id === supplierId);
  const fee = supplier ? computeFee(kg, supplier.pricePerKg) : null;

  async function place() {
    if (!supplierId) {
      setError("Choose a supplier.");
      return;
    }
    setBusy(true);
    setError(null);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ supplierId, cylinderSize: size, specialInstructions: instructions }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? "Couldn't place the order.");
      setBusy(false);
      return;
    }
    router.push(`/student/orders/${data.id}`);
    router.refresh();
  }

  return (
    <div className="space-y-7">
      {/* Cylinder size */}
      <section>
        <h2 className="font-display text-lg font-semibold">Cylinder size</h2>
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

      {/* Supplier */}
      <section>
        <h2 className="font-display text-lg font-semibold">Choose a supplier</h2>
        <div className="mt-3 space-y-3">
          {suppliers.map((s) => {
            const total = computeFee(kg, s.pricePerKg).total;
            const selected = s.id === supplierId;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setSupplierId(s.id)}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg border p-4 text-left transition-all",
                  selected
                    ? "border-primary bg-primary/5 shadow-warm"
                    : "border-border bg-card hover:border-primary/40",
                )}
              >
                <div>
                  <p className="font-semibold">{s.businessName}</p>
                  <p className="text-sm text-muted-foreground">
                    {s.vehicleType} · {formatGhs(s.pricePerKg)}/kg
                  </p>
                  <p className="mt-1 inline-flex items-center gap-1 text-sm text-muted-foreground">
                    <Star className="h-3.5 w-3.5 fill-accent text-accent" />
                    {s.ratingCount > 0 ? `${s.ratingAvg.toFixed(1)} (${s.ratingCount})` : "New"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-display text-lg font-semibold">{formatGhs(total)}</p>
                  {selected && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
                      <Check className="h-3.5 w-3.5" /> Selected
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Delivery + notes */}
      <section className="space-y-3">
        <div className="flex items-start gap-2 rounded-lg border border-border bg-card p-4">
          <MapPin className="mt-0.5 h-5 w-5 text-primary" />
          <div>
            <p className="text-sm font-medium">Deliver to</p>
            <p className="text-sm text-muted-foreground">
              {deliverTo ?? "Add your hostel and room in your profile first."}
            </p>
          </div>
        </div>
        <textarea
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          rows={2}
          maxLength={280}
          placeholder="Special instructions (gate code, landmark…) — optional"
          className="flex w-full rounded-md border border-input bg-card px-3.5 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
        />
      </section>

      {/* Fee summary + submit */}
      {fee && (
        <section className="rounded-lg border border-border bg-card p-4">
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Gas ({kg} kg)</span>
              <span>{formatGhs(fee.gasCost)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Delivery</span>
              <span>{formatGhs(fee.deliveryFee)}</span>
            </div>
            <div className="mt-2 flex justify-between border-t border-border pt-2 font-display text-lg font-semibold">
              <span>Total</span>
              <span>{formatGhs(fee.total)}</span>
            </div>
          </div>
        </section>
      )}

      {error && <p className="text-sm font-medium text-destructive">{error}</p>}

      <Button size="lg" className="w-full" onClick={place} disabled={busy || !deliverTo}>
        {busy && <Loader2 className="h-4 w-4 animate-spin" />}
        {busy ? "Placing order…" : "Place order"}
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        Payment with Paystack arrives in a later build — orders are created unpaid for now.
      </p>
    </div>
  );
}
