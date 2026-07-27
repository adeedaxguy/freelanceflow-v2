import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUsageStats } from "@/lib/usage";
import { NextResponse } from "next/server";

const UNLIMITED_EMAILS = new Set([
  "adeedaxguy@gmail.com",
  "adnan@technodigg.com",
  "adnanaimanager@gmail.com",
]);

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userEmail = (session.user.email ?? "").toLowerCase();
  if (UNLIMITED_EMAILS.has(userEmail)) {
    return NextResponse.json({
      plan: "agency", limit: 99999, used: 0, remaining: 99999,
      nextReset: new Date(Date.now() + 7 * 86_400_000).toISOString(),
      percentage: 0, unlimited: true, bonusLeads: 0, shareBonusClaimed: false,
    });
  }

  try {
    const stats = await getUsageStats(session.user.id);
    if (!stats) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(stats);
  } catch {
    return NextResponse.json({ error: "Usage data unavailable" }, { status: 503 });
  }
}
