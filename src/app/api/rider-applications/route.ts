import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

// Public: anyone can apply to become a rider. Creates a PENDING RiderApplication —
// no User/Supplier is created until an admin approves it.
const schema = z.object({
  fullName: z.string().trim().min(2, "Your full name is required"),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  phone: z
    .string()
    .trim()
    .regex(/^0\d{9}$/, "Enter a 10-digit Ghana number")
    .optional()
    .or(z.literal("")),
  businessName: z.string().trim().min(2, "Business / rider name is required"),
  vehicleType: z.enum(["Motorbike", "Tricycle", "Vehicle"]),
  coverageArea: z.string().trim().min(2, "Coverage area is required"),
  partnerStation: z.string().trim().max(120).optional().or(z.literal("")),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid application" },
      { status: 400 },
    );
  }
  const d = parsed.data;

  const existingUser = await prisma.user.findUnique({ where: { email: d.email } });
  if (existingUser) {
    return NextResponse.json(
      { error: "An account with this email already exists." },
      { status: 409 },
    );
  }
  const existingApp = await prisma.riderApplication.findFirst({
    where: { email: d.email, status: "PENDING" },
  });
  if (existingApp) {
    return NextResponse.json(
      { error: "You already have an application under review." },
      { status: 409 },
    );
  }

  await prisma.riderApplication.create({
    data: {
      fullName: d.fullName,
      email: d.email,
      phone: d.phone || null,
      businessName: d.businessName,
      vehicleType: d.vehicleType,
      coverageArea: d.coverageArea,
      partnerStation: d.partnerStation || null,
    },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
