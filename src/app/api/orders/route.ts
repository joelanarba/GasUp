import { NextResponse } from "next/server";
import { z } from "zod";
import { CylinderSize, PaymentMethod } from "@prisma/client";
import { prisma } from "@/lib/db";
import { currentUser } from "@/lib/session";
import { kgFor } from "@/lib/cylinders";
import { computeFee } from "@/lib/pricing";
import { poolOrder } from "@/lib/pooling";
import { notifyOrderEvent } from "@/lib/services/notifications";

const MIN_CUSTOM_KG = 1; // smallest partial fill we accept

const schema = z.object({
  cylinderSize: z.nativeEnum(CylinderSize),
  // Custom partial fill (item 3). Absent → full cylinder. Capped at the cylinder's capacity.
  requestedKg: z.number().positive().optional(),
  address: z.string().trim().min(1, "Address is required"),
  lat: z.number().nullable(),
  lng: z.number().nullable(),
  specialInstructions: z.string().trim().max(280).optional().or(z.literal("")),
  express: z.boolean().optional(),
  paymentMethod: z.nativeEnum(PaymentMethod).optional(),
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

  // kg: full cylinder by default, or a custom partial fill (clamped to the cylinder capacity).
  const fullKg = kgFor(input.cylinderSize);
  let kg = fullKg;
  if (input.requestedKg != null) {
    if (input.requestedKg < MIN_CUSTOM_KG)
      return NextResponse.json({ error: `Minimum fill is ${MIN_CUSTOM_KG} kg` }, { status: 400 });
    if (input.requestedKg > fullKg)
      return NextResponse.json(
        { error: `A ${fullKg} kg cylinder can't hold more than ${fullKg} kg` },
        { status: 400 },
      );
    kg = Math.round(input.requestedKg * 100) / 100;
  }

  const express = input.express ?? false;
  const paymentMethod = input.paymentMethod ?? "ONLINE";
  const fee = computeFee(kg, { express });

  // Update student defaults for next time.
  await prisma.user.update({
    where: { id: student.id },
    data: {
      defaultAddress: input.address,
      defaultLat: input.lat,
      defaultLng: input.lng,
    },
  });

  // Placed unassigned — broadcasts to the rider dispatch board; first to accept claims it.
  const order = await prisma.order.create({
    data: {
      studentId: student.id,
      supplierId: null,
      address: input.address,
      lat: input.lat,
      lng: input.lng,
      cylinderSize: input.cylinderSize,
      requestedKg: kg,
      express,
      feeGhs: fee.total,
      specialInstructions: input.specialInstructions || null,
      status: "OPEN",
      paymentStatus: "UNPAID",
      paymentMethod,
    },
  });

  // Auto-pool with nearby OPEN orders in the time window.
  const pool = await poolOrder(order.id);

  await notifyOrderEvent("placed", order.id);

  return NextResponse.json(
    { id: order.id, pooled: pool.pooled, savings: pool.pooled ? pool.savings : 0 },
    { status: 201 },
  );
}
