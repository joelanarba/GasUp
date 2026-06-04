import { DELIVERY_FEE_SOLO, DELIVERY_FEE_POOLED } from "@/lib/pricing";

// Each pooled order shaves the delivery fee from solo → pooled.
export const SAVING_PER_POOLED_ORDER = DELIVERY_FEE_SOLO - DELIVERY_FEE_POOLED; // GHS 5

// Estimated emissions avoided per delivery trip removed by pooling.
// Assumption (stated for honesty): ~4 km round trip on a delivery motorbike at
// ~0.08 kg CO₂/km ≈ 0.32 kg per trip saved.
export const CO2_KG_PER_TRIP = 0.32;

export type Impact = {
  pooledOrders: number;
  savingsGhs: number;
  tripsReduced: number;
  co2SavedKg: number;
};

/**
 * `pooledOrders` = orders that ended up in a pool. `pools` = number of distinct
 * pools. N pooled orders across P pools means (N − P) trips were eliminated
 * (each pool collapses its members into a single rider trip).
 */
export function poolingImpact(pooledOrders: number, pools: number): Impact {
  const tripsReduced = Math.max(0, pooledOrders - pools);
  return {
    pooledOrders,
    savingsGhs: pooledOrders * SAVING_PER_POOLED_ORDER,
    tripsReduced,
    co2SavedKg: Math.round(tripsReduced * CO2_KG_PER_TRIP * 10) / 10,
  };
}
