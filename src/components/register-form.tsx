"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type HostelOption = { id: string; label: string };

const selectClass =
  "flex h-11 w-full rounded-md border border-input bg-card px-3.5 text-base shadow-sm focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/40";

export function RegisterForm({ hostels }: { hostels: HostelOption[] }) {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    hostelId: "",
    roomNumber: "",
    householdSize: "1",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/register", {
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

    // Auto sign-in after registration, then role-aware landing.
    const signin = await signIn("credentials", {
      redirect: false,
      email: form.email,
      password: form.password,
    });
    if (signin?.error) {
      router.push("/login");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fullName">Full name</Label>
        <Input id="fullName" required value={form.fullName} onChange={set("fullName")} placeholder="Akua Sarpong" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" autoComplete="email" required value={form.email} onChange={set("email")} placeholder="you@ucc.edu.gh" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone <span className="text-muted-foreground">(for SMS updates)</span></Label>
        <Input id="phone" inputMode="numeric" value={form.phone} onChange={set("phone")} placeholder="0241234567" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="hostelId">Hostel & block</Label>
          <select id="hostelId" required value={form.hostelId} onChange={set("hostelId")} className={selectClass}>
            <option value="" disabled>Select…</option>
            {hostels.map((h) => (
              <option key={h.id} value={h.id}>{h.label}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="roomNumber">Room</Label>
          <Input id="roomNumber" required value={form.roomNumber} onChange={set("roomNumber")} placeholder="A12" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="householdSize">People sharing this cylinder</Label>
        <select id="householdSize" value={form.householdSize} onChange={set("householdSize")} className={selectClass}>
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <option key={n} value={n}>{n === 6 ? "6+" : n} {n === 1 ? "person" : "people"}</option>
          ))}
        </select>
        <p className="text-xs text-muted-foreground">Helps us predict your refill before you run out.</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" autoComplete="new-password" required value={form.password} onChange={set("password")} placeholder="At least 8 characters" />
      </div>

      {error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">{error}</p>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {loading ? "Creating account…" : "Create account"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-primary hover:underline">Sign in</Link>
      </p>
    </form>
  );
}
