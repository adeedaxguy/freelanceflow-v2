export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getConversionReport } from "@/lib/conversion-report";
import { getStripeConfig, stripeRequest } from "@/lib/stripe";
import { monthlyBaseAmount, type RecurringItem } from "@/lib/revenue-metrics";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !["ADMIN", "MANAGER"].includes(session.user.role ?? "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const report = await getConversionReport();
    let baseMrr: number | null = null;
    let stripeError: string | null = null;
    const planCounts: Record<string, number> = { pro: 0, agency: 0 };
    const customers = new Set<string>();
    for (const sub of [...report.liveSubscriptions].sort((a, b) => Number(b.plan === "agency") - Number(a.plan === "agency"))) {
      if (customers.has(sub.userId)) continue;
      customers.add(sub.userId);
      planCounts[sub.plan] = (planCounts[sub.plan] ?? 0) + 1;
    }
    try {
      const config = await getStripeConfig();
      if (!config.secretKey || config.testMode) throw new Error("Live Stripe data is unavailable.");
      const known = new Set(report.liveSubscriptions.filter(s => s.provider === "STRIPE").map(s => s.externalSubscriptionId));
      const found = new Set<string>();
      let cursor = "";
      let total = 0;
      let finished = false;
      for (let page = 0; page < 3; page++) {
        const query = new URLSearchParams({ status: "active", limit: "100" });
        if (cursor) query.set("starting_after", cursor);
        const result = await stripeRequest<{
          data: Array<{ id: string; livemode: boolean; items: { data: RecurringItem[] } }>;
          has_more: boolean;
        }>(config, `/subscriptions?${query}`);
        for (const sub of result.data) {
          if (!sub.livemode || !known.has(sub.id)) continue;
          found.add(sub.id);
          const amount = monthlyBaseAmount(sub.items.data);
          if (amount === null) throw new Error("Some subscription prices cannot be compared in USD.");
          total += amount;
        }
        if (!result.has_more) { finished = true; break; }
        cursor = result.data.at(-1)?.id ?? "";
        if (!cursor) break;
      }
      if (!finished) throw new Error("Stripe returned more subscriptions than this report can safely load.");
      if (found.size !== known.size) throw new Error("Recorded subscriptions do not match Stripe.");
      baseMrr = Math.round(total * 100) / 100;
    } catch {
      stripeError = "Stripe amounts are unavailable. Subscription counts below come from recorded live webhooks, not plan labels.";
    }
    const { liveSubscriptions, ...metrics } = report;
    return NextResponse.json({
      ...metrics, baseMrr, stripeError, planCounts,
      subscribers: customers.size,
      duplicateSubscriptions: liveSubscriptions.length - customers.size,
    });
  } catch (error) {
    console.error("[revenue-report]", error);
    return NextResponse.json({ error: "Unable to load revenue data. Please retry." }, { status: 503 });
  }
}
