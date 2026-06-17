import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { uniqueReferralCode } from "@/lib/referral";

// Student self-registration only. Suppliers are admin-created; admin is seeded.
const schema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name"),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  phone: z
    .string()
    .trim()
    .regex(/^0\d{9}$/, "Enter a 10-digit Ghana number")
    .optional()
    .or(z.literal("")),
  password: z.string().min(8, "Password must be at least 8 characters"),
  householdSize: z.coerce.number().int().min(1).max(12),
  referralCode: z.string().trim().toUpperCase().optional().or(z.literal("")),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid details" },
      { status: 400 },
    );
  }
  const data = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    return NextResponse.json(
      { error: "An account with this email already exists." },
      { status: 409 },
    );
  }

  // Record the referrer only if the supplied code matches a real user's code.
  let referredBy: string | null = null;
  if (data.referralCode) {
    const referrer = await prisma.user.findUnique({
      where: { referralCode: data.referralCode },
      select: { id: true },
    });
    if (referrer) referredBy = data.referralCode;
  }

  await prisma.user.create({
    data: {
      fullName: data.fullName,
      email: data.email,
      phone: data.phone || null,
      role: "STUDENT",
      householdSize: data.householdSize,
      passwordHash: await bcrypt.hash(data.password, 10),
      referralCode: await uniqueReferralCode(data.fullName),
      referredBy,
    },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
