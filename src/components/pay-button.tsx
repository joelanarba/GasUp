"use client";

import { useState } from "react";
import { Loader2, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PayButton({ orderId, amountLabel }: { orderId: string; amountLabel: string }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function pay() {
    setBusy(true);
    setMessage(null);
    const res = await fetch(`/api/orders/${orderId}/pay`, { method: "POST" });
    const data = await res.json().catch(() => ({}));
    if (data.ok && data.authorizationUrl) {
      window.location.href = data.authorizationUrl;
      return;
    }
    setMessage(data.message ?? data.error ?? "Couldn't start payment.");
    setBusy(false);
  }

  return (
    <div className="space-y-2">
      <Button onClick={pay} disabled={busy} className="w-full">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
        Pay {amountLabel} with Paystack
      </Button>
      {message && (
        <p className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">{message}</p>
      )}
    </div>
  );
}
