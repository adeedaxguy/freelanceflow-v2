import type { NextRequest } from "next/server";

jest.mock("next/server", () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      json: async () => body,
    }),
  },
}));

jest.mock("@/lib/stripe", () => ({
  getStripeConfig: jest.fn(async () => ({
    secretKey: "sk_test_mock",
    webhookSecret: "whsec_mock",
    mode: "test",
    testMode: true,
  })),
  verifyStripeSignature: jest.fn(() => true),
}));

jest.mock("@/lib/audit-log", () => ({
  recordAuditLog: jest.fn(async () => undefined),
}));

jest.mock("@/lib/prisma", () => ({
  prisma: {
    telephonyPurchase: {
      updateMany: jest.fn(async () => ({ count: 0 })),
      findUnique: jest.fn(async () => null),
      update: jest.fn(async () => null),
    },
    billingSubscription: {
      findUnique: jest.fn(async () => null),
      findFirst: jest.fn(async () => null),
      upsert: jest.fn(async () => null),
      update: jest.fn(async () => null),
      findMany: jest.fn(async () => []),
    },
    user: {
      findUnique: jest.fn(async () => ({ role: "ADMIN" })),
      update: jest.fn(async () => null),
    },
    platformSetting: {
      findUnique: jest.fn(async () => null),
    },
  },
}));

jest.mock("@/lib/telephony", () => ({
  provisionPhoneNumber: jest.fn(async () => null),
}));

import { recordAuditLog } from "@/lib/audit-log";
import { prisma } from "@/lib/prisma";
import { provisionPhoneNumber } from "@/lib/telephony";
import { POST } from "./route";

function request(body: string) {
  return {
    text: async () => body,
    headers: {
      get: (name: string) => name.toLowerCase() === "stripe-signature" ? "t=1,v1=test" : null,
    },
  } as unknown as NextRequest;
}

describe("Stripe webhook failure logging", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (prisma.telephonyPurchase.updateMany as jest.Mock).mockReset().mockResolvedValue({ count: 0 });
  });

  it.each(["ACTIVE", "EXPIRED", "PROVISIONING", "PAID_TEST"])("does not reset a settled number purchase (%s) on checkout retries", async status => {
    (prisma.telephonyPurchase.findUnique as jest.Mock).mockResolvedValueOnce({
      id: "purchase_settled", userId: "user_123", externalSubscriptionId: "sub_settled", status,
    });
    const response = await POST(request(JSON.stringify({
      type: "checkout.session.completed", livemode: true,
      data: { object: { id: "cs_settled", subscription: "sub_settled", payment_status: "paid",
        metadata: { purchase_type: "softphone_number", telephony_purchase_id: "purchase_settled" },
      } },
    })));
    expect(response.status).toBe(200);
    expect(prisma.telephonyPurchase.update).not.toHaveBeenCalled();
    expect(provisionPhoneNumber).not.toHaveBeenCalled();
    expect(prisma.telephonyPurchase.updateMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ status: { in: ["CHECKOUT_PENDING", "CHECKOUT_FAILED", "CHECKOUT_EXPIRED", "PAYMENT_CONFIRMED", "PROVISION_FAILED"] } }),
    }));
  });

  it("does not let delayed minute checkout overwrite cancellation or a package change", async () => {
    await POST(request(JSON.stringify({
      type: "checkout.session.completed", livemode: true,
      data: { object: { subscription: "sub_minutes_late", payment_status: "paid",
        metadata: { purchase_type: "softphone_minutes", user_id: "user_123", package_id: "starter" },
      } },
    })));
    const input = (prisma.billingSubscription.upsert as jest.Mock).mock.calls[0][0];
    expect(input.create).toMatchObject({ status: "active", plan: "softphone_minutes_starter" });
    expect(input.update).not.toHaveProperty("status");
    expect(input.update).not.toHaveProperty("plan");
  });

  it("restricts number-checkout expiry updates to unsettled purchases", async () => {
    await POST(request(JSON.stringify({
      type: "checkout.session.expired", livemode: true,
      data: { object: { id: "cs_old", metadata: { purchase_type: "softphone_number", telephony_purchase_id: "purchase_123" } } },
    })));
    expect(prisma.telephonyPurchase.updateMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: "purchase_123", status: { in: ["CHECKOUT_PENDING", "CHECKOUT_FAILED", "CHECKOUT_EXPIRED"] } },
    }));
  });

  it("never provisions a real number for a successful sandbox payment", async () => {
    (prisma.telephonyPurchase.findUnique as jest.Mock).mockResolvedValueOnce({ id: "purchase_test", userId: "admin_123", status: "CHECKOUT_PENDING" });
    (prisma.telephonyPurchase.updateMany as jest.Mock).mockResolvedValueOnce({ count: 1 });
    const response = await POST(request(JSON.stringify({
      type: "checkout.session.completed", livemode: false,
      data: { object: { id: "cs_test_paid", subscription: "sub_test_paid", payment_status: "paid",
        metadata: { purchase_type: "softphone_number", telephony_purchase_id: "purchase_test" },
      } },
    })));
    expect(response.status).toBe(200);
    expect(prisma.telephonyPurchase.updateMany).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ testMode: true, status: "PAID_TEST" }) }));
    expect(provisionPhoneNumber).not.toHaveBeenCalled();
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it("records failed checkout sessions in the audit log", async () => {
    const response = await POST(request(JSON.stringify({
      id: "evt_failed",
      type: "checkout.session.async_payment_failed",
      livemode: false,
      data: {
        object: {
          id: "cs_test_failed",
          payment_status: "unpaid",
          customer_email: "buyer@example.com",
          metadata: {
            purchase_type: "plan",
            user_id: "user_123",
            plan: "pro",
          },
        },
      },
    })));

    expect(response.status).toBe(200);
    expect(recordAuditLog).toHaveBeenCalledWith(expect.objectContaining({
      action: "payment_failed",
      actorId: "user_123",
      actorEmail: "buyer@example.com",
      targetType: "StripeCheckout",
      targetId: "cs_test_failed",
      details: expect.objectContaining({ testMode: true }),
    }));
  });

  it.each(["card_declined", "payment_intent_authentication_failure"])("logs immediate %s failures even before Stripe creates an invoice", async code => {
    const response = await POST(request(JSON.stringify({
      id: "evt_intent_failed", type: "payment_intent.payment_failed", livemode: false,
      data: { object: { id: "pi_failed", amount: 1000, currency: "usd", customer: null,
        last_payment_error: { code, message: "Payment attempt failed", decline_code: "generic_decline" },
      } },
    })));
    expect(response.status).toBe(200);
    expect(recordAuditLog).toHaveBeenCalledWith(expect.objectContaining({
      action: "payment_failed", targetType: "StripePaymentIntent", targetId: "pi_failed",
      details: expect.objectContaining({ code, amountDue: 1000, testMode: true, message: "Payment attempt failed" }),
    }));
    expect(prisma.user.update).not.toHaveBeenCalled();
    expect(prisma.billingSubscription.upsert).not.toHaveBeenCalled();
    expect(provisionPhoneNumber).not.toHaveBeenCalled();
  });

  it.each([
    { subscription: "sub_first", subscription_details: { metadata: { user_id: "user_first", purchase_type: "plan" } } },
    { parent: { type: "subscription_details", subscription_details: { subscription: "sub_first", metadata: { user_id: "user_first", purchase_type: "plan" } } } },
    { subscription: "sub_first", metadata: { userId: "user_first", purchase_type: "plan" } },
  ])("attributes a first invoice failure without an existing subscription record: %j", async (subscriptionFields) => {
    const response = await POST(request(JSON.stringify({
      id: "evt_invoice_first", type: "invoice.payment_failed", livemode: true,
      data: { object: {
        id: "in_first", customer: "cus_first", amount_due: 1000, currency: "usd", attempt_count: 1,
        ...subscriptionFields,
      } },
    })));
    expect(response.status).toBe(200);
    expect(recordAuditLog).toHaveBeenCalledWith(expect.objectContaining({
      action: "payment_failed", actorId: "user_first", targetType: "StripeInvoice", targetId: "in_first",
      details: expect.objectContaining({ subscriptionId: "sub_first", purchaseType: "plan", amountDue: 1000, testMode: false }),
    }));
    expect(prisma.user.update).not.toHaveBeenCalled();
    expect(prisma.billingSubscription.upsert).not.toHaveBeenCalled();
    expect(provisionPhoneNumber).not.toHaveBeenCalled();
  });

  it("uses the recorded subscriber for renewal failures and labels test events", async () => {
    (prisma.billingSubscription.findUnique as jest.Mock).mockResolvedValueOnce({ id: "billing_renewal", userId: "recorded_user" });
    const response = await POST(request(JSON.stringify({
      id: "evt_renewal", type: "invoice.payment_failed", livemode: false,
      data: { object: {
        id: "in_renewal", subscription: "sub_renewal",
        subscription_details: { metadata: { user_id: "old_metadata_user", purchase_type: "plan" } },
      } },
    })));
    expect(response.status).toBe(200);
    expect(recordAuditLog).toHaveBeenCalledWith(expect.objectContaining({
      actorId: "recorded_user", targetType: "BillingSubscription", targetId: "billing_renewal",
      details: expect.objectContaining({ testMode: true }),
    }));
    expect(prisma.billingSubscription.update).toHaveBeenCalledWith({
      where: { id: "billing_renewal" }, data: { status: "past_due", testMode: true },
    });
  });

  it("records an expired checkout without counting it as a declined payment", async () => {
    const response = await POST(request(JSON.stringify({
      id: "evt_expired", type: "checkout.session.expired", livemode: true,
      data: { object: { id: "cs_expired", metadata: { user_id: "user_123", purchase_type: "plan" } } },
    })));
    expect(response.status).toBe(200);
    expect(recordAuditLog).toHaveBeenCalledWith(expect.objectContaining({
      action: "payment_checkout_expired", actorId: "user_123",
      details: expect.objectContaining({ testMode: false }),
    }));
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it("does not let a delayed initial checkout overwrite later plan or cancellation status", async () => {
    const response = await POST(request(JSON.stringify({
      id: "evt_delayed_checkout", type: "checkout.session.completed", livemode: false,
      data: { object: {
        id: "cs_initial", subscription: "sub_existing", customer: "cus_existing",
        payment_status: "paid",
        metadata: { purchase_type: "plan", user_id: "user_123", plan: "pro" },
      } },
    })));
    expect(response.status).toBe(200);
    const input = (prisma.billingSubscription.upsert as jest.Mock).mock.calls[0][0];
    expect(input.create).toMatchObject({ plan: "pro", status: "active" });
    expect(input.update).not.toHaveProperty("plan");
    expect(input.update).not.toHaveProperty("status");
  });

  it("confirms a paid phone-number checkout and provisions the number", async () => {
    (prisma.telephonyPurchase.updateMany as jest.Mock).mockResolvedValueOnce({ count: 1 });
    (prisma.telephonyPurchase.findUnique as jest.Mock).mockResolvedValueOnce({
      id: "purchase_123",
      userId: "user_123",
      status: "CHECKOUT_PENDING",
    });

    const response = await POST(request(JSON.stringify({
      id: "evt_number",
      type: "checkout.session.completed",
      livemode: true,
      data: {
        object: {
          id: "cs_number",
          subscription: "sub_number",
          customer: "cus_number",
          payment_status: "paid",
          livemode: true,
          metadata: {
            purchase_type: "softphone_number",
            telephony_purchase_id: "purchase_123",
            user_id: "user_123",
          },
        },
      },
    })));

    expect(response.status).toBe(200);
    expect(prisma.telephonyPurchase.updateMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ id: "purchase_123" }),
      data: expect.objectContaining({ status: "PAYMENT_CONFIRMED", subscriptionStatus: "active" }),
    }));
    expect(provisionPhoneNumber).toHaveBeenCalledWith("purchase_123");
  });

  it("activates a paid calling-minute package", async () => {
    const response = await POST(request(JSON.stringify({
      id: "evt_minutes",
      type: "checkout.session.completed",
      livemode: true,
      data: {
        object: {
          id: "cs_minutes",
          subscription: "sub_minutes",
          customer: "cus_minutes",
          payment_status: "paid",
          livemode: true,
          metadata: {
            purchase_type: "softphone_minutes",
            package_id: "growth",
            user_id: "user_123",
          },
        },
      },
    })));

    expect(response.status).toBe(200);
    expect(prisma.billingSubscription.upsert).toHaveBeenCalledWith(expect.objectContaining({
      where: { externalSubscriptionId: "sub_minutes" },
      create: expect.objectContaining({ plan: "softphone_minutes_growth", status: "active" }),
    }));
  });

  it("records a canceled calling-minute subscription", async () => {
    (prisma.billingSubscription.findUnique as jest.Mock).mockResolvedValueOnce({
      id: "billing_123",
      userId: "user_123",
      plan: "softphone_minutes_starter",
    });

    const response = await POST(request(JSON.stringify({
      id: "evt_minutes_deleted",
      type: "customer.subscription.deleted",
      livemode: true,
      data: {
        object: {
          id: "sub_minutes",
          customer: "cus_minutes",
          status: "canceled",
          livemode: true,
          metadata: { purchase_type: "softphone_minutes" },
        },
      },
    })));

    expect(response.status).toBe(200);
    expect(prisma.billingSubscription.upsert).toHaveBeenCalledWith(expect.objectContaining({
      where: { externalSubscriptionId: "sub_minutes" },
      update: expect.objectContaining({ status: "canceled" }),
    }));
  });

  it("uses the billed price rather than stale plan metadata after a portal change", async () => {
    process.env.STRIPE_AGENCY_MONTHLY_PRICE_ID = "price_agency";
    try {
      const response = await POST(request(JSON.stringify({
        type: "customer.subscription.updated", livemode: true,
        data: { object: {
          id: "sub_plan", status: "active", livemode: true,
          metadata: { user_id: "user_123", plan: "pro" },
          items: { data: [{ price: { id: "price_agency" }, current_period_end: 1_900_000_000 }] },
        } },
      })));
      expect(response.status).toBe(200);
      expect(prisma.billingSubscription.upsert).toHaveBeenCalledWith(expect.objectContaining({
        update: expect.objectContaining({ plan: "agency", renewsAt: new Date(1_900_000_000_000) }),
      }));
    } finally { delete process.env.STRIPE_AGENCY_MONTHLY_PRICE_ID; }
  });

  it("catches asynchronous fulfillment failures and returns a retryable error", async () => {
    (prisma.billingSubscription.upsert as jest.Mock).mockRejectedValueOnce(new Error("Temporary database failure"));
    const response = await POST(request(JSON.stringify({
      id: "evt_retry", type: "checkout.session.completed", livemode: true,
      data: { object: {
        id: "cs_retry", subscription: "sub_retry", payment_status: "paid", livemode: true,
        metadata: { purchase_type: "plan", user_id: "user_123", plan: "agency" },
      } },
    })));
    expect(response.status).toBe(500);
    expect(recordAuditLog).toHaveBeenCalledWith(expect.objectContaining({ action: "payment_webhook_error", targetId: "evt_retry" }));
  });
});
