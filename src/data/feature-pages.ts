import type { Metadata } from "next";

export type FeatureSlug =
  | "lead-discovery"
  | "ai-proposals"
  | "email-outreach"
  | "crm-pipeline"
  | "analytics"
  | "free-tools";

export type IconName =
  | "Search"
  | "Sparkles"
  | "Mail"
  | "Layers"
  | "BarChart2"
  | "Wrench"
  | "Target"
  | "Shield"
  | "Clock"
  | "FileText"
  | "TrendingUp"
  | "CheckCircle2"
  | "Zap"
  | "Users"
  | "MessageSquare";

export interface FeatureItem {
  title: string;
  description: string;
  icon: IconName;
}

export interface FeatureFaq {
  q: string;
  a: string;
}

export interface FeaturePageData {
  slug: FeatureSlug;
  path: string;
  eyebrow: string;
  icon: IconName;
  title: string;
  accentTitle: string;
  description: string;
  shortDescription: string;
  titleTag: string;
  metaDescription: string;
  keywords: string[];
  theme: {
    accentText: string;
    accentBg: string;
    accentBorder: string;
    gradientText: string;
    heroWash: string;
    hoverBorder: string;
  };
  audience: string;
  promise: string;
  proof: string[];
  stats: { value: string; label: string }[];
  workflow: FeatureItem[];
  capabilities: FeatureItem[];
  useCases: FeatureItem[];
  differentiators: string[];
  faqs: FeatureFaq[];
  cta: {
    heading: string;
    subheading: string;
    button: string;
  };
}

const BASE_URL = "https://icloseleads.com";

export const FEATURE_PAGES: FeaturePageData[] = [
  {
    slug: "lead-discovery",
    path: "/features/lead-discovery",
    eyebrow: "Lead Discovery",
    icon: "Search",
    title: "Freelance Lead Generation Software",
    accentTitle: "for Finding Buyers Before the Crowd",
    description:
      "Search remote job posts, local business opportunities, owner and manager contact paths, community requests, and public hiring signals from one focused workspace. iCloseLeads helps freelancers spot real buying intent, filter out noise, and move the best leads straight into proposals and pipeline.",
    shortDescription:
      "Find remote jobs, local businesses, decision makers, and high-intent freelance opportunities without opening a dozen tabs.",
    titleTag:
      "Freelance Lead Generation Software for Remote Jobs, Local Leads, and Decision Makers",
    metaDescription:
      "Find freelance clients with live remote job leads, local business opportunities, decision maker checks, niche filters, lead scoring, and a built-in proposal workflow.",
    keywords: [
      "freelance lead generation software",
      "find freelance clients",
      "remote job leads for freelancers",
      "local business leads for web designers",
      "decision maker finder for small business",
      "business owner name finder",
      "freelance client acquisition tool",
      "lead generation for independent contractors",
      "AI lead scoring for freelancers",
      "freelance job board aggregator",
    ],
    theme: {
      accentText: "text-accent",
      accentBg: "bg-accent/10",
      accentBorder: "border-accent/25",
      gradientText: "from-accent via-primary-light to-blue-400",
      heroWash: "from-accent/10 via-transparent to-blue-500/10",
      hoverBorder: "hover:border-accent/40",
    },
    audience:
      "Freelancers, consultants, agencies, and service providers who want qualified opportunities without marketplace bidding wars.",
    promise:
      "Replace manual lead hunting with a repeatable discovery workflow: choose a niche, search fresh signals, filter by intent, save the best prospects, and write the first pitch while the context is still fresh.",
    proof: [
      "Remote job leads, local business leads, and Decision Maker Finder live in focused dashboards.",
      "Saved leads flow into the same CRM, proposal, and outreach workflow.",
      "Local lead workflows can continue into owner, manager, social profile, phone route, and proof-link checks.",
      "Source coverage is abstracted in the product UI so users focus on lead quality, not raw data plumbing.",
    ],
    stats: [
      { value: "3 paths", label: "Remote, local, and decision maker discovery" },
      { value: "12h-7d", label: "Freshness filters for live jobs" },
      { value: "0-100", label: "Lead quality scoring" },
      { value: "1 flow", label: "Find, save, pitch, track" },
    ],
    workflow: [
      {
        title: "Pick the work you actually sell",
        description:
          "Choose a niche like WordPress, SEO, web design, data, copywriting, or Meta ads so the lead engine can separate real fit from keyword noise.",
        icon: "Target",
      },
      {
        title: "Search buyer-intent signals",
        description:
          "Run remote job discovery for active project demand or local business discovery for companies with visible website, contact, and owner-verification gaps.",
        icon: "Search",
      },
      {
        title: "Filter by urgency and contactability",
        description:
          "Prioritize fresh posts, contact-ready leads, local businesses with phone numbers, and prospects where an owner, manager, or public contact path can be checked.",
        icon: "Shield",
      },
      {
        title: "Save and pitch without losing context",
        description:
          "Send qualified leads into the CRM, generate a proposal, and keep the original business details attached to the outreach.",
        icon: "Sparkles",
      },
    ],
    capabilities: [
      {
        title: "Remote job lead search",
        description:
          "Find freelance-friendly roles and project posts across live remote hiring signals with niche and freshness filters.",
        icon: "Search",
      },
      {
        title: "Local business lead search",
        description:
          "Search by business type and city to identify companies that may need a better website, stronger local SEO, improved outreach, or a clearer contact route.",
        icon: "Target",
      },
      {
        title: "Decision Maker Finder",
        description:
          "Move from a local business profile to owner and manager checks, social profile searches, public phone routes, registry guidance, and proof links.",
        icon: "Users",
      },
      {
        title: "Quality scoring",
        description:
          "Use relevance, recency, intent, budget clues, and contact signals to sort leads by practical actionability.",
        icon: "BarChart2",
      },
      {
        title: "Deduped lead workspace",
        description:
          "Keep repeat opportunities from wasting your time and push the best record into one follow-up system.",
        icon: "CheckCircle2",
      },
    ],
    useCases: [
      {
        title: "Web designers selling local sites",
        description:
          "Find local businesses by city and category, check the owner or manager path, then pitch a modern website, booking flow, or local SEO package.",
        icon: "Users",
      },
      {
        title: "Specialists selling to active job posts",
        description:
          "Target fresh posts from companies already describing a problem you can solve.",
        icon: "Clock",
      },
      {
        title: "Agencies building a weekly prospecting list",
        description:
          "Run searches by niche, save priority leads, assign follow-ups, and keep the whole week visible in pipeline.",
        icon: "Layers",
      },
    ],
    differentiators: [
      "Built around freelancers instead of generic B2B sales teams.",
      "Combines remote opportunities, local business prospects, and decision maker checks in one product.",
      "Moves directly from discovery to proposal and CRM instead of stopping at a list.",
      "Keeps the source labels out of the user-facing pitch flow so the experience feels proprietary and focused.",
    ],
    faqs: [
      {
        q: "What kind of leads can I find with iCloseLeads?",
        a: "You can search remote job opportunities, freelance project posts, community hiring signals, and local business leads. The strongest workflow is to pick one niche, search fresh opportunities, save only the best prospects, and use the built-in AI proposal flow while the lead context is still fresh.",
      },
      {
        q: "Is this just another job board aggregator?",
        a: "No. The discovery engine is only the first step. iCloseLeads connects lead search with saving, proposal drafting, Gmail-ready outreach, CRM tracking, and analytics so freelancers can run the full client acquisition loop from one place.",
      },
      {
        q: "Can I find local businesses that may need a website?",
        a: "Yes. Local business search lets you enter a business type and city, filter by website status, and open the map profile for verification before you pitch. When a lead looks promising, Decision Maker Finder helps you look for the owner, manager, phone route, social profile, registry reference, and proof links.",
      },
      {
        q: "Can iCloseLeads help find the business owner or decision maker?",
        a: "Yes. Decision Maker Finder is built to support local lead outreach by checking public owner and manager signals, social profile searches, business profile links, phone/email verification searches, and registry guidance where available. It is designed as a verification workflow, not a promise that every business will publish a named owner.",
      },
      {
        q: "How should I use lead scoring?",
        a: "Treat the score as a prioritization signal, not a replacement for judgment. Start with high-score leads, verify the business or job post, then personalize the pitch around the clearest business problem.",
      },
    ],
    cta: {
      heading: "Find the next prospect worth pitching",
      subheading:
        "Start with one niche, run one focused search, and turn the best result into a proposal in minutes.",
      button: "Find Leads Free",
    },
  },
  {
    slug: "ai-proposals",
    path: "/features/ai-proposals",
    eyebrow: "AI Proposal Generator",
    icon: "Sparkles",
    title: "AI Proposal Generator for Freelancers",
    accentTitle: "That Writes Like a Specialist",
    description:
      "Turn a lead into a polished first message without sounding generic. iCloseLeads uses the job or business context, your service niche, and optional portfolio links to draft a concise proposal you can edit, copy, or prepare in Gmail.",
    shortDescription:
      "Generate editable, context-aware proposals for job posts, local business leads, and saved prospects.",
    titleTag:
      "AI Proposal Generator for Freelancers and Cold Email Outreach",
    metaDescription:
      "Write personalized freelance proposals, cold emails, subject lines, and follow-ups from lead context. Built for freelancers who want human-sounding outreach.",
    keywords: [
      "AI proposal generator for freelancers",
      "freelance proposal generator",
      "AI cold email generator",
      "proposal writing software for freelancers",
      "personalized freelance pitch",
      "AI cover letter for freelance jobs",
      "cold email templates for freelancers",
      "freelance outreach AI",
    ],
    theme: {
      accentText: "text-gold",
      accentBg: "bg-gold/10",
      accentBorder: "border-gold/25",
      gradientText: "from-gold via-primary-light to-pink-400",
      heroWash: "from-gold/10 via-transparent to-pink-500/10",
      hoverBorder: "hover:border-gold/40",
    },
    audience:
      "Freelancers who lose time rewriting proposals, overuse templates, or struggle to turn a lead into a specific first message.",
    promise:
      "Keep the speed of AI without the plastic tone. The proposal flow gives you a strong draft, a subject line, recipient context, and safety controls before any message leaves your account.",
    proof: [
      "Proposal pages are tied directly to the selected lead so the draft can reference the actual opportunity.",
      "Portfolio links can be embedded into the proposal for proof without rewriting the whole message.",
      "Direct sending is not required; safe Gmail preparation keeps the freelancer in control.",
    ],
    stats: [
      { value: "1 click", label: "Generate from any saved lead" },
      { value: "Editable", label: "Subject and body stay under your control" },
      { value: "Context", label: "Uses lead details and portfolio links" },
      { value: "Safe", label: "Gmail draft mode available" },
    ],
    workflow: [
      {
        title: "Start from the lead",
        description:
          "Open a remote job, local business lead, or saved prospect so the proposal begins with real business context.",
        icon: "Search",
      },
      {
        title: "Add proof points",
        description:
          "Attach portfolio links, past wins, or niche experience to make the draft feel specific to your work.",
        icon: "FileText",
      },
      {
        title: "Generate a focused draft",
        description:
          "Get a concise subject line and message that leads with the prospect's problem, not a generic biography.",
        icon: "Sparkles",
      },
      {
        title: "Edit, copy, or prepare",
        description:
          "Refine the language, preview the message, and prepare it in Gmail when you are ready to send manually.",
        icon: "Mail",
      },
    ],
    capabilities: [
      {
        title: "Context-aware proposal drafts",
        description:
          "The draft references the lead's role, business category, pain point, or website status instead of filling in a generic template.",
        icon: "MessageSquare",
      },
      {
        title: "Subject line support",
        description:
          "Generate a subject line that fits the pitch angle and avoids sounding like mass outreach.",
        icon: "Mail",
      },
      {
        title: "Portfolio insertion",
        description:
          "Add relevant links once and include them where they strengthen the proposal.",
        icon: "FileText",
      },
      {
        title: "Follow-up friendly",
        description:
          "The same lead context supports follow-up drafts, making sequences easier to keep consistent.",
        icon: "Clock",
      },
    ],
    useCases: [
      {
        title: "Pitching a remote job",
        description:
          "Turn the job brief into a specific message that mirrors the client's requirements and positions your service clearly.",
        icon: "Target",
      },
      {
        title: "Pitching a local business",
        description:
          "Reference the business type, website status, or local search opportunity without sounding like a scraped template.",
        icon: "Users",
      },
      {
        title: "Refreshing old saved leads",
        description:
          "Open a saved lead, add a new proof point, and create a cleaner follow-up without starting from zero.",
        icon: "TrendingUp",
      },
    ],
    differentiators: [
      "The proposal starts from lead context, not a blank prompt.",
      "The user stays in control before anything is sent.",
      "It supports both freelance job posts and local business outreach.",
      "It is designed for short, direct first messages instead of bloated sales copy.",
    ],
    faqs: [
      {
        q: "Will the proposal sound AI-generated?",
        a: "The product is designed to avoid generic, padded outreach. The best results come from a focused lead, a clear service niche, and one or two proof points. You can always edit the subject line and body before using it.",
      },
      {
        q: "Can I use it for local business outreach?",
        a: "Yes. The proposal generator works with local business leads as well as remote job leads. For local businesses, it can draft around website modernization, local SEO, booking flows, or the service angle you choose.",
      },
      {
        q: "Does it send emails automatically?",
        a: "The safer default workflow prepares a Gmail draft that you review and send manually. That gives freelancers control over deliverability, tone, and final approval.",
      },
      {
        q: "Can I add my portfolio?",
        a: "Yes. Proposal pages include portfolio link support so your draft can reference relevant work without pasting the same links every time.",
      },
    ],
    cta: {
      heading: "Write the first message while the lead is fresh",
      subheading:
        "Open a lead, add your strongest proof, and turn it into a clean proposal without staring at a blank page.",
      button: "Generate a Proposal",
    },
  },
  {
    slug: "email-outreach",
    path: "/features/email-outreach",
    eyebrow: "Email Outreach",
    icon: "Mail",
    title: "Cold Email Outreach Software",
    accentTitle: "Built Around Safe Gmail Drafts",
    description:
      "Prepare personalized outreach from your own Gmail instead of handing control to a black-box sender. iCloseLeads helps freelancers draft, review, log, and follow up on prospect emails while keeping sending decisions human.",
    shortDescription:
      "Prepare Gmail-ready cold emails, track outreach history, and keep follow-ups organized without auto-blasting.",
    titleTag:
      "Cold Email Outreach Software for Freelancers with Gmail Drafts",
    metaDescription:
      "Prepare personalized cold emails in Gmail, track outreach history, prevent duplicate outreach, and manage follow-ups from your freelance CRM.",
    keywords: [
      "cold email outreach for freelancers",
      "freelance email outreach software",
      "Gmail cold email drafts",
      "freelance follow up tool",
      "cold email tracking for freelancers",
      "safe email outreach",
      "manual Gmail outreach workflow",
      "freelance campaign builder",
    ],
    theme: {
      accentText: "text-blue-400",
      accentBg: "bg-blue-500/10",
      accentBorder: "border-blue-500/25",
      gradientText: "from-blue-400 via-accent to-primary-light",
      heroWash: "from-blue-500/10 via-transparent to-accent/10",
      hoverBorder: "hover:border-blue-400/40",
    },
    audience:
      "Freelancers who want the structure of an outreach tool without giving up control of the actual send.",
    promise:
      "Use AI to prepare better emails, then review and send them yourself. The workflow keeps every action tied to the lead record so you can follow up with context instead of guessing.",
    proof: [
      "Proposal pages support Gmail compose preparation instead of requiring a direct sender.",
      "Outreach usage limits are visible, making the free-plan workflow predictable.",
      "Saved lead records and email history give every follow-up a single place to live.",
    ],
    stats: [
      { value: "Gmail", label: "Draft-first sending workflow" },
      { value: "Ledger", label: "Prepared outreach history" },
      { value: "Limits", label: "Daily and monthly safety controls" },
      { value: "CRM", label: "Follow-up context attached" },
    ],
    workflow: [
      {
        title: "Generate or write the message",
        description:
          "Start with an AI proposal or write your own message from the lead record.",
        icon: "Sparkles",
      },
      {
        title: "Review before Gmail opens",
        description:
          "Check subject, body, recipient, and personalization before creating the Gmail draft.",
        icon: "CheckCircle2",
      },
      {
        title: "Prepare the Gmail draft",
        description:
          "Open Gmail compose with the recipient, subject, and body prefilled so you send from your own inbox.",
        icon: "Mail",
      },
      {
        title: "Track and follow up",
        description:
          "Keep a history of prepared outreach and move the lead through pipeline stages as replies arrive.",
        icon: "Clock",
      },
    ],
    capabilities: [
      {
        title: "Gmail compose mode",
        description:
          "Prepare a real Gmail draft instead of hiding the message behind an automated sender.",
        icon: "Mail",
      },
      {
        title: "Safety limits",
        description:
          "Visible daily, monthly, and per-minute usage controls help protect sending behavior and user expectations.",
        icon: "Shield",
      },
      {
        title: "Duplicate awareness",
        description:
          "Lead records help you avoid pitching the same company repeatedly from different searches.",
        icon: "CheckCircle2",
      },
      {
        title: "Follow-up workflow",
        description:
          "Keep outreach and CRM status together so follow-ups are tied to the actual opportunity.",
        icon: "Layers",
      },
    ],
    useCases: [
      {
        title: "Freelancers warming up a lead list",
        description:
          "Prepare a small number of personalized messages each day instead of blasting generic templates.",
        icon: "Users",
      },
      {
        title: "Agencies managing prospect handoffs",
        description:
          "Keep prepared outreach, notes, and pipeline status in one place before a closer follows up.",
        icon: "Layers",
      },
      {
        title: "Local business pitching",
        description:
          "Use business context from local leads to prepare short, specific emails that do not feel mass-produced.",
        icon: "Target",
      },
    ],
    differentiators: [
      "Safer draft-first workflow instead of automatic mass sending.",
      "Outreach is connected to CRM status, not isolated in an email tool.",
      "Designed for freelancers who send fewer, better emails.",
      "Works alongside AI proposals without forcing direct send.",
    ],
    faqs: [
      {
        q: "Does iCloseLeads send emails automatically?",
        a: "The preferred workflow prepares messages in Gmail so the user reviews and sends manually. This is safer for early-stage outreach and gives freelancers control over every email.",
      },
      {
        q: "Can I track who I already contacted?",
        a: "Yes. Prepared outreach can be logged against the lead so you can avoid duplicate messages and keep follow-ups tied to the right prospect.",
      },
      {
        q: "Why use Gmail draft mode instead of direct sending?",
        a: "Draft mode keeps sending under your control, reduces accidental blasts, and makes it easier to review personalization before the prospect sees it.",
      },
      {
        q: "Can I use this with AI proposals?",
        a: "Yes. Generate the proposal first, edit it, then prepare it in Gmail from the proposal page.",
      },
    ],
    cta: {
      heading: "Prepare better outreach without losing control",
      subheading:
        "Write the message, review the context, open Gmail, and send only when it feels right.",
      button: "Prepare Outreach Free",
    },
  },
  {
    slug: "crm-pipeline",
    path: "/features/crm-pipeline",
    eyebrow: "CRM Pipeline",
    icon: "Layers",
    title: "Freelance CRM Software",
    accentTitle: "for Turning Leads into Signed Clients",
    description:
      "A simple client pipeline built for freelancers who prospect every week. Save leads, add notes, track status, prepare follow-ups, and see every opportunity from first contact to won deal without forcing a bloated sales CRM into your workflow.",
    shortDescription:
      "Track saved leads, notes, follow-ups, and deal stages in a CRM built for solo freelancers and small agencies.",
    titleTag:
      "Freelance CRM Software for Client Pipeline and Follow-Ups",
    metaDescription:
      "Manage freelance leads in a visual CRM pipeline with saved prospects, notes, stages, follow-ups, CSV exports, and analytics.",
    keywords: [
      "freelance CRM software",
      "CRM for freelancers",
      "client pipeline management",
      "freelance sales pipeline",
      "track freelance leads",
      "simple CRM for independent contractors",
      "freelance follow up CRM",
      "client management software for freelancers",
    ],
    theme: {
      accentText: "text-primary-light",
      accentBg: "bg-primary/10",
      accentBorder: "border-primary/25",
      gradientText: "from-primary-light via-blue-400 to-accent",
      heroWash: "from-primary/10 via-transparent to-blue-500/10",
      hoverBorder: "hover:border-primary/40",
    },
    audience:
      "Freelancers and agencies who save leads but lose momentum because follow-ups live in memory, spreadsheets, or scattered notes.",
    promise:
      "Keep the pipeline close to the prospecting workflow. Every saved lead can move through the same stages, carry private notes, and stay ready for the next follow-up.",
    proof: [
      "Saved leads feed the pipeline instead of sitting in a disconnected list.",
      "Status updates, notes, proposal actions, and exports are available inside the dashboard.",
      "The CRM is intentionally simpler than enterprise systems because freelancers need speed more than admin overhead.",
    ],
    stats: [
      { value: "6", label: "Core pipeline stages" },
      { value: "1 place", label: "Notes, status, and lead context" },
      { value: "CSV", label: "Export when you need it" },
      { value: "Fast", label: "Designed for weekly prospecting" },
    ],
    workflow: [
      {
        title: "Save qualified leads",
        description:
          "Move only the opportunities worth actioning into your pipeline so the CRM starts clean.",
        icon: "CheckCircle2",
      },
      {
        title: "Add context before outreach",
        description:
          "Store business details, angle ideas, contact notes, and the reason the prospect is a fit.",
        icon: "FileText",
      },
      {
        title: "Move stages as the conversation changes",
        description:
          "Track New, Contacted, Replied, Follow-Up, Won, and Lost without building a custom CRM from scratch.",
        icon: "Layers",
      },
      {
        title: "Review the pipeline weekly",
        description:
          "See who needs a nudge, where deals are stuck, and which lead types are worth more prospecting time.",
        icon: "BarChart2",
      },
    ],
    capabilities: [
      {
        title: "Saved lead CRM",
        description:
          "Every saved remote or local lead can become an active prospect in the same dashboard.",
        icon: "Layers",
      },
      {
        title: "Private notes",
        description:
          "Keep pitch angles, objections, decision-maker details, and next steps attached to the lead.",
        icon: "FileText",
      },
      {
        title: "Pipeline exports",
        description:
          "Export saved leads and pipeline data when you need external reporting or offline review.",
        icon: "TrendingUp",
      },
      {
        title: "Proposal shortcuts",
        description:
          "Jump from a lead record to an AI proposal instead of copying details between tools.",
        icon: "Sparkles",
      },
    ],
    useCases: [
      {
        title: "Weekly prospecting review",
        description:
          "Block one hour each week, filter saved leads, update status, and decide who gets a follow-up.",
        icon: "Clock",
      },
      {
        title: "Agency lead handoff",
        description:
          "Keep qualified leads, notes, and status visible for the person writing or sending the pitch.",
        icon: "Users",
      },
      {
        title: "Retainer pipeline building",
        description:
          "Track local businesses and recurring-service prospects over a longer sales cycle.",
        icon: "TrendingUp",
      },
    ],
    differentiators: [
      "Built into lead discovery, so CRM does not start as an empty database.",
      "Focused stages match freelance outreach instead of enterprise sales ops.",
      "Supports both job-board opportunities and local business prospects.",
      "Simple enough to use every week without admin fatigue.",
    ],
    faqs: [
      {
        q: "Is this a full CRM or just a saved list?",
        a: "It is a lightweight CRM built around saved leads, status tracking, notes, proposal actions, and exports. It is intentionally simpler than enterprise CRMs because freelancers need speed and clarity.",
      },
      {
        q: "What pipeline stages are supported?",
        a: "The core workflow uses New, Contacted, Replied, Follow-Up, Won, and Lost so you can track the practical state of each prospect.",
      },
      {
        q: "Can I use it for local business leads?",
        a: "Yes. Remote job leads and local business leads can both be saved and managed through the same follow-up workflow.",
      },
      {
        q: "Can I export my leads?",
        a: "Yes. Saved leads can be exported so you are not locked into the dashboard.",
      },
    ],
    cta: {
      heading: "Stop letting good leads disappear",
      subheading:
        "Save the prospect, write the pitch, track the stage, and know exactly who needs your next follow-up.",
      button: "Open Your Free CRM",
    },
  },
  {
    slug: "analytics",
    path: "/features/analytics",
    eyebrow: "Analytics",
    icon: "BarChart2",
    title: "Freelance Analytics Dashboard",
    accentTitle: "for Better Prospecting Decisions",
    description:
      "See how your lead generation work is moving through the funnel. iCloseLeads helps freelancers track searches, saved leads, proposals, outreach, source mix, and pipeline movement so prospecting becomes measurable instead of emotional.",
    shortDescription:
      "Track lead searches, saved prospects, proposals, outreach, source mix, and pipeline movement from one dashboard.",
    titleTag:
      "Freelance Analytics Dashboard for Leads, Proposals, and Pipeline",
    metaDescription:
      "Measure your freelance client acquisition workflow with analytics for leads, saved prospects, proposals, outreach, pipeline stages, and source performance.",
    keywords: [
      "freelance analytics dashboard",
      "track freelance leads",
      "freelance pipeline analytics",
      "proposal analytics for freelancers",
      "cold outreach analytics",
      "freelance KPI dashboard",
      "client acquisition analytics",
      "lead source performance for freelancers",
    ],
    theme: {
      accentText: "text-green-400",
      accentBg: "bg-green-500/10",
      accentBorder: "border-green-500/25",
      gradientText: "from-green-400 via-accent to-primary-light",
      heroWash: "from-green-500/10 via-transparent to-primary/10",
      hoverBorder: "hover:border-green-400/40",
    },
    audience:
      "Freelancers who are sending proposals but do not know which niches, sources, or follow-ups are actually producing pipeline.",
    promise:
      "Treat client acquisition like a system. Watch how leads become saved prospects, how prospects become proposals, and where follow-up effort should go next.",
    proof: [
      "Dashboard stats connect to real saved leads, sent/prepared email records, and usage activity.",
      "Source and pipeline views make weekly review faster than spreadsheet maintenance.",
      "Usage limits and weekly activity make the free plan easier to understand.",
    ],
    stats: [
      { value: "30 days", label: "Recent activity views" },
      { value: "Sources", label: "Lead channel breakdown" },
      { value: "Stages", label: "Pipeline visibility" },
      { value: "Usage", label: "Quota and activity tracking" },
    ],
    workflow: [
      {
        title: "Review search volume",
        description:
          "See whether you are finding enough leads each week to keep the pipeline alive.",
        icon: "Search",
      },
      {
        title: "Watch saved lead quality",
        description:
          "Compare which searches produce prospects worth saving, not just large result counts.",
        icon: "Target",
      },
      {
        title: "Track proposal and outreach actions",
        description:
          "Understand whether leads are turning into real outreach or sitting untouched.",
        icon: "Mail",
      },
      {
        title: "Use pipeline movement to decide next steps",
        description:
          "Follow the bottlenecks: too few saved leads, too few proposals, weak follow-up, or low-quality source mix.",
        icon: "BarChart2",
      },
    ],
    capabilities: [
      {
        title: "Dashboard overview",
        description:
          "See the key client-acquisition numbers in one place instead of checking multiple product areas.",
        icon: "BarChart2",
      },
      {
        title: "Source insights",
        description:
          "Understand which lead types and channels are producing prospects you actually save.",
        icon: "TrendingUp",
      },
      {
        title: "Pipeline reports",
        description:
          "View lead status movement and spot where follow-up work is needed.",
        icon: "Layers",
      },
      {
        title: "Usage tracking",
        description:
          "Keep an eye on searches, proposal generation, and outreach activity against plan limits.",
        icon: "Clock",
      },
    ],
    useCases: [
      {
        title: "Monday pipeline review",
        description:
          "Check last week's search volume, saved leads, and follow-up needs before starting new outreach.",
        icon: "Clock",
      },
      {
        title: "Niche focus decisions",
        description:
          "Compare which service categories produce better prospects and stop wasting time on weak searches.",
        icon: "Target",
      },
      {
        title: "Agency reporting",
        description:
          "Give a team or manager a clear view of prospecting activity without manual spreadsheet updates.",
        icon: "Users",
      },
    ],
    differentiators: [
      "Measures the prospecting workflow, not vanity dashboard metrics.",
      "Built around freelancers who need weekly action, not enterprise reporting.",
      "Connects discovery, proposals, outreach, and CRM in one funnel.",
      "Keeps limits and usage visible so free-plan users know where they stand.",
    ],
    faqs: [
      {
        q: "What does the analytics dashboard track?",
        a: "It tracks key client-acquisition activity such as lead searches, saved leads, proposal activity, outreach records, source breakdown, usage, and pipeline movement.",
      },
      {
        q: "Will analytics tell me which niche is best?",
        a: "It helps you see which searches and saved leads are creating movement. That gives you practical evidence for which niche deserves more outreach time.",
      },
      {
        q: "Is this only for email outreach?",
        a: "No. Analytics is broader than email. It helps you understand the full workflow from lead discovery to saved prospect, proposal, outreach, and pipeline status.",
      },
      {
        q: "How often should I review it?",
        a: "A weekly review is usually enough. Use it to decide which leads need follow-up, which searches to repeat, and which channels are not worth your time.",
      },
    ],
    cta: {
      heading: "Make prospecting measurable",
      subheading:
        "See what is working, what is stuck, and where your next outreach block should go.",
      button: "View Analytics Free",
    },
  },
  {
    slug: "free-tools",
    path: "/features/free-tools",
    eyebrow: "Free Freelance Tools",
    icon: "Wrench",
    title: "Free Freelance Tools",
    accentTitle: "for Pricing, Pitching, and Client Safety",
    description:
      "A practical toolkit for freelancers who want to price confidently, write cleaner outreach, avoid bad-fit clients, and understand which opportunities are worth pursuing. The tools are built into the dashboard so research, pitching, and pipeline work stay together.",
    shortDescription:
      "Use free tools for rates, subject lines, proposal readability, spam checks, client value, and niche demand.",
    titleTag:
      "Free Freelance Tools: Rate Calculator, Subject Lines, Proposal Checker",
    metaDescription:
      "Free tools for freelancers: rate calculator, subject line generator, proposal readability scorer, spam checker, client value calculator, and niche demand estimator.",
    keywords: [
      "free freelance tools",
      "freelance rate calculator",
      "cold email subject line generator",
      "proposal readability checker",
      "email spam score checker",
      "client lifetime value calculator",
      "freelance niche demand estimator",
      "tools for freelancers",
    ],
    theme: {
      accentText: "text-orange-400",
      accentBg: "bg-orange-500/10",
      accentBorder: "border-orange-500/25",
      gradientText: "from-orange-400 via-gold to-accent",
      heroWash: "from-orange-500/10 via-transparent to-accent/10",
      hoverBorder: "hover:border-orange-400/40",
    },
    audience:
      "Freelancers who need quick answers before they pitch: what to charge, how to write the subject line, whether a draft is readable, and whether a lead is worth the time.",
    promise:
      "Use small tools to remove small doubts. Better pricing, cleaner emails, and smarter prospect selection make the rest of the platform more effective.",
    proof: [
      "The dashboard includes six utility tools, not just a marketing page promising future calculators.",
      "Tools support the actual workflow: pricing, subject lines, proposal clarity, spam risk, client value, and niche demand.",
      "They sit beside lead discovery and CRM so you can use them during real prospecting sessions.",
    ],
    stats: [
      { value: "6", label: "Tools in the dashboard" },
      { value: "Instant", label: "No waiting for simple calculations" },
      { value: "Free", label: "Available during launch access" },
      { value: "Practical", label: "Built for real outreach decisions" },
    ],
    workflow: [
      {
        title: "Calculate what you should charge",
        description:
          "Use target income, expenses, billable hours, vacation, and buffer to estimate a sustainable hourly or project rate.",
        icon: "BarChart2",
      },
      {
        title: "Write stronger subject lines",
        description:
          "Generate niche-aware subject line angles that sound specific enough to open.",
        icon: "Mail",
      },
      {
        title: "Check proposal clarity",
        description:
          "Scan drafts for long sentences, passive voice, filler, and readability issues before sending.",
        icon: "FileText",
      },
      {
        title: "Prioritize better opportunities",
        description:
          "Estimate client lifetime value and niche demand so the best leads get your best time.",
        icon: "TrendingUp",
      },
    ],
    capabilities: [
      {
        title: "Freelance rate calculator",
        description:
          "Estimate sustainable rates from income goals, expenses, billable hours, vacation, and profit buffer.",
        icon: "BarChart2",
      },
      {
        title: "Subject line generator",
        description:
          "Generate niche-aware subject lines for cold outreach and proposal follow-ups.",
        icon: "Mail",
      },
      {
        title: "Proposal readability scorer",
        description:
          "Spot long sentences, filler words, passive voice, and clarity problems before a prospect reads them.",
        icon: "FileText",
      },
      {
        title: "Spam score checker",
        description:
          "Catch common cold-email trigger words and risky formatting before sending.",
        icon: "Shield",
      },
      {
        title: "Client lifetime value calculator",
        description:
          "Estimate the full value of a retainer or recurring client so follow-up priority is based on upside.",
        icon: "TrendingUp",
      },
      {
        title: "Niche demand estimator",
        description:
          "Compare market demand, competition, rate ranges, and positioning ideas by service niche.",
        icon: "Target",
      },
    ],
    useCases: [
      {
        title: "Before quoting a project",
        description:
          "Use the rate calculator and client value calculator so your price matches the business value.",
        icon: "BarChart2",
      },
      {
        title: "Before sending outreach",
        description:
          "Run a subject line and spam check to avoid weak openings or risky phrasing.",
        icon: "Mail",
      },
      {
        title: "Before choosing a niche",
        description:
          "Use niche demand signals to decide where your weekly prospecting energy should go.",
        icon: "Target",
      },
    ],
    differentiators: [
      "The tools support decisions freelancers make every week.",
      "They complement lead discovery instead of distracting from it.",
      "They are simple enough to use during prospecting, not after hours of setup.",
      "They help with pricing, writing, deliverability, and prioritization in one dashboard.",
    ],
    faqs: [
      {
        q: "What free tools are included?",
        a: "The dashboard includes a freelance rate calculator, subject line generator, proposal readability scorer, spam score checker, client lifetime value calculator, and niche demand estimator.",
      },
      {
        q: "Do I need a paid plan to use the tools?",
        a: "The tools are available during launch access. Some future advanced tools may be part of paid plans, but the core toolkit is designed to help users get value immediately.",
      },
      {
        q: "Are the calculators financial advice?",
        a: "No. They are planning aids. You should still consider your local taxes, expenses, market, and risk tolerance before setting rates.",
      },
      {
        q: "How do the tools connect to lead discovery?",
        a: "They help with the decisions around the lead: what to charge, how to pitch, whether the message reads clearly, and whether the prospect is worth deeper follow-up.",
      },
    ],
    cta: {
      heading: "Use sharper tools before you pitch",
      subheading:
        "Price better, write cleaner messages, and focus on the clients that can actually move your freelance business forward.",
      button: "Open Free Tools",
    },
  },
];

export const FEATURE_MAP = FEATURE_PAGES.reduce((acc, page) => {
  acc[page.slug] = page;
  return acc;
}, {} as Record<FeatureSlug, FeaturePageData>);

export function getFeaturePage(slug: FeatureSlug): FeaturePageData {
  return FEATURE_MAP[slug];
}

export function featureMetadata(page: FeaturePageData): Metadata {
  const url = `${BASE_URL}${page.path}`;
  return {
    metadataBase: new URL(BASE_URL),
    title: page.titleTag,
    description: page.metaDescription,
    keywords: page.keywords,
    alternates: { canonical: url },
    openGraph: {
      title: page.titleTag,
      description: page.metaDescription,
      url,
      type: "website",
      siteName: "iCloseLeads",
    },
    twitter: {
      card: "summary_large_image",
      title: page.titleTag,
      description: page.metaDescription,
    },
  };
}
