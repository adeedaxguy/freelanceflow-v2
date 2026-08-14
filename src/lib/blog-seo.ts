import type { BlogPost } from "@/types";

export interface BlogArticleSource {
  slug: string;
  title: string;
  excerpt?: string | null;
  content: string;
  category?: string | null;
  readTime?: number | null;
  author?: string | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  tags?: string[];
  focusKeyword?: string | null;
  articleVisuals?: BlogArticleVisual[];
  conversionFunnel?: BlogConversionFunnel | null;
}

export interface BlogLinkItem {
  href: string;
  label: string;
  description: string;
  external?: boolean;
}

export interface BlogHeading {
  id: string;
  text: string;
  level: 2 | 3;
}

export interface BlogArticleVisual {
  src: string;
  alt: string;
  title?: string;
  caption?: string;
}

export interface BlogConversionFunnelStep {
  title: string;
  detail: string;
}

export interface BlogConversionFunnel {
  eyebrow: string;
  title: string;
  summary: string;
  ctaLabel: string;
  ctaHref: string;
  steps: BlogConversionFunnelStep[];
  proofNote?: string;
}

type ArticleTopic =
  | "webdesign"
  | "local"
  | "decision"
  | "remote"
  | "live"
  | "outreach"
  | "proposal"
  | "crm"
  | "pricing"
  | "seo"
  | "generic";

const TOPIC_MATCHERS: Array<{ topic: ArticleTopic; terms: string[] }> = [
  {
    topic: "webdesign",
    terms: [
      "web design leads",
      "exclusive web design leads",
      "find web design clients",
      "web design agency",
      "website redesign leads",
      "website design prospect",
      "web designers",
    ],
  },
  {
    topic: "decision",
    terms: ["decision maker", "owner name", "business owner", "manager contact", "owner email", "owner phone"],
  },
  {
    topic: "local",
    terms: ["local business", "google maps", "google business", "near me", "no website", "outdated website", "local seo"],
  },
  {
    topic: "remote",
    terms: ["remote job", "remote freelance", "remote contract", "job leads", "contract work"],
  },
  {
    topic: "live",
    terms: ["live job", "urgent", "freshest", "public request", "hiring demand"],
  },
  {
    topic: "outreach",
    terms: ["cold email", "gmail", "outreach", "follow up", "follow-up", "email sequence"],
  },
  {
    topic: "proposal",
    terms: ["proposal", "ai proposal", "pitch", "subject line", "template"],
  },
  {
    topic: "crm",
    terms: ["pipeline", "crm", "saved leads", "follow-up system", "lead scoring"],
  },
  {
    topic: "pricing",
    terms: ["pricing", "rate", "income", "profitable", "niche", "calculator"],
  },
  {
    topic: "seo",
    terms: ["seo", "search engine", "rank", "keyword", "content", "geo", "generative engine"],
  },
];

const INTERNAL_LINKS: Record<ArticleTopic, BlogLinkItem[]> = {
  webdesign: [
    {
      href: "/for/web-designers",
      label: "Web design leads landing page",
      description: "See the freelancer-focused page built around local website-gap prospecting for web designers.",
    },
    {
      href: "/blog/local-business-leads-for-web-designers",
      label: "Local business leads for web designers",
      description: "Find businesses with no website, outdated pages, and clearer redesign triggers.",
    },
    {
      href: "/blog/find-web-design-clients-near-me",
      label: "Find web design clients near you",
      description: "Use city and niche prospecting to turn local search demand into better-fit design leads.",
    },
    {
      href: "/use-cases/local-business-leads",
      label: "Local business lead workflow",
      description: "Move from business profile to website gap, contact path, notes, and next action.",
    },
  ],
  local: [
    {
      href: "/use-cases/local-business-leads",
      label: "Local business lead workflow",
      description: "See how iCloseLeads finds nearby businesses with visible website, SEO, and contact gaps.",
    },
    {
      href: "/blog/local-business-leads-for-web-designers",
      label: "Local business leads for web designers",
      description: "Turn city and niche searches into a sharper prospecting list.",
    },
    {
      href: "/blog/local-business-lead-verification-checklist",
      label: "Local lead verification checklist",
      description: "Check profile, website, phone, and outreach angle before pitching.",
    },
  ],
  decision: [
    {
      href: "/features/lead-discovery",
      label: "Lead Discovery with Decision Maker Finder",
      description: "Move from a company profile to owner, manager, proof, and contact-path checks.",
    },
    {
      href: "/blog/how-to-find-business-owner-name",
      label: "How to find a business owner name",
      description: "A practical public-data workflow for owner and manager research.",
    },
    {
      href: "/blog/find-owner-email-phone-local-business",
      label: "Find owner email and phone signals",
      description: "Verify public contact routes before sending a local business pitch.",
    },
  ],
  remote: [
    {
      href: "/use-cases/remote-job-leads",
      label: "Remote job leads for freelancers",
      description: "Find fresh remote opportunities and pitch while the demand is still active.",
    },
    {
      href: "/blog/remote-job-leads-for-freelancers",
      label: "Remote job lead strategy",
      description: "Build a weekly search routine for niche-matched remote work.",
    },
    {
      href: "/blog/remote-job-leads-vs-local-business-leads",
      label: "Remote jobs vs local leads",
      description: "Choose the right prospecting path for your offer and sales style.",
    },
  ],
  live: [
    {
      href: "/use-cases/live-job-leads",
      label: "Live job lead signals",
      description: "Understand how urgent public requests become pitchable opportunities.",
    },
    {
      href: "/blog/live-job-leads-for-freelancers",
      label: "Live jobs for freelancers",
      description: "Use timing, urgency, and contact signals without chasing weak posts.",
    },
    {
      href: "/blog/freelance-job-alerts-by-niche",
      label: "Freelance job alerts by niche",
      description: "Keep searches focused so each alert matches what you actually sell.",
    },
  ],
  outreach: [
    {
      href: "/features/email-outreach",
      label: "Gmail-ready outreach",
      description: "Prepare safe, editable outreach from your lead context.",
    },
    {
      href: "/blog/gmail-ready-outreach-for-freelancers",
      label: "Gmail-ready outreach guide",
      description: "Use prepared drafts without handing full control to an automation tool.",
    },
    {
      href: "/blog/cold-email-leads-for-freelancers",
      label: "Cold email leads for freelancers",
      description: "Prioritize prospects where the first email has a real reason to exist.",
    },
  ],
  proposal: [
    {
      href: "/features/ai-proposals",
      label: "AI proposal generator",
      description: "Draft proposals from lead context, then edit them into your own voice.",
    },
    {
      href: "/blog/ai-proposal-generator-for-freelancers",
      label: "AI proposal generator for freelancers",
      description: "Write faster without sounding automated or generic.",
    },
    {
      href: "/blog/freelance-proposal-examples",
      label: "Freelance proposal examples",
      description: "Use examples to improve structure, proof, and call-to-action.",
    },
  ],
  crm: [
    {
      href: "/features/crm-pipeline",
      label: "Freelance CRM pipeline",
      description: "Save leads, add notes, track follow-ups, and keep outreach visible.",
    },
    {
      href: "/blog/freelance-sales-pipeline",
      label: "Freelance sales pipeline",
      description: "Turn scattered opportunities into a repeatable client acquisition system.",
    },
    {
      href: "/blog/freelance-crm-for-saved-leads",
      label: "CRM for saved leads",
      description: "Keep local, remote, and live leads organized after discovery.",
    },
  ],
  pricing: [
    {
      href: "/tools/lead-calculator",
      label: "Lead value calculator",
      description: "Estimate how many qualified leads you need to hit a revenue target.",
    },
    {
      href: "/blog/freelance-niche-research",
      label: "Freelance niche research",
      description: "Choose niches by intent, urgency, budget, and repeatability.",
    },
    {
      href: "/blog/best-niches-for-freelancers-2025",
      label: "Best freelance niches",
      description: "Compare services by demand, pricing power, and sales friction.",
    },
  ],
  seo: [
    {
      href: "/blog/local-seo-leads-for-freelancers",
      label: "Local SEO leads for freelancers",
      description: "Find businesses where search visibility gaps create a clear pitch angle.",
    },
    {
      href: "/blog/generative-engine-optimization-for-freelancers",
      label: "Generative engine optimization",
      description: "Adapt freelance SEO work for AI-assisted discovery and answer engines.",
    },
    {
      href: "/blog/ai-search-optimization-for-small-business-websites",
      label: "AI search optimization for small businesses",
      description: "Position small business sites for classic search and AI discovery.",
    },
  ],
  generic: [
    {
      href: "/features/lead-discovery",
      label: "Freelance lead discovery",
      description: "Find remote, live, and local business opportunities from one workflow.",
    },
    {
      href: "/features/ai-proposals",
      label: "AI proposals",
      description: "Turn lead context into a proposal draft you can edit and send.",
    },
    {
      href: "/features/crm-pipeline",
      label: "CRM and pipeline",
      description: "Save prospects, track notes, and follow up without losing context.",
    },
  ],
};

const DEFAULT_INTERNAL_LINKS: BlogLinkItem[] = [
  {
    href: "/features/lead-discovery",
    label: "Lead Discovery",
    description: "Search buyer-intent signals across remote, live, and local lead workflows.",
  },
  {
    href: "/use-cases/local-business-leads",
    label: "Local business leads",
    description: "Find local companies worth pitching by service, city, and website signal.",
  },
  {
    href: "/use-cases/remote-job-leads",
    label: "Remote job leads",
    description: "Spot fresh opportunities before crowded marketplace replies take over.",
  },
  {
    href: "/auth?mode=signup",
    label: "Start free",
    description: "Try iCloseLeads while early access is open.",
  },
];

const STRATEGIC_INTERNAL_LINKS: Record<string, BlogLinkItem[]> = {
  "freelance-client-acquisition-system": [
    {
      href: "/blog/how-to-get-more-freelance-clients",
      label: "How to get more freelance clients",
      description: "Use this as the broader acquisition playbook before choosing a specific lead source.",
    },
    {
      href: "/blog/best-freelance-client-acquisition-software-2025",
      label: "Best freelance client acquisition software",
      description: "Compare tools by source quality, follow-up workflow, proposal support, and pipeline fit.",
    },
    {
      href: "/blog/get-freelance-clients-without-cold-calling",
      label: "Get freelance clients without cold calling",
      description: "Build a warmer acquisition path using search, proof, referrals, and targeted outreach.",
    },
    {
      href: "/blog/cold-email-templates-freelancers-2025",
      label: "Cold email templates for freelancers",
      description: "Turn the acquisition plan into first messages that reference a real reason to talk.",
    },
  ],
  "how-to-get-more-freelance-clients": [
    {
      href: "/blog/how-to-find-seo-clients-2025",
      label: "How to find SEO clients",
      description: "A niche-specific client-finding workflow for SEO consultants and agencies.",
    },
    {
      href: "/blog/how-to-find-wordpress-clients-2025",
      label: "How to find WordPress clients",
      description: "Target businesses with site, plugin, speed, security, or redesign signals.",
    },
    {
      href: "/blog/how-to-find-graphic-design-clients-2025",
      label: "How to find graphic design clients",
      description: "Use portfolio fit, brand signals, and local business gaps to find better prospects.",
    },
    {
      href: "/blog/virtual-assistant-find-clients-2025",
      label: "Find virtual assistant clients",
      description: "Adapt the same acquisition system for admin, ops, and support-service buyers.",
    },
  ],
  "best-freelance-client-acquisition-software-2025": [
    {
      href: "/blog/best-crm-for-freelancers-2025",
      label: "Best CRM for freelancers",
      description: "Compare the pipeline and follow-up side of client acquisition software.",
    },
    {
      href: "/blog/how-to-write-winning-freelance-proposals-2025",
      label: "Write winning freelance proposals",
      description: "Connect lead context to stronger proposal structure and clearer next steps.",
    },
    {
      href: "/blog/freelance-client-acquisition-system",
      label: "Freelance client acquisition system",
      description: "Use the full system page as the hub for finding, qualifying, pitching, and following up.",
    },
    {
      href: "/blog/how-to-get-more-freelance-clients",
      label: "More freelance clients playbook",
      description: "Start with the strategic acquisition workflow, then choose the right software layer.",
    },
  ],
  "freelance-niche-research": [
    {
      href: "/blog/data-science-freelancer-find-clients",
      label: "Data science freelancer clients",
      description: "Apply niche research to higher-value analytics, AI, and data consulting buyers.",
    },
    {
      href: "/blog/video-editor-find-clients-2025",
      label: "Video editor clients",
      description: "Use creator-economy demand signals to find better video editing prospects.",
    },
    {
      href: "/blog/email-marketing-freelancer-find-clients",
      label: "Email marketing freelancer clients",
      description: "Find retainer-style prospects where lifecycle, newsletter, or sales-email help is valuable.",
    },
    {
      href: "/blog/social-media-manager-find-clients-2025",
      label: "Social media manager clients",
      description: "Turn niche selection into a focused pipeline for social media management work.",
    },
  ],
  "find-local-businesses-without-website": [
    {
      href: "/blog/google-maps-prospecting-tool-for-agencies",
      label: "Google Maps prospecting tool for agencies",
      description: "Turn map listings into qualified local leads instead of broad scraped spreadsheets.",
    },
    {
      href: "/blog/local-business-leads-for-web-designers",
      label: "Local business leads for web designers",
      description: "Use no-website and weak-website signals to build a practical redesign lead list.",
    },
    {
      href: "/blog/how-to-find-wordpress-clients-2025",
      label: "WordPress client prospecting",
      description: "Match local business gaps with WordPress build, redesign, and maintenance offers.",
    },
    {
      href: "/blog/how-to-find-graphic-design-clients-2025",
      label: "Graphic design client prospecting",
      description: "Spot brand, menu, signage, and local profile gaps that can support a design pitch.",
    },
  ],
  "local-business-leads-for-web-designers": [
    {
      href: "/blog/google-maps-prospecting-tool-for-agencies",
      label: "Google Maps prospecting tool for agencies",
      description: "Use profile, website, phone, and activity signals before pitching local businesses.",
    },
    {
      href: "/resources/google-maps-listing-pitch-for-freelancers",
      label: "Google Maps listing pitch",
      description: "Move from a map listing signal into a short, proof-led outreach angle.",
    },
    {
      href: "/resources/how-to-find-businesses-without-websites-on-google-maps",
      label: "Find businesses without websites on Google Maps",
      description: "Verify no-website opportunities before treating them as web design leads.",
    },
  ],
  "google-maps-prospecting-tool-for-agencies": [
    {
      href: "/resources/google-maps-listing-pitch-for-freelancers",
      label: "Google Maps listing pitch",
      description: "Use the rising GSC resource to turn map signals into a respectful first pitch.",
    },
    {
      href: "/resources/google-maps-prospecting-tool-for-freelancers",
      label: "Google Maps prospecting for freelancers",
      description: "Compare the freelancer workflow with the agency local-lead workflow.",
    },
    {
      href: "/resources/how-to-find-businesses-without-websites-on-google-maps",
      label: "Businesses without websites on Google Maps",
      description: "Qualify missing-website signals before adding them to an agency lead list.",
    },
    {
      href: "/use-cases/local-business-leads",
      label: "Local business lead workflow",
      description: "Run profile, website, contact, and follow-up checks inside one lead workflow.",
    },
  ],
  "cold-email-leads-for-freelancers": [
    {
      href: "/blog/cold-email-templates-freelancers-2025",
      label: "Cold email templates for freelancers",
      description: "Use these examples after choosing a lead with a clear public reason to pitch.",
    },
    {
      href: "/blog/get-freelance-clients-without-cold-calling",
      label: "Clients without cold calling",
      description: "Compare cold email with warmer search, referral, and proof-led acquisition routes.",
    },
    {
      href: "/blog/freelance-follow-up-system",
      label: "Freelance follow-up system",
      description: "Keep the conversation alive after the first email without sounding automated.",
    },
  ],
  "ai-proposal-generator-for-freelancers": [
    {
      href: "/blog/how-to-write-winning-freelance-proposals-2025",
      label: "Write winning freelance proposals",
      description: "Use AI for structure, then improve the message with proof, fit, and a clear next step.",
    },
    {
      href: "/blog/why-clients-reject-freelance-proposals",
      label: "Why clients reject proposals",
      description: "Fix the trust, timing, proof, and relevance gaps that make buyers ignore proposals.",
    },
  ],
};

const OUTBOUND_LINKS: Record<ArticleTopic, BlogLinkItem[]> = {
  webdesign: [
    {
      href: "https://developers.google.com/search/docs/fundamentals/seo-starter-guide",
      label: "Google SEO Starter Guide",
      description: "Baseline search guidance for making service and support pages clearer to Google and users.",
      external: true,
    },
    {
      href: "https://support.google.com/business/answer/7091",
      label: "Google Business Profile help",
      description: "Useful context when evaluating local business profiles and website gaps for web design outreach.",
      external: true,
    },
  ],
  local: [
    {
      href: "https://support.google.com/business/answer/7091",
      label: "Google Business Profile ranking guidance",
      description: "Google's public guidance for local visibility factors and business profiles.",
      external: true,
    },
    {
      href: "https://developers.google.com/search/docs/fundamentals/seo-starter-guide",
      label: "Google SEO Starter Guide",
      description: "Baseline guidance on helping search engines and users understand pages.",
      external: true,
    },
  ],
  decision: [
    {
      href: "https://opencorporates.com/",
      label: "OpenCorporates",
      description: "A public company registry search point for official business records.",
      external: true,
    },
    {
      href: "https://support.google.com/business/answer/7091",
      label: "Google Business Profile help",
      description: "Useful context for checking public business profile details.",
      external: true,
    },
  ],
  remote: [
    {
      href: "https://trends.google.com/trends/",
      label: "Google Trends",
      description: "A public way to inspect search demand and seasonal interest.",
      external: true,
    },
    {
      href: "https://www.bls.gov/ooh/",
      label: "U.S. Occupational Outlook Handbook",
      description: "Labor-market context for roles, skills, and hiring demand.",
      external: true,
    },
  ],
  live: [
    {
      href: "https://trends.google.com/trends/",
      label: "Google Trends",
      description: "Track changing interest around niches, tools, and client demand.",
      external: true,
    },
    {
      href: "https://developers.google.com/search/docs/fundamentals/seo-starter-guide",
      label: "Google SEO Starter Guide",
      description: "Use search basics when evaluating public demand and content gaps.",
      external: true,
    },
  ],
  outreach: [
    {
      href: "https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business",
      label: "FTC CAN-SPAM compliance guide",
      description: "Official U.S. guidance for commercial email compliance.",
      external: true,
    },
    {
      href: "https://developers.google.com/search/docs/fundamentals/seo-starter-guide",
      label: "Google SEO Starter Guide",
      description: "Helpful context for writing clearer public pages and landing pages.",
      external: true,
    },
  ],
  proposal: [
    {
      href: "https://developers.google.com/search/docs/appearance/title-link",
      label: "Google title link guidance",
      description: "Useful when writing concise, specific subject lines and page titles.",
      external: true,
    },
    {
      href: "https://developers.google.com/search/docs/appearance/snippet",
      label: "Google snippet guidance",
      description: "A useful reference for summaries that help people decide what to read.",
      external: true,
    },
  ],
  crm: [
    {
      href: "https://www.sba.gov/business-guide/manage-your-business",
      label: "U.S. SBA business management guide",
      description: "Official small-business guidance that reinforces follow-up and process basics.",
      external: true,
    },
    {
      href: "https://developers.google.com/search/docs/fundamentals/seo-starter-guide",
      label: "Google SEO Starter Guide",
      description: "Search visibility fundamentals for organizing public content.",
      external: true,
    },
  ],
  pricing: [
    {
      href: "https://www.bls.gov/ooh/",
      label: "U.S. Occupational Outlook Handbook",
      description: "Role and market context for evaluating freelance service demand.",
      external: true,
    },
    {
      href: "https://trends.google.com/trends/",
      label: "Google Trends",
      description: "Use trend data to sanity-check niche and keyword direction.",
      external: true,
    },
  ],
  seo: [
    {
      href: "https://developers.google.com/search/docs/fundamentals/seo-starter-guide",
      label: "Google SEO Starter Guide",
      description: "Google's current baseline guide to search-friendly content and site structure.",
      external: true,
    },
    {
      href: "https://developers.google.com/search/docs/appearance/structured-data/article",
      label: "Google Article structured data",
      description: "Google guidance for Article, BlogPosting, date, image, and author markup.",
      external: true,
    },
  ],
  generic: [
    {
      href: "https://developers.google.com/search/docs/fundamentals/seo-starter-guide",
      label: "Google SEO Starter Guide",
      description: "Core search guidance for making content easier to crawl and understand.",
      external: true,
    },
    {
      href: "https://developers.google.com/search/docs/appearance/structured-data/article",
      label: "Google Article structured data",
      description: "Reference for article markup that clarifies title, image, date, and author.",
      external: true,
    },
  ],
};

export function stripInlineMarkup(text: string) {
  return text
    .replace(/<[^>]*>/g, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/`(.*?)`/g, "$1")
    .trim();
}

export function headingId(text: string) {
  const cleaned = stripInlineMarkup(text)
    .toLowerCase()
    .replace(/&amp;/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return cleaned || "section";
}

export function extractArticleHeadings(content: string, limit = 8): BlogHeading[] {
  const seen = new Map<string, number>();
  const headings: BlogHeading[] = [];

  for (const line of content.split("\n")) {
    const match = /^(##|###)\s+(.+)$/.exec(line.trim());
    if (!match) continue;

    const level = match[1] === "##" ? 2 : 3;
    const text = stripInlineMarkup(match[2] ?? "");
    if (!text || text.length > 120) continue;

    const baseId = headingId(text);
    const count = seen.get(baseId) ?? 0;
    seen.set(baseId, count + 1);
    headings.push({ id: count ? `${baseId}-${count + 1}` : baseId, text, level });
    if (headings.length >= limit) break;
  }

  return headings;
}

export function estimateWordCount(content: string) {
  return stripInlineMarkup(content)
    .split(/\s+/)
    .filter(Boolean).length;
}

export function getArticleTopics(post: BlogArticleSource): ArticleTopic[] {
  const priorityText = [
    post.title,
    post.category,
    post.focusKeyword,
    ...(post.tags ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const supportingText = [
    post.excerpt,
    post.content.slice(0, 4000),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const topics = TOPIC_MATCHERS
    .map(({ topic, terms }) => {
      const score = terms.reduce((total, term) => {
        const priorityHit = priorityText.includes(term) ? 5 : 0;
        const supportingHit = supportingText.includes(term) ? 1 : 0;
        return total + priorityHit + supportingHit;
      }, 0);

      return { topic, score };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.topic);

  return topics.length ? topics : ["generic"];
}

function uniqueLinks(links: BlogLinkItem[], limit: number) {
  const seen = new Set<string>();
  return links.filter(link => {
    if (seen.has(link.href)) return false;
    seen.add(link.href);
    return true;
  }).slice(0, limit);
}

export function getArticleInternalLinks(post: BlogArticleSource, limit = 6) {
  const strategicLinks = STRATEGIC_INTERNAL_LINKS[post.slug] ?? [];
  const topicLinks = getArticleTopics(post).flatMap(topic => INTERNAL_LINKS[topic]);
  return uniqueLinks([...strategicLinks, ...topicLinks, ...DEFAULT_INTERNAL_LINKS], limit);
}

export function getArticleOutboundLinks(post: BlogArticleSource, limit = 3) {
  const topicLinks = getArticleTopics(post).flatMap(topic => OUTBOUND_LINKS[topic]);
  return uniqueLinks(topicLinks.length ? topicLinks : OUTBOUND_LINKS.generic, limit);
}

export function getRelatedStaticPosts(current: BlogArticleSource, posts: BlogPost[], limit = 3) {
  const topics = new Set(getArticleTopics(current));
  const currentCategory = current.category?.toLowerCase();

  return posts
    .filter(post => post.slug !== current.slug && post.published)
    .map(post => {
      const categoryMatch = currentCategory && post.category.toLowerCase() === currentCategory ? 4 : 0;
      const topicScore = getArticleTopics(post).reduce((score, topic) => score + (topics.has(topic) ? 2 : 0), 0);
      return { post, score: categoryMatch + topicScore };
    })
    .sort((a, b) => b.score - a.score || b.post.createdAt.getTime() - a.post.createdAt.getTime())
    .slice(0, limit)
    .map(item => item.post);
}
