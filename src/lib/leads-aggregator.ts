/**
 * iCloseLeads Lead Aggregator v7
 *
 * Sources:
 *  1.  RemoteOK            — https://remoteok.com/api
 *  2.  Remotive            — https://remotive.com/api/remote-jobs
 *  3.  Reddit              — r/forhire, r/hiring, r/freelance_forhire, r/slavelabour  (Atom RSS)
 *  4.  WeWorkRemotely      — general + category RSS feeds
 *  5.  Arbeitnow           — https://www.arbeitnow.com/api/job-board-api
 *  6.  RemoteJobs.org      — https://remotejobs.org/api/v1/jobs
 *  7.  Job Opportunities   — https://api.jobopportunitiesapi.org/public/jobs
 *  8.  Jobicy              — https://jobicy.com/api/v2/remote-jobs
 *  9.  Working Nomads      — https://www.workingnomads.com/api/exposed_jobs
 *  10. HackerNews          — Algolia "Who is hiring?" / freelancer threads
 *  11. YC Jobs             — hacker-news.firebaseio.com/v0/jobstories          [replaces Remote.co]
 *  12. Authentic Jobs      — https://authenticjobs.com/feed/                  [disabled: WAF]
 *  13. GitHub Bounties     — open issues labelled bounty/paid
 *  14. Smashing Jobs       — https://jobs.smashingmagazine.com/feed/          [disabled: retired]
 *  15. Dribbble Jobs       — https://dribbble.com/jobs.rss
 *  16. Jobspresso          — https://jobspresso.co/feed/                      [disabled: empty]
 *  17. Himalayas           — https://himalayas.app/jobs/api/search
 *  18. Greenhouse boards   — selected public startup/company boards
 *  19. Lever boards        — selected public Lever boards
 *  20. Ashby boards        — selected public Ashby boards
 *  21. Remote First Jobs   — public category RSS feeds
 *  22. Web3 Jobs Radar     — public remote Web3 jobs API
 *
 * v7 changes:
 *  - Added Remote First Jobs and Web3 Jobs Radar without API keys
 *  - Mixed job feeds now require an explicit remote-work signal
 *
 * v6 changes:
 *  - Added Job Opportunities' keyless, employer-direct remote feed
 *  - Default scans skip retired or consistently empty RSS feeds
 *  - Source labels now name the provider users are opening
 *
 * v5 changes:
 *  - Reddit switched to public Atom RSS (no OAuth, 100% reliable)
 *  - Remote.co removed (Cloudflare blocks Vercel IPs) → replaced by YC Jobs (HN Firebase API)
 *  - Craigslist removed (Vercel IPs blocked) → replaced by Authentic Jobs RSS
 *  - Freelancermap removed (wrong/blocked URL from Vercel) → replaced by Jobspresso RSS
 *  - Jobicy: improved headers + RSS fallback on 4xx
 *  - WeWorkRemotely: now fetches general feed in addition to category feeds
 *  - Dedup: 3-key strategy (ID + normalised URL + company+title)
 *  - Added 5 new niches: Blockchain/Web3, Cybersecurity, Game Dev, Technical Writing, VA
 */

export type LeadSource =
  | "remoteok"
  | "remotive"
  | "reddit"
  | "weworkremotely"
  | "arbeitnow"
  | "remotejobsorg"
  | "jobopportunities"
  | "jobicy"
  | "workingnomads"
  | "hackernews"
  | "ycjobs"           // replaced Remote.co (Cloudflare-blocked from Vercel)
  | "authenticjobs"   // replaced Craigslist (Vercel IPs blocked)
  | "githubissues"
  | "smashingjobs"
  | "dribbble"
  | "freelancermap"   // shows Jobspresso feed (freelancermap.com URL was wrong)
  | "himalayas"       // himalayas.app — startup/remote jobs RSS
  | "nodesk"          // nodesk.co — curated remote-work RSS
  | "greenhouse"      // selected public Greenhouse job boards
  | "lever"           // selected public Lever job boards
  | "ashby"           // selected public Ashby job boards
  | "remotefirstjobs" // remotefirstjobs.com — public category RSS
  | "web3jobsradar";  // web3jobsradar.com — focused public Web3 API

/** Canonical display labels for every source — used by the UI source-filter chips */
export const ALL_SOURCE_LABELS: Record<LeadSource, string> = {
  remoteok:         "RemoteOK",
  remotive:         "Remotive",
  reddit:           "Reddit Hiring",
  weworkremotely:   "We Work Remotely",
  arbeitnow:        "Arbeitnow",
  remotejobsorg:    "RemoteJobs.org",
  jobopportunities: "Job Opportunities",
  jobicy:           "Jobicy",
  workingnomads:    "Working Nomads",
  hackernews:       "Hacker News Hiring",
  ycjobs:           "YC Jobs",
  authenticjobs:    "Authentic Jobs",
  githubissues:     "GitHub Bounties",
  smashingjobs:     "Smashing Jobs",
  dribbble:         "Dribbble Jobs",
  freelancermap:    "Jobspresso",
  himalayas:        "Himalayas",
  nodesk:           "NoDesk",
  greenhouse:       "Greenhouse Jobs",
  lever:            "Lever Jobs",
  ashby:            "Ashby Jobs",
  remotefirstjobs:  "Remote First Jobs",
  web3jobsradar:    "Web3 Jobs Radar",
};

// Callable for recovery probes, but excluded from normal user searches.
export const DEFAULT_DISABLED_SOURCES = new Set<LeadSource>([
  "githubissues",
  "freelancermap",
  "nodesk",
  "authenticjobs",
  "smashingjobs",
]);

export interface AggregatedLead {
  id:           string;
  company:      string;
  domain:       string;
  email?:       string;
  title:        string;
  description:  string;
  url:          string;
  source:       LeadSource;
  sourceLabel:  string;
  postedAt:     string;
  hoursAgo:     number;
  niche:        string;
  tags:         string[];
  confidence:   number;   // 0-100, niche match score
  qualityScore: number;   // 0-100, overall lead quality
  budget?:      string;   // e.g. "$500/project" or "$45/hr"
  urgency?:     boolean;  // ASAP / urgent signals detected
}

export interface SourceDiagnostic {
  source:        LeadSource;
  ok:            boolean;
  fetched:       number;
  kept:          number;
  errorMessage?: string;
}

export interface AggregateDiagnostics {
  sources:                    SourceDiagnostic[];
  totalFetched:               number;
  totalKeptAfterSourceFilter: number;
  totalAfterMinConfidence:    number;
  totalAfterDedup:            number;
  niche:                      string;
  resolvedNiche:              string;
  keywordsUsed:               string[];
}

// ─── Niche normalization ─────────────────────────────────────────────────────

const NICHE_ALIASES: Record<string, string> = {
  "consulting":       "business-consulting",
  "business":         "business-consulting",
  "ecommerce":        "shopify",
  "e-commerce":       "shopify",
  "frontend":         "web-development",
  "backend":          "web-development",
  "fullstack":        "web-development",
  "full-stack":       "web-development",
  "ml":               "data-science",
  "machine-learning": "data-science",
  "ai":               "data-science",
  "ios":              "mobile-apps",
  "android":          "mobile-apps",
  "mobile":           "mobile-apps",
  "design":           "ui-ux-design",
  "ux":               "ui-ux-design",
  "ui":               "ui-ux-design",
  "writing":          "copywriting",
  "content":          "copywriting",
  "marketing":        "email-marketing",
  "meta":             "meta-ads",
  "meta ads":         "meta-ads",
  "facebook ads":     "meta-ads",
  "instagram ads":    "meta-ads",
  "paid social":      "meta-ads",
  "paid media":       "meta-ads",
  "media buying":     "meta-ads",
  "media buyer":      "meta-ads",
  "video":            "video-editing",
  // New niche aliases
  "web3":             "blockchain",
  "crypto":           "blockchain",
  "nft":              "blockchain",
  "defi":             "blockchain",
  "security":         "cybersecurity",
  "infosec":          "cybersecurity",
  "pentest":          "cybersecurity",
  "game":             "game-development",
  "games":            "game-development",
  "unity":            "game-development",
  "gaming":           "game-development",
  "docs":             "technical-writing",
  "documentation":    "technical-writing",
  "va":               "virtual-assistant",
  "assistant":        "virtual-assistant",
};

export function normalizeNiche(niche: string): string {
  const k = niche.trim().toLowerCase();
  return NICHE_ALIASES[k] ?? k;
}

// ─── Niche → keyword mapping ─────────────────────────────────────────────────
export const NICHE_KEYWORDS: Record<string, string[]> = {
  "web-development":     ["web developer","full stack","fullstack","frontend","backend","react","next.js","nextjs","node","node.js","javascript","typescript","vue","angular","svelte","php","laravel","django","rails","ruby","html","css","web app"],
  "mobile-apps":         ["mobile developer","ios developer","android developer","react native","flutter","swift","kotlin","mobile app","cross-platform","expo","xcode","app developer"],
  "ui-ux-design":        ["ui designer","ux designer","product designer","figma","ui/ux","user experience","interface design","web design","wireframe","prototyping","design system","sketch","adobe xd","product design"],
  "copywriting":         ["copywriter","content writer","copy writer","marketing copy","sales copy","email copy","landing page copy","content strategist","technical writer","blog writer","ghostwriter","seo writer","content creation"],
  "seo":                 ["seo","search engine optimization","seo specialist","content marketing","keyword research","link building","seo writer","organic growth","google ads","ppc","sem","digital marketing"],
  "video-editing":       ["video editor","video editing","motion graphics","after effects","premiere pro","youtube editor","video production","videographer","animator","davinci resolve","final cut","video content"],
  "graphic-design":      ["graphic designer","graphic design","logo design","branding","illustrator","photoshop","visual design","brand identity","print design","packaging design","canva","illustration"],
  "social-media":        ["social media manager","social media","community manager","instagram manager","content creator","social strategy","tiktok","youtube manager","facebook ads","social media marketing"],
  "meta-ads":            ["meta ads","facebook ads","instagram ads","paid social","paid media","media buyer","media buying","performance marketer","performance marketing","facebook ad","instagram ad","meta advertising","ads manager","facebook campaigns","instagram campaigns","paid acquisition","social ads","social advertising"],
  "data-science":        ["data scientist","data analyst","machine learning","ml engineer","data engineering","python developer","analytics","ai engineer","llm","nlp","tensorflow","pytorch","sql","tableau","power bi","data pipeline"],
  "devops":              ["devops","cloud engineer","aws","kubernetes","docker","ci/cd","infrastructure","sre","platform engineer","terraform","gcp","azure","ansible","linux","nginx","cloud architect"],
  "wordpress":           ["wordpress","wp developer","wordpress developer","woocommerce","elementor","wordpress plugin","wp theme","gutenberg","divi","wordpress site"],
  "shopify":             ["shopify","shopify developer","e-commerce developer","ecommerce","shopify plus","liquid","shopify theme","klaviyo","bigcommerce","shopify store"],
  "email-marketing":     ["email marketing","klaviyo","mailchimp","email campaign","email automation","drip campaign","hubspot","activecampaign","email funnel","beehiiv","convertkit","email strategy"],
  "business-consulting": ["business consultant","strategy consultant","management consultant","business analyst","startup advisor","fractional cto","fractional cfo","operations consultant","growth consultant","coo","business strategy"],
  "photography":         ["photographer","photo editor","product photography","photo retouching","lightroom","photoshoot","commercial photography","real estate photography","portrait","headshot"],
  // ── New niches ──────────────────────────────────────────────────────────────
  "blockchain":          ["blockchain","web3","solidity","smart contract","defi","nft","ethereum","crypto","dao","dapp","polygon","solana","near protocol","rust blockchain","web3 developer","blockchain developer","token","cryptocurrency"],
  "cybersecurity":       ["cybersecurity","penetration testing","pentest","security audit","infosec","ethical hacking","vulnerability assessment","soc analyst","bug bounty","cloud security","network security","ctf","cybersecurity analyst","security engineer","red team","blue team"],
  "game-development":    ["game developer","unity developer","unreal engine","game design","game programmer","godot","c# unity","game dev","multiplayer game","mobile game","game mechanics","gameplay programmer","game artist","indie game","gaming"],
  "technical-writing":   ["technical writer","api documentation","user manual","documentation","developer docs","knowledge base","doc writer","api docs","confluence","technical documentation","product documentation","content documentation","sdk docs"],
  "virtual-assistant":   ["virtual assistant","executive assistant","admin assistant","administrative","data entry","research assistant","personal assistant","remote assistant","calendar management","scheduling","inbox management","project coordinator","online assistant"],
};

const NICHE_TITLE_CONTEXT: Record<string, string[]> = {
  "wordpress": [
    "wordpress","wp developer","wordpress developer","woocommerce","elementor",
    "website","web designer","web developer","web design","fullstack","full stack",
    "frontend","backend","php developer",
  ],
  "meta-ads": [
    "meta ads","facebook ads","instagram ads","paid social","paid media","media buyer",
    "performance marketing","performance marketer","marketing manager","marketing strategist",
    "growth marketing","growth marketer","digital marketing","social media strategist",
    "account strategist","brand strategist","campaign manager","ppc","paid acquisition",
    "social ads","ads manager",
  ],
};

const FREELANCE_SIGNALS = [
  "freelance","freelancer","contract","contractor","part-time","part time",
  "project basis","remote","1099","consultant","hourly","per project","ad-hoc",
  "gig","short-term","fixed price","fixed-price","hire a","looking to hire",
];
const HIRING_SIGNALS = [
  "looking for","looking to hire","we are hiring","we're hiring","[hiring]",
  "needed","wanted","seeking","need a","seeking freelancer","budget","paid work",
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function hoursAgo(date: Date): number {
  return Math.max(0, Math.floor((Date.now() - date.getTime()) / 3_600_000));
}

function extractEmail(text: string): string | undefined {
  if (!text) return undefined;
  const matches = text.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g);
  if (!matches) return undefined;
  for (const e of matches) {
    if (/\.(png|jpg|jpeg|gif|svg|webp|css|js|woff|woff2|ttf)$/i.test(e)) continue;
    if (/^(noreply|no-reply|donotreply|notifications?|alerts?|mailer-daemon|postmaster|hello|info|admin|webmaster|abuse|security|support|contact|team|jobs|careers|hr)@/i.test(e)) continue;
    if (/example\.com|yourdomain\.com|test\.com|domain\.com/i.test(e)) continue;
    if (e.length > 80) continue;
    return e;
  }
  return undefined;
}

function extractDomain(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, ""); }
  catch { return url.replace(/^https?:\/\/(www\.)?/, "").split("/")[0] ?? url; }
}

function companyToDomain(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 20) + ".com";
}

function stripHtml(text: string): string {
  return (text ?? "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/&\w+;/g, " ").replace(/\s+/g, " ").trim();
}

function truncate(text: string, max = 320): string {
  const cleaned = stripHtml(text);
  return cleaned.length > max ? cleaned.slice(0, max).replace(/\s+\S*$/, "") + "…" : cleaned;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function keywordMatchesText(text: string, keyword: string): boolean {
  const kw = keyword.trim().toLowerCase();
  if (!kw) return false;
  const escaped = kw.split(/\s+/).map(escapeRegExp).join("\\s+");
  const needsLeftBoundary = /^[a-z0-9]/i.test(kw);
  const needsRightBoundary = /[a-z0-9]$/i.test(kw);
  const pattern = `${needsLeftBoundary ? "(^|[^a-z0-9])" : ""}${escaped}${needsRightBoundary ? "($|[^a-z0-9])" : ""}`;
  return new RegExp(pattern, "i").test(text.toLowerCase());
}

function titleHasNicheContext(niche: string, title: string, tags: string[]): boolean {
  const context = NICHE_TITLE_CONTEXT[niche];
  if (!context) return true;
  const titleAndTags = `${title ?? ""} ${(tags ?? []).join(" ")}`.toLowerCase();
  return context.some(keyword => keywordMatchesText(titleAndTags, keyword));
}

/**
 * Extract a budget / rate string from text.
 * Matches "$500", "$45/hr", "$1k-$5k", "budget: $200", "500 USD", etc.
 */
function extractBudget(text: string): string | undefined {
  if (!text) return undefined;
  const patterns = [
    /\$\s*\d[\d,]*(?:\s*[kK])?\s*(?:[-–]\s*\$?\s*\d[\d,]*(?:\s*[kK])?)?\s*(?:\/\s*(?:hr|hour|mo|month|week|wk|project|task|day))?/,
    /(?:budget|rate|compensation|pay|salary|fixed|price)\s*:?\s*\$?\s*\d[\d,]*(?:\s*[kK])?(?:\s*\/\s*(?:hr|hour|mo|month|project))?/i,
    /\d[\d,]+\s*(?:USD|EUR|GBP|CAD|AUD)(?:\s*\/\s*(?:hr|hour|mo|month|project))?/i,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m?.[0] && m[0].replace(/\D/g, "").length >= 2) {
      return m[0].trim().replace(/\s+/g, " ").slice(0, 55);
    }
  }
  return undefined;
}

/** Detect urgency signals like "ASAP", "urgent", "start today", etc. */
function detectUrgency(text: string): boolean {
  return /\b(asap|urgent(?:ly)?|immediately|right\s*away|start\s*(?:today|now|asap|immediately)|quick(?:ly)?|rush(?:\s*job)?|time[\s-]sensitive|need\s*(?:it\s*)?(?:done\s*)?(?:today|now|asap)|deadline\s*soon)\b/i.test(text);
}

function hasRemoteSignal(...parts: Array<string | string[] | undefined>): boolean {
  const text = parts.flatMap(part => Array.isArray(part) ? part : [part ?? ""]).join(" ");
  return /\b(remote(?:[-\s]?first)?|work[-\s]?from[-\s]?home|wfh|distributed|anywhere|worldwide)\b/i.test(text);
}

function isJobSeekerPost(text: string): boolean {
  return /\b(open\s+to\s+work|hire\s+me|available\s+for\s+(?:hire|work)|need\s+(?:a\s+)?job|looking\s+for\b.{0,80}\b(?:job|work|role|position|opportunit(?:y|ies)))\b/i.test(text);
}

/**
 * Lenient keyword scorer.
 * Title hits weigh more than body hits. Generic freelance/hiring signals add bonus.
 */
function scoreMatch(title: string, body: string, tags: string[], keywords: string[]): number {
  const titleLower = (title ?? "").toLowerCase();
  const bodyLower  = `${body ?? ""} ${(tags ?? []).join(" ")}`.toLowerCase();
  const allLower   = `${titleLower} ${bodyLower}`;

  if (keywords.length === 0) return 30;

  let titleHits = 0; let bodyHits = 0;
  for (const raw of keywords) {
    if (keywordMatchesText(titleLower, raw)) titleHits++;
    else if (keywordMatchesText(bodyLower, raw)) bodyHits++;
  }

  if (titleHits + bodyHits === 0) return 0;

  let score = 22;
  if (titleHits > 0) score += 30 + Math.min(20, (titleHits - 1) * 8);
  if (bodyHits  > 0) score += 12 + Math.min(15, (bodyHits  - 1) * 4);

  if (titleHits + bodyHits > 0) {
    for (const sig of FREELANCE_SIGNALS) { if (allLower.includes(sig)) { score += 4; break; } }
    for (const sig of HIRING_SIGNALS)   { if (allLower.includes(sig)) { score += 4; break; } }
  }

  return Math.min(100, Math.max(0, Math.round(score)));
}

function bestNicheMatch(
  lead: Pick<AggregatedLead, "title" | "description" | "tags" | "confidence">,
  nicheKeywordSets: Array<{ niche: string; keywords: string[] }>,
): { niche: string; confidence: number } | null {
  if (nicheKeywordSets.length === 0) return null;

  if (nicheKeywordSets.length === 1) {
    const only = nicheKeywordSets[0]!;
    if (!titleHasNicheContext(only.niche, lead.title, lead.tags)) return null;
    const visibleScore = scoreMatch(lead.title, lead.description, lead.tags, only.keywords);
    const confidence = Math.max(visibleScore, lead.confidence);
    return confidence > 0 ? { niche: only.niche, confidence } : null;
  }

  let best: { niche: string; confidence: number } | null = null;
  for (const candidate of nicheKeywordSets) {
    if (!titleHasNicheContext(candidate.niche, lead.title, lead.tags)) continue;
    const confidence = scoreMatch(lead.title, lead.description, lead.tags, candidate.keywords);
    if (confidence > (best?.confidence ?? 0)) best = { niche: candidate.niche, confidence };
  }
  return best && best.confidence > 0 ? best : null;
}

function calcQuality(lead: {
  email?:       string;
  description?: string;
  tags?:        string[];
  domain?:      string;
  title?:       string;
  budget?:      string;
  urgency?:     boolean;
}): number {
  let score = 28;
  if (lead.email)   score += 22;
  if (lead.budget)  score += 18; // stated budget = high-intent client
  if (lead.urgency) score += 6;
  const dl = lead.description?.length ?? 0;
  if (dl > 80)  score += 8;
  if (dl > 200) score += 8;
  if (dl > 500) score += 6;
  if ((lead.tags?.length ?? 0) > 0) score += 5;
  if ((lead.tags?.length ?? 0) > 3) score += 4;
  if (lead.domain && !["reddit.com","weworkremotely.com","news.ycombinator.com","craigslist.org"].includes(lead.domain)) score += 6;
  if ((lead.title?.length ?? 0) > 12) score += 3;
  return Math.min(100, score);
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`timeout after ${ms}ms`)), ms)
    ),
  ]);
}

function cacheOpts(freshOnly: boolean, revalidateSec: number): RequestInit & { next?: { revalidate: number } } {
  return freshOnly ? { cache: "no-store" } : { next: { revalidate: revalidateSec } };
}

// ─── Reddit helpers (RSS/Atom — no OAuth required) ───────────────────────────

/** Pull posts from one subreddit via its public Atom feed. */
async function fetchRedditSub(
  sub: string,
  isHiringFilter: (title: string) => boolean,
  keywords: string[],
  maxHours: number,
  freshOnly: boolean,
): Promise<AggregatedLead[]> {
  let xml = "";
  try {
    const res = await withTimeout(
      fetch(`https://www.reddit.com/r/${sub}/new.rss?limit=100`, {
        headers: {
          // Must look like a real browser agent to avoid Reddit's bot block
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36 iCloseLeads/5.0",
          "Accept":      "application/rss+xml, application/atom+xml, text/xml, */*",
        },
        ...cacheOpts(freshOnly, 300),
      }),
      9000,
    );
    if (!res.ok) return [];
    xml = await res.text();
  } catch { return []; }

  // Reddit RSS uses Atom <entry> elements
  const entries = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/gi)];
  const leads: AggregatedLead[] = [];

  for (const m of entries) {
    const entry = m[1] ?? "";

    // Title
    const titleRaw = entry.match(/<title[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i)?.[1] ?? "";
    const title    = stripHtml(titleRaw).trim();
    if (!title) continue;
    if (isJobSeekerPost(title)) continue;

    // Skip posts that don't match the "hiring" filter for this subreddit
    if (!isHiringFilter(title)) continue;

    // Link — Reddit Atom has <link rel="alternate" href="..."/>
    const link = entry.match(/<link[^>]+href="([^"]+)"/i)?.[1]?.replace(/&amp;/g, "&") ?? "";
    if (!link) continue;

    // Post ID from the <id> tag or URL
    const postId = entry.match(/\/comments\/([a-z0-9]+)\//i)?.[1] ?? Math.random().toString(36).slice(2);

    // Published timestamp
    const updatedStr = entry.match(/<updated[^>]*>([\s\S]*?)<\/updated>/i)?.[1] ?? "";
    const posted     = updatedStr ? new Date(updatedStr) : null;
    if (!posted || isNaN(posted.getTime())) continue;
    const hrs = hoursAgo(posted);
    if (hrs > maxHours) continue;

    // Body content
    const contentRaw = entry.match(/<content[^>]*>([\s\S]*?)<\/content>/i)?.[1] ?? "";
    const body       = stripHtml(contentRaw);
    if (isJobSeekerPost(`${title} ${body}`)) continue;
    if (!["RemoteJobs", "remotework", "remoteworking"].includes(sub) && !hasRemoteSignal(title, body)) continue;

    // Author
    const author = entry.match(/<name[^>]*>([\s\S]*?)<\/name>/i)?.[1]?.trim() ?? "";

    const baseConfidence = scoreMatch(title, body, [], keywords);
    const confidence = baseConfidence > 0 ? Math.min(100, baseConfidence + 14) : 0;
    if (confidence < SOURCE_FLOOR) continue;
    const budget     = extractBudget(title + " " + body);
    const urgency    = detectUrgency(title + " " + body);
    const email      = extractEmail(body);
    const domain     = email ? (email.split("@")[1] ?? "reddit.com") : "reddit.com";
    const titleClean = title.replace(/\[.*?\]/g, "").replace(/\bhiring\b/gi, "").replace(/\s+/g, " ").trim();
    const company    = titleClean.length > 5 ? titleClean.slice(0, 70) : `u/${author || "redditor"}`;

    leads.push({
      id:          `reddit-${postId}`,
      company,     domain, email,
      title:       title.replace(/\[.*?\]\s*/g, "").trim() || title,
      description: truncate(body || "Reddit hiring post — click to view the full thread."),
      url:         link,
      source:      "reddit", sourceLabel: `r/${sub}`,
      postedAt:    posted.toISOString(), hoursAgo: hrs, niche: "", tags: [],
      confidence,  budget, urgency,
      qualityScore: calcQuality({ email, description: body, domain, title, budget, urgency }),
    });
  }
  return leads;
}

const SOURCE_FLOOR = 12;

export function buildKeywordsForNiches(niches: string[]): { keywords: string[]; resolved: string[] } {
  const resolved: string[] = [];
  const seen = new Set<string>();
  const merged: string[] = [];
  for (const raw of niches) {
    const r = normalizeNiche(raw);
    if (resolved.includes(r)) continue;
    resolved.push(r);
    for (const k of (NICHE_KEYWORDS[r] ?? [])) {
      const lower = k.toLowerCase();
      if (!seen.has(lower)) { seen.add(lower); merged.push(k); }
    }
  }
  if (resolved.length === 0) {
    resolved.push("web-development");
    return { keywords: NICHE_KEYWORDS["web-development"]!, resolved };
  }
  return { keywords: merged, resolved };
}

// ─── Source 1: RemoteOK ───────────────────────────────────────────────────────

interface RemoteOKJob {
  id?: string | number; slug?: string; epoch?: number; date?: string;
  company?: string; company_url?: string; url?: string; title?: string;
  description?: string; tags?: string[]; legal?: string; position?: string;
}

async function fetchRemoteOK(keywords: string[], maxHours: number, freshOnly: boolean): Promise<{ leads: AggregatedLead[]; raw: number }> {
  const res = await withTimeout(
    fetch("https://remoteok.com/api", {
      headers: { "User-Agent": "Mozilla/5.0 iCloseLeads/4.0" },
      ...cacheOpts(freshOnly, 600),
    }),
    9000
  );
  if (!res.ok) throw new Error(`RemoteOK ${res.status}`);
  const raw = await res.json() as RemoteOKJob[];
  let inWindow = 0;
  const leads = raw.flatMap((job): AggregatedLead[] => {
    if (job.legal || (!job.title && !job.position) || !job.company) return [];
    const posted = job.epoch ? new Date(job.epoch * 1000) : job.date ? new Date(job.date) : null;
    if (!posted || isNaN(posted.getTime())) return [];
    const hrs = hoursAgo(posted);
    if (hrs > maxHours) return [];
    inWindow++;
    const title = job.title ?? job.position ?? "";
    const desc  = stripHtml(job.description ?? "");
    const confidence = scoreMatch(title, desc, job.tags ?? [], keywords);
    if (confidence < SOURCE_FLOOR) return [];
    const budget  = extractBudget(desc);
    const urgency = detectUrgency(title + " " + desc);
    const email  = extractEmail(desc);
    const domain = job.company_url ? extractDomain(job.company_url) : companyToDomain(job.company);
    return [{
      id: `rok-${String(job.id ?? job.slug ?? Math.random())}`,
      company: job.company.trim(), domain, email, title: title.trim(),
      description: truncate(desc),
      url: job.url ?? `https://remoteok.com/remote-jobs/${job.slug ?? ""}`,
      source: "remoteok", sourceLabel: "RemoteOK",
      postedAt: posted.toISOString(), hoursAgo: hrs, niche: "",
      tags: (job.tags ?? []).slice(0, 8), confidence, budget, urgency,
      qualityScore: calcQuality({ email, description: desc, tags: job.tags, domain, title, budget, urgency }),
    }];
  });
  return { leads, raw: inWindow };
}

// ─── Source 2: Remotive ───────────────────────────────────────────────────────

interface RemotiveJob {
  id?: number; url?: string; title?: string; company_name?: string;
  category?: string; tags?: string[]; publication_date?: string; description?: string;
}
interface RemotiveResponse { jobs?: RemotiveJob[]; }

async function fetchRemotive(niche: string, keywords: string[], maxHours: number, freshOnly: boolean): Promise<{ leads: AggregatedLead[]; raw: number }> {
  const categoryMap: Record<string, string> = {
    "web-development":"software-dev","mobile-apps":"software-dev",
    "ui-ux-design":"design","copywriting":"writing","seo":"marketing",
    "graphic-design":"design","social-media":"marketing","data-science":"data",
    "devops":"devops-sysadmin","email-marketing":"marketing","meta-ads":"marketing","business-consulting":"business",
    "wordpress":"software-dev","shopify":"software-dev",
  };
  const category = categoryMap[niche] ?? "";
  const search   = keywords.slice(0, 2).join(" ");
  const url = `https://remotive.com/api/remote-jobs?${category ? `category=${category}` : `search=${encodeURIComponent(search)}`}&limit=100`;
  const res = await withTimeout(
    fetch(url, { headers: { "User-Agent": "iCloseLeads/4.0" }, ...cacheOpts(freshOnly, 600) }),
    9000
  );
  if (!res.ok) throw new Error(`Remotive ${res.status}`);
  const data = await res.json() as RemotiveResponse;
  let inWindow = 0;
  const leads = (data.jobs ?? []).flatMap((job): AggregatedLead[] => {
    if (!job.title || !job.company_name) return [];
    const posted = job.publication_date ? new Date(job.publication_date) : null;
    if (!posted || isNaN(posted.getTime())) return [];
    const hrs = hoursAgo(posted);
    if (hrs > maxHours) return [];
    inWindow++;
    const desc  = stripHtml(job.description ?? "");
    const confidence = scoreMatch(job.title, desc, job.tags ?? [], keywords);
    if (confidence < SOURCE_FLOOR) return [];
    const budget  = extractBudget(desc);
    const urgency = detectUrgency(job.title + " " + desc);
    const email  = extractEmail(desc);
    const domain = companyToDomain(job.company_name);
    return [{
      id: `rem-${job.id ?? Math.random()}`,
      company: job.company_name.trim(), domain, email, title: job.title.trim(),
      description: truncate(desc), url: job.url ?? "https://remotive.com",
      source: "remotive", sourceLabel: "Remotive",
      postedAt: posted.toISOString(), hoursAgo: hrs, niche: "",
      tags: (job.tags ?? []).slice(0, 8), confidence, budget, urgency,
      qualityScore: calcQuality({ email, description: desc, tags: job.tags, domain, title: job.title, budget, urgency }),
    }];
  });
  return { leads, raw: inWindow };
}

// ─── Source 3: Reddit (via public RSS / Atom feeds — no OAuth needed) ────────

const REDDIT_SUBS: Array<{
  sub: string;
  filter: (title: string) => boolean;
}> = [
  {
    sub:    "forhire",
    filter: t => /\[hiring\]/i.test(t) || /\[h\]\s/i.test(t) || /\b(looking\s+for|need|seeking|wanted)\b/i.test(t),
  },
  {
    sub:    "freelance_forhire",
    filter: t => /\[hiring\]/i.test(t) || /\[h\]\s/i.test(t) || /\b(looking\s+for|need|seeking|wanted)\b/i.test(t),
  },
  {
    sub:    "hiring",
    // r/hiring: all posts are from hirers UNLESS tagged [For Hire] / [FH]
    filter: t => !/\[for\s*hire\]/i.test(t) && !/\[fh\]/i.test(t) && !/\b(hire\s+me|available\s+for|portfolio)\b/i.test(t),
  },
  {
    sub:    "slavelabour",
    // slavelabour: [Offer] = someone offering a service; [Task] = hiring
    filter: t => /\[task\]/i.test(t),
  },
  {
    sub:    "jobbit",
    filter: t => /\b(hiring|looking\s+for|need|seeking|wanted|contract|remote)\b/i.test(t) && !/\b(for\s+hire|hire\s+me|available\s+for)\b/i.test(t),
  },
  {
    sub:    "RemoteJobs",
    filter: t => /\b(hiring|looking\s+for|need|seeking|wanted|remote)\b/i.test(t) && !/\b(for\s+hire|hire\s+me|available\s+for)\b/i.test(t),
  },
  {
    sub:    "remotework",
    filter: t => /\b(hiring|looking\s+for|need|seeking|wanted|remote)\b/i.test(t) && !/\b(for\s+hire|hire\s+me|available\s+for)\b/i.test(t),
  },
  {
    sub:    "remoteworking",
    filter: t => /\b(hiring|looking\s+for|need|seeking|wanted|remote)\b/i.test(t) && !/\b(for\s+hire|hire\s+me|available\s+for)\b/i.test(t),
  },
  {
    sub:    "hireawriter",
    filter: t => /\[hiring\]|\b(hiring|looking\s+for|need|seeking|wanted|paid)\b/i.test(t) && !/\b(for\s+hire|hire\s+me|available\s+for)\b/i.test(t),
  },
];

async function fetchReddit(
  keywords: string[],
  maxHours: number,
  freshOnly: boolean,
): Promise<{ leads: AggregatedLead[]; raw: number }> {
  const results = await Promise.all(
    REDDIT_SUBS.map(({ sub, filter }) =>
      fetchRedditSub(sub, filter, keywords, maxHours, freshOnly),
    ),
  );
  const leads = results.flat();
  return { leads, raw: leads.length };
}

// ─── Source 4: Job Opportunities API ─────────────────────────────────────────

interface JobOpportunity {
  id?: string;
  title?: string;
  company?: string;
  company_slug?: string;
  category?: string;
  seniority?: string;
  location?: string;
  remote?: string;
  posted_at?: string;
  first_seen_at?: string;
  apply_url?: string;
  source?: string;
  description?: string;
}

interface JobOpportunitiesResponse { data?: JobOpportunity[]; }

async function fetchJobOpportunities(
  keywords: string[],
  maxHours: number,
  freshOnly: boolean,
): Promise<{ leads: AggregatedLead[]; raw: number }> {
  const params = new URLSearchParams({
    remote: "remote",
    posted_after: new Date(Date.now() - maxHours * 3_600_000).toISOString(),
    include_description: "true",
    limit: "50",
  });
  const res = await withTimeout(
    fetch(`https://api.jobopportunitiesapi.org/public/jobs?${params.toString()}`, {
      headers: { "User-Agent": "iCloseLeads/6.0", "Accept": "application/json" },
      ...cacheOpts(freshOnly, 300),
    }),
    9000,
  );
  if (!res.ok) throw new Error(`Job Opportunities ${res.status}`);
  const data = await res.json() as JobOpportunitiesResponse;

  let inWindow = 0;
  const leads = (data.data ?? []).flatMap((job): AggregatedLead[] => {
    if (!job.id || !job.title || !job.apply_url) return [];
    const posted = parsePostedDate(job.posted_at, job.first_seen_at);
    if (!posted) return [];
    const hrs = hoursAgo(posted);
    if (hrs > maxHours) return [];
    inWindow++;

    const tags = [job.category, job.seniority, job.remote, job.location, job.source]
      .filter((value): value is string => Boolean(value))
      .slice(0, 8);
    const description = stripHtml(job.description ?? "");
    const confidence = scoreMatch(job.title, description, tags, keywords);
    if (confidence < SOURCE_FLOOR) return [];

    const company = (job.company || job.company_slug || "Hiring company").trim().slice(0, 100);
    const budget = extractBudget(description);
    const urgency = detectUrgency(`${job.title} ${description}`);
    const email = extractEmail(description);
    const domain = extractDomain(job.apply_url);

    return [{
      id: `joa-${job.id}`,
      company, domain, email,
      title: job.title.trim(),
      description: truncate(description || `${company} employer-direct job posting.`),
      url: job.apply_url,
      source: "jobopportunities",
      sourceLabel: ALL_SOURCE_LABELS.jobopportunities,
      postedAt: posted.toISOString(), hoursAgo: hrs, niche: "",
      tags, confidence, budget, urgency,
      qualityScore: calcQuality({ email, description, tags, domain, title: job.title, budget, urgency }),
    }];
  });

  return { leads, raw: inWindow };
}

// ─── Source 5: Remote First Jobs ────────────────────────────────────────
const REMOTE_FIRST_CATEGORY: Record<string, string> = {
  "web-development": "software-development",
  "mobile-apps": "software-development",
  "wordpress": "wordpress",
  "shopify": "shopify",
  "ui-ux-design": "design",
  "graphic-design": "graphic-design",
  "copywriting": "writing",
  "technical-writing": "writing",
  "seo": "marketing",
  "social-media": "social-media",
  "meta-ads": "marketing",
  "email-marketing": "marketing",
  "data-science": "data-science",
  "devops": "devops",
  "video-editing": "design",
  "photography": "design",
  "blockchain": "web3",
  "cybersecurity": "cybersecurity",
  "business-consulting": "business",
  "game-development": "unreal-engine",
  "virtual-assistant": "virtual-assistant",
};

async function fetchRemoteFirstJobs(
  niche: string,
  keywords: string[],
  maxHours: number,
  freshOnly: boolean,
): Promise<{ leads: AggregatedLead[]; raw: number }> {
  if (niche === "blockchain") return { leads: [], raw: 0 };
  const category = REMOTE_FIRST_CATEGORY[niche] ?? "software-development";
  const res = await withTimeout(
    fetch(`https://remotefirstjobs.com/rss/jobs/${category}.rss`, {
      headers: { "User-Agent": "iCloseLeads/7.0", "Accept": "application/rss+xml, text/xml, */*" },
      ...cacheOpts(freshOnly, 600),
    }),
    10000,
  );
  if (!res.ok) throw new Error(`Remote First Jobs ${res.status}`);

  const xml = await res.text();
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)];
  const leads: AggregatedLead[] = [];
  let inWindow = 0;

  for (const match of items) {
    const item = match[1] ?? "";
    const fullTitle = stripHtml(extractRSS(item, "title"));
    const link = extractRSS(item, "link");
    const guid = stripHtml(extractRSS(item, "guid"));
    const posted = new Date(extractRSS(item, "pubDate"));
    if (!fullTitle || !link || isNaN(posted.getTime())) continue;
    const hrs = hoursAgo(posted);
    if (hrs > maxHours) continue;
    inWindow++;

    const rawDescription = extractRSS(item, "description") || extractRSS(item, "content:encoded");
    const description = stripHtml(stripHtml(rawDescription));
    const titleMatch = fullTitle.match(/^(.+?)\s+at\s+(.+)$/i);
    const title = titleMatch?.[1]?.trim() || fullTitle;
    const company = (titleMatch?.[2]?.trim() || "Remote First Jobs company").slice(0, 100);
    const tags = [category, "remote"];
    const titleConfidence = scoreMatch(title, "", [], keywords);
    const confidence = scoreMatch(title, description, tags, keywords);
    if (confidence < SOURCE_FLOOR || (titleConfidence === 0 && confidence < 60)) continue;

    const budget = extractBudget(description);
    const urgency = detectUrgency(`${title} ${description}`);
    const email = extractEmail(description);
    const domain = companyToDomain(company);

    leads.push({
      id: `rfj-${guid || link.split("/").filter(Boolean).pop() || Math.random()}`,
      company, domain, email, title,
      description: truncate(description),
      url: link,
      source: "remotefirstjobs",
      sourceLabel: ALL_SOURCE_LABELS.remotefirstjobs,
      postedAt: posted.toISOString(), hoursAgo: hrs, niche: "",
      tags, confidence, budget, urgency,
      qualityScore: calcQuality({ email, description, tags, domain, title, budget, urgency }),
    });
  }

  return { leads, raw: inWindow };
}

// Source 6: Web3 Jobs Radar public API.
interface Web3RadarJob {
  id?: string;
  title?: string;
  company?: string;
  url?: string;
  applyUrl?: string;
  location?: string;
  remote?: string;
  role?: string;
  seniority?: string;
  tags?: string[];
  postedAt?: string;
  salary?: { min?: number | null; max?: number | null; currency?: string | null } | null;
}
interface Web3RadarResponse { jobs?: Web3RadarJob[]; }

async function fetchWeb3JobsRadar(
  niche: string,
  keywords: string[],
  maxHours: number,
  freshOnly: boolean,
): Promise<{ leads: AggregatedLead[]; raw: number }> {
  if (niche !== "blockchain") return { leads: [], raw: 0 };

  const since = maxHours <= 24 ? "24h" : maxHours <= 168 ? "7d" : "30d";
  const params = new URLSearchParams({ remote: "remote", since, sort: "new", limit: "50" });
  const res = await withTimeout(
    fetch(`https://web3jobsradar.com/api/jobs?${params.toString()}`, {
      headers: { "User-Agent": "iCloseLeads/7.0", "Accept": "application/json" },
      ...cacheOpts(freshOnly, 600),
    }),
    9000,
  );
  if (!res.ok) throw new Error(`Web3 Jobs Radar ${res.status}`);
  const data = await res.json() as Web3RadarResponse;

  let inWindow = 0;
  const leads = (data.jobs ?? []).flatMap((job): AggregatedLead[] => {
    if (!job.id || !job.title || !job.company || !job.postedAt || job.remote !== "remote") return [];
    const posted = new Date(job.postedAt);
    if (isNaN(posted.getTime())) return [];
    const hrs = hoursAgo(posted);
    if (hrs > maxHours) return [];
    inWindow++;

    const tags = [job.role, job.seniority, job.location, ...(job.tags ?? []), "remote"]
      .filter((value): value is string => Boolean(value))
      .slice(0, 8);
    const description = `${job.company} is hiring a remote ${job.title}. ${tags.join(", ")}.`;
    const confidence = Math.max(55, scoreMatch(job.title, description, tags, keywords));
    if (confidence < SOURCE_FLOOR) return [];

    const salary = job.salary;
    const budget = salary?.min || salary?.max
      ? `${salary.currency || "USD"} ${salary.min?.toLocaleString() || "?"}-${salary.max?.toLocaleString() || "?"}/year`
      : undefined;
    const url = job.url || job.applyUrl;
    if (!url) return [];
    const domain = extractDomain(url);

    return [{
      id: `w3r-${job.id}`,
      company: job.company.trim(), domain,
      title: job.title.trim(), description, url,
      source: "web3jobsradar",
      sourceLabel: ALL_SOURCE_LABELS.web3jobsradar,
      postedAt: posted.toISOString(), hoursAgo: hrs, niche: "",
      tags, confidence, budget, urgency: false,
      qualityScore: calcQuality({ description, tags, domain, title: job.title, budget }),
    }];
  });

  return { leads, raw: inWindow };
}

// Source 7: Public ATS feeds (Greenhouse, Lever, Ashby).
// These are public job-board APIs used by startups and software companies. They
// do not require scraping or user API keys, and are treated as generic verified
// hiring channels in the UI.

const GREENHOUSE_BOARDS = [
  { token: "webflow",    company: "Webflow" },
  { token: "stripe",     company: "Stripe" },
  { token: "figma",      company: "Figma" },
  { token: "twilio",     company: "Twilio" },
  { token: "asana",      company: "Asana" },
  { token: "cloudflare", company: "Cloudflare" },
  { token: "reddit",     company: "Reddit" },
  { token: "datadog",    company: "Datadog" },
];

const LEVER_BOARDS = [
  { token: "caseware",       company: "Caseware" },
  { token: "enveda",         company: "Enveda" },
  { token: "peerspace",      company: "Peerspace" },
  { token: "questanalytics", company: "Quest Analytics" },
  { token: "revinate",       company: "Revinate" },
];

const ASHBY_BOARDS = [
  { token: "linear",     company: "Linear" },
  { token: "modal",      company: "Modal" },
  { token: "perplexity", company: "Perplexity" },
  { token: "supabase",   company: "Supabase" },
  { token: "cursor",     company: "Cursor" },
  { token: "ramp",       company: "Ramp" },
];

interface GreenhouseJob {
  id?: number | string;
  absolute_url?: string;
  title?: string;
  company_name?: string;
  first_published?: string;
  updated_at?: string;
  content?: string;
  location?: { name?: string };
  departments?: { name?: string }[];
  offices?: { name?: string }[];
}
interface GreenhouseResponse { jobs?: GreenhouseJob[]; }

interface LeverJob {
  id?: string;
  text?: string;
  hostedUrl?: string;
  applyUrl?: string;
  createdAt?: number;
  descriptionPlain?: string;
  descriptionBodyPlain?: string;
  additionalPlain?: string;
  categories?: { team?: string; location?: string; commitment?: string };
  workplaceType?: string;
}

interface AshbyJob {
  id?: string;
  title?: string;
  department?: string;
  team?: string;
  employmentType?: string;
  location?: string;
  publishedAt?: string;
  isListed?: boolean;
  isRemote?: boolean;
  workplaceType?: string;
  jobUrl?: string;
  applyUrl?: string;
  descriptionPlain?: string;
  descriptionHtml?: string;
}
interface AshbyResponse { jobs?: AshbyJob[]; }

function parsePostedDate(...values: Array<string | number | undefined>): Date | null {
  for (const value of values) {
    if (!value) continue;
    const date = typeof value === "number" ? new Date(value) : new Date(value);
    if (!isNaN(date.getTime())) return date;
  }
  return null;
}

function atsQualityBoost(confidence: number, title: string, desc: string): number {
  const text = `${title} ${desc}`.toLowerCase();
  let boost = 0;
  if (/\b(remote|contract|freelance|consultant|part[-\s]?time)\b/i.test(text)) boost += 8;
  if (/\b(marketing|growth|website|web|design|developer|engineer|content|seo|paid social|facebook|instagram)\b/i.test(text)) boost += 4;
  return Math.min(100, confidence + boost);
}

async function fetchGreenhouseBoards(keywords: string[], maxHours: number, freshOnly: boolean): Promise<{ leads: AggregatedLead[]; raw: number }> {
  const results = await Promise.all(GREENHOUSE_BOARDS.map(async board => {
    try {
      const res = await withTimeout(
        fetch(`https://boards-api.greenhouse.io/v1/boards/${board.token}/jobs`, {
          headers: { "User-Agent": "iCloseLeads/5.0", "Accept": "application/json" },
          ...cacheOpts(freshOnly, 900),
        }),
        8000,
      );
      if (!res.ok) return { leads: [] as AggregatedLead[], raw: 0 };
      const data = await res.json() as GreenhouseResponse;
      const jobs = (data.jobs ?? []).slice(0, 80);
      let inWindow = 0;
      const leads = jobs.flatMap((job): AggregatedLead[] => {
        if (!job.title) return [];
        const posted = parsePostedDate(job.first_published, job.updated_at);
        if (!posted) return [];
        const hrs = hoursAgo(posted);
        if (hrs > maxHours) return [];
        const tags = [
          ...(job.departments ?? []).map(d => d.name ?? ""),
          ...(job.offices ?? []).map(o => o.name ?? ""),
          job.location?.name ?? "",
        ].filter(Boolean).slice(0, 8);
        const desc = stripHtml([job.content, job.location?.name, ...tags].filter(Boolean).join(" "));
        if (!hasRemoteSignal(job.title, desc, tags)) return [];
        inWindow++;
        const confidence = atsQualityBoost(scoreMatch(job.title, desc, tags, keywords), job.title, desc);
        if (confidence < SOURCE_FLOOR) return [];
        const budget  = extractBudget(desc);
        const urgency = detectUrgency(`${job.title} ${desc}`);
        const email   = extractEmail(desc);
        const company = (job.company_name || board.company).trim();
        const domain  = companyToDomain(company);
        const id      = String(job.id ?? job.absolute_url ?? Math.random());
        return [{
          id: `gh-${board.token}-${id}`,
          company, domain, email,
          title: job.title.trim(),
          description: truncate(desc || `${company} public job-board posting.`),
          url: job.absolute_url ?? `https://job-boards.greenhouse.io/${board.token}`,
          source: "greenhouse", sourceLabel: ALL_SOURCE_LABELS.greenhouse,
          postedAt: posted.toISOString(), hoursAgo: hrs, niche: "",
          tags, confidence, budget, urgency,
          qualityScore: calcQuality({ email, description: desc, tags, domain, title: job.title, budget, urgency }),
        }];
      });
      return { leads, raw: inWindow };
    } catch { return { leads: [] as AggregatedLead[], raw: 0 }; }
  }));
  return {
    leads: results.flatMap(r => r.leads),
    raw: results.reduce((sum, r) => sum + r.raw, 0),
  };
}

async function fetchLeverBoards(keywords: string[], maxHours: number, freshOnly: boolean): Promise<{ leads: AggregatedLead[]; raw: number }> {
  const results = await Promise.all(LEVER_BOARDS.map(async board => {
    try {
      const res = await withTimeout(
        fetch(`https://api.lever.co/v0/postings/${board.token}?mode=json`, {
          headers: { "User-Agent": "iCloseLeads/5.0", "Accept": "application/json" },
          ...cacheOpts(freshOnly, 900),
        }),
        8000,
      );
      if (!res.ok) return { leads: [] as AggregatedLead[], raw: 0 };
      const jobs = (await res.json() as LeverJob[]).slice(0, 80);
      let inWindow = 0;
      const leads = jobs.flatMap((job): AggregatedLead[] => {
        if (!job.text) return [];
        const posted = parsePostedDate(job.createdAt);
        if (!posted) return [];
        const hrs = hoursAgo(posted);
        if (hrs > maxHours) return [];
        const tags = [
          job.categories?.team ?? "",
          job.categories?.location ?? "",
          job.categories?.commitment ?? "",
          job.workplaceType ?? "",
        ].filter(Boolean).slice(0, 8);
        const desc = stripHtml([
          job.descriptionPlain,
          job.descriptionBodyPlain,
          job.additionalPlain,
          ...tags,
        ].filter(Boolean).join(" "));
        if (!hasRemoteSignal(job.text, desc, tags)) return [];
        inWindow++;
        const confidence = atsQualityBoost(scoreMatch(job.text, desc, tags, keywords), job.text, desc);
        if (confidence < SOURCE_FLOOR) return [];
        const budget  = extractBudget(desc);
        const urgency = detectUrgency(`${job.text} ${desc}`);
        const email   = extractEmail(desc);
        const domain  = companyToDomain(board.company);
        return [{
          id: `lever-${board.token}-${job.id ?? Math.random()}`,
          company: board.company, domain, email,
          title: job.text.trim(),
          description: truncate(desc || `${board.company} public job-board posting.`),
          url: job.hostedUrl ?? job.applyUrl ?? `https://jobs.lever.co/${board.token}`,
          source: "lever", sourceLabel: ALL_SOURCE_LABELS.lever,
          postedAt: posted.toISOString(), hoursAgo: hrs, niche: "",
          tags, confidence, budget, urgency,
          qualityScore: calcQuality({ email, description: desc, tags, domain, title: job.text, budget, urgency }),
        }];
      });
      return { leads, raw: inWindow };
    } catch { return { leads: [] as AggregatedLead[], raw: 0 }; }
  }));
  return {
    leads: results.flatMap(r => r.leads),
    raw: results.reduce((sum, r) => sum + r.raw, 0),
  };
}

async function fetchAshbyBoards(keywords: string[], maxHours: number, freshOnly: boolean): Promise<{ leads: AggregatedLead[]; raw: number }> {
  const results = await Promise.all(ASHBY_BOARDS.map(async board => {
    try {
      const res = await withTimeout(
        fetch(`https://api.ashbyhq.com/posting-api/job-board/${board.token}`, {
          headers: { "User-Agent": "iCloseLeads/5.0", "Accept": "application/json" },
          ...cacheOpts(freshOnly, 900),
        }),
        8000,
      );
      if (!res.ok) return { leads: [] as AggregatedLead[], raw: 0 };
      const data = await res.json() as AshbyResponse;
      const jobs = (data.jobs ?? []).filter(j => j.isListed !== false).slice(0, 80);
      let inWindow = 0;
      const leads = jobs.flatMap((job): AggregatedLead[] => {
        if (!job.title) return [];
        const posted = parsePostedDate(job.publishedAt);
        if (!posted) return [];
        const hrs = hoursAgo(posted);
        if (hrs > maxHours) return [];
        const tags = [
          job.department ?? "",
          job.team ?? "",
          job.employmentType ?? "",
          job.location ?? "",
          job.isRemote ? "remote" : "",
          job.workplaceType ?? "",
        ].filter(Boolean).slice(0, 8);
        const desc = stripHtml([job.descriptionPlain, job.descriptionHtml, ...tags].filter(Boolean).join(" "));
        if (!job.isRemote && !hasRemoteSignal(job.title, desc, tags)) return [];
        inWindow++;
        const confidence = atsQualityBoost(scoreMatch(job.title, desc, tags, keywords), job.title, desc);
        if (confidence < SOURCE_FLOOR) return [];
        const budget  = extractBudget(desc);
        const urgency = detectUrgency(`${job.title} ${desc}`);
        const email   = extractEmail(desc);
        const domain  = companyToDomain(board.company);
        return [{
          id: `ashby-${board.token}-${job.id ?? Math.random()}`,
          company: board.company, domain, email,
          title: job.title.trim(),
          description: truncate(desc || `${board.company} public job-board posting.`),
          url: job.jobUrl ?? job.applyUrl ?? `https://jobs.ashbyhq.com/${board.token}`,
          source: "ashby", sourceLabel: ALL_SOURCE_LABELS.ashby,
          postedAt: posted.toISOString(), hoursAgo: hrs, niche: "",
          tags, confidence, budget, urgency,
          qualityScore: calcQuality({ email, description: desc, tags, domain, title: job.title, budget, urgency }),
        }];
      });
      return { leads, raw: inWindow };
    } catch { return { leads: [] as AggregatedLead[], raw: 0 }; }
  }));
  return {
    leads: results.flatMap(r => r.leads),
    raw: results.reduce((sum, r) => sum + r.raw, 0),
  };
}

// ─── Source 4: WeWorkRemotely ─────────────────────────────────────────────────

function extractRSS(xml: string, tag: string): string {
  const m = xml.match(new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?</${tag}>`, "i"));
  return (m?.[1] ?? "").trim();
}

// WWR: fetch the general all-jobs feed PLUS a niche-specific category feed in parallel.
// This ensures we always get some results even when the category has low posting volume.
const WWR_CATEGORY_FEEDS: Record<string, string> = {
  "web-development":     "https://weworkremotely.com/categories/remote-programming-jobs.rss",
  "mobile-apps":         "https://weworkremotely.com/categories/remote-programming-jobs.rss",
  "wordpress":           "https://weworkremotely.com/categories/remote-programming-jobs.rss",
  "shopify":             "https://weworkremotely.com/categories/remote-programming-jobs.rss",
  "ui-ux-design":        "https://weworkremotely.com/categories/remote-design-jobs.rss",
  "graphic-design":      "https://weworkremotely.com/categories/remote-design-jobs.rss",
  "copywriting":         "https://weworkremotely.com/categories/remote-writing-jobs.rss",
  "seo":                 "https://weworkremotely.com/categories/remote-marketing-jobs.rss",
  "social-media":        "https://weworkremotely.com/categories/remote-marketing-jobs.rss",
  "email-marketing":     "https://weworkremotely.com/categories/remote-marketing-jobs.rss",
  "meta-ads":            "https://weworkremotely.com/categories/remote-marketing-jobs.rss",
  "data-science":        "https://weworkremotely.com/categories/remote-programming-jobs.rss",
  "devops":              "https://weworkremotely.com/categories/remote-devops-sysadmin-jobs.rss",
  "business-consulting": "https://weworkremotely.com/categories/remote-business-exec-management-jobs.rss",
};
const WWR_GENERAL = "https://weworkremotely.com/remote-jobs.rss";

async function fetchWWRFeed(feedUrl: string, keywords: string[], maxHours: number, freshOnly: boolean): Promise<AggregatedLead[]> {
  try {
    const res = await withTimeout(
      fetch(feedUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; iCloseLeads/5.0)",
          "Accept":     "application/rss+xml, text/xml, */*",
        },
        ...cacheOpts(freshOnly, 900),
      }),
      10000
    );
    if (!res.ok) return [];
    const xml   = await res.text();
    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)];
    const leads: AggregatedLead[] = [];

    for (const m of items) {
      const item    = m[1] ?? "";
      const title   = stripHtml(extractRSS(item, "title"));
      // WWR uses <link> but sometimes puts it after CDATA — also try <guid>
      let link = extractRSS(item, "link");
      if (!link) link = extractRSS(item, "guid");
      const pubDate = extractRSS(item, "pubDate");
      const desc    = extractRSS(item, "description");
      if (!title || !link) continue;
      const posted = new Date(pubDate);
      if (isNaN(posted.getTime())) continue;
      const hrs = hoursAgo(posted);
      if (hrs > maxHours) continue;
      const cleanDesc  = stripHtml(desc);
      const confidence = scoreMatch(title, cleanDesc, [], keywords);
      if (confidence < SOURCE_FLOOR) continue;

      let company = ""; let cleanTitle = title;
      const atMatch    = title.match(/^(.+?)\s+at\s+(.+?)(?:\s*[-|,]|$)/i);
      const colonMatch = title.match(/^(.+?):\s*(.+)$/);
      if (atMatch?.[2])  { cleanTitle = atMatch[1]?.trim() ?? title; company = atMatch[2].trim(); }
      else if (colonMatch?.[1] && colonMatch[1].length < 40) { company = colonMatch[1].trim(); cleanTitle = colonMatch[2]?.trim() ?? title; }
      if (!company) { const rm = item.match(/<region[^>]*>(?:<!\[CDATA\[)?(.+?)(?:\]\]>)?<\/region>/i); company = rm?.[1]?.trim() ?? ""; }
      if (!company) company = "Hiring Company";
      company = company.slice(0, 80);

      const budget  = extractBudget(cleanDesc);
      const urgency = detectUrgency(title + " " + cleanDesc);
      const email   = extractEmail(cleanDesc);
      const domain  = extractDomain(link) !== "weworkremotely.com" ? extractDomain(link) : companyToDomain(company);
      leads.push({
        id: `wwr-${link.split("/").pop()?.replace(/[^a-z0-9]/gi, "") ?? Math.random()}`,
        company, domain, email, title: cleanTitle || title, description: truncate(cleanDesc),
        url: link, source: "weworkremotely", sourceLabel: "WeWorkRemotely",
        postedAt: posted.toISOString(), hoursAgo: hrs, niche: "", tags: [], confidence, budget, urgency,
        qualityScore: calcQuality({ email, description: cleanDesc, domain, title, budget, urgency }),
      });
    }
    return leads;
  } catch { return []; }
}

async function fetchWeWorkRemotely(niche: string, keywords: string[], maxHours: number, freshOnly: boolean): Promise<{ leads: AggregatedLead[]; raw: number }> {
  const categoryFeed = WWR_CATEGORY_FEEDS[niche];
  // Always fetch general feed; additionally fetch category feed if available
  const feedUrls = categoryFeed && categoryFeed !== WWR_GENERAL
    ? [WWR_GENERAL, categoryFeed]
    : [WWR_GENERAL];

  const results = await Promise.all(feedUrls.map(url => fetchWWRFeed(url, keywords, maxHours, freshOnly)));
  const leads   = results.flat();
  return { leads, raw: leads.length };
}

// ─── Source 5: Arbeitnow ─────────────────────────────────────────────────────

interface ArbeitnowJob {
  slug?: string; company_name?: string; title?: string; description?: string;
  url?: string; tags?: string[]; created_at?: string | number;
  remote?: boolean; location?: string;
}
interface ArbeitnowResponse { data?: ArbeitnowJob[]; }

async function fetchArbeitnow(keywords: string[], maxHours: number, freshOnly: boolean): Promise<{ leads: AggregatedLead[]; raw: number }> {
  const res = await withTimeout(
    fetch("https://www.arbeitnow.com/api/job-board-api", {
      headers: { "User-Agent": "iCloseLeads/4.0", "Accept": "application/json" },
      ...cacheOpts(freshOnly, 900),
    }),
    9000
  );
  if (!res.ok) throw new Error(`Arbeitnow ${res.status}`);
  const data = await res.json() as ArbeitnowResponse;
  let inWindow = 0;
  const leads = (data.data ?? []).flatMap((job): AggregatedLead[] => {
    if (!job.title || !job.company_name) return [];
    if (job.remote !== true) return [];
    let posted: Date | null = null;
    if (job.created_at) {
      const v = typeof job.created_at === "number" ? new Date(job.created_at * 1000) : new Date(job.created_at);
      if (!isNaN(v.getTime())) posted = v;
    }
    if (!posted) return [];
    const hrs = hoursAgo(posted);
    if (hrs > maxHours) return [];
    inWindow++;
    const desc       = stripHtml(job.description ?? "");
    const tags       = [...(job.tags ?? []), job.location ?? "", "remote"].filter(Boolean).slice(0, 8);
    const confidence = scoreMatch(job.title, desc, tags, keywords);
    if (confidence < SOURCE_FLOOR) return [];
    const budget  = extractBudget(desc);
    const urgency = detectUrgency(job.title + " " + desc);
    const email   = extractEmail(desc);
    const domain  = companyToDomain(job.company_name);
    return [{
      id: `arb-${job.slug ?? Math.random()}`,
      company: job.company_name.trim(), domain, email, title: job.title.trim(),
      description: truncate(desc), url: job.url ?? "https://arbeitnow.com",
      source: "arbeitnow", sourceLabel: "Arbeitnow",
      postedAt: posted.toISOString(), hoursAgo: hrs, niche: "",
      tags, confidence, budget, urgency,
      qualityScore: calcQuality({ email, description: desc, tags, domain, title: job.title, budget, urgency }),
    }];
  });
  return { leads, raw: inWindow };
}

// ─── Source 6: RemoteJobs.org ─────────────────────────────────────────────────

interface RemoteJobsOrgJob {
  id?: string; title?: string; url?: string; apply_url?: string;
  company?: { name?: string; website?: string };
  category?: { name?: string; slug?: string };
  type?: string; description?: string; posted_at?: string;
  salary_text?: string | null;
}
interface RemoteJobsOrgResponse { data?: RemoteJobsOrgJob[]; }

async function fetchRemoteJobsOrg(niche: string, keywords: string[], maxHours: number, freshOnly: boolean): Promise<{ leads: AggregatedLead[]; raw: number }> {
  const categoryMap: Record<string, string> = {
    "web-development": "programming", "mobile-apps": "programming",
    "wordpress": "programming", "shopify": "programming",
    "ui-ux-design": "design", "graphic-design": "design",
    "copywriting": "writing", "technical-writing": "writing",
    "seo": "marketing", "social-media": "marketing", "email-marketing": "marketing", "meta-ads": "marketing",
    "data-science": "data-science", "devops": "devops",
    "business-consulting": "product-management",
  };
  const params = new URLSearchParams({ limit: "50" });
  const category = categoryMap[niche];
  if (category) params.set("category", category);
  else if (keywords[0]) params.set("q", keywords[0]);

  const res = await withTimeout(
    fetch(`https://remotejobs.org/api/v1/jobs?${params.toString()}`, {
      headers: { "User-Agent": "iCloseLeads/6.0", "Accept": "application/json" },
      ...cacheOpts(freshOnly, 900),
    }),
    9000,
  );
  if (!res.ok) throw new Error(`RemoteJobs.org ${res.status}`);
  const data = await res.json() as RemoteJobsOrgResponse;
  let inWindow = 0;
  const leads = (data.data ?? []).flatMap((job): AggregatedLead[] => {
    if (!job.title || !job.company?.name) return [];
    const posted = job.posted_at ? new Date(job.posted_at) : null;
    if (!posted || isNaN(posted.getTime())) return [];
    const hrs = hoursAgo(posted);
    if (hrs > maxHours) return [];
    inWindow++;
    const desc = stripHtml(job.description ?? "");
    const tags = [job.category?.name ?? "", job.type ?? ""].filter(Boolean);
    const confidence = scoreMatch(job.title, desc, tags, keywords);
    if (confidence < SOURCE_FLOOR) return [];
    const budget = job.salary_text ?? extractBudget(desc);
    const urgency = detectUrgency(`${job.title} ${desc}`);
    const email = extractEmail(desc);
    const domain = job.company.website ? extractDomain(job.company.website) : companyToDomain(job.company.name);
    return [{
      id: `rjo-${job.id ?? Math.random()}`,
      company: job.company.name.trim(), domain, email, title: job.title.trim(),
      description: truncate(desc), url: job.apply_url ?? job.url ?? "https://remotejobs.org",
      source: "remotejobsorg", sourceLabel: "RemoteJobs.org",
      postedAt: posted.toISOString(), hoursAgo: hrs, niche: "",
      tags: tags.slice(0, 8), confidence, budget: budget ?? undefined, urgency,
      qualityScore: calcQuality({ email, description: desc, tags, domain, title: job.title, budget: budget ?? undefined, urgency }),
    }];
  });
  return { leads, raw: inWindow };
}

// ─── Source 7: Jobicy ─────────────────────────────────────────────────────────
// Uses browser-like headers to bypass Cloudflare. Falls back to their RSS feed
// if the JSON API returns a 4xx (common from Vercel/serverless IPs).

interface JobicyJob {
  id?: number; jobTitle?: string; companyName?: string; jobIndustry?: string[];
  jobExcerpt?: string; jobDescription?: string; jobSlug?: string; url?: string; pubDate?: string;
}
interface JobicyResponse { jobs?: JobicyJob[]; }

async function fetchJobicy(keywords: string[], maxHours: number, freshOnly: boolean): Promise<{ leads: AggregatedLead[]; raw: number }> {
  const BROWSER_UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

  // ── Try JSON API first ────────────────────────────────────────────────────
  try {
    const res = await withTimeout(
      fetch("https://jobicy.com/api/v2/remote-jobs?count=100", {
        headers: {
          "User-Agent": BROWSER_UA,
          "Accept":     "application/json, text/plain, */*",
          "Referer":    "https://jobicy.com/",
          "Origin":     "https://jobicy.com",
        },
        ...cacheOpts(freshOnly, 900),
      }),
      9000
    );
    if (res.ok) {
      const data = await res.json() as JobicyResponse;
      let inWindow = 0;
      const leads = (data.jobs ?? []).flatMap((job): AggregatedLead[] => {
        if (!job.jobTitle || !job.companyName) return [];
        const posted = job.pubDate ? new Date(job.pubDate) : null;
        if (!posted || isNaN(posted.getTime())) return [];
        const hrs = hoursAgo(posted);
        if (hrs > maxHours) return [];
        inWindow++;
        const desc       = stripHtml(job.jobDescription ?? job.jobExcerpt ?? "");
        const confidence = scoreMatch(job.jobTitle, desc, job.jobIndustry ?? [], keywords);
        if (confidence < SOURCE_FLOOR) return [];
        const budget  = extractBudget(desc);
        const urgency = detectUrgency(job.jobTitle + " " + desc);
        const email   = extractEmail(desc);
        const domain  = companyToDomain(job.companyName);
        const url     = job.url ?? (job.jobSlug ? `https://jobicy.com/jobs/${job.jobSlug}` : "https://jobicy.com");
        return [{
          id: `jobicy-${job.id ?? Math.random()}`,
          company: job.companyName.trim(), domain, email, title: job.jobTitle.trim(),
          description: truncate(desc), url,
          source: "jobicy", sourceLabel: "Jobicy",
          postedAt: posted.toISOString(), hoursAgo: hrs, niche: "",
          tags: (job.jobIndustry ?? []).slice(0, 8), confidence, budget, urgency,
          qualityScore: calcQuality({ email, description: desc, tags: job.jobIndustry, domain, title: job.jobTitle, budget, urgency }),
        }];
      });
      return { leads, raw: inWindow };
    }
    // Fall through to RSS fallback on non-2xx
  } catch { /* fall through to RSS */ }

  // ── RSS fallback (WordPress feed — more permissive on bot IPs) ────────────
  try {
    const res = await withTimeout(
      fetch("https://jobicy.com/feed/", {
        headers: { "User-Agent": BROWSER_UA, "Accept": "application/rss+xml, text/xml, */*" },
        ...cacheOpts(freshOnly, 1800),
      }),
      9000
    );
    if (!res.ok) throw new Error(`Jobicy RSS ${res.status}`);
    const xml   = await res.text();
    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)];
    const leads: AggregatedLead[] = [];
    let inWindow = 0;
    for (const m of items) {
      const item    = m[1] ?? "";
      const title   = stripHtml(extractRSS(item, "title"));
      const link    = extractRSS(item, "link");
      const pubDate = extractRSS(item, "pubDate");
      const desc    = extractRSS(item, "description") || extractRSS(item, "content:encoded");
      if (!title || !link) continue;
      const posted = new Date(pubDate);
      if (isNaN(posted.getTime())) continue;
      const hrs = hoursAgo(posted);
      if (hrs > maxHours) continue;
      inWindow++;
      const cleanDesc  = stripHtml(desc);
      const confidence = scoreMatch(title, cleanDesc, [], keywords);
      if (confidence < SOURCE_FLOOR) continue;
      let company = ""; let cleanTitle = title;
      const atMatch = title.match(/^(.+?)\s+at\s+(.+?)(?:\s*[-|,]|$)/i);
      if (atMatch?.[2]) { cleanTitle = atMatch[1]?.trim() ?? title; company = atMatch[2].trim(); }
      if (!company) company = "Jobicy Posting";
      const budget  = extractBudget(cleanDesc);
      const urgency = detectUrgency(title + " " + cleanDesc);
      const email   = extractEmail(cleanDesc);
      const domain  = companyToDomain(company);
      leads.push({
        id: `jobicy-rss-${link.split("/").filter(Boolean).pop() ?? Math.random()}`,
        company: company.slice(0, 80), domain, email, title: cleanTitle || title,
        description: truncate(cleanDesc), url: link,
        source: "jobicy", sourceLabel: "Jobicy",
        postedAt: posted.toISOString(), hoursAgo: hrs, niche: "", tags: [],
        confidence, budget, urgency,
        qualityScore: calcQuality({ email, description: cleanDesc, domain, title, budget, urgency }),
      });
    }
    return { leads, raw: inWindow };
  } catch (err) {
    throw new Error(`Jobicy (all endpoints) ${err instanceof Error ? err.message : "failed"}`);
  }
}

// ─── Source 7: Working Nomads ─────────────────────────────────────────────────

interface WNJob {
  id?: string; title?: string; company_name?: string; company?: string;
  url?: string; description?: string; category_name?: string; category?: string;
  tags?: string; pub_date?: string; pubDate?: string;
}

async function fetchWorkingNomads(keywords: string[], maxHours: number, freshOnly: boolean): Promise<{ leads: AggregatedLead[]; raw: number }> {
  const res = await withTimeout(
    fetch("https://www.workingnomads.com/api/exposed_jobs/?limit=100", {
      headers: { "User-Agent": "iCloseLeads/4.0", "Accept": "application/json" },
      ...cacheOpts(freshOnly, 900),
    }),
    8000
  );
  if (!res.ok) throw new Error(`WorkingNomads ${res.status}`);
  const data = await res.json() as WNJob[] | { results?: WNJob[] };
  const list: WNJob[] = Array.isArray(data) ? data : (data.results ?? []);
  let inWindow = 0;
  const leads = list.flatMap((job): AggregatedLead[] => {
    const company = job.company_name ?? job.company ?? "";
    if (!job.title || !company) return [];
    const dateStr = job.pub_date ?? job.pubDate;
    const posted  = dateStr ? new Date(dateStr) : null;
    if (!posted || isNaN(posted.getTime())) return [];
    const hrs = hoursAgo(posted);
    if (hrs > maxHours) return [];
    inWindow++;
    const desc       = stripHtml(job.description ?? "");
    const cat        = job.category_name ?? job.category ?? "";
    const confidence = scoreMatch(job.title, desc, [cat], keywords);
    if (confidence < SOURCE_FLOOR) return [];
    const budget  = extractBudget(desc);
    const urgency = detectUrgency(job.title + " " + desc);
    const email   = extractEmail(desc);
    const domain  = job.url ? extractDomain(job.url) : companyToDomain(company);
    const tags    = (job.tags ?? "").split(",").map(t => t.trim()).filter(Boolean).slice(0, 8);
    return [{
      id: `wn-${job.id ?? Math.random()}`,
      company: company.trim(), domain, email, title: job.title.trim(),
      description: truncate(desc), url: job.url ?? "https://www.workingnomads.com",
      source: "workingnomads", sourceLabel: "Working Nomads",
      postedAt: posted.toISOString(), hoursAgo: hrs, niche: "",
      tags: tags.length > 0 ? tags : (cat ? [cat] : []), confidence, budget, urgency,
      qualityScore: calcQuality({ email, description: desc, tags, domain, title: job.title, budget, urgency }),
    }];
  });
  return { leads, raw: inWindow };
}

// ─── Source 8: HackerNews ─────────────────────────────────────────────────────

interface HNHit { objectID?: string; title?: string; }
interface HNSearchResponse { hits?: HNHit[]; }
interface HNComment { id: number; type: string; text?: string; author?: string; created_at_i?: number; children?: HNComment[]; }

async function fetchHackerNews(keywords: string[], maxHours: number, freshOnly: boolean): Promise<{ leads: AggregatedLead[]; raw: number }> {
  const search = await withTimeout(
    fetch("https://hn.algolia.com/api/v1/search?query=Ask%20HN%20hiring%20OR%20freelancer&tags=story&hitsPerPage=10", {
      headers: { "User-Agent": "iCloseLeads/4.0" }, ...cacheOpts(freshOnly, 1800),
    }),
    8000
  );
  if (!search.ok) throw new Error(`HN search ${search.status}`);
  const sdata = await search.json() as HNSearchResponse;
  const matches = (sdata.hits ?? []).filter(h =>
    h.title && /\b(who\s+is\s+hiring|seeking\s+freelancer|freelancer\?)\b/i.test(h.title)
  );
  if (matches.length === 0) return { leads: [], raw: 0 };
  const threadId = matches[0]!.objectID;
  if (!threadId) return { leads: [], raw: 0 };

  const tres = await withTimeout(
    fetch(`https://hn.algolia.com/api/v1/items/${threadId}`, {
      headers: { "User-Agent": "iCloseLeads/4.0" }, ...cacheOpts(freshOnly, 900),
    }),
    8000
  );
  if (!tres.ok) throw new Error(`HN thread ${tres.status}`);
  const thread = await tres.json() as HNComment;

  const leads: AggregatedLead[] = [];
  let inWindow = 0;
  const isFreelancerThread = matches[0]?.title ? /freelancer/i.test(matches[0].title) : false;

  for (const c of thread.children ?? []) {
    if (c.type !== "comment" || !c.text || !c.created_at_i) continue;
    const posted = new Date(c.created_at_i * 1000);
    const hrs    = hoursAgo(posted);
    if (hrs > maxHours) continue;
    const text = stripHtml(c.text);
    if (text.length < 40) continue;
    if (isFreelancerThread && /seeking\s*work/i.test(text) && !/seeking\s*freelancer/i.test(text)) continue;
    if (!hasRemoteSignal(text)) continue;
    inWindow++;
    const confidence = scoreMatch(text.slice(0, 120), text, [], keywords);
    if (confidence < SOURCE_FLOOR) continue;

    let company = "";
    const capMatch = text.match(/\b([A-Z][A-Za-z0-9&]{1,30}(?:\s+[A-Z][A-Za-z0-9&]{1,30}){0,3})\b/);
    if (capMatch?.[1]) company = capMatch[1].trim();
    if (!company) company = text.slice(0, 60).trim().replace(/[|–—-].*$/, "").trim();
    if (!company) company = `HN poster${c.author ? ` (${c.author})` : ""}`;
    company = company.slice(0, 80);

    const budget  = extractBudget(text);
    const urgency = detectUrgency(text);
    const email   = extractEmail(text);
    const domain  = email ? (email.split("@")[1] ?? "news.ycombinator.com") : "news.ycombinator.com";
    const firstLine = text.split(/[\n.|]/)[0]?.trim() ?? text.slice(0, 100);

    leads.push({
      id: `hn-${c.id}`,
      company, domain, email,
      title: firstLine.slice(0, 140) || "Hacker News hiring post",
      description: truncate(text, 360),
      url: `https://news.ycombinator.com/item?id=${c.id}`,
      source: "hackernews", sourceLabel: isFreelancerThread ? "HN Freelancer" : "HN Who's Hiring",
      postedAt: posted.toISOString(), hoursAgo: hrs, niche: "", tags: [], confidence, budget, urgency,
      qualityScore: calcQuality({ email, description: text, domain, title: firstLine, budget, urgency }),
    });
  }
  return { leads, raw: inWindow };
}

// ─── Source 9: YC / HN Jobs (HN Firebase API) ────────────────────────────────
// Uses the official HN Firebase API (hacker-news.firebaseio.com) which is 100%
// reliable from any IP. Fetches the current "job stories" list — real startup
// job postings made directly on Hacker News by YC-backed companies.

interface HNItem {
  id: number; type?: string; title?: string; text?: string;
  url?: string; time?: number; by?: string;
}

async function fetchYCJobs(keywords: string[], maxHours: number, freshOnly: boolean): Promise<{ leads: AggregatedLead[]; raw: number }> {
  // Step 1: Get the list of current job story IDs (returns ~200 most recent)
  const idsRes = await withTimeout(
    fetch("https://hacker-news.firebaseio.com/v0/jobstories.json", {
      headers: { "User-Agent": "iCloseLeads/5.0" },
      ...cacheOpts(freshOnly, 1800),
    }),
    9000
  );
  if (!idsRes.ok) throw new Error(`HN jobstories ${idsRes.status}`);
  const ids = await idsRes.json() as number[];
  if (!Array.isArray(ids) || ids.length === 0) return { leads: [], raw: 0 };

  // Step 2: Fetch the first 40 items in parallel (plenty for 48h window)
  const itemResults = await Promise.all(
    ids.slice(0, 40).map(async id => {
      try {
        const r = await withTimeout(
          fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`, {
            headers: { "User-Agent": "iCloseLeads/5.0" },
            ...cacheOpts(freshOnly, 1800),
          }),
          6000
        );
        return r.ok ? (await r.json() as HNItem) : null;
      } catch { return null; }
    })
  );

  const leads: AggregatedLead[] = [];
  let inWindow = 0;

  for (const item of itemResults) {
    if (!item || item.type !== "job" || !item.title || !item.time) continue;
    const posted = new Date(item.time * 1000);
    const hrs    = hoursAgo(posted);
    if (hrs > maxHours) continue;

    const body       = stripHtml(item.text ?? "");
    if (!hasRemoteSignal(item.title, body)) continue;
    inWindow++;
    const baseConfidence = scoreMatch(item.title, body, [], keywords);
    const confidence = baseConfidence > 0 ? Math.min(100, baseConfidence + 10) : 0;
    if (confidence < SOURCE_FLOOR) continue;

    // Parse company from title: "Company (YC S24) is hiring a Role"
    let company = ""; let cleanTitle = item.title;
    const ycMatch = item.title.match(/^(.+?)\s+\(YC\s+\w+\)\s+is\s+hiring/i);
    const hireM   = item.title.match(/^(.+?)\s+is\s+hiring/i);
    const atMatch = item.title.match(/^(.+?)\s+at\s+(.+?)(?:\s*[-|,]|$)/i);
    if      (ycMatch?.[1]) { company = ycMatch[1].trim(); cleanTitle = item.title.replace(ycMatch[0], "").trim() || item.title; }
    else if (hireM?.[1])   { company = hireM[1].trim();   cleanTitle = item.title.replace(hireM[0], "").trim()   || item.title; }
    else if (atMatch?.[2]) { cleanTitle = atMatch[1]?.trim() ?? item.title; company = atMatch[2].trim(); }
    if (!company) company = item.by ?? "YC Startup";
    company = company.slice(0, 80);

    const budget  = extractBudget(item.title + " " + body);
    const urgency = detectUrgency(item.title + " " + body);
    const email   = extractEmail(body);
    const url     = item.url ?? `https://news.ycombinator.com/item?id=${item.id}`;
    const domain  = item.url ? extractDomain(item.url) : companyToDomain(company);

    leads.push({
      id: `yc-${item.id}`,
      company, domain, email,
      title: cleanTitle || item.title,
      description: truncate(body || "YC startup job listing — view the full thread on Hacker News."),
      url, source: "ycjobs", sourceLabel: "YC Jobs",
      postedAt: posted.toISOString(), hoursAgo: hrs, niche: "",
      tags: ["startup", "YC"], confidence, budget, urgency,
      qualityScore: calcQuality({ email, description: body, domain, title: item.title, budget, urgency }),
    });
  }
  return { leads, raw: inWindow };
}

// ─── Source 10: Authentic Jobs (replaces Craigslist) ─────────────────────────
// authenticjobs.com — curated web/design/tech jobs, WordPress RSS, small site
// that doesn't block serverless IPs like Craigslist does.

async function fetchAuthenticJobs(keywords: string[], maxHours: number, freshOnly: boolean): Promise<{ leads: AggregatedLead[]; raw: number }> {
  const res = await withTimeout(
    fetch("https://authenticjobs.com/feed/", {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; iCloseLeads/5.0)",
        "Accept":     "application/rss+xml, text/xml, */*",
      },
      ...cacheOpts(freshOnly, 1800),
    }),
    10000
  );
  if (!res.ok) throw new Error(`AuthenticJobs ${res.status}`);
  const xml   = await res.text();
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)];
  const leads: AggregatedLead[] = [];
  let inWindow = 0;

  for (const m of items) {
    const item    = m[1] ?? "";
    const title   = stripHtml(extractRSS(item, "title"));
    const link    = extractRSS(item, "link") || extractRSS(item, "guid");
    const pubDate = extractRSS(item, "pubDate");
    const desc    = extractRSS(item, "description") || extractRSS(item, "content:encoded");
    if (!title || !link) continue;
    const posted = new Date(pubDate);
    if (isNaN(posted.getTime())) continue;
    const hrs = hoursAgo(posted);
    if (hrs > maxHours) continue;
    const cleanDesc  = stripHtml(desc);
    if (!hasRemoteSignal(title, cleanDesc)) continue;
    inWindow++;
    const confidence = scoreMatch(title, cleanDesc, [], keywords);
    if (confidence < SOURCE_FLOOR) continue;

    let company = ""; let cleanTitle = title;
    const atMatch = title.match(/^(.+?)\s+at\s+(.+?)(?:\s*[-|,]|$)/i);
    if (atMatch?.[2]) { cleanTitle = atMatch[1]?.trim() ?? title; company = atMatch[2].trim(); }
    if (!company) {
      const catM = item.match(/<category[^>]*>(?:<!\[CDATA\[)?(.+?)(?:\]\]>)?<\/category>/i);
      company = catM?.[1]?.trim() ?? "Authentic Jobs";
    }
    company = company.slice(0, 80);

    const budget  = extractBudget(cleanDesc);
    const urgency = detectUrgency(title + " " + cleanDesc);
    const email   = extractEmail(cleanDesc);
    const domain  = extractDomain(link) !== "authenticjobs.com" ? extractDomain(link) : companyToDomain(company);

    leads.push({
      id: `aj-${link.split("/").filter(Boolean).pop() ?? Math.random()}`,
      company, domain, email, title: cleanTitle || title,
      description: truncate(cleanDesc),
      url: link, source: "authenticjobs", sourceLabel: "Authentic Jobs",
      postedAt: posted.toISOString(), hoursAgo: hrs, niche: "",
      tags: ["web", "design", "tech"], confidence, budget, urgency,
      qualityScore: calcQuality({ email, description: cleanDesc, domain, title, budget, urgency }),
    });
  }
  return { leads, raw: inWindow };
}

// ─── Source 11: GitHub Bounties ───────────────────────────────────────────────

interface GHIssue {
  id?: number; title?: string; body?: string | null; html_url?: string;
  created_at?: string; labels?: { name?: string }[];
  repository_url?: string; user?: { login?: string };
}
interface GHSearchResponse { items?: GHIssue[]; }

async function fetchGitHubBounties(keywords: string[], maxHours: number, freshOnly: boolean): Promise<{ leads: AggregatedLead[]; raw: number }> {
  const ghHeaders: Record<string, string> = {
    "User-Agent": "iCloseLeads/4.0",
    "Accept":     "application/vnd.github.v3+json",
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) ghHeaders["Authorization"] = `token ${token}`;

  const q   = encodeURIComponent("label:bounty is:open is:issue");
  const url = `https://api.github.com/search/issues?q=${q}&sort=created&order=desc&per_page=50`;

  const res = await withTimeout(
    fetch(url, { headers: ghHeaders, ...cacheOpts(freshOnly, 1800) }),
    9000
  );
  if (!res.ok) throw new Error(`GitHub ${res.status}`);
  const data = await res.json() as GHSearchResponse;

  let inWindow = 0;
  const leads = (data.items ?? []).flatMap((issue): AggregatedLead[] => {
    if (!issue.title || !issue.html_url) return [];
    const posted = issue.created_at ? new Date(issue.created_at) : null;
    if (!posted || isNaN(posted.getTime())) return [];
    const hrs = hoursAgo(posted);
    if (hrs > maxHours) return [];
    inWindow++;

    const body      = issue.body ?? "";
    const fullText  = issue.title + " " + body;
    const confidence = scoreMatch(issue.title, body, [], keywords);
    if (confidence < SOURCE_FLOOR) return [];

    const repoParts = (issue.repository_url ?? "").split("/");
    const org   = repoParts[repoParts.length - 2] ?? "";
    const repo  = repoParts[repoParts.length - 1] ?? "";
    const company = org ? `${org}/${repo}` : (issue.user?.login ?? "GitHub Project");
    const labelNames = (issue.labels ?? []).map(l => l.name ?? "").filter(Boolean);

    const budget  = extractBudget(fullText);
    const urgency = detectUrgency(fullText);
    const email   = extractEmail(body);
    const domain  = org ? `github.com/${org}` : "github.com";

    return [{
      id: `gh-${issue.id ?? Math.random()}`,
      company, domain, email,
      title: issue.title.slice(0, 200),
      description: truncate(body || "Open GitHub issue with bounty — see thread for details.", 360),
      url: issue.html_url,
      source: "githubissues", sourceLabel: "GitHub Bounties",
      postedAt: posted.toISOString(), hoursAgo: hrs, niche: "",
      tags: labelNames.slice(0, 8), confidence, budget, urgency,
      qualityScore: calcQuality({ email, description: body, domain: "github.com", title: issue.title, budget, urgency }),
    }];
  });
  return { leads, raw: inWindow };
}

// ─── Source 11b: Jobspresso (RSS) ────────────────────────────────────────────
// jobspresso.co — curated remote jobs board, WordPress RSS, no WAF issues from
// serverless IPs. Replaces freelancermap.com (wrong/blocked URL from Vercel).

async function fetchFreelancermap(keywords: string[], maxHours: number, freshOnly: boolean): Promise<{ leads: AggregatedLead[]; raw: number }> {
  const res = await withTimeout(
    fetch("https://jobspresso.co/feed/", {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; iCloseLeads/5.0)",
        "Accept":     "application/rss+xml, text/xml, */*",
      },
      ...cacheOpts(freshOnly, 1800),
    }),
    10000
  );
  if (!res.ok) throw new Error(`Jobspresso ${res.status}`);
  const xml   = await res.text();
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)];
  const leads: AggregatedLead[] = [];
  let inWindow = 0;

  for (const m of items) {
    const item    = m[1] ?? "";
    const title   = stripHtml(extractRSS(item, "title"));
    const link    = extractRSS(item, "link") || extractRSS(item, "guid");
    const pubDate = extractRSS(item, "pubDate");
    const desc    = extractRSS(item, "description") || extractRSS(item, "content:encoded");
    if (!title || !link) continue;
    const posted = new Date(pubDate);
    if (isNaN(posted.getTime())) continue;
    const hrs = hoursAgo(posted);
    if (hrs > maxHours) continue;
    inWindow++;
    const cleanDesc  = stripHtml(desc);
    const confidence = scoreMatch(title, cleanDesc, [], keywords);
    if (confidence < SOURCE_FLOOR) continue;

    // Title format: "Role at Company" or "Company – Role"
    let company = ""; let cleanTitle = title;
    const atMatch   = title.match(/^(.+?)\s+at\s+(.+?)(?:\s*[-|,]|$)/i);
    const dashMatch = title.match(/^(.+?)\s*[—–-]\s*(.+)$/);
    if (atMatch?.[2])   { cleanTitle = atMatch[1]?.trim() ?? title; company = atMatch[2].trim(); }
    else if (dashMatch) { company = dashMatch[1]?.trim() ?? ""; cleanTitle = dashMatch[2]?.trim() ?? title; }
    if (!company) {
      const catM = item.match(/<category[^>]*>(?:<!\[CDATA\[)?(.+?)(?:\]\]>)?<\/category>/i);
      company = catM?.[1]?.trim() ?? "Jobspresso";
    }
    company = company.slice(0, 80);

    const budget  = extractBudget(title + " " + cleanDesc);
    const urgency = detectUrgency(title + " " + cleanDesc);
    const email   = extractEmail(cleanDesc);
    const domain  = extractDomain(link) !== "jobspresso.co" ? extractDomain(link) : companyToDomain(company);
    const slug    = link.split("/").filter(Boolean).pop() ?? Math.random().toString(36).slice(2);

    leads.push({
      id: `jp-${slug}`,
      company, domain, email,
      title: cleanTitle || title,
      description: truncate(cleanDesc || "Remote job listing — click to view full details."),
      url: link, source: "freelancermap", sourceLabel: "Jobspresso",
      postedAt: posted.toISOString(), hoursAgo: hrs, niche: "",
      tags: ["remote", "curated"], confidence, budget, urgency,
      qualityScore: calcQuality({ email, description: cleanDesc, domain, title, budget, urgency }),
    });
  }
  return { leads, raw: inWindow };
}

// ─── Source 12: Smashing Magazine Jobs (RSS) ──────────────────────────────────

async function fetchSmashingJobs(keywords: string[], maxHours: number, freshOnly: boolean): Promise<{ leads: AggregatedLead[]; raw: number }> {
  const res = await withTimeout(
    fetch("https://jobs.smashingmagazine.com/feed/", {
      headers: { "User-Agent": "iCloseLeads/5.0", "Accept": "application/rss+xml, text/xml, */*" },
      ...cacheOpts(freshOnly, 1800),
    }),
    10000
  );
  if (!res.ok) throw new Error(`SmashingJobs ${res.status}`);
  const xml   = await res.text();
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)];
  const leads: AggregatedLead[] = [];
  let inWindow = 0;

  for (const m of items) {
    const item    = m[1] ?? "";
    const title   = stripHtml(extractRSS(item, "title"));
    const link    = extractRSS(item, "link");
    const pubDate = extractRSS(item, "pubDate");
    const desc    = extractRSS(item, "description") || extractRSS(item, "content:encoded");
    if (!title || !link) continue;
    const posted = new Date(pubDate);
    if (isNaN(posted.getTime())) continue;
    const hrs = hoursAgo(posted);
    if (hrs > maxHours) continue;
    inWindow++;
    const cleanDesc  = stripHtml(desc);
    const confidence = scoreMatch(title, cleanDesc, [], keywords);
    if (confidence < SOURCE_FLOOR) continue;

    // Title format is usually "Role at Company" or "Company — Role"
    let company = ""; let cleanTitle = title;
    const atMatch   = title.match(/^(.+?)\s+at\s+(.+?)(?:\s*[-|,]|$)/i);
    const dashMatch = title.match(/^(.+?)\s*[—–-]\s*(.+)$/);
    if (atMatch?.[2])   { cleanTitle = atMatch[1]?.trim() ?? title;   company = atMatch[2].trim(); }
    else if (dashMatch) { company = dashMatch[1]?.trim() ?? ""; cleanTitle = dashMatch[2]?.trim() ?? title; }
    if (!company) {
      const cat = item.match(/<category[^>]*>(?:<!\[CDATA\[)?(.+?)(?:\]\]>)?<\/category>/i)?.[1]?.trim();
      company = cat ?? "Smashing Jobs";
    }
    company = company.slice(0, 80);

    const budget  = extractBudget(cleanDesc);
    const urgency = detectUrgency(title + " " + cleanDesc);
    const email   = extractEmail(cleanDesc);
    const domain  = extractDomain(link) !== "jobs.smashingmagazine.com" ? extractDomain(link) : companyToDomain(company);
    const slug    = link.split("/").filter(Boolean).pop() ?? Math.random().toString(36).slice(2);

    leads.push({
      id: `smashing-${slug}`,
      company, domain, email, title: cleanTitle || title,
      description: truncate(cleanDesc),
      url: link, source: "smashingjobs", sourceLabel: "Smashing Jobs",
      postedAt: posted.toISOString(), hoursAgo: hrs, niche: "",
      tags: ["design", "web"], confidence, budget, urgency,
      qualityScore: calcQuality({ email, description: cleanDesc, domain, title, budget, urgency }),
    });
  }
  return { leads, raw: inWindow };
}

// ─── Source 13: Dribbble Jobs (RSS) ──────────────────────────────────────────

async function fetchDribbbleJobs(keywords: string[], maxHours: number, freshOnly: boolean): Promise<{ leads: AggregatedLead[]; raw: number }> {
  const res = await withTimeout(
    fetch("https://dribbble.com/jobs.rss", {
      headers: { "User-Agent": "iCloseLeads/5.0", "Accept": "application/rss+xml, text/xml, */*" },
      ...cacheOpts(freshOnly, 1800),
    }),
    10000
  );
  if (!res.ok) throw new Error(`Dribbble ${res.status}`);
  const xml   = await res.text();
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)];
  const leads: AggregatedLead[] = [];
  let inWindow = 0;

  for (const m of items) {
    const item    = m[1] ?? "";
    const title   = stripHtml(extractRSS(item, "title"));
    const link    = extractRSS(item, "link");
    const pubDate = extractRSS(item, "pubDate");
    const desc    = extractRSS(item, "description") || extractRSS(item, "content:encoded");
    if (!title || !link) continue;
    const posted = new Date(pubDate);
    if (isNaN(posted.getTime())) continue;
    const hrs = hoursAgo(posted);
    if (hrs > maxHours) continue;
    const cleanDesc  = stripHtml(desc);
    if (!hasRemoteSignal(title, cleanDesc)) continue;
    inWindow++;
    const confidence = scoreMatch(title, cleanDesc, [], keywords);
    if (confidence < SOURCE_FLOOR) continue;

    // Dribbble title format: "Role at Company" or just "Role — Company"
    let company = ""; let cleanTitle = title;
    const atMatch   = title.match(/^(.+?)\s+at\s+(.+?)(?:\s*[-|,]|$)/i);
    const dashMatch = title.match(/^(.+?)\s*[—–-]\s*(.+)$/);
    if (atMatch?.[2])   { cleanTitle = atMatch[1]?.trim() ?? title; company = atMatch[2].trim(); }
    else if (dashMatch) { company = dashMatch[2]?.trim() ?? ""; cleanTitle = dashMatch[1]?.trim() ?? title; }
    if (!company) company = "Dribbble Company";
    company = company.slice(0, 80);

    const budget  = extractBudget(cleanDesc);
    const urgency = detectUrgency(title + " " + cleanDesc);
    const email   = extractEmail(cleanDesc);
    const domain  = companyToDomain(company);
    const slug    = link.split("/").filter(Boolean).pop() ?? Math.random().toString(36).slice(2);

    leads.push({
      id: `dribbble-${slug}`,
      company, domain, email, title: cleanTitle || title,
      description: truncate(cleanDesc),
      url: link, source: "dribbble", sourceLabel: "Dribbble Jobs",
      postedAt: posted.toISOString(), hoursAgo: hrs, niche: "",
      tags: ["design", "ui-ux"], confidence, budget, urgency,
      qualityScore: calcQuality({ email, description: cleanDesc, domain, title, budget, urgency }),
    });
  }
  return { leads, raw: inWindow };
}

// ─── Source 15: Himalayas App (JSON) ─────────────────────────────────────────
// himalayas.app — curated startup/remote jobs board with open JSON API.

interface HimalayasJob {
  title?: string; excerpt?: string; companyName?: string; companySlug?: string;
  description?: string; pubDate?: string | number; applicationLink?: string; guid?: string;
  categories?: string[]; parentCategories?: string[]; employmentType?: string;
  minSalary?: number | null; maxSalary?: number | null; currency?: string | null; salaryPeriod?: string | null;
}
interface HimalayasResponse { jobs?: HimalayasJob[]; }

async function fetchHimalayas(niche: string, keywords: string[], maxHours: number, freshOnly: boolean): Promise<{ leads: AggregatedLead[]; raw: number }> {
  const queryMap: Record<string, string> = {
    "web-development": "web developer", "mobile-apps": "mobile developer",
    "ui-ux-design": "product designer", "graphic-design": "graphic designer",
    "copywriting": "copywriter", "seo": "seo", "social-media": "social media",
    "email-marketing": "email marketing", "meta-ads": "paid social",
    "data-science": "data analyst", "devops": "devops", "wordpress": "wordpress",
    "shopify": "shopify", "business-consulting": "business operations",
  };
  const params = new URLSearchParams({
    q: queryMap[niche] ?? keywords[0] ?? "remote",
    sort: "recent",
    page: "1",
  });
  const res = await withTimeout(
    fetch(`https://himalayas.app/jobs/api/search?${params.toString()}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; iCloseLeads/6.0)",
        "Accept":     "application/json, */*",
      },
      ...cacheOpts(freshOnly, 1800),
    }),
    10000
  );
  if (!res.ok) throw new Error(`Himalayas ${res.status}`);
  const data = await res.json() as HimalayasResponse;
  let inWindow = 0;
  const leads = (data.jobs ?? []).flatMap((job): AggregatedLead[] => {
    if (!job.title || !job.companyName) return [];
    const posted = typeof job.pubDate === "number" ? new Date(job.pubDate * 1000) : job.pubDate ? new Date(job.pubDate) : null;
    if (!posted || isNaN(posted.getTime())) return [];
    const hrs = hoursAgo(posted);
    if (hrs > maxHours) return [];
    inWindow++;
    const desc = stripHtml(job.description ?? job.excerpt ?? "");
    const tags = [...(job.parentCategories ?? []), ...(job.categories ?? []), job.employmentType ?? ""].filter(Boolean).slice(0, 8);
    const confidence = scoreMatch(job.title, desc, tags, keywords);
    if (confidence < SOURCE_FLOOR) return [];
    let budget = extractBudget(desc);
    if (!budget && (job.minSalary || job.maxSalary)) {
      const currency = job.currency ?? "USD";
      const min = job.minSalary ? `${currency} ${job.minSalary.toLocaleString()}` : "";
      const max = job.maxSalary ? `${currency} ${job.maxSalary.toLocaleString()}` : "";
      budget = [min, max].filter(Boolean).join(" - ");
    }
    const url = job.applicationLink ?? job.guid ?? `https://himalayas.app/companies/${job.companySlug ?? ""}`;
    const urgency = detectUrgency(`${job.title} ${desc}`);
    const email = extractEmail(desc);
    const domain = companyToDomain(job.companyName);
    return [{
      id: `him-${job.guid ?? url}`,
      company: job.companyName.trim().slice(0, 80), domain, email, title: job.title.trim(),
      description: truncate(desc || "Startup remote job — view full details on Himalayas."),
      url, source: "himalayas", sourceLabel: "Himalayas",
      postedAt: posted.toISOString(), hoursAgo: hrs, niche: "",
      tags, confidence, budget, urgency,
      qualityScore: calcQuality({ email, description: desc, tags, domain, title: job.title, budget, urgency }),
    }];
  });
  return { leads, raw: inWindow };
}

// ─── Source 16: No Desk (RSS) ─────────────────────────────────────────────────
// nodesk.co/remote-work — hand-curated remote work opportunities, no WAF.

async function fetchNoDesk(keywords: string[], maxHours: number, freshOnly: boolean): Promise<{ leads: AggregatedLead[]; raw: number }> {
  const res = await withTimeout(
    fetch("https://nodesk.co/remote-work/feed/", {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; iCloseLeads/5.0)",
        "Accept":     "application/rss+xml, text/xml, */*",
      },
      ...cacheOpts(freshOnly, 1800),
    }),
    10000
  );
  if (!res.ok) throw new Error(`NoDesk ${res.status}`);
  const xml   = await res.text();
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)];
  const leads: AggregatedLead[] = [];
  let inWindow = 0;

  for (const m of items) {
    const item    = m[1] ?? "";
    const title   = stripHtml(extractRSS(item, "title"));
    const link    = extractRSS(item, "link") || extractRSS(item, "guid");
    const pubDate = extractRSS(item, "pubDate");
    const desc    = extractRSS(item, "description") || extractRSS(item, "content:encoded");
    if (!title || !link) continue;
    const posted = new Date(pubDate);
    if (isNaN(posted.getTime())) continue;
    const hrs = hoursAgo(posted);
    if (hrs > maxHours) continue;
    inWindow++;
    const cleanDesc  = stripHtml(desc);
    const confidence = scoreMatch(title, cleanDesc, [], keywords);
    if (confidence < SOURCE_FLOOR) continue;

    let company = ""; let cleanTitle = title;
    const atMatch = title.match(/^(.+?)\s+at\s+(.+?)(?:\s*[-|,]|$)/i);
    if (atMatch?.[2]) { cleanTitle = atMatch[1]?.trim() ?? title; company = atMatch[2].trim(); }
    if (!company) company = "No Desk Listing";
    company = company.slice(0, 80);

    const budget  = extractBudget(title + " " + cleanDesc);
    const urgency = detectUrgency(title + " " + cleanDesc);
    const email   = extractEmail(cleanDesc);
    const domain  = companyToDomain(company);
    const slug    = link.split("/").filter(Boolean).pop() ?? Math.random().toString(36).slice(2);

    leads.push({
      id: `nd-${slug}`,
      company, domain, email, title: cleanTitle || title,
      description: truncate(cleanDesc || "Curated remote opportunity — view on No Desk."),
      url: link, source: "nodesk", sourceLabel: "No Desk",
      postedAt: posted.toISOString(), hoursAgo: hrs, niche: "",
      tags: ["remote", "curated"], confidence, budget, urgency,
      qualityScore: calcQuality({ email, description: cleanDesc, domain, title, budget, urgency }),
    });
  }
  return { leads, raw: inWindow };
}

// ─── Main export ──────────────────────────────────────────────────────────────

export interface AggregateOptions {
  maxHours?:      number;
  filterSource?:  LeadSource | "all";
  minConfidence?: number;
  freshOnly?:     boolean;
}

const SOURCE_RUNNERS: Array<{
  name: LeadSource;
  run: (niche: string, keywords: string[], maxHours: number, freshOnly: boolean) => Promise<{ leads: AggregatedLead[]; raw: number }>;
}> = [
  { name: "remoteok",      run: (_n, k, h, f) => fetchRemoteOK(k, h, f) },
  { name: "remotive",      run: (n, k, h, f)  => fetchRemotive(n, k, h, f) },
  { name: "reddit",        run: (_n, k, h, f) => fetchReddit(k, h, f) },
  { name: "weworkremotely",run: (n, k, h, f)  => fetchWeWorkRemotely(n, k, h, f) },
  { name: "arbeitnow",     run: (_n, k, h, f) => fetchArbeitnow(k, h, f) },
  { name: "remotejobsorg", run: (n, k, h, f)  => fetchRemoteJobsOrg(n, k, h, f) },
  { name: "jobopportunities", run: (_n, k, h, f) => fetchJobOpportunities(k, h, f) },
  { name: "remotefirstjobs", run: (n, k, h, f) => fetchRemoteFirstJobs(n, k, h, f) },
  { name: "web3jobsradar", run: (n, k, h, f) => fetchWeb3JobsRadar(n, k, h, f) },
  { name: "jobicy",        run: (_n, k, h, f) => fetchJobicy(k, h, f) },
  { name: "workingnomads", run: (_n, k, h, f) => fetchWorkingNomads(k, h, f) },
  { name: "hackernews",    run: (_n, k, h, f) => fetchHackerNews(k, h, f) },
  { name: "ycjobs",        run: (_n, k, h, f) => fetchYCJobs(k, h, f) },        // replaces Remote.co
  { name: "authenticjobs", run: (_n, k, h, f) => fetchAuthenticJobs(k, h, f) }, // replaces Craigslist
  { name: "githubissues",  run: (_n, k, h, f) => fetchGitHubBounties(k, h, f) },
  { name: "freelancermap", run: (_n, k, h, f) => fetchFreelancermap(k, h, f) }, // new
  { name: "smashingjobs",  run: (_n, k, h, f) => fetchSmashingJobs(k, h, f) },
  { name: "dribbble",      run: (_n, k, h, f) => fetchDribbbleJobs(k, h, f) },
  { name: "himalayas",     run: (n, k, h, f)  => fetchHimalayas(n, k, h, f) },
  { name: "nodesk",        run: (_n, k, h, f) => fetchNoDesk(k, h, f) },
  { name: "greenhouse",    run: (_n, k, h, f) => fetchGreenhouseBoards(k, h, f) },
  { name: "lever",         run: (_n, k, h, f) => fetchLeverBoards(k, h, f) },
  { name: "ashby",         run: (_n, k, h, f) => fetchAshbyBoards(k, h, f) },
];

const SOURCE_RANK_BOOST: Partial<Record<LeadSource, number>> = {
  jobopportunities: 5,
  remotefirstjobs:  4,
  web3jobsradar:    4,
  ashby:          5,
  greenhouse:     5,
  lever:          4,
  weworkremotely: 3,
  arbeitnow:      2,
  remotive:       2,
  remotejobsorg:  2,
  jobicy:         2,
  himalayas:      2,
  reddit:         2,
  remoteok:       1,
  workingnomads:  1,
};

function leadDisplayRank(lead: AggregatedLead): number {
  const freshnessPenalty = Math.min(24, Math.floor(lead.hoursAgo / 12));
  return lead.qualityScore + lead.confidence + (SOURCE_RANK_BOOST[lead.source] ?? 0) - freshnessPenalty;
}

export async function aggregateLeads(niche: string | string[], options: AggregateOptions = {}): Promise<AggregatedLead[]> {
  const { leads } = await aggregateLeadsWithDiagnostics(niche, options);
  return leads;
}

export async function aggregateLeadsWithDiagnostics(
  niche: string | string[],
  options: AggregateOptions = {}
): Promise<{ leads: AggregatedLead[]; diagnostics: AggregateDiagnostics }> {
  const { maxHours = 168, filterSource, minConfidence = 25, freshOnly = false } = options;
  const niches   = Array.isArray(niche) ? niche : [niche];
  const { keywords, resolved: resolvedAll } = buildKeywordsForNiches(niches);
  const resolved = resolvedAll[0] ?? "web-development";
  const nicheKeywordSets = resolvedAll.map(n => ({
    niche: n,
    keywords: NICHE_KEYWORDS[n] ?? [],
  }));

  const sourceDiagnostics: SourceDiagnostic[] = [];

  const runners = filterSource && filterSource !== "all"
    ? SOURCE_RUNNERS.filter(r => r.name === filterSource)
    : SOURCE_RUNNERS.filter(r => !DEFAULT_DISABLED_SOURCES.has(r.name));

  const results = await Promise.all(runners.map(async (r) => {
    try {
      const { leads, raw } = await r.run(resolved, keywords, maxHours, freshOnly);
      sourceDiagnostics.push({ source: r.name, ok: true, fetched: raw, kept: leads.length });
      return leads;
    } catch (err) {
      sourceDiagnostics.push({
        source: r.name, ok: false, fetched: 0, kept: 0,
        errorMessage: err instanceof Error ? err.message : "unknown error",
      });
      return [] as AggregatedLead[];
    }
  }));

  const totalFetched = sourceDiagnostics.reduce((s, d) => s + d.fetched, 0);
  let all = results.flat().flatMap((lead): AggregatedLead[] => {
    const match = bestNicheMatch(lead, nicheKeywordSets);
    if (!match) return [];
    return [{ ...lead, niche: match.niche, confidence: Math.min(100, Math.max(lead.confidence, match.confidence)) }];
  });
  const totalKeptAfterSourceFilter = all.length;

  all = all.filter(l => l.confidence >= minConfidence);
  const totalAfterMinConfidence = all.length;

  // Sort: best fit first, with freshness as a light penalty.
  all.sort((a, b) => {
    const rankDiff = leadDisplayRank(b) - leadDisplayRank(a);
    if (rankDiff !== 0) return rankDiff;
    return a.hoursAgo - b.hoursAgo;
  });

  // Deduplicate — three-key strategy to catch all duplicate shapes:
  //  1. Exact lead id (same item from same source)
  //  2. Normalised URL (same posting linked from different aggregators)
  //  3. company+title fingerprint with generous window (truly identical listings)
  const seenId  = new Set<string>();
  const seenUrl = new Set<string>();
  const seenCT  = new Set<string>();
  const deduped = all.filter((lead) => {
    // Key 1 – canonical ID
    if (seenId.has(lead.id)) return false;
    seenId.add(lead.id);

    // Key 2 – URL (strip utm params / trailing slashes)
    const normUrl = (lead.url ?? "").replace(/[?#].*$/, "").replace(/\/+$/, "").toLowerCase();
    if (normUrl && seenUrl.has(normUrl)) return false;
    if (normUrl) seenUrl.add(normUrl);

    // Key 3 – company(40) + title(50) — wider window than before to reduce false positives
    const co  = (lead.company ?? "").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 40);
    const ti  = (lead.title ?? "").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 50);
    if (co && ti) {
      const key = `${co}|${ti}`;
      if (seenCT.has(key)) return false;
      seenCT.add(key);
    }
    return true;
  });

  return {
    leads: deduped,
    diagnostics: {
      sources: sourceDiagnostics,
      totalFetched,
      totalKeptAfterSourceFilter,
      totalAfterMinConfidence,
      totalAfterDedup: deduped.length,
      niche: niches.join(","),
      resolvedNiche: resolvedAll.join(","),
      keywordsUsed: keywords,
    },
  };
}
