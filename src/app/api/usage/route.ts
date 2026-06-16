import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUsageStats } from "@/lib/usage";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const stats = await getUsageStats(session.user.id);
  if (!stats) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(stats);
}
