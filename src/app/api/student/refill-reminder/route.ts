import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { currentUser } from "@/lib/session";

// Lightweight "remind me tomorrow" snooze for the low-gas nudge. No scheduler —
// we just stamp a date; the dashboard and the daily cron both respect it.
const DAY = 24 * 60 * 60 * 1000;
const schema = z.object({ action: z.enum(["snooze", "clear"]) });

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  if (user.role !== "STUDENT")
    return NextResponse.json({ error: "Students only" }, { status: 403 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const refillSnoozedUntil =
    parsed.data.action === "snooze" ? new Date(Date.now() + DAY) : null;

  await prisma.user.update({
    where: { id: user.id },
    data: { refillSnoozedUntil },
  });

  return NextResponse.json({ ok: true, snoozedUntil: refillSnoozedUntil }, { status: 200 });
}
