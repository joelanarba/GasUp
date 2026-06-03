import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyWebhookSignature } from "@/lib/services/payments";
import { logService } from "@/lib/services/log";

// Paystack webhook. Verifies the HMAC signature on the RAW body, then marks the
// matching order PAID on charge.success. Always returns 200 so Paystack stops retrying.
export async function POST(req: Request) {
  const raw = await req.text();
  const signature = req.headers.get("x-paystack-signature");

  if (!verifyWebhookSignature(raw, signature)) {
    await logService("paystack", "webhook", false, "invalid signature");
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  try {
    const event = JSON.parse(raw);
    if (event?.event === "charge.success") {
      const reference: string | undefined = event.data?.reference;
      if (reference) {
        const order = await prisma.order.findFirst({ where: { paystackRef: reference } });
        if (order && order.paymentStatus !== "PAID") {
          await prisma.order.update({ where: { id: order.id }, data: { paymentStatus: "PAID" } });
          await logService("paystack", "webhook", true, `paid ${reference}`);
        }
      }
    }
  } catch (e) {
    await logService("paystack", "webhook", false, e instanceof Error ? e.message : "parse error");
  }

  return NextResponse.json({ ok: true });
}
