import { prisma } from "@/lib/db";
import { computeFee, DELIVERY_FEE_SOLO, DELIVERY_FEE_POOLED } from "@/lib/pricing";

// Orders from the same supplier to the same hostel block within this window
// bundle into one rider trip — lower delivery fee per student, one trip for the rider.
export const POOL_WINDOW_MIN = 90;

export type PoolResult = { pooled: false } | { pooled: true; poolId: string; size: number; savings: number };

/**
 * Try to pool a freshly-placed PENDING order with compatible neighbours.
 * Re-prices every affected order to the pooled delivery fee.
 */
export async function poolOrder(orderId: string): Promise<PoolResult> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { supplier: true, hostel: true },
  });
  if (!order || order.status !== "PENDING" || !order.supplierId || !order.supplier) {
    return { pooled: false };
  }

  const windowStart = new Date(order.createdAt.getTime() - POOL_WINDOW_MIN * 60_000);
  const companions = await prisma.order.findMany({
    where: {
      id: { not: order.id },
      supplierId: order.supplierId,
      hostelId: order.hostelId,
      status: "PENDING",
      createdAt: { gte: windowStart },
    },
  });
  if (companions.length === 0) return { pooled: false };

  const pricePerKg = order.supplier.pricePerKg;
  const existingPoolId = companions.find((c) => c.poolId)?.poolId ?? null;

  const result = await prisma.$transaction(async (tx) => {
    const pool = existingPoolId
      ? { id: existingPoolId }
      : await tx.pool.create({ data: { hostelId: order.hostelId, block: order.hostel.block } });

    const toAttach = [order, ...companions];
    for (const o of toAttach) {
      await tx.order.update({
        where: { id: o.id },
        data: { poolId: pool.id, feeGhs: computeFee(o.requestedKg, pricePerKg, true).total },
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
