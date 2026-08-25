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

function hasAny(text: string, terms: string[]): boolean {
  return terms.some(term => text.includes(term));
}

function withSignupFlow(answer: string, nextStep = "Create a free account, run one real search, and save the first lead worth pursuing. No card is needed to start; Pro and Agency upgrades are available when you need higher limits."): string {
  return `${answer}

Best next step: ${nextStep}`;
}

function buildLeadEngineRecommendation(message: string): string {
  const lower = message.toLowerCase();

  if (hasAny(lower, ["website", "web design", "wordpress", "seo", "local", "dentist", "cleaning", "restaurant", "clinic", "contractor"])) {
    return withSignupFlow(`I would start you with Local Business Leads.

Why: your service is easiest to sell when a business has a visible gap: no website, an outdated site, weak booking flow, poor mobile trust, or no clear call-to-action. That gives you a natural reason to reach out without sounding random.

Simple play:
1. Search one service category plus one city.
2. Filter for no website or outdated site.
3. Prioritize businesses with phone numbers, strong reviews, or clear service demand.
4. Generate a pitch that ties the gap to calls, bookings, or local trust.`);
  }

  if (hasAny(lower, ["ads", "meta", "facebook", "google ads", "paid social", "media buyer", "funnel"])) {
    return withSignupFlow(`I would start you with Remote Jobs, then use Live Jobs for fresh urgent posts.

Why: Meta ads and paid growth buyers usually reveal intent through hiring posts, budget language, launch deadlines, or founder requests. You want active demand, not cold guessing.

Simple play:
1. Search "Meta ads", "paid social", or "media buyer".
2. Sort newest first.
3. Look for budget, urgency, niche, or campaign goals.
4. Pitch a small test plan instead of a vague "I can run ads" message.`);
  }

  return withSignupFlow(`I would start with Remote Jobs first, then use Local Business Leads as your steady outbound lane.

Why: Remote Jobs catches people already asking for help, while Local Business Leads gives you a repeatable prospecting system when job boards slow down.

Simple play:
1. Pick one niche.
2. Find active demand in Remote Jobs.
3. Save the best leads.
4. Use AI Proposal to draft the first message.
5. Prepare it in Gmail and track follow-up in the pipeline.`);
}

function buildLocalSupportReply(messages: Array<{ role: "user" | "assistant"; content: string }>): { reply: string; shouldCreateTicket: boolean } {
  const lastMessage = messages[messages.length - 1]?.content ?? "";
  const lower = lastMessage.toLowerCase();
  const urgentBug = /\b(error|bug|broken|not working|failed|can't|cannot|stuck|payment|billing)\b/i.test(lastMessage) ||
    (/\b(login|signup|sign up)\b/i.test(lastMessage) && /\b(issue|problem|error|broken|not working|failed|can't|cannot|stuck)\b/i.test(lastMessage));

  if (hasAny(lower, ["which", "best for me", "where should i start", "what should i do first", "recommend", "i do ", "my niche", "my service"])) {
    return {
      reply: buildLeadEngineRecommendation(lastMessage),
      shouldCreateTicket: false,
    };
  }

  if (!urgentBug && hasAny(lower, ["sign up", "signup", "create account", "get started", "start free", "free account", "join", "try it"])) {
    return {
      reply: `Yes - the best move is to start with the free account.

You do not need a card to start. Inside, you can test the real workflow:
1. Find remote job leads, local business leads, or live job signals.
2. Save the leads that look worth pursuing.
3. Generate a draft proposal or pitch.
4. Prepare Gmail outreach and track follow-up.

Pro and Agency are available when you need higher limits, more campaigns, or agency features.`,
      shouldCreateTicket: false,
    };
  }

  if (/\b(write|draft|generate|proposal|pitch|cold email|subject line|outreach|message)\b/i.test(lastMessage)) {
    return {
      reply: `${buildLocalContentDraft(lastMessage)}

If you want this to be sharper, use the free account with a real lead selected. The AI proposal flow can pull in the lead context, business type, niche, and outreach angle so the message feels less generic.`,
      shouldCreateTicket: false,
    };
  }

  if (lower.includes("live")) {
    return {
      reply: withSignupFlow(`Live Jobs is for timing-sensitive opportunities: fresh hiring signals, urgent posts, contact-ready leads, and public requests where speed matters.

The winning angle is not "I saw your post." It is: "I saw the exact problem, here is the fastest low-risk next step."

Use it when:
1. The post is fresh.
2. The need is urgent or specific.
3. There is a contact path or clear application link.
4. You can pitch a small next step, like an audit, quick scope review, or 48-hour sprint.`),
      shouldCreateTicket: false,
    };
  }

  if (lower.includes("remote") || lower.includes("job")) {
    return {
      reply: withSignupFlow(`Remote Jobs should be your first engine if you want people who are already asking for help.

Start narrow: choose one niche such as WordPress, Meta ads, SEO, React, design, or copywriting, then sort by freshness first. The strongest remote job leads usually have three signals: a clear problem, recent posting activity, and enough detail to write a specific proposal.

Best workflow:
1. Search one niche.
2. Open the best scored lead.
3. Generate a proposal.
4. Add one proof point from your own work.
5. Prepare it in Gmail and save the lead for follow-up.`),
      shouldCreateTicket: false,
    };
  }

  if (lower.includes("local") || lower.includes("business") || lower.includes("website")) {
    return {
      reply: withSignupFlow(`For Local Business Leads, the best angles are not "do you need a website?" The better angle is tied to money: missed calls, weak trust, slow booking, poor mobile experience, or no clear next step.

Try this:
1. Search a service niche plus city.
2. Filter for no website or outdated site.
3. Prioritize businesses with a phone number or strong reviews.
4. Open the map/profile to verify the business.
5. Pitch one specific improvement, not a full rebuild immediately.`),
      shouldCreateTicket: false,
    };
  }

  if (hasAny(lower, ["free", "price", "pricing", "plan", "paid", "cost", "agency", "pro", "card", "trial"])) {
    return {
      reply: `The cleanest path is to start free, then upgrade when the limits matter.

No card is needed for the Free plan. Pro and Agency upgrades use secure Stripe checkout, and softphone numbers and calling minutes are separate paid add-ons. The free account lets you test the core product honestly:
1. Remote job lead discovery.
2. Local business lead discovery.
3. Live job signals.
4. AI proposals and pitch drafts.
5. Saved leads, Gmail-ready outreach, and follow-up tracking.

Best next step: start free, run one search in your niche, and upgrade only when you need higher limits or agency workflows.`,
      shouldCreateTicket: false,
    };
  }

  if (hasAny(lower, ["how does it work", "what is this", "what do you do", "features", "explain", "platform"])) {
    return {
      reply: withSignupFlow(`iCloseLeads is a freelance lead generation workspace. It helps you move from "where do I find clients?" to "which lead should I pitch next?"

The simple version:
1. Remote Jobs finds active hiring demand.
2. Local Business Leads finds businesses with practical outreach angles.
3. Live Jobs catches fresh, timing-sensitive opportunities.
4. AI Proposal helps turn the lead context into a useful message.
5. The CRM keeps the lead, pitch, and follow-up in one place.

The goal is not to blast generic cold emails. The goal is to find better signals and write more relevant outreach.`),
      shouldCreateTicket: false,
    };
  }

  if (urgentBug) {
    return {
      reply: `I can help troubleshoot this. Please try one quick check first: refresh the page, sign out and back in if this is account-related, then repeat the action once. If it still fails, send the exact page name and what you clicked.

If it still fails, I can route it as a support issue with the exact page and action so it can be reviewed properly.`,
      shouldCreateTicket: true,
    };
  }

  return {
    reply: withSignupFlow(`I can help with lead discovery, remote jobs, local business leads, live jobs, AI proposals, Gmail-ready outreach, campaigns, saved leads, and CRM follow-up.

If you want the fastest path to a client, start here:
1. Pick one service niche.
2. Use Remote Jobs first for active demand.
3. Use Local Business Leads when you want direct business owners.
4. Use Live Jobs when timing matters.
5. Generate a proposal, personalize the first two lines, and save the lead for follow-up.`),
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
- "Lead limit reached" → Explain the current plan limit and suggest waiting for reset or upgrading to Pro or Agency
- "Email not sending" → iCloseLeads prepares Gmail drafts by default; users review and send inside Gmail

Conversion guidance:
- Answer the user's actual question first.
- Then suggest the best next step inside iCloseLeads.
- Free is available without a card. Pro and Agency upgrades use secure Stripe checkout.
- Softphone access is available on every plan, but phone numbers and calling minutes are separate paid add-ons.
- Do not tell users to buy or configure an external AI API.
- Do not name raw data providers or imply the platform is built from free sources.
- Avoid fake guarantees, fake revenue claims, and pushy language.

Answer helpfully and concisely. You may draft short proposal, pitch, subject line, and outreach content directly. If it is relevant, end with a natural free signup next step such as: "Best next step: create a free early access account and run one search in your niche." If you cannot resolve an account or product issue after 2 exchanges, say: "ESCALATE: [brief description of issue]" so a ticket can be raised.`;

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
