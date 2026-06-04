// Transparent pricing: gas cost (kg × supplier's price/kg) + a delivery fee.
// Pooled orders (Phase 6) get the lower delivery fee — that's the unit-economics edge.
export const DELIVERY_FEE_SOLO = 10; // GHS, single-stop trip
export const DELIVERY_FEE_POOLED = 5; // GHS, shared hostel-block trip
export const EXPRESS_SURCHARGE = 8; // GHS, premium priority delivery

export type FeeBreakdown = {
  gasCost: number;
  deliveryFee: number;
  expressSurcharge: number;
  total: number;
};

export function computeFee(
  kg: number,
  pricePerKg: number,
  opts: { pooled?: boolean; express?: boolean } = {},
): FeeBreakdown {
  const gasCost = Math.round(kg * pricePerKg);
  const deliveryFee = opts.pooled ? DELIVERY_FEE_POOLED : DELIVERY_FEE_SOLO;
  const expressSurcharge = opts.express ? EXPRESS_SURCHARGE : 0;
  return { gasCost, deliveryFee, expressSurcharge, total: gasCost + deliveryFee + expressSurcharge };
}

export function formatGhs(amount: number): string {
  return `GHS ${amount.toFixed(2)}`;
}
