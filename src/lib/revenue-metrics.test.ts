import { monthlyBaseAmount } from "./revenue-metrics";

describe("subscription base run rate", () => {
  it("uses Stripe amounts and normalizes annual subscriptions", () => {
    expect(monthlyBaseAmount([{ price: { currency: "usd", unit_amount: 15000, recurring: { interval: "year", interval_count: 1 } } }])).toBe(12.5);
    expect(monthlyBaseAmount([{ quantity: 2, price: { currency: "usd", unit_amount: 1000, recurring: { interval: "month", interval_count: 1 } } }])).toBe(20);
  });
  it("keeps free subscriptions at zero and refuses unknown amounts or mixed currencies", () => {
    expect(monthlyBaseAmount([{ price: { currency: "usd", unit_amount: 0, recurring: { interval: "month", interval_count: 1 } } }])).toBe(0);
    expect(monthlyBaseAmount([{ price: { currency: "eur", unit_amount: 1000, recurring: { interval: "month", interval_count: 1 } } }])).toBeNull();
    expect(monthlyBaseAmount([{ price: { currency: "usd", unit_amount: null } }])).toBeNull();
  });
});
