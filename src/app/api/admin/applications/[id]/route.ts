import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { currentUser } from "@/lib/session";
import { sendEmail } from "@/lib/services/email";

const APP = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

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
    const reason = notes ? ` Reason: ${notes}` : "";
    await sendEmail({
      to: app.email,
      subject: "Update on your GasUp rider application",
      html: `<div style="font-family:Helvetica,Arial,sans-serif;max-width:480px">
        <h2 style="color:#C2410C;margin:0 0 8px">GasUp</h2>
        <p style="font-size:15px;line-height:1.5;color:#1c1917">Hi ${app.fullName.split(" ")[0]}, thanks for your interest in riding with GasUp. We're unable to approve your application at this time.${reason}</p>
        <p style="font-size:14px;color:#57534e">You're welcome to apply again later.</p>
      </div>`,
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

  await sendEmail({
    to: app.email,
    subject: "Your GasUp rider account is approved 🎉",
    html: `<div style="font-family:Helvetica,Arial,sans-serif;max-width:480px">
      <h2 style="color:#C2410C;margin:0 0 8px">GasUp</h2>
      <p style="font-size:15px;line-height:1.5;color:#1c1917">Welcome aboard, ${app.fullName.split(" ")[0]}! Your rider account is approved.</p>
      <p style="font-size:15px;line-height:1.5;color:#1c1917">Sign in with:<br/>
        <strong>Email:</strong> ${app.email}<br/>
        <strong>Temporary password:</strong> ${tempPassword}</p>
      <p><a href="${APP}/login" style="display:inline-block;background:#E0521E;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none">Sign in</a></p>
      <p style="font-size:13px;color:#57534e">Please change your password after your first sign-in.</p>
    </div>`,
  });

  // Return the temp password so the admin can relay it (Resend is sandboxed in this env).
  return NextResponse.json({ ok: true, status: "APPROVED", email: app.email, tempPassword });
}
