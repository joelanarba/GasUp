import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { currentUser } from "@/lib/session";
import {
  notifyApplicationApproved,
  notifyApplicationRejected,
} from "@/lib/services/notifications";

const schema = z.object({
  action: z.enum(["approve", "reject"]),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  if (user.role !== "ADMIN")
    return NextResponse.json({ error: "Only admins can review applications" }, { status: 403 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  const { action, notes } = parsed.data;

  const app = await prisma.riderApplication.findUnique({ where: { id: params.id } });
  if (!app) return NextResponse.json({ error: "Application not found" }, { status: 404 });
  if (app.status !== "PENDING")
    return NextResponse.json({ error: "This application was already reviewed." }, { status: 409 });

  if (action === "reject") {
    await prisma.riderApplication.update({
      where: { id: app.id },
      data: { status: "REJECTED", notes: notes || null },
    });
    await notifyApplicationRejected({
      to: app.email,
      phone: app.phone,
      fullName: app.fullName,
      reason: notes || null,
    });
    return NextResponse.json({ ok: true, status: "REJECTED" });
  }

  // approve
  const existing = await prisma.user.findUnique({ where: { email: app.email } });
  if (existing) {
    return NextResponse.json(
      { error: "An account with this email already exists." },
      { status: 409 },
    );
  }

  const tempPassword = "GasUp-" + crypto.randomBytes(4).toString("hex");
  const passwordHash = await bcrypt.hash(tempPassword, 10);

  await prisma.$transaction(async (tx) => {
    await tx.user.create({
      data: {
        fullName: app.fullName,
        email: app.email,
        phone: app.phone,
        role: "SUPPLIER",
        passwordHash,
        supplier: {
          create: {
            businessName: app.businessName,
            vehicleType: app.vehicleType,
            coverageArea: app.coverageArea,
            partnerStation: app.partnerStation,
          },
        },
      },
    });
    await tx.riderApplication.update({
      where: { id: app.id },
      data: { status: "APPROVED" },
    });
  });

  await notifyApplicationApproved({
    to: app.email,
    phone: app.phone,
    fullName: app.fullName,
    email: app.email,
    tempPassword,
  });

  // Return the temp password so the admin can relay it (Resend is sandboxed in this env).
  return NextResponse.json({ ok: true, status: "APPROVED", email: app.email, tempPassword });
}
