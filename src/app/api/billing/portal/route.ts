export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getLemonSqueezyConfig, lemonSqueezyRequest } from "@/lib/lemonsqueezy";

interface SubscriptionResponse {
  data: {
    attributes: {
      urls?: { customer_portal?: string };
    };
  };
}

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const subscription = await prisma.billingSubscription.findFirst({
    where: { userId: session.user.id, provider: "LEMONSQUEEZY" },
    orderBy: { updatedAt: "desc" },
  });
  if (!subscription) {
    return NextResponse.json({ error: "No billing subscription was found for this account." }, { status: 404 });
  }

  try {
    const config = await getLemonSqueezyConfig();
    const response = await lemonSqueezyRequest<SubscriptionResponse>(
      config,
      `/subscriptions/${subscription.externalSubscriptionId}`,
    );
    const url = response.data.attributes.urls?.customer_portal;
    if (!url) throw new Error("The customer portal is not available yet.");
    return NextResponse.json({ url });
  } catch (error) {
    console.error("Lemon Squeezy portal error:", error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Could not open the billing portal.",
    }, { status: 502 });
  }
}
