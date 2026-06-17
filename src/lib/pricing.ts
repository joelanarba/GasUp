// Transparent, platform-set pricing: gas cost (kg × platform price/kg) + a delivery fee.
// Students pay one published price regardless of which rider takes the order — riders no
// longer set their own gas price (Supplier.pricePerKg is now internal cost only).
// Pooled orders (Phase 6) get the lower delivery fee — that's the unit-economics edge.
export const GAS_PRICE_PER_KG = 14; // GHS — platform retail gas price charged to students
export const DELIVERY_FEE_SOLO = 10; // GHS, single-stop trip
export const DELIVERY_FEE_POOLED = 5; // GHS, shared hostel / nearby trip
export const EXPRESS_SURCHARGE = 8; // GHS, premium priority delivery
// Per the Business Model Canvas, GasUp takes a 20–30% platform commission of the delivery
// fee per trip. We use 25% (the midpoint). The rider keeps the remaining 75% of the fee.
export const PLATFORM_COMMISSION = 0.25;

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

/** What a rider keeps from a delivery fee after GasUp's platform commission. */
export function riderEarnFromFee(deliveryFee: number): number {
  return Math.round(deliveryFee * (1 - PLATFORM_COMMISSION) * 100) / 100;
}

export function formatGhs(amount: number): string {
  return `GHS ${amount.toFixed(2)}`;
}
