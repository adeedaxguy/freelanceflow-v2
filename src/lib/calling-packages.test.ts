import {
  callingPackagePlan,
  getCallingPackage,
  getCallingPackages,
  isCallingSubscriptionActive,
  packageIdFromCallingPlan,
} from "./calling-packages";

describe("calling package helpers", () => {
  beforeEach(() => {
    delete process.env.TWILIO_CALLING_COST_CENTS_PER_MINUTE;
    delete process.env.TWILIO_CALLING_MARGIN_CENTS;
  });

  it("builds stable Stripe subscription plan ids", () => {
    expect(callingPackagePlan("growth")).toBe("softphone_minutes_growth");
    expect(packageIdFromCallingPlan("softphone_minutes_growth")).toBe("growth");
    expect(packageIdFromCallingPlan("pro")).toBeNull();
  });

  it("uses configured minute pricing within the bounded defaults", () => {
    process.env.TWILIO_CALLING_COST_CENTS_PER_MINUTE = "3";
    process.env.TWILIO_CALLING_MARGIN_CENTS = "500";

    expect(getCallingPackage("growth")).toMatchObject({
      minutes: 300,
      priceCents: 1_400,
    });
    expect(getCallingPackages()).toHaveLength(3);
  });

  it("treats active Stripe statuses as callable", () => {
    expect(isCallingSubscriptionActive("active")).toBe(true);
    expect(isCallingSubscriptionActive("trialing")).toBe(true);
    expect(isCallingSubscriptionActive("past_due")).toBe(true);
    expect(isCallingSubscriptionActive("canceled")).toBe(false);
  });
});
