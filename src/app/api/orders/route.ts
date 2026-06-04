import { NextResponse } from "next/server";
import { z } from "zod";
import { CylinderSize } from "@prisma/client";
import { prisma } from "@/lib/db";
import { currentUser } from "@/lib/session";
import { kgFor } from "@/lib/cylinders";
import { computeFee } from "@/lib/pricing";
import { poolOrder } from "@/lib/pooling";
import { notifyOrderEvent } from "@/lib/services/notifications";

const schema = z.object({
  supplierId: z.string().min(1, "Choose a supplier"),
  cylinderSize: z.nativeEnum(CylinderSize),
  address: z.string().trim().min(1, "Address is required"),
  lat: z.number().nullable(),
  lng: z.number().nullable(),
  specialInstructions: z.string().trim().max(280).optional().or(z.literal("")),
  express: z.boolean().optional(),
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

  const supplier = await prisma.supplier.findUnique({ where: { id: input.supplierId } });
  if (!supplier) return NextResponse.json({ error: "Supplier not found" }, { status: 400 });

  const kg = kgFor(input.cylinderSize);
  const express = input.express ?? false;
  const fee = computeFee(kg, supplier.pricePerKg, { express });

  // Update student defaults
  await prisma.user.update({
    where: { id: student.id },
    data: {
      defaultAddress: input.address,
      defaultLat: input.lat,
      defaultLng: input.lng,
    },
  });

  const order = await prisma.order.create({
    data: {
      studentId: student.id,
      supplierId: supplier.id,
      address: input.address,
      lat: input.lat,
      lng: input.lng,
      cylinderSize: input.cylinderSize,
      requestedKg: kg,
      express,
      feeGhs: fee.total,
      specialInstructions: input.specialInstructions || null,
      status: "PENDING",
      paymentStatus: "UNPAID",
    },
  });

  // Auto-pool with same-supplier nearby PENDING orders in the time window.
  const pool = await poolOrder(order.id);

  await notifyOrderEvent("placed", order.id);

  return NextResponse.json(
    { id: order.id, pooled: pool.pooled, savings: pool.pooled ? pool.savings : 0 },
    { status: 201 },
  );
}
