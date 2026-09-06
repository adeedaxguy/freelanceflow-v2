export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getLemonSqueezyConfig, lemonSqueezyRequest } from "@/lib/lemonsqueezy";
import { getPaddleConfig, paddleRequest } from "@/lib/paddle";
import { createStripeBillingPortalSession, getStripeConfig } from "@/lib/stripe";

interface SubscriptionResponse {
  data: {
    attributes: {
      urls?: { customer_portal?: string };
    };
  };
}

interface PaddlePortalResponse {
  data: {
    urls: { general: { overview: string } };
  };
}

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const subscription = await prisma.billingSubscription.findFirst({
    where: { userId: session.user.id, testMode: false, plan: { in: ["pro", "agency"] } },
    orderBy: { updatedAt: "desc" },
  });
  if (!subscription) {
    return NextResponse.json({ error: "No billing subscription was found for this account." }, { status: 404 });
  }

  try {
    if (subscription.provider === "STRIPE") {
      if (!subscription.externalCustomerId) {
        throw new Error("The customer portal is not available yet.");
      }
      const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://icloseleads.com").replace(/\/$/, "");
      const response = await createStripeBillingPortalSession(await getStripeConfig(), {
        customerId: subscription.externalCustomerId,
        returnUrl: `${appUrl}/dashboard/upgrade`,
      });
      return NextResponse.json({ url: response.url });
    }

    if (subscription.provider === "PADDLE") {
      if (!subscription.externalCustomerId) {
        throw new Error("The customer portal is not available yet.");
      }
      const config = getPaddleConfig();
      const response = await paddleRequest<PaddlePortalResponse>(
        config,
        `/customers/${subscription.externalCustomerId}/portal-sessions`,
        {
          method: "POST",
          body: JSON.stringify({ subscription_ids: [subscription.externalSubscriptionId] }),
        },
      );
      return NextResponse.json({ url: response.data.urls.general.overview });
    }

    const config = await getLemonSqueezyConfig();
    const response = await lemonSqueezyRequest<SubscriptionResponse>(
      config,
      `/subscriptions/${subscription.externalSubscriptionId}`,
    );
    const url = response.data.attributes.urls?.customer_portal;
    if (!url) throw new Error("The customer portal is not available yet.");
    return NextResponse.json({ url });
  } catch (error) {
    console.error("Billing portal error:", error);
    return NextResponse.json({
      error: "Could not open the billing portal. Please try again.",
    }, { status: 502 });
  }
}
