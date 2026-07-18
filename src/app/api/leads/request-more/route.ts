import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { notifyMoreLeadsRequest } from "@/lib/admin-notifications";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const SOURCE_LABELS: Record<string, string> = {
  "local-leads": "Local Business Leads",
  "live-jobs": "Live Jobs",
  "remote-leads": "Remote Jobs",
};

const schema = z.object({
  source:      z.string().min(1).max(60).optional().default("general"),
  message:     z.string().max(1000).optional().default(""),
  currentPlan: z.string().max(40).optional(),
});

function parseClaimed(value: string | null | undefined): string[] {
  try {
    const parsed = JSON.parse(value ?? "[]") as unknown;
    return Array.isArray(parsed) ? parsed.filter((entry): entry is string => typeof entry === "string") : [];
  } catch {
    return [];
  }
}

function hasValidatedShareClaim(claimed: string[]) {
  return claimed.some((entry) => entry === "share" || entry.startsWith("share:") || entry.startsWith("share-proof:"));
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const limit = rateLimit(`more-leads:${session.user.id}`, 2, 10 * 60_000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: `Request already received. Try again in ${limit.resetInSeconds}s.` },
      { status: 429 },
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id:           true,
      name:         true,
      email:        true,
      plan:         true,
      weeklyLeads:  true,
      bonusLeads:   true,
      bonusClaimed: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const source = parsed.data.source;
  const plan = (user.plan || parsed.data.currentPlan || "free").toLowerCase();
  const claimed = parseClaimed(user.bonusClaimed);

  if (plan === "free" && ((user.bonusLeads ?? 0) < 300 || !hasValidatedShareClaim(claimed))) {
    return NextResponse.json(
      { error: "Claim your share bonus first, then request more leads." },
      { status: 403 },
    );
  }

  try {
    await notifyMoreLeadsRequest({
      userId:       user.id,
      name:         user.name,
      email:        user.email,
      plan:         user.plan,
      source:       SOURCE_LABELS[source] ?? source,
      message:      parsed.data.message,
      weeklyLeads:  user.weeklyLeads,
      bonusLeads:   user.bonusLeads,
      claimSummary: claimed.slice(0, 12),
    });

    return NextResponse.json({
      success: true,
      message: "Request sent. We will review it and reach out.",
    });
  } catch (error) {
    console.error("[leads/request-more]", error);
    return NextResponse.json({ error: "Could not send request. Please try again." }, { status: 502 });
  }
}
