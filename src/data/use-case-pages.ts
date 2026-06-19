import type { Metadata } from "next";

export type UseCaseSlug =
  | "remote-job-leads"
  | "local-business-leads"
  | "live-job-leads";

export interface UseCasePageData {
  slug: UseCaseSlug;
  path: string;
  eyebrow: string;
  title: string;
  accentTitle: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  heroSummary: string;
  primaryCta: string;
  secondaryCta: string;
  dashboardPath: string;
  searchIntent: string;
  audience: string;
  outcome: string;
  intro: string[];
  signals: { label: string; detail: string }[];
  workflow: { title: string; description: string }[];
  keywordsCluster: { group: string; terms: string[] }[];
  examples: { title: string; context: string; pitchAngle: string }[];
  comparison: { oldWay: string; icloseWay: string }[];
  faqs: { q: string; a: string }[];
}

const BASE_URL = "https://icloseleads.com";

export const USE_CASE_PAGES: UseCasePageData[] = [
  {
    slug: "remote-job-leads",
    path: "/use-cases/remote-job-leads",
    eyebrow: "Remote Job Leads",
    title: "Remote job leads",
    accentTitle: "for freelancers who pitch before the crowd",
    metaTitle: "Remote Job Leads for Freelancers | Find Fresh Client Opportunities",
    metaDescription:
      "Find remote job leads, contract work, freelance job alerts, and niche-matched opportunities. Use iCloseLeads to filter, save, pitch, and track every prospect.",
    keywords: [
      "remote job leads",
      "remote job leads for freelancers",
      "freelance job alerts",
      "remote freelance jobs",
      "remote contract work",
      "find remote freelance clients",
      "freelance lead generation software",
      "AI proposal generator for remote jobs",
    ],
    heroSummary:
      "Stop refreshing job boards after everyone else has already applied. iCloseLeads helps freelancers find fresh remote opportunities, qualify the real buyer intent, and turn the best matches into human-sounding proposals.",
    primaryCta: "Find Remote Leads Free",
    secondaryCta: "See Lead Discovery",
    dashboardPath: "/dashboard/leads",
    searchIntent:
      "People searching this topic usually want a practical way to find remote freelance work, not a generic job board list. The page targets high-intent terms around remote job leads, freelance job alerts, and remote contract opportunities.",
    audience:
      "Built for developers, designers, SEO consultants, copywriters, marketers, virtual assistants, and small agencies that sell remote services directly.",
    outcome:
      "A weekly workflow that turns remote demand into saved leads, edited proposals, Gmail-ready outreach, and follow-up tasks.",
    intro: [
      "The remote work market is noisy. A job post can look promising, then attract hundreds of generic replies before you even finish reading the brief. The advantage is not just finding more posts. It is finding the right post early, understanding the signal, and sending a message that sounds like it was written for that exact buyer.",
      "iCloseLeads treats remote jobs as lead signals, not just listings. You search by niche, freshness, source, budget clues, contact availability, and match quality. Then you can save the opportunity, generate a proposal, and keep the follow-up inside the same CRM.",
    ],
    signals: [
      { label: "Freshness", detail: "Prioritize posts from the last 12 to 72 hours so your pitch lands while the problem is still active." },
      { label: "Niche fit", detail: "Search one service at a time, such as WordPress, Meta ads, SEO, React, Webflow, design, or copywriting." },
      { label: "Budget clues", detail: "Highlight roles or posts where the client gives scope, urgency, pricing hints, or a clear business problem." },
      { label: "Contact readiness", detail: "Use contact filters when a public email or domain signal makes direct outreach realistic." },
    ],
    workflow: [
      {
        title: "Choose one service niche",
        description:
          "Do not search for every possible job. Pick the work you want to sell this week so relevance stays sharp.",
      },
      {
        title: "Sort by freshness and quality",
        description:
          "Use newest-first sorting, source filters, and match signals to avoid stale posts and weak-fit roles.",
      },
      {
        title: "Save the opportunities worth a real pitch",
        description:
          "A smaller saved list with context beats a huge list you never contact.",
      },
      {
        title: "Generate, edit, and prepare the proposal",
        description:
          "Let AI draft from the job context, then add your strongest proof point before opening Gmail or copying the message.",
      },
    ],
    keywordsCluster: [
      { group: "Core", terms: ["remote job leads", "remote freelance jobs", "remote contract work"] },
      { group: "Freelancer intent", terms: ["find remote freelance clients", "freelance job alerts", "remote jobs for freelancers"] },
      { group: "Workflow", terms: ["AI proposal for remote job", "save freelance leads", "freelance CRM"] },
    ],
    examples: [
      {
        title: "Founder needs a Webflow landing page refresh",
        context: "Fresh post, marketing site pain, public company domain.",
        pitchAngle: "Offer a quick conversion audit and a focused 7-day landing page cleanup.",
      },
      {
        title: "Agency needs overflow WordPress support",
        context: "Urgent delivery window and likely recurring support need.",
        pitchAngle: "Lead with availability, similar delivery proof, and a small first sprint.",
      },
      {
        title: "Startup hiring a Meta ads specialist",
        context: "Growth channel named clearly, with testing language in the brief.",
        pitchAngle: "Pitch a 14-day testing plan with one measurable outcome.",
      },
    ],
    comparison: [
      { oldWay: "Refresh several job boards manually.", icloseWay: "Search fresh remote signals from one focused lead workspace." },
      { oldWay: "Apply with the same cover letter.", icloseWay: "Generate a proposal from the actual job context, then edit it." },
      { oldWay: "Forget to follow up.", icloseWay: "Save the lead into CRM stages and keep notes attached." },
    ],
    faqs: [
      {
        q: "What are remote job leads?",
        a: "Remote job leads are fresh hiring or project signals that can become freelance clients. They include contract roles, short-term projects, agency overflow work, startup hiring posts, and public requests that match your service niche.",
      },
      {
        q: "How is iCloseLeads different from a normal remote job board?",
        a: "A job board usually stops at the listing. iCloseLeads connects discovery with filtering, saving, AI proposals, Gmail-ready outreach, notes, and CRM follow-up so the lead can move toward revenue.",
      },
      {
        q: "Can I use remote job leads for direct outreach?",
        a: "Yes, when the opportunity includes a company domain, public contact signal, or clear hiring context. You should still verify the company and personalize the message before sending.",
      },
      {
        q: "Which niches work best for remote job lead search?",
        a: "High-signal niches include WordPress, Webflow, React, SEO, Meta ads, copywriting, design, automation, data, and virtual assistance because buyers often describe the problem clearly in public posts.",
      },
    ],
  },
  {
    slug: "local-business-leads",
    path: "/use-cases/local-business-leads",
    eyebrow: "Local Business Leads",
    title: "Local business leads",
    accentTitle: "for web designers, SEO consultants, and marketers",
    metaTitle: "Local Business Leads for Web Designers and SEO Consultants",
    metaDescription:
      "Find local business leads with no website, outdated websites, phone numbers, and map profiles. Built for freelancers selling websites, SEO, ads, and marketing services.",
    keywords: [
      "local business leads",
      "local business leads for web designers",
      "businesses without websites",
      "outdated website leads",
      "find web design clients",
      "local SEO client leads",
      "small business leads",
      "website redesign leads",
    ],
    heroSummary:
      "Find businesses that already show a reason to pitch: no website, outdated site, weak local presence, public phone number, strong reviews, or a service category that depends on trust and bookings.",
    primaryCta: "Find Local Leads Free",
    secondaryCta: "Read Lead Discovery",
    dashboardPath: "/dashboard/local-leads",
    searchIntent:
      "People searching for local business leads often want web design clients, SEO clients, or small businesses with visible marketing gaps. This page targets long-tail commercial intent around businesses without websites and outdated website leads.",
    audience:
      "Built for web designers, SEO consultants, local ads specialists, automation freelancers, copywriters, and agencies selling to small businesses.",
    outcome:
      "A practical local prospecting workflow where each lead includes the business profile, website signal, contact details when available, pitch angle, notes, and CRM status.",
    intro: [
      "Local prospecting works best when it starts with a visible business problem. A cleaning company with no website, a dental clinic with an outdated site, or a trades business with a weak mobile experience is not just a name in a spreadsheet. It is a business likely losing trust, calls, bookings, or quote requests.",
      "iCloseLeads helps freelancers search by business type and city, then filter by website status and contact readiness. The goal is not to pretend every business needs the same service. The goal is to find the gap, verify it, and write a useful first message.",
    ],
    signals: [
      { label: "No or unknown website", detail: "Useful for web design, landing page, booking flow, and starter website offers." },
      { label: "Outdated or unreachable site", detail: "Useful for redesign, speed, mobile, conversion, SEO, and maintenance packages." },
      { label: "Has phone", detail: "Prioritize businesses with direct contact paths when email is not visible." },
      { label: "Local trust signals", detail: "Ratings, reviews, category, and address help you judge whether the business is active enough to pitch." },
    ],
    workflow: [
      {
        title: "Pick a city and service category",
        description:
          "Search practical categories like dentist, plumber, cleaning service, gym, salon, roofer, accountant, or restaurant.",
      },
      {
        title: "Filter by website opportunity",
        description:
          "Use no website, unknown website, outdated site, or has website filters depending on the service you sell.",
      },
      {
        title: "Verify the map profile",
        description:
          "Open the map link and confirm the business details before adding it to outreach.",
      },
      {
        title: "Save the lead and pitch the business reason",
        description:
          "Keep the contact info, address, notes, pitch points, and proposal workflow together.",
      },
    ],
    keywordsCluster: [
      { group: "Core", terms: ["local business leads", "small business leads", "local client leads"] },
      { group: "Web design", terms: ["businesses without websites", "outdated website leads", "find web design clients"] },
      { group: "Marketing", terms: ["local SEO client leads", "lead generation for local marketing agencies", "website redesign leads"] },
    ],
    examples: [
      {
        title: "Cleaning company with no verified website",
        context: "Service business, phone visible, address active, website gap.",
        pitchAngle: "Offer a simple lead-capture site focused on calls and quote requests.",
      },
      {
        title: "Dental clinic with an old mobile experience",
        context: "High-value local service, reviews present, website modernization angle.",
        pitchAngle: "Pitch a booking-first redesign with trust signals and conversion tracking.",
      },
      {
        title: "Home services company with weak local SEO",
        context: "Website exists but the service category depends on local search visibility.",
        pitchAngle: "Offer a local SEO audit and location-page improvement plan.",
      },
    ],
    comparison: [
      { oldWay: "Manually browse maps and copy names into a spreadsheet.", icloseWay: "Search by city, category, website signal, and contact readiness." },
      { oldWay: "Pitch every business the same website package.", icloseWay: "Use the actual website status and business type to shape the pitch." },
      { oldWay: "Lose the map link and notes after saving.", icloseWay: "Keep contact info, Google Maps, notes, and proposal action on the saved lead." },
    ],
    faqs: [
      {
        q: "How do I find businesses without websites?",
        a: "Search a business category and city, then use the no or unknown website filter. Always verify the map profile before pitching because some businesses use social pages, booking platforms, or newly launched websites.",
      },
      {
        q: "Are local business leads good for web designers?",
        a: "Yes. Web designers can use no-website, outdated-site, and unreachable-site signals to build a more relevant pitch around trust, bookings, mobile experience, and lead capture.",
      },
      {
        q: "Can SEO consultants use local business leads?",
        a: "Yes. Local SEO consultants can search active business categories, review the profile, inspect the website status, and pitch visibility improvements tied to calls, appointments, and service-area demand.",
      },
      {
        q: "Does iCloseLeads hide raw source labels from users?",
        a: "Yes. The product experience is focused on business signals and lead quality rather than exposing raw data plumbing. Users see the prospecting context they need to verify and pitch responsibly.",
      },
    ],
  },
  {
    slug: "live-job-leads",
    path: "/use-cases/live-job-leads",
    eyebrow: "Live Job Leads",
    title: "Live job leads",
    accentTitle: "for freelancers who win on timing",
    metaTitle: "Live Job Leads for Freelancers | Fresh Hiring Signals and AI Pitches",
    metaDescription:
      "Track live job leads, urgent freelance opportunities, contact-ready posts, and fresh client demand. Save leads, draft proposals, and follow up from one workflow.",
    keywords: [
      "live job leads",
      "fresh freelance opportunities",
      "real-time freelance leads",
      "urgent freelance jobs",
      "live hiring signals",
      "freelance opportunities with email",
      "find freelance work fast",
      "AI proposal for job leads",
    ],
    heroSummary:
      "Some opportunities are won because your offer is better. Others are won because you show up while the need is still hot. Live Job Leads is built for fast-moving public demand.",
    primaryCta: "Open Live Jobs Free",
    secondaryCta: "See Remote Leads",
    dashboardPath: "/dashboard/live-jobs",
    searchIntent:
      "This page targets freelancers searching for fresh opportunities, urgent hiring posts, live job leads, and contact-ready public demand where timing matters.",
    audience:
      "Built for freelancers who prospect daily and want fast, relevant signals rather than old listings or static directories.",
    outcome:
      "A live prospecting routine where users can filter recent opportunities, save contact-ready leads, prepare proposals, and move fast without sending careless spam.",
    intro: [
      "The best time to pitch is often before a lead becomes old. A founder posts a problem, a small team mentions an urgent hiring need, or a company shares a request with enough detail to act. Wait too long and the inbox gets crowded.",
      "iCloseLeads turns live job signals into a usable workflow. You can filter by freshness, source, contact availability, urgency, and budget clues, then save the opportunity and write a proposal while the context is still current.",
    ],
    signals: [
      { label: "Urgency", detail: "Posts with immediate start language, deadlines, launch pressure, or support gaps deserve faster review." },
      { label: "Freshness", detail: "Newer posts are more likely to still need help and less likely to be saturated." },
      { label: "Contact visibility", detail: "Email or domain signals make a direct, respectful outreach path easier." },
      { label: "Specific problem", detail: "The clearer the problem, the easier it is to write a useful first message." },
    ],
    workflow: [
      {
        title: "Search the active lead window",
        description:
          "Use 12h, 24h, 48h, 72h, or 7d windows depending on how quickly you can respond.",
      },
      {
        title: "Filter to contact-ready posts",
        description:
          "When speed matters, prioritize opportunities with a visible email, domain, or clear next action.",
      },
      {
        title: "Save only leads you can act on today",
        description:
          "A live feed loses value if saved leads sit untouched for days.",
      },
      {
        title: "Send a short, relevant proposal",
        description:
          "Lead with the urgent problem, one proof point, and a small next step. Timing is the advantage.",
      },
    ],
    keywordsCluster: [
      { group: "Core", terms: ["live job leads", "fresh freelance opportunities", "real-time freelance leads"] },
      { group: "Urgency", terms: ["urgent freelance jobs", "same day freelance leads", "new hiring posts"] },
      { group: "Contact-ready", terms: ["freelance opportunities with email", "job leads with contact info", "direct outreach leads"] },
    ],
    examples: [
      {
        title: "Startup needs a landing page before launch",
        context: "Short deadline, clear deliverable, public urgency.",
        pitchAngle: "Offer a scoped 48-hour landing page sprint with one conversion goal.",
      },
      {
        title: "Creator needs email funnel help",
        context: "Revenue project, likely quick decision, contact signal present.",
        pitchAngle: "Pitch a concise funnel audit and one immediate improvement.",
      },
      {
        title: "Team needs analytics setup",
        context: "Specific tracking problem and business decision pressure.",
        pitchAngle: "Offer a diagnostic plan with dashboard deliverables and setup timeline.",
      },
    ],
    comparison: [
      { oldWay: "Check public feeds when you remember.", icloseWay: "Use a dedicated live lead feed sorted by freshness and signal quality." },
      { oldWay: "Save a link and forget the context.", icloseWay: "Save the lead with source, contact, notes, and proposal action." },
      { oldWay: "Write from scratch under pressure.", icloseWay: "Generate a draft from the lead context, then tighten it before sending." },
    ],
    faqs: [
      {
        q: "What are live job leads?",
        a: "Live job leads are recent public opportunities, hiring signals, and project requests that are fresh enough to act on quickly. They are useful when timing is part of the advantage.",
      },
      {
        q: "Are live job leads the same as remote job leads?",
        a: "They overlap, but the intent is different. Remote job leads focus on niche-matched remote work, while live job leads focus on freshness, urgency, and fast action.",
      },
      {
        q: "Should I only pitch leads with an email?",
        a: "No. Email makes outreach easier, but a strong lead can also have a company domain, job URL, or public application route. The key is to verify before contacting.",
      },
      {
        q: "How fast should I respond to a live lead?",
        a: "If the post is urgent and relevant, same day is best. Keep the message short, specific, and useful rather than rushing out a generic pitch.",
      },
    ],
  },
];

export const USE_CASE_MAP = USE_CASE_PAGES.reduce((acc, page) => {
  acc[page.slug] = page;
  return acc;
}, {} as Record<UseCaseSlug, UseCasePageData>);

export function getUseCasePage(slug: string): UseCasePageData | undefined {
  return USE_CASE_MAP[slug as UseCaseSlug];
}

export function useCaseMetadata(page: UseCasePageData): Metadata {
  const url = `${BASE_URL}${page.path}`;
  return {
    metadataBase: new URL(BASE_URL),
    title: page.metaTitle,
    description: page.metaDescription,
    keywords: page.keywords,
    alternates: { canonical: url },
    openGraph: {
      title: page.metaTitle,
      description: page.metaDescription,
      url,
      type: "website",
      siteName: "iCloseLeads",
    },
    twitter: {
      card: "summary_large_image",
      title: page.metaTitle,
      description: page.metaDescription,
    },
  };
}
