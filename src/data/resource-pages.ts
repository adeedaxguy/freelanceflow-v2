export type ResourcePage = {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  keyword: string;
  audience: string;
  intent: string;
  summary: string;
  leadIn: string;
  steps: string[];
  proofPoints: string[];
  pitch: string;
  internalLinks: { label: string; href: string }[];
  faqs: { q: string; a: string }[];
};

export const RESOURCE_PAGES: ResourcePage[] = [
  {
    slug: "web-design-leads",
    title: "Web design leads that are worth pitching",
    metaTitle: "Web Design Leads: Find Better-Fit Clients and Pitch With Real Context",
    metaDescription:
      "Find web design leads from businesses without websites, outdated sites, local search gaps, and owner-path signals, then turn each lead into a focused first pitch.",
    keyword: "web design leads",
    audience: "Web designers, WordPress developers, Webflow freelancers, and small agencies",
    intent: "The searcher wants a repeatable way to find businesses that may pay for website work.",
    summary:
      "The best web design leads are not random companies. They show a visible reason to talk: no website, a dated site, weak local search presence, missing booking flow, public phone route, or a business profile that depends on trust and bookings.",
    leadIn:
      "Start with businesses where the website problem is obvious enough that your first message can be specific. iCloseLeads helps you search by niche and location, verify the business profile, save the lead, and draft a proposal while the context is still clear enough to turn into a real signup and first workflow run.",
    steps: [
      "Pick one local category such as auto repair, cleaners, dentists, roofers, restaurants, salons, or trades.",
      "Search one city or postcode area at a time so the pitch can mention a real market.",
      "Prioritize no-website, outdated-site, phone-visible, and small-operator signals.",
      "Open the map/profile proof before saving the lead.",
      "Use the pitch to sell calls, bookings, quotes, and trust, not just a prettier website.",
    ],
    proofPoints: [
      "GSC is still surfacing web design leads and leads for web design as one of the clearest acquisition clusters for iCloseLeads.",
      "Live US SERPs reward practical businesses-without-websites positioning instead of generic agency branding.",
      "iCloseLeads already connects local discovery, owner-path checks, proposal drafting, and CRM follow-up for this workflow.",
    ],
    pitch:
      "Hi, I found your business while checking local search results and noticed your website presence could be doing more to turn nearby searches into calls. I have a short idea for improving the site and quote flow if you are open to seeing it.",
    internalLinks: [
      { label: "Find local business leads", href: "/use-cases/local-business-leads" },
      { label: "Web design proposal template", href: "/resources/web-design-proposal-template" },
      { label: "Decision maker email workflow", href: "/resources/find-decision-maker-email-small-business" },
      { label: "AI proposal generator", href: "/features/ai-proposals" },
    ],
    faqs: [
      {
        q: "What is a web design lead?",
        a: "A web design lead is a business or buyer signal that suggests the company may need a new website, redesign, booking flow, landing page, or local SEO improvement.",
      },
      {
        q: "Should I buy web design leads?",
        a: "Only if you can verify the business, the need, and the contact route. A smaller verified list usually beats a large generic list.",
      },
    ],
  },
  {
    slug: "web-design-proposal-template",
    title: "Web design proposal template that starts from a real lead",
    metaTitle: "Web Design Proposal Template for Freelancers | Pitch Local and SMB Website Work",
    metaDescription:
      "Use a web design proposal template built for freelancers who pitch local businesses, outdated websites, and website-redesign leads with real context instead of generic filler.",
    keyword: "web design proposal template",
    audience: "Web designers, Webflow freelancers, WordPress developers, and small agencies",
    intent: "The searcher wants a proposal structure that helps close website projects without sounding recycled.",
    summary:
      "A strong web design proposal template does not begin with your agency bio. It begins with the buyer's website problem, the business outcome, the scope you actually recommend, and one next step that feels easy to say yes to.",
    leadIn:
      "Use the lead signal before you write the proposal. If the business has no website, an outdated mobile experience, or a weak booking path, the proposal should reflect that exact gap. iCloseLeads helps you move from saved lead to AI-assisted draft while the context is still fresh enough to sound personal.",
    steps: [
      "Open the lead and write down the visible website or conversion problem first.",
      "Frame the proposal around business outcomes like calls, quotes, bookings, trust, or speed to launch.",
      "Keep scope tight enough that the buyer understands what happens first.",
      "Show one relevant proof point instead of a full portfolio dump.",
      "End with one clear next step such as a call, mockup review, or starter sprint.",
    ],
    proofPoints: [
      "Public SERPs for web design proposal templates are dominated by broad template libraries, which leaves space for a freelancer-first page tied to real lead context.",
      "iCloseLeads already connects local lead discovery, proposal drafting, and outreach preparation in one workflow.",
      "This topic is a clean conversion bridge from acquisition intent into AI proposals, saved leads, and Gmail-ready outreach.",
    ],
    pitch:
      "Hi, I checked your website and noticed one issue that may be costing you calls or quote requests. I put together a short proposal focused on fixing that first, with a clear scope and timeline if you want to review it.",
    internalLinks: [
      { label: "Web design leads", href: "/resources/web-design-leads" },
      { label: "AI proposal generator", href: "/features/ai-proposals" },
      { label: "Local business leads", href: "/use-cases/local-business-leads" },
    ],
    faqs: [
      {
        q: "What should a web design proposal include?",
        a: "A good proposal includes the problem you noticed, the outcome you are aiming for, the proposed scope, timeline, investment framing, and one simple next step.",
      },
      {
        q: "Should I use the same proposal for every website lead?",
        a: "No. The structure can stay consistent, but the problem statement, proof, and scope should reflect the actual lead you are pitching.",
      },
    ],
  },
  {
    slug: "businesses-without-websites",
    title: "How to find businesses without websites",
    metaTitle: "Businesses Without Websites: Find Better Local Leads Before You Pitch",
    metaDescription:
      "Find businesses without websites using local search signals, map profiles, public phone routes, and a qualification workflow before pitching web design or local SEO help.",
    keyword: "businesses without websites",
    audience: "Freelancers selling websites, SEO, branding, booking systems, or local marketing",
    intent: "The searcher wants a practical way to discover offline or under-served local businesses.",
    summary:
      "A business without a website is not automatically a buyer. The opportunity is strongest when the company has active local demand, a working phone number, recent reviews, and a service where trust or bookings matter.",
    leadIn:
      "Use no-website status as the starting point, then qualify the business before outreach. The message should connect a website to calls, bookings, quote requests, reviews, or missed local search demand.",
    steps: [
      "Search high-value local categories where customers research before calling.",
      "Check whether the listing uses no website, only social media, or an unverified web presence.",
      "Confirm the address, phone, category, and review activity.",
      "Look for owner or manager routes only when the profile looks worth pitching.",
      "Save notes about why a website would help that specific business.",
    ],
    proofPoints: [
      "Live US SERPs are full of tools and guides around businesses-without-websites prospecting, which confirms commercial search intent.",
      "This cluster fits freelancers selling websites, local SEO, and simple conversion-first online presences.",
      "iCloseLeads can take the search from discovery to saved lead, proposal draft, and follow-up without leaving the workflow.",
    ],
    pitch:
      "Hi, I noticed your business is visible locally but does not seem to have a dedicated website attached to the listing. A simple site could help people check services, trust you faster, and call with less friction.",
    internalLinks: [
      { label: "Local business leads use case", href: "/use-cases/local-business-leads" },
      { label: "Web design proposal template", href: "/resources/web-design-proposal-template" },
      { label: "Find decision maker email", href: "/resources/find-decision-maker-email-small-business" },
      { label: "Track saved leads", href: "/features/crm-pipeline" },
    ],
    faqs: [
      {
        q: "Are businesses without websites good leads?",
        a: "They can be, but only when they have active local demand, a reachable contact route, and a service where a website can clearly improve trust or enquiries.",
      },
      {
        q: "What should I pitch first?",
        a: "Pitch the business outcome: more calls, easier quotes, trust, bookings, and local search visibility.",
      },
    ],
  },
  {
    slug: "freelance-cold-outreach",
    title: "Freelance cold outreach that starts with a real signal",
    metaTitle: "Freelance Cold Outreach: Find Better Leads, Draft Gmail Outreach, and Follow Up",
    metaDescription:
      "Build a freelance cold outreach workflow around real buyer signals, public context, short pitches, Gmail-ready drafts, and CRM follow-up that freelancers can actually maintain.",
    keyword: "freelance cold outreach",
    audience: "Freelancers and solo agencies selling services directly",
    intent: "The searcher wants clients without relying only on job boards, marketplaces, or referrals.",
    summary:
      "Cold outreach works best when the first line proves why you are reaching out. The signal can be a job post, website gap, local listing issue, hiring cue, or recent business change that gives your email a reason to exist.",
    leadIn:
      "Do not start with a spreadsheet of names. Start with a reason. iCloseLeads helps you find the signal, save the prospect, and prepare a concise Gmail-ready draft that can be reviewed before sending.",
    steps: [
      "Choose one offer and one buyer type for the week.",
      "Find leads where the problem is visible in public context.",
      "Open with the observation instead of your biography.",
      "Offer one practical next step, not a long menu of services.",
      "Track the lead so follow-up happens without guessing.",
    ],
    proofPoints: [
      "GSC continues to show freelance cold outreach as an early but recurring query cluster for the site.",
      "Live US SERPs reward practical templates, examples, and workflow pages over vague cold-email advice.",
      "GA4 shows engagement and form-start activity on outreach-related pages even though key-event tracking is still incomplete.",
      "iCloseLeads connects discovery, proposal writing, Gmail preparation, and CRM follow-up in one product path.",
    ],
    pitch:
      "Hi, I found your post/profile while researching companies that may need help with [specific issue]. I noticed [signal]. I can help with a small first step that would make this easier to solve.",
    internalLinks: [
      { label: "Cold outreach use case", href: "/use-cases/freelance-cold-outreach" },
      { label: "Cold outreach CRM for freelancers", href: "/resources/cold-outreach-crm-for-freelancers" },
      { label: "Freelance proposal subject lines", href: "/resources/freelance-proposal-subject-lines" },
      { label: "Proposal follow-up email", href: "/resources/proposal-follow-up-email" },
    ],
    faqs: [
      {
        q: "What makes cold outreach less spammy?",
        a: "A real observation, a short message, a relevant offer, and respectful follow-up. The goal is fit, not volume.",
      },
      {
        q: "How many leads should I contact?",
        a: "Start with a small batch you can personalize properly. Quality matters more than raw send count.",
      },
    ],
  },
  {
    slug: "local-business-leads-for-web-designers",
    title: "Local business leads for web designers",
    metaTitle: "Local Business Leads for Web Designers | Signals, Filters, and Pitch Angles",
    metaDescription:
      "Find local business leads for web designers by niche, city, website status, phone visibility, owner path, and pitch-ready business context.",
    keyword: "local business leads for web designers",
    audience: "Web designers and small studios selling to local companies",
    intent: "The searcher wants local companies that are easier to pitch for website or marketing work.",
    summary:
      "The strongest local leads usually combine category fit, local demand, website weakness, contact visibility, and a simple business improvement story.",
    leadIn:
      "A local lead should be more than a name. Before pitching, confirm the profile, the business type, the website gap, and the contact route. Then write around the outcome the owner cares about.",
    steps: [
      "Search categories where a better website can directly influence calls or bookings.",
      "Use city-level searches to keep the pitch grounded.",
      "Filter by no website, outdated site, phone visibility, and small operator clues.",
      "Save only the businesses you can explain in one sentence.",
      "Move the best leads into owner-path or proposal workflows.",
    ],
    proofPoints: [
      "GSC already shows this cluster through web-design-lead and local-business-search impressions tied to iCloseLeads pages.",
      "The live SERP includes direct tools and prospecting pages, which confirms strong commercial intent.",
      "iCloseLeads can differentiate by combining local discovery, owner-path checks, proposal drafting, and CRM follow-up.",
    ],
    pitch:
      "Hi, I help local businesses turn search visibility into more calls. I found your listing and noticed a website improvement that could make it easier for customers to choose you.",
    internalLinks: [
      { label: "Local leads dashboard", href: "/use-cases/local-business-leads" },
      { label: "Decision maker email workflow", href: "/resources/find-decision-maker-email-small-business" },
      { label: "Web design proposal template", href: "/resources/web-design-proposal-template" },
      { label: "CRM pipeline", href: "/features/crm-pipeline" },
    ],
    faqs: [
      {
        q: "Which local businesses are best for web design outreach?",
        a: "Service businesses with active local demand, public phone numbers, reviews, and weak or missing websites are usually stronger than generic company lists.",
      },
      {
        q: "Should web designers target one city at a time?",
        a: "Yes. City-level focus makes qualification, examples, and calls much easier to personalize.",
      },
    ],
  },
  {
    slug: "exclusive-web-design-leads",
    title: "What exclusive web design leads should actually mean",
    metaTitle: "Exclusive Web Design Leads: Verify Quality Before You Pitch",
    metaDescription:
      "Learn what exclusive web design leads should mean, how to verify quality, and how to build your own less-crowded prospecting workflow inside iCloseLeads.",
    keyword: "exclusive web design leads",
    audience: "Freelancers comparing lead lists, lead tools, and direct prospecting systems",
    intent: "The searcher wants leads that are not already being pitched by every agency.",
    summary:
      "Exclusive should not mean mysterious. A useful lead feels exclusive because you found a real signal early, verified it, and wrote a pitch that is specific to the business.",
    leadIn:
      "Many sellers use the word exclusive without showing how the lead was qualified. A better approach is to build a workflow where each prospect has a reason, proof link, contact route, and follow-up plan before you send the first email.",
    steps: [
      "Avoid generic lists that cannot explain why the business is a fit.",
      "Check whether the lead has a visible problem you can solve.",
      "Verify profile, phone, website, and category before outreach.",
      "Save notes so your pitch is not interchangeable.",
      "Follow up based on the original signal, not a generic reminder.",
    ],
    proofPoints: [
      "GSC still shows impressions for exclusive web design leads even before the cluster has a mature page footprint.",
      "Live SERPs and competitor pages lean on list language, but buyers still need verification, timing, and workflow support.",
      "iCloseLeads can position exclusivity as earlier signals plus better qualification, not a mystery spreadsheet.",
    ],
    pitch:
      "Hi, I noticed a specific website opportunity while checking your local search presence. I am not sending a generic design pitch; I have one practical improvement in mind for your business.",
    internalLinks: [
      { label: "Web design lead workflow", href: "/resources/web-design-leads" },
      { label: "Lead generation tools", href: "/resources/best-lead-generation-tools-for-freelancers" },
      { label: "Local business leads", href: "/use-cases/local-business-leads" },
      { label: "Saved lead CRM", href: "/features/crm-pipeline" },
    ],
    faqs: [
      {
        q: "Are exclusive web design leads real?",
        a: "They can be, but exclusivity needs proof. Ask how the lead was sourced, qualified, verified, and protected from being sold widely.",
      },
      {
        q: "Can I create my own exclusive leads?",
        a: "Yes. Niche, location, timing, verification, and thoughtful outreach can make your own lead workflow much less crowded.",
      },
    ],
  },
  {
    slug: "outdated-website-leads",
    title: "How to qualify outdated website leads",
    metaTitle: "Outdated Website Leads: Find Businesses Ready for a Website Refresh",
    metaDescription:
      "Find and qualify outdated website leads using mobile UX, speed, trust, booking, local SEO, and conversion signals before pitching a redesign.",
    keyword: "outdated website leads",
    audience: "Website designers, local SEO consultants, and conversion specialists",
    intent: "The searcher wants businesses where a redesign or modernization pitch makes sense.",
    summary:
      "An outdated website lead is strongest when the site creates measurable friction: hard-to-read mobile layout, slow load, unclear services, weak trust signals, missing forms, or poor local search context.",
    leadIn:
      "Do not pitch a redesign just because a site looks old. Pitch the business impact. Explain how a cleaner website could improve quote requests, calls, bookings, credibility, or local search conversion.",
    steps: [
      "Open the website on mobile before judging it.",
      "Check whether the main service and call button are obvious.",
      "Look for missing forms, weak trust proof, and confusing navigation.",
      "Compare the site to the business profile and reviews.",
      "Pitch one practical modernization sprint instead of a vague redesign.",
    ],
    proofPoints: [
      "Outdated-site filters already sit inside the local business lead workflow, so the search intent maps cleanly to product behavior.",
      "This cluster supports the broader web design leads topic without duplicating the main businesses-without-websites angle.",
      "The pitch naturally moves into AI proposal, outreach, and saved-lead follow-up workflows.",
    ],
    pitch:
      "Hi, I checked your website from a mobile customer’s point of view and saw a few places where people may drop off before calling. I can show you a simple refresh plan focused on more enquiries.",
    internalLinks: [
      { label: "Local business lead filters", href: "/use-cases/local-business-leads" },
      { label: "Web design proposal template", href: "/resources/web-design-proposal-template" },
      { label: "Cold outreach CRM", href: "/resources/cold-outreach-crm-for-freelancers" },
      { label: "Web design leads guide", href: "/resources/web-design-leads" },
    ],
    faqs: [
      {
        q: "What counts as an outdated website lead?",
        a: "A business with a website that may be hurting trust, mobile usability, local search conversion, booking flow, or quote requests.",
      },
      {
        q: "Should I mention design taste in the pitch?",
        a: "Usually no. Mention business friction such as missed calls, unclear services, slow pages, or weak mobile experience.",
      },
    ],
  },
  {
    slug: "remote-job-leads",
    title: "Remote job leads for freelancers",
    metaTitle: "Remote Job Leads: Find Fresh Freelance Opportunities Before the Crowd",
    metaDescription:
      "Find remote job leads by niche, freshness, contact signals, budget clues, and proposal fit, then save and pitch the best opportunities.",
    keyword: "remote job leads",
    audience: "Freelancers selling remote services",
    intent: "The searcher wants fresh remote work opportunities that can become clients.",
    summary:
      "Remote job leads are time-sensitive. The same post can be useful at hour two and useless after hundreds of generic replies. Freshness, niche fit, and pitch quality matter.",
    leadIn:
      "Treat remote jobs as buying signals. Search by one service niche, prioritize fresh posts, look for scope or budget clues, then save only the opportunities that deserve a researched proposal.",
    steps: [
      "Search one niche such as WordPress, SEO, React, Webflow, Meta ads, or copywriting.",
      "Use freshness windows like 12h, 24h, 48h, and 7d.",
      "Filter for contact-ready or budget-signal posts when available.",
      "Open the post before generating the pitch.",
      "Track follow-up if the opportunity is worth a second message.",
    ],
    proofPoints: [
      "Remote job leads are a primary iCloseLeads feature and use case.",
      "The workflow connects discovery to proposals and saved lead tracking.",
      "This page supports users who search before they know the product name.",
    ],
    pitch:
      "Hi, I saw your remote post and the requirement around [specific need] stood out. I have handled similar work and can suggest a small first step to get this moving quickly.",
    internalLinks: [
      { label: "Remote jobs use case", href: "/use-cases/remote-job-leads" },
      { label: "Remote job proposal template", href: "/resources/remote-job-proposal-template" },
      { label: "Client acquisition software", href: "/resources/freelance-client-acquisition-software" },
      { label: "Proposal generator", href: "/features/ai-proposals" },
    ],
    faqs: [
      {
        q: "Are remote job leads different from job listings?",
        a: "Yes. A lead is a listing or signal that has enough context, timing, and fit to justify a direct, tailored pitch.",
      },
      {
        q: "Which remote leads should I save?",
        a: "Save leads with clear scope, recent posting time, strong niche match, and enough context to write a specific proposal.",
      },
    ],
  },
  {
    slug: "remote-job-proposal-template",
    title: "Remote job proposal template for freelancers",
    metaTitle: "Remote Job Proposal Template | Write Better Freelance Project Pitches",
    metaDescription:
      "Use a remote job proposal template built for freelancers who reply to fresh job posts, contract opportunities, and project briefs with tighter, context-aware pitches.",
    keyword: "remote job proposal template",
    audience: "Freelancers pitching remote contract work, startup projects, and agency overflow work",
    intent: "The searcher wants a proposal format that helps them reply quickly without sounding generic.",
    summary:
      "A remote job proposal template should help you reply fast, but the winning detail is still specificity. The best pitches mirror the client's brief, show one relevant proof point, and make the first deliverable feel low-friction.",
    leadIn:
      "Use the job post as the outline. Pull the scope clue, urgency signal, and likely first deliverable into the proposal before the listing goes stale. iCloseLeads helps you find the lead, save it, and draft a cleaner first response while the buyer's language is still visible.",
    steps: [
      "Read the full job post before drafting anything.",
      "Mirror the buyer's stated scope in the opening line so they know the proposal is for them.",
      "Choose one proof point that matches the project type, not your whole history.",
      "Suggest a realistic first deliverable or first-week sprint.",
      "Keep the close simple: invite a short reply, call, or review step.",
    ],
    proofPoints: [
      "Remote-job SERPs reward fast, practical templates and examples more than vague application advice.",
      "iCloseLeads already supports remote lead discovery, proposal drafting, and saved-lead follow-up in one product path.",
      "This page supports signups from users who are ready to pitch now rather than browse generic remote-work content.",
    ],
    pitch:
      "Hi, I saw your post and the need around [specific deliverable] stood out. I put together a short proposal focused on the first step I would take so you can judge fit quickly.",
    internalLinks: [
      { label: "Remote job leads", href: "/resources/remote-job-leads" },
      { label: "Remote job use case", href: "/use-cases/remote-job-leads" },
      { label: "AI proposal generator", href: "/features/ai-proposals" },
    ],
    faqs: [
      {
        q: "What should a remote job proposal focus on first?",
        a: "Lead with the exact deliverable or problem named in the job post, then show one relevant proof point and the first step you would take.",
      },
      {
        q: "How long should a remote proposal be?",
        a: "Usually shorter than you think. The goal is clarity, fit, and momentum, not a long biography.",
      },
    ],
  },
  {
    slug: "best-lead-generation-tools-for-freelancers",
    title: "Best lead generation tools for freelancers who need clients now",
    metaTitle: "Best Lead Generation Tools for Freelancers | Compare Outreach Workflows",
    metaDescription:
      "Compare lead generation tools for freelancers by lead source, proposal workflow, CRM fit, outreach support, and how quickly each tool can help you take action.",
    keyword: "best lead generation tools for freelancers",
    audience: "Freelancers, consultants, independent contractors, and small agencies comparing client acquisition tools",
    intent: "The searcher wants a practical tool shortlist for finding clients, not a generic B2B sales software list.",
    summary:
      "The best lead generation tool for a freelancer is the one that helps you find a relevant buyer signal, save the lead, write a specific first message, and follow up without building a separate sales stack.",
    leadIn:
      "Generic B2B tools can be too heavy when you only need a focused weekly client pipeline. Compare tools by what happens after the lead appears: can you qualify it, save it, draft a pitch, prepare outreach, and remember the follow-up? iCloseLeads is built around that freelancer workflow.",
    steps: [
      "Decide whether you need remote job signals, local business leads, decision-maker checks, or all three.",
      "Check whether the tool helps you qualify leads before exporting them.",
      "Look for proposal or cold-email support tied to the actual lead context.",
      "Avoid tools that only sell volume without a clear outreach workflow.",
      "Choose the tool that gets you from search to first reviewed pitch fastest.",
    ],
    proofPoints: [
      "Live Google SERPs show a dedicated competitor listicle for this exact query, confirming list-comparison intent.",
      "The current SERP also surfaces broad tools like Apollo and Instantly, leaving room for a freelancer-first workflow angle.",
      "GA4 shows iCloseLeads resource and local lead pages already earning views, so expanding the resource hub supports visible user paths.",
    ],
    pitch:
      "If you are comparing lead tools, test one real workflow: find five leads, save the best two, draft one proposal, and schedule one follow-up. A tool that cannot complete that loop may not fit freelance acquisition.",
    internalLinks: [
      { label: "Freelance client acquisition", href: "/resources/freelance-client-acquisition" },
      { label: "Lead discovery software", href: "/features/lead-discovery" },
      { label: "Cold outreach CRM", href: "/resources/cold-outreach-crm-for-freelancers" },
    ],
    faqs: [
      {
        q: "What should freelancers look for in lead generation software?",
        a: "Look for relevant lead sources, qualification filters, saved lead notes, proposal support, outreach preparation, and follow-up tracking.",
      },
      {
        q: "Do freelancers need the same tools as sales teams?",
        a: "Usually no. Freelancers often need a lighter workflow that moves from buyer signal to pitch quickly instead of a full enterprise sales stack.",
      },
    ],
  },
  {
    slug: "cold-outreach-crm-for-freelancers",
    title: "Cold outreach CRM for freelancers",
    metaTitle: "Cold Outreach CRM for Freelancers | Leads, Proposals, Gmail, and Follow-Up",
    metaDescription:
      "Use a cold outreach CRM for freelancers to find prospects, save context, draft better first messages, prepare Gmail outreach, and track follow-ups.",
    keyword: "cold outreach CRM for freelancers",
    audience: "Freelancers and service providers who contact prospects directly",
    intent: "The searcher wants a lightweight CRM that supports cold outreach without enterprise sales complexity.",
    summary:
      "A cold outreach CRM for freelancers should remember why each lead matters. The useful record is not just a name and email; it is the buyer signal, pitch angle, proposal draft, outreach status, and next follow-up.",
    leadIn:
      "Many CRM results are either generic templates or sales-team platforms. Freelancers need a smaller loop: find the lead, save the reason, write a specific first message, send from a familiar inbox, and follow up while the context is still visible. iCloseLeads connects those steps around client acquisition.",
    steps: [
      "Save the lead only after the buyer signal is clear.",
      "Track the source, problem, pitch angle, and current stage.",
      "Draft outreach from the saved context instead of starting from a blank CRM note.",
      "Prepare Gmail outreach after reviewing the message for accuracy.",
      "Use follow-up stages so good prospects do not disappear after the first email.",
    ],
    proofPoints: [
      "Live SERPs for this query surface Reddit CRM advice, Notion templates, and broad outreach platforms, showing practical demand but weak freelancer-specific ownership.",
      "iCloseLeads already includes saved leads, proposal generation, outreach preparation, sent email history, campaigns, and follow-up support.",
      "This topic maps to activation because the page can push searchers into saving leads and generating proposals, not just reading advice.",
    ],
    pitch:
      "Your CRM should help you remember the reason for the outreach. Before sending, check the lead signal, proposal angle, stage, and next follow-up so the message feels researched.",
    internalLinks: [
      { label: "Freelance cold outreach", href: "/resources/freelance-cold-outreach" },
      { label: "Email outreach feature", href: "/features/email-outreach" },
      { label: "CRM pipeline feature", href: "/features/crm-pipeline" },
    ],
    faqs: [
      {
        q: "What CRM fields matter for freelance outreach?",
        a: "Track the lead source, business problem, contact route, proposal angle, outreach status, follow-up date, and notes from each interaction.",
      },
      {
        q: "Can a freelancer use a spreadsheet instead of a CRM?",
        a: "A spreadsheet can work early, but it usually breaks when proposal drafts, sent emails, lead notes, and follow-up timing need to stay together.",
      },
    ],
  },
  {
    slug: "find-decision-maker-email-small-business",
    title: "How to find a decision maker email for a small business",
    metaTitle: "Find Decision Maker Email for Small Business | Safe Outreach Workflow",
    metaDescription:
      "Find small business decision maker paths using public profiles, business websites, phone routes, social links, registry clues, and careful verification before outreach.",
    keyword: "find decision maker email small business",
    audience: "Freelancers, agencies, and consultants pitching local businesses",
    intent: "The searcher wants a realistic way to reach the owner, manager, or right contact for a small business.",
    summary:
      "Small businesses do not always publish a direct owner email. A safer workflow is to verify the business, check public owner or manager signals, use the website or phone route when appropriate, and save proof before writing outreach.",
    leadIn:
      "Decision-maker research should improve relevance without crossing privacy or trust lines. Start with public business data, then look for official contact pages, owner mentions, social profiles, professional profiles, and local registry clues. iCloseLeads helps keep the proof and pitch context attached to the lead.",
    steps: [
      "Confirm the business website, map profile, category, and location first.",
      "Look for owner, founder, manager, director, or marketing contact mentions on official pages.",
      "Check public social and professional profiles only when they clearly match the business.",
      "Use the public phone or contact form when a direct email is not visible.",
      "Save proof links and avoid pretending you found private data.",
    ],
    proofPoints: [
      "Live SERPs are led by broad data vendors and decision-maker tools, but small business outreach often needs verification and public-route guidance.",
      "iCloseLeads already has a Decision Maker Finder workflow connected to local lead discovery.",
      "The page can convert local lead searchers into an account path that includes owner-path checks, saved notes, and proposal drafting.",
    ],
    pitch:
      "Hi, I am trying to reach the person who handles website or growth decisions for your business. I noticed one practical improvement and wanted to ask where the best place is to send a short note.",
    internalLinks: [
      { label: "Decision maker finder", href: "/resources/decision-maker-finder" },
      { label: "Local business leads", href: "/use-cases/local-business-leads" },
      { label: "Businesses without websites", href: "/resources/businesses-without-websites" },
    ],
    faqs: [
      {
        q: "Can I always find a small business owner's email?",
        a: "No. Many owners do not publish direct emails. Use verified public routes and avoid guessing private contact details.",
      },
      {
        q: "What is the safest first outreach route?",
        a: "Use the official website contact page, public business email, phone route, or clearly matched professional profile when available.",
      },
    ],
  },
  {
    slug: "freelance-client-acquisition-software",
    title: "Freelance client acquisition software",
    metaTitle: "Freelance Client Acquisition Software | Find Leads and Pitch Faster",
    metaDescription:
      "Compare what freelance client acquisition software should do: find buyer signals, qualify leads, generate proposals, prepare outreach, and track follow-ups.",
    keyword: "freelance client acquisition software",
    audience: "Freelancers and solo agencies building a repeatable client pipeline",
    intent: "The searcher wants software support for getting clients, not another motivational guide.",
    summary:
      "Freelance client acquisition software should turn scattered prospecting into one repeatable loop: find leads, qualify fit, draft the pitch, send or prepare outreach, and track the next action.",
    leadIn:
      "The SERP for client acquisition is heavy with videos and broad advice. That leaves a clear gap for a software-led workflow page that shows what to do inside the product. iCloseLeads gives freelancers a practical path from search to saved lead to proposal to follow-up.",
    steps: [
      "Pick one service offer and one audience segment.",
      "Run a focused lead search instead of browsing every possible source.",
      "Save only leads with clear fit, timing, and contactability.",
      "Generate a proposal from the lead context, then edit it before sending.",
      "Review the pipeline weekly so follow-up becomes a habit.",
    ],
    proofPoints: [
      "Live Google results for this query skew toward YouTube advice, which creates space for an actionable product resource.",
      "GA4 shows iCloseLeads homepage and resource titles already getting views, so a software-intent page supports existing user behavior.",
      "This page has a direct funnel path into signup, lead search, proposal generation, and CRM stages.",
    ],
    pitch:
      "A useful acquisition workflow should answer one question every week: which specific prospects are worth pitching, and what is the next action for each one?",
    internalLinks: [
      { label: "Freelance client acquisition", href: "/resources/freelance-client-acquisition" },
      { label: "Best lead generation tools", href: "/resources/best-lead-generation-tools-for-freelancers" },
      { label: "Lead discovery feature", href: "/features/lead-discovery" },
    ],
    faqs: [
      {
        q: "What does client acquisition software do for freelancers?",
        a: "It helps freelancers find prospects, qualify fit, prepare outreach, generate proposals, and track follow-up from one workflow.",
      },
      {
        q: "Is client acquisition only cold outreach?",
        a: "No. It can include remote job leads, local business leads, referrals, content leads, direct outreach, proposal follow-up, and pipeline management.",
      },
    ],
  },
  {
    slug: "lead-generation-for-independent-contractors",
    title: "Lead generation for independent contractors",
    metaTitle: "Lead Generation for Independent Contractors | Find Better Client Signals",
    metaDescription:
      "Independent contractors can use iCloseLeads to find remote jobs, local business leads, decision-maker paths, proposals, and follow-up workflows.",
    keyword: "lead generation for independent contractors",
    audience: "Independent contractors, freelancers, consultants, and solo service providers",
    intent: "The searcher wants client opportunities without relying entirely on referrals or marketplaces.",
    summary:
      "Independent contractors need lead generation that fits a small operator: focused searches, visible buyer signals, simple qualification, personal proposals, and follow-up they can actually maintain.",
    leadIn:
      "A contractor does not need a bloated sales department. The useful system is smaller and sharper: choose the service, find active demand, save the prospects that fit, write a specific pitch, and keep track of what happens next. iCloseLeads is built around that working rhythm.",
    steps: [
      "Choose one service or package to sell this week.",
      "Search remote, live, or local leads based on where the buyer signal is strongest.",
      "Score leads by fit, timing, problem clarity, and contact path.",
      "Turn the best lead into a short proposal or outreach draft.",
      "Track follow-up so a promising lead does not vanish after one message.",
    ],
    proofPoints: [
      "The cluster broadens iCloseLeads beyond freelancers while staying truthful to the product audience.",
      "It connects directly to the lead discovery, proposal, email outreach, and CRM features already visible on the site.",
      "The page strengthens brand + concept co-occurrence around iCloseLeads and independent contractor lead generation.",
    ],
    pitch:
      "Hi, I help with [service] and noticed a specific opportunity around [business problem]. If useful, I can send a short first-step plan you can review without a long call.",
    internalLinks: [
      { label: "Lead generation tools for freelancers", href: "/resources/best-lead-generation-tools-for-freelancers" },
      { label: "Remote job leads", href: "/resources/remote-job-leads" },
      { label: "AI proposal generator", href: "/features/ai-proposals" },
    ],
    faqs: [
      {
        q: "How can independent contractors generate leads?",
        a: "Start with a narrow offer, search for public buyer signals, qualify the best prospects, write context-aware outreach, and follow up consistently.",
      },
      {
        q: "What lead sources work for contractors?",
        a: "Remote job posts, local business profiles, hiring signals, referrals, content inquiries, and public decision-maker routes can all work when the offer is specific.",
      },
    ],
  },
  {
    slug: "ai-consulting-clients",
    title: "How AI consultants can find better client leads",
    metaTitle: "AI Consulting Clients: Find Companies With Real Automation Problems",
    metaDescription:
      "Find AI consulting clients by targeting workflow automation, customer support, data, operations, and marketing problems with visible buyer intent.",
    keyword: "ai consulting clients",
    audience: "AI consultants, automation freelancers, and technical service providers",
    intent: "The searcher wants companies that may pay for practical AI or automation help.",
    summary:
      "AI consulting clients rarely buy vague AI. They buy faster support, cleaner operations, better data workflows, sales automation, reporting, or reduced manual work.",
    leadIn:
      "Use iCloseLeads to search for posts and business signals where a company describes a workflow problem. Then pitch the outcome, not the technology label.",
    steps: [
      "Search for automation, support, reporting, operations, CRM, data, chatbot, or workflow roles.",
      "Prioritize companies that name a bottleneck or tool stack.",
      "Avoid pitching AI where a simpler process fix would be more honest.",
      "Offer a small discovery sprint or proof of concept.",
      "Save evidence and next steps in the lead notes.",
    ],
    proofPoints: [
      "GSC is already surfacing ai consulting clients as an early long-tail opportunity for the site.",
      "The query only makes sense when the pitch stays tied to practical automation and workflow outcomes.",
      "This cluster can attract higher-value freelancers while staying consistent with iCloseLeads' signal-first positioning.",
    ],
    pitch:
      "Hi, I noticed you are dealing with [workflow/problem]. I help teams turn repetitive work into a practical automation plan, starting with one small process that can be tested quickly.",
    internalLinks: [
      { label: "Find remote leads", href: "/use-cases/remote-job-leads" },
      { label: "Client acquisition software", href: "/resources/freelance-client-acquisition-software" },
      { label: "Freelance lead discovery", href: "/features/lead-discovery" },
      { label: "Track pipeline", href: "/features/crm-pipeline" },
    ],
    faqs: [
      {
        q: "Who buys AI consulting?",
        a: "Companies with specific workflow, customer support, data, operations, or marketing problems are better prospects than companies only interested in the word AI.",
      },
      {
        q: "What should an AI consultant pitch first?",
        a: "Pitch a narrow proof of concept tied to a business outcome, not a broad transformation project.",
      },
    ],
  },
  {
    slug: "decision-maker-finder",
    title: "Decision maker finder workflow for small business outreach",
    metaTitle: "Decision Maker Finder: Verify Owner and Manager Paths Before Outreach",
    metaDescription:
      "Use public business profiles, owner-path searches, social profiles, phone routes, and registry guidance to verify local business decision makers.",
    keyword: "decision maker finder",
    audience: "Freelancers and agencies pitching local businesses",
    intent: "The searcher wants to find the right person or route for outreach.",
    summary:
      "For small businesses, the public phone number or business profile may be the best contact path. The goal is to verify the owner or manager route without pretending every business publishes a direct email.",
    leadIn:
      "Use the decision-maker workflow after a local lead looks worth pitching. Start with the business profile, then check owner mentions, professional profiles, social links, phone/email routes, and registry references where appropriate.",
    steps: [
      "Start from a verified business profile or website.",
      "Search owner, founder, manager, director, and contact mentions.",
      "Check LinkedIn, Facebook, Instagram, and public profile results.",
      "Use public phone routes when direct owner details are not available.",
      "Save proof links so the outreach remains grounded.",
    ],
    proofPoints: [
      "Decision Maker Finder is an iCloseLeads differentiator for local business workflows.",
      "The page clarifies realistic public-data limits, reducing trust risk.",
      "It supports higher-quality outreach after local lead discovery.",
    ],
    pitch:
      "Hi, I am trying to reach the person who handles growth, website, or marketing decisions for your business. I found one practical improvement that may help local customers contact you faster.",
    internalLinks: [
      { label: "Lead discovery", href: "/features/lead-discovery" },
      { label: "Local business leads", href: "/use-cases/local-business-leads" },
      { label: "Decision maker email workflow", href: "/resources/find-decision-maker-email-small-business" },
      { label: "Freelance cold outreach", href: "/resources/freelance-cold-outreach" },
    ],
    faqs: [
      {
        q: "Can every business owner be found online?",
        a: "No. Some owners keep details private. A good workflow gives you a verified contact route, not a fake promise of direct owner data.",
      },
      {
        q: "Is the public business phone useful?",
        a: "Yes. For many small businesses, the public phone number is the realistic path to ask who handles website, marketing, or growth decisions.",
      },
    ],
  },
  {
    slug: "freelance-proposal-subject-lines",
    title: "Freelance proposal subject lines that do not look mass-sent",
    metaTitle: "Freelance Proposal Subject Lines | Better Openers for Outreach and Pitches",
    metaDescription:
      "Write freelance proposal subject lines that reflect the lead context, the business problem, and the next step instead of generic outreach phrasing.",
    keyword: "freelance proposal subject lines",
    audience: "Freelancers writing proposals, cold emails, and first-touch outreach",
    intent: "The searcher wants subject-line frameworks that help a proposal get opened without hurting trust.",
    summary:
      "A subject line should preview why the email matters to this buyer. Generic lines like quick question or following up waste your strongest signal. Use the lead context, service angle, or deliverable instead.",
    leadIn:
      "The subject line is not separate from the proposal. It should borrow the same reason for outreach: the job post, website gap, launch pressure, booking issue, or visible workflow problem. iCloseLeads can generate a first draft, but the best version still reflects the actual lead.",
    steps: [
      "Start with the buyer signal instead of your name or company name.",
      "Use a deliverable, problem, or timing cue that already appears in the lead context.",
      "Avoid fake urgency, gimmicks, and vague curiosity lines.",
      "Keep the subject calm enough to fit a real business email.",
      "Match the subject line to the first sentence so the open feels coherent.",
    ],
    proofPoints: [
      "Public SERPs around subject lines skew toward broad sales advice, leaving room for a freelancer-specific page connected to real lead context.",
      "iCloseLeads already supports subject-line generation inside the proposal and outreach workflow.",
      "This page creates a direct bridge from informational search intent into AI proposals, email outreach, and free tools.",
    ],
    pitch:
      "A better subject line usually sounds like the first line of a useful conversation: specific to the lead, honest about the offer, and calm enough to earn the open.",
    internalLinks: [
      { label: "Freelance cold outreach", href: "/resources/freelance-cold-outreach" },
      { label: "AI proposal generator", href: "/features/ai-proposals" },
      { label: "Email outreach feature", href: "/features/email-outreach" },
    ],
    faqs: [
      {
        q: "Should I use follow-up as the first subject line?",
        a: "Usually no. A first-touch email should earn the open with a real reason, not pretend there was already a conversation.",
      },
      {
        q: "What makes a proposal subject line feel human?",
        a: "Specific context, plain language, and a direct connection to the buyer's problem make the email feel human instead of mass-sent.",
      },
    ],
  },
  {
    slug: "ai-proposal-generator-for-freelancers",
    title: "AI proposal generator for freelancers",
    metaTitle: "AI Proposal Generator for Freelancers | Turn Leads Into Better Pitches",
    metaDescription:
      "Use an AI proposal generator to turn job posts, local business leads, and saved prospects into specific first drafts you can edit before sending.",
    keyword: "AI proposal generator for freelancers",
    audience: "Freelancers who need faster but still personal proposals",
    intent: "The searcher wants help writing proposals without sounding generic.",
    summary:
      "A useful AI proposal generator should read the lead context, keep the message short, avoid fake claims, and leave room for the freelancer to add proof.",
    leadIn:
      "The best proposal is not the longest one. It names the buyer’s problem, shows relevant judgment, and offers one next step. iCloseLeads drafts from the lead signal so the message starts closer to useful.",
    steps: [
      "Open the lead and confirm the actual need.",
      "Generate a draft from the job or business context.",
      "Replace generic proof with your own relevant example.",
      "Shorten the ask to one clear next step.",
      "Prepare in Gmail or copy only after reviewing every line.",
    ],
    proofPoints: [
      "AI proposals are a core iCloseLeads feature.",
      "The workflow supports safe review-first outreach rather than risky auto-send.",
      "Proposal content can be tied directly to remote, local, and live lead signals.",
    ],
    pitch:
      "I saw your need around [specific issue]. I can help with a focused first step: [outcome]. If useful, I can send a short plan showing what I would change first.",
    internalLinks: [
      { label: "Web design proposal template", href: "/resources/web-design-proposal-template" },
      { label: "Remote job proposal template", href: "/resources/remote-job-proposal-template" },
      { label: "Freelance proposal subject lines", href: "/resources/freelance-proposal-subject-lines" },
    ],
    faqs: [
      {
        q: "Should freelancers use AI to write proposals?",
        a: "Yes, if the freelancer reviews and edits the draft. AI should speed up structure, not replace judgment or proof.",
      },
      {
        q: "What makes an AI proposal sound human?",
        a: "Specific context, a real observation, plain language, and one next step make the message feel written for that buyer.",
      },
    ],
  },
  {
    slug: "freelance-client-acquisition",
    title: "Freelance client acquisition without bidding wars",
    metaTitle: "Freelance Client Acquisition: Find Leads, Pitch Better, and Follow Up",
    metaDescription:
      "Build a freelance client acquisition workflow around lead discovery, signal-led outreach, AI proposals, saved leads, and follow-up tracking.",
    keyword: "freelance client acquisition",
    audience: "Freelancers who want direct clients instead of relying only on marketplaces",
    intent: "The searcher wants a system for finding and converting freelance clients.",
    summary:
      "Client acquisition gets easier when discovery, qualification, proposal writing, and follow-up are one workflow instead of separate habits.",
    leadIn:
      "A repeatable freelance acquisition system starts with a narrow offer, one lead source at a time, clear qualification rules, and consistent follow-up. iCloseLeads gives that system a single workspace.",
    steps: [
      "Choose one offer and one audience.",
      "Search remote, local, or live leads based on that offer.",
      "Save only prospects with a visible business reason.",
      "Use AI to draft but not blindly send.",
      "Review pipeline weekly so follow-up does not disappear.",
    ],
    proofPoints: [
      "GSC shows impressions for freelance client acquisition.",
      "The topic maps directly to signup and activation intent.",
      "iCloseLeads connects the full workflow from search to CRM.",
    ],
    pitch:
      "Hi, I noticed a specific opportunity where my work could help with [business outcome]. I can share a quick first-step plan if you are open to it.",
    internalLinks: [
      { label: "Best lead generation tools", href: "/resources/best-lead-generation-tools-for-freelancers" },
      { label: "Freelance proposal subject lines", href: "/resources/freelance-proposal-subject-lines" },
      { label: "Client acquisition software", href: "/resources/freelance-client-acquisition-software" },
      { label: "Proposal follow-up email", href: "/resources/proposal-follow-up-email" },
      { label: "CRM pipeline", href: "/features/crm-pipeline" },
    ],
    faqs: [
      {
        q: "What is freelance client acquisition?",
        a: "It is the repeatable process of finding, qualifying, pitching, and following up with potential freelance clients.",
      },
      {
        q: "What should I improve first?",
        a: "Improve lead quality first. Better leads make proposals, follow-ups, and conversion easier.",
      },
    ],
  },
  {
    slug: "proposal-follow-up-email",
    title: "Proposal follow-up email that adds value instead of pressure",
    metaTitle: "Proposal Follow-Up Email for Freelancers | Stay Top of Mind Without Sounding Pushy",
    metaDescription:
      "Write a proposal follow-up email that stays tied to the original lead, adds one useful detail, and keeps freelance deals moving without awkward pressure.",
    keyword: "proposal follow up email",
    audience: "Freelancers and agencies following up on proposals, quotes, and first-touch outreach",
    intent: "The searcher wants a follow-up structure that increases replies without sounding robotic or desperate.",
    summary:
      "A proposal follow-up email works best when it adds context, not guilt. Remind the buyer why you reached out, include one useful detail, and make the next step easier than ignoring the message.",
    leadIn:
      "Most follow-ups fail because they forget the original signal. If the lead came from a job post, local business gap, or website issue, bring that back into the follow-up. iCloseLeads keeps the lead context, proposal draft, and follow-up path together so the second message does not feel disconnected.",
    steps: [
      "Wait long enough for the first message to be seen, but not so long that the context goes cold.",
      "Reference the original problem or deliverable in one sentence.",
      "Add one useful detail such as a clearer scope, a timeline note, or a practical suggestion.",
      "Ask for one low-friction next step instead of a broad decision.",
      "Track the follow-up date so the sequence stays intentional.",
    ],
    proofPoints: [
      "Public follow-up-email SERPs are crowded with generic etiquette posts, which leaves room for a freelancer page grounded in real lead and proposal context.",
      "iCloseLeads already supports Gmail-ready drafts, outreach history, and follow-up tracking.",
      "This topic supports activation because users who need follow-up help usually also need saved leads, email history, and proposal context in one place.",
    ],
    pitch:
      "Hi, following up on the proposal I sent over about [specific issue]. I added one practical idea below that may make the first step easier to evaluate if the timing is still right.",
    internalLinks: [
      { label: "Freelance cold outreach", href: "/resources/freelance-cold-outreach" },
      { label: "Email outreach feature", href: "/features/email-outreach" },
      { label: "CRM pipeline", href: "/features/crm-pipeline" },
    ],
    faqs: [
      {
        q: "What should a proposal follow-up email include?",
        a: "Include the original context, one new useful detail, and a simple next step. That keeps the follow-up helpful instead of repetitive.",
      },
      {
        q: "How many times should I follow up?",
        a: "That depends on the lead and timing, but each follow-up should add context or value rather than repeat the same ask.",
      },
    ],
  },
  {
    slug: "live-job-leads",
    title: "Live job leads and urgent project signals",
    metaTitle: "Live Job Leads: Spot Urgent Freelance Opportunities Faster",
    metaDescription:
      "Use live job leads to find urgent project signals, hiring demand, budget clues, and contact-ready opportunities before they go stale.",
    keyword: "live job leads",
    audience: "Freelancers who sell services into active demand",
    intent: "The searcher wants fresh opportunities they can act on quickly.",
    summary:
      "Live job leads are useful because timing is part of the opportunity. When a company is actively asking for help, a relevant pitch can beat a polished message sent too late.",
    leadIn:
      "Use live lead feeds for fast-moving searches where urgency matters: launches, repairs, overflow work, campaign support, or immediate hiring. Then save the strongest opportunities before drafting.",
    steps: [
      "Search one service niche at a time.",
      "Prioritize urgent, recent, budget-mentioned, or contact-ready signals.",
      "Avoid leads that are fresh but irrelevant.",
      "Use a short pitch that references the timing cue.",
      "Follow up quickly while the need is still active.",
    ],
    proofPoints: [
      "Live jobs are one of iCloseLeads' core lead engines.",
      "The workflow creates a natural path from discovery to proposal.",
      "Freshness can be a competitive advantage for freelancers.",
    ],
    pitch:
      "Hi, I saw your recent need for [service]. Since this looks time-sensitive, I can help with a focused first step and send a quick plan today.",
    internalLinks: [
      { label: "Live job use case", href: "/use-cases/live-job-leads" },
      { label: "Remote job proposal template", href: "/resources/remote-job-proposal-template" },
      { label: "Lead generation tools", href: "/resources/best-lead-generation-tools-for-freelancers" },
      { label: "AI proposals", href: "/features/ai-proposals" },
    ],
    faqs: [
      {
        q: "What are live job leads?",
        a: "Live job leads are recent hiring or project signals that can be acted on before they become stale or crowded.",
      },
      {
        q: "Should I pitch every live lead?",
        a: "No. Pitch only the leads that match your niche, have enough context, and show a clear business need.",
      },
    ],
  },
  {
    slug: "website-design-prospecting",
    title: "Website design prospecting workflow",
    metaTitle: "Website Design Prospecting: Find, Qualify, and Pitch Better Leads",
    metaDescription:
      "A practical website design prospecting workflow for finding local businesses, qualifying website gaps, saving notes, and pitching outcomes.",
    keyword: "website design prospecting",
    audience: "Designers, developers, and agencies building a local client list",
    intent: "The searcher wants a prospecting process, not just a list of websites.",
    summary:
      "Website design prospecting should move from research to qualification to pitch. If you cannot explain why a business needs your help, it is not ready for outreach.",
    leadIn:
      "Use category, city, website status, contact route, and business model to decide whether a lead deserves attention. Then write the pitch around the improvement, not the design trend.",
    steps: [
      "Choose a market and category.",
      "Find businesses with no website, outdated website, or weak conversion path.",
      "Check mobile experience and local profile details.",
      "Save the lead with notes about the business outcome.",
      "Send a concise pitch with one useful next step.",
    ],
    proofPoints: [
      "GSC shows website design prospect impressions.",
      "This supports the web design leads cluster without duplicating its angle.",
      "The workflow naturally moves users into local leads, proposals, and CRM.",
    ],
    pitch:
      "Hi, I found your business while researching local website opportunities. I noticed one practical change that could make it easier for customers to understand your services and contact you.",
    internalLinks: [
      { label: "Web design leads", href: "/resources/web-design-leads" },
      { label: "Cold outreach CRM", href: "/resources/cold-outreach-crm-for-freelancers" },
      { label: "Web design proposal template", href: "/resources/web-design-proposal-template" },
      { label: "Lead calculator", href: "/tools/lead-calculator" },
    ],
    faqs: [
      {
        q: "What is website design prospecting?",
        a: "It is the process of finding businesses that may need website help, qualifying the business reason, and contacting them with a relevant pitch.",
      },
      {
        q: "What should I track?",
        a: "Track category, location, website status, phone route, owner path, pitch angle, and follow-up status.",
      },
    ],
  },
];

export function getResourcePage(slug: string) {
  return RESOURCE_PAGES.find((page) => page.slug === slug);
}
