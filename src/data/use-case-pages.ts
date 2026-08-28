import type { Metadata } from "next";

export type UseCaseSlug =
  | "remote-job-leads"
  | "freelance-cold-outreach"
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
      "remote leads",
      "remoteleads",
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
    slug: "freelance-cold-outreach",
    path: "/use-cases/freelance-cold-outreach",
    eyebrow: "Freelance Cold Outreach",
    title: "Freelance cold outreach",
    accentTitle: "that starts from real buying signals",
    metaTitle: "Freelance Cold Outreach Software | Find Leads, Draft Better Emails, and Track Replies",
    metaDescription:
      "Improve freelance cold outreach with fresh lead discovery, decision-maker checks, Gmail-ready drafts, AI proposal support, and CRM follow-up built for freelancers.",
    keywords: [
      "freelance cold outreach",
      "freelance cold outreach software",
      "cold outreach for freelancers",
      "freelance cold email",
      "cold email outreach for freelancers",
      "find freelance clients",
      "freelance lead generation",
      "freelance outreach tool",
      "freelance cold outreach templates",
      "AI cold email generator for freelancers",
      "personalized freelance proposals",
      "Gmail outreach for freelancers",
    ],
    heroSummary:
      "Cold outreach works when the first message has a real reason to exist. iCloseLeads helps freelancers find timely lead signals, verify the contact path, and write outreach that feels researched instead of copied, then move the best replies toward a saved lead, Gmail draft, and follow-up workflow instead of another disconnected spreadsheet.",
    primaryCta: "Start Outreach Free",
    secondaryCta: "See AI Proposals",
    dashboardPath: "/dashboard/leads",
    searchIntent:
      "People searching for freelance cold outreach usually want a repeatable way to find clients, write better cold emails, and avoid generic spam. This page targets that practical commercial intent.",
    audience:
      "Built for freelancers, consultants, and small agencies selling websites, SEO, paid ads, design, copywriting, automation, development, and marketing support.",
    outcome:
      "A signal-led outreach workflow where every saved lead has context, a pitch angle, a contact route, notes, Gmail-ready draft support, and follow-up status.",
    intro: [
      "Most freelance cold outreach fails because it starts with a list, not a reason. A stranger does not need another generic message about your services. They need to see that you noticed a real problem, timing cue, job post, website gap, or business signal that makes your offer relevant now.",
      "iCloseLeads is built for that style of outreach. You can find remote job leads, local business opportunities, live hiring signals, and decision-maker paths, then turn the context into a sharp first message. The result is not more noise. It is a smaller list of better prospects with a stronger reason to reply and a clearer route into Gmail and follow-up.",
    ],
    signals: [
      {
        label: "Fresh lead signal",
        detail: "Use recent remote posts, live job signals, and local business gaps so the outreach starts from something current.",
      },
      {
        label: "Specific business reason",
        detail: "Pitch the website issue, hiring need, launch pressure, booking gap, or marketing problem instead of opening with a generic intro.",
      },
      {
        label: "Decision-maker path",
        detail: "For local businesses, check public owner, manager, social profile, phone route, and registry guidance before deciding how to reach out.",
      },
      {
        label: "Human proposal draft",
        detail: "Generate a first draft from the lead context, then edit the opener, proof point, and next step before sending.",
      },
      {
        label: "Follow-up memory",
        detail: "Save notes, outreach status, and next actions so good leads do not disappear after the first message.",
      },
    ],
    workflow: [
      {
        title: "Choose one offer",
        description:
          "Pick one service to sell this week, such as Webflow, WordPress, SEO, Meta ads, landing pages, or automation.",
      },
      {
        title: "Find leads with a visible reason",
        description:
          "Search remote jobs, local businesses, or live signals where the business problem is clear enough to reference.",
      },
      {
        title: "Write from the signal",
        description:
          "Use the job post, business profile, website status, or contact route as the first sentence of the pitch.",
      },
      {
        title: "Track replies and follow-ups",
        description:
          "Move each lead through saved, contacted, replied, follow-up, won, or lost instead of relying on memory.",
      },
    ],
    keywordsCluster: [
      { group: "Core", terms: ["freelance cold outreach", "cold outreach for freelancers", "freelance cold email"] },
      { group: "Lead sourcing", terms: ["find freelance clients", "freelance lead generation", "remote job leads"] },
      { group: "Pitch workflow", terms: ["AI proposal generator", "cold email outreach for freelancers", "freelance CRM"] },
    ],
    examples: [
      {
        title: "B2B SaaS team needs Webflow help",
        context: "Fresh remote post, marketing-site pain, and a clear delivery window.",
        pitchAngle: "Open with the launch timing, mention one similar Webflow outcome, and offer a short cleanup sprint.",
      },
      {
        title: "Local business has no verified website",
        context: "Active map profile, public phone route, and a service category that depends on trust.",
        pitchAngle: "Reference the missing website, tie it to missed calls or quote requests, and suggest a simple starter site.",
      },
      {
        title: "Agency hiring overflow support",
        context: "Urgent delivery language and likely recurring work if the first project goes well.",
        pitchAngle: "Lead with availability, the exact skill match, and a low-friction first task.",
      },
    ],
    comparison: [
      { oldWay: "Buy a generic list and send the same message.", icloseWay: "Start from remote, local, and live signals that give each pitch a real reason." },
      { oldWay: "Write cold emails from scratch every time.", icloseWay: "Generate a draft from the opportunity context, then personalize the proof and next step." },
      { oldWay: "Forget who you contacted.", icloseWay: "Save leads, notes, proposal drafts, and follow-up stages in one CRM workflow." },
    ],
    faqs: [
      {
        q: "What is freelance cold outreach?",
        a: "Freelance cold outreach is the process of contacting potential clients who have not asked for a proposal yet, but show a public signal that your service may help them. Good outreach references a specific reason, not just a generic service pitch.",
      },
      {
        q: "How do I make freelance cold outreach less spammy?",
        a: "Use a smaller list, verify the business or job signal, mention a real observation, keep the message short, and give the recipient a simple next step. The goal is relevance, not volume.",
      },
      {
        q: "What should I write in a freelance cold email?",
        a: "Start with the reason you are reaching out, connect it to one outcome you can help with, add a short proof point, and ask for a low-pressure next step. Avoid long introductions and vague claims.",
      },
      {
        q: "How does iCloseLeads help with cold outreach for freelancers?",
        a: "iCloseLeads helps you find lead signals, save the best prospects, check decision-maker paths, generate proposal drafts, prepare Gmail outreach, and track follow-up so cold outreach becomes a repeatable workflow instead of a pile of disconnected tabs.",
      },
    ],
  },
  {
    slug: "local-business-leads",
    path: "/use-cases/local-business-leads",
    eyebrow: "Local Business Leads",
    title: "Local business leads",
    accentTitle: "for web designers, SEO consultants, and marketers",
    metaTitle: "Local Business Leads | Free Web Design Leads, Google Maps Gaps, and Owner Paths",
    metaDescription:
      "Find local business leads for web designers, SEO consultants, and marketers using website gaps, Google Maps listing signals, phone numbers, and owner or manager paths.",
    keywords: [
      "local business leads",
      "free local business leads",
      "local business leads for web designers",
      "web design leads",
      "web design leads for free",
      "600 free leads per week",
      "leads for web design",
      "exclusive web design leads",
      "businesses without websites",
      "outdated website leads",
      "find web design clients",
      "local SEO client leads",
      "google maps prospecting tool",
      "google maps listing pitch",
      "business owner name finder",
      "decision maker finder for local business",
      "small business leads",
      "website redesign leads",
    ],
    heroSummary:
      "Find local business leads that already show a reason to pitch: no website, outdated site, weak Google Maps-to-website flow, public phone number, owner or manager verification path, strong reviews, or a service category that depends on trust and bookings. Then move the best leads into signup, a real local lead search, proposal drafting, and saved-lead follow-up without losing context or bouncing between tools.",
    primaryCta: "Search 600 Local Leads Free",
    secondaryCta: "See Google Maps Pitch Workflow",
    dashboardPath: "/dashboard/local-leads",
    searchIntent:
      "People searching for local business leads often want free web design leads, SEO clients, Google Maps listing pitch ideas, or small businesses with visible marketing gaps. This page targets that commercial intent with no-website, outdated-website, and local-profile conversion paths.",
    audience:
      "Built for web designers, SEO consultants, local ads specialists, automation freelancers, copywriters, and agencies selling to small businesses.",
    outcome:
      "A practical local prospecting workflow where each lead includes the business profile, website signal, Google Maps context, contact details when available, owner or manager research path, pitch angle, proposal route, notes, and CRM status, plus a clear route into signup and the local-leads dashboard.",
    intro: [
      "Local prospecting works best when it starts with a visible business problem. A cleaning company with no website, a dental clinic with an outdated site, or a Google Maps listing that gets attention but sends visitors to a weak website is not just a name in a spreadsheet. It is a business likely losing trust, calls, bookings, or quote requests, which is why this query converts better than generic lead-advice pages.",
      "iCloseLeads helps freelancers search by business type and city, then filter by website status, local-profile signal, and contact readiness. When a lead looks worth pursuing, Decision Maker Finder helps you look for public owner or manager signals, social profiles, phone routes, registry guidance, and proof links. The goal is not to pretend every business needs the same service. The goal is to find the gap, verify the contact route, and route the lead into signup, proposal drafting, and a useful first message tied back to calls, quotes, or bookings.",
    ],
    signals: [
      { label: "No or unknown website", detail: "Useful for web design, landing page, booking flow, and starter website offers." },
      { label: "Outdated or unreachable site", detail: "Useful for redesign, speed, mobile, conversion, SEO, and maintenance packages." },
      { label: "Has phone", detail: "Prioritize businesses with direct contact paths when email is not visible." },
      { label: "Owner or manager path", detail: "Use decision maker checks to look for public owner names, manager roles, social profiles, and verification links before pitching." },
      { label: "Local trust signals", detail: "Ratings, reviews, category, and address help you judge whether the business is active enough to pitch." },
    ],
    workflow: [
      {
        title: "Pick a city, service category, and 600-lead batch",
        description:
          "Use the free allowance on practical categories like dentist, plumber, cleaning service, gym, salon, roofer, accountant, or restaurant.",
      },
      {
        title: "Filter by website opportunity",
        description:
          "Use no website, unknown website, outdated site, has website, or Google Maps profile-to-site gap filters depending on the service you sell.",
      },
      {
        title: "Verify the map profile",
        description:
          "Open the map link and confirm the business details before adding it to outreach.",
      },
      {
        title: "Check the owner or manager route",
        description:
          "Use Decision Maker Finder for public owner names, manager signals, social profiles, phone/email verification searches, and registry guidance.",
      },
      {
        title: "Save the lead and pitch the business reason",
        description:
          "Keep the contact info, address, notes, pitch points, and proposal workflow together so the first search can turn into signup and a tracked next action.",
      },
    ],
    keywordsCluster: [
      { group: "Core", terms: ["local business leads", "small business leads", "local client leads"] },
      { group: "Web design", terms: ["businesses without websites", "outdated website leads", "find web design clients"] },
      { group: "Free offer", terms: ["free local business leads", "600 free leads per week", "web design leads free"] },
      { group: "Google Maps pitch", terms: ["the pitch google maps listing", "Google Maps listing pitch", "Google Maps prospecting tool"] },
      { group: "Decision makers", terms: ["business owner name finder", "find business owner contact", "decision maker finder for local business"] },
      { group: "Marketing", terms: ["local SEO client leads", "lead generation for local marketing agencies", "website redesign leads"] },
    ],
    examples: [
      {
        title: "Cleaning company with no verified website",
        context: "Service business, phone visible, address active, website gap, owner route worth checking.",
        pitchAngle: "Verify the public contact route, then offer a simple lead-capture site focused on calls and quote requests.",
      },
      {
        title: "Dental clinic with an old mobile experience",
        context: "High-value local service, reviews present, website modernization angle.",
        pitchAngle: "Pitch a booking-first redesign with trust signals and conversion tracking.",
      },
      {
        title: "Google Maps listing with active calls but weak website path",
        context: "Local demand is visible, the phone route works, and the owned site does not make the next action easy.",
        pitchAngle: "Pitch a profile-to-website fix focused on quotes, bookings, or location-page trust instead of a generic redesign.",
      },
      {
        title: "Home services company with weak local SEO",
        context: "Website exists but the service category depends on local search visibility.",
        pitchAngle: "Offer a local SEO audit and location-page improvement plan.",
      },
    ],
    comparison: [
      { oldWay: "Manually browse maps and copy names into a spreadsheet.", icloseWay: "Search by city, category, website signal, and contact readiness." },
      { oldWay: "Pitch every business the same website package.", icloseWay: "Use the actual website status, business type, and owner/contact route to shape the pitch." },
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
        q: "Can I find the owner or decision maker for a local business?",
        a: "Decision Maker Finder helps you check public owner and manager signals, business profile links, social profile searches, phone/email verification routes, and registry guidance where available. It should be used as a verification workflow because not every small business publishes a named owner.",
      },
      {
        q: "Can SEO consultants use local business leads?",
        a: "Yes. Local SEO consultants can search active business categories, review the profile, inspect the website status, and pitch visibility improvements tied to calls, appointments, and service-area demand.",
      },
      {
        q: "How should I pitch a Google Maps listing lead?",
        a: "Start with the visible profile-to-website or profile-to-conversion gap. Mention the action a customer is likely trying to take next, such as calling, booking, or requesting a quote, then offer one focused improvement instead of a broad redesign pitch.",
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
      "live freelance leads",
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
