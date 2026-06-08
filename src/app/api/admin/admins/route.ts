import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { currentUser } from "@/lib/session";
import { sendEmail } from "@/lib/services/email";

const APP = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

// Admin-only: one admin invites/creates another. Admins are never self-served, so this
// is the only way a new admin account comes into being (besides the seeded one).
const schema = z.object({
  fullName: z.string().trim().min(2, "Full name is required"),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(8, "Temporary password must be at least 8 characters"),
});

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  if (user.role !== "ADMIN")
    return NextResponse.json({ error: "Only admins can add admins" }, { status: 403 });

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

  await prisma.user.create({
    data: {
      fullName: d.fullName,
      email: d.email,
      role: "ADMIN",
      passwordHash: await bcrypt.hash(d.password, 10),
    },
  });

  // Welcome email with credentials + the admin login variant. SMS is skipped: admins
  // have no phone on file. Wrapped + audited; a failed send never fails the creation.
  const first = d.fullName.split(" ")[0];
  await sendEmail({
    to: d.email,
    subject: "You've been added as a GasUp admin",
    html: `<div style="font-family:Helvetica,Arial,sans-serif;max-width:480px">
      <h2 style="color:#C2410C;margin:0 0 8px">GasUp</h2>
      <p style="font-size:15px;line-height:1.5;color:#1c1917">Hi ${first}, you've been given admin access to the GasUp operations dashboard.</p>
      <p style="font-size:15px;line-height:1.5;color:#1c1917">Sign in with:<br/>
        <strong>Email:</strong> ${d.email}<br/>
        <strong>Temporary password:</strong> ${d.password}</p>
      <p><a href="${APP}/login?role=admin" style="display:inline-block;background:#E0521E;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none">Open the admin console</a></p>
      <p style="font-size:13px;color:#57534e">Please change your password after your first sign-in.</p>
    </div>`,
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
