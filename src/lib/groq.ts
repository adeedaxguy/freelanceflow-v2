/**
 * Groq API client — free tier, no credit card needed.
 * Sign up at https://console.groq.com → API Keys → Create key
 * Free: 14,400 requests/day with llama-3.3-70b-versatile
 */

export interface ProposalInput {
  jobTitle:    string;
  company:     string;
  description: string;
  expertise:   string[];
  userBio:     string;
  userName:    string;
  niche:       string;
  rate?:       number;
}

export interface ProposalOutput {
  subject: string;
  body:    string;
  source:  "groq" | "template";
}

// ─── Template-based fallback (zero cost, no API needed) ──────────────────────
function buildTemplateProposal(input: ProposalInput): ProposalOutput {
  const { jobTitle, company, description, userName, expertise, niche, rate } = input;
  const expertiseStr = expertise.slice(0, 3).join(", ") || niche;
  const rateStr = rate ? `My rate is $${rate}/hr` : "My rates are flexible";

  // Extract key detail from description (first 120 chars)
  const descSnippet = description
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);

  const openers = [
    `I came across your posting for ${jobTitle} and I'm confident I can deliver exactly what you need.`,
    `Your ${jobTitle} role caught my attention — it aligns perfectly with my background in ${expertiseStr}.`,
    `I've been working in ${expertiseStr} for several years and your ${jobTitle} position is a great fit.`,
  ];
  const opener = openers[Math.floor(Math.random() * openers.length)] ?? openers[0]!;

  const body = `Hi ${company} team,

${opener}

From what I've read: "${descSnippet}..." — I understand exactly what you need and I have the right experience to get it done efficiently.

What I bring to the table:
• Proven expertise in ${expertiseStr}
• Fast turnaround and clear communication
• Results-driven approach — I focus on outcomes, not just deliverables

${input.userBio ? `A bit about me: ${input.userBio.slice(0, 200)}` : `I specialize in ${niche} and have helped clients achieve measurable results.`}

${rateStr} and I'm available to start immediately.

I'd love to jump on a quick call to discuss your project. Would you have 15 minutes this week?

Looking forward to hearing from you,
${userName}`;

  return {
    subject: `Re: ${jobTitle} — Experienced ${expertiseStr} specialist ready to start`,
    body,
    source: "template",
  };
}

// ─── Groq AI (free tier) ─────────────────────────────────────────────────────
export async function generateProposal(input: ProposalInput): Promise<ProposalOutput> {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    // Graceful fallback — still produces a solid personalised proposal
    return buildTemplateProposal(input);
  }

  const { jobTitle, company, description, userName, expertise, niche, userBio, rate } = input;

  const systemPrompt = `You are an expert freelance proposal writer. Write concise, professional, and highly personalized proposals that get responses. Keep proposals under 250 words. Always sound human, not like AI. Focus on the client's specific problem, not generic skills.`;

  const userPrompt = `Write a freelance proposal for this job:

Job Title: ${jobTitle}
Company: ${company}
Job Description: ${description.replace(/<[^>]+>/g, "").slice(0, 600)}

Freelancer Profile:
- Name: ${userName}
- Expertise: ${expertise.join(", ") || niche}
- Bio: ${userBio || `Specialist in ${niche}`}
- Rate: ${rate ? `$${rate}/hr` : "competitive"}

Return JSON only:
{
  "subject": "compelling email subject line",
  "body": "full proposal email body (under 250 words, professional but warm tone)"
}`;

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type":  "application/json",
      },
      body: JSON.stringify({
        model:       "llama-3.3-70b-versatile",
        messages:    [
          { role: "system", content: systemPrompt },
          { role: "user",   content: userPrompt },
        ],
        temperature:    0.7,
        max_tokens:     800,
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) return buildTemplateProposal(input);

    const data = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
    const content = data.choices?.[0]?.message?.content ?? "";
    const parsed = JSON.parse(content) as { subject?: string; body?: string };

    if (parsed.subject && parsed.body) {
      return { subject: parsed.subject, body: parsed.body, source: "groq" };
    }
    return buildTemplateProposal(input);
  } catch {
    return buildTemplateProposal(input);
  }
}

// ─── Support chatbot (same Groq free tier) ───────────────────────────────────
export async function supportChat(
  messages: Array<{ role: "user" | "assistant"; content: string }>
): Promise<{ reply: string; shouldCreateTicket: boolean }> {
  const apiKey = process.env.GROQ_API_KEY;

  const systemPrompt = `You are a helpful support agent for iCloseLeads — an AI-powered lead generation SaaS for freelancers.

iCloseLeads features:
- Find Leads: searches RemoteOK, Remotive, Reddit for real job postings in the last 48h
- AI Proposals: generates personalised proposals using your profile
- Campaigns: manage outreach sequences
- Templates: save and reuse proposal templates
- Analytics: track open rates and responses

Common issues and fixes:
- "No leads found" → Try extending to "Last 7 days" or pick a different niche
- "AI proposal not working" → Check that GROQ_API_KEY is set in .env (free at console.groq.com)
- "Can't log in" → Try resetting password; check email/password are correct
- "Lead limit reached" → Upgrade to Pro for 500 leads/week
- "Email not sending" → Verify RESEND_API_KEY is set and domain is verified at resend.com

Answer helpfully and concisely. If you cannot resolve the issue after 2 exchanges, say: "ESCALATE: [brief description of issue]" so a ticket can be raised.`;

  if (!apiKey) {
    const last = messages[messages.length - 1];
    return {
      reply: `Thanks for reaching out! Our AI assistant isn't configured yet. Please email support@icloseleads.com and we'll get back to you within 24 hours.\n\nYour message: "${last?.content ?? ""}"`,
      shouldCreateTicket: true,
    };
  }

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type":  "application/json",
      },
      body: JSON.stringify({
        model:       "llama-3.3-70b-versatile",
        messages:    [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        temperature: 0.4,
        max_tokens:  400,
      }),
    });

    if (!res.ok) throw new Error("Groq error");

    const data = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
    const reply = data.choices?.[0]?.message?.content ?? "I'm having trouble right now. Please try again or email support@icloseleads.com";
    const shouldCreateTicket = reply.includes("ESCALATE:");

    return { reply: reply.replace("ESCALATE:", "").trim(), shouldCreateTicket };
  } catch {
    return {
      reply: "I'm having a technical issue. Please email support@icloseleads.com and we'll help you right away.",
      shouldCreateTicket: true,
    };
  }
}
