import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { currentUser } from "@/lib/session";

// Admin-only direct rider onboarding — the admin creates the login + rider (Supplier)
// profile here. This is the fast path alongside the public /register/rider application flow.
const schema = z.object({
  businessName: z.string().trim().min(2, "Business name is required"),
  fullName: z.string().trim().min(2, "Contact name is required"),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  phone: z
    .string()
    .trim()
    .regex(/^0\d{9}$/, "Enter a 10-digit Ghana number")
    .optional()
    .or(z.literal("")),
  password: z.string().min(8, "Password must be at least 8 characters"),
  vehicleType: z.enum(["Motorbike", "Tricycle", "Vehicle"]),
  coverageArea: z.string().trim().min(2, "Coverage area is required"),
  pricePerKg: z.coerce.number().positive("Price must be greater than 0").max(100),
});

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  if (user.role !== "ADMIN")
    return NextResponse.json({ error: "Only admins can add riders" }, { status: 403 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid details" },
      { status: 400 },
    );
  }
  const d = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email: d.email } });
  if (existing) {
    return NextResponse.json(
      { error: "An account with this email already exists." },
      { status: 409 },
    );
  }

  // Create the SUPPLIER login and its 1:1 profile in one nested write.
  await prisma.user.create({
    data: {
      fullName: d.fullName,
      email: d.email,
      phone: d.phone || null,
      role: "SUPPLIER",
      passwordHash: await bcrypt.hash(d.password, 10),
      supplier: {
        create: {
          businessName: d.businessName,
          vehicleType: d.vehicleType,
          coverageArea: d.coverageArea,
          pricePerKg: d.pricePerKg,
        },
      },
    },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
