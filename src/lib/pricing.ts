// Transparent pricing: gas cost (kg × supplier's price/kg) + a delivery fee.
// Pooled orders (Phase 6) get the lower delivery fee — that's the unit-economics edge.
export const DELIVERY_FEE_SOLO = 10; // GHS, single-stop trip
export const DELIVERY_FEE_POOLED = 5; // GHS, shared hostel-block trip

export type FeeBreakdown = {
  gasCost: number;
  deliveryFee: number;
  total: number;
};

export function computeFee(
  kg: number,
  pricePerKg: number,
  pooled = false,
): FeeBreakdown {
  const gasCost = Math.round(kg * pricePerKg);
  const deliveryFee = pooled ? DELIVERY_FEE_POOLED : DELIVERY_FEE_SOLO;
  return { gasCost, deliveryFee, total: gasCost + deliveryFee };
}

export function formatGhs(amount: number): string {
  return `GHS ${amount.toFixed(2)}`;
}
