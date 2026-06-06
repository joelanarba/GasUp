"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Banknote } from "lucide-react";
import { Button } from "@/components/ui/button";

// Rider confirms cash received on a pay-on-delivery order.
export function CashPaidButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function mark() {
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/orders/${orderId}/cash-paid`, { method: "POST" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Couldn't update payment.");
      setBusy(false);
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-2">
      <Button variant="outline" className="w-full" onClick={mark} disabled={busy}>
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Banknote className="h-4 w-4" />}
        Mark as paid (cash received)
      </Button>
      {error && <p className="text-sm font-medium text-destructive">{error}</p>}
    </div>
  );
}
