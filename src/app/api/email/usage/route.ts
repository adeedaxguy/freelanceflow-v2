export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getResolvedOutreachUsage } from "@/lib/outreach-limits";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const usage = await getResolvedOutreachUsage({
    userId: session.user.id,
    sessionPlan: session.user.plan,
    sessionEmail: session.user.email,
  });
  return NextResponse.json({ usage });
}
