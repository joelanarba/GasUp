import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { currentUser } from "@/lib/session";

// Rider confirms cash received on a pay-on-delivery order. No Paystack involved —
// this just flips paymentStatus → PAID for the rider's own CASH_ON_DELIVERY order.
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  if (user.role !== "SUPPLIER")
    return NextResponse.json({ error: "Only riders can mark cash received" }, { status: 403 });

  const supplier = await prisma.supplier.findUnique({ where: { userId: user.id } });
  if (!supplier)
    return NextResponse.json({ error: "No rider profile linked" }, { status: 403 });

  const order = await prisma.order.findUnique({ where: { id: params.id } });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  if (order.supplierId !== supplier.id)
    return NextResponse.json({ error: "Not your order" }, { status: 403 });
  if (order.paymentMethod !== "CASH_ON_DELIVERY")
    return NextResponse.json({ error: "This order isn't pay-on-delivery" }, { status: 409 });
  if (order.paymentStatus === "PAID")
    return NextResponse.json({ ok: true, paymentStatus: "PAID" });

  await prisma.order.update({
    where: { id: order.id },
    data: { paymentStatus: "PAID" },
  });

  return NextResponse.json({ ok: true, paymentStatus: "PAID" });
}
