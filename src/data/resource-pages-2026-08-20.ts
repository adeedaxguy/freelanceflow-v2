import type { ResourcePage } from "./resource-pages";

const internalLinks = [
  { label: "600 free leads per week", href: "/blog/600-free-leads-per-week-for-freelancers" },
  { label: "Freelance client acquisition system", href: "/blog/freelance-client-acquisition-system" },
  { label: "Find freelance client leads", href: "/lead-generation/freelance-client-leads" },
  { label: "Lead discovery", href: "/features/lead-discovery" },
  { label: "AI proposals", href: "/features/ai-proposals" },
  { label: "CRM pipeline", href: "/features/crm-pipeline" },
];

type ResourceInput = {
  slug: string;
  title: string;
  keyword: string;
  relatedSearches: string[];
  audience: string;
  intent: string;
  searcherJob: string;
  competitorGap: string;
  workflowNudge: string;
  conversionPath: string;
  leadIn: string;
  pitch: string;
};

function buildResourcePage(input: ResourceInput): ResourcePage {
  return {
    slug: input.slug,
    title: input.title,
    metaTitle: `${input.title} | iCloseLeads`,
    metaDescription: `Use this ${input.keyword} workflow with iCloseLeads' free weekly lead allowance to find prospects, save proof, draft outreach, and follow up.`,
    keyword: input.keyword,
    relatedSearches: input.relatedSearches,
    audience: input.audience,
    intent: input.intent,
    researchIntent: {
      searcherJob: input.searcherJob,
      competitorGap: input.competitorGap,
      workflowNudge: input.workflowNudge,
      conversionPath: input.conversionPath,
    },
    summary: `${input.title} turns ${input.keyword} intent into a focused iCloseLeads workflow: search a narrow market, qualify public proof, save the lead, draft from context, and follow up without losing the reason to reach out.`,
    leadIn: input.leadIn,
    activationPlan: {
      trigger: `Use this when a visitor wants ${input.keyword} but still needs a practical first search, not another generic lead list.`,
      firstRun: "Pick one service offer, one buyer niche, and one signal before using the weekly free lead allowance.",
      savedLead: "Save only prospects with business fit, visible proof, a respectful contact path, and a clear first-message angle.",
      followUp: "Draft the first message from the saved proof, then set a follow-up so the search becomes a pipeline.",
    },
    steps: [
      "Choose one offer and one customer type before searching.",
      "Run a narrow lead search instead of collecting every possible business.",
      "Check whether the company has a visible need, public proof, and a reachable route.",
      "Save only qualified prospects with the reason attached.",
      "Generate a first pitch from the saved signal, then review it before sending.",
      "Track follow-up inside the same workflow so the free search creates momentum.",
    ],
    qualificationChecks: [
      {
        signal: "Specific buyer fit",
        whyItMatters: "Free leads only help when they match the freelancer's real offer and market.",
        nextMove: "Reject broad prospects and keep the niche, city, service, or role visible in the saved lead note.",
      },
      {
        signal: "Public proof",
        whyItMatters: "A business name is not enough; the first message needs a true reason to exist.",
        nextMove: "Attach the website gap, local profile, hiring signal, or source page before writing outreach.",
      },
      {
        signal: "Next-action clarity",
        whyItMatters: "The best SEO traffic should become signup, saved lead, pitch, and follow-up behavior.",
        nextMove: "Move from reading to one search, one saved lead, and one reviewed message in the same session.",
      },
    ],
    proofPoints: [
      "Fresh DataForSEO pulled exact U.S. demand around lead generation for freelancers, while GSC already shows client acquisition content is an iCloseLeads entry point.",
      "The 600-free-leads weekly offer gives visitors a low-friction reason to test the product before paying.",
      input.competitorGap,
    ],
    pitch: input.pitch,
    internalLinks,
    faqs: [
      {
        q: `How should I start with ${input.keyword}?`,
        a: "Start with one narrow search, then save only the leads that match your offer, show public proof, and have a respectful contact route.",
      },
      {
        q: "Can free users use this workflow?",
        a: "Yes. Free iCloseLeads users currently get a weekly lead allowance that can be used for focused searches, qualification, proposal drafts, and follow-up planning.",
      },
      {
        q: "Should I pitch every lead I find?",
        a: "No. Treat the allowance as research capacity. Contact only prospects where the offer, proof, and next step are clear.",
      },
    ],
  };
}

export const AUGUST_20_2026_RESOURCE_PAGES: ResourcePage[] = [
  buildResourcePage({
    slug: "free-b2b-leads-for-freelancers",
    title: "Free B2B Leads for Freelancers",
    keyword: "free B2B leads for freelancers",
    relatedSearches: [
      "free leads for freelancers",
      "lead generation for freelancers",
      "find clients for freelancers",
      "free lead generation tool for freelancers",
      "qualified B2B leads for freelancers",
    ],
    audience: "Freelancers, consultants, copywriters, SEO operators, and small agencies selling B2B services",
    intent: "The searcher wants free or low-risk B2B prospects they can test before paying for a lead source.",
    searcherJob: "Find enough qualified B2B prospects to validate one offer and send a small proof-led outreach batch.",
    competitorGap: "Generic free-lead pages chase volume, while freelancers need fit, proof, contact route, and follow-up quality before any message is sent.",
    workflowNudge: "Split the weekly allowance into focused searches by niche, save only proof-backed companies, and pitch from the reason they were saved.",
    conversionPath: "Signup, run one free B2B lead search, save qualified prospects, draft three proof-led messages, and follow up.",
    leadIn: "Use this workflow when you want B2B prospects without buying a blind list or relying only on marketplace jobs.",
    pitch: "Hi, I found your company while researching B2B leads for a focused freelance offer. One public signal suggested a small improvement opportunity, and I can send a short idea if that is useful.",
  }),
  buildResourcePage({
    slug: "free-local-business-leads-for-web-designers",
    title: "Free Local Business Leads for Web Designers",
    keyword: "free local business leads for web designers",
    relatedSearches: [
      "free web design leads",
      "local business leads for web designers",
      "businesses without websites",
      "find websites that need redesign",
      "web design leads for free",
    ],
    audience: "Web designers, WordPress freelancers, Webflow builders, and small web design agencies",
    intent: "The searcher wants local businesses that may need website, booking, mobile, SEO, or conversion help.",
    searcherJob: "Find local companies with a visible website or profile gap that can support a respectful web design pitch.",
    competitorGap: "Lead vendors often sell shared lists; this page teaches designers how to verify a real website need before saving or pitching.",
    workflowNudge: "Search one city and one category, look for website or conversion friction, and save only prospects with a clear improvement angle.",
    conversionPath: "Signup, run a local business search, save website-gap proof, draft a web design pitch, and follow up.",
    leadIn: "Use this when you sell websites and need a safer way to find prospects than saying every old website is a lead.",
    pitch: "Hi, I found your business while checking local companies where the website path could make it easier for customers to call, book, or request a quote. I can send a short observation if helpful.",
  }),
  buildResourcePage({
    slug: "client-acquisition-software-for-freelancers-free-plan",
    title: "Client Acquisition Software for Freelancers With a Free Plan",
    keyword: "client acquisition software for freelancers free plan",
    relatedSearches: [
      "client acquisition software for freelancers",
      "freelance client acquisition software",
      "freelancer CRM",
      "lead generation tools for freelancers",
      "free lead search tool",
    ],
    audience: "Freelancers comparing software for lead discovery, proposal drafting, outreach, and follow-up",
    intent: "The searcher wants software that helps win clients, but they need a free way to test the workflow first.",
    searcherJob: "Compare tools by whether one search can become one qualified saved lead, one reviewed pitch, and one follow-up.",
    competitorGap: "Most software comparisons list features; this page frames the decision around the complete acquisition workflow and a no-risk first search.",
    workflowNudge: "Test the free plan by running one narrow search and checking whether the saved leads create useful outreach context.",
    conversionPath: "Signup for free, run one acquisition sprint, save qualified leads, draft outreach, and review pipeline activity.",
    leadIn: "Use this when you are comparing client acquisition tools and want to know whether the system actually helps you move from search to conversation.",
    pitch: "Hi, I found your business while testing a client acquisition workflow for freelancers. The useful test is simple: can one search produce a qualified lead and a message worth sending?",
  }),
  buildResourcePage({
    slug: "qualified-leads-for-freelancers-scorecard",
    title: "Qualified Leads for Freelancers Scorecard",
    keyword: "qualified leads for freelancers",
    relatedSearches: [
      "lead qualification for freelancers",
      "freelancer lead score",
      "proposal ready leads",
      "freelance prospecting software",
      "freelance sales pipeline",
    ],
    audience: "Freelancers who need fewer weak leads and more proposal-ready opportunities",
    intent: "The searcher wants to know which leads are worth saving, pitching, and following up.",
    searcherJob: "Separate raw lead records from qualified prospects that have fit, proof, value, urgency, and a next step.",
    competitorGap: "Lead-list pages rarely explain when a lead should be rejected; this page gives a practical scorecard before outreach starts.",
    workflowNudge: "Score every lead before saving it, then draft only from the leads that pass the proof and contact checks.",
    conversionPath: "Signup, search the weekly free allowance, score the best prospects, and move only qualified leads into outreach.",
    leadIn: "Use this when you already have leads but do not know which ones deserve your time this week.",
    pitch: "Hi, I found your business while scoring qualified leads for a focused freelance offer. A public signal suggested one useful reason to talk, and I can share the short note if useful.",
  }),
];
