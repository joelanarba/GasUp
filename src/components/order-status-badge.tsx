import { type OrderStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { STATUS_META } from "@/lib/order-status";

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const meta = STATUS_META[status];
  return <Badge variant={meta.tone}>{meta.label}</Badge>;
}
