import type { ResourcePage } from "./resource-pages";

const links = [
  { label: "Freelance client acquisition system", href: "/blog/freelance-client-acquisition-system" },
  { label: "Lead discovery", href: "/features/lead-discovery" },
  { label: "AI proposal generator", href: "/features/ai-proposals" },
  { label: "CRM pipeline", href: "/features/crm-pipeline" },
];

function buildPage(slug: string, title: string, keyword: string, summary: string): ResourcePage {
  return {
    slug,
    title,
    metaTitle: `${title} | iCloseLeads`,
    metaDescription: `${summary} Use iCloseLeads to search, qualify, save, pitch, and follow up from one workflow.`,
    keyword,
    relatedSearches: [keyword, "freelancer lead generation", "client acquisition for freelancers", "find local business leads", "web design leads"],
    audience: "Freelancers, consultants, and small agencies that want qualified prospects, not blind lead lists",
    intent: "The searcher wants a repeatable way to find, qualify, contact, and follow up with prospects.",
    researchIntent: {
      searcherJob: "Turn a prospecting query into one qualified lead-search action.",
      competitorGap: "Generic lead-list and outreach pages often skip visible proof, CRM follow-up, and proposal context.",
      workflowNudge: "Search one niche, verify one public signal, save the lead, draft the pitch, and schedule follow-up.",
      conversionPath: "Move from article/resource traffic into signup, first search, saved lead, AI proposal, and CRM follow-up.",
    },
    summary,
    leadIn: `${summary} The useful version of ${keyword} is not a bigger spreadsheet. It is a system that proves why the prospect is worth contacting and turns that proof into a next step.`,
    activationPlan: {
      trigger: "Use this when the visitor is trying to get more clients from outbound or local business research.",
      firstRun: "Choose one offer, one buyer niche, and one city or market before searching.",
      savedLead: "Save only leads with source proof, buyer fit, contact route, and a first-message angle.",
      followUp: "Generate the first proposal or outreach note and set the next follow-up date before adding more leads.",
    },
    steps: [
      "Pick the service offer and buyer type.",
      "Search one narrow source instead of browsing generic lists.",
      "Verify public proof of need.",
      "Reject leads without offer fit or a respectful contact route.",
      "Save the prospect with evidence and a pitch angle.",
      "Draft and follow up from the same lead record.",
    ],
    qualificationChecks: [
      { signal: "Visible business need", whyItMatters: "The lead is stronger when the first message can reference public evidence.", nextMove: "Attach the exact source page or profile to the lead." },
      { signal: "Offer fit", whyItMatters: "The prospect should match the service being sold.", nextMove: "Write the expected business outcome before outreach." },
      { signal: "Follow-up path", whyItMatters: "Prospecting only compounds when follow-ups are tracked.", nextMove: "Set status and next action in the CRM workflow." },
    ],
    proofPoints: [
      "Prior GSC evidence shows iCloseLeads already attracts client acquisition demand.",
      "DataForSEO and Google related-search research support freelancer, local lead, proposal, and outreach workflow clusters.",
      "The page routes visitors to signup and product activation instead of ending at advice.",
    ],
    pitch: "Hi, I found your business while researching companies that may be able to improve their client acquisition flow. I noticed one specific opportunity and can send a short idea if useful.",
    internalLinks: links,
    faqs: [
      { q: `What is the first step for ${keyword}?`, a: "Start with one buyer type and verify a public signal before saving or contacting the lead." },
      { q: "Should I use a large lead list?", a: "Not first. A smaller verified lead workflow usually produces better outreach than a blind list." },
      { q: "How does iCloseLeads help?", a: "iCloseLeads connects lead discovery, qualification notes, AI proposal drafting, saved leads, and CRM follow-up in one workflow." },
    ],
  };
}

export const AUGUST_11_2026_RESOURCE_PAGES: ResourcePage[] = [
  buildPage("freelancer-lead-qualification-scorecard", "Freelancer Lead Qualification Scorecard", "freelancer lead qualification scorecard", "Score freelancer prospects by visible need, reachable path, offer fit, and follow-up value before outreach."),
  buildPage("web-design-client-outreach-workflow", "Web Design Client Outreach Workflow", "web design client outreach workflow", "Turn website gaps, booking friction, and local proof into a specific first message for web design prospects."),
  buildPage("local-business-website-lead-finder", "Local Business Website Lead Finder", "local business website lead finder", "Find local companies with outdated websites, weak conversion paths, and clear reasons to pitch."),
  buildPage("google-maps-leads-for-web-designers", "Google Maps Leads for Web Designers", "Google Maps leads for web designers", "Use Google Maps signals as the first qualification layer for web design and SEO outreach."),
  buildPage("proposal-follow-up-crm-for-freelancers", "Proposal Follow-Up CRM for Freelancers", "proposal follow up CRM for freelancers", "Keep saved lead context, proposal notes, and follow-up timing attached to each prospect."),
  buildPage("cold-outreach-lead-tracking-system", "Cold Outreach Lead Tracking System", "cold outreach lead tracking system", "Track source evidence, first message angle, owner response, and next action without losing the sales context."),
  buildPage("client-acquisition-dashboard-for-freelancers", "Client Acquisition Dashboard for Freelancers", "client acquisition dashboard for freelancers", "Use a simple dashboard to connect lead search, saved prospects, proposals, replies, and booked calls."),
  buildPage("ai-proposal-workflow-from-lead-data", "AI Proposal Workflow From Lead Data", "AI proposal workflow from lead data", "Draft proposals from verified business signals instead of generic AI prompts."),
  buildPage("find-companies-without-websites", "Find Companies Without Websites", "find companies without websites", "Identify companies where a missing or weak website creates a real offer-fit opportunity."),
  buildPage("agency-prospecting-workflow", "Agency Prospecting Workflow", "agency prospecting workflow", "Build a repeatable agency prospecting system around niche, source, qualification, proposal, and follow-up.")
];
