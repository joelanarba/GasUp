"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, ShieldPlus, X, Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const EMPTY = { fullName: "", email: "", password: "" };

// Admin-only: invite/create another admin. Collapsed by default, mirrors AddSupplier.
export function AddAdmin() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ ...EMPTY });
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  const set =
    (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/admin/admins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Couldn't add the admin.");
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
          <Plus className="h-4 w-4" /> Add admin
        </Button>
        {done && (
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-success">
            <Check className="h-4 w-4" /> Admin added
          </span>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mb-5 rounded-xl border border-primary/20 bg-primary/[0.03] p-5">
      <div className="mb-4 flex items-center justify-between">
        <p className="flex items-center gap-2 font-display text-base font-semibold">
          <ShieldPlus className="h-4 w-4 text-primary" /> New admin
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
          <Label htmlFor="na-name">Full name</Label>
          <Input id="na-name" required value={form.fullName} onChange={set("fullName")} placeholder="Ama Owusu" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="na-email">Login email</Label>
          <Input id="na-email" type="email" required value={form.email} onChange={set("email")} placeholder="admin@gasup.app" />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="na-password">Temporary password</Label>
          <Input
            id="na-password"
            type="text"
            required
            value={form.password}
            onChange={set("password")}
            placeholder="At least 8 characters — share with the new admin"
          />
        </div>
      </div>

      {error && (
        <p className="mt-3 rounded-md bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">{error}</p>
      )}

      <div className="mt-4 flex gap-2">
        <Button type="submit" disabled={busy}>
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          {busy ? "Adding…" : "Create admin"}
        </Button>
        <Button type="button" variant="outline" onClick={() => { setOpen(false); setError(null); }}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

// Soft-deactivate another admin. Disabled (with a reason tooltip) when it's the last
// admin or the current admin's own account — the server enforces the same guards.
export function RemoveAdminButton({
  adminId,
  disabled,
  reason,
}: {
  adminId: string;
  disabled?: boolean;
  reason?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function remove() {
    if (!confirm("Remove this admin? They will no longer be able to sign in.")) return;
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/admin/admins/${adminId}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Couldn't remove this admin.");
      setBusy(false);
      return;
    }
    router.refresh();
  }

  if (disabled) {
    return (
      <span title={reason} className="cursor-not-allowed text-xs text-muted-foreground/60">
        —
      </span>
    );
  }

  return (
    <span className="inline-flex flex-col items-end gap-1">
      <Button
        size="sm"
        variant="ghost"
        onClick={remove}
        disabled={busy}
        className="h-8 text-muted-foreground hover:text-destructive"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
        Remove
      </Button>
      {error && <span className="text-xs font-medium text-destructive">{error}</span>}
    </span>
  );
}
