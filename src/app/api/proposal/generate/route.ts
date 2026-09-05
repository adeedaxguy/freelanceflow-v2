export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUsageStats } from "@/lib/usage";
import { getPlatformSetting } from "@/lib/platform-secrets";
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

I came across your ${jobTitle} posting and it immediately stood out. My background in ${expertiseStr} aligns directly with what you need${descSnippet ? ` — particularly your requirement around ${descSnippet.slice(0, 80).toLowerCase()}` : ""}. I've worked on very similar projects and can hit the ground running from day one.

What you can expect from working with me is proactive communication, clean deliverables, and a results-first mindset. I measure success by the outcomes I create for my clients, not just hours logged.${portfolioSection}

Would you be open to a quick 15-minute call this week to discuss how I can help? No pressure — just a short conversation to see if there's a fit.

Best regards,
${userName}`;

  return {
    subject: `${jobTitle} — Available ${expertiseStr.split(",")[0]!.trim()} specialist`,
    body,
  };
}

// ─── Groq AI call ─────────────────────────────────────────────────────────────
async function callGroq(
  apiKey: string, jobTitle: string, company: string, description: string,
  expertiseStr: string, userName: string, niche: string, portfolioLinks: PortfolioLink[],
): Promise<{ subject: string; body: string } | null> {
  const portfolioInstruction = portfolioLinks.length > 0
    ? `\n\nPortfolio links to embed naturally in paragraph 2:\n${portfolioLinks.map(l => `- ${l.label}: ${l.url}`).join("\n")}`
    : "";

  const cleanDesc = description.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim().slice(0, 600);

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: `You are an elite freelance proposal writer who wins high-value contracts. Write highly personalized, professional cold outreach emails.

Structure rules (non-negotiable):
- Greeting: "Hi [Company] team,"
- Paragraph 1 (3-4 sentences): Show you read and understood their specific need. Reference the job title and one specific detail from the description. Explain why you're a strong match.
- Paragraph 2 (3-4 sentences): Describe the specific results and value you deliver. Be concrete. If portfolio links are provided, embed 1-2 naturally in the text (e.g. "you can see this in my [Label] project at [URL]").
- CTA: One clear, low-friction ask — a 15-min call or quick chat.
- Sign-off: "Best regards,\\n[Name]"

Tone: Warm, confident, professional. No filler phrases. No "I hope this finds you well". No bullet lists in the body. Sound human.
Length: Under 230 words total.
Return JSON only.`,
          },
          {
            role: "user",
            content: `Write a freelance proposal for:

Job Title: ${jobTitle}
Company: ${company}
Description: ${cleanDesc || "General freelance opportunity"}
Freelancer: ${userName}, specialist in ${expertiseStr || niche}${portfolioInstruction}

Return JSON: {"subject": "email subject under 10 words", "body": "full proposal body"}`,
          },
        ],
        temperature: 0.70,
        max_tokens: 900,
        response_format: { type: "json_object" },
      }),
      signal: AbortSignal.timeout(18000),
    });

    if (!res.ok) return null;
    const data = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
    const content = data.choices?.[0]?.message?.content ?? "";
    const parsed = JSON.parse(content) as { subject?: string; body?: string };
    if (parsed.subject && parsed.body) return { subject: parsed.subject, body: parsed.body };
    return null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const usage = await getUsageStats(session.user.id).catch(() => null);
  if (usage?.plan === "free" && usage.trialExpired) {
    return NextResponse.json({ error: "Your 3-day trial has ended. Upgrade to generate new proposals.", upgrade: true }, { status: 403 });
  }

  let rawBody: unknown;
  try { rawBody = await req.json(); } catch { rawBody = {}; }
  const parsed = schema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const { jobTitle, company, description, niche, portfolioLinks: incomingLinks } = parsed.data;

  let userName = "there";
  let expertiseStr = niche || "freelance services";
  let groqKey = process.env.GROQ_API_KEY ?? "";
  let savedLinks: PortfolioLink[] = [];

  try {
    const { prisma } = await import("@/lib/prisma");
    const [user, setting] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { name: true, expertise: true },
      }),
      getPlatformSetting("groq_api_key"),
    ]);
    if (user?.name) userName = user.name;
    if (user?.expertise) {
      try {
        const exp = JSON.parse(user.expertise) as string[];
        if (exp.length > 0) expertiseStr = exp.slice(0, 3).join(", ");
      } catch { /* ignore */ }
    }
    if (setting.length > 10) groqKey = setting;

    // Load saved portfolio links from profile if none passed in
    if (incomingLinks.length === 0) {
      try {
        const userRow = await prisma.user.findUnique({
          where: { id: session.user.id },
          select: { portfolioLinks: true },
        });
        const raw = userRow?.portfolioLinks;
        if (raw) savedLinks = JSON.parse(raw) as PortfolioLink[];
      } catch { /* non-fatal */ }
    }
  } catch { /* DB unavailable */ }

  const portfolioLinks: PortfolioLink[] = incomingLinks.length > 0 ? incomingLinks : savedLinks;

  let subject: string;
  let body: string;
  let source: "groq" | "template";

  if (groqKey && groqKey.length > 10) {
    const ai = await callGroq(groqKey, jobTitle, company, description, expertiseStr, userName, niche, portfolioLinks);
    if (ai) {
      ({ subject, body } = ai);
      source = "groq";
    } else {
      ({ subject, body } = buildTemplate(jobTitle, company, description, expertiseStr, userName, portfolioLinks));
      source = "template";
    }
  } else {
    ({ subject, body } = buildTemplate(jobTitle, company, description, expertiseStr, userName, portfolioLinks));
    source = "template";
  }

  return NextResponse.json({ subject, body, source });
}
