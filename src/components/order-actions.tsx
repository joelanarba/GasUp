"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { type OrderStatus, type Role } from "@prisma/client";
import { availableActions, type OrderAction } from "@/lib/order-status";
import { Button } from "@/components/ui/button";

export function OrderActions({
  orderId,
  role,
  status,
}: {
  orderId: string;
  role: Role;
  status: OrderStatus;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<OrderAction | null>(null);
  const [error, setError] = useState<string | null>(null);

  const actions = availableActions(role, status);
  if (actions.length === 0) return null;

  async function run(action: OrderAction) {
    setBusy(action);
    setError(null);
    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Couldn't update the order.");
      setBusy(null);
      return;
    }
    router.refresh();
    setBusy(null);
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {actions.map((a) => (
          <Button
            key={a.action}
            variant={a.variant}
            onClick={() => run(a.action)}
            disabled={busy !== null}
          >
            {busy === a.action && <Loader2 className="h-4 w-4 animate-spin" />}
            {a.label}
          </Button>
        ))}
      </div>
      {error && <p className="text-sm font-medium text-destructive">{error}</p>}
    </div>
  );
}
