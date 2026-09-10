export const dynamic = 'force-dynamic';
export const maxDuration = 60;

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getTrialAccessError } from "@/lib/trial-access";
import { generateProposalAI } from "@/lib/proposal-ai";
import { recordAuditLog } from "@/lib/audit-log";
import { rateLimitHeaders, securityRateLimit } from "@/lib/security-rate-limit";
import { z } from "zod";

const schema = z.object({
  jobTitle:       z.string().trim().min(1).max(200),
  company:        z.string().trim().min(1).max(160),
  description:    z.string().max(10_000).default(""),
  niche:          z.string().trim().max(120).default(""),
  portfolioLinks: z.array(z.object({
    label: z.string().trim().min(1).max(100),
    url: z.string().trim().url().max(500),
  })).max(10).optional().default([]),
});

interface PortfolioLink { label: string; url: string; }

// ─── Template fallback ────────────────────────────────────────────────────────
function buildTemplate(
  jobTitle: string, company: string, description: string,
  expertiseStr: string, userName: string, portfolioLinks: PortfolioLink[],
): { subject: string; body: string } {
  const descSnippet = description
    .replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim().slice(0, 160);

  const portfolioSection = portfolioLinks.length > 0
    ? `\n\nHere are a few relevant examples of my work:\n${portfolioLinks.map(l => `  • ${l.label}: ${l.url}`).join("\n")}`
    : "";

  const body = `Hi ${company} team,

I'm interested in your ${jobTitle} opportunity.${descSnippet ? ` I noted this detail in the listing: "${descSnippet}".` : ""}

[Add one relevant example of your own work in ${expertiseStr}, and explain how it relates to this role.]${portfolioSection}

What would be the best next step to discuss the requirements?

Best regards,
${userName}`;

  return {
    subject: `Regarding ${jobTitle}`,
    body,
  };
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const accessError = await getTrialAccessError(session.user.id);
  if (accessError) return NextResponse.json(accessError, { status: accessError.status });

  let rawBody: unknown;
  try { rawBody = await req.json(); } catch { rawBody = {}; }
  const parsed = schema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const { jobTitle, company, description, niche, portfolioLinks: incomingLinks } = parsed.data;
  const limit = await securityRateLimit("proposal-generate", session.user.id, 15, 60_000);
  if (!limit.allowed) return NextResponse.json({ error: "Too many generations. Please wait a minute before trying again." }, { status: 429, headers: rateLimitHeaders(limit) });

  let userName = "[Your name]";
  let expertiseStr = niche || "freelance services";
  let savedLinks: PortfolioLink[] = [];

  try {
    const { prisma } = await import("@/lib/prisma");
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { name: true, expertise: true },
      });
    if (user?.name) userName = user.name;
    if (user?.expertise) {
      try {
        const exp = JSON.parse(user.expertise) as string[];
        if (exp.length > 0) expertiseStr = exp.slice(0, 3).join(", ");
      } catch { /* ignore */ }
    }

    // Load saved portfolio links from profile if none passed in
    if (incomingLinks.length === 0) {
      try {
        const userRow = await prisma.user.findUnique({
          where: { id: session.user.id },
          select: { portfolioLinks: true },
        });
        const raw = userRow?.portfolioLinks;
        if (raw) {
          const links = schema.shape.portfolioLinks.safeParse(JSON.parse(raw));
          if (links.success) savedLinks = links.data;
        }
      } catch { /* non-fatal */ }
    }
  } catch { /* DB unavailable */ }

  const portfolioLinks: PortfolioLink[] = incomingLinks.length > 0 ? incomingLinks : savedLinks;

  const ai = await generateProposalAI({ jobTitle, company, description, expertise: expertiseStr, userName, portfolioLinks });
  if (!ai.proposal) {
    await recordAuditLog({ action: "proposal_ai_fallback", actorId: session.user.id, details: { failures: ai.failures } });
  }
  const proposal = ai.proposal || buildTemplate(jobTitle, company, description, expertiseStr, userName, portfolioLinks);
  return NextResponse.json({ ...proposal, source: ai.source, ...(ai.proposal ? {} : { warning: "AI is temporarily unavailable. This editable starting draft is not AI-generated. Replace bracketed details with your own verified experience before using it." }) });
}
