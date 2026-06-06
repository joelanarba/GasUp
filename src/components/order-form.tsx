"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, MapPin, Zap, Users, CreditCard, Banknote } from "lucide-react";
import { type CylinderSize, type PaymentMethod } from "@prisma/client";
import { CYLINDERS, kgFor } from "@/lib/cylinders";
import {
  computeFee,
  formatGhs,
  GAS_PRICE_PER_KG,
  EXPRESS_SURCHARGE,
  DELIVERY_FEE_SOLO,
  DELIVERY_FEE_POOLED,
} from "@/lib/pricing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LocationPicker, type LocationValue } from "@/components/location-picker";
import { cn } from "@/lib/utils";

const MIN_CUSTOM_KG = 1;

export function OrderForm({
  defaultAddress,
  defaultLat,
  defaultLng,
}: {
  defaultAddress: string | null;
  defaultLat: number | null;
  defaultLng: number | null;
}) {
  const router = useRouter();
  const [size, setSize] = useState<CylinderSize>("KG_6");
  const [fillMode, setFillMode] = useState<"full" | "custom">("full");
  const [kgInput, setKgInput] = useState("");
  const [ghsInput, setGhsInput] = useState("");
  const [instructions, setInstructions] = useState("");
  const [express, setExpress] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("ONLINE");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [address, setAddress] = useState<string>(defaultAddress ?? "");
  const [lat, setLat] = useState<number | null>(defaultLat);
  const [lng, setLng] = useState<number | null>(defaultLng);
  const [editingLoc, setEditingLoc] = useState(false);

  const fullKg = kgFor(size);
  const customKg = parseFloat(kgInput);
  const kg = fillMode === "full" ? fullKg : Number.isFinite(customKg) ? customKg : 0;
  const customValid =
    fillMode === "full" ||
    (Number.isFinite(customKg) && customKg >= MIN_CUSTOM_KG && customKg <= fullKg);
  const fee = customValid && kg > 0 ? computeFee(kg, { express }) : null;

  function enterCustom() {
    setFillMode("custom");
    if (!kgInput) {
      setKgInput(String(fullKg));
      setGhsInput(String(Math.round(fullKg * GAS_PRICE_PER_KG)));
    }
  }
  function onKg(v: string) {
    setKgInput(v);
    const n = parseFloat(v);
    setGhsInput(Number.isFinite(n) ? String(Math.round(n * GAS_PRICE_PER_KG)) : "");
  }
  function onGhs(v: string) {
    setGhsInput(v);
    const n = parseFloat(v);
    setKgInput(Number.isFinite(n) ? String(Math.round((n / GAS_PRICE_PER_KG) * 100) / 100) : "");
  }

  async function place() {
    if (!address.trim()) {
      setError("Set your delivery address.");
      return;
    }
    if (!lat || !lng) {
      setError("Please pin your exact location on the map.");
      return;
    }
    if (fillMode === "custom" && !customValid) {
      setError(`Enter an amount between ${MIN_CUSTOM_KG} kg and ${fullKg} kg.`);
      return;
    }
    setBusy(true);
    setError(null);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cylinderSize: size,
        ...(fillMode === "custom" ? { requestedKg: kg } : {}),
        address: address.trim(),
        lat,
        lng,
        specialInstructions: instructions,
        express,
        paymentMethod,
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

  const submitDisabled = busy || !address.trim() || !lat || !lng || !customValid;

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

      {/* How much gas? */}
      <section>
        <h2 className="font-display text-lg font-semibold">How much gas?</h2>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setFillMode("full")}
            className={cn(
              "rounded-lg border p-3 text-left transition-all",
              fillMode === "full"
                ? "border-primary bg-primary/5 shadow-warm"
                : "border-border bg-card hover:border-primary/40",
            )}
          >
            <p className="font-semibold">Full refill</p>
            <p className="text-xs text-muted-foreground">Fill the whole {fullKg} kg cylinder</p>
          </button>
          <button
            type="button"
            onClick={enterCustom}
            className={cn(
              "rounded-lg border p-3 text-left transition-all",
              fillMode === "custom"
                ? "border-primary bg-primary/5 shadow-warm"
                : "border-border bg-card hover:border-primary/40",
            )}
          >
            <p className="font-semibold">Custom amount</p>
            <p className="text-xs text-muted-foreground">Send a fixed cash amount</p>
          </button>
        </div>

        {fillMode === "custom" && (
          <div className="mt-3 space-y-3 rounded-lg border border-border bg-card p-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label htmlFor="ghs-amount" className="text-sm text-muted-foreground">
                  GHS amount
                </label>
                <Input
                  id="ghs-amount"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="1"
                  value={ghsInput}
                  onChange={(e) => onGhs(e.target.value)}
                  placeholder="30"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="kg-amount" className="text-sm text-muted-foreground">
                  Kilograms
                </label>
                <Input
                  id="kg-amount"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.1"
                  value={kgInput}
                  onChange={(e) => onKg(e.target.value)}
                  placeholder="2.14"
                />
              </div>
            </div>
            {!customValid && (
              <p className="text-sm font-medium text-destructive">
                Enter an amount between {MIN_CUSTOM_KG} kg and {fullKg} kg (the {fullKg} kg cylinder).
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              At {formatGhs(GAS_PRICE_PER_KG)}/kg. Your rider will fill exactly this amount at the station.
            </p>
          </div>
        )}
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

      {/* Pooling hint — pooling is matched server-side after you place the order */}
      <div className="flex items-start gap-3 rounded-lg border border-success/25 bg-success/[0.05] p-4">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-success/12">
          <Users className="h-4 w-4 text-success" />
        </span>
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">Pooling can halve your delivery fee.</span>{" "}
          If a neighbour orders near you within 90 minutes, delivery drops from{" "}
          {formatGhs(DELIVERY_FEE_SOLO)} to{" "}
          <span className="font-semibold text-success">{formatGhs(DELIVERY_FEE_POOLED)}</span> —
          automatically, right after you place your order.
        </p>
      </div>

      {/* Fee summary */}
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

      {/* Payment method */}
      <section>
        <h2 className="font-display text-lg font-semibold">Payment</h2>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setPaymentMethod("ONLINE")}
            className={cn(
              "flex items-center gap-3 rounded-lg border p-4 text-left transition-all",
              paymentMethod === "ONLINE"
                ? "border-primary bg-primary/5 shadow-warm"
                : "border-border bg-card hover:border-primary/40",
            )}
          >
            <CreditCard className={cn("h-5 w-5", paymentMethod === "ONLINE" ? "text-primary" : "text-muted-foreground")} />
            <span>
              <span className="block font-semibold">Pay online</span>
              <span className="block text-sm text-muted-foreground">Secure card via Paystack</span>
            </span>
          </button>
          <button
            type="button"
            onClick={() => setPaymentMethod("CASH_ON_DELIVERY")}
            className={cn(
              "flex items-center gap-3 rounded-lg border p-4 text-left transition-all",
              paymentMethod === "CASH_ON_DELIVERY"
                ? "border-primary bg-primary/5 shadow-warm"
                : "border-border bg-card hover:border-primary/40",
            )}
          >
            <Banknote className={cn("h-5 w-5", paymentMethod === "CASH_ON_DELIVERY" ? "text-primary" : "text-muted-foreground")} />
            <span>
              <span className="block font-semibold">Pay on delivery</span>
              <span className="block text-sm text-muted-foreground">Cash when your rider arrives</span>
            </span>
          </button>
        </div>
      </section>

      {error && <p className="text-sm font-medium text-destructive">{error}</p>}

      <Button size="lg" className="w-full" onClick={place} disabled={submitDisabled}>
        {busy && <Loader2 className="h-4 w-4 animate-spin" />}
        {busy ? "Placing order…" : "Place order"}
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        {paymentMethod === "ONLINE"
          ? "Pay securely with Paystack on your order page next."
          : "Pay your rider in cash when your gas arrives."}
      </p>
    </div>
  );
}
