import type { BlogArticleVisual, BlogConversionFunnel, BlogPost } from "@/types";

const publishedAt = new Date("2026-09-10T08:00:00+05:00");

const actionVisuals: BlogArticleVisual[] = [
  {
    src: "/blog-images/lead-research-dashboard.svg",
    alt: "Lead research dashboard with niche, buyer signal, proof, and next action",
    title: "Start with proof",
    caption: "Every saved lead should keep the reason for outreach attached.",
  },
  {
    src: "/blog-images/local-lead-scorecard.svg",
    alt: "Lead scorecard comparing fit, need, timing, and contact route",
    title: "Score before outreach",
    caption: "Reject weak matches before writing a pitch or starting a call.",
  },
  {
    src: "/blog-images/proposal-workflow.svg",
    alt: "Workflow from qualified lead to proposal, call, and follow-up",
    title: "Choose the next action",
    caption: "Email, softphone, proposal, and CRM follow-up should all use the same proof.",
  },
  {
    src: "/blog-images/client-acquisition-system-overview.svg",
    alt: "Client acquisition system moving from lead discovery to outreach and follow-up",
    title: "Build a system",
    caption: "The win is a smaller pipeline that moves, not a larger spreadsheet.",
  },
  {
    src: "/blog-images/weekly-lead-sprint.svg",
    alt: "Weekly lead sprint with research, qualification, outreach, calls, and review",
    title: "Review weekly",
    caption: "Measure replies, calls, saved proof, and qualified opportunities.",
  },
];

const signupFunnel: BlogConversionFunnel = {
  eyebrow: "Start the workflow",
  title: "Use the free trial to build one qualified lead sprint",
  summary:
    "Search focused prospects, save only proof-backed matches, and move the best leads into proposals, softphone calls, or CRM follow-up.",
  ctaLabel: "Start free with iCloseLeads",
  ctaHref: "/auth?mode=signup&intent=seo-run-2026-09-10",
  proofNote:
    "Free accounts currently receive up to 600 lead results during the 3-day trial. Use that capacity for qualification, not mass outreach.",
  steps: [
    { title: "Pick one offer", detail: "Choose the service, niche, and buying signal before searching." },
    { title: "Save the proof", detail: "Keep the public website, profile, hiring, or contact evidence with the lead." },
    { title: "Choose the route", detail: "Use email, softphone, proposal, or CRM only when the contact path fits." },
    { title: "Review outcomes", detail: "Track replies and calls before expanding the next search." },
  ],
};

export const SEPTEMBER_10_2026_BLOG_POSTS: BlogPost[] = [
  {
    id: "softphone-lead-calling-workflow-for-freelancers",
    title: "Softphone Lead Calling Workflow for Freelancers",
    slug: "softphone-lead-calling-workflow-for-freelancers",
    excerpt:
      "A practical workflow for using a US, Canada, or UK business number after a lead is qualified, with call prep, proof, and follow-up.",
    content: `Freelancers do not need more random phone numbers. They need a reason to call.

iCloseLeads now supports softphone calling for freelancers and small agencies that want a US, Canada, or UK business number connected to their lead workflow. That creates a stronger path for searches like lead calling software for freelancers, business phone number for freelancers, call local business leads, and client acquisition phone workflow.

## Short answer

Use softphone calling after qualification, not before it. Find a prospect, confirm the business fit, save the public proof, prepare a short opener, and then call only when the route is appropriate. The softphone should help a freelancer move faster from research to conversation without losing context.

## Why softphone works better after lead research

Cold calling fails when the caller sounds detached from the business. The strongest calls start with a real observation:

- a local service business has no clear quote path
- a website hides its phone number on mobile
- a company is hiring for a role that reveals a workflow gap
- a Google profile is active but the website does not support the same demand
- a freelancer can offer a small fix, audit, landing page, or campaign

That is why the order matters. Lead discovery comes first. Qualification comes second. The call comes third.

## The iCloseLeads calling workflow

Start by choosing one service and one market. For example, web design for med spas, SEO audits for dentists, appointment funnels for clinics, or landing pages for local home-service companies.

Then search for prospects and save only the leads with visible proof. Before calling, write one sentence that explains why this business is worth contacting. If you cannot write that sentence, do not call yet.

The softphone step should be simple:

1. Open the saved lead.
2. Review the proof and notes.
3. Choose the US, Canada, or UK number that fits the campaign.
4. Call with a short, respectful opener.
5. Log the result and set a follow-up.

## A simple call opener

Try this structure:

"Hi, this is [name]. I was looking at [business] because I help [type of business] improve [result]. I noticed [specific public signal]. Is there a better person to speak with about that?"

That line is short because the goal is not to pitch the full service in the first ten seconds. The goal is to make the call relevant enough for the person to decide whether to continue.

## When not to call

Skip the call when the prospect has no visible fit, no business-facing contact route, or no obvious reason to care. Also skip anything that would violate local rules, platform terms, or the prospect's stated preferences.

Responsible outreach protects the freelancer's reputation and keeps the campaign useful.

## Where this fits in the pipeline

Softphone calling is most useful for high-intent local businesses, appointment-led services, and offers where a quick conversation clarifies fit faster than a long email. It pairs well with <a href="/features/lead-discovery">lead discovery</a>, <a href="/features/ai-proposals">AI proposals</a>, <a href="/features/crm-pipeline">CRM follow-up</a>, and the <a href="/features/web-design-generator">web design generator</a> for visual proof.

Start with the free trial, use up to 600 lead results to build a focused prospect list, and call only the leads that pass qualification.`,
    category: "Client Acquisition",
    published: true,
    coverImage: "/blog-images/proposal-workflow.svg",
    readTime: 6,
    createdAt: publishedAt,
    updatedAt: publishedAt,
    metaTitle: "Softphone Lead Calling Workflow for Freelancers",
    metaDescription:
      "Use iCloseLeads softphone calling with US, Canada, and UK numbers after lead qualification. Build a proof-led calling workflow for freelancers.",
    author: "iCloseLeads SEO Team",
    tags: ["softphone", "lead calling", "freelancer client acquisition"],
    focusKeyword: "lead calling software for freelancers",
    articleVisuals: actionVisuals,
    conversionFunnel: signupFunnel,
  },
  {
    id: "ai-website-mockup-for-web-design-leads",
    title: "AI Website Mockups for Web Design Leads: A Better First Pitch",
    slug: "ai-website-mockup-for-web-design-leads",
    excerpt:
      "How freelancers can turn web design leads into a stronger first conversation by generating a focused website concept from the prospect's real business context.",
    content: `A web design lead becomes more valuable when the prospect can see the problem and the possible fix.

That is the thinking behind the iCloseLeads web design feature: use a business, prompt, niche, and visible requirement to create a website concept that supports the pitch. This targets searches around web design leads, website development leads, AI website mockup, prompt to website design, and how to pitch website redesign services.

## Short answer

For web design outreach, do not send a generic portfolio link first. Find a business with a visible website gap, create a small concept around that gap, and use the mockup as proof that you understand the business. The concept should support the conversation, not pretend to be finished client work.

## Why a visual pitch helps

Many local businesses know their website is weak, but they do not know what better looks like. A short email saying "I can redesign your website" asks them to imagine the result. A clear concept lowers that friction.

The best use cases are:

- businesses with no website
- outdated websites with active local demand
- service pages that do not explain the offer
- mobile pages with weak call or booking paths
- clinics, med spas, contractors, agencies, and local service teams

## The workflow

Start with a lead search. Save businesses where the public proof is clear: website issue, Google profile activity, reviews, service demand, or competitor gap.

Then create a prompt:

"Create a homepage concept for a [business type] in [city] that needs more [calls/bookings/quotes]. Emphasize [service], [trust signal], [CTA], and [mobile-first flow]."

Use the generated concept to write a better first message:

"I noticed your current page makes it hard for mobile visitors to request a quote. I put together a small concept showing how the first screen could guide people toward the main service and booking action. Would you like me to send it?"

That is more specific than a generic pitch and less aggressive than pretending the prospect already asked for a redesign.

## SEO and sales advantage

This workflow also helps iCloseLeads' own SEO because it connects high-intent terms:

- web design leads
- website development leads
- local business leads
- website redesign pitch
- AI website generator for clients
- prompt based website design

The product story is simple: find the lead, understand the website gap, create a concept, and follow up from one place.

## What to avoid

Do not fabricate results, publish the prospect's private details, or make the mockup look like approved work. Keep the tone helpful and specific. The visual is a conversation starter, not pressure.

If the prospect replies, move the lead into the CRM, prepare a proper proposal, and use the original proof to shape the scope.

Start with <a href="/lead-generation/web-design-leads">web design leads</a>, use the <a href="/features/web-design-generator">web design generator</a>, and build the first campaign with your free trial allowance.`,
    category: "Web Design Leads",
    published: true,
    coverImage: "/blog-images/web-designers-find-local-business-clients-2026.svg",
    readTime: 6,
    createdAt: publishedAt,
    updatedAt: publishedAt,
    metaTitle: "AI Website Mockups for Web Design Leads",
    metaDescription:
      "Use AI website mockups to pitch web design leads with business-specific proof, stronger outreach, and a clearer website redesign offer.",
    author: "iCloseLeads SEO Team",
    tags: ["web design leads", "AI website generator", "website redesign pitch"],
    focusKeyword: "AI website mockup for web design leads",
    articleVisuals: actionVisuals,
    conversionFunnel: signupFunnel,
  },
  {
    id: "600-lead-trial-plan-qualify-before-outreach",
    title: "600 Lead Trial Plan: Qualify Before You Contact Anyone",
    slug: "600-lead-trial-plan-qualify-before-outreach",
    excerpt:
      "A focused plan for using the iCloseLeads free trial allowance to test a niche, qualify prospects, and turn searches into a cleaner pipeline.",
    content: `A free lead allowance is only useful if it helps you make better decisions.

iCloseLeads currently gives new free users up to 600 lead results during the 3-day trial. That is enough capacity to test a niche, but it is not a reason to contact every record. The smarter workflow is to qualify first, save proof, and only reach out when the business fit is clear.

## Short answer

Use the 600 lead trial as a controlled market test. Pick one offer, search one buyer group, score the prospects, save only the strongest matches, and turn those into email, proposal, softphone, or CRM follow-up actions.

## Day 1: pick the market

Choose one service and one buyer:

- web design for med spas
- SEO refreshes for dentists
- website audits for local contractors
- lead funnels for cleaning companies
- appointment booking pages for clinics
- landing pages for insurance agencies

Do not mix five offers in the same test. A narrow search teaches faster.

## Day 2: search and score

For each prospect, check four signals:

- Fit: does this business match your offer?
- Need: is there a visible problem or opportunity?
- Timing: is the business active enough to care now?
- Route: is there a respectful contact path?

Save only leads that pass. Weak matches make the pipeline look bigger while making results worse.

## Day 3: take action

Now choose the next step:

- create a short proposal for qualified remote work
- prepare a softphone opener for local leads
- generate a web design concept for a visible website gap
- write a short email tied to the saved proof
- add a follow-up date in the CRM

The goal is not to exhaust the allowance. The goal is to leave the trial with a working client-acquisition pattern.

## What this replaces

Most free lead tools push users toward bulk exports. That creates noise. A freelancer needs a smaller set of prospects with context, a message, and a next action.

iCloseLeads is built around the full workflow: <a href="/features/lead-discovery">lead discovery</a>, qualification, <a href="/features/ai-proposals">AI proposals</a>, <a href="/features/softphone">softphone calling</a>, <a href="/features/web-design-generator">website concepts</a>, and <a href="/features/crm-pipeline">CRM follow-up</a>.

## Final rule

If a lead does not have proof, it does not deserve outreach yet. Use the free trial to learn which buyers respond to a relevant reason, then expand only after the pattern is working.`,
    category: "Lead Generation",
    published: true,
    coverImage: "/blog-images/weekly-lead-sprint.svg",
    readTime: 5,
    createdAt: publishedAt,
    updatedAt: publishedAt,
    metaTitle: "600 Lead Trial Plan for Freelancers",
    metaDescription:
      "Use the iCloseLeads 600 lead trial to qualify prospects before outreach. Build a focused lead generation workflow for freelancers.",
    author: "iCloseLeads SEO Team",
    tags: ["600 leads", "free lead trial", "lead qualification"],
    focusKeyword: "600 lead trial",
    articleVisuals: actionVisuals,
    conversionFunnel: signupFunnel,
  },
];
