import { NextResponse } from "next/server";
import { z } from "zod";
import { CylinderSize } from "@prisma/client";
import { prisma } from "@/lib/db";
import { currentUser } from "@/lib/session";

// Onboarding "gas profile" — seeds Day-One prediction before any refill history.
const schema = z.object({
  cylinderSize: z.nativeEnum(CylinderSize),
  householdSize: z.coerce.number().int().min(1).max(12),
  // optional "YYYY-MM-DD"; empty/omitted → treat as a fresh fill (no fake precision)
  lastRefillDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date")
    .optional()
    .or(z.literal("")),
});

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  if (user.role !== "STUDENT")
    return NextResponse.json({ error: "Only students set a gas profile" }, { status: 403 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid details" },
      { status: 400 },
    );
  }
  const data = parsed.data;

  // Anchor at local noon so the date the student picked doesn't shift a day
  // across timezones. Ignore future dates.
  let lastRefillAt: Date | null = null;
  if (data.lastRefillDate) {
    const d = new Date(`${data.lastRefillDate}T12:00:00`);
    if (!Number.isNaN(d.getTime()) && d.getTime() <= Date.now()) lastRefillAt = d;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      defaultCylinderSize: data.cylinderSize,
      householdSize: data.householdSize,
      lastRefillAt,
    },
  });

  return NextResponse.json({ ok: true }, { status: 200 });
}
