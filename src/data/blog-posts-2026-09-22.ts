import type { BlogArticleVisual, BlogConversionFunnel, BlogPost } from "@/types";

const publishedAt = new Date("2026-09-22T09:00:00+05:00");

const visuals: BlogArticleVisual[] = [
  {
    src: "/blog-images/client-acquisition-system-overview.svg",
    alt: "Client acquisition workflow from lead research to signup, outreach, calling, and follow-up",
    title: "One workflow, not scattered tabs",
    caption: "Use the same lead proof for outreach, website concepts, calls, and CRM follow-up.",
  },
  {
    src: "/blog-images/local-lead-scorecard.svg",
    alt: "Local lead scorecard with fit, need, proof, contact route, and next action",
    title: "Score the reason to contact",
    caption: "The strongest leads have visible proof and a clear next action.",
  },
  {
    src: "/blog-images/proposal-workflow.svg",
    alt: "Proposal workflow connecting a saved lead to a pitch, call, and follow-up",
    title: "Move from proof to action",
    caption: "A good first message should come from the public signal you found.",
  },
  {
    src: "/blog-images/weekly-lead-sprint.svg",
    alt: "Weekly lead sprint board with research, qualification, outreach, calls, and review",
    title: "Run small, review fast",
    caption: "Use a focused sprint before expanding to another niche or city.",
  },
];

const signupFunnel: BlogConversionFunnel = {
  eyebrow: "Start a focused sprint",
  title: "Turn one search into qualified lead actions",
  summary:
    "Use iCloseLeads to search prospects, save proof-backed matches, build a website concept or proposal, call when appropriate, and track follow-up.",
  ctaLabel: "Start free with iCloseLeads",
  ctaHref: "/auth?mode=signup&intent=seo-run-2026-09-22",
  proofNote:
    "New accounts currently receive up to 600 lead results during the 3-day trial. Use them for qualification and follow-up, not mass outreach.",
  steps: [
    { title: "Choose one buyer", detail: "Pick one niche, city, or service offer before searching." },
    { title: "Find visible proof", detail: "Save only prospects with a clear business signal and contact route." },
    { title: "Create the next action", detail: "Use a proposal, website concept, softphone call, or CRM task." },
    { title: "Review outcomes", detail: "Measure replies, calls, and booked opportunities before scaling." },
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
    tags: [focusKeyword, "freelance lead generation", "client acquisition", "web design leads"],
    focusKeyword,
    articleVisuals: visuals,
    conversionFunnel: signupFunnel,
  };
}

export const SEPTEMBER_22_2026_BLOG_POSTS: BlogPost[] = [
  post({
    id: "twenty-one-day-freelance-client-acquisition-system-checklist",
    title: "21-Day Freelance Client Acquisition System Checklist",
    slug: "21-day-freelance-client-acquisition-system-checklist",
    excerpt:
      "A practical 21-day plan for freelancers who want a repeatable client acquisition system instead of random outreach.",
    focusKeyword: "21 day freelance client acquisition system",
    category: "Client Acquisition",
    metaDescription:
      "Use this 21-day freelance client acquisition system to pick a niche, find proof-backed leads, write better outreach, call when useful, and review results.",
    content: `Search Console is already showing demand around the 21-day freelance client acquisition system. That tells us visitors want structure, not another generic list of lead sources.

## Short answer

A 21-day client acquisition system gives a freelancer one focused market, one proof standard, one outreach route, and one weekly review. The goal is not to contact everyone. The goal is to find enough qualified conversations to learn what is working.

## Days 1 to 3: choose the lane

Pick one offer and one buyer group. For example:

- web design for local clinics
- SEO cleanup for service businesses
- appointment-setting support for agencies
- website concepts for businesses with weak mobile pages

Do not mix five offers in the same sprint. A narrow sprint makes the data readable.

## Days 4 to 10: find proof-backed leads

Use <a href="/features/lead-discovery">lead discovery</a> to find prospects with public proof: no website, outdated site, weak booking path, active reviews, hiring signal, or visible demand. Save only the leads where you can explain the reason to contact.

## Days 11 to 16: create the first action

Move the best prospects into <a href="/features/ai-proposals">AI proposals</a>, <a href="/features/web-design-generator">website concepts</a>, <a href="/features/softphone">softphone calls</a>, or <a href="/features/crm-pipeline">CRM follow-up</a>. The right action depends on the prospect, not the tool you want to use.

## Days 17 to 21: review the result

Track replies, call outcomes, booked meetings, and the type of proof that created movement. If one niche responds, expand it. If the signal is weak, switch the buyer group before writing more messages.

Start with the 3-day free trial and use up to 600 lead results to test one focused market before scaling.`,
  }),
  post({
    id: "web-design-leads-for-free-qualified-sprint",
    title: "Web Design Leads for Free: How to Qualify the Right Prospects",
    slug: "web-design-leads-for-free-qualified-sprint",
    excerpt:
      "How web designers can use a free lead sprint to find businesses with real website gaps, not just names in a spreadsheet.",
    focusKeyword: "web design leads for free",
    category: "Web Design Leads",
    metaDescription:
      "Find web design leads for free with a qualification sprint that checks website gaps, local proof, buyer fit, and a clear next action.",
    content: `People searching for web design leads for free usually do not want theory. They want prospects they can actually contact.

The mistake is treating a free lead search as a volume game. A list of 600 businesses is only useful if the strongest few have a reason to hear from you.

## Short answer

Use the free lead allowance to qualify prospects, not to blast them. Search one niche, look for visible website gaps, save the proof, and pitch one practical improvement.

## What counts as a good web design lead?

Strong web design leads often show one of these signals:

- no website connected to an active local profile
- old design on mobile
- no clear call, quote, or booking route
- active reviews but weak trust proof on the website
- service pages that do not match what buyers search
- competitors with clearer landing pages

## The first-message angle

Do not say, "I build websites." Say what you found:

"I noticed your listing is active, but the website makes it hard to request a quote on mobile. I put together a short concept showing a simpler first screen. Want me to send it?"

That message is still simple, but it is based on proof.

## How iCloseLeads supports it

Start at <a href="/lead-generation/web-design-leads">web design leads</a>, save only prospects with a visible gap, generate a small concept in the <a href="/features/web-design-generator">web design generator</a>, then track follow-up in the <a href="/features/crm-pipeline">CRM pipeline</a>. If the business is phone-first, use <a href="/features/softphone">softphone calling</a> after qualification.`,
  }),
  post({
    id: "local-business-leads-recovery-sprint",
    title: "Local Business Leads Recovery Sprint for Freelancers",
    slug: "local-business-leads-recovery-sprint",
    excerpt:
      "A refresh plan for local business lead searches when impressions drop, clicks slow down, or the page needs stronger value.",
    focusKeyword: "local business leads",
    category: "Local Leads",
    metaDescription:
      "Use a local business leads recovery sprint to improve buyer fit, proof notes, outreach angles, and signup paths from local lead searches.",
    content: `When a local business leads page gets fewer impressions than usual, the fix is not always more content. Often the page needs a clearer answer, stronger internal links, and a better path from search intent to action.

## Short answer

Refresh local business lead pages by matching the visitor's intent: what businesses to target, how to qualify them, what proof to save, and what action to take next.

## What the page must answer quickly

A visitor should understand:

- which local businesses are worth contacting
- what makes a lead qualified
- how to avoid spammy outreach
- when to send a message versus make a call
- how to test a niche before paying for more tools

## The local lead score

Use five checks:

1. Fit: the business matches your service.
2. Need: the public profile or website shows a gap.
3. Proof: you can cite the signal politely.
4. Route: there is a safe contact path.
5. Action: you know whether to send a message, concept, proposal, or call.

## Where to go next

Use <a href="/use-cases/local-business-leads">local business leads</a> for the search workflow, <a href="/blog/google-maps-lead-to-client-workflow">Google Maps lead workflow</a> for the proof method, and <a href="/features/softphone">softphone</a> only when the phone route fits the prospect.`,
  }),
  post({
    id: "local-business-prospecting-tool-workflow",
    title: "Local Business Prospecting Tool Workflow",
    slug: "local-business-prospecting-tool-workflow",
    excerpt:
      "How to use a local business prospecting tool without turning every search result into a weak outreach target.",
    focusKeyword: "local business prospecting tool",
    category: "Local Leads",
    metaDescription:
      "Build a local business prospecting workflow with lead discovery, proof notes, qualification, softphone calling, website concepts, and CRM follow-up.",
    content: `A local business prospecting tool should help you make better decisions, not just export more names.

## Short answer

The best workflow is search, qualify, save proof, choose one action, and review outcomes. If the tool does not help you explain why a business is worth contacting, the list is not ready.

## The prospecting workflow

Start with one niche and one location. Search for businesses where your offer can create a visible improvement. Then qualify the prospect before outreach.

Useful proof includes:

- active reviews
- missing website
- weak mobile quote path
- outdated service pages
- unclear booking flow
- visible competitor gap

## Match action to context

Use email when the message can be short and specific. Use a website concept when the visual gap is obvious. Use the softphone when a public phone route is normal for that business type. Use CRM follow-up when timing matters more than the first message.

## iCloseLeads path

iCloseLeads keeps <a href="/features/lead-discovery">lead discovery</a>, qualification notes, <a href="/features/web-design-generator">website concepts</a>, <a href="/features/ai-proposals">AI proposals</a>, <a href="/features/softphone">softphone calling</a>, and <a href="/features/crm-pipeline">CRM follow-up</a> inside one client acquisition workflow.`,
  }),
  post({
    id: "web-design-leads-softphone-follow-up-system",
    title: "Web Design Leads, Softphone Calls, and Follow-Up System",
    slug: "web-design-leads-softphone-follow-up-system",
    excerpt:
      "A combined workflow for web designers who want to find leads, show a useful concept, call when appropriate, and follow up cleanly.",
    focusKeyword: "web design leads softphone",
    category: "Web Design Leads",
    metaDescription:
      "Use web design leads, website concepts, softphone calling, and CRM follow-up together so every prospect gets a relevant next action.",
    content: `Web design lead generation gets stronger when discovery, concept, call, and follow-up stay connected.

## Short answer

Find prospects with a visible website gap, create a small website concept, decide whether email or phone fits, and track every follow-up in one pipeline.

## Why this works

Most web design outreach fails because it sounds like every other pitch. A connected workflow lets you say something specific:

- the business has demand
- the website has a visible gap
- the concept shows one improvement
- the call or message has a clear reason
- the follow-up remembers the original proof

## When to call

Call only when the business has a public phone route and the offer benefits from a quick conversation. Do not call just because a number exists. Prepare a short opener and respect local rules, business hours, and opt-out requests.

## The iCloseLeads flow

Use <a href="/lead-generation/web-design-leads">web design leads</a> to find targets, <a href="/features/web-design-generator">web design generator</a> to create the visual proof, <a href="/features/softphone">softphone</a> for qualified phone-first leads, and <a href="/features/crm-pipeline">CRM pipeline</a> to keep follow-up organized.`,
  }),
];
