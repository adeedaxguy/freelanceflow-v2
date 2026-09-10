const JOB_SOURCES = new Set(["remoteok", "remotive", "arbeitnow", "remotejobsorg", "jobopportunities", "remotefirstjobs", "web3jobsradar", "greenhouse", "lever", "ashby", "weworkremotely", "jobicy", "workingnomads", "himalayas", "reddit", "hackernews", "ycjobs", "nodesk", "authenticjobs", "jobspresso", "smashingjobs", "dribbble", "freelancermap"]);
const JOB_HOSTS = /(^|\.)(remoteok\.com|remotive\.com|arbeitnow\.com|remotejobs\.org|jobicy\.com|himalayas\.app|workingnomads\.com|weworkremotely\.com|greenhouse\.io|lever\.co|ashbyhq\.com|myworkdayjobs\.com|reddit\.com|ycombinator\.com)$/i;

export function companyWebsiteDomain(value: string | null | undefined): string {
  if (!value) return "";
  try {
    const url = new URL(value.includes("://") ? value : `https://${value}`);
    const host = url.hostname.replace(/^www\./, "").toLowerCase();
    if (!/^https?:$/.test(url.protocol) || url.username || url.password || !host.includes(".") || JOB_HOSTS.test(host)) return "";
    return host;
  } catch { return ""; }
}

// Old job records used name + .com. Hide those guesses without deleting saved work.
export function sanitizeLegacyJobDomain<T extends { company: string; domain: string; source?: string | null; isManual?: boolean }>(lead: T): T {
  if (lead.isManual || !lead.source || !JOB_SOURCES.has(lead.source)) return lead;
  const guess = lead.company.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 20) + ".com";
  const domain = companyWebsiteDomain(lead.domain);
  return { ...lead, domain: domain === guess || domain === "unknown.com" ? "" : domain };
}

export function requiresOfficeWork(title: string, description = ""): boolean {
  const work = /\b(hybrid|on[- ]?site|in[- ]office)\b/i;
  // Keep technical phrases such as hybrid cloud, and jobs explicitly offering a remote option.
  const clean = (text: string) => text.replace(/\bhybrid\s+(cloud|infrastructure|architecture|applications?|systems?|environments?)\b/gi, "")
    .replace(/\b(?:no|not|without)\s+(?:required\s+)?(?:hybrid|on[- ]?site|in[- ]office)(?:\s+work)?/gi, "")
    .replace(/\b(?:on[- ]?site|hybrid)\s*(?:\/|or)\s*(?:hybrid\s*\/\s*)?(?:fully\s+)?remote\b/gi, "")
    .replace(/\b(?:fully\s+)?remote\s*(?:\/|or)\s*(?:hybrid|on[- ]?site)\b/gi, "");
  return work.test(clean(title)) || /\b(?:location|work(?:place|ing)?(?: model| arrangement)?|role type)\s*:\s*(?:hybrid|on[- ]?site|in[- ]office)\b|\b(?:must|required to|expected to)\s+(?:work|be|attend)\s+(?:in|from|at)\s+(?:the |our |an? )?office\b/i.test(clean(description));
}
