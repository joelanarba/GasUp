import { prisma } from "@/lib/db";
import { computeFee, DELIVERY_FEE_SOLO, DELIVERY_FEE_POOLED } from "@/lib/pricing";
import { distanceMeters } from "@/lib/geo";

// Orders to nearby locations placed within this window bundle into one rider trip —
// lower delivery fee per student, one multi-stop trip for whichever rider claims it.
// In the dispatch model orders have no rider yet (status OPEN), so pooling matches on
// location + time only; the rider who accepts any member claims the whole pool.
export const POOL_WINDOW_MIN = 90;
export const POOL_RADIUS_METERS = 150;

export type PoolResult = { pooled: false } | { pooled: true; poolId: string; size: number; savings: number };

/**
 * Try to pool a freshly-placed OPEN order with compatible neighbours.
 * Re-prices every affected order to the pooled delivery fee.
 */
export async function poolOrder(orderId: string): Promise<PoolResult> {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.status !== "OPEN" || order.lat == null || order.lng == null) {
    return { pooled: false };
  }

  const windowStart = new Date(order.createdAt.getTime() - POOL_WINDOW_MIN * 60_000);

  // Find other unclaimed (OPEN) orders placed in the time window.
  const candidates = await prisma.order.findMany({
    where: {
      id: { not: order.id },
      status: "OPEN",
      createdAt: { gte: windowStart },
      lat: { not: null },
      lng: { not: null },
    },
  });

  // Filter for proximity.
  const companions = candidates.filter(
    (c) =>
      c.lat != null &&
      c.lng != null &&
      distanceMeters({ lat: order.lat!, lng: order.lng! }, { lat: c.lat, lng: c.lng }) <= POOL_RADIUS_METERS,
  );

  if (companions.length === 0) return { pooled: false };

  const existingPoolId = companions.find((c) => c.poolId)?.poolId ?? null;

  const result = await prisma.$transaction(async (tx) => {
    const pool = existingPoolId
      ? { id: existingPoolId }
      : await tx.pool.create({ data: { lat: order.lat!, lng: order.lng! } });

    const toAttach = [order, ...companions];
    for (const o of toAttach) {
      await tx.order.update({
        where: { id: o.id },
        data: {
          poolId: pool.id,
          feeGhs: computeFee(o.requestedKg, { pooled: true, express: o.express }).total,
        },
      });
    }
    const size = await tx.order.count({ where: { poolId: pool.id } });
    return { poolId: pool.id, size };
  });

  return {
    pooled: true,
    poolId: result.poolId,
    size: result.size,
    savings: DELIVERY_FEE_SOLO - DELIVERY_FEE_POOLED,
  };
}
