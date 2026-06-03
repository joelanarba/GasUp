import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

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
  hostelId: z.string().min(1, "Choose your hostel block"),
  roomNumber: z.string().trim().min(1, "Enter your room number"),
  householdSize: z.coerce.number().int().min(1).max(12),
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

  const hostel = await prisma.hostel.findUnique({ where: { id: data.hostelId } });
  if (!hostel) {
    return NextResponse.json({ error: "That hostel block was not found." }, { status: 400 });
  }

  await prisma.user.create({
    data: {
      fullName: data.fullName,
      email: data.email,
      phone: data.phone || null,
      role: "STUDENT",
      householdSize: data.householdSize,
      hostelId: data.hostelId,
      roomNumber: data.roomNumber,
      passwordHash: await bcrypt.hash(data.password, 10),
    },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
