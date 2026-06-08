import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { currentUser } from "@/lib/session";

// Admin-only: soft-deactivate another admin (sets deactivatedAt → can't log in, audit
// trail preserved). Two hard guards: never remove the last active admin, never self.
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  if (user.role !== "ADMIN")
    return NextResponse.json({ error: "Only admins can remove admins" }, { status: 403 });

  if (params.id === user.id)
    return NextResponse.json({ error: "You can't remove your own account." }, { status: 400 });

  const target = await prisma.user.findUnique({ where: { id: params.id } });
  if (!target || target.role !== "ADMIN")
    return NextResponse.json({ error: "Admin not found" }, { status: 404 });
  if (target.deactivatedAt)
    return NextResponse.json({ error: "That admin is already removed." }, { status: 409 });

  const activeAdmins = await prisma.user.count({
    where: { role: "ADMIN", deactivatedAt: null },
  });
  if (activeAdmins <= 1)
    return NextResponse.json({ error: "Can't remove the last admin." }, { status: 409 });

  await prisma.user.update({
    where: { id: target.id },
    data: { deactivatedAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
