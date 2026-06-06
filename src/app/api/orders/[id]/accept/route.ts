import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { currentUser } from "@/lib/session";
import { transition } from "@/lib/order-status";
import { notifyOrderEvent } from "@/lib/services/notifications";

// A rider claims a broadcast (OPEN) order. Atomic: the first rider to commit wins;
// a racing second rider gets a 409. If the order is pooled, the rider claims every
// still-OPEN member of the pool — it's one multi-stop trip.
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  if (user.role !== "SUPPLIER")
    return NextResponse.json({ error: "Only riders can accept orders" }, { status: 403 });

  const supplier = await prisma.supplier.findUnique({ where: { userId: user.id } });
  if (!supplier)
    return NextResponse.json({ error: "No rider profile linked" }, { status: 403 });

  const result = await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: params.id },
      select: { id: true, status: true, poolId: true },
    });
    if (!order) return { error: "not_found" as const };

    const rule = transition(order.status, "accept", "SUPPLIER");
    if (!rule.ok) return { error: "taken" as const };

    // Guarded claim of the primary order — count tells us if we won the race.
    const primary = await tx.order.updateMany({
      where: { id: order.id, status: "OPEN" },
      data: { supplierId: supplier.id, status: "ACCEPTED" },
    });
    if (primary.count === 0) return { error: "taken" as const };

    const claimed = [order.id];

    // Claim the rest of the pool (still-OPEN members) — one trip, one rider.
    if (order.poolId) {
      const members = await tx.order.findMany({
        where: { poolId: order.poolId, status: "OPEN", id: { not: order.id } },
        select: { id: true },
      });
      if (members.length > 0) {
        const ids = members.map((m) => m.id);
        await tx.order.updateMany({
          where: { id: { in: ids }, status: "OPEN" },
          data: { supplierId: supplier.id, status: "ACCEPTED" },
        });
        claimed.push(...ids);
      }
    }

    return { claimed };
  });

  if (result.error === "not_found")
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  if (result.error === "taken")
    return NextResponse.json({ error: "Another rider just took this order." }, { status: 409 });

  // Notify each claimed order's student (wrapped — never throws into the flow).
  for (const id of result.claimed) await notifyOrderEvent("accepted", id);

  return NextResponse.json({ ok: true, claimed: result.claimed.length });
}
