import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface StripeSessionResponse {
  id: string;
  url: string;
}

interface StripeErrorResponse {
  error?: { message?: string };
}

async function createStripeCheckoutSession(params: {
  stripeKey: string;
  priceId: string;
  customerEmail: string;
  userId: string;
  plan: string;
  billing: string;
  appUrl: string;
}): Promise<{ url?: string; error?: string }> {
  const { stripeKey, priceId, customerEmail, userId, plan, billing, appUrl } = params;

  try {
    const body = new URLSearchParams({
      mode: "subscription",
      "payment_method_types[0]": "card",
      customer_email: customerEmail,
      "line_items[0][price]": priceId,
      "line_items[0][quantity]": "1",
      "metadata[userId]": userId,
      "metadata[plan]": plan,
      "metadata[billing]": billing,
      "subscription_data[metadata][userId]": userId,
      "subscription_data[metadata][plan]": plan,
      success_url: `${appUrl}/dashboard?upgraded=1`,
      cancel_url: `${appUrl}/dashboard/upgrade?cancelled=1`,
    });

    const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stripeKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });

    if (!res.ok) {
      const err = await res.json() as StripeErrorResponse;
      return { error: err.error?.message ?? "Stripe checkout failed" };
    }

    const session = await res.json() as StripeSessionResponse;
    return { url: session.url };
  } catch (err) {
    console.error("Stripe fetch error:", err);
    return { error: "Failed to connect to payment provider" };
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { plan?: string; billing?: string };
  try { body = await req.json() as { plan?: string; billing?: string }; }
  catch { body = {}; }

  const { plan, billing = "monthly" } = body;

  if (!plan || !["pro", "agency"].includes(plan)) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  try {
    // Load Stripe settings from DB
    const settings = await prisma.platformSetting.findMany({
      where: { key: { in: ["stripe_secret_key", "pro_price_id", "agency_price_id"] } },
    });
    const cfg: Record<string, string> = {};
    for (const s of settings) cfg[s.key] = s.value;

    const stripeKey    = (cfg["stripe_secret_key"] ?? process.env.STRIPE_SECRET_KEY ?? "").trim();
    const proPriceId   = (cfg["pro_price_id"]    ?? process.env.STRIPE_PRO_PRICE_ID    ?? "").trim();
    const agencyPriceId= (cfg["agency_price_id"] ?? process.env.STRIPE_AGENCY_PRICE_ID ?? "").trim();

    if (!stripeKey || stripeKey.length < 20) {
      return NextResponse.json({
        error: "Payment gateway not configured yet. Please contact support, or the admin needs to add Stripe keys in Admin → Settings.",
      }, { status: 503 });
    }

    const priceId = plan === "pro" ? proPriceId : agencyPriceId;
    if (!priceId) {
      return NextResponse.json({
        error: `Price ID for ${plan} plan is not configured. Admin needs to set it in Admin → Settings → Payment Gateway.`,
      }, { status: 503 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const result = await createStripeCheckoutSession({
      stripeKey,
      priceId,
      customerEmail: user?.email ?? "",
      userId: session.user.id,
      plan,
      billing,
      appUrl,
    });

    if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
    return NextResponse.json({ url: result.url });
  } catch (err) {
    console.error("Upgrade error:", err);
    return NextResponse.json({ error: "Failed to create checkout session. Please try again." }, { status: 500 });
  }
}
