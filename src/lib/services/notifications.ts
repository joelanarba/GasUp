import { prisma } from "@/lib/db";
import { sendEmail } from "./email";
import { sendSms } from "./sms";
import { cylinderLabel } from "@/lib/cylinders";

export type OrderEvent = "placed" | "accepted" | "verifying" | "on_the_way" | "delivered";

const APP = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

// Fire notifications for a status change. Fully wrapped — a failed send (or a
// dead provider) is logged to ServiceLog but never propagates to the order flow.
export async function notifyOrderEvent(event: OrderEvent, orderId: string): Promise<void> {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { student: true, supplier: true },
    });
    if (!order) return;

    const name = order.student.fullName.split(" ")[0];
    const item = cylinderLabel(order.cylinderSize);
    const link = `${APP}/student/orders/${order.id}`;

    const copy: Record<OrderEvent, { subject: string; line: string }> = {
      placed: {
        subject: `Order placed — ${item} refill`,
        line: `Hi ${name}, your ${item} refill is in. We'll tell you the moment a rider accepts.`,
      },
      accepted: {
        subject: "A rider accepted your refill",
        line: `${order.supplier?.businessName ?? "Your rider"} accepted your ${item} order and is preparing it.`,
      },
      verifying: {
        subject: "Confirm your fill weight",
        line: `Your rider filled ${order.verifiedWeightKg ?? ""}kg. Open GasUp to confirm it matches on delivery.`,
      },
      on_the_way: {
        subject: "Your gas is on the way",
        line: `Your ${item} refill is on the way to ${order.address}.`,
      },
      delivered: {
        subject: "Delivered — please confirm",
        line: `Your ${item} refill was delivered. Confirm receipt and rate your supplier.`,
      },
    };

    const { subject, line } = copy[event];
    const html = `<div style="font-family:Helvetica,Arial,sans-serif;max-width:480px">
      <h2 style="color:#C2410C;margin:0 0 8px">GasUp</h2>
      <p style="font-size:15px;line-height:1.5;color:#1c1917">${line}</p>
      <p><a href="${link}" style="display:inline-block;background:#E0521E;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none">View your order</a></p>
    </div>`;

    await sendEmail({ to: order.student.email, subject, html });
    await sendSms({ to: order.student.phone, message: `GasUp: ${line}` });
  } catch (e) {
    console.error("[notifyOrderEvent] failed", e);
  }
}

// Proactive refill nudge — sent by the daily cron to students predicted to run
// low with no active order. Wrapped: a failed send is logged but never throws.
export async function sendRefillAlert(args: {
  to: { email: string; phone: string | null };
  name: string;
  daysLeft: number;
}): Promise<void> {
  try {
    const first = args.name.split(" ")[0];
    const days = Math.max(0, Math.round(args.daysLeft));
    const when =
      days <= 0 ? "today" : days === 1 ? "in about a day" : `in about ${days} days`;
    const link = `${APP}/student/order`;
    const line = `Hi ${first}, you're likely to run out of gas ${when}. Order a refill now and skip the empty-cylinder scramble.`;
    const html = `<div style="font-family:Helvetica,Arial,sans-serif;max-width:480px">
      <h2 style="color:#C2410C;margin:0 0 8px">GasUp</h2>
      <p style="font-size:15px;line-height:1.5;color:#1c1917">${line}</p>
      <p><a href="${link}" style="display:inline-block;background:#E0521E;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none">Order a refill</a></p>
    </div>`;

    await sendEmail({ to: args.to.email, subject: "Time to refill your gas soon", html });
    if (args.to.phone) await sendSms({ to: args.to.phone, message: `GasUp: ${line}` });
  } catch (e) {
    console.error("[sendRefillAlert] failed", e);
  }
}
