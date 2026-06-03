import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { currentUser } from "@/lib/session";
import { transition, type OrderAction } from "@/lib/order-status";

const schema = z.object({
  action: z.enum(["accept", "reject", "advance", "cancel", "complete"]),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }
  const action = parsed.data.action as OrderAction;

  const order = await prisma.order.findUnique({ where: { id: params.id } });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  // Ownership: students own their orders; suppliers own orders assigned to them.
  if (user.role === "STUDENT" && order.studentId !== user.id) {
    return NextResponse.json({ error: "Not your order" }, { status: 403 });
  }
  if (user.role === "SUPPLIER") {
    const supplier = await prisma.supplier.findUnique({ where: { userId: user.id } });
    if (!supplier || order.supplierId !== supplier.id) {
      return NextResponse.json({ error: "Not your order" }, { status: 403 });
    }
  }
  if (user.role === "ADMIN") {
    return NextResponse.json({ error: "Admins don't advance orders" }, { status: 403 });
  }

  const result = transition(order.status, action, user.role);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 409 });
  }

  const updated = await prisma.order.update({
    where: { id: order.id },
    data: {
      status: result.toStatus,
      // deliveredAt feeds the prediction engine (days-between-refills).
      ...(result.toStatus === "DELIVERED" ? { deliveredAt: new Date() } : {}),
    },
  });

  return NextResponse.json({ id: updated.id, status: updated.status });
}
