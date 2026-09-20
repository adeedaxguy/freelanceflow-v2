import type { BlogArticleVisual, BlogConversionFunnel, BlogPost } from "@/types";

const publishedAt = new Date("2026-09-21T09:00:00+05:00");

const proofVisuals: BlogArticleVisual[] = [
  {
    src: "/blog-images/lead-research-dashboard.svg",
    alt: "Lead research dashboard showing buyer signal, source proof, and next action",
    title: "Keep the proof attached",
    caption: "A useful lead record explains why the business is worth contacting.",
  },
  {
    src: "/blog-images/local-lead-scorecard.svg",
    alt: "Lead qualification scorecard for fit, visible need, timing, and contact route",
    title: "Score before outreach",
    caption: "Reject weak matches before spending time on a pitch or call.",
  },
  {
    src: "/blog-images/proposal-workflow.svg",
    alt: "Workflow from saved lead to proposal, phone call, and CRM follow-up",
    title: "Choose the right action",
    caption: "Email, proposal, softphone, and CRM follow-up should all use the same context.",
  },
  {
    src: "/blog-images/client-acquisition-system-overview.svg",
    alt: "Client acquisition system from lead discovery to follow-up",
    title: "Build a repeatable system",
    caption: "The goal is a smaller list of better prospects, not a bigger spreadsheet.",
  },
  {
    src: "/blog-images/weekly-lead-sprint.svg",
    alt: "Weekly lead sprint with research, qualification, outreach, calls, and review",
    title: "Review the sprint",
    caption: "Track replies, calls, saved proof, and qualified opportunities every week.",
  },
];

const trialFunnel: BlogConversionFunnel = {
  eyebrow: "Start the workflow",
  title: "Use the free trial to build one qualified lead sprint",
  summary:
    "Search focused prospects, save proof-backed matches, and move the best leads into proposals, softphone calls, website concepts, or CRM follow-up.",
  ctaLabel: "Start free with iCloseLeads",
  ctaHref: "/auth?mode=signup&intent=seo-run-2026-09-21",
  proofNote:
    "New accounts currently receive up to 600 lead results during the 3-day trial. Use that capacity for qualification, not mass outreach.",
  steps: [
    { title: "Pick one offer", detail: "Choose the service, niche, and buying signal before searching." },
    { title: "Save the proof", detail: "Keep the public website, profile, hiring, or contact evidence with the lead." },
    { title: "Choose the route", detail: "Use email, softphone, proposal, website concept, or CRM only when the contact path fits." },
    { title: "Review outcomes", detail: "Track replies and calls before expanding the next search." },
  ],
};

function post({
  id,
  title,
  slug,
  excerpt,
  focusKeyword,
  category,
  metaDescription,
  content,
}: {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  focusKeyword: string;
  category: string;
  metaDescription: string;
  content: string;
}): BlogPost {
  return {
    id,
    title,
    slug,
    excerpt,
    content,
    category,
    published: true,
    coverImage: "/blog-images/client-acquisition-system-overview.svg",
    readTime: 7,
    createdAt: publishedAt,
    updatedAt: publishedAt,
    metaTitle: `${title} | iCloseLeads`,
    metaDescription,
    author: "iCloseLeads SEO Team",
    tags: [focusKeyword, "freelance lead generation", "client acquisition"],
    focusKeyword,
    articleVisuals: proofVisuals,
    conversionFunnel: trialFunnel,
  };
}

export const SEPTEMBER_21_2026_BLOG_POSTS: BlogPost[] = [
  post({
    id: "lead-generation-with-softphone-for-freelancers",
    title: "Lead Generation With Softphone Calling for Freelancers",
    slug: "lead-generation-with-softphone-for-freelancers",
    excerpt:
      "How freelancers can move from researched lead signals into respectful phone outreach using a dedicated US, Canada, or UK business number.",
    focusKeyword: "lead generation with softphone",
    category: "Client Acquisition",
    metaDescription:
      "Use iCloseLeads to find qualified prospects, save proof, and call the right leads with a dedicated softphone number after qualification.",
    content: `Softphone calling is strongest when it starts after lead research.

Freelancers often ask for more phone numbers, more contacts, and bigger lead lists. The better question is: which businesses have a visible reason to hear from you today? iCloseLeads connects lead discovery, proof notes, proposal drafting, softphone calling, and CRM follow-up so the call is based on context rather than pressure.

## Short answer

Use softphone calling only after the lead passes qualification. Search one niche, save the public proof, write a short reason for the call, and then use a dedicated US, Canada, or UK number when phone outreach fits the prospect.

## Why this matters for freelancers

A cold call sounds generic when the caller only has a company name. It sounds useful when the caller can reference a public business signal:

- a service business has active reviews but no clear website quote path
- a clinic has appointment demand but a weak mobile booking flow
- a company is hiring for a role connected to your service
- a local business has a phone route but no landing page that explains the offer
- a website has a visible conversion issue you can show politely

That is why lead generation and calling should stay in one workflow.

## The 5-step workflow

1. Pick one buyer group, such as med spas, dentists, cleaning companies, agencies, or local contractors.
2. Search for prospects with a visible business signal.
3. Save only the leads where the proof is clear.
4. Prepare a one-sentence opener before calling.
5. Log the call result and schedule the next follow-up.

## Example opener

"Hi, this is [name]. I was reviewing local [business type] websites because I help teams improve [calls/bookings/quotes]. I noticed [specific public signal]. Is there someone who handles the website or lead flow?"

That opener works because it explains why you called without pretending the prospect asked for a pitch.

## Where iCloseLeads fits

Start with <a href="/features/lead-discovery">lead discovery</a>, save proof in the CRM, use <a href="/features/ai-proposals">AI proposals</a> when written outreach fits, and use <a href="/features/softphone">softphone calling</a> when the business has a phone-first path. The free trial gives you up to 600 lead results during the first 3 days, which is enough to test one focused calling sprint.`,
  }),
  post({
    id: "website-concept-pitch-for-web-design-leads",
    title: "Website Concept Pitch for Web Design Leads",
    slug: "website-concept-pitch-for-web-design-leads",
    excerpt:
      "A practical way to turn web design leads into better first conversations with a small concept, proof note, and clear next step.",
    focusKeyword: "website concept pitch",
    category: "Web Design Leads",
    metaDescription:
      "Learn how to pitch web design leads with a focused website concept, public proof, and a low-pressure first message.",
    content: `Web design leads convert better when the prospect can see the business problem.

A generic portfolio link asks the prospect to imagine how your work applies to them. A small website concept does the opposite: it shows the gap, the direction, and the possible outcome without pretending the prospect already hired you.

## Short answer

Find a business with a visible website gap, create a small concept around the real issue, and send a helpful first message that asks whether they want the short review.

## What makes a strong web design lead

Look for public signals such as:

- no website connected to an active local profile
- outdated mobile layout
- weak call, booking, or quote action
- no service page for a high-intent offer
- poor trust proof near the conversion action
- active reviews but no strong landing page

## The concept prompt

Use a prompt like this:

"Create a homepage concept for a [business type] in [city] that needs more [calls/bookings/quotes]. Emphasize [service], [trust signal], [CTA], and a mobile-first flow."

The result does not need to be a complete redesign. It needs to make the opportunity visible.

## The outreach message

"Hi, I noticed your [page/profile] is active, but the mobile path to [booking/quote/call] is hard to follow. I put together a small concept showing how the first screen could make that action clearer. Would it be useful if I sent it over?"

That is more specific than "I build websites" and more respectful than a hard sell.

## Where iCloseLeads fits

Use <a href="/lead-generation/web-design-leads">web design leads</a> to find prospects, <a href="/features/web-design-generator">the web design generator</a> to build a concept, and <a href="/features/crm-pipeline">CRM follow-up</a> to track replies. Start with the 3-day free trial and use the 600 lead results to qualify before pitching.`,
  }),
  post({
    id: "google-maps-lead-to-client-workflow",
    title: "Google Maps Lead to Client Workflow",
    slug: "google-maps-lead-to-client-workflow",
    excerpt:
      "How to turn local business listing signals into qualified outreach without sending generic spam.",
    focusKeyword: "Google Maps lead workflow",
    category: "Local Leads",
    metaDescription:
      "Use Google Maps business signals to qualify local leads, save proof, write better outreach, and move prospects into follow-up.",
    content: `Google Maps can reveal useful business signals, but it should not become a scraping contest.

The best local lead workflow starts with a buyer signal. A listing with reviews, photos, services, and phone activity may already have demand. If the website or conversion path is weak, a freelancer has a real reason to start a helpful conversation.

## Short answer

Use Google Maps signals to identify active businesses, then qualify the website gap, save the proof, and write a first message around one specific improvement.

## Signals worth saving

- active reviews but no clear website
- phone-first businesses with weak landing pages
- service categories that match your offer
- busy local markets where competitors have stronger pages
- businesses with booking demand but unclear calls to action

## What to avoid

Do not contact every listing in a city. Do not shame the business. Do not invent performance claims. Do not send the same message to every prospect.

Useful outreach sounds like this:

"I found your listing while reviewing [service] businesses in [city]. Your profile looks active, but the website path does not make [quote/booking/call] very clear on mobile. I can send a short 3-point review if useful."

## How iCloseLeads helps

iCloseLeads keeps the local lead, proof note, website gap, proposal draft, softphone route, and CRM next step together. That matters because outreach quality drops when the research is separated from the message.

Start with one niche, use the trial allowance to search up to 600 lead results over 3 days, and save only the prospects with a clear reason to contact.`,
  }),
  post({
    id: "freelancer-client-acquisition-system-2026",
    title: "Freelancer Client Acquisition System for 2026",
    slug: "freelancer-client-acquisition-system-2026",
    excerpt:
      "A modern freelancer client acquisition workflow built around query intent, lead proof, offers, outreach, calls, and follow-up.",
    focusKeyword: "freelancer client acquisition system",
    category: "Client Acquisition",
    metaDescription:
      "Build a freelancer client acquisition system using lead discovery, proof notes, proposals, softphone calls, CRM follow-up, and weekly review.",
    content: `A freelancer client acquisition system is not a pile of lead lists.

It is a repeatable way to pick a market, find public proof, qualify prospects, send a relevant first message, follow up, and learn from the result.

## Short answer

The best system has six parts: offer, buyer signal, qualification, outreach, follow-up, and review. If one part is missing, the pipeline usually turns into random activity.

## 1. Start with the offer

Choose one outcome before searching. Examples:

- website redesign for clinics
- Google profile to booking flow for local services
- landing pages for agencies
- SEO cleanup for businesses with indexing problems
- softphone outreach setup for sales freelancers

## 2. Search for signals

Do not search only for businesses. Search for evidence:

- outdated websites
- hiring pages
- weak mobile calls to action
- missing service pages
- active reviews without a strong conversion path

## 3. Qualify before pitching

Ask whether the prospect matches your offer, has a visible need, is active enough to buy, and has a respectful contact route.

## 4. Use the right action

Some leads need an email. Some need a proposal. Some are phone-first. Some benefit from a quick website concept. iCloseLeads gives freelancers those routes in one workspace so the next action matches the lead.

## 5. Review weekly

Count replies, calls, meetings, saved proof notes, and qualified opportunities. Do not make "number of leads exported" the main KPI.

Use the free 3-day trial to build one focused sprint from up to 600 lead results, then upgrade only when the workflow proves useful for your offer.`,
  }),
  post({
    id: "free-trial-lead-sprint-for-web-designers",
    title: "Free Trial Lead Sprint for Web Designers",
    slug: "free-trial-lead-sprint-for-web-designers",
    excerpt:
      "A 3-day plan for web designers using the iCloseLeads free trial to find, qualify, and pitch better website prospects.",
    focusKeyword: "free trial lead sprint",
    category: "Web Design Leads",
    metaDescription:
      "Use the iCloseLeads 3-day free trial to search up to 600 lead results, qualify web design prospects, and build a better outreach sprint.",
    content: `A web designer can waste a free trial by searching too broadly.

The better move is to treat the first 3 days as a controlled sprint. iCloseLeads gives new accounts up to 600 lead results during the trial, which is enough to test one niche and one offer properly.

## Day 1: choose one market

Pick one group, such as dentists, med spas, cleaning companies, local contractors, agencies, or financial advisors. Then choose one offer:

- redesign the mobile lead path
- create a better service page
- build a local landing page
- improve quote or booking flow
- create a website concept for outreach

## Day 2: qualify prospects

Search lead results, but save only prospects with proof:

- outdated website
- missing call to action
- no clear service page
- active reviews with poor web support
- local competitors with stronger pages

Write one sentence explaining why each saved business fits.

## Day 3: pitch with context

Send a short message, create a website concept, or call through the softphone when the phone route fits. The message should mention the public signal and one possible next step.

## The success metric

The goal is not 600 messages. A strong sprint might produce 25 saved prospects, 10 proof-led drafts, and 3 to 5 real conversations.

Start with <a href="/lead-generation/web-design-leads">web design leads</a>, move the best prospects into <a href="/features/web-design-generator">website concepts</a>, and use <a href="/features/crm-pipeline">CRM follow-up</a> so the test becomes a repeatable workflow.`,
  }),
];
