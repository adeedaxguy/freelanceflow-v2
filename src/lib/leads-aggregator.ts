/**
 * FreelanceFlow Lead Aggregator v4
 *
 * Sources:
 *  1.  RemoteOK            — https://remoteok.com/api
 *  2.  Remotive            — https://remotive.com/api/remote-jobs
 *  3.  Reddit              — r/forhire, r/hiring, r/freelance_forhire, r/slavelabour
 *  4.  WeWorkRemotely      — RSS feeds per category
 *  5.  Arbeitnow           — https://www.arbeitnow.com/api/job-board-api
 *  6.  Jobicy              — https://jobicy.com/api/v2/remote-jobs
 *  7.  Working Nomads      — https://www.workingnomads.com/api/exposed_jobs
 *  8.  HackerNews          — Algolia "Who is hiring?" / freelancer threads
 *  9.  Remote.co           — https://remote.co/remote-jobs/feed/ (RSS)      [NEW]
 *  10. Craigslist Gigs     — computer + web gigs RSS, 8 major US cities     [NEW]
 *  11. GitHub Bounties     — open issues labelled bounty/paid               [NEW]
 *
 * v4 additions:
 *  - budget?: string   — extracted dollar amount / rate from each posting
 *  - urgency?: boolean — ASAP / urgent signals detected
 *  - Budget boosts qualityScore (+18) — clients who state budget are serious
 *  - ALL_SOURCE_LABELS exported for UI source-filter chips
 *  - extractBudget() + detectUrgency() applied across ALL sources
 */

export type LeadSource =
  | "remoteok"
  | "remotive"
  | "reddit"
  | "weworkremotely"
  | "arbeitnow"
  | "jobicy"
  | "workingnomads"
  | "hackernews"
  | "remoteco"
  | "craigslist"
  | "githubissues";

/** Canonical display labels for every source — used by the UI source-filter chips */
export const ALL_SOURCE_LABELS: Record<LeadSource, string> = {
  remoteok:      "RemoteOK",
  remotive:      "Remotive",
  reddit:        "Reddit",
  weworkremotely:"WeWorkRemotely",
  arbeitnow:     "Arbeitnow",
  jobicy:        "Jobicy",
  workingnomads: "Working Nomads",
  hackernews:    "Hacker News",
  remoteco:      "Remote.co",
  craigslist:    "Craigslist",
  githubissues:  "GitHub",
};

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
  "video":            "video-editing",
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
  "data-science":        ["data scientist","data analyst","machine learning","ml engineer","data engineering","python developer","analytics","ai engineer","llm","nlp","tensorflow","pytorch","sql","tableau","power bi","data pipeline"],
  "devops":              ["devops","cloud engineer","aws","kubernetes","docker","ci/cd","infrastructure","sre","platform engineer","terraform","gcp","azure","ansible","linux","nginx","cloud architect"],
  "wordpress":           ["wordpress","wp developer","wordpress developer","woocommerce","elementor","wordpress plugin","wp theme","gutenberg","divi","wordpress site"],
  "shopify":             ["shopify","shopify developer","e-commerce developer","ecommerce","shopify plus","liquid","shopify theme","klaviyo","bigcommerce","shopify store"],
  "email-marketing":     ["email marketing","klaviyo","mailchimp","email campaign","email automation","drip campaign","hubspot","activecampaign","email funnel","beehiiv","convertkit","email strategy"],
  "business-consulting": ["business consultant","strategy consultant","management consultant","business analyst","startup advisor","fractional cto","fractional cfo","operations consultant","growth consultant","coo","business strategy"],
  "photography":         ["photographer","photo editor","product photography","photo retouching","lightroom","photoshoot","commercial photography","real estate photography","portrait","headshot"],
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
    const kw = raw.toLowerCase();
    if (titleLower.includes(kw)) titleHits++;
    else if (bodyLower.includes(kw)) bodyHits++;
  }

  let score = 22;
  if (titleHits > 0) score += 30 + Math.min(20, (titleHits - 1) * 8);
  if (bodyHits  > 0) score += 12 + Math.min(15, (bodyHits  - 1) * 4);

  if (titleHits + bodyHits > 0) {
    for (const sig of FREELANCE_SIGNALS) { if (allLower.includes(sig)) { score += 4; break; } }
    for (const sig of HIRING_SIGNALS)   { if (allLower.includes(sig)) { score += 4; break; } }
  }

  return Math.min(100, Math.max(0, Math.round(score)));
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

// ─── Reddit OAuth ─────────────────────────────────────────────────────────────

let redditToken: { token: string; expiresAt: number } | null = null;

async function getRedditToken(): Promise<string | null> {
  const id = process.env.REDDIT_CLIENT_ID;
  const secret = process.env.REDDIT_CLIENT_SECRET;
  if (!id || !secret) return null;
  if (redditToken && redditToken.expiresAt > Date.now() + 60_000) return redditToken.token;
  try {
    const res = await withTimeout(
      fetch("https://www.reddit.com/api/v1/access_token", {
        method: "POST",
        headers: {
          "Authorization": `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`,
          "User-Agent": "FreelanceFlow/4.0",
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "grant_type=client_credentials",
        cache: "no-store",
      }),
      6000
    );
    if (!res.ok) return null;
    const data = await res.json() as { access_token?: string; expires_in?: number };
    if (!data.access_token) return null;
    redditToken = {
      token: data.access_token,
      expiresAt: Date.now() + ((data.expires_in ?? 86_400) * 1000),
    };
    return data.access_token;
  } catch { return null; }
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
      headers: { "User-Agent": "Mozilla/5.0 FreelanceFlow/4.0" },
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
    "devops":"devops-sysadmin","email-marketing":"marketing","business-consulting":"business",
    "wordpress":"software-dev","shopify":"software-dev",
  };
  const category = categoryMap[niche] ?? "";
  const search   = keywords.slice(0, 2).join(" ");
  const url = `https://remotive.com/api/remote-jobs?${category ? `category=${category}` : `search=${encodeURIComponent(search)}`}&limit=100`;
  const res = await withTimeout(
    fetch(url, { headers: { "User-Agent": "FreelanceFlow/4.0" }, ...cacheOpts(freshOnly, 600) }),
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

// ─── Source 3: Reddit ─────────────────────────────────────────────────────────

interface RedditChild { data: { id?: string; title?: string; selftext?: string; author?: string; created_utc?: number; permalink?: string; }; }
interface RedditResponse { data?: { children?: RedditChild[] }; }

const REDDIT_SUBS = [
  { sub: "forhire",           label: "r/forhire" },
  { sub: "hiring",            label: "r/hiring" },
  { sub: "freelance_forhire", label: "r/freelance_forhire" },
  { sub: "slavelabour",       label: "r/slavelabour" },
];

async function fetchReddit(keywords: string[], maxHours: number, freshOnly: boolean): Promise<{ leads: AggregatedLead[]; raw: number }> {
  const leads: AggregatedLead[] = [];
  let inWindow = 0;
  const token   = await getRedditToken();
  const baseUrl = token ? "https://oauth.reddit.com" : "https://www.reddit.com";
  const headers: Record<string, string> = { "User-Agent": "FreelanceFlow/4.0 (+https://freelanceflow.io)" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  await Promise.all(REDDIT_SUBS.map(async ({ sub, label }) => {
    try {
      const url = `${baseUrl}/r/${sub}/new${token ? "" : ".json"}?limit=100&raw_json=1`;
      const res = await withTimeout(fetch(url, { headers, ...cacheOpts(freshOnly, 300) }), 7000);
      if (!res.ok) return;
      const data = await res.json() as RedditResponse;
      for (const post of data.data?.children ?? []) {
        const d = post.data;
        if (!d.title || !d.created_utc) continue;
        const tl = d.title.toLowerCase();
        let isHiring = false;
        if (sub === "forhire" || sub === "freelance_forhire") {
          isHiring = /\[hiring\]/i.test(d.title) || /\[h\]/i.test(d.title);
        } else if (sub === "hiring") {
          isHiring = !(/\[for\s*hire\]/i.test(d.title) || /\[fh\]/i.test(d.title));
        } else if (sub === "slavelabour") {
          isHiring = /\[?offer\]?/i.test(d.title) || /^\$/.test(d.title) || tl.startsWith("offer");
        }
        if (!isHiring) continue;
        const posted = new Date(d.created_utc * 1000);
        const hrs = hoursAgo(posted);
        if (hrs > maxHours) continue;
        inWindow++;
        const body       = d.selftext ?? "";
        const rawScore   = scoreMatch(d.title, body, [], keywords);
        const confidence = Math.min(100, rawScore + 14);
        const budget     = extractBudget(d.title + " " + body);
        const urgency    = detectUrgency(d.title + " " + body);
        const email      = extractEmail(body);
        const domain     = email ? (email.split("@")[1] ?? "reddit.com") : "reddit.com";
        const titleClean = d.title.replace(/\[.*?\]/g, "").replace(/\bhiring\b/gi, "").replace(/\s+/g, " ").trim();
        const company    = titleClean.length > 5 ? titleClean.slice(0, 70) : `u/${d.author ?? "redditor"}`;
        leads.push({
          id: `reddit-${d.id ?? Math.random()}`,
          company, domain, email,
          title: d.title.replace(/\[.*?\]\s*/g, "").trim() || d.title,
          description: truncate(body || "Reddit hiring post — see thread for details."),
          url: d.permalink ? `https://reddit.com${d.permalink}` : `https://reddit.com/r/${sub}`,
          source: "reddit", sourceLabel: label,
          postedAt: posted.toISOString(), hoursAgo: hrs, niche: "", tags: [], confidence, budget, urgency,
          qualityScore: calcQuality({ email, description: body, domain, title: d.title, budget, urgency }),
        });
      }
    } catch { /* per-sub failure is non-fatal */ }
  }));
  return { leads, raw: inWindow };
}

// ─── Source 4: WeWorkRemotely ─────────────────────────────────────────────────

function extractRSS(xml: string, tag: string): string {
  const m = xml.match(new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?</${tag}>`, "i"));
  return (m?.[1] ?? "").trim();
}

const WWR_FEEDS: Record<string, string> = {
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
  "data-science":        "https://weworkremotely.com/categories/remote-programming-jobs.rss",
  "devops":              "https://weworkremotely.com/categories/remote-devops-sysadmin-jobs.rss",
  "business-consulting": "https://weworkremotely.com/categories/remote-business-exec-management-jobs.rss",
};

async function fetchWeWorkRemotely(niche: string, keywords: string[], maxHours: number, freshOnly: boolean): Promise<{ leads: AggregatedLead[]; raw: number }> {
  const feedUrl = WWR_FEEDS[niche] ?? "https://weworkremotely.com/remote-jobs.rss";
  const res = await withTimeout(
    fetch(feedUrl, {
      headers: { "User-Agent": "FreelanceFlow/4.0", "Accept": "application/rss+xml, text/xml" },
      ...cacheOpts(freshOnly, 900),
    }),
    9000
  );
  if (!res.ok) throw new Error(`WWR ${res.status}`);
  const xml   = await res.text();
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)];
  const leads: AggregatedLead[] = [];
  let inWindow = 0;

  for (const m of items) {
    const item    = m[1] ?? "";
    const title   = extractRSS(item, "title");
    const link    = extractRSS(item, "link");
    const pubDate = extractRSS(item, "pubDate");
    const desc    = extractRSS(item, "description");
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
  return { leads, raw: inWindow };
}

// ─── Source 5: Arbeitnow ─────────────────────────────────────────────────────

interface ArbeitnowJob {
  slug?: string; company_name?: string; title?: string; description?: string;
  url?: string; tags?: string[]; created_at?: string | number;
}
interface ArbeitnowResponse { data?: ArbeitnowJob[]; }

async function fetchArbeitnow(keywords: string[], maxHours: number, freshOnly: boolean): Promise<{ leads: AggregatedLead[]; raw: number }> {
  const res = await withTimeout(
    fetch("https://www.arbeitnow.com/api/job-board-api", {
      headers: { "User-Agent": "FreelanceFlow/4.0", "Accept": "application/json" },
      ...cacheOpts(freshOnly, 900),
    }),
    9000
  );
  if (!res.ok) throw new Error(`Arbeitnow ${res.status}`);
  const data = await res.json() as ArbeitnowResponse;
  let inWindow = 0;
  const leads = (data.data ?? []).flatMap((job): AggregatedLead[] => {
    if (!job.title || !job.company_name) return [];
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
    const confidence = scoreMatch(job.title, desc, job.tags ?? [], keywords);
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
      tags: (job.tags ?? []).slice(0, 8), confidence, budget, urgency,
      qualityScore: calcQuality({ email, description: desc, tags: job.tags, domain, title: job.title, budget, urgency }),
    }];
  });
  return { leads, raw: inWindow };
}

// ─── Source 6: Jobicy ─────────────────────────────────────────────────────────

interface JobicyJob {
  id?: number; jobTitle?: string; companyName?: string; jobIndustry?: string[];
  jobExcerpt?: string; jobDescription?: string; jobSlug?: string; url?: string; pubDate?: string;
}
interface JobicyResponse { jobs?: JobicyJob[]; }

async function fetchJobicy(keywords: string[], maxHours: number, freshOnly: boolean): Promise<{ leads: AggregatedLead[]; raw: number }> {
  const res = await withTimeout(
    fetch("https://jobicy.com/api/v2/remote-jobs?count=50&geo=worldwide", {
      headers: { "User-Agent": "FreelanceFlow/4.0", "Accept": "application/json" },
      ...cacheOpts(freshOnly, 900),
    }),
    8000
  );
  if (!res.ok) throw new Error(`Jobicy ${res.status}`);
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

// ─── Source 7: Working Nomads ─────────────────────────────────────────────────

interface WNJob {
  id?: string; title?: string; company_name?: string; company?: string;
  url?: string; description?: string; category_name?: string; category?: string;
  tags?: string; pub_date?: string; pubDate?: string;
}

async function fetchWorkingNomads(keywords: string[], maxHours: number, freshOnly: boolean): Promise<{ leads: AggregatedLead[]; raw: number }> {
  const res = await withTimeout(
    fetch("https://www.workingnomads.com/api/exposed_jobs/?limit=100", {
      headers: { "User-Agent": "FreelanceFlow/4.0", "Accept": "application/json" },
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
      headers: { "User-Agent": "FreelanceFlow/4.0" }, ...cacheOpts(freshOnly, 1800),
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
      headers: { "User-Agent": "FreelanceFlow/4.0" }, ...cacheOpts(freshOnly, 900),
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
    inWindow++;
    const text = stripHtml(c.text);
    if (text.length < 40) continue;
    if (isFreelancerThread && /seeking\s*work/i.test(text) && !/seeking\s*freelancer/i.test(text)) continue;
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

// ─── Source 9: Remote.co (RSS) ───────────────────────────────────────────────

async function fetchRemoteCo(keywords: string[], maxHours: number, freshOnly: boolean): Promise<{ leads: AggregatedLead[]; raw: number }> {
  const res = await withTimeout(
    fetch("https://remote.co/remote-jobs/feed/", {
      headers: { "User-Agent": "FreelanceFlow/4.0", "Accept": "application/rss+xml, text/xml, */*" },
      ...cacheOpts(freshOnly, 1800),
    }),
    10000
  );
  if (!res.ok) throw new Error(`Remote.co ${res.status}`);
  const xml   = await res.text();
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)];
  const leads: AggregatedLead[] = [];
  let inWindow = 0;

  for (const m of items) {
    const item    = m[1] ?? "";
    const title   = stripHtml(extractRSS(item, "title"));
    const link    = extractRSS(item, "link");
    const pubDate = extractRSS(item, "pubDate");
    const desc    = extractRSS(item, "description");
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
    if (!company) {
      const catM = item.match(/<category[^>]*>(?:<!\[CDATA\[)?(.+?)(?:\]\]>)?<\/category>/i);
      company = catM?.[1]?.trim() ?? "Remote.co Company";
    }
    company = company.slice(0, 80);

    const budget  = extractBudget(cleanDesc);
    const urgency = detectUrgency(title + " " + cleanDesc);
    const email   = extractEmail(cleanDesc);
    const domain  = extractDomain(link) !== "remote.co" ? extractDomain(link) : companyToDomain(company);

    leads.push({
      id: `rc-${link.split("/").filter(Boolean).pop() ?? Math.random()}`,
      company, domain, email, title: cleanTitle || title,
      description: truncate(cleanDesc),
      url: link, source: "remoteco", sourceLabel: "Remote.co",
      postedAt: posted.toISOString(), hoursAgo: hrs, niche: "", tags: [], confidence, budget, urgency,
      qualityScore: calcQuality({ email, description: cleanDesc, domain, title, budget, urgency }),
    });
  }
  return { leads, raw: inWindow };
}

// ─── Source 10: Craigslist Gigs (multi-city RSS) ──────────────────────────────

const CL_CITIES = ["sfbay","newyork","chicago","losangeles","seattle","boston","miami","austin"];
const CL_CATS   = ["cpg","web"]; // computer gigs, web design gigs

async function fetchCraigslistCity(city: string, cat: string, keywords: string[], maxHours: number, freshOnly: boolean): Promise<AggregatedLead[]> {
  let xml = "";
  try {
    const res = await withTimeout(
      fetch(`https://${city}.craigslist.org/search/${cat}?format=rss`, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; FreelanceFlow/4.0)" },
        ...cacheOpts(freshOnly, 1800),
      }),
      7000
    );
    if (!res.ok) return [];
    xml = await res.text();
  } catch { return []; }

  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)];
  const leads: AggregatedLead[] = [];

  for (const m of items) {
    const item    = m[1] ?? "";
    const title   = stripHtml(extractRSS(item, "title"));
    const link    = extractRSS(item, "link");
    const pubDate = extractRSS(item, "pubDate") || extractRSS(item, "dc:date");
    const desc    = extractRSS(item, "description");
    if (!title || !link) continue;
    const posted = pubDate ? new Date(pubDate) : null;
    if (!posted || isNaN(posted.getTime())) continue;
    const hrs = hoursAgo(posted);
    if (hrs > maxHours) continue;
    const cleanDesc  = stripHtml(desc);
    const fullText   = title + " " + cleanDesc;
    const confidence = scoreMatch(title, cleanDesc, [], keywords);
    if (confidence < SOURCE_FLOOR) continue;

    const budget  = extractBudget(fullText);
    const urgency = detectUrgency(fullText);
    const email   = extractEmail(cleanDesc);
    const cityLabel = city === "sfbay" ? "San Francisco" : city === "newyork" ? "New York" : city.charAt(0).toUpperCase() + city.slice(1);

    leads.push({
      id: `cl-${city}-${link.split("/").filter(Boolean).pop() ?? Math.random()}`,
      company: title.slice(0, 80), domain: "craigslist.org", email, title,
      description: truncate(cleanDesc || "Craigslist gig — click to see full details."),
      url: link, source: "craigslist", sourceLabel: `Craigslist (${cityLabel})`,
      postedAt: posted.toISOString(), hoursAgo: hrs, niche: "",
      tags: [cityLabel, cat === "web" ? "web design" : "computer gigs"], confidence, budget, urgency,
      qualityScore: calcQuality({ email, description: cleanDesc, domain: "craigslist.org", title, budget, urgency }),
    });
  }
  return leads;
}

async function fetchCraigslist(keywords: string[], maxHours: number, freshOnly: boolean): Promise<{ leads: AggregatedLead[]; raw: number }> {
  const tasks   = CL_CITIES.flatMap(city => CL_CATS.map(cat => fetchCraigslistCity(city, cat, keywords, maxHours, freshOnly)));
  const results = await Promise.all(tasks);
  const leads   = results.flat();
  return { leads, raw: leads.length };
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
    "User-Agent": "FreelanceFlow/4.0",
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
  { name: "jobicy",        run: (_n, k, h, f) => fetchJobicy(k, h, f) },
  { name: "workingnomads", run: (_n, k, h, f) => fetchWorkingNomads(k, h, f) },
  { name: "hackernews",    run: (_n, k, h, f) => fetchHackerNews(k, h, f) },
  { name: "remoteco",      run: (_n, k, h, f) => fetchRemoteCo(k, h, f) },
  { name: "craigslist",    run: (_n, k, h, f) => fetchCraigslist(k, h, f) },
  { name: "githubissues",  run: (_n, k, h, f) => fetchGitHubBounties(k, h, f) },
];

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

  const sourceDiagnostics: SourceDiagnostic[] = [];

  const runners = filterSource && filterSource !== "all"
    ? SOURCE_RUNNERS.filter(r => r.name === filterSource)
    : SOURCE_RUNNERS;

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
  let all = results.flat().map(l => ({ ...l, niche: resolved }));
  const totalKeptAfterSourceFilter = all.length;

  all = all.filter(l => l.confidence >= minConfidence);
  const totalAfterMinConfidence = all.length;

  // Sort: freshest → quality → confidence
  all.sort((a, b) => {
    if (a.hoursAgo !== b.hoursAgo) return a.hoursAgo - b.hoursAgo;
    if (b.qualityScore !== a.qualityScore) return b.qualityScore - a.qualityScore;
    return b.confidence - a.confidence;
  });

  // Deduplicate by company + title fingerprint
  const seen = new Set<string>();
  const deduped = all.filter((lead) => {
    const co  = lead.company.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 20);
    const ti  = lead.title.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 30);
    const key = `${co}|${ti}`;
    if (seen.has(key)) return false;
    seen.add(key);
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
