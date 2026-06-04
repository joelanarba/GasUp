import { prisma } from "@/lib/db";
import { computeTrust, type Trust } from "@/lib/trust";

/** Build a supplierId → Trust map for the given suppliers in two grouped queries. */
export async function supplierTrustMap(
  suppliers: { id: string; ratingAvg: number; ratingCount: number }[],
): Promise<Map<string, Trust>> {
  const [confirmedBy, disputedBy] = await Promise.all([
    prisma.order.groupBy({
      by: ["supplierId"],
      where: { weightConfirmed: true, supplierId: { not: null } },
      _count: { _all: true },
    }),
    prisma.order.groupBy({
      by: ["supplierId"],
      where: { status: "DISPUTED", supplierId: { not: null } },
      _count: { _all: true },
    }),
  ]);
  const confirmed = new Map(confirmedBy.map((c) => [c.supplierId!, c._count._all]));
  const disputed = new Map(disputedBy.map((d) => [d.supplierId!, d._count._all]));

  const out = new Map<string, Trust>();
  for (const s of suppliers) {
    out.set(
      s.id,
      computeTrust({
        ratingAvg: s.ratingAvg,
        ratingCount: s.ratingCount,
        confirmed: confirmed.get(s.id) ?? 0,
        disputed: disputed.get(s.id) ?? 0,
      }),
    );
  }
  return out;
}
