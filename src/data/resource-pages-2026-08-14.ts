import type { ResourcePage } from "./resource-pages";

const sharedLinks = [
  { label: "Freelance client acquisition system", href: "/blog/freelance-client-acquisition-system" },
  { label: "Lead discovery", href: "/features/lead-discovery" },
  { label: "AI proposal generator", href: "/features/ai-proposals" },
  { label: "CRM pipeline", href: "/features/crm-pipeline" },
  { label: "Web design lead routine", href: "/resources/web-design-prospecting-daily-routine" },
];

function page(slug: string, title: string, keyword: string, summary: string): ResourcePage {
  return {
    slug,
    title,
    metaTitle: `${title} | iCloseLeads`,
    metaDescription: `${summary} Use iCloseLeads to search, qualify, save, pitch, and follow up from one workflow.`,
    keyword,
    relatedSearches: [keyword, "web design leads", "UI design leads", "freelancer lead generation", "client acquisition workflow"],
    audience: "Freelancers, consultants, UI designers, web designers, SEO specialists, and small agencies that need qualified prospects.",
    intent: "The searcher wants a practical way to turn design or website research into qualified prospects, saved proof, a pitch angle, and follow-up.",
    researchIntent: {
      searcherJob: "Find a qualified prospect and turn the visible website or UI evidence into one useful next action.",
      competitorGap: "Generic lead-list and design articles usually sell inspiration or volume but skip proof, fit, proposal context, and CRM follow-up.",
      workflowNudge: "Choose one niche, verify one public signal, save the lead, generate the first pitch, and set a follow-up.",
      conversionPath: "Move from resource traffic into signup, first search, saved lead, proposal draft, and follow-up.",
    },
    summary,
    leadIn: `${summary} The useful version of ${keyword} is not a bigger spreadsheet. It is a verified workflow where the reason to contact the prospect stays attached to the lead.`,
    activationPlan: {
      trigger: "Use this when a visitor wants clients or leads, not passive marketing advice.",
      firstRun: "Pick one service offer, one buyer type, and one source before searching.",
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
      "The August 14 DataForSEO pull surfaced UI, site design, portfolio, Squarespace, and one-page design search demand.",
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

export const AUGUST_14_2026_RESOURCE_PAGES: ResourcePage[] = [
  page("ui-design-lead-search-workflow", "UI Design Lead Search Workflow", "ui interface design leads", "Use UI and interface design demand to find businesses with visible usability gaps, save proof, and pitch a better conversion path."),
  page("portfolio-homepage-prospecting-system", "Portfolio Homepage Prospecting System", "portfolio homepage design leads", "Turn portfolio-homepage research into a lead workflow for designers, developers, and agencies selling stronger proof pages."),
  page("squarespace-site-design-leads", "Squarespace Site Design Leads", "Squarespace site design leads", "Find Squarespace websites where structure, speed, content, or conversion gaps create a specific redesign opportunity."),
  page("one-page-website-lead-generation", "One Page Website Lead Generation", "one page design lead generation", "Use one-page website signals to qualify simple redesign prospects without turning outreach into generic cold email."),
  page("site-design-ideas-prospecting-workflow", "Site Design Ideas Prospecting Workflow", "site design ideas prospecting", "Convert design-inspiration searches into a practical prospecting workflow for web design freelancers and small agencies."),
  page("user-interface-design-client-leads", "User Interface Design Client Leads", "user interface UI design clients", "Qualify UI design prospects by usability friction, business value, contact route, and a clear next proposal angle."),
  page("website-redesign-opportunity-score", "Website Redesign Opportunity Score", "website redesign opportunity score", "Score website redesign leads by visible need, value, urgency, fit, source proof, and follow-up quality."),
  page("agency-ui-audit-lead-list", "Agency UI Audit Lead List", "agency UI audit lead list", "Build an audit-first lead list that makes every outreach message specific to one visible interface or website issue."),
  page("small-business-website-design-prospects", "Small Business Website Design Prospects", "small business website design prospects", "Find small business prospects that need better websites without scraping blind lists or sending weak generic pitches."),
  page("portfolio-site-outreach-pitch", "Portfolio Site Outreach Pitch", "portfolio site outreach pitch", "Turn portfolio site gaps into a respectful pitch that explains the evidence, business outcome, and next step."),
  page("landing-page-design-lead-workflow", "Landing Page Design Lead Workflow", "landing page design leads", "Research landing-page design prospects by offer clarity, mobile path, proof, CTA, and follow-up intent."),
  page("local-business-ui-gap-finder", "Local Business UI Gap Finder", "local business UI gap finder", "Use public pages, reviews, forms, and mobile friction to identify local businesses worth pitching."),
  page("website-design-proposal-from-lead-research", "Website Design Proposal From Lead Research", "website design proposal from lead research", "Create a stronger website proposal by preserving the proof found during lead research."),
  page("client-website-audit-to-proposal", "Client Website Audit to Proposal", "client website audit proposal", "Move from quick website audit notes to a proposal angle, without losing source evidence."),
  page("daily-web-design-lead-routine", "Daily Web Design Lead Routine", "daily web design lead routine", "Run a focused daily lead workflow: choose niche, find need, verify source, save lead, pitch, and follow up.")
];
