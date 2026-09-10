export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getResolvedOutreachUsage } from "@/lib/outreach-limits";
import { getUsageStats } from "@/lib/usage";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const account = await getUsageStats(session.user.id);
    if (!account) return NextResponse.json({ error: "Account not found" }, { status: 404 });
    const usage = await getResolvedOutreachUsage({
      userId: session.user.id,
      sessionPlan: session.user.plan,
      sessionEmail: session.user.email,
    });
    return NextResponse.json({ usage: {
      ...usage,
      remainingToday: account.trialExpired ? 0 : usage.remainingToday,
      remainingThisMonth: account.trialExpired ? 0 : usage.remainingThisMonth,
      trialExpired: account.trialExpired,
      trialEndsAt: account.trialEndsAt,
    } });
  } catch {
    return NextResponse.json({ error: "Usage data unavailable. Please try again." }, { status: 503 });
  }
}
