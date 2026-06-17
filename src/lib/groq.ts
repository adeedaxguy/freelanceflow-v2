/**
 * Optional Groq API client.
 * The app still generates useful proposals and support replies without a key.
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

// ─── Support chatbot with zero-cost local fallback ───────────────────────────
function cleanSupportText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function extractTopic(message: string): string {
  const quoted = message.match(/"([^"]{3,90})"/)?.[1] ?? message.match(/'([^']{3,90})'/)?.[1];
  if (quoted) return cleanSupportText(quoted);
  const afterFor = message.match(/\b(?:for|about|on)\s+(.{3,90})$/i)?.[1];
  return cleanSupportText(afterFor ?? message).slice(0, 90);
}

function buildLocalContentDraft(message: string): string {
  const topic = extractTopic(message);
  const service = /seo/i.test(message) ? "SEO and local search" :
    /meta|facebook|ads/i.test(message) ? "Meta ads and lead generation" :
    /web|website|wordpress|shopify|design/i.test(message) ? "website and conversion work" :
    /copy|email/i.test(message) ? "copywriting and outreach" :
    "freelance services";

  return `Here is a clean draft you can adapt:

Subject: Quick idea for ${topic || "your business"}

Hi there,

I noticed ${topic || "your business"} and saw a practical opportunity to improve how new customers find and trust you online. I work on ${service}, and the reason I am reaching out is simple: a few focused improvements can often make the difference between someone browsing and someone actually booking, calling, or replying.

The first thing I would look at is the fastest path from visitor intent to action: the page message, proof, contact flow, and follow-up. If it is useful, I can send over a short audit with 2-3 specific fixes you could use right away.

Would you be open to a quick 15-minute review this week?

Best,
[Your Name]`;
}

function buildLocalSupportReply(messages: Array<{ role: "user" | "assistant"; content: string }>): { reply: string; shouldCreateTicket: boolean } {
  const lastMessage = messages[messages.length - 1]?.content ?? "";
  const lower = lastMessage.toLowerCase();
  const urgentBug = /\b(error|bug|broken|not working|failed|can't|cannot|stuck|login|signup|payment|billing)\b/i.test(lastMessage);

  if (/\b(write|draft|generate|proposal|pitch|cold email|subject line|outreach|message)\b/i.test(lastMessage)) {
    return {
      reply: buildLocalContentDraft(lastMessage),
      shouldCreateTicket: false,
    };
  }

  if (lower.includes("live")) {
    return {
      reply: `Live Jobs is for timing-sensitive opportunities. Use it when you want fresh hiring signals, urgent posts, or contact-ready leads. The best move is speed plus relevance: reply while the problem is still active, mention the exact signal, and offer a small next step such as a quick audit, scope review, or 48-hour sprint.`,
      shouldCreateTicket: false,
    };
  }

  if (lower.includes("remote") || lower.includes("job")) {
    return {
      reply: `For Remote Jobs, start narrow: choose one niche such as WordPress, Meta ads, SEO, React, design, or copywriting, then sort by freshness first. The strongest remote job leads usually have three signals: a clear problem, recent posting activity, and enough detail to write a specific proposal.

Best workflow:
1. Search one niche.
2. Open the best scored lead.
3. Generate a proposal.
4. Add one proof point from your own work.
5. Prepare it in Gmail and save the lead for follow-up.`,
      shouldCreateTicket: false,
    };
  }

  if (lower.includes("local") || lower.includes("business") || lower.includes("website")) {
    return {
      reply: `For Local Business Leads, the best angles are not "do you need a website?" The better angle is tied to money: missed calls, weak trust, slow booking, poor mobile experience, or no clear next step.

Try this:
1. Search a service niche plus city.
2. Filter for no website or outdated site.
3. Prioritize businesses with a phone number or strong reviews.
4. Open the map/profile to verify the business.
5. Pitch one specific improvement, not a full rebuild immediately.`,
      shouldCreateTicket: false,
    };
  }

  if (lower.includes("free") || lower.includes("price") || lower.includes("plan")) {
    return {
      reply: `You can start free during early access. The free workflow is enough to test the core platform: find remote job leads, search local business leads, inspect live job signals, generate proposals, save leads, and track follow-ups. No card is needed to start.`,
      shouldCreateTicket: false,
    };
  }

  if (urgentBug) {
    return {
      reply: `I can help troubleshoot this. Please try one quick check first: refresh the page, sign out and back in if this is account-related, then repeat the action once. If it still fails, send the exact page name and what you clicked.

I have also flagged this as a support issue so the team can review it from the backend if needed.`,
      shouldCreateTicket: true,
    };
  }

  return {
    reply: `I can help with lead discovery, remote jobs, local business leads, live jobs, AI proposals, Gmail-ready outreach, campaigns, saved leads, and CRM follow-up.

If you want the fastest path to a client, start here:
1. Pick one service niche.
2. Use Remote Jobs first for active demand.
3. Use Local Business Leads when you want direct business owners.
4. Use Live Jobs when timing matters.
5. Generate a proposal, personalize the first two lines, and save the lead for follow-up.`,
    shouldCreateTicket: false,
  };
}

export async function supportChat(
  messages: Array<{ role: "user" | "assistant"; content: string }>
): Promise<{ reply: string; shouldCreateTicket: boolean }> {
  const apiKey = process.env.GROQ_API_KEY;

  const systemPrompt = `You are a helpful support agent for iCloseLeads — an AI-powered lead generation SaaS for freelancers.

iCloseLeads features:
- Remote Jobs: helps freelancers find remote freelance jobs, contract roles, and hiring posts by niche
- Local Business Leads: helps find businesses with useful pitch angles such as no website, outdated site, service demand, or contact readiness
- Live Jobs: surfaces fresh public job signals and urgent client requests
- AI Proposals: generates personalized, review-first outreach from lead context
- Campaigns: organize outreach sequences and follow-ups
- Templates: save and reuse proposal templates
- Analytics: track searches, saved leads, prepared outreach, and pipeline movement

Common issues and fixes:
- "No leads found" → Try a broader niche, a longer date range, or switch between Remote Jobs, Local Business Leads, and Live Jobs
- "AI proposal not working" → Try regenerate, verify the lead has enough context, and use the template fallback if needed
- "Can't log in" → Try resetting password; check email/password are correct; if OAuth fails, ask for the provider and error
- "Lead limit reached" → Explain the current plan limit and suggest waiting for reset or upgrading when plans are active
- "Email not sending" → iCloseLeads prepares Gmail drafts by default; users review and send inside Gmail

Answer helpfully and concisely. You may draft short proposal, pitch, subject line, and outreach content directly. If you cannot resolve an account or product issue after 2 exchanges, say: "ESCALATE: [brief description of issue]" so a ticket can be raised.`;

  if (!apiKey) {
    return buildLocalSupportReply(messages);
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

    if (!res.ok) return buildLocalSupportReply(messages);

    const data = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
    const reply = data.choices?.[0]?.message?.content ?? buildLocalSupportReply(messages).reply;
    const shouldCreateTicket = reply.includes("ESCALATE:");

    return { reply: reply.replace("ESCALATE:", "").trim(), shouldCreateTicket };
  } catch {
    return buildLocalSupportReply(messages);
  }
}
