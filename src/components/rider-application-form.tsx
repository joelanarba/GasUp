"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const selectClass =
  "flex h-11 w-full rounded-md border border-input bg-card px-3.5 text-base shadow-sm focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/40";

const EMPTY = {
  fullName: "",
  email: "",
  phone: "",
  businessName: "",
  vehicleType: "Motorbike",
  coverageArea: "",
  partnerStation: "",
};

export function RiderApplicationForm() {
  const [form, setForm] = useState({ ...EMPTY });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const set =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/rider-applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong. Try again.");
      setLoading(false);
      return;
    }
    setLoading(false);
    setDone(true);
  }

  if (done) {
    return (
      <div className="mt-8 rounded-xl border border-success/30 bg-success/[0.05] p-6 text-center">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-success/15">
          <CheckCircle2 className="h-6 w-6 text-success" />
        </span>
        <h2 className="mt-4 font-display text-xl font-semibold">Application received</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Thanks for applying to ride with GasUp. We&apos;ll review your details and email you within 24
          hours. If approved, you&apos;ll get your login to start accepting orders.
        </p>
        <Link
          href="/"
          className="mt-5 inline-flex text-sm font-semibold text-primary hover:underline"
        >
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="fullName">Full name</Label>
          <Input id="fullName" required value={form.fullName} onChange={set("fullName")} placeholder="Kwame Mensah" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" required value={form.email} onChange={set("email")} placeholder="you@example.com" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone <span className="text-muted-foreground">(for SMS)</span></Label>
          <Input id="phone" inputMode="numeric" value={form.phone} onChange={set("phone")} placeholder="0241234567" />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="businessName">Business / rider name</Label>
          <Input id="businessName" required value={form.businessName} onChange={set("businessName")} placeholder="SwiftGas Cape Coast" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="vehicleType">Vehicle</Label>
          <select id="vehicleType" value={form.vehicleType} onChange={set("vehicleType")} className={selectClass}>
            <option value="Motorbike">Motorbike</option>
            <option value="Tricycle">Tricycle</option>
            <option value="Vehicle">Vehicle</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="coverageArea">Coverage area</Label>
          <Input id="coverageArea" required value={form.coverageArea} onChange={set("coverageArea")} placeholder="UCC Campus & Amamoma" />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="partnerStation">LPG filling station <span className="text-muted-foreground">(optional)</span></Label>
          <Input id="partnerStation" value={form.partnerStation} onChange={set("partnerStation")} placeholder="Total Amamoma" />
        </div>
      </div>

      {error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">{error}</p>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {loading ? "Submitting…" : "Submit application"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Looking to order gas instead?{" "}
        <Link href="/register" className="font-semibold text-primary hover:underline">Create a student account</Link>
      </p>
    </form>
  );
}
