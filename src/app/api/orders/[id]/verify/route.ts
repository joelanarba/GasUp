import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { currentUser } from "@/lib/session";
import { notifyOrderEvent } from "@/lib/services/notifications";

// Proof is stored inline as a data URL (kept small) so the demo needs no object
// storage and stays deploy-safe on Vercel's read-only filesystem.
const MAX_PROOF_CHARS = 700_000; // ~500 KB image

const schema = z.object({
  filledKg: z.coerce.number().positive().max(60),
  proofUrl: z
    .string()
    .max(MAX_PROOF_CHARS, "Photo is too large — use a smaller image")
    .regex(/^data:image\//, "Proof must be an image")
    .optional()
    .or(z.literal("")),
});

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  if (user.role !== "SUPPLIER")
    return NextResponse.json({ error: "Only riders verify fills" }, { status: 403 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid weight" },
      { status: 400 },
    );
  }

  const order = await prisma.order.findUnique({ where: { id: params.id } });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const supplier = await prisma.supplier.findUnique({ where: { userId: user.id } });
  if (!supplier || order.supplierId !== supplier.id) {
    return NextResponse.json({ error: "Not your order" }, { status: 403 });
  }
  if (order.status !== "ACCEPTED") {
    return NextResponse.json(
      { error: "You can only submit the fill weight on an accepted order." },
      { status: 409 },
    );
  }

  const updated = await prisma.order.update({
    where: { id: order.id },
    data: {
      verifiedWeightKg: parsed.data.filledKg,
      proofUrl: parsed.data.proofUrl || null,
      weightConfirmed: false,
      status: "VERIFYING",
    },
  });

  await notifyOrderEvent("verifying", updated.id);

  return NextResponse.json({ id: updated.id, status: updated.status });
}
