import type { ResourcePage } from "./resource-pages";

const links = [
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
    relatedSearches: [keyword, "freelancer lead generation", "find local business leads", "lead generation platform for freelancers", "web design client acquisition"],
    audience: "Freelancers, consultants, and small agencies that need real client acquisition activity",
    intent: "The searcher wants a practical way to find prospects, qualify them, and turn the research into outreach.",
    researchIntent: {
      searcherJob: "Find a smaller set of prospects with a visible reason to contact them.",
      competitorGap: "Generic lead-list pages often skip proof, fit, contact route, and follow-up workflow.",
      workflowNudge: "Search one niche, verify one public signal, save the lead, draft the proposal, and schedule follow-up.",
      conversionPath: "Create an account, run the first lead search, save a qualified business, and generate a proposal from the saved context.",
    },
    summary,
    leadIn: `${summary} The useful version of ${keyword} is not a huge spreadsheet. It is a repeatable workflow that proves why the company may need help, keeps the context, and turns that context into a respectful next step.`,
    activationPlan: {
      trigger: "Use this when you want outbound activity that can become signups, demos, proposals, or booked calls.",
      firstRun: "Choose one service, one buyer niche, and one location before opening broad results.",
      savedLead: "Save only prospects with a visible problem, public source URL, reachable path, and clear offer fit.",
      followUp: "Generate the first outreach note and schedule the next follow-up before moving to another lead.",
    },
    steps: [
      "Pick one offer and one buyer type.",
      "Search for public business signals tied to that offer.",
      "Reject weak prospects before they enter the CRM.",
      "Save the source URL, problem, buyer assumption, and contact route.",
      "Generate a proposal or outreach note from the saved evidence.",
      "Track follow-up so prospecting becomes a daily acquisition loop.",
    ],
    qualificationChecks: [
      { signal: "Visible need", whyItMatters: "The pitch needs a reason grounded in public evidence.", nextMove: "Attach the page, listing, or profile that supports the message." },
      { signal: "Offer fit", whyItMatters: "The prospect should match the service being sold.", nextMove: "Write the likely business outcome before contacting them." },
      { signal: "Reachable route", whyItMatters: "A lead is not useful if the contact path is private, scraped, or irrelevant.", nextMove: "Use public, respectful business contact routes only." },
    ],
    proofPoints: [
      "DataForSEO surfaced freelancer lead generation, local business leads, Upwork, Reddit, and B2B freelancer acquisition language.",
      "The highest-click iCloseLeads content already proves client acquisition system demand.",
      "This resource routes the reader into signup, lead discovery, AI proposals, and CRM follow-up.",
    ],
    pitch: "Hi, I found your business while researching companies that may be able to improve their client acquisition flow. I noticed one specific opportunity and can send a short idea if useful.",
    internalLinks: links,
    faqs: [
      { q: `What is the best way to use ${keyword}?`, a: "Use it as a focused workflow: pick one niche, verify the business signal, save proof, draft a specific message, and schedule follow-up." },
      { q: "Should I buy a large lead list?", a: "Usually not first. A smaller verified batch with public proof and clear offer fit is more useful for freelancers and small agencies." },
      { q: "How does iCloseLeads help?", a: "iCloseLeads connects lead discovery, qualification notes, AI proposal drafting, saved leads, and follow-up in one client acquisition workflow." },
    ],
  };
}

export const AUGUST_10_2026_RESOURCE_PAGES: ResourcePage[] = [
  page("google-business-profile-leads-for-freelancers", "Google Business Profile Leads for Freelancers", "Google Business Profile leads for freelancers", "Find local businesses with visible profile, website, review, and contact gaps before drafting a specific outreach angle."),
  page("local-business-lead-verification-checklist", "Local Business Lead Verification Checklist", "local business lead verification checklist", "Verify local prospects before saving them so outreach starts with a real reason to contact the business."),
  page("business-owner-lookup-for-outreach", "Business Owner Lookup for Outreach", "business owner lookup for outreach", "Use public business signals and respectful contact paths instead of blind scraped lists."),
  page("google-maps-prospecting-for-web-designers", "Google Maps Prospecting for Web Designers", "Google Maps prospecting for web designers", "Turn local map results into qualified website redesign and landing-page prospects."),
  page("local-seo-client-lead-finder", "Local SEO Client Lead Finder", "local SEO client lead finder", "Find companies with ranking, review, website, or conversion gaps that support a specific local SEO pitch."),
  page("high-intent-client-prospecting-workflow", "High-Intent Client Prospecting Workflow", "high intent client prospecting", "Prioritize fewer prospects with timing, need, fit, and a next action over large cold lists."),
  page("ai-cold-email-personalization-from-lead-data", "AI Cold Email Personalization From Lead Data", "AI cold email personalization lead data", "Use saved lead evidence to draft specific, truthful first messages."),
  page("website-redesign-leads-from-google-business-profiles", "Website Redesign Leads From Google Business Profiles", "website redesign leads Google Business Profile", "Find redesign prospects whose public profile exposes trust, booking, or website gaps."),
  page("freelancer-crm-follow-up-after-cold-outreach", "Freelancer CRM Follow-Up After Cold Outreach", "freelancer CRM follow up cold outreach", "Keep prospect context, next steps, and proposal notes attached to each saved lead."),
  page("small-agency-lead-qualification-framework", "Small Agency Lead Qualification Framework", "small agency lead qualification framework", "Score prospects by fit, need, reachable path, and proposal angle before outreach.")
];
