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
    metaTitle: "Web Design Leads: Find Businesses Without Websites and Pitch Better",
    metaDescription:
      "Find web design leads from businesses without websites, outdated sites, local search gaps, owner-path signals, and contact-ready context, then turn them into a focused pitch.",
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
      "GSC is already showing impressions for web design leads and leads for web design.",
      "Live US SERPs show tools and guides winning with businesses-without-websites positioning and practical prospecting language.",
      "iCloseLeads has the local business lead and owner-path workflow to support this search intent.",
    ],
    pitch:
      "Hi, I found your business while checking local search results and noticed your website presence could be doing more to turn nearby searches into calls. I have a short idea for improving the site and quote flow if you are open to seeing it.",
    internalLinks: [
      { label: "Find local business leads", href: "/use-cases/local-business-leads" },
      { label: "Lead discovery features", href: "/features/lead-discovery" },
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
    slug: "businesses-without-websites",
    title: "How to find businesses without websites",
    metaTitle: "Businesses Without Websites: How Freelancers Find Better Web Design Leads",
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
      "Google SERPs show strong search interest around no-website local lead workflows and tools.",
      "This query has clear purchase intent for web designers and local SEO consultants.",
      "iCloseLeads can turn the discovery step into a saved lead, proposal draft, and CRM workflow.",
    ],
    pitch:
      "Hi, I noticed your business is visible locally but does not seem to have a dedicated website attached to the listing. A simple site could help people check services, trust you faster, and call with less friction.",
    internalLinks: [
      { label: "Local business leads use case", href: "/use-cases/local-business-leads" },
      { label: "Find owner paths", href: "/features/lead-discovery" },
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
    metaTitle: "Freelance Cold Outreach: Find Leads, Draft Gmail Outreach, and Follow Up",
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
      "GSC shows early impressions for freelance cold outreach.",
      "Live US SERPs reward practical templates, examples, and workflows over vague advice.",
      "GA4 shows form starts and page engagement on outreach-related pages even though key events are still at zero.",
      "iCloseLeads connects discovery, proposal writing, Gmail preparation, and CRM tracking.",
    ],
    pitch:
      "Hi, I found your post/profile while researching companies that may need help with [specific issue]. I noticed [signal]. I can help with a small first step that would make this easier to solve.",
    internalLinks: [
      { label: "Cold outreach use case", href: "/use-cases/freelance-cold-outreach" },
      { label: "Email outreach feature", href: "/features/email-outreach" },
      { label: "AI proposals", href: "/features/ai-proposals" },
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
      "Find local business leads for web designers by niche, city, website status, phone visibility, owner path, and pitch-ready business context that is easier to turn into outreach.",
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
      "iCloseLeads already appears in Google for this long-tail query and related web-design lead terms.",
      "The SERP includes direct competitors and lead scraping tools, showing commercial intent.",
      "The platform can differentiate by combining discovery with pitch and CRM workflow.",
    ],
    pitch:
      "Hi, I help local businesses turn search visibility into more calls. I found your listing and noticed a website improvement that could make it easier for customers to choose you.",
    internalLinks: [
      { label: "Local leads dashboard", href: "/use-cases/local-business-leads" },
      { label: "Decision maker workflow", href: "/features/lead-discovery" },
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
      "GSC shows impressions for exclusive web design leads.",
      "Live SERPs and competitor pages sell lists, but users still need verification and workflow.",
      "iCloseLeads can position exclusivity as better timing plus better qualification.",
    ],
    pitch:
      "Hi, I noticed a specific website opportunity while checking your local search presence. I am not sending a generic design pitch; I have one practical improvement in mind for your business.",
    internalLinks: [
      { label: "Web design lead workflow", href: "/resources/web-design-leads" },
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
      "Outdated-site filters are already part of the local business lead workflow.",
      "This cluster supports web design leads without duplicating the main page.",
      "The pitch naturally leads to AI proposal and web design preview workflows.",
    ],
    pitch:
      "Hi, I checked your website from a mobile customer’s point of view and saw a few places where people may drop off before calling. I can show you a simple refresh plan focused on more enquiries.",
    internalLinks: [
      { label: "Local business lead filters", href: "/use-cases/local-business-leads" },
      { label: "Create pitch drafts", href: "/features/ai-proposals" },
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
      { label: "Lead discovery", href: "/features/lead-discovery" },
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
      "GSC shows early impressions for ai consulting clients.",
      "Live SERPs emphasize practical outcomes, proof of concepts, and workflow automation.",
      "This cluster can attract high-value freelancers while staying product-relevant.",
    ],
    pitch:
      "Hi, I noticed you are dealing with [workflow/problem]. I help teams turn repetitive work into a practical automation plan, starting with one small process that can be tested quickly.",
    internalLinks: [
      { label: "Find remote leads", href: "/use-cases/remote-job-leads" },
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
      { label: "AI proposal feature", href: "/features/ai-proposals" },
      { label: "Email outreach", href: "/features/email-outreach" },
      { label: "Find leads first", href: "/features/lead-discovery" },
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
      { label: "Lead discovery", href: "/features/lead-discovery" },
      { label: "Use cases", href: "/use-cases" },
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
      { label: "Remote leads", href: "/resources/remote-job-leads" },
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
      { label: "Local business leads", href: "/use-cases/local-business-leads" },
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
