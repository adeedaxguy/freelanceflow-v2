import type { ResourcePage } from "./resource-pages";

const sharedLinks = [
  { label: "Freelance client acquisition system", href: "/blog/freelance-client-acquisition-system" },
  { label: "Lead discovery", href: "/features/lead-discovery" },
  { label: "AI proposal generator", href: "/features/ai-proposals" },
  { label: "CRM pipeline", href: "/features/crm-pipeline" },
];

function page(slug: string, title: string, keyword: string, summary: string): ResourcePage {
  return {
    slug,
    title,
    metaTitle: `${title} | iCloseLeads`,
    metaDescription: `${summary} Use iCloseLeads to search, qualify, save, pitch, and follow up from one workflow.`,
    keyword,
    relatedSearches: [keyword, "freelancer lead generation", "client acquisition for freelancers", "web design leads", "local business leads"],
    audience: "Freelancers, consultants, web designers, SEO specialists, and small agencies that need qualified prospects.",
    intent: "The searcher wants a practical lead workflow that connects discovery, qualification, outreach, proposal context, and follow-up.",
    researchIntent: {
      searcherJob: "Find a qualified prospect and turn the evidence into one useful next action.",
      competitorGap: "Generic lead-list and cold-outreach pages usually sell volume but skip proof, fit, proposal context, and CRM follow-up.",
      workflowNudge: "Choose one niche, verify one public signal, save the lead, generate the first pitch, and set a follow-up.",
      conversionPath: "Move from resource traffic into signup, first search, saved lead, proposal draft, and follow-up.",
    },
    summary,
    leadIn: `${summary} The useful version of ${keyword} is not a bigger spreadsheet. It is a smaller set of verified prospects with the reason to reach out preserved.`,
    activationPlan: {
      trigger: "Use this when a visitor wants clients or leads, not passive marketing advice.",
      firstRun: "Pick one offer, one buyer type, and one local or B2B source before searching.",
      savedLead: "Save only leads with source proof, service fit, contact route, and a pitch angle.",
      followUp: "Draft and follow up from the same lead record so the campaign compounds.",
    },
    steps: [
      "Define one offer and one buyer type.",
      "Search a narrow source instead of scraping broad lists.",
      "Verify a public signal of need.",
      "Reject leads without fit, source proof, or a respectful contact route.",
      "Save the qualified lead with a one-sentence pitch angle.",
      "Generate the proposal or first message and set a follow-up task.",
    ],
    qualificationChecks: [
      { signal: "Visible need", whyItMatters: "The first message works better when it references public evidence.", nextMove: "Attach the source URL, profile, listing, or website gap." },
      { signal: "Offer fit", whyItMatters: "A lead should match the service being sold.", nextMove: "Write the business outcome before outreach." },
      { signal: "Follow-up path", whyItMatters: "Prospecting only compounds when follow-ups are tracked.", nextMove: "Set lead status and next action." },
    ],
    proofPoints: [
      "The August 13 DataForSEO lite pull surfaced design and portfolio-adjacent terms, so these pages focus on web design and client acquisition fit.",
      "Existing iCloseLeads GSC learnings show client acquisition content is the strongest organic entry point.",
      "Every page routes readers toward signup, lead search, saved context, proposal drafting, and follow-up.",
    ],
    pitch: "Hi, I found your business while researching companies that may be able to improve their client acquisition flow. I noticed one specific opportunity and can send a short idea if useful.",
    internalLinks: sharedLinks,
    faqs: [
      { q: `What is the first step for ${keyword}?`, a: "Start with one buyer type, one service offer, and one verified public reason to contact the prospect." },
      { q: "Are big lead lists better?", a: "Not usually. A smaller verified lead workflow is safer and more useful than a blind list." },
      { q: "How does iCloseLeads help?", a: "iCloseLeads connects lead discovery, qualification notes, AI proposal drafting, saved leads, and CRM follow-up in one workflow." },
    ],
  };
}

export const AUGUST_13_2026_RESOURCE_PAGES: ResourcePage[] = [
  page("website-design-lead-search-system", "Website Design Lead Search System", "website design lead search", "Find companies with visible website gaps, save the source proof, and turn each qualified lead into a specific web design pitch."),
  page("freelancer-outbound-lead-score", "Freelancer Outbound Lead Score", "freelancer outbound lead score", "Score leads by need, service fit, urgency, contact route, and follow-up value before spending time on outreach."),
  page("small-business-owner-email-finder-workflow", "Small Business Owner Email Finder Workflow", "small business owner email finder", "Use public proof, role confidence, and respectful contact routes before treating a prospect as pitch-ready."),
  page("local-seo-client-leads-workflow", "Local SEO Client Leads Workflow", "local SEO client leads", "Find local businesses where visibility, reviews, landing pages, or conversion paths create a real SEO pitch."),
  page("b2b-lead-research-system-for-agencies", "B2B Lead Research System for Agencies", "B2B lead research system", "Connect niche, source proof, decision-maker confidence, proposal angle, and follow-up inside one prospecting workflow."),
  page("ai-lead-qualification-for-freelancers", "AI Lead Qualification for Freelancers", "AI lead qualification for freelancers", "Use AI to summarize public lead evidence, but keep fit, risk, and human review in the loop."),
  page("cold-email-proof-before-pitch", "Cold Email Proof Before Pitch", "cold email proof before pitch", "Attach the visible reason to contact a prospect before writing a cold message."),
  page("freelance-sales-pipeline-from-google-maps", "Freelance Sales Pipeline From Google Maps", "freelance sales pipeline Google Maps", "Turn Google Maps-style local discovery into saved lead notes, pitch angles, and follow-up tasks."),
  page("find-websites-that-need-redesign", "Find Websites That Need Redesign", "find websites that need redesign", "Identify redesign leads by mobile friction, outdated proof, weak conversion flow, missing booking paths, and local trust gaps."),
  page("lead-generation-for-web-design-agencies", "Lead Generation for Web Design Agencies", "lead generation for web design agencies", "Build a repeatable agency workflow for finding website prospects, qualifying pain, and sending better proposals."),
  page("proposal-angle-from-lead-research", "Proposal Angle From Lead Research", "proposal angle from lead research", "Convert saved prospect evidence into a first proposal angle that sounds specific instead of generic."),
  page("crm-follow-up-after-cold-email", "CRM Follow-Up After Cold Email", "CRM follow up after cold email", "Keep the lead reason, first email, follow-up timing, and next action attached to the prospect."),
  page("qualified-leads-vs-lead-lists", "Qualified Leads vs Lead Lists", "qualified leads vs lead lists", "Compare blind lead lists with a verified lead workflow that preserves fit, public proof, and outreach context."),
  page("client-acquisition-workflow-for-consultants", "Client Acquisition Workflow for Consultants", "client acquisition workflow for consultants", "Use one niche, one source, one offer, and one CRM follow-up path before expanding outbound."),
  page("web-design-prospecting-daily-routine", "Web Design Prospecting Daily Routine", "web design prospecting daily routine", "A daily prospecting routine for web designers: source, qualify, save, pitch, follow up, and measure.")
];
