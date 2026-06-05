"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, BellOff, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

// Shown when a student is predicted to run low. Two proactive choices:
// order now, or snooze the nudge for a day (stored server-side; the cron
// respects it too). Deliberately lightweight — no scheduling system.
export function SmartRefillActions() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function snooze() {
    setBusy(true);
    setError(null);
    const res = await fetch("/api/student/refill-reminder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "snooze" }),
    });
    if (!res.ok) {
      setError("Couldn't set the reminder. Try again.");
      setBusy(false);
      return;
    }
    setDone(true);
    router.refresh();
  }

  return (
    <div className="mt-5 space-y-2">
      <Button asChild size="lg" className="w-full pulse-glow">
        <Link href="/student/order">
          Order refill <ArrowRight className="h-4 w-4" />
        </Link>
      </Button>
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={snooze}
        disabled={busy || done}
      >
        {busy && <Loader2 className="h-4 w-4 animate-spin" />}
        {done ? (
          <>
            <Check className="h-4 w-4" /> Reminder set for tomorrow
          </>
        ) : (
          <>
            <BellOff className="h-4 w-4" /> Remind me tomorrow
          </>
        )}
      </Button>
      {error && <p className="text-sm font-medium text-destructive">{error}</p>}
    </div>
  );
}
