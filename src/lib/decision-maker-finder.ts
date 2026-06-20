export type DecisionCountry = "us" | "uk";

export type DecisionEvidenceLevel = "high" | "medium" | "low";

export interface DecisionMakerCandidate {
  id: string;
  name: string;
  role: string;
  company: string;
  country: DecisionCountry;
  confidence: number;
  evidenceLevel: DecisionEvidenceLevel;
  sourceType: string;
  sourceUrl?: string;
  proof: string;
  email?: string;
  phone?: string;
  outreachAngle: string;
}

export interface DecisionFinderEvidence {
  label: string;
  status: "checked" | "skipped" | "needs_key";
  detail: string;
  url?: string;
}

export interface DecisionFinderSearchLink {
  label: string;
  url: string;
  detail: string;
}

export interface DecisionFinderInput {
  company: string;
  country: DecisionCountry;
  domain?: string;
  website?: string;
  location?: string;
  companiesHouseKey?: string;
  hunterKey?: string;
  openCorporatesKey?: string;
}

export interface DecisionFinderResult {
  company: string;
  country: DecisionCountry;
  domain?: string;
  candidates: DecisionMakerCandidate[];
  evidence: DecisionFinderEvidence[];
  searchLinks: DecisionFinderSearchLink[];
  warnings: string[];
}

type CandidateDraft = Omit<DecisionMakerCandidate, "id">;

const WEBSITE_PATHS = [
  "",
  "/about",
  "/about-us",
  "/team",
  "/our-team",
  "/meet-the-team",
  "/leadership",
  "/management",
  "/people",
  "/staff",
  "/contact",
];

const ROLE_TERMS = [
  "owner",
  "founder",
  "co-founder",
  "chief executive officer",
  "ceo",
  "managing director",
  "director",
  "principal",
  "partner",
  "president",
  "general manager",
  "operations manager",
  "marketing manager",
  "practice manager",
  "business development manager",
  "head of marketing",
  "head of operations",
];

const US_STATE_REGISTRY_URLS: Record<string, string> = {
  AZ: "https://ecorp.azcc.gov/EntitySearch/Index",
  CA: "https://bizfileonline.sos.ca.gov/search/business",
  CO: "https://www.sos.state.co.us/biz/BusinessEntityCriteriaExt.do",
  DE: "https://icis.corp.delaware.gov/ecorp/entitysearch/namesearch.aspx",
  FL: "https://search.sunbiz.org/Inquiry/CorporationSearch/ByName",
  GA: "https://ecorp.sos.ga.gov/BusinessSearch",
  IL: "https://apps.ilsos.gov/businessentitysearch/",
  MA: "https://corp.sec.state.ma.us/corpweb/CorpSearch/CorpSearch.aspx",
  NC: "https://www.sosnc.gov/online_services/search/by_title/_Business_Registration",
  NJ: "https://www.njportal.com/DOR/businessrecords/",
  NY: "https://apps.dos.ny.gov/publicInquiry/",
  OH: "https://businesssearch.ohiosos.gov/",
  PA: "https://file.dos.pa.gov/search/business",
  TX: "https://mycpa.cpa.state.tx.us/coa/",
  VA: "https://cis.scc.virginia.gov/EntitySearch/Index",
  WA: "https://ccfs.sos.wa.gov/",
};

const WIKIDATA_ROLE_PROPERTIES: Record<string, string> = {
  P112: "Founder",
  P169: "Chief executive officer",
  P488: "Chairperson",
  P1037: "Director / manager",
  P3320: "Board member",
};

const US_STATE_NAMES: Record<string, string> = {
  AL: "alabama",
  AK: "alaska",
  AZ: "arizona",
  AR: "arkansas",
  CA: "california",
  CO: "colorado",
  CT: "connecticut",
  DE: "delaware",
  FL: "florida",
  GA: "georgia",
  HI: "hawaii",
  IA: "iowa",
  ID: "idaho",
  IL: "illinois",
  IN: "indiana",
  KS: "kansas",
  KY: "kentucky",
  LA: "louisiana",
  MA: "massachusetts",
  MD: "maryland",
  ME: "maine",
  MI: "michigan",
  MN: "minnesota",
  MO: "missouri",
  MS: "mississippi",
  MT: "montana",
  NC: "north carolina",
  ND: "north dakota",
  NE: "nebraska",
  NH: "new hampshire",
  NJ: "new jersey",
  NM: "new mexico",
  NV: "nevada",
  NY: "new york",
  OH: "ohio",
  OK: "oklahoma",
  OR: "oregon",
  PA: "pennsylvania",
  RI: "rhode island",
  SC: "south carolina",
  SD: "south dakota",
  TN: "tennessee",
  TX: "texas",
  UT: "utah",
  VA: "virginia",
  VT: "vermont",
  WA: "washington",
  WI: "wisconsin",
  WV: "west virginia",
  WY: "wyoming",
  DC: "district of columbia",
};

const US_STATE_TO_OC: Record<string, string> = Object.fromEntries(
  Object.keys(US_STATE_NAMES).map(code => [code, `us_${code.toLowerCase()}`]),
) as Record<string, string>;

const EMAIL_RE = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const PHONE_RE = /(?:\+?\d[\d\s().-]{7,}\d)/g;
const COMPANY_SUFFIX_RE = /\b(?:incorporated|inc|limited|ltd|llc|plc|corp|corporation|company|co|services|service|group|holdings|partners|the)\b/gi;

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function stripTags(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&nbsp;/gi, " ")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&rsquo;/gi, "'")
    .replace(/&lsquo;/gi, "'")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeDomain(input?: string) {
  if (!input) return "";
  const trimmed = input.trim();
  if (!trimmed) return "";
  try {
    const url = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
    return url.hostname.replace(/^www\./i, "").toLowerCase();
  } catch {
    return trimmed.replace(/^https?:\/\//i, "").replace(/^www\./i, "").split("/")[0]!.toLowerCase();
  }
}

function websiteFromDomain(domain?: string, website?: string) {
  const raw = website || domain;
  const clean = normalizeDomain(raw);
  if (!clean) return "";
  return `https://${clean}`;
}

function safeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function titleCaseName(name: string) {
  const clean = name
    .replace(/\s+/g, " ")
    .replace(/^(.+),\s*(.+)$/u, "$2 $1")
    .trim();
  if (!clean) return "";
  if (/[a-z]/.test(clean)) return clean;
  return clean.toLowerCase().replace(/\b[a-z]/g, c => c.toUpperCase());
}

function validPersonName(name: string) {
  const clean = name.trim();
  if (clean.length < 5 || clean.length > 80) return false;
  if (!/\s/.test(clean)) return false;
  if (/\b(?:company|limited|ltd|llc|inc|plc|group|holdings|services|solutions|customer|privacy|terms|website|copyright)\b/i.test(clean)) return false;
  return /^[A-Za-z][A-Za-z' .-]+[A-Za-z.]$/.test(clean);
}

function normalizeCompanyName(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(COMPANY_SUFFIX_RE, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function companyMatchScore(query: string, candidate: string) {
  const q = normalizeCompanyName(query);
  const c = normalizeCompanyName(candidate);
  if (!q || !c) return 0;
  if (q === c) return 1;
  const qTokens = new Set(q.split(" ").filter(token => token.length > 2));
  const cTokens = new Set(c.split(" ").filter(token => token.length > 2));
  if (qTokens.size === 1 && cTokens.size > 1) return c.startsWith(`${q} `) ? 0.62 : 0;
  if (c.includes(q) || q.includes(c)) return 0.86;
  if (qTokens.size === 0 || cTokens.size === 0) return 0;
  let overlap = 0;
  for (const token of qTokens) if (cTokens.has(token)) overlap += 1;
  return overlap / Math.max(qTokens.size, cTokens.size);
}

function seniorityBoost(role: string) {
  const r = role.toLowerCase();
  if (/\b(owner|founder|ceo|chief executive|managing director|president|principal|partner)\b/.test(r)) return 10;
  if (/\b(director|head of|general manager)\b/.test(r)) return 6;
  if (/\b(manager)\b/.test(r)) return 3;
  return 0;
}

function outreachAngle(role: string, company: string) {
  const r = role.toLowerCase();
  if (/\b(owner|founder|ceo|president|principal|partner)\b/.test(r)) {
    return `Lead with revenue, missed enquiries, and a low-risk first step for ${company}.`;
  }
  if (/\b(marketing|business development)\b/.test(r)) {
    return `Lead with campaign performance, local demand, and a short test plan for ${company}.`;
  }
  if (/\b(operations|general manager|practice manager)\b/.test(r)) {
    return `Lead with fewer admin bottlenecks, clearer booking flow, and practical next steps for ${company}.`;
  }
  return `Lead with a specific business improvement and one simple action ${company} can approve quickly.`;
}

function candidateKey(candidate: CandidateDraft) {
  return `${candidate.name.toLowerCase()}|${candidate.role.toLowerCase()}`;
}

function dedupeCandidates(candidates: CandidateDraft[]) {
  const byKey = new Map<string, CandidateDraft>();
  for (const candidate of candidates) {
    if (!validPersonName(candidate.name)) continue;
    const key = candidateKey(candidate);
    const current = byKey.get(key);
    if (!current || candidate.confidence > current.confidence) {
      byKey.set(key, candidate);
    }
  }
  return Array.from(byKey.values())
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 8)
    .map((candidate, index) => ({
      ...candidate,
      id: `${candidate.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${index}`,
    }));
}

async function fetchHtml(url: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6500);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "user-agent": "iCloseLeads Decision Maker Finder (+https://icloseleads.com)",
        accept: "text/html,application/xhtml+xml",
      },
      next: { revalidate: 0 },
    });
    if (!res.ok) return null;
    const contentType = res.headers.get("content-type") ?? "";
    if (contentType && !/html|text/i.test(contentType)) return null;
    const html = await res.text();
    return html.slice(0, 750_000);
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function extractJsonLdCandidates(html: string, pageUrl: string, input: DecisionFinderInput): CandidateDraft[] {
  const candidates: CandidateDraft[] = [];
  const scripts = html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);

  function addPerson(raw: Record<string, unknown>, fallbackRole?: string) {
    const name = titleCaseName(safeText(raw.name));
    const role = safeText(raw.jobTitle) || fallbackRole || "Decision maker";
    if (!validPersonName(name)) return;
    candidates.push({
      name,
      role,
      company: input.company,
      country: input.country,
      confidence: Math.min(96, 82 + seniorityBoost(role)),
      evidenceLevel: "high",
      sourceType: "Official website structured data",
      sourceUrl: safeText(raw.url) || pageUrl,
      proof: `${name} is listed as ${role} in structured data on the official website.`,
      email: safeText(raw.email) || undefined,
      phone: safeText(raw.telephone) || undefined,
      outreachAngle: outreachAngle(role, input.company),
    });
  }

  function visit(value: unknown, fallbackRole?: string) {
    if (!value) return;
    if (Array.isArray(value)) {
      value.forEach(item => visit(item, fallbackRole));
      return;
    }
    if (typeof value !== "object") return;
    const raw = value as Record<string, unknown>;
    const typeValue = raw["@type"];
    const types = Array.isArray(typeValue) ? typeValue.map(String) : [String(typeValue ?? "")];
    if (types.some(type => type.toLowerCase().includes("person"))) {
      addPerson(raw, fallbackRole);
    }
    for (const key of ["founder", "founders", "employee", "employees", "member", "members", "owner", "alumni"]) {
      if (key in raw) visit(raw[key], key === "owner" ? "Owner" : undefined);
    }
    if ("@graph" in raw) visit(raw["@graph"], fallbackRole);
  }

  for (const script of scripts) {
    try {
      const json = JSON.parse(script[1]!.trim()) as unknown;
      visit(json);
    } catch {
      continue;
    }
  }

  return candidates;
}

function findNearbyEmail(name: string, emails: string[]) {
  const parts = name.toLowerCase().split(/\s+/).filter(Boolean);
  if (parts.length < 2) return undefined;
  const first = parts[0]!;
  const last = parts[parts.length - 1]!;
  return emails.find(email => {
    const local = email.split("@")[0]!.toLowerCase();
    return local.includes(first) || local.includes(last) || local === `${first}.${last}` || local === `${first}${last}`;
  });
}

function extractTextCandidates(html: string, pageUrl: string, input: DecisionFinderInput): CandidateDraft[] {
  const text = stripTags(html);
  const emails = Array.from(new Set(text.match(EMAIL_RE) ?? []));
  const phones = Array.from(new Set(text.match(PHONE_RE) ?? [])).slice(0, 3);
  const rolePattern = ROLE_TERMS.map(escapeRegex).join("|");
  const patterns = [
    new RegExp(`\\b([A-Z][A-Za-z'.-]+(?:\\s+[A-Z][A-Za-z'.-]+){1,3})\\s*(?:,|:|\\||\\-|\\u2013|\\u2014)\\s*(${rolePattern})\\b`, "gi"),
    new RegExp(`\\b(${rolePattern})\\s*(?:,|:|\\||\\-|\\u2013|\\u2014)\\s*([A-Z][A-Za-z'.-]+(?:\\s+[A-Z][A-Za-z'.-]+){1,3})\\b`, "gi"),
  ];
  const candidates: CandidateDraft[] = [];

  for (const pattern of patterns) {
    for (const match of text.matchAll(pattern)) {
      const first = match[1] ?? "";
      const second = match[2] ?? "";
      const firstIsRole = ROLE_TERMS.some(role => role.toLowerCase() === first.toLowerCase());
      const name = titleCaseName(firstIsRole ? second : first);
      const role = firstIsRole ? first : second;
      if (!validPersonName(name)) continue;
      const email = findNearbyEmail(name, emails);
      candidates.push({
        name,
        role,
        company: input.company,
        country: input.country,
        confidence: Math.min(88, 64 + seniorityBoost(role) + (email ? 8 : 0)),
        evidenceLevel: "medium",
        sourceType: "Official website text",
        sourceUrl: pageUrl,
        proof: `${name} appears near the role "${role}" on ${new URL(pageUrl).pathname || "the homepage"}.`,
        email,
        phone: phones[0],
        outreachAngle: outreachAngle(role, input.company),
      });
    }
  }

  return candidates;
}

async function searchWebsite(input: DecisionFinderInput) {
  const base = websiteFromDomain(input.domain, input.website);
  const candidates: CandidateDraft[] = [];
  const evidence: DecisionFinderEvidence[] = [];
  if (!base) {
    evidence.push({
      label: "Official website",
      status: "skipped",
      detail: "No company domain was provided, so website leadership pages could not be checked.",
    });
    return { candidates, evidence };
  }

  const seen = new Set<string>();
  let pagesChecked = 0;
  for (const path of WEBSITE_PATHS) {
    const url = `${base}${path}`;
    if (seen.has(url)) continue;
    seen.add(url);
    const html = await fetchHtml(url);
    if (!html) continue;
    pagesChecked += 1;
    candidates.push(...extractJsonLdCandidates(html, url, input));
    candidates.push(...extractTextCandidates(html, url, input));
    if (candidates.length >= 8) break;
  }

  evidence.push({
    label: "Official website",
    status: pagesChecked > 0 ? "checked" : "skipped",
    detail: pagesChecked > 0
      ? `Checked ${pagesChecked} likely leadership, team, about, and contact page${pagesChecked === 1 ? "" : "s"}.`
      : "The website could not be reached quickly enough for a live scan.",
    url: base,
  });

  return { candidates, evidence };
}

async function fetchCompaniesHouse(path: string, apiKey: string) {
  const auth = Buffer.from(`${apiKey}:`).toString("base64");
  const res = await fetch(`https://api.company-information.service.gov.uk${path}`, {
    headers: { authorization: `Basic ${auth}`, accept: "application/json" },
    next: { revalidate: 0 },
  });
  if (!res.ok) return null;
  return res.json() as Promise<Record<string, unknown>>;
}

function companiesHouseUrl(companyNumber?: string, suffix = "") {
  if (!companyNumber) return "https://find-and-update.company-information.service.gov.uk/";
  return `https://find-and-update.company-information.service.gov.uk/company/${companyNumber}${suffix}`;
}

function extractCompaniesHouseSearchMatch(html: string, input: DecisionFinderInput) {
  const results = Array.from(html.matchAll(/<li class="type-company">([\s\S]*?)<\/li>/gi))
    .map(match => {
      const block = match[1] ?? "";
      const href = block.match(/href="\/company\/([A-Z0-9]+)"/i)?.[1] ?? "";
      const title = titleCaseName(stripTags(block.match(/<h3>[\s\S]*?<\/h3>/i)?.[0] ?? ""));
      return {
        companyNumber: href,
        title,
        score: companyMatchScore(input.company, title),
      };
    })
    .filter(result => result.companyNumber && result.score >= 0.72)
    .sort((a, b) => b.score - a.score);
  return results[0];
}

function extractCompaniesHousePublicOfficers(html: string, input: DecisionFinderInput, companyNumber: string): CandidateDraft[] {
  const candidates: CandidateDraft[] = [];
  const officerIds = Array.from(html.matchAll(/id="officer-name-(\d+)"/gi)).map(match => match[1]).filter(Boolean);
  for (let i = 0; i < officerIds.length; i += 1) {
    const id = officerIds[i]!;
    const start = html.search(new RegExp(`id="officer-name-${id}"`, "i"));
    const nextId = officerIds[i + 1];
    const end = nextId ? html.search(new RegExp(`id="officer-name-${nextId}"`, "i")) : -1;
    const block = html.slice(start, end > start ? end : undefined);
    if (!new RegExp(`officer-status-tag-${id}[\\s\\S]*?>\\s*Active\\s*<`, "i").test(block)) continue;
    if (new RegExp(`officer-resigned-on-${id}`, "i").test(block)) continue;

    const rawName = stripTags(block.match(/<a\b[^>]*>([\s\S]*?)<\/a>/i)?.[0] ?? "");
    const role = titleCaseName(stripTags(block.match(new RegExp(`<dd[^>]*id="officer-role-${id}"[^>]*>[\\s\\S]*?</dd>`, "i"))?.[0] ?? "")) || "Company officer";
    const name = titleCaseName(rawName);
    if (!validPersonName(name)) continue;
    candidates.push({
      name,
      role,
      company: input.company,
      country: "uk",
      confidence: Math.min(92, 80 + seniorityBoost(role)),
      evidenceLevel: "high",
      sourceType: "UK Companies House public officer",
      sourceUrl: companiesHouseUrl(companyNumber, "/officers"),
      proof: `${name} is listed as an active ${role.toLowerCase()} on the public UK company record.`,
      outreachAngle: outreachAngle(role, input.company),
    });
  }
  return candidates;
}

async function searchCompaniesHousePublic(input: DecisionFinderInput) {
  const candidates: CandidateDraft[] = [];
  const evidence: DecisionFinderEvidence[] = [];
  const searchUrl = `https://find-and-update.company-information.service.gov.uk/search?q=${encodeURIComponent(input.company)}`;
  const searchHtml = await fetchHtml(searchUrl);
  if (!searchHtml) {
    evidence.push({
      label: "Companies House",
      status: "needs_key",
      detail: "UK official registry checks are ready, but a Companies House API key is not configured and the public lookup did not respond.",
      url: "https://developer.company-information.service.gov.uk/",
    });
    return { candidates, evidence };
  }

  const match = extractCompaniesHouseSearchMatch(searchHtml, input);
  if (!match) {
    evidence.push({
      label: "Companies House",
      status: "checked",
      detail: "No close public UK company registry match was found for this business name.",
      url: searchUrl,
    });
    return { candidates, evidence };
  }

  const officersUrl = companiesHouseUrl(match.companyNumber, "/officers");
  const officersHtml = await fetchHtml(officersUrl);
  if (officersHtml) {
    candidates.push(...extractCompaniesHousePublicOfficers(officersHtml, input, match.companyNumber));
  }

  evidence.push({
    label: "Companies House",
    status: "checked",
    detail: candidates.length
      ? `Checked public UK company record ${match.companyNumber} and found ${candidates.length} active officer${candidates.length === 1 ? "" : "s"}.`
      : `Checked public UK company record ${match.companyNumber}; no active named officers were exposed on the public page.`,
    url: companiesHouseUrl(match.companyNumber),
  });

  return { candidates, evidence };
}

async function searchCompaniesHouse(input: DecisionFinderInput) {
  const candidates: CandidateDraft[] = [];
  const evidence: DecisionFinderEvidence[] = [];
  if (input.country !== "uk") return { candidates, evidence };
  if (!input.companiesHouseKey) {
    return searchCompaniesHousePublic(input);
  }

  try {
    const search = await fetchCompaniesHouse(
      `/search/companies?q=${encodeURIComponent(input.company)}&items_per_page=3`,
      input.companiesHouseKey,
    );
    const items = Array.isArray(search?.items) ? search.items as Array<Record<string, unknown>> : [];
    const active = items.find(item => /active/i.test(safeText(item.company_status))) ?? items[0];
    const companyNumber = safeText(active?.company_number);
    if (!companyNumber) {
      evidence.push({
        label: "Companies House",
        status: "checked",
        detail: "No close UK company registry match was found for this business name.",
      });
      return { candidates, evidence };
    }

    const officers = await fetchCompaniesHouse(
      `/company/${companyNumber}/officers?items_per_page=8`,
      input.companiesHouseKey,
    );
    const officerItems = Array.isArray(officers?.items) ? officers.items as Array<Record<string, unknown>> : [];
    for (const officer of officerItems) {
      if (safeText(officer.resigned_on)) continue;
      const name = titleCaseName(safeText(officer.name));
      const role = titleCaseName(safeText(officer.officer_role)) || "Company officer";
      if (!validPersonName(name)) continue;
      candidates.push({
        name,
        role,
        company: input.company,
        country: "uk",
        confidence: Math.min(96, 84 + seniorityBoost(role)),
        evidenceLevel: "high",
        sourceType: "UK Companies House officer",
        sourceUrl: companiesHouseUrl(companyNumber, "/officers"),
        proof: `${name} is listed as an active ${role.toLowerCase()} for the matched UK company record.`,
        outreachAngle: outreachAngle(role, input.company),
      });
    }

    const psc = await fetchCompaniesHouse(
      `/company/${companyNumber}/persons-with-significant-control?items_per_page=6`,
      input.companiesHouseKey,
    );
    const pscItems = Array.isArray(psc?.items) ? psc.items as Array<Record<string, unknown>> : [];
    for (const person of pscItems) {
      const name = titleCaseName(safeText(person.name));
      if (!validPersonName(name)) continue;
      candidates.push({
        name,
        role: "Person with significant control",
        company: input.company,
        country: "uk",
        confidence: 94,
        evidenceLevel: "high",
        sourceType: "UK Companies House PSC",
        sourceUrl: companiesHouseUrl(companyNumber, "/persons-with-significant-control"),
        proof: `${name} is listed in the matched UK company record as a person with significant control.`,
        outreachAngle: outreachAngle("owner", input.company),
      });
    }

    evidence.push({
      label: "Companies House",
      status: "checked",
      detail: `Checked official UK company record ${companyNumber}.`,
      url: companiesHouseUrl(companyNumber),
    });
  } catch {
    evidence.push({
      label: "Companies House",
      status: "skipped",
      detail: "Companies House did not respond during this lookup. Website evidence was still checked.",
    });
  }

  return { candidates, evidence };
}

async function fetchJson<T>(url: string, timeoutMs = 8000, headers?: Record<string, string>) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "user-agent": "iCloseLeads Decision Maker Finder (+https://icloseleads.com)",
        accept: "application/json",
        ...(headers ?? {}),
      },
      next: { revalidate: 0 },
    });
    if (!res.ok) return { ok: false as const, status: res.status, data: null };
    return { ok: true as const, status: res.status, data: await res.json() as T };
  } catch {
    return { ok: false as const, status: 0, data: null };
  } finally {
    clearTimeout(timeout);
  }
}

interface HunterDomainSearchResponse {
  data?: {
    domain?: string;
    organization?: string;
    emails?: Array<{
      value?: string;
      type?: string;
      confidence?: number;
      first_name?: string;
      last_name?: string;
      position?: string;
      phone_number?: string;
      sources?: Array<{ uri?: string; domain?: string; extracted_on?: string }>;
    }>;
  };
  meta?: { results?: number };
}

function isDecisionRole(role: string) {
  const lower = role.toLowerCase();
  return ROLE_TERMS.some(term => lower.includes(term)) || /\b(founder|owner|ceo|director|partner|principal|manager|head)\b/.test(lower);
}

async function searchHunter(input: DecisionFinderInput) {
  const candidates: CandidateDraft[] = [];
  const evidence: DecisionFinderEvidence[] = [];
  const domain = normalizeDomain(input.domain || input.website);
  if (!domain) {
    evidence.push({
      label: "Email enrichment",
      status: "skipped",
      detail: "No company domain was available for contact enrichment.",
    });
    return { candidates, evidence };
  }
  if (!input.hunterKey) {
    evidence.push({
      label: "Email enrichment",
      status: "needs_key",
      detail: "Hunter domain contact enrichment is ready, but no Hunter API key is configured.",
      url: "https://hunter.io/api-documentation/v2",
    });
    return { candidates, evidence };
  }

  const params = new URLSearchParams({
    domain,
    limit: "20",
    api_key: input.hunterKey,
  });
  const res = await fetchJson<HunterDomainSearchResponse>(`https://api.hunter.io/v2/domain-search?${params.toString()}`, 9000);
  if (!res.ok) {
    evidence.push({
      label: "Email enrichment",
      status: "skipped",
      detail: "Hunter contact enrichment did not return results during this lookup.",
      url: "https://hunter.io/api-documentation/v2",
    });
    return { candidates, evidence };
  }

  const emails = res.data?.data?.emails ?? [];
  for (const email of emails) {
    const name = titleCaseName([safeText(email.first_name), safeText(email.last_name)].filter(Boolean).join(" "));
    const role = safeText(email.position) || "Company contact";
    if (!validPersonName(name) || !isDecisionRole(role)) continue;
    const sourceUrl = email.sources?.find(source => source.uri)?.uri || `https://${domain}`;
    candidates.push({
      name,
      role,
      company: input.company,
      country: input.country,
      confidence: Math.min(92, Math.max(58, Math.round(email.confidence ?? 65)) + seniorityBoost(role)),
      evidenceLevel: "medium",
      sourceType: "Domain contact enrichment",
      sourceUrl,
      proof: `${name} is associated with ${domain} as ${role} in domain contact enrichment data.`,
      email: safeText(email.value) || undefined,
      phone: safeText(email.phone_number) || undefined,
      outreachAngle: outreachAngle(role, input.company),
    });
  }

  evidence.push({
    label: "Email enrichment",
    status: "checked",
    detail: `Checked ${emails.length} contact record${emails.length === 1 ? "" : "s"} for ${domain}; senior decision roles are promoted when present.`,
    url: "https://hunter.io/api-documentation/v2",
  });

  return { candidates, evidence };
}

interface WikidataSearchResponse {
  search?: Array<{ id?: string; label?: string; description?: string; concepturi?: string }>;
}

interface WikidataEntityResponse {
  entities?: Record<string, {
    labels?: Record<string, { value?: string }>;
    descriptions?: Record<string, { value?: string }>;
    sitelinks?: Record<string, { url?: string }>;
    claims?: Record<string, Array<{
      mainsnak?: {
        datavalue?: {
          value?: {
            id?: string;
            "entity-type"?: string;
          } | string | number;
        };
      };
    }>>;
  }>;
}

function getWikidataEntityIds(entity: NonNullable<WikidataEntityResponse["entities"]>[string], property: string) {
  return (entity.claims?.[property] ?? [])
    .map(claim => claim.mainsnak?.datavalue?.value)
    .filter((value): value is { id?: string; "entity-type"?: string } => typeof value === "object" && value !== null)
    .map(value => value.id)
    .filter((id): id is string => Boolean(id?.startsWith("Q")));
}

async function getWikidataLabels(ids: string[]) {
  if (ids.length === 0) return new Map<string, { label: string; description: string }>();
  const params = new URLSearchParams({
    action: "wbgetentities",
    ids: ids.slice(0, 40).join("|"),
    props: "labels|descriptions",
    languages: "en",
    format: "json",
  });
  const res = await fetchJson<WikidataEntityResponse>(`https://www.wikidata.org/w/api.php?${params.toString()}`, 8000);
  const labels = new Map<string, { label: string; description: string }>();
  if (!res.ok) return labels;
  for (const [id, entity] of Object.entries(res.data?.entities ?? {})) {
    labels.set(id, {
      label: safeText(entity.labels?.en?.value),
      description: safeText(entity.descriptions?.en?.value),
    });
  }
  return labels;
}

async function searchWikidata(input: DecisionFinderInput) {
  const candidates: CandidateDraft[] = [];
  const evidence: DecisionFinderEvidence[] = [];
  const params = new URLSearchParams({
    action: "wbsearchentities",
    search: input.company,
    language: "en",
    format: "json",
    limit: "5",
  });
  const search = await fetchJson<WikidataSearchResponse>(`https://www.wikidata.org/w/api.php?${params.toString()}`, 8000);
  if (!search.ok) {
    evidence.push({
      label: "Public knowledge graph",
      status: "skipped",
      detail: "Wikidata did not respond during this lookup.",
      url: "https://www.wikidata.org/wiki/Wikidata:Data_access",
    });
    return { candidates, evidence };
  }

  const companyLower = input.company.toLowerCase();
  const result = (search.data?.search ?? []).find(item => {
    const label = safeText(item.label);
    const description = safeText(item.description).toLowerCase();
    return companyMatchScore(input.company, label) >= 0.72
      || (label.toLowerCase().includes(companyLower) && /(company|business|organization|organisation|corporation|brand|restaurant|firm)/.test(description));
  });
  const qid = result?.id;
  if (!qid) {
    evidence.push({
      label: "Public knowledge graph",
      status: "checked",
      detail: "No Wikidata entity matched this company name.",
      url: "https://www.wikidata.org/wiki/Wikidata:Data_access",
    });
    return { candidates, evidence };
  }

  const entityRes = await fetchJson<WikidataEntityResponse>(`https://www.wikidata.org/wiki/Special:EntityData/${qid}.json`, 8000);
  const entity = entityRes.data?.entities?.[qid];
  if (!entityRes.ok || !entity) {
    evidence.push({
      label: "Public knowledge graph",
      status: "skipped",
      detail: "The matched Wikidata entity could not be loaded.",
      url: `https://www.wikidata.org/wiki/${qid}`,
    });
    return { candidates, evidence };
  }

  const rolePairs: Array<{ id: string; role: string }> = [];
  for (const [property, role] of Object.entries(WIKIDATA_ROLE_PROPERTIES)) {
    for (const id of getWikidataEntityIds(entity, property)) {
      rolePairs.push({ id, role });
    }
  }
  const labels = await getWikidataLabels(Array.from(new Set(rolePairs.map(pair => pair.id))));
  const companyLabel = safeText(entity.labels?.en?.value) || input.company;
  const entityUrl = `https://www.wikidata.org/wiki/${qid}`;

  for (const pair of rolePairs) {
    const label = labels.get(pair.id);
    const name = titleCaseName(label?.label ?? "");
    if (!validPersonName(name)) continue;
    candidates.push({
      name,
      role: pair.role,
      company: input.company,
      country: input.country,
      confidence: Math.min(88, 72 + seniorityBoost(pair.role)),
      evidenceLevel: "medium",
      sourceType: "Public knowledge graph",
      sourceUrl: `https://www.wikidata.org/wiki/${pair.id}`,
      proof: `${name} is listed on Wikidata as ${pair.role.toLowerCase()} for ${companyLabel}.`,
      outreachAngle: outreachAngle(pair.role, input.company),
    });
  }

  evidence.push({
    label: "Public knowledge graph",
    status: "checked",
    detail: candidates.length
      ? `Matched ${companyLabel} and found ${candidates.length} leadership relation${candidates.length === 1 ? "" : "s"}.`
      : `Matched ${companyLabel}, but no founder, CEO, director, chair, or board member statement was available.`,
    url: entityUrl,
  });

  return { candidates, evidence };
}

interface OCSearchResponse {
  results?: {
    companies?: Array<{
      company?: {
        name?: string;
        company_number?: string;
        jurisdiction_code?: string;
        current_status?: string;
        company_type?: string;
        opencorporates_url?: string;
        registry_url?: string;
      };
    }>;
  };
}

interface OCCompanyResponse {
  results?: {
    company?: {
      name?: string;
      company_number?: string;
      jurisdiction_code?: string;
      current_status?: string;
      opencorporates_url?: string;
      registry_url?: string;
      officers?: Array<{
        officer?: {
          name?: string;
          position?: string;
          role?: string;
          occupation?: string;
          opencorporates_url?: string;
          start_date?: string;
          end_date?: string;
        };
      }>;
    };
  };
}

function openCorporatesJurisdiction(input: DecisionFinderInput) {
  if (input.country === "uk") return "gb";
  const state = inferUsState(input.location);
  if (state && US_STATE_TO_OC[state]) return US_STATE_TO_OC[state];
  return null;
}

async function searchOpenCorporates(input: DecisionFinderInput) {
  const candidates: CandidateDraft[] = [];
  const evidence: DecisionFinderEvidence[] = [];
  const params = new URLSearchParams({
    q: input.company,
    per_page: "5",
    normalise_company_name: "true",
  });
  const jurisdiction = openCorporatesJurisdiction(input);
  if (jurisdiction) params.set("jurisdiction_code", jurisdiction);
  if (input.openCorporatesKey) params.set("api_token", input.openCorporatesKey);

  const search = await fetchJson<OCSearchResponse>(`https://api.opencorporates.com/v0.4/companies/search?${params.toString()}`, 9000);
  if (!search.ok) {
    evidence.push({
      label: "Business registry network",
      status: search.status === 401 || search.status === 403 ? "needs_key" : "skipped",
      detail: search.status === 401 || search.status === 403
        ? "OpenCorporates registry lookup needs an API key for this environment."
        : "OpenCorporates registry lookup did not return results during this lookup.",
      url: "https://api.opencorporates.com/documentation/API-Reference",
    });
    return { candidates, evidence };
  }

  const companies = search.data?.results?.companies ?? [];
  const closeMatches = companies.filter(item => companyMatchScore(input.company, safeText(item.company?.name)) >= 0.68);
  const active = closeMatches.find(item => {
    const status = safeText(item.company?.current_status).toLowerCase();
    return !status || /active|registered|current|exist/i.test(status);
  }) ?? closeMatches[0];
  const company = active?.company;
  if (!company?.jurisdiction_code || !company.company_number) {
    evidence.push({
      label: "Business registry network",
      status: "checked",
      detail: "No close OpenCorporates company record was found after name-quality matching.",
      url: "https://opencorporates.com/",
    });
    return { candidates, evidence };
  }

  const detailParams = new URLSearchParams();
  if (input.openCorporatesKey) detailParams.set("api_token", input.openCorporatesKey);
  const detailUrl = `https://api.opencorporates.com/v0.4/companies/${company.jurisdiction_code}/${company.company_number}${detailParams.toString() ? `?${detailParams.toString()}` : ""}`;
  const detail = await fetchJson<OCCompanyResponse>(detailUrl, 9000);
  const detailCompany = detail.data?.results?.company;
  const officers = detailCompany?.officers ?? [];
  for (const row of officers) {
    const officer = row.officer;
    const name = titleCaseName(safeText(officer?.name));
    const role = titleCaseName(safeText(officer?.position) || safeText(officer?.role) || safeText(officer?.occupation) || "Company officer");
    if (!validPersonName(name)) continue;
    candidates.push({
      name,
      role,
      company: input.company,
      country: input.country,
      confidence: Math.min(90, 74 + seniorityBoost(role)),
      evidenceLevel: "medium",
      sourceType: "Business registry network",
      sourceUrl: officer?.opencorporates_url || detailCompany?.opencorporates_url || company.opencorporates_url,
      proof: `${name} is connected to the matched company record as ${role.toLowerCase()} in registry-network data.`,
      outreachAngle: outreachAngle(role, input.company),
    });
  }

  evidence.push({
    label: "Business registry network",
    status: "checked",
    detail: officers.length
      ? `Matched ${detailCompany?.name ?? company.name} and checked ${officers.length} officer record${officers.length === 1 ? "" : "s"}.`
      : `Matched ${detailCompany?.name ?? company.name}; this registry record did not expose officer names through the API.`,
    url: detailCompany?.opencorporates_url || company.opencorporates_url || "https://opencorporates.com/",
  });

  return { candidates, evidence };
}

function inferUsState(location?: string) {
  const text = (location ?? "").toLowerCase();
  const code = Object.keys(US_STATE_NAMES).find(state => {
    const pattern = new RegExp(`\\b${state.toLowerCase()}\\b`, "i");
    return pattern.test(text) || text.includes(US_STATE_NAMES[state]!);
  });
  return code;
}

function buildSearchLinks(input: DecisionFinderInput, domain?: string): DecisionFinderSearchLink[] {
  const links: DecisionFinderSearchLink[] = [];
  const location = input.location ? ` ${input.location}` : "";
  const company = input.company;

  links.push({
    label: "LinkedIn profile search",
    detail: "Open a filtered public search for owners, founders, directors, and managers.",
    url: `https://www.google.com/search?q=${encodeURIComponent(`site:linkedin.com/in "${company}"${location} owner OR founder OR director OR CEO`)}`,
  });

  if (domain) {
    links.push({
      label: "Official site decision-maker search",
      detail: "Search the business website for leadership, about, team, and contact mentions.",
      url: `https://www.google.com/search?q=${encodeURIComponent(`site:${domain} owner OR founder OR director OR "managing director" OR "contact"`)}`,
    });
  }

  if (input.country === "uk") {
    links.push({
      label: "Companies House public record",
      detail: "Open the official UK registry search for directors and persons with significant control.",
      url: `https://find-and-update.company-information.service.gov.uk/search?q=${encodeURIComponent(company)}`,
    });
  } else {
    const state = inferUsState(input.location);
    links.push({
      label: state ? `${state} business registry` : "US state business registry",
      detail: state
        ? "Open the relevant state registry and search the business name for filing records."
        : "US records are state-based. Use the business location to open the right registry.",
      url: state && US_STATE_REGISTRY_URLS[state]
        ? US_STATE_REGISTRY_URLS[state]
        : `https://www.google.com/search?q=${encodeURIComponent(`${company}${location} secretary of state business registry`)}`,
    });
  }

  return links;
}

export async function findDecisionMakers(input: DecisionFinderInput): Promise<DecisionFinderResult> {
  const company = input.company.trim();
  const domain = normalizeDomain(input.domain || input.website);
  const warnings: string[] = [];

  const [website, hunter, wikidata, openCorporates, companiesHouse] = await Promise.all([
    searchWebsite({ ...input, company, domain }),
    searchHunter({ ...input, company, domain }),
    searchWikidata({ ...input, company, domain }),
    searchOpenCorporates({ ...input, company, domain }),
    searchCompaniesHouse({ ...input, company, domain }),
  ]);

  const candidates = dedupeCandidates([
    ...website.candidates,
    ...hunter.candidates,
    ...wikidata.candidates,
    ...openCorporates.candidates,
    ...companiesHouse.candidates,
  ]);
  const evidence = [
    ...website.evidence,
    ...hunter.evidence,
    ...wikidata.evidence,
    ...openCorporates.evidence,
    ...companiesHouse.evidence,
  ];

  if (input.country === "us") {
    evidence.push({
      label: "US registry coverage",
      status: "checked",
      detail: "US business ownership data is split across state registries, so iCloseLeads provides official registry launch links instead of pretending there is one national owner database.",
    });
  }

  if (candidates.length === 0) {
    warnings.push("No named decision maker was verified from the fast evidence scan. Use the next-step links to check public profiles and official registries.");
  }

  return {
    company,
    country: input.country,
    domain,
    candidates,
    evidence,
    searchLinks: buildSearchLinks({ ...input, company }, domain),
    warnings,
  };
}
