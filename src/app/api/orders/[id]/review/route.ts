import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { currentUser } from "@/lib/session";

const schema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().max(280).optional().or(z.literal("")),
});

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  if (user.role !== "STUDENT")
    return NextResponse.json({ error: "Only students can rate" }, { status: 403 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Pick a rating from 1 to 5" }, { status: 400 });
  }
  const { rating, comment } = parsed.data;

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { review: true },
  });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  if (order.studentId !== user.id)
    return NextResponse.json({ error: "Not your order" }, { status: 403 });
  if (!order.supplierId)
    return NextResponse.json({ error: "Order has no supplier to rate" }, { status: 400 });
  if (order.status !== "COMPLETED")
    return NextResponse.json({ error: "Confirm the delivery before rating" }, { status: 409 });
  if (order.review)
    return NextResponse.json({ error: "You already rated this delivery" }, { status: 409 });

  const supplierId = order.supplierId;

  await prisma.$transaction(async (tx) => {
    await tx.review.create({
      data: {
        orderId: order.id,
        studentId: user.id,
        supplierId,
        rating,
        comment: comment || null,
      },
    });
    const supplier = await tx.supplier.findUniqueOrThrow({ where: { id: supplierId } });
    const count = supplier.ratingCount + 1;
    const avg = (supplier.ratingAvg * supplier.ratingCount + rating) / count;
    await tx.supplier.update({
      where: { id: supplierId },
      data: { ratingCount: count, ratingAvg: Math.round(avg * 10) / 10 },
    });
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
