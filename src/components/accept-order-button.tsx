"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

// Claims a broadcast order (and its whole pool) for the signed-in rider.
export function AcceptOrderButton({ orderId, poolSize }: { orderId: string; poolSize?: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function accept() {
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/orders/${orderId}/accept`, { method: "POST" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Couldn't accept this order.");
      setBusy(false);
      // A 409 means another rider beat us to it — refresh so it leaves the board.
      router.refresh();
      return;
    }
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="space-y-2">
      <Button className="w-full" onClick={accept} disabled={busy}>
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
        {poolSize && poolSize > 1 ? `Accept all ${poolSize} stops` : "Accept order"}
      </Button>
      {error && <p className="text-sm font-medium text-destructive">{error}</p>}
    </div>
  );
}
