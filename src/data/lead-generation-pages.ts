import type { Metadata } from "next";

export type LeadGenerationSlug =
  | "web-design-leads"
  | "freelance-client-leads"
  | "remote-freelance-jobs"
  | "local-business-leads"
  | "businesses-without-websites";

export interface LeadGenerationPageData {
  slug: LeadGenerationSlug;
  path: string;
  primaryKeyword: string;
  metaTitle: string;
  metaDescription: string;
  eyebrow: string;
  title: string;
  accentTitle: string;
  summary: string;
  directAnswer: string;
  primaryCta: string;
  secondaryCta: string;
  dashboardPath: string;
  audience: string;
  outcome: string;
  proofPoints: string[];
  searchAngles: { group: string; terms: string[] }[];
  workflow: { title: string; description: string }[];
  sampleLeads: { title: string; signal: string; score: number; pitchAngle: string; nextStep: string }[];
  comparison: { manual: string; iclose: string }[];
  internalLinks: { label: string; href: string; description: string }[];
  faqs: { q: string; a: string }[];
}

const BASE_URL = "https://icloseleads.com";

export const LEAD_GENERATION_PAGES: LeadGenerationPageData[] = [
  {
    slug: "web-design-leads",
    path: "/lead-generation/web-design-leads",
    primaryKeyword: "web design leads",
    metaTitle: "Web Design Leads for Freelancers | Free Local Leads and Website-Gap Prospects",
    metaDescription:
      "Find web design leads for free from local businesses, weak websites, businesses without websites, and remote hiring signals. Start free with iCloseLeads.",
    eyebrow: "Web Design Leads",
    title: "Find web design leads",
    accentTitle: "with a real reason to pitch today",
    summary:
      "iCloseLeads helps web designers, WordPress developers, Webflow builders, and small agencies find free-to-start prospects with visible website, conversion, SEO, booking, or launch signals.",
    directAnswer:
      "The fastest way to find web design leads for free is to search for businesses with a visible website gap, recent hiring demand, or a weak Google Maps-to-website path, then pitch a specific outcome instead of sending a generic portfolio link. iCloseLeads brings those signals into one workflow so you can search, save, draft, and follow up.",
    primaryCta: "Find Web Design Leads Free",
    secondaryCta: "See local lead workflow",
    dashboardPath: "/dashboard/local-leads",
    audience:
      "Freelance web designers, WordPress developers, Webflow designers, Shopify specialists, landing page builders, and small web agencies.",
    outcome:
      "A focused first search that produces website prospects with context, pitch angles, and a next action.",
    proofPoints: [
      "Search local businesses by city and website status.",
      "Use remote job signals when companies are hiring for website, design, or marketing work.",
      "Move high-fit leads into AI proposals, owner checks, and CRM follow-up.",
    ],
    searchAngles: [
      { group: "Core intent", terms: ["web design leads", "website design leads", "leads for web design", "web design leads for free", "web design leads free"] },
      { group: "Buyer signal", terms: ["businesses needing websites", "outdated website leads", "local businesses without websites"] },
      { group: "Freelancer workflow", terms: ["find web design clients", "cold outreach for web designers", "web design prospecting"] },
    ],
    workflow: [
      { title: "Pick a narrow market", description: "Search one service area and niche so every result has a clear reason for a website pitch." },
      { title: "Filter for website gaps", description: "Prioritize no website, unverified website, outdated website, weak Google Maps-to-site flow, or weak conversion signals." },
      { title: "Open the owner path", description: "Check the business profile, public phone route, and owner or manager search before outreach." },
      { title: "Draft a specific pitch", description: "Turn the signal into a short message about calls, bookings, local SEO, or conversion." },
    ],
    sampleLeads: [
      {
        title: "Auto repair shop with no verified site",
        signal: "Local business result shows phone, address, and no clear website.",
        score: 84,
        pitchAngle: "Offer a mobile-first service page that turns near-me searches into quote calls.",
        nextStep: "Open Google Maps, confirm phone, then run owner/contact check.",
      },
      {
        title: "Dental clinic with an outdated booking flow",
        signal: "Website exists but appointment path is slow and unclear.",
        score: 78,
        pitchAngle: "Lead with booking conversion, trust signals, and location page cleanup.",
        nextStep: "Save lead and prepare a before/after mini-audit.",
      },
      {
        title: "Startup hiring a Webflow contractor",
        signal: "Remote job lead mentions landing page launch support.",
        score: 81,
        pitchAngle: "Pitch a fixed-scope launch sprint with a faster publish timeline.",
        nextStep: "Draft proposal from the job context.",
      },
    ],
    comparison: [
      { manual: "Search maps manually and copy businesses into a spreadsheet.", iclose: "Search by website status, niche, location, and phone/contact readiness from one screen." },
      { manual: "Send the same web design pitch to everyone.", iclose: "Use the visible business signal to write a sharper pitch angle." },
      { manual: "Lose track after the first message.", iclose: "Save the lead, add notes, prepare Gmail outreach, and follow up from CRM." },
    ],
    internalLinks: [
      { label: "Local Business Leads", href: "/lead-generation/local-business-leads", description: "Find businesses by city, category, website status, and phone signals." },
      { label: "Web design leads for free vs verified", href: "/resources/web-design-leads-for-free-vs-verified", description: "Compare free research with a safer verified workflow before you pitch." },
      { label: "AI Proposals", href: "/features/ai-proposals", description: "Turn a lead signal into a draft you can edit before sending." },
    ],
    faqs: [
      {
        q: "What counts as a web design lead?",
        a: "A web design lead is a business or hiring signal where a website, landing page, booking flow, SEO page, or conversion improvement could directly help the buyer. The best leads have a visible reason to pitch, not just a company name.",
      },
      {
        q: "Can iCloseLeads find businesses without websites?",
        a: "Yes. Local business search can prioritize no or unknown website status, then you can verify the profile before pitching.",
      },
      {
        q: "Can I get web design leads for free?",
        a: "Yes. A free workflow can work when you start with local business profiles, website gaps, and public hiring signals, then verify the context before you pitch. iCloseLeads is built to help you keep that verified context attached to the lead.",
      },
      {
        q: "Is this only for web designers?",
        a: "No. The same lead signals can work for SEO consultants, paid ads specialists, copywriters, brand designers, and automation freelancers, but this page is tuned for web design intent.",
      },
      {
        q: "What should I do after I find a lead?",
        a: "Verify the business, save the lead, open the decision-maker path when needed, draft a short pitch, and track the next follow-up in the CRM.",
      },
    ],
  },
  {
    slug: "freelance-client-leads",
    path: "/lead-generation/freelance-client-leads",
    primaryKeyword: "freelance client leads",
    metaTitle: "Freelance Client Leads | 600 Leads in a 3-Day Trial",
    metaDescription:
      "Find freelance client leads from remote jobs, live hiring signals, local businesses, owner paths, and AI-assisted outreach. Start with 600 leads for three days.",
    eyebrow: "Freelance Client Leads",
    title: "Find freelance client leads",
    accentTitle: "without living inside job boards",
    summary:
      "iCloseLeads gives freelancers one place to discover leads, qualify fit, write outreach, and track follow-up. The 3-day trial includes up to 600 lead results instead of forcing you to juggle tabs, lists, and generic templates.",
    directAnswer:
      "Freelance client leads convert better when they come from a recent signal: a company hiring, a local business with a website gap, a public request for help, or a visible decision-maker path. iCloseLeads lets trial users search up to 600 leads over three days and turn those signals into a smaller, better list of prospects.",
    primaryCta: "Find 600 Leads Free",
    secondaryCta: "Explore use cases",
    dashboardPath: "/dashboard/leads",
    audience:
      "Freelancers and solo agencies selling design, development, SEO, paid ads, copywriting, virtual assistance, automation, and consulting.",
    outcome:
      "A repeatable prospecting workflow that moves from search to saved lead to draft to follow-up.",
    proofPoints: [
      "Trial users can run up to 600 lead searches over three days before upgrading.",
      "Remote, local, and live job lead paths in one product.",
      "AI proposal drafting uses the lead context so messages are less generic.",
    ],
    searchAngles: [
      { group: "Core intent", terms: ["freelance client leads", "find freelance clients", "freelance lead generation"] },
      { group: "Outreach intent", terms: ["freelance cold outreach", "freelance cold email", "client acquisition for freelancers"] },
      { group: "Software intent", terms: ["freelance lead generation software", "freelance CRM", "AI proposal tool"] },
    ],
    workflow: [
      { title: "Use the 3-day trial allowance", description: "Start with 600 lead searches and focus them on one service, niche, or local market." },
      { title: "Filter by fit", description: "Use niche, freshness, location, website status, budget clues, or contact signals to cut weak prospects before saving them." },
      { title: "Save only pitchable leads", description: "Keep the leads where you can explain the problem and first message in one sentence." },
      { title: "Prepare outreach and follow-up", description: "Draft the email, review it, and track the next step without losing context." },
    ],
    sampleLeads: [
      {
        title: "SaaS team hiring landing page support",
        signal: "Remote post mentions conversion problem and launch date.",
        score: 86,
        pitchAngle: "Offer a short landing page sprint with clear copy and analytics cleanup.",
        nextStep: "Generate proposal and add a relevant portfolio link.",
      },
      {
        title: "Local service business with weak web presence",
        signal: "Business has phone and reviews but no clear website path.",
        score: 80,
        pitchAngle: "Pitch local SEO plus a simple quote-request website.",
        nextStep: "Find owner/contact path, then prepare a call script.",
      },
      {
        title: "Founder posting urgent marketing need",
        signal: "Live job signal includes deadline and channel.",
        score: 83,
        pitchAngle: "Lead with speed, narrow scope, and one measurable next step.",
        nextStep: "Save to CRM and prepare Gmail draft.",
      },
    ],
    comparison: [
      { manual: "Collect random companies and hope one replies.", iclose: "Start from visible timing, need, and fit signals." },
      { manual: "Keep leads in disconnected spreadsheets.", iclose: "Track saved leads, notes, outreach, and follow-up in one workflow." },
      { manual: "Write every first message from scratch.", iclose: "Generate a context-aware draft, then edit it before sending." },
    ],
    internalLinks: [
      { label: "Remote Freelance Jobs", href: "/lead-generation/remote-freelance-jobs", description: "Find fresh remote opportunities before the inbox gets crowded." },
      { label: "Freelance Cold Outreach", href: "/use-cases/freelance-cold-outreach", description: "Build a message around the signal, not a generic template." },
      { label: "CRM Pipeline", href: "/features/crm-pipeline", description: "Track saved leads, notes, stages, and follow-ups." },
    ],
    faqs: [
      {
        q: "What are freelance client leads?",
        a: "Freelance client leads are businesses, hiring posts, public requests, or decision-maker paths that indicate a possible need for your service.",
      },
      {
        q: "Why not just use job boards?",
        a: "Job boards are useful, but they are only one source. iCloseLeads combines remote jobs, local business signals, live opportunities, proposal drafting, and CRM tracking.",
      },
      {
        q: "Does iCloseLeads send emails for me?",
        a: "The safe workflow prepares Gmail-ready drafts and keeps outreach tracked. You review the message and stay in control.",
      },
      {
        q: "Can free users try this?",
        a: "Yes. Free users can run up to 600 lead searches per week, then save the best matches, draft outreach, and decide whether the workflow fits their service.",
      },
    ],
  },
  {
    slug: "remote-freelance-jobs",
    path: "/lead-generation/remote-freelance-jobs",
    primaryKeyword: "remote freelance jobs",
    metaTitle: "Remote Freelance Jobs and Leads | Find Fresh Contract Opportunities",
    metaDescription:
      "Find remote freelance jobs, contract roles, public hiring signals, and proposal-ready opportunities by niche. Start your first search free.",
    eyebrow: "Remote Freelance Jobs",
    title: "Find remote freelance jobs",
    accentTitle: "that can become direct clients",
    summary:
      "iCloseLeads treats remote job posts as client acquisition signals, then helps you sort by freshness, niche fit, contact data, and pitch quality.",
    directAnswer:
      "The best remote freelance jobs to pitch are fresh, niche-specific, and tied to a clear business problem. Instead of applying to everything, use iCloseLeads to search recent opportunities, save strong matches, and write a proposal from the actual job context.",
    primaryCta: "Search Remote Jobs Free",
    secondaryCta: "See remote lead use case",
    dashboardPath: "/dashboard/leads",
    audience:
      "Remote freelancers, contractors, consultants, developers, designers, marketers, copywriters, and agency operators.",
    outcome:
      "A faster path from fresh remote opportunity to proposal, follow-up, and CRM stage.",
    proofPoints: [
      "Search by niche and timeframe instead of browsing broad boards.",
      "Filter for contact signals, budget hints, urgency, and source quality.",
      "Use proposal drafts to respond with a specific plan, not a copied cover letter.",
    ],
    searchAngles: [
      { group: "Core intent", terms: ["remote freelance jobs", "remote contract jobs", "remote job leads"] },
      { group: "Niche intent", terms: ["remote web design jobs", "remote SEO jobs", "remote WordPress work"] },
      { group: "Action intent", terms: ["apply to remote freelance jobs", "pitch remote jobs", "freelance job alerts"] },
    ],
    workflow: [
      { title: "Search the last 12 to 72 hours", description: "Freshness matters because the first useful pitch often beats the tenth polished one." },
      { title: "Pick one niche", description: "Search a service such as WordPress, Webflow, SEO, Meta ads, React, or copywriting." },
      { title: "Check the signal", description: "Look for urgency, budget language, company domain, or a clear project pain." },
      { title: "Send a better first proposal", description: "Draft from the job context, add proof, and keep follow-up visible." },
    ],
    sampleLeads: [
      {
        title: "B2B SaaS needs Webflow cleanup",
        signal: "Fresh remote contract post with launch pressure.",
        score: 87,
        pitchAngle: "Offer a 5-day cleanup sprint tied to demo conversion.",
        nextStep: "Draft proposal and open company site for proof.",
      },
      {
        title: "Agency needs overflow WordPress work",
        signal: "Urgent delivery window and recurring support language.",
        score: 82,
        pitchAngle: "Pitch availability plus one small paid test task.",
        nextStep: "Save lead and prepare Gmail draft.",
      },
      {
        title: "Founder hiring Meta ads specialist",
        signal: "Clear paid social test with founder-led urgency.",
        score: 79,
        pitchAngle: "Offer a 14-day testing map with creative and budget guardrails.",
        nextStep: "Generate proposal from the role details.",
      },
    ],
    comparison: [
      { manual: "Apply after hundreds of people see the same job.", iclose: "Prioritize fresh posts and source-specific timing signals." },
      { manual: "Use a generic remote work cover letter.", iclose: "Write from the exact pain, role, and project context." },
      { manual: "Forget which jobs you already contacted.", iclose: "Track outreach and follow-up from the saved lead." },
    ],
    internalLinks: [
      { label: "Remote Job Leads", href: "/use-cases/remote-job-leads", description: "A deeper workflow for remote lead discovery." },
      { label: "AI Proposals", href: "/features/ai-proposals", description: "Draft proposals from job context and edit before sending." },
      { label: "Email Outreach", href: "/features/email-outreach", description: "Prepare Gmail-ready drafts without risky auto-send behavior." },
    ],
    faqs: [
      {
        q: "Are remote freelance jobs the same as remote job leads?",
        a: "They overlap. A remote freelance job is the public opportunity; a remote job lead is the opportunity plus context, fit, pitch angle, and follow-up path.",
      },
      {
        q: "Which niches work best?",
        a: "Website builds, WordPress, Webflow, React, SEO, paid ads, copywriting, design, analytics, automation, and virtual assistance usually produce clear public demand signals.",
      },
      {
        q: "Can I contact companies directly?",
        a: "When a public company domain or contact route is available, you can prepare direct outreach, but you should verify details and personalize the message before sending.",
      },
      {
        q: "How should I avoid low-quality jobs?",
        a: "Use freshness, niche fit, budget language, urgency, and contact readiness. Do not save leads where the buyer problem is unclear.",
      },
    ],
  },
  {
    slug: "local-business-leads",
    path: "/lead-generation/local-business-leads",
    primaryKeyword: "local business leads",
    metaTitle: "Local Business Leads | Free Web Design Leads by City, Website Signal, and Owner Path",
    metaDescription:
      "Find local business leads by city, category, website status, phone signals, Google Maps gaps, and owner/contact paths. Built for freelancers selling websites, SEO, ads, and branding.",
    eyebrow: "Local Business Leads",
    title: "Find local business leads",
    accentTitle: "with a clear pitch path",
    summary:
      "iCloseLeads helps freelancers find local businesses that may need websites, SEO, branding, booking flows, ads, content, or modernization, then route the best prospects into saved proof, proposals, and follow-up.",
    directAnswer:
      "Good local business leads are not just names on a map. They have a visible pitch reason: no website, an outdated site, weak local presence, a public phone route, recent reviews, or a category where better digital presence can create more calls and bookings. The best ones can move straight into signup, saved notes, and a proposal-ready pitch path.",
    primaryCta: "Search Local Leads Free",
    secondaryCta: "See businesses without websites",
    dashboardPath: "/dashboard/local-leads",
    audience:
      "Freelancers and agencies selling websites, local SEO, Google Business Profile help, branding, booking systems, POS setup, paid ads, and content.",
    outcome:
      "A city-level lead list with website signals, phone/contact hints, pitch context, and optional owner path checks.",
    proofPoints: [
      "Search by category and city for practical local prospecting.",
      "Filter by no website, outdated website, has website, phone availability, and small-operator signals.",
      "Open decision-maker checks from a saved local lead when the business is worth deeper research.",
    ],
    searchAngles: [
      { group: "Core intent", terms: ["local business leads", "local lead generation", "small business leads"] },
      { group: "Service intent", terms: ["local SEO leads", "web design leads near me", "businesses needing websites"] },
      { group: "Workflow intent", terms: ["find local clients", "local business prospecting", "business owner finder"] },
    ],
    workflow: [
      { title: "Search one city and category", description: "Pick a service category that matches what you can sell in the next 21 days." },
      { title: "Filter for buying signals", description: "Prioritize website gaps, phone availability, small-operator clues, and category fit." },
      { title: "Verify before outreach", description: "Open the business profile and confirm phone, address, website status, and recent activity." },
      { title: "Move into pitch or owner check", description: "Use the pitch panel, AI proposal, web design preview, or decision-maker workflow so the lead becomes a tracked next action instead of another browser tab." },
    ],
    sampleLeads: [
      {
        title: "Cleaning service with phone and no clear website",
        signal: "Local profile has address and number but weak web presence.",
        score: 76,
        pitchAngle: "Offer a simple website plus local SEO pages for service-area calls.",
        nextStep: "Verify profile and run owner/contact search.",
      },
      {
        title: "Barber shop with outdated booking path",
        signal: "Business has reviews but no smooth booking or conversion flow.",
        score: 73,
        pitchAngle: "Pitch booking, menu, reviews, and location trust in one mobile page.",
        nextStep: "Save lead and prepare a call script.",
      },
      {
        title: "Restaurant with weak local search visibility",
        signal: "Website status unclear and conversion path likely fragmented.",
        score: 71,
        pitchAngle: "Lead with menu, reservations, photos, and local search cleanup.",
        nextStep: "Open maps link and verify current site.",
      },
    ],
    comparison: [
      { manual: "Click through maps one business at a time.", iclose: "Search, filter, and compare local prospects in a lead workflow." },
      { manual: "Pitch every business the same website package.", iclose: "Use website status, category, phone, and small-operator clues to shape the pitch." },
      { manual: "Forget which profiles you already checked.", iclose: "Save leads, add notes, open owner checks, and track follow-up." },
    ],
    internalLinks: [
      { label: "Businesses Without Websites", href: "/lead-generation/businesses-without-websites", description: "Focus on the clearest website gap." },
      { label: "Decision Maker Finder", href: "/features/lead-discovery#capabilities", description: "Move from a business profile into owner/contact verification." },
      { label: "Web Design Leads", href: "/lead-generation/web-design-leads", description: "Use local business signals to sell better websites." },
    ],
    faqs: [
      {
        q: "What is a local business lead?",
        a: "A local business lead is a nearby company or operator that may need a service you sell, such as a website, SEO, ads, branding, booking, content, or automation.",
      },
      {
        q: "Can iCloseLeads show exact owner names?",
        a: "It can help you open owner and manager verification paths from public business information. Some businesses publish owner details clearly; others require manual verification through public profiles, websites, or registries.",
      },
      {
        q: "Why do some local leads not show phone numbers?",
        a: "Phone availability depends on what the public source exposes. iCloseLeads surfaces phone data when available and marks uncertain number types conservatively.",
      },
      {
        q: "Should I pitch every local business without a website?",
        a: "No. Prioritize businesses with real commercial intent, active operations, visible reviews or phone routes, and a pitch that connects to more calls, bookings, or trust.",
      },
    ],
  },
  {
    slug: "businesses-without-websites",
    path: "/lead-generation/businesses-without-websites",
    primaryKeyword: "businesses without websites",
    metaTitle: "Find Businesses Without Websites | Web Design Leads for Local Outreach",
    metaDescription:
      "Find businesses without websites or with unknown website status, then verify profiles, phone routes, and pitch angles for web design outreach.",
    eyebrow: "Businesses Without Websites",
    title: "Find businesses without websites",
    accentTitle: "and pitch the right ones",
    summary:
      "iCloseLeads helps web designers and local marketers find businesses with no or unclear website presence, then verify whether the lead is worth pitching.",
    directAnswer:
      "Businesses without websites can be strong web design leads, but only when they are active, reachable, and likely to benefit from more calls, bookings, trust, or local search visibility. iCloseLeads helps you filter for that signal before you spend time pitching.",
    primaryCta: "Find No-Website Leads Free",
    secondaryCta: "See web design leads",
    dashboardPath: "/dashboard/local-leads",
    audience:
      "Web designers, local SEO consultants, branding freelancers, automation specialists, and small agencies selling digital presence to local operators.",
    outcome:
      "A cleaner list of no-website or unknown-website prospects with a practical verification and pitch path.",
    proofPoints: [
      "Filter local results by no or unknown website status.",
      "Use phone and category signals to avoid dead-end prospects.",
      "Open maps/profile links and decision-maker checks before pitching.",
    ],
    searchAngles: [
      { group: "Core intent", terms: ["businesses without websites", "companies without websites", "find businesses with no website"] },
      { group: "Sales intent", terms: ["web design clients", "sell websites to local businesses", "website prospecting"] },
      { group: "Verification intent", terms: ["business phone lookup", "business owner finder", "Google business profile leads"] },
    ],
    workflow: [
      { title: "Start with a local category", description: "Choose industries where a website can clearly improve calls, bookings, trust, or menus." },
      { title: "Filter to no or unknown website", description: "Use website status as the first screen, then verify the business profile manually." },
      { title: "Check reachability", description: "Look for phone, address, recent activity, and whether the business appears active." },
      { title: "Pitch a small first win", description: "Lead with a practical page, booking flow, local SEO fix, or quote request path." },
    ],
    sampleLeads: [
      {
        title: "Mobile mechanic with no visible website",
        signal: "Service category has clear call intent and public phone route.",
        score: 85,
        pitchAngle: "Offer a one-page mobile site built around quote calls and service areas.",
        nextStep: "Verify profile, then prepare call script.",
      },
      {
        title: "Food truck with social-only presence",
        signal: "Business likely relies on social profiles but needs location, menu, and events page.",
        score: 77,
        pitchAngle: "Pitch a lightweight site for menu, catering, locations, and search visibility.",
        nextStep: "Search social profiles and confirm active schedule.",
      },
      {
        title: "Small cleaning operator",
        signal: "Local service with phone and address but unclear website status.",
        score: 74,
        pitchAngle: "Offer service-area pages plus trust badges and simple quote form.",
        nextStep: "Save lead and open owner verification.",
      },
    ],
    comparison: [
      { manual: "Search random maps terms and guess who has no site.", iclose: "Start with no/unknown website filtering and then verify before outreach." },
      { manual: "Pitch a full redesign to a business with no digital base.", iclose: "Offer a small first website win tied to calls, bookings, or trust." },
      { manual: "Waste time on inactive businesses.", iclose: "Use phone, address, category, and profile checks to prioritize active operators." },
    ],
    internalLinks: [
      { label: "Web Design Leads", href: "/lead-generation/web-design-leads", description: "Turn no-website prospects into a focused design pipeline." },
      { label: "Local Business Leads", href: "/lead-generation/local-business-leads", description: "Search broader local categories by city and signal." },
      { label: "AI Proposals", href: "/features/ai-proposals", description: "Turn the qualified lead into a reviewed outreach draft." },
    ],
    faqs: [
      {
        q: "Are businesses without websites always good leads?",
        a: "No. The best prospects are active, reachable, and likely to gain from calls, bookings, local search, trust, menus, quote forms, or service pages.",
      },
      {
        q: "How should I pitch a business without a website?",
        a: "Start with a small, specific outcome: more calls, easier booking, a trustworthy service page, menu visibility, or local search presence. Avoid leading with a huge redesign package.",
      },
      {
        q: "Can I verify the business profile first?",
        a: "Yes. iCloseLeads keeps profile links and verification paths close to the lead so you can confirm the business before outreach.",
      },
      {
        q: "What services fit these leads?",
        a: "Simple websites, local SEO, Google Business Profile cleanup, booking systems, quote forms, branding, content, and paid ads can all fit depending on the category.",
      },
    ],
  },
];

export function getLeadGenerationPage(slug: string) {
  return LEAD_GENERATION_PAGES.find(page => page.slug === slug);
}

export function leadGenerationMetadata(page: LeadGenerationPageData): Metadata {
  const canonical = `${BASE_URL}${page.path}`;
  return {
    title: page.metaTitle,
    description: page.metaDescription,
    keywords: [
      page.primaryKeyword,
      ...page.searchAngles.flatMap(group => group.terms),
      "iCloseLeads",
      "freelance lead generation software",
      "cold outreach for freelancers",
      "AI proposal generator",
    ],
    alternates: { canonical },
    openGraph: {
      type: "website",
      url: canonical,
      siteName: "iCloseLeads",
      title: page.metaTitle,
      description: page.metaDescription,
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: page.metaTitle }],
    },
    twitter: {
      card: "summary_large_image",
      title: page.metaTitle,
      description: page.metaDescription,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
    },
  };
}
