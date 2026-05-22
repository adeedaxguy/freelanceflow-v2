import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { z } from "zod";

const schema = z.object({
  replyText:    z.string().min(1, "Reply text required"),
  company:      z.string().optional().default(""),
  originalBody: z.string().optional().default(""),
  niche:        z.string().optional().default(""),
});

type Intent = "interested" | "objection" | "price" | "timing" | "referral" | "not_right_fit" | "more_info" | "positive";

interface IntentResult { intent: Intent; label: string; emoji: string; confidence: number; }

// ─── Intent detection ─────────────────────────────────────────────────────────
function detectIntent(text: string): IntentResult {
  const lower = text.toLowerCase();
  const patterns: Array<{ intent: Intent; emoji: string; label: string; keywords: string[] }> = [
    { intent: "interested",    emoji: "🔥", label: "Highly Interested",
      keywords: ["interested", "love to", "let's chat", "book", "schedule", "call", "meeting", "sounds good", "great idea", "perfect", "yes", "definitely", "absolutely", "let's do it"] },
    { intent: "price",        emoji: "💰", label: "Price Objection",
      keywords: ["too expensive", "budget", "cost", "price", "afford", "cheaper", "discount", "what do you charge", "costly", "rate", "how much"] },
    { intent: "timing",       emoji: "⏰", label: "Timing Issue",
      keywords: ["not right now", "later", "next month", "next quarter", "busy", "current project", "already have", "few months", "hold off", "wait"] },
    { intent: "not_right_fit",emoji: "❌", label: "Not a Fit",
      keywords: ["not a fit", "different direction", "no thanks", "not interested", "pass", "don't need", "already have someone", "in-house", "internal team", "going another"] },
    { intent: "more_info",    emoji: "📋", label: "Wants More Info",
      keywords: ["tell me more", "more information", "portfolio", "examples", "case study", "past work", "experience", "how does", "what exactly", "details", "learn more", "can you share"] },
    { intent: "referral",     emoji: "👥", label: "Referred Someone",
      keywords: ["colleague", "team member", "my boss", "forwarded", "cc", "refer", "passing along", "copied"] },
    { intent: "objection",    emoji: "🤔", label: "Has Objections",
      keywords: ["not sure", "concern", "worried", "however", "but", "challenge", "issue", "problem", "don't think", "not convinced", "skeptical"] },
    { intent: "positive",     emoji: "👍", label: "Positive Response",
      keywords: ["thank you", "thanks", "appreciate", "helpful", "useful", "good point", "nice", "well written"] },
  ];
  for (const p of patterns) {
    const hits = p.keywords.filter(kw => lower.includes(kw));
    if (hits.length > 0) {
      return { intent: p.intent, label: p.label, emoji: p.emoji, confidence: Math.min(95, 60 + hits.length * 12) };
    }
  }
  return { intent: "more_info", label: "Needs Follow-Up", emoji: "📬", confidence: 50 };
}

// ─── Template replies ─────────────────────────────────────────────────────────
function buildTemplateReply(intent: Intent, company: string, userName: string, niche: string): { subject: string; body: string } {
  const co  = company || "your team";
  const exp = niche || "my services";

  const map: Record<Intent, { subject: string; body: string }> = {
    interested: {
      subject: "Re: Let's find a time to connect",
      body: `Hi,\n\nGreat to hear from you! I'd love to set up a quick call to learn more about ${co}'s needs and show you exactly how I can help.\n\nHere are a few times that work:\n• Tuesday 10–11 AM\n• Wednesday 2–3 PM  \n• Thursday 9–10 AM\n\nJust reply with what works — or send a time that suits you.\n\nLooking forward to connecting!\n${userName}`,
    },
    price: {
      subject: `Re: Investment & ROI breakdown for ${co}`,
      body: `Hi,\n\nCompletely understand — budget is always a key factor.\n\nHere's what I can offer to make this work:\n• A smaller pilot project to demonstrate value first\n• Milestone-based payments (pay as we go)\n• Flexible retainer rates for ongoing work\n\nFor context, clients I've worked with in ${exp} typically see ROI within 60–90 days. The investment pays for itself.\n\nWould a scaled-down scope be a good starting point?\n\n${userName}`,
    },
    timing: {
      subject: "Re: Circling back when timing is right",
      body: `Hi,\n\nNo problem at all — timing is everything. I appreciate you letting me know.\n\nI'll follow up in a few weeks. In the meantime, feel free to reach out whenever the timing works better for ${co}.\n\nI'll keep an eye on what you're building — genuinely exciting work!\n\n${userName}`,
    },
    objection: {
      subject: "Re: Let me address your concerns directly",
      body: `Hi,\n\nThank you for being honest — I really appreciate it. Let me speak to your concerns directly:\n\n→ You own everything I deliver (code, copy, designs)\n→ Clear milestones, so you always see progress\n→ First deliverable comes with a satisfaction guarantee\n\nWould it help to start with a small, low-risk project so you can evaluate the quality before committing to anything larger?\n\n${userName}`,
    },
    more_info: {
      subject: "Re: Here's more about my work",
      body: `Hi,\n\nHappy to share more — great question.\n\nHow I'd approach ${co}'s project:\n1. Discovery call (30 min) to understand your goals\n2. Proposal with clear timeline and deliverables\n3. Milestone delivery with regular updates\n4. Revisions + final handoff\n\nI can also send a custom proposal if you share a bit more about what you're trying to achieve. What's the main outcome you're hoping for?\n\n${userName}`,
    },
    referral: {
      subject: "Re: Thank you for the introduction",
      body: `Hi,\n\nThank you for connecting us — really appreciate it!\n\nI'll follow up with [name] directly. For context, I specialize in ${exp} and have helped companies similar to ${co} achieve meaningful results.\n\nIf there's anything specific you'd like me to address in that conversation, just let me know.\n\nAppreciate the referral!\n${userName}`,
    },
    not_right_fit: {
      subject: "Re: Understood — keeping the door open",
      body: `Hi,\n\nNo worries at all — I appreciate you taking the time to respond. Genuinely helpful to know.\n\nIf things change down the road, or if you know someone who could use help with ${exp}, I'd love the introduction.\n\nBest of luck with what you're building at ${co} — it's impressive work!\n\n${userName}`,
    },
    positive: {
      subject: "Re: Great to connect — next step?",
      body: `Hi,\n\nThank you — really appreciate the kind words!\n\nI'd love to explore how I might be able to help ${co} with ${exp}. Even a 15-minute intro call would be a great way to get acquainted.\n\nWould you be open to a quick chat sometime this week?\n\n${userName}`,
    },
  };

  return map[intent];
}

// ─── Groq AI call ─────────────────────────────────────────────────────────────
async function callGroqReply(
  apiKey: string, intent: Intent, intentLabel: string,
  replyText: string, originalBody: string, company: string, userName: string, niche: string
): Promise<{ subject: string; body: string } | null> {
  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: "You are an expert freelance sales closer. Write concise, persuasive email replies that move deals forward. Under 180 words. Sound human and confident." },
          { role: "user", content: `Freelancer: ${userName} | Niche: ${niche || "freelance"} | Company: ${company}\n\nDetected intent: ${intentLabel}\n\nOriginal proposal:\n${originalBody.slice(0, 400)}\n\nClient reply:\n${replyText.slice(0, 500)}\n\nWrite a reply that advances this deal given the "${intentLabel}" intent.\nReturn JSON: {"subject":"...","body":"..."}` },
        ],
        temperature: 0.7, max_tokens: 500, response_format: { type: "json_object" },
      }),
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return null;
    const data = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
    const parsed = JSON.parse(data.choices?.[0]?.message?.content ?? "{}") as { subject?: string; body?: string };
    if (parsed.subject && parsed.body) return { subject: parsed.subject, body: parsed.body };
    return null;
  } catch { return null; }
}

// ─── Route handler ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Rate limit: 20 AI calls per minute per user
  const rl = rateLimit(`reply:${session.user.id}`, 20, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: `Rate limit exceeded. Try again in ${rl.resetInSeconds}s.` },
      { status: 429, headers: { "Retry-After": String(rl.resetInSeconds) } }
    );
  }

  let rawBody: unknown;
  try { rawBody = await req.json(); } catch { rawBody = {}; }

  const parsed = schema.safeParse(rawBody);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });

  const { replyText, company, originalBody, niche } = parsed.data;
  const { intent, label: intentLabel, emoji, confidence } = detectIntent(replyText);

  let userName = "there";
  let groqKey  = process.env.GROQ_API_KEY ?? "";
  try {
    const { prisma } = await import("@/lib/prisma");
    const [user, setting] = await Promise.all([
      prisma.user.findUnique({ where: { id: session.user.id }, select: { name: true } }),
      prisma.platformSetting.findUnique({ where: { key: "groq_api_key" } }),
    ]);
    if (user?.name) userName = user.name;
    if (setting?.value && setting.value.length > 10) groqKey = setting.value;
  } catch { /* defaults */ }

  let subject: string; let body: string; let source: "groq" | "template";

  if (groqKey && groqKey.length > 10) {
    const ai = await callGroqReply(groqKey, intent, intentLabel, replyText, originalBody, company, userName, niche);
    if (ai) { subject = ai.subject; body = ai.body; source = "groq"; }
    else { ({ subject, body } = buildTemplateReply(intent, company, userName, niche)); source = "template"; }
  } else {
    ({ subject, body } = buildTemplateReply(intent, company, userName, niche));
    source = "template";
  }

  return NextResponse.json({ subject, body, source, intent, intentLabel, intentEmoji: emoji, confidence });
}
