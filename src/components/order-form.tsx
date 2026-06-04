"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Star, MapPin, Check, Zap } from "lucide-react";
import { type CylinderSize } from "@prisma/client";
import { CYLINDERS, kgFor } from "@/lib/cylinders";
import { computeFee, formatGhs, EXPRESS_SURCHARGE } from "@/lib/pricing";
import { Button } from "@/components/ui/button";
import { TrustBadge } from "@/components/trust-badge";
import { type Trust } from "@/lib/trust";
import { LocationPicker, type LocationValue } from "@/components/location-picker";
import { cn } from "@/lib/utils";

export type SupplierChoice = {
  id: string;
  businessName: string;
  vehicleType: string;
  pricePerKg: number;
  ratingAvg: number;
  ratingCount: number;
  trust: Trust | null;
};

export function OrderForm({
  suppliers,
  defaultAddress,
  defaultLat,
  defaultLng,
}: {
  suppliers: SupplierChoice[];
  defaultAddress: string | null;
  defaultLat: number | null;
  defaultLng: number | null;
}) {
  const router = useRouter();
  const [size, setSize] = useState<CylinderSize>("KG_6");
  const [supplierId, setSupplierId] = useState<string>(suppliers[0]?.id ?? "");
  const [instructions, setInstructions] = useState("");
  const [express, setExpress] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [address, setAddress] = useState<string>(defaultAddress ?? "");
  const [lat, setLat] = useState<number | null>(defaultLat);
  const [lng, setLng] = useState<number | null>(defaultLng);
  
  const [editingLoc, setEditingLoc] = useState(false);

  const kg = kgFor(size);
  const supplier = suppliers.find((s) => s.id === supplierId);
  const fee = supplier ? computeFee(kg, supplier.pricePerKg, { express }) : null;

  async function place() {
    if (!supplierId) {
      setError("Choose a supplier.");
      return;
    }
    if (!address.trim()) {
      setError("Set your delivery address.");
      return;
    }
    if (!lat || !lng) {
      setError("Please pin your exact location on the map.");
      return;
    }
    setBusy(true);
    setError(null);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        supplierId,
        cylinderSize: size,
        address: address.trim(),
        lat,
        lng,
        specialInstructions: instructions,
        express,
      }),
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
                  {s.trust && (
                    <div className="mt-2">
                      <TrustBadge trust={s.trust} />
                    </div>
                  )}
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

      {/* Delivery location + notes */}
      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold">Delivery location</h2>
        {editingLoc ? (
          <div className="space-y-3">
            <LocationPicker
              autoLocate={!lat}
              value={{ address, lat, lng }}
              onChange={(v: LocationValue) => {
                setAddress(v.address);
                setLat(v.lat);
                setLng(v.lng);
              }}
            />
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => setEditingLoc(false)}
              disabled={!address.trim() || !lat || !lng}
            >
              Confirm delivery address
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-4">
            <div className="flex items-start gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/10">
                <MapPin className="h-5 w-5 text-primary" />
              </span>
              <div>
                <p className="text-sm font-medium">Deliver to</p>
                <p className="text-sm text-muted-foreground">{address || "Set your delivery location"}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setEditingLoc(true)}
              className="shrink-0 text-sm font-semibold text-primary hover:underline"
            >
              {address ? "Change" : "Add address"}
            </button>
          </div>
        )}
        <textarea
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          rows={2}
          maxLength={280}
          placeholder="Special instructions (e.g. call when at the gate) — optional"
          className="flex w-full rounded-md border border-input bg-card px-3.5 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
        />
      </section>

      {/* Express toggle */}
      <button
        type="button"
        onClick={() => setExpress((v) => !v)}
        className={cn(
          "flex w-full items-center justify-between rounded-lg border p-4 text-left transition-all",
          express ? "border-primary bg-primary/5 shadow-warm" : "border-border bg-card hover:border-primary/40",
        )}
      >
        <span className="flex items-center gap-3">
          <Zap className={cn("h-5 w-5", express ? "text-primary" : "text-muted-foreground")} />
          <span>
            <span className="block font-semibold">Express refill</span>
            <span className="block text-sm text-muted-foreground">Priority delivery · +{formatGhs(EXPRESS_SURCHARGE)}</span>
          </span>
        </span>
        <span
          className={cn(
            "relative h-6 w-11 rounded-full transition-colors",
            express ? "bg-primary" : "bg-muted-foreground/30",
          )}
        >
          <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all", express ? "left-[1.375rem]" : "left-0.5")} />
        </span>
      </button>

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
            {fee.expressSurcharge > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Express priority</span>
                <span>{formatGhs(fee.expressSurcharge)}</span>
              </div>
            )}
            <div className="mt-2 flex justify-between border-t border-border pt-2 font-display text-lg font-semibold">
              <span>Total</span>
              <span>{formatGhs(fee.total)}</span>
            </div>
          </div>
        </section>
      )}

      {error && <p className="text-sm font-medium text-destructive">{error}</p>}

      <Button size="lg" className="w-full" onClick={place} disabled={busy || !address.trim() || !lat || !lng}>
        {busy && <Loader2 className="h-4 w-4 animate-spin" />}
        {busy ? "Placing order…" : "Place order"}
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        Payment with Paystack arrives in a later build — orders are created unpaid for now.
      </p>
    </div>
  );
}
