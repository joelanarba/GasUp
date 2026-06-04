"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Store, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const selectClass =
  "flex h-11 w-full rounded-md border border-input bg-card px-3.5 text-base shadow-sm focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/40";

const EMPTY = {
  businessName: "",
  fullName: "",
  email: "",
  phone: "",
  password: "",
  vehicleType: "Motorbike",
  coverageArea: "",
  pricePerKg: "15",
};

// Admin-only: onboard a supplier (login + profile). Suppliers don't self-register.
export function AddSupplier() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ ...EMPTY });
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  const set =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/admin/suppliers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, pricePerKg: Number(form.pricePerKg) }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Couldn't add the supplier.");
      setBusy(false);
      return;
    }
    setForm({ ...EMPTY });
    setBusy(false);
    setDone(true);
    setOpen(false);
    router.refresh();
    setTimeout(() => setDone(false), 4000);
  }

  if (!open) {
    return (
      <div className="mb-4 flex items-center justify-between gap-3">
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> Add supplier
        </Button>
        {done && (
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-success">
            <Check className="h-4 w-4" /> Supplier added
          </span>
        )}
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="mb-5 rounded-xl border border-primary/20 bg-primary/[0.03] p-5"
    >
      <div className="mb-4 flex items-center justify-between">
        <p className="flex items-center gap-2 font-display text-base font-semibold">
          <Store className="h-4 w-4 text-primary" /> New supplier
        </p>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setError(null);
          }}
          className="grid h-7 w-7 place-items-center rounded-full text-muted-foreground hover:bg-muted"
          aria-label="Cancel"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="ns-business">Business name</Label>
          <Input id="ns-business" required value={form.businessName} onChange={set("businessName")} placeholder="SwiftGas Cape Coast" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ns-contact">Contact person</Label>
          <Input id="ns-contact" required value={form.fullName} onChange={set("fullName")} placeholder="Kwame Mensah" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ns-email">Login email</Label>
          <Input id="ns-email" type="email" required value={form.email} onChange={set("email")} placeholder="supplier@gasup.app" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ns-phone">Phone <span className="text-muted-foreground">(optional)</span></Label>
          <Input id="ns-phone" inputMode="numeric" value={form.phone} onChange={set("phone")} placeholder="0241234567" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ns-vehicle">Vehicle</Label>
          <select id="ns-vehicle" value={form.vehicleType} onChange={set("vehicleType")} className={selectClass}>
            <option value="Motorbike">Motorbike</option>
            <option value="Tricycle">Tricycle</option>
            <option value="Vehicle">Vehicle</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ns-price">Price per kg (GHS)</Label>
          <Input id="ns-price" type="number" step="0.5" min="1" required value={form.pricePerKg} onChange={set("pricePerKg")} />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="ns-coverage">Coverage area</Label>
          <Input id="ns-coverage" required value={form.coverageArea} onChange={set("coverageArea")} placeholder="UCC Campus & Amamoma" />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="ns-password">Temporary password</Label>
          <Input id="ns-password" type="text" required value={form.password} onChange={set("password")} placeholder="At least 8 characters — share with the supplier" />
        </div>
      </div>

      {error && (
        <p className="mt-3 rounded-md bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">{error}</p>
      )}

      <div className="mt-4 flex gap-2">
        <Button type="submit" disabled={busy}>
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          {busy ? "Adding…" : "Create supplier"}
        </Button>
        <Button type="button" variant="outline" onClick={() => { setOpen(false); setError(null); }}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
