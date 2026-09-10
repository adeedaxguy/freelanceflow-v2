import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateProposalAI } from "@/lib/proposal-ai";
import { securityRateLimit } from "@/lib/security-rate-limit";
export const maxDuration = 60;

export async function POST() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN" || !session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const limit = await securityRateLimit("ai-diagnostic", session.user.id, 3, 60_000);
  if (!limit.allowed) return NextResponse.json({ error: "Wait a minute before testing again." }, { status: 429 });
  const result = await generateProposalAI({ jobTitle: "React developer", company: "QA Example", description: "Build an accessible React booking form with validation and automated tests.", expertise: "React", userName: "QA", portfolioLinks: [] });
  return NextResponse.json({ connected: Boolean(result.proposal), provider: result.source, failures: result.failures });
}
