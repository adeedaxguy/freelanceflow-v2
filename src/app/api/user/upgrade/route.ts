export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getLemonSqueezyConfig,
  getVariantId,
  lemonSqueezyRequest,
  type BillingInterval,
  type PaidPlan,
} from "@/lib/lemonsqueezy";

interface CheckoutResponse {
  data: {
    attributes: { url: string };
  };
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({})) as {
    plan?: PaidPlan;
    billing?: BillingInterval;
  };
  const plan = body.plan;
  const billing = body.billing || "monthly";

  if (!plan || !["pro", "agency"].includes(plan) || !["monthly", "annual"].includes(billing)) {
    return NextResponse.json({ error: "Invalid plan or billing interval." }, { status: 400 });
  }

  try {
    const [config, user] = await Promise.all([
      getLemonSqueezyConfig(),
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { email: true, name: true, role: true },
      }),
    ]);
    const variantId = getVariantId(config, plan, billing);

    if (!config.apiKey || !/^\d+$/.test(config.storeId) || !/^\d+$/.test(variantId)) {
      return NextResponse.json({
        error: "Paid plans are not open yet. The secure checkout is still being configured.",
      }, { status: 503 });
    }

    if (config.testMode && user?.role !== "ADMIN") {
      return NextResponse.json({
        error: "Paid plans are still in private testing. Your free early-access account remains active.",
      }, { status: 503 });
    }

    const appUrl = (
      process.env.NEXT_PUBLIC_APP_URL
      || process.env.NEXTAUTH_URL
      || req.nextUrl.origin
    ).replace(/\/$/, "");

    const checkout = await lemonSqueezyRequest<CheckoutResponse>(config, "/checkouts", {
      method: "POST",
      body: JSON.stringify({
        data: {
          type: "checkouts",
          attributes: {
            product_options: {
              redirect_url: `${appUrl}/dashboard/upgrade?checkout=success`,
              enabled_variants: [Number(variantId)],
            },
            checkout_options: {
              embed: false,
              media: true,
              logo: true,
              desc: true,
              discount: true,
              subscription_preview: true,
              button_color: "#7c3aed",
            },
            checkout_data: {
              email: user?.email || undefined,
              name: user?.name || undefined,
              custom: {
                user_id: session.user.id,
                requested_plan: plan,
                billing_interval: billing,
              },
            },
            test_mode: config.testMode,
          },
          relationships: {
            store: { data: { type: "stores", id: config.storeId } },
            variant: { data: { type: "variants", id: variantId } },
          },
        },
      }),
    });

    return NextResponse.json({ url: checkout.data.attributes.url });
  } catch (error) {
    console.error("Lemon Squeezy checkout error:", error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Could not start secure checkout.",
    }, { status: 502 });
  }
}
