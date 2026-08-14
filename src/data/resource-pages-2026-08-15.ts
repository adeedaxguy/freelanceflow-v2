import type { ResourcePage } from "./resource-pages";

const sharedLinks = [
  { label: "Freelance client acquisition system", href: "/blog/freelance-client-acquisition-system" },
  { label: "Client acquisition software comparison", href: "/blog/client-acquisition-software-comparison-for-freelancers" },
  { label: "Lead discovery", href: "/features/lead-discovery" },
  { label: "AI proposal generator", href: "/features/ai-proposals" },
  { label: "CRM pipeline", href: "/features/crm-pipeline" },
];

type August15ResourceInput = {
  slug: string;
  title: string;
  keyword: string;
  relatedSearches: string[];
  audience: string;
  intent: string;
  searcherJob: string;
  competitorGap: string;
  workflow: string;
  conversionPath: string;
  signal: string;
  pitchAngle: string;
  internalLinks?: ResourcePage["internalLinks"];
};

function buildPage(input: August15ResourceInput): ResourcePage {
  return {
    slug: input.slug,
    title: input.title,
    metaTitle: `${input.title} | iCloseLeads`,
    metaDescription: `Use ${input.keyword} research to find qualified prospects, save proof, draft outreach, and track follow-up inside iCloseLeads.`,
    keyword: input.keyword,
    relatedSearches: input.relatedSearches,
    audience: input.audience,
    intent: input.intent,
    researchIntent: {
      searcherJob: input.searcherJob,
      competitorGap: input.competitorGap,
      workflowNudge: input.workflow,
      conversionPath: input.conversionPath,
    },
    summary: `${input.title} is a practical iCloseLeads workflow for turning ${input.keyword} intent into one focused search, one verified lead, one proposal angle, and one follow-up action.`,
    leadIn: `Use this page when ${input.signal}. The goal is not a larger list. The goal is a better path from search intent to signup, lead search, saved proof, and outreach.`,
    activationPlan: {
      trigger: `Use this when a visitor searches for ${input.keyword} and needs a working client acquisition action.`,
      firstRun: "Pick one service offer, one buyer type, and one source before opening a lead list.",
      savedLead: "Save only a lead with public proof, buyer fit, contact route, and a one-sentence pitch angle.",
      followUp: "Draft the first message from the saved signal and set a follow-up before adding the next lead.",
    },
    steps: [
      "Choose one service and one buyer niche.",
      "Search the narrowest source that matches the keyword intent.",
      "Verify the prospect with a public signal before saving.",
      "Score the lead by fit, urgency, value, and contactability.",
      "Write the first message from the proof, not from a generic template.",
      "Move the lead into CRM follow-up so the campaign compounds.",
    ],
    qualificationChecks: [
      {
        signal: "Search intent match",
        whyItMatters: `The lead should match the reason someone searched for ${input.keyword}.`,
        nextMove: "Reject prospects that only match a broad category but do not fit the offer.",
      },
      {
        signal: "Proof before pitch",
        whyItMatters: "A saved public signal makes the first message more useful and less spammy.",
        nextMove: "Attach the source URL, profile, job post, website gap, or business note.",
      },
      {
        signal: "Follow-up path",
        whyItMatters: "Client acquisition improves only when replies, no-replies, and next actions are tracked.",
        nextMove: "Set the lead status and next follow-up date inside the workflow.",
      },
    ],
    proofPoints: [
      "Google SERP checks show strong intent around freelancer acquisition software, web design clients, cold outreach, and CRM workflows.",
      "Cached DataForSEO exports show iCloseLeads should prioritize long-tail, product-led pages over broad head terms while authority is still growing.",
      input.competitorGap,
    ],
    pitch: `Hi, I found your business while researching ${input.keyword}. ${input.pitchAngle}. If helpful, I can send a short idea with the first step I would test.`,
    internalLinks: input.internalLinks ?? sharedLinks,
    faqs: [
      {
        q: `What should I do first for ${input.keyword}?`,
        a: "Start with one buyer type and one service offer, then find a prospect with a visible public reason to contact them.",
      },
      {
        q: "How does iCloseLeads help?",
        a: "iCloseLeads connects lead discovery, saved proof, AI proposal drafting, Gmail-ready outreach, and CRM follow-up in one workflow.",
      },
      {
        q: "Should I use a huge lead list?",
        a: "Not first. A smaller verified list with proof, offer fit, and follow-up usually beats a broad unverified export.",
      },
    ],
  };
}

export const AUGUST_15_2026_RESOURCE_PAGES: ResourcePage[] = [
  buildPage({
    slug: "freelancer-client-acquisition-dashboard",
    title: "Freelancer Client Acquisition Dashboard",
    keyword: "freelancer client acquisition dashboard",
    relatedSearches: ["freelance client acquisition system", "freelancer CRM", "client acquisition dashboard", "lead tracking for freelancers"],
    audience: "Freelancers who need one place to manage prospecting, proposals, and follow-up",
    intent: "The searcher wants a dashboard that turns client acquisition into a repeatable operating system.",
    searcherJob: "See which leads need research, outreach, proposal work, and follow-up without jumping between tools.",
    competitorGap: "Generic CRM pages usually focus on contact storage, while freelancers need source proof, pitch context, and next action in one view.",
    workflow: "Run one lead search, save qualified prospects, draft the pitch, and review the dashboard daily for follow-up.",
    conversionPath: "Signup, run a free lead search, save a prospect, then use the dashboard to move the opportunity forward.",
    signal: "a freelancer has traffic or advice but needs a visible daily pipeline process",
    pitchAngle: "The useful dashboard is the one that preserves why the lead was worth saving, not just who the lead is",
  }),
  buildPage({
    slug: "lead-search-tool-for-freelancers",
    title: "Lead Search Tool for Freelancers",
    keyword: "lead search tool for freelancers",
    relatedSearches: ["lead generation tools for freelancers", "freelance lead finder", "find leads as freelancer", "client acquisition tool for freelancers"],
    audience: "Freelancers comparing software for finding and qualifying new clients",
    intent: "The searcher wants a tool that finds prospects and helps turn them into outreach-ready leads.",
    searcherJob: "Find prospects that match a freelance service and are specific enough to contact.",
    competitorGap: "Tool roundups often list features but do not show how a freelancer moves from one search to one qualified outreach action.",
    workflow: "Search by service, source, niche, or location, then verify fit before saving the lead.",
    conversionPath: "Signup and run a focused lead search that produces one saved, proof-backed prospect.",
    signal: "the reader is actively comparing tools and may be ready to try the first search",
    pitchAngle: "A lead search tool should help find the reason to reach out before it helps write the message",
  }),
  buildPage({
    slug: "agency-lead-search-workflow",
    title: "Agency Lead Search Workflow",
    keyword: "agency lead search workflow",
    relatedSearches: ["agency prospecting workflow", "lead generation for agencies", "client acquisition for agencies", "agency lead management"],
    audience: "Small agencies that need a repeatable source of qualified prospects",
    intent: "The searcher wants a way to research, assign, pitch, and follow up with agency leads.",
    searcherJob: "Turn a target niche into a team-ready list of prospects with next actions.",
    competitorGap: "Agency lead-gen advice often stays strategic and skips the day-to-day handoff from research to proposal.",
    workflow: "Choose the niche, find prospects, save proof, assign the pitch, and track the next follow-up.",
    conversionPath: "Signup, save a qualified agency prospect, and move it through the CRM pipeline.",
    signal: "an agency wants client acquisition without relying only on referrals or paid ads",
    pitchAngle: "The workflow keeps research, owner notes, pitch angle, and follow-up tied to one lead",
  }),
  buildPage({
    slug: "web-design-client-finder-software",
    title: "Web Design Client Finder Software",
    keyword: "web design client finder software",
    relatedSearches: ["find clients for web design business", "web design leads", "web design leads for agencies", "how to get leads for website development"],
    audience: "Web designers, Webflow builders, WordPress freelancers, and design agencies",
    intent: "The searcher wants software that helps find businesses likely to need web design work.",
    searcherJob: "Find companies with no website, outdated pages, weak mobile conversion, or missing booking paths.",
    competitorGap: "Web design client guides often explain channels but do not convert the idea into a saved lead and proposal path.",
    workflow: "Search one niche or city, verify the website gap, save proof, then draft a short redesign or conversion pitch.",
    conversionPath: "Signup from the page and run a local or web-design lead search immediately.",
    signal: "a designer needs prospects with visible website problems instead of another marketing checklist",
    pitchAngle: "The prospecting edge is the visible website gap and the business outcome attached to it",
  }),
  buildPage({
    slug: "freelance-prospecting-software",
    title: "Freelance Prospecting Software",
    keyword: "freelance prospecting software",
    relatedSearches: ["prospecting tools for freelancers", "freelance lead generation software", "client acquisition software for freelancers", "freelance CRM"],
    audience: "Freelancers who want a daily prospecting system instead of scattered tabs",
    intent: "The searcher wants software for finding, organizing, and following up with prospects.",
    searcherJob: "Make prospecting repeatable enough to run every week.",
    competitorGap: "Many prospecting tools focus on contact volume, while freelancers need verified reasons, offer fit, and a simple follow-up loop.",
    workflow: "Run a narrow search, save the strongest leads, draft messages from proof, and review follow-ups twice a week.",
    conversionPath: "Signup, test one prospecting source, and build the first saved pipeline.",
    signal: "a freelancer wants a system before scaling outreach volume",
    pitchAngle: "Prospecting software should reduce guessing by keeping the signal and next action attached",
  }),
  buildPage({
    slug: "local-business-prospecting-tool",
    title: "Local Business Prospecting Tool",
    keyword: "local business prospecting tool",
    relatedSearches: ["local business leads", "find local businesses that need websites", "businesses without websites", "local lead finder"],
    audience: "Freelancers and agencies selling websites, SEO, ads, booking flows, or automation to local businesses",
    intent: "The searcher wants local prospects that are worth contacting.",
    searcherJob: "Find local companies where a public profile, website, or booking path shows a real opportunity.",
    competitorGap: "Local directories show businesses, but they rarely explain which lead is worth pitching and why.",
    workflow: "Pick a city and category, inspect public proof, save qualified leads, and pitch the visible business outcome.",
    conversionPath: "Signup, run a local business lead search, and save one prospect with a proof note.",
    signal: "a user wants local B2B prospects and needs to avoid blind scraping",
    pitchAngle: "The local advantage is a specific public signal tied to calls, bookings, quotes, or trust",
  }),
  buildPage({
    slug: "ai-outreach-assistant-for-freelancers",
    title: "AI Outreach Assistant for Freelancers",
    keyword: "AI outreach assistant for freelancers",
    relatedSearches: ["AI proposal generator for freelancers", "cold email AI for freelancers", "AI lead generation for freelancers", "freelance outreach assistant"],
    audience: "Freelancers using AI to write better outreach without inventing personalization",
    intent: "The searcher wants AI help for outreach while keeping the message useful and specific.",
    searcherJob: "Turn saved prospect proof into a first message that feels researched.",
    competitorGap: "Generic AI writing tools do not know the lead source, visible problem, buyer type, or follow-up status.",
    workflow: "Save the source proof first, then use AI to structure a short message and manually review it.",
    conversionPath: "Signup, save a lead, generate a draft, and review it before sending.",
    signal: "the reader wants AI speed but still needs real prospect context",
    pitchAngle: "AI should polish the message after the lead reason is verified, not invent the reason",
  }),
  buildPage({
    slug: "proposal-ready-lead-finder",
    title: "Proposal Ready Lead Finder",
    keyword: "proposal ready lead finder",
    relatedSearches: ["proposal ready leads", "freelance proposal workflow", "AI proposal generator for freelancers", "qualified leads for freelancers"],
    audience: "Freelancers who want fewer dead leads and faster proposal drafting",
    intent: "The searcher wants prospects that already have enough context to support a proposal.",
    searcherJob: "Find a lead with enough fit, problem, and source proof to draft a useful proposal.",
    competitorGap: "Lead-list pages rarely separate raw prospects from leads that are ready for a proposal.",
    workflow: "Verify fit, visible need, buyer route, and first-offer angle before opening the proposal generator.",
    conversionPath: "Signup, save one proposal-ready lead, then draft the first offer.",
    signal: "the user needs proposal context, not only contact data",
    pitchAngle: "A proposal-ready lead has enough proof to explain the first useful offer in plain language",
  }),
  buildPage({
    slug: "freelance-lead-management-software",
    title: "Freelance Lead Management Software",
    keyword: "freelance lead management software",
    relatedSearches: ["freelance lead tracking", "freelancer CRM", "lead management for freelancers", "client pipeline for freelancers"],
    audience: "Freelancers managing saved leads, replies, proposals, and follow-ups",
    intent: "The searcher wants software for keeping lead work organized after discovery.",
    searcherJob: "Keep prospect source, notes, outreach, replies, and follow-up in one workflow.",
    competitorGap: "CRMs are often too broad for a solo freelancer, while spreadsheets lose the reason a lead was saved.",
    workflow: "Save the lead, attach the proof, draft the pitch, set status, and review the pipeline every week.",
    conversionPath: "Signup and turn one saved lead into a tracked pipeline item.",
    signal: "a freelancer has leads but loses momentum after the first message",
    pitchAngle: "Lead management works when the source proof, next action, and follow-up are visible together",
  }),
  buildPage({
    slug: "client-acquisition-dashboard-for-agencies",
    title: "Client Acquisition Dashboard for Agencies",
    keyword: "client acquisition dashboard for agencies",
    relatedSearches: ["agency client acquisition dashboard", "agency prospecting CRM", "agency sales pipeline", "lead generation dashboard for agencies"],
    audience: "Small agencies that want a clean view of prospect research, outreach, and follow-up",
    intent: "The searcher wants visibility into which acquisition actions are producing real prospects.",
    searcherJob: "See target niches, saved leads, pitch status, and follow-up quality across the acquisition workflow.",
    competitorGap: "Dashboards often report activity counts, but agencies also need proof quality and next action clarity.",
    workflow: "Track source, proof, pitch angle, owner, status, and follow-up date for every active prospect.",
    conversionPath: "Signup, save leads into one campaign view, and review follow-up from the dashboard.",
    signal: "an agency needs operational clarity before increasing outbound volume",
    pitchAngle: "The dashboard should show which prospecting work can become revenue, not only how many contacts were added",
  }),
];
