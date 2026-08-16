import type { ResourcePage } from "./resource-pages";

const internalLinks = [
  { label: "600 free leads per week", href: "/blog/600-free-leads-per-week-for-freelancers" },
  { label: "Freelance client acquisition system", href: "/blog/freelance-client-acquisition-system" },
  { label: "Lead discovery", href: "/features/lead-discovery" },
  { label: "AI proposals", href: "/features/ai-proposals" },
  { label: "CRM pipeline", href: "/features/crm-pipeline" },
];

type August17ResourceInput = {
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

function buildResourcePage(input: August17ResourceInput): ResourcePage {
  return {
    slug: input.slug,
    title: input.title,
    metaTitle: `${input.title} | iCloseLeads`,
    metaDescription: `Use this ${input.keyword} workflow to find better prospects, save proof, draft outreach, and turn free weekly leads into client conversations.`,
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
    summary: `${input.title} turns ${input.keyword} demand into a focused iCloseLeads workflow: choose one offer, find verified prospects, save source proof, write from context, and follow up inside the pipeline.`,
    leadIn: input.leadIn,
    activationPlan: {
      trigger: `Use this page when a visitor searches for ${input.keyword} and needs a practical way to start prospecting today.`,
      firstRun: "Pick one buyer niche, one offer, and one proof signal before opening a broad lead list.",
      savedLead: "Save only prospects with business fit, visible proof, a contact route, and a clear first-message angle.",
      followUp: "Draft the message from the saved proof, then schedule the next follow-up before adding more leads.",
    },
    steps: [
      "Choose one service offer and one buyer niche.",
      "Search for prospects using the narrowest source that matches the keyword intent.",
      "Verify the business with a public signal before saving it.",
      "Score the lead for fit, urgency, value, and contactability.",
      "Draft the first message from proof instead of a generic template.",
      "Move the lead into CRM follow-up so the search session becomes a pipeline.",
    ],
    qualificationChecks: [
      {
        signal: "Visible buying context",
        whyItMatters: "A lead is stronger when the business has a public reason to care about the offer.",
        nextMove: "Save the source URL, page gap, job post, profile signal, or business note before outreach.",
      },
      {
        signal: "Offer fit",
        whyItMatters: "Broad lead lists create low-quality outreach and weak replies.",
        nextMove: "Reject prospects that do not match the service, size, niche, or geography for the campaign.",
      },
      {
        signal: "Follow-up readiness",
        whyItMatters: "Client acquisition depends on organized follow-up, not one-off messages.",
        nextMove: "Set the lead status, next action, and follow-up date immediately after drafting.",
      },
    ],
    proofPoints: [
      "DataForSEO showed exact U.S. demand around lead generation for freelancers and find clients for freelancers.",
      "The strongest iCloseLeads conversion path is search intent -> free lead search -> saved qualified prospect -> AI-assisted first message -> CRM follow-up.",
      input.competitorGap,
    ],
    pitch: input.pitch,
    internalLinks,
    faqs: [
      {
        q: `What is the first step for ${input.keyword}?`,
        a: "Start with one offer and one buyer type, then search for prospects with a visible business reason to contact them.",
      },
      {
        q: "Should I use all 600 free weekly leads at once?",
        a: "No. Use the weekly allowance to run several focused searches, save only qualified prospects, and learn which niche responds before scaling.",
      },
      {
        q: "How does iCloseLeads help after the lead is found?",
        a: "It keeps the source proof, qualification notes, AI proposal draft, Gmail-ready outreach, and CRM follow-up together.",
      },
    ],
  };
}

export const AUGUST_17_2026_RESOURCE_PAGES: ResourcePage[] = [
  buildResourcePage({
    slug: "lead-generation-for-freelancers",
    title: "Lead Generation for Freelancers",
    keyword: "lead generation for freelancers",
    relatedSearches: [
      "freelancers for lead generation",
      "freelance lead generation",
      "find clients for freelancers",
      "free leads for freelancers",
      "client acquisition for freelancers",
    ],
    audience: "Freelancers who need a repeatable path from prospect research to client conversations",
    intent: "The searcher wants a practical way to find prospects without depending only on marketplaces or referrals.",
    searcherJob: "Find qualified prospects for one freelance offer and turn them into outreach-ready leads.",
    competitorGap: "Many lead-generation pages talk about lists or tactics but do not connect prospect proof, message context, and follow-up in one workflow.",
    workflowNudge: "Run a narrow lead search, save only proof-backed prospects, generate a first message, and review the pipeline daily.",
    conversionPath: "Signup, run a free search, save the first verified lead, draft the message, and set a follow-up.",
    leadIn: "Use this when you want freelance leads that are specific enough to contact, not a generic list that creates more work.",
    pitch: "Hi, I found your business while researching lead generation for freelancers. The useful starting point is a specific lead with proof, not a broad list. I noticed a simple first step that may help and can send it over if useful.",
  }),
  buildResourcePage({
    slug: "find-clients-for-freelancers",
    title: "Find Clients for Freelancers",
    keyword: "find clients for freelancers",
    relatedSearches: [
      "how to find clients as a freelancer",
      "find freelance clients",
      "freelancer client acquisition",
      "free leads for freelancers",
      "freelance prospecting",
    ],
    audience: "Freelancers who need real buyer conversations instead of more generic advice",
    intent: "The searcher wants a client-finding system that works beyond Upwork, referrals, and random social posting.",
    searcherJob: "Turn one target niche into a short list of prospects with proof and a first outreach angle.",
    competitorGap: "Advice pages often list channels, while the missing job is choosing one prospect, proving fit, and writing a message from evidence.",
    workflowNudge: "Pick a niche, search for public signals, save qualified leads, then use iCloseLeads to draft and follow up.",
    conversionPath: "Signup, use the free weekly leads allowance, and build one qualified mini-pipeline before expanding.",
    leadIn: "Use this when you are done collecting tips and want a repeatable way to find the next client conversation.",
    pitch: "Hi, I found your business while mapping ways freelancers can find better-fit clients. One practical signal stood out, and I think it could become a useful first conversation if you want me to share it.",
  }),
  buildResourcePage({
    slug: "free-lead-generation-tool-for-freelancers",
    title: "Free Lead Generation Tool for Freelancers",
    keyword: "free lead generation tool for freelancers",
    relatedSearches: [
      "free leads for freelancers",
      "free lead finder for freelancers",
      "lead generation tools for freelancers",
      "freelance client acquisition tool",
      "600 free leads per week",
    ],
    audience: "Freelancers comparing free lead tools before committing to a paid prospecting stack",
    intent: "The searcher wants to test a tool without paying before they know whether the lead source fits their niche.",
    searcherJob: "Use a free allowance to validate a niche, qualify prospects, and create the first outreach queue.",
    competitorGap: "Free tool pages often focus on limits or signups, while the better answer explains how to use a free weekly allowance without wasting it.",
    workflowNudge: "Split the weekly free leads into small niche tests and keep only prospects with proof and a follow-up route.",
    conversionPath: "Signup for free, run one focused search, save the best leads, and upgrade only when a repeatable niche is visible.",
    leadIn: "Use this when you want a no-risk way to test whether iCloseLeads can find the kind of clients you actually want.",
    pitch: "Hi, I found your business while testing free lead generation workflows for freelancers. The best free test is not volume. It is whether one narrow search finds a real prospect with a reason to talk.",
  }),
];
