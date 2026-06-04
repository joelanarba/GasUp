import { prisma } from "@/lib/db";
import { computeFee, DELIVERY_FEE_SOLO, DELIVERY_FEE_POOLED } from "@/lib/pricing";

// Orders from the same supplier to nearby locations within this window
// bundle into one rider trip — lower delivery fee per student, one trip for the rider.
export const POOL_WINDOW_MIN = 90;
export const POOL_RADIUS_METERS = 150;

export type PoolResult = { pooled: false } | { pooled: true; poolId: string; size: number; savings: number };

const toRad = (deg: number) => (deg * Math.PI) / 180;

function distanceMeters(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6_371_000;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

/**
 * Try to pool a freshly-placed PENDING order with compatible neighbours.
 * Re-prices every affected order to the pooled delivery fee.
 */
export async function poolOrder(orderId: string): Promise<PoolResult> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { supplier: true },
  });
  if (!order || order.status !== "PENDING" || !order.supplierId || !order.supplier || !order.lat || !order.lng) {
    return { pooled: false };
  }

  const windowStart = new Date(order.createdAt.getTime() - POOL_WINDOW_MIN * 60_000);
  
  // Find pending orders from same supplier in time window
  const candidates = await prisma.order.findMany({
    where: {
      id: { not: order.id },
      supplierId: order.supplierId,
      status: "PENDING",
      createdAt: { gte: windowStart },
      lat: { not: null },
      lng: { not: null },
    },
  });

  // Filter for proximity
  const companions = candidates.filter(
    (c) => c.lat && c.lng && distanceMeters({ lat: order.lat!, lng: order.lng! }, { lat: c.lat, lng: c.lng }) <= POOL_RADIUS_METERS
  );

  if (companions.length === 0) return { pooled: false };

  const pricePerKg = order.supplier.pricePerKg;
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
          feeGhs: computeFee(o.requestedKg, pricePerKg, { pooled: true, express: o.express }).total,
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
