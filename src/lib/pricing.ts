// Transparent, platform-set pricing: gas cost (kg × platform price/kg) + a delivery fee.
// Students pay one published price regardless of which rider takes the order — riders no
// longer set their own gas price (Supplier.pricePerKg is now internal cost only).
// Pooled orders (Phase 6) get the lower delivery fee — that's the unit-economics edge.
export const GAS_PRICE_PER_KG = 14; // GHS — platform retail gas price charged to students
export const DELIVERY_FEE_SOLO = 10; // GHS, single-stop trip
export const DELIVERY_FEE_POOLED = 5; // GHS, shared hostel / nearby trip
export const EXPRESS_SURCHARGE = 8; // GHS, premium priority delivery
export const RIDER_CUT = 0.75; // rider's share of the delivery fee (their earnings per trip)

export type FeeBreakdown = {
  gasCost: number;
  deliveryFee: number;
  expressSurcharge: number;
  total: number;
};

export function computeFee(
  kg: number,
  opts: { pooled?: boolean; express?: boolean } = {},
): FeeBreakdown {
  const gasCost = Math.round(kg * GAS_PRICE_PER_KG);
  const deliveryFee = opts.pooled ? DELIVERY_FEE_POOLED : DELIVERY_FEE_SOLO;
  const expressSurcharge = opts.express ? EXPRESS_SURCHARGE : 0;
  return { gasCost, deliveryFee, expressSurcharge, total: gasCost + deliveryFee + expressSurcharge };
}

/** What a rider earns from a single stop's delivery fee (their cut of it). */
export function riderEarn(opts: { pooled?: boolean } = {}): number {
  const deliveryFee = opts.pooled ? DELIVERY_FEE_POOLED : DELIVERY_FEE_SOLO;
  return Math.round(deliveryFee * RIDER_CUT * 100) / 100;
}

export function formatGhs(amount: number): string {
  return `GHS ${amount.toFixed(2)}`;
}
