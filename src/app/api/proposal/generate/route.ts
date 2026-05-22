import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({
  jobTitle:    z.string().min(1),
  company:     z.string().min(1),
  description: z.string().default(""),
  niche:       z.string().default(""),
});

// ─── Template fallback (zero API cost) ───────────────────────────────────────
function buildTemplate(
  jobTitle: string, company: string, description: string,
  expertiseStr: string, userName: string
): { subject: string; body: string } {
  const descSnippet = description
    .replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim().slice(0, 140);

  const body = `Hi ${company} team,

I came across your ${jobTitle} opportunity and immediately saw the connection with my background in ${expertiseStr}.

${descSnippet ? `Reading through your requirements, I can see exactly what you need — and I have the right experience to deliver it efficiently.` : `This role aligns perfectly with my skills and I'd love the opportunity to contribute.`}

Here's what I bring:
• Deep expertise in ${expertiseStr} with proven results
• Fast, reliable delivery and transparent communication
• Outcome-focused — I measure success by your results, not just hours logged

Would you have 15 minutes for a quick call this week? No pressure — just a conversation to see if there's a fit.

Looking forward to connecting,
${userName}`;

  return {
    subject: `Re: ${jobTitle} — Available ${expertiseStr} specialist`,
    body,
  };
}

// ─── Groq AI call ─────────────────────────────────────────────────────────────
async function callGroq(
  apiKey: string, jobTitle: string, company: string, description: string,
  expertiseStr: string, userName: string, niche: string
): Promise<{ subject: string; body: string } | null> {
  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: `You are an expert freelance proposal writer. Write concise, professional, highly personalized cold outreach emails. Keep under 200 words. Sound human. Focus on the client's specific need.`,
          },
          {
            role: "user",
            content: `Write a freelance proposal for this job:\nJob Title: ${jobTitle}\nCompany: ${company}\nDescription: ${description.replace(/<[^>]+>/g, "").slice(0, 500)}\nFreelancer: ${userName}, expertise in ${expertiseStr || niche}\n\nReturn JSON only:\n{"subject": "compelling subject line", "body": "full proposal under 200 words, warm professional tone"}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 700,
        response_format: { type: "json_object" },
      }),
      signal: AbortSignal.timeout(15000),
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
  // Auth
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Parse
  let rawBody: unknown;
  try { rawBody = await req.json(); } catch { rawBody = {}; }
  const parsed = schema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const { jobTitle, company, description, niche } = parsed.data;

  // Load user + groq key — fully resilient
  let userName = "there";
  let expertiseStr = niche || "freelance services";
  let groqKey = process.env.GROQ_API_KEY ?? "";

  try {
    const { prisma } = await import("@/lib/prisma");
    const [user, setting] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { name: true, expertise: true },
      }),
      prisma.platformSetting.findUnique({ where: { key: "groq_api_key" } }),
    ]);
    if (user?.name) userName = user.name;
    if (user?.expertise) {
      try {
        const exp = JSON.parse(user.expertise) as string[];
        if (exp.length > 0) expertiseStr = exp.slice(0, 3).join(", ");
      } catch { /* ignore */ }
    }
    if (setting?.value && setting.value.length > 10) groqKey = setting.value;
  } catch { /* DB unavailable — use defaults */ }

  // Generate
  let subject: string;
  let body: string;
  let source: "groq" | "template";

  if (groqKey && groqKey.length > 10) {
    const ai = await callGroq(groqKey, jobTitle, company, description, expertiseStr, userName, niche);
    if (ai) {
      ({ subject, body } = ai);
      source = "groq";
    } else {
      ({ subject, body } = buildTemplate(jobTitle, company, description, expertiseStr, userName));
      source = "template";
    }
  } else {
    ({ subject, body } = buildTemplate(jobTitle, company, description, expertiseStr, userName));
    source = "template";
  }

  return NextResponse.json({ subject, body, source });
}
