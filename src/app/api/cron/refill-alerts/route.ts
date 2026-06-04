import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { computePrediction, type Delivery } from "@/lib/prediction";
import { sendRefillAlert } from "@/lib/services/notifications";

// Daily proactive refill nudge — the prediction differentiator, automated.
// Finds students forecast to run low (≤3 days left) who have no order in
// flight, and emails + SMSes a refill reminder before they run out.
//
// Auth: Vercel Cron sends `Authorization: Bearer $CRON_SECRET` automatically
// when CRON_SECRET is set. We also accept `?secret=` for manual/local runs.
export const dynamic = "force-dynamic";

const ALERT_DAYS_LEFT = 3;
// Orders not yet delivered — don't nag a student who already has gas coming.
// DELIVERED is intentionally excluded: it's a completed refill (the history we
// predict from), and a fresh one already reads "full" so won't trigger anyway.
const IN_FLIGHT_STATUSES = ["PENDING", "ACCEPTED", "VERIFYING", "ON_THE_WAY"] as const;

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    const url = new URL(req.url);
    const ok = auth === `Bearer ${secret}` || url.searchParams.get("secret") === secret;
    if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const students = await prisma.user.findMany({
    where: { role: "STUDENT" },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      householdSize: true,
      orders: {
        where: { deliveredAt: { not: null } },
        select: { deliveredAt: true, requestedKg: true, verifiedWeightKg: true },
        orderBy: { deliveredAt: "asc" },
      },
    },
  });

  const now = new Date();
  let alerted = 0;
  const recipients: string[] = [];

  for (const s of students) {
    const deliveries: Delivery[] = s.orders
      .filter((o) => o.deliveredAt)
      .map((o) => ({ deliveredAt: o.deliveredAt as Date, kg: o.verifiedWeightKg ?? o.requestedKg }));

    const prediction = computePrediction(deliveries, s.householdSize ?? 1, now);
    if (!prediction.hasData || prediction.daysLeft > ALERT_DAYS_LEFT) continue;

    // Skip students who already have an order in flight (gas is on the way).
    const inFlight = await prisma.order.findFirst({
      where: { studentId: s.id, status: { in: [...IN_FLIGHT_STATUSES] } },
      select: { id: true },
    });
    if (inFlight) continue;

    await sendRefillAlert({
      to: { email: s.email, phone: s.phone },
      name: s.fullName,
      daysLeft: prediction.daysLeft,
    });
    alerted++;
    recipients.push(s.email);
  }

  return NextResponse.json({ ok: true, checked: students.length, alerted, recipients });
}
