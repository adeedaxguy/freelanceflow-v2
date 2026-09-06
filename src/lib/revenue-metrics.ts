export type RecurringItem = {
  quantity?: number | null;
  price: { currency: string; unit_amount: number | null; recurring?: { interval: string; interval_count: number } | null };
};

// This is the base run rate, not cash collected: coupons, tax and credits are excluded.
export function monthlyBaseAmount(items: RecurringItem[]) {
  let cents = 0;
  for (const { price, quantity } of items) {
    if (price.currency !== "usd" || price.unit_amount === null || !price.recurring) return null;
    const { interval, interval_count } = price.recurring;
    if (interval_count <= 0 || !["month", "year"].includes(interval)) return null;
    cents += price.unit_amount * (quantity ?? 1) / (interval_count * (interval === "year" ? 12 : 1));
  }
  return Math.round(cents) / 100;
}
