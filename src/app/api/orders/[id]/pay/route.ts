import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { currentUser } from "@/lib/session";
import { initPayment } from "@/lib/services/payments";

const APP = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  if (user.role !== "STUDENT")
    return NextResponse.json({ error: "Only students pay for orders" }, { status: 403 });

  const order = await prisma.order.findUnique({ where: { id: params.id } });
  if (!order || order.studentId !== user.id)
    return NextResponse.json({ error: "Not your order" }, { status: 403 });
  if (order.paymentStatus === "PAID")
    return NextResponse.json({ error: "Order is already paid" }, { status: 409 });

  const reference = `gasup_${order.id}_${Date.now()}`;
  const result = await initPayment({
    email: user.email ?? "student@gasup.app",
    amountGhs: order.feeGhs,
    reference,
    callbackUrl: `${APP}/payment/callback`,
    metadata: { orderId: order.id },
  });

  if (!result.ok) {
    // Graceful degradation — never crash checkout if Paystack is unavailable.
    return NextResponse.json(
      {
        ok: false,
        message: result.skipped
          ? "Online payment isn't enabled yet (Paystack test keys not set). You can still pay on delivery."
          : "Couldn't start payment right now. Please try again.",
      },
      { status: 200 },
    );
  }

  await prisma.order.update({
    where: { id: order.id },
    data: { paystackRef: reference, paymentStatus: "PENDING" },
  });

  return NextResponse.json({ ok: true, authorizationUrl: result.authorizationUrl });
}
