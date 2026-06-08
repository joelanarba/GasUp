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

// ─── Shared email building blocks (match the GasUp transactional style) ───
function emailShell(bodyHtml: string): string {
  return `<div style="font-family:Helvetica,Arial,sans-serif;max-width:480px">
    <h2 style="color:#C2410C;margin:0 0 8px">GasUp</h2>
    ${bodyHtml}
  </div>`;
}
function para(text: string): string {
  return `<p style="font-size:15px;line-height:1.5;color:#1c1917">${text}</p>`;
}
function note(text: string): string {
  return `<p style="font-size:13px;color:#57534e">${text}</p>`;
}
function ctaButton(href: string, label: string): string {
  return `<p><a href="${href}" style="display:inline-block;background:#E0521E;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none">${label}</a></p>`;
}

type ApplicantInfo = {
  fullName: string;
  email: string;
  phone: string | null;
  businessName: string;
  vehicleType: string;
  coverageArea: string;
  partnerStation: string | null;
};

// A new rider applied → alert every admin (email + SMS) with the applicant's
// details and a deep link to the applications card. Self-wrapped: a failed send
// is logged by the wrappers but never blocks the application submission.
export async function notifyAdminsNewApplication(app: ApplicantInfo): Promise<void> {
  try {
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { email: true, phone: true },
    });
    if (admins.length === 0) return;

    const link = `${APP}/admin#applications`;
    const subject = `New rider application — ${app.fullName}`;
    const rows = [
      ["Name", app.fullName],
      ["Phone", app.phone ?? "—"],
      ["Business", app.businessName],
      ["Vehicle", app.vehicleType],
      ["Coverage", app.coverageArea],
      ["Partner station", app.partnerStation ?? "—"],
    ]
      .map(
        ([k, v]) =>
          `<tr><td style="padding:2px 12px 2px 0;color:#57534e">${k}</td><td style="padding:2px 0;color:#1c1917;font-weight:600">${v}</td></tr>`,
      )
      .join("");
    const html = emailShell(`
      ${para("A new rider has applied to GasUp. Review and approve or reject them:")}
      <table style="font-size:14px;border-collapse:collapse;margin:4px 0 12px">${rows}</table>
      ${ctaButton(link, "Review application")}
    `);
    const sms = `GasUp: New rider application from ${app.fullName} (${app.businessName}). Review in the admin dashboard.`;

    for (const admin of admins) {
      await sendEmail({ to: admin.email, subject, html });
      await sendSms({ to: admin.phone, message: sms });
    }
  } catch (e) {
    console.error("[notifyAdminsNewApplication] failed", e);
  }
}

// Confirm to the applicant that we received their rider application (email + SMS).
export async function notifyApplicantReceived(app: ApplicantInfo): Promise<void> {
  try {
    const first = app.fullName.split(" ")[0];
    const html = emailShell(`
      ${para(`Hi ${first}, thanks for applying to ride with GasUp — we've received your application.`)}
      ${para("Our team reviews new riders and will email you within 24 hours. If you're approved, you'll get login details and start seeing open orders on your rider dashboard.")}
      ${note("No action is needed from you right now.")}
    `);
    await sendEmail({ to: app.email, subject: "Application received — GasUp", html });
    await sendSms({
      to: app.phone,
      message: `GasUp: Hi ${first}, your rider application was received. We'll review it and email you within 24 hours.`,
    });
  } catch (e) {
    console.error("[notifyApplicantReceived] failed", e);
  }
}

// Applicant approved → send login email (with temp password) + congratulatory SMS.
export async function notifyApplicationApproved(args: {
  to: string;
  phone: string | null;
  fullName: string;
  email: string;
  tempPassword: string;
}): Promise<void> {
  try {
    const first = args.fullName.split(" ")[0];
    const html = emailShell(`
      ${para(`Congratulations ${first} — you're approved to ride with GasUp! 🎉`)}
      ${para(`Sign in with:<br/><strong>Email:</strong> ${args.email}<br/><strong>Temporary password:</strong> ${args.tempPassword}`)}
      ${ctaButton(`${APP}/login?role=rider`, "Sign in")}
      ${para("Once you're in, you'll see open orders on your rider dashboard — accept one to start earning.")}
      ${note("Please change your password after your first sign-in.")}
    `);
    await sendEmail({ to: args.to, subject: "You're approved — welcome to GasUp", html });
    await sendSms({
      to: args.phone,
      message: `GasUp: Congratulations ${first}! Your rider application was approved. Check your email for your login details.`,
    });
  } catch (e) {
    console.error("[notifyApplicationApproved] failed", e);
  }
}

// Applicant rejected → polite decline (with reason if given) + SMS.
export async function notifyApplicationRejected(args: {
  to: string;
  phone: string | null;
  fullName: string;
  reason: string | null;
}): Promise<void> {
  try {
    const first = args.fullName.split(" ")[0];
    const reasonLine = args.reason ? para(`<strong>Note from our team:</strong> ${args.reason}`) : "";
    const html = emailShell(`
      ${para(`Hi ${first}, thank you for your interest in riding with GasUp. After review, we're unable to approve your application at this time.`)}
      ${reasonLine}
      ${note("If your circumstances change, you're welcome to apply again.")}
    `);
    await sendEmail({ to: args.to, subject: "Your GasUp rider application", html });
    await sendSms({
      to: args.phone,
      message: `GasUp: Hi ${first}, your rider application was not approved at this time. Check your email for details.`,
    });
  } catch (e) {
    console.error("[notifyApplicationRejected] failed", e);
  }
}

// A rider accepted their very first order → encouragement + the verified-fill
// reminder (email + SMS to the rider). Self-wrapped — never throws into accept.
export async function notifyRiderFirstOrder(orderId: string): Promise<void> {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { supplier: { include: { user: true } } },
    });
    if (!order?.supplier?.user) return;

    const rider = order.supplier.user;
    const first = rider.fullName.split(" ")[0];
    const link = `${APP}/rider`;
    const html = emailShell(`
      ${para(`Nice one, ${first} — you've accepted your first GasUp delivery!`)}
      ${para("One thing that sets GasUp apart: every fill is verified. At the station, <strong>weigh the cylinder and upload a photo of the scale</strong> before you head back, so the student can confirm the weight on delivery.")}
      ${ctaButton(link, "Open your dashboard")}
      ${note("Deliver well and the ratings will follow. Welcome aboard.")}
    `);
    await sendEmail({ to: rider.email, subject: "Your first GasUp delivery", html });
    await sendSms({
      to: rider.phone,
      message:
        "GasUp: You've accepted your first order! Remember to weigh the cylinder at the station and upload proof before returning.",
    });
  } catch (e) {
    console.error("[notifyRiderFirstOrder] failed", e);
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
