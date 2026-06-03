import { NextResponse } from "next/server";
import { z } from "zod";
import { CylinderSize } from "@prisma/client";
import { prisma } from "@/lib/db";
import { currentUser } from "@/lib/session";
import { kgFor } from "@/lib/cylinders";
import { computeFee } from "@/lib/pricing";

const schema = z.object({
  supplierId: z.string().min(1, "Choose a supplier"),
  cylinderSize: z.nativeEnum(CylinderSize),
  hostelId: z.string().min(1).optional(),
  roomNumber: z.string().trim().min(1).optional(),
  specialInstructions: z.string().trim().max(280).optional().or(z.literal("")),
});

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  if (user.role !== "STUDENT")
    return NextResponse.json({ error: "Only students can place orders" }, { status: 403 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid order" },
      { status: 400 },
    );
  }
  const input = parsed.data;

  const student = await prisma.user.findUnique({ where: { id: user.id } });
  if (!student) return NextResponse.json({ error: "Account not found" }, { status: 404 });

  const hostelId = input.hostelId ?? student.hostelId;
  const roomNumber = input.roomNumber ?? student.roomNumber;
  if (!hostelId || !roomNumber) {
    return NextResponse.json(
      { error: "Add your hostel and room before ordering." },
      { status: 400 },
    );
  }

  const supplier = await prisma.supplier.findUnique({ where: { id: input.supplierId } });
  if (!supplier) return NextResponse.json({ error: "Supplier not found" }, { status: 400 });

  const kg = kgFor(input.cylinderSize);
  const fee = computeFee(kg, supplier.pricePerKg);

  const order = await prisma.order.create({
    data: {
      studentId: student.id,
      supplierId: supplier.id,
      hostelId,
      roomNumber,
      cylinderSize: input.cylinderSize,
      requestedKg: kg,
      feeGhs: fee.total,
      specialInstructions: input.specialInstructions || null,
      status: "PENDING",
      paymentStatus: "UNPAID",
    },
  });

  return NextResponse.json({ id: order.id }, { status: 201 });
}
