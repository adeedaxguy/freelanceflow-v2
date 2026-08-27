export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { getUsageStats } from "@/lib/usage";
import { z } from "zod";

const schema = z.object({
  company:   z.string().min(1),
  domain:    z.string().optional().default(""),
  niche:     z.string().optional().default(""),
  title:     z.string().optional().default(""),
  notes:     z.string().optional().default(""),
  expertise: z.array(z.string()).optional().default([]),
  tone:      z.enum(["professional", "casual", "bold"]).optional().default("professional"),
});

function buildFallbackProposal(company: string, niche: string, expertise: string[]): string {
  const exp = expertise.length > 0 ? expertise.join(", ") : "web development and digital marketing";
  return `Hi,

I came across ${company} and was genuinely impressed by what you're building. I specialize in ${exp}${niche ? ` — particularly within the ${niche} space` : ""}, and I see a clear opportunity to help.

Here's what I can bring to the table:
— Faster delivery with measurable results you can track
— A focused approach built around ${company}'s specific goals
— No fluff — just high-quality work that moves the needle

I've helped similar companies grow their presence significantly, and I'd love to show you how I can do the same for ${company}.

Would you be open to a quick 15-minute call this week? No pitch — just a conversation to see if there's a fit.

Looking forward to connecting,
[Your Name]`;
}

function buildSystemPrompt(expertise: string[], tone: string): string {
  const exp = expertise.length > 0 ? expertise.join(", ") : "freelance services";
  const toneGuide =
    tone === "casual"  ? "Warm and conversational — friendly yet professional." :
    tone === "bold"    ? "Confident and bold — direct, no fluff, high-value energy." :
                         "Polished and professional — respectful, businesslike.";
  return `You are an expert freelance proposal writer. Write highly personalized, conversion-focused cold outreach emails.

Freelancer expertise: ${exp}
Tone: ${toneGuide}

Rules:
- Under 180 words
- No generic openers like "I hope this email finds you well"
- Show you know their company in the first sentence
- 2-3 specific benefits (not features)
- End with a low-friction CTA (15-min call)
- Return ONLY the proposal body — no subject line, no commentary`;
}

async function callGroqAPI(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string
): Promise<string | null> {
  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user",   content: userPrompt },
        ],
        max_tokens: 400,
        temperature: 0.75,
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) return null;
    const data = await res.json() as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    return data.choices?.[0]?.message?.content?.trim() ?? null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const usage = await getUsageStats(session.user.id).catch(() => null);
  if (usage?.plan === "free" && usage.trialExpired) {
    return NextResponse.json({ error: "Your 3-day trial has ended. Upgrade to generate new proposals.", upgrade: true }, { status: 403 });
  }

  // Rate limit: 15 proposal generations per minute per user
  const rl = rateLimit(`proposal:${session.user.id}`, 15, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: `Rate limit exceeded. Try again in ${rl.resetInSeconds}s.` },
      { status: 429, headers: { "Retry-After": String(rl.resetInSeconds) } }
    );
  }

  let body: unknown;
  try { body = await req.json(); } catch { body = {}; }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }

  const { company, niche, title, notes, expertise, tone } = parsed.data;

  // Hydrate expertise from user profile if not supplied
  let userExpertise = expertise;
  if (userExpertise.length === 0) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { expertise: true },
      });
      if (user?.expertise) {
        userExpertise = JSON.parse(user.expertise) as string[];
      }
    } catch { /* ignore */ }
  }

  // Resolve Groq key: DB setting first, then env
  let groqKey = process.env.GROQ_API_KEY ?? "";
  try {
    const setting = await prisma.platformSetting.findUnique({ where: { key: "groq_api_key" } });
    if (setting?.value && setting.value.length > 10) groqKey = setting.value;
  } catch { /* use env key */ }

  // If no key → high-quality template
  if (!groqKey || groqKey.length < 10) {
    return NextResponse.json({ proposal: buildFallbackProposal(company, niche, userExpertise), source: "template" });
  }

  const contextParts = [`Company: ${company}`];
  if (niche) contextParts.push(`Industry/Niche: ${niche}`);
  if (title) contextParts.push(`Job/Role posted: ${title}`);
  if (notes) contextParts.push(`Extra context: ${notes}`);

  const userPrompt = `Write a personalized cold outreach proposal for:\n\n${contextParts.join("\n")}\n\nMake it compelling and specific.`;

  const generated = await callGroqAPI(
    groqKey,
    buildSystemPrompt(userExpertise, tone),
    userPrompt
  );

  const proposal = generated ?? buildFallbackProposal(company, niche, userExpertise);
  return NextResponse.json({ proposal, source: generated ? "groq" : "template" });
}
