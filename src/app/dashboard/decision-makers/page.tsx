"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  Building2,
  ExternalLink,
  Globe,
  Link2,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Phone,
  Search,
  Shield,
  Sparkles,
  Users,
} from "lucide-react";
import type {
  DecisionCountry,
  DecisionFinderResult,
  DecisionMakerCandidate,
} from "@/lib/decision-maker-finder";

interface UsageStats {
  plan: string;
  unlimited?: boolean;
}

interface FinderResponse {
  result?: DecisionFinderResult;
  plan?: string;
  error?: string;
  requiresAgency?: boolean;
}

interface PersistedDecisionFinderState {
  company: string;
  domain: string;
  profileUrl: string;
  location: string;
  country: DecisionCountry;
  result: DecisionFinderResult;
  savedAt: number;
}

const DECISION_FINDER_STORAGE_KEY = "ff_decision_maker_last_lookup_v1";
const DECISION_COUNTRIES: DecisionCountry[] = ["us", "uk", "ca", "au", "nz", "ie"];

function normalizeDomain(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  try {
    const url = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
    return url.hostname.replace(/^www\./i, "");
  } catch {
    return trimmed.replace(/^https?:\/\//i, "").replace(/^www\./i, "").split("/")[0] ?? "";
  }
}

function isKnownProfileInput(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return false;
  try {
    const url = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
    const host = url.hostname.replace(/^www\./i, "").toLowerCase();
    return /(google\.com|maps\.app\.goo\.gl|g\.page|goo\.gl|linkedin\.com|facebook\.com|instagram\.com|x\.com|twitter\.com|yelp\.com|foursquare\.com|crunchbase\.com)$/.test(host);
  } catch {
    return false;
  }
}

function normalizeCompanyDomain(value: string) {
  return isKnownProfileInput(value) ? "" : normalizeDomain(value);
}

function isDecisionCountry(value: unknown): value is DecisionCountry {
  return typeof value === "string" && DECISION_COUNTRIES.includes(value as DecisionCountry);
}

function normalizeComparable(value: string) {
  return value.trim().toLowerCase();
}

function readPersistedDecisionFinderState() {
  try {
    const raw = window.localStorage.getItem(DECISION_FINDER_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PersistedDecisionFinderState>;
    if (!parsed.result || !parsed.company || !isDecisionCountry(parsed.country)) return null;
    return {
      company: parsed.company,
      domain: normalizeCompanyDomain(parsed.domain ?? ""),
      profileUrl: parsed.profileUrl ?? "",
      location: parsed.location ?? "",
      country: parsed.country,
      result: parsed.result,
      savedAt: typeof parsed.savedAt === "number" ? parsed.savedAt : Date.now(),
    } satisfies PersistedDecisionFinderState;
  } catch {
    window.localStorage.removeItem(DECISION_FINDER_STORAGE_KEY);
    return null;
  }
}

function writePersistedDecisionFinderState(state: PersistedDecisionFinderState) {
  try {
    window.localStorage.setItem(DECISION_FINDER_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage can be unavailable in private or locked-down browsers.
  }
}

function persistedStateMatchesInput(
  state: PersistedDecisionFinderState,
  input: { company: string; domain: string; profileUrl: string; location: string; country: DecisionCountry },
) {
  return (
    normalizeComparable(state.company) === normalizeComparable(input.company) &&
    normalizeCompanyDomain(state.domain) === normalizeCompanyDomain(input.domain) &&
    normalizeComparable(state.profileUrl) === normalizeComparable(input.profileUrl) &&
    normalizeComparable(state.location) === normalizeComparable(input.location) &&
    state.country === input.country
  );
}

const COUNTRY_OPTIONS: Array<{ code: DecisionCountry; label: string; longLabel: string; placeholder: string }> = [
  { code: "us", label: "US", longLabel: "the US", placeholder: "Houston, TX" },
  { code: "uk", label: "UK", longLabel: "the UK", placeholder: "Manchester, UK" },
  { code: "ca", label: "CA", longLabel: "Canada", placeholder: "Toronto, ON" },
  { code: "au", label: "AU", longLabel: "Australia", placeholder: "Sydney, NSW" },
  { code: "nz", label: "NZ", longLabel: "New Zealand", placeholder: "Auckland, NZ" },
  { code: "ie", label: "IE", longLabel: "Ireland", placeholder: "Dublin, Ireland" },
];

function countryLabel(country: DecisionCountry) {
  return COUNTRY_OPTIONS.find(option => option.code === country)?.longLabel ?? "the selected market";
}

function locationPlaceholder(country: DecisionCountry) {
  return COUNTRY_OPTIONS.find(option => option.code === country)?.placeholder ?? "City or region";
}

function locationHelpText(country: DecisionCountry) {
  if (country === "us") return "For US businesses, include the state abbreviation, e.g. Austin, TX. Registry ownership checks are state-based.";
  if (country === "uk") return "For UK businesses, city or postcode area is enough, e.g. Manchester or M1.";
  if (country === "ca") return "For Canada, include province when possible, e.g. Toronto, ON.";
  if (country === "au") return "For Australia, include state or territory when possible, e.g. Sydney, NSW.";
  if (country === "nz") return "For New Zealand, city or region is usually enough.";
  if (country === "ie") return "For Ireland, city or county is usually enough.";
  return "Add the city and region when available to improve registry and profile matching.";
}

function inferCountryFromParams(country: string | null, location: string | null): DecisionCountry {
  const blob = `${country ?? ""} ${location ?? ""}`.toLowerCase();
  if (/\b(uk|gb|united kingdom|england|scotland|wales|northern ireland)\b/.test(blob)) return "uk";
  if (/\b(ca|canada|ontario|quebec|british columbia|alberta|toronto|vancouver|montreal)\b/.test(blob)) return "ca";
  if (/\b(au|australia|nsw|new south wales|victoria|queensland|sydney|melbourne|brisbane)\b/.test(blob)) return "au";
  if (/\b(nz|new zealand|auckland|wellington|christchurch)\b/.test(blob)) return "nz";
  if (/\b(ie|ireland|dublin|cork|galway|limerick)\b/.test(blob)) return "ie";
  return "us";
}

function ConfidenceBadge({ candidate }: { candidate: DecisionMakerCandidate }) {
  const tone =
    candidate.evidenceLevel === "high"
      ? "border-accent/30 bg-accent/10 text-accent"
      : candidate.evidenceLevel === "medium"
        ? "border-primary/30 bg-primary/10 text-primary-light"
        : "border-yellow-500/30 bg-yellow-500/10 text-yellow-300";
  return (
    <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${tone}`}>
      {candidate.confidence}% {candidate.evidenceLevel} confidence
    </span>
  );
}

function ContactSignalBadges({ candidate }: { candidate: DecisionMakerCandidate }) {
  const signals = [
    candidate.phone ? { label: "Phone", tone: "border-accent/30 bg-accent/10 text-accent" } : null,
    candidate.email ? { label: "Email", tone: "border-accent/30 bg-accent/10 text-accent" } : null,
    candidate.socialProfiles?.length ? { label: "Profile", tone: "border-primary/30 bg-primary/10 text-primary-light" } : null,
    candidate.isGenericContact ? { label: "Business contact", tone: "border-yellow-500/30 bg-yellow-500/10 text-yellow-300" } : null,
  ].filter((signal): signal is { label: string; tone: string } => Boolean(signal));

  if (signals.length === 0) {
    signals.push({ label: "Needs verification", tone: "border-border bg-surface text-muted-foreground" });
  }

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {signals.map(signal => (
        <span key={signal.label} className={`rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${signal.tone}`}>
          {signal.label}
        </span>
      ))}
    </div>
  );
}

function googleSearchUrl(query: string) {
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

function quotedSearchPart(value?: string) {
  const clean = value?.replace(/\s+/g, " ").trim();
  return clean ? ` "${clean}"` : "";
}

function ownerRoleQuery() {
  return `(owner OR founder OR "co-owner" OR proprietor OR "managing partner" OR "general manager" OR director OR president)`;
}

function candidateProfileSearchUrl(candidate: DecisionMakerCandidate, location?: string) {
  const context = quotedSearchPart(location);
  if (candidate.isGenericContact) {
    return googleSearchUrl(`"${candidate.company}"${context} ${ownerRoleQuery()} -jobs -hiring -careers`);
  }
  return googleSearchUrl(`"${candidate.name}" "${candidate.company}"${context} ${ownerRoleQuery()} (profile OR LinkedIn OR bio OR contact)`);
}

function candidateContactSearchUrl(candidate: DecisionMakerCandidate, domain?: string, location?: string) {
  const context = quotedSearchPart(location);
  if (candidate.isGenericContact) {
    const query = domain
      ? `site:${domain} ("${candidate.company}" OR owner OR founder OR manager OR contact) (email OR phone OR telephone OR contact)`
      : `"${candidate.company}"${context} (owner OR founder OR manager OR contact) (email OR phone OR telephone OR mobile OR WhatsApp)`;
    return googleSearchUrl(query);
  }
  const query = domain
    ? `site:${domain} "${candidate.name}" (email OR phone OR telephone OR contact)`
    : `"${candidate.name}" "${candidate.company}"${context} (email OR phone OR telephone OR contact)`;
  return googleSearchUrl(query);
}

function ownerSearchLabel(candidate: DecisionMakerCandidate) {
  return candidate.isGenericContact ? "Find possible owner" : "Verify profile";
}

function contactSearchLabel(candidate: DecisionMakerCandidate) {
  return candidate.isGenericContact ? "Verify phone/email" : "Verify email/phone";
}

function compactCandidateText(value: string, maxLength = 150) {
  const clean = value.replace(/\s+/g, " ").trim();
  if (clean.length <= maxLength) return clean;
  const trimmed = clean.slice(0, maxLength);
  const lastSpace = trimmed.lastIndexOf(" ");
  return `${trimmed.slice(0, lastSpace > 80 ? lastSpace : maxLength).trim()}...`;
}

function socialDiscoveryLinks(company: string, location?: string) {
  const context = quotedSearchPart(location);
  return [
    {
      label: "LinkedIn",
      icon: Users,
      url: googleSearchUrl(`"${company}"${context} (owner OR founder OR manager OR director) (site:linkedin.com/in OR site:linkedin.com/company)`),
    },
    {
      label: "Facebook",
      icon: Globe,
      url: googleSearchUrl(`"${company}"${context} (owner OR manager OR contact OR phone) site:facebook.com`),
    },
    {
      label: "Instagram",
      icon: Sparkles,
      url: googleSearchUrl(`"${company}"${context} (owner OR manager OR contact OR phone) site:instagram.com`),
    },
    {
      label: "X",
      icon: Link2,
      url: googleSearchUrl(`"${company}"${context} (owner OR founder OR manager OR contact) (site:x.com OR site:twitter.com)`),
    },
  ];
}

function SocialProfileIcon({ platform }: { platform: string }) {
  const name = platform.toLowerCase();
  if (name.includes("linkedin")) return <Users className="h-3.5 w-3.5" />;
  if (name.includes("facebook")) return <Globe className="h-3.5 w-3.5" />;
  if (name.includes("instagram")) return <Sparkles className="h-3.5 w-3.5" />;
  if (name === "x" || name.includes("twitter")) return <Link2 className="h-3.5 w-3.5" />;
  return <ExternalLink className="h-3.5 w-3.5" />;
}

function candidateSourceLabel(sourceType: string) {
  const normalized = sourceType.toLowerCase();
  if (normalized.includes("pasted") && normalized.includes("profile")) return "Provided profile";
  if (normalized.includes("provided business profile")) return "Business profile";
  if (normalized.includes("official website contact")) return "Public contact";
  if (normalized.includes("official website")) return "Official website";
  if (normalized.includes("hunter")) return "Email verification";
  if (normalized.includes("companies house")) return "Registry record";
  if (normalized.includes("registry")) return "Registry record";
  if (normalized.includes("knowledge graph")) return "Public profile match";
  return sourceType;
}

function profileSourceLabel(sourceType: string) {
  const normalized = sourceType.toLowerCase();
  if (normalized.includes("pasted")) return "provided profile";
  if (normalized.includes("official website")) return "official website";
  if (normalized.includes("knowledge graph")) return "public profile scan";
  return "verification scan";
}

function userFacingWarning(warning: string) {
  return warning.replace(
    "Use the next-step links to check public profiles and official registries.",
    "Start with Find possible owner, then verify phone/email or social proof before outreach.",
  );
}

function CandidateCard({ candidate, domain, location }: { candidate: DecisionMakerCandidate; domain?: string; location?: string }) {
  const proposalParams = new URLSearchParams({
    company: candidate.company,
    domain: domain ?? "",
    title: `${candidate.role} outreach`,
    description: `${candidate.proof} ${candidate.outreachAngle}`,
    niche: "decision-maker-outreach",
    leadType: "local-business",
  });
  if (candidate.sourceUrl) proposalParams.set("url", candidate.sourceUrl);
  if (candidate.email) proposalParams.set("email", candidate.email);
  const summaryLine = candidate.isGenericContact
    ? "Confirm owner, phone, or social proof from the supplied business profile."
    : compactCandidateText(candidate.proof);
  const sourceButtonLabel = candidate.isGenericContact ? "Verify business profile" : "Proof";

  return (
    <article className="rounded-2xl border border-border bg-gradient-card p-5 transition-all hover:border-primary/35 hover:shadow-card-hover">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <ConfidenceBadge candidate={candidate} />
            <span className="rounded-full border border-border bg-surface px-2.5 py-1 text-xs font-semibold text-muted-foreground">
              {candidateSourceLabel(candidate.sourceType)}
            </span>
          </div>
          <h3 className="text-lg font-bold text-foreground">{candidate.name}</h3>
          <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-primary-light">
            <Users className="h-4 w-4" />
            {candidate.role}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{summaryLine}</p>
          {!candidate.isGenericContact && (
            <p className="mt-2 text-sm leading-relaxed text-foreground/85">{compactCandidateText(candidate.outreachAngle)}</p>
          )}
          <ContactSignalBadges candidate={candidate} />

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <a
              href={candidateProfileSearchUrl(candidate, location)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-primary/35 bg-primary/10 px-3 py-2 text-xs font-bold text-primary-light transition-colors hover:border-primary/55 hover:text-foreground"
            >
              <Users className="h-3.5 w-3.5" />
              {ownerSearchLabel(candidate)}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            {candidate.email && (
              <a
                href={`mailto:${candidate.email}`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-accent/25 bg-accent/10 px-3 py-2 text-xs font-semibold text-accent"
              >
                <Mail className="h-3.5 w-3.5" />
                {candidate.email}
              </a>
            )}
            {candidate.phone && (
              <a
                href={`tel:${candidate.phone}`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-xs font-semibold text-muted-foreground"
              >
                <Phone className="h-3.5 w-3.5" />
                {candidate.phone}
              </a>
            )}
            {candidate.sourceUrl && (
              <a
                href={candidate.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                {sourceButtonLabel}
              </a>
            )}
            <a
              href={candidateContactSearchUrl(candidate, domain, location)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            >
              <Mail className="h-3.5 w-3.5" />
              {contactSearchLabel(candidate)}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            {candidate.socialProfiles?.map(profile => (
              <a
                key={profile.url}
                href={profile.url}
                target="_blank"
                rel="noopener noreferrer"
                title={`Found via ${profileSourceLabel(profile.sourceType)}`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-primary/25 bg-primary/10 px-3 py-2 text-xs font-semibold text-primary-light transition-colors hover:border-primary/45 hover:text-foreground"
              >
                <SocialProfileIcon platform={profile.platform} />
                {profile.platform}
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            ))}
            {candidate.isGenericContact && !candidate.socialProfiles?.length
              ? socialDiscoveryLinks(candidate.company, location).map(link => {
                  const Icon = link.icon;
                  return (
                    <a
                      key={link.label}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {link.label}
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  );
                })
              : null}
          </div>
        </div>

        <Link
          href={`/dashboard/proposal/new?${proposalParams.toString()}`}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-hero px-4 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
        >
          <Sparkles className="h-4 w-4" />
          Draft outreach
        </Link>
      </div>
    </article>
  );
}

function DecisionMakerFinderInner() {
  const params = useSearchParams();
  const initialCompany = params.get("company") ?? "";
  const initialDomain = params.get("domain") || params.get("website") || "";
  const initialProfileUrl = params.get("profileUrl") || params.get("profile") || "";
  const initialLocation = params.get("location") ?? "";
  const initialCountry = inferCountryFromParams(params.get("country"), initialLocation);
  const hasPrefillParams = Boolean(initialCompany || initialDomain || initialProfileUrl || initialLocation || params.get("country"));

  const [company, setCompany] = useState(initialCompany);
  const [domain, setDomain] = useState(normalizeCompanyDomain(initialDomain));
  const [profileUrl, setProfileUrl] = useState(initialProfileUrl);
  const [location, setLocation] = useState(initialLocation);
  const [country, setCountry] = useState<DecisionCountry>(initialCountry);
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [usageLoaded, setUsageLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<DecisionFinderResult | null>(null);

  useEffect(() => {
    const stored = readPersistedDecisionFinderState();
    if (!stored) return;

    if (hasPrefillParams) {
      const prefilledInput = {
        company: initialCompany,
        domain: normalizeCompanyDomain(initialDomain),
        profileUrl: initialProfileUrl,
        location: initialLocation,
        country: initialCountry,
      };
      setCompany(prefilledInput.company);
      setDomain(prefilledInput.domain);
      setProfileUrl(prefilledInput.profileUrl);
      setLocation(prefilledInput.location);
      setCountry(prefilledInput.country);
      if (persistedStateMatchesInput(stored, prefilledInput)) {
        setResult(stored.result);
      } else {
        setResult(null);
      }
      return;
    }

    setCompany(stored.company);
    setDomain(stored.domain);
    setProfileUrl(stored.profileUrl);
    setLocation(stored.location);
    setCountry(stored.country);
    setResult(stored.result);
  }, [hasPrefillParams, initialCompany, initialCountry, initialDomain, initialLocation, initialProfileUrl]);

  useEffect(() => {
    let active = true;
    fetch("/api/usage", { cache: "no-store" })
      .then(r => (r.ok ? r.json() as Promise<UsageStats> : null))
      .then(data => {
        if (active) setUsage(data);
      })
      .catch(() => null)
      .finally(() => {
        if (active) setUsageLoaded(true);
      });
    return () => { active = false; };
  }, []);

  const plan = (usage?.plan ?? "free").toLowerCase();
  const canUseFinder = plan === "agency" || plan === "pro" || usage?.unlimited === true;
  const cleanDomain = useMemo(() => normalizeCompanyDomain(domain), [domain]);

  async function runLookup() {
    if (!company.trim()) {
      setError("Enter a business name first.");
      return;
    }
    if (!canUseFinder) {
      setError("Decision Maker Finder is coming soon for free accounts.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const hunterKey = window.localStorage.getItem("ff_hunter_api_key") ?? "";
      const detectedProfileUrl = profileUrl.trim() || (isKnownProfileInput(domain) ? domain.trim() : "");
      const lookupDomain = isKnownProfileInput(domain) ? "" : cleanDomain;
      const lookupInput = {
        company: company.trim(),
        country,
        domain: lookupDomain,
        profileUrl: detectedProfileUrl,
        location: location.trim(),
      };
      const response = await fetch("/api/decision-makers/find", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: lookupInput.company,
          country: lookupInput.country,
          domain: lookupInput.domain || undefined,
          profileUrl: lookupInput.profileUrl || undefined,
          location: lookupInput.location || undefined,
          hunterKey: hunterKey.length > 10 ? hunterKey : undefined,
        }),
      });
      const data = await response.json() as FinderResponse;
      if (!response.ok || !data.result) throw new Error(data.error ?? "Lookup failed");
      setResult(data.result);
      writePersistedDecisionFinderState({
        ...lookupInput,
        result: data.result,
        savedAt: Date.now(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lookup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 p-4 pb-24 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="max-w-3xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary-light">
            <Shield className="h-3.5 w-3.5" />
            Agency intelligence
          </div>
          <h1 className="flex items-center gap-3 text-2xl font-extrabold text-foreground sm:text-3xl">
            <Users className="h-7 w-7 text-primary-light" />
            Decision Maker Finder
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Find the owner, founder, director, or manager most likely to approve your pitch. Built for US, UK, Canadian, Australian, New Zealand, and Irish businesses with registry checks, public knowledge signals, domain enrichment, proof links, confidence scores, and outreach angles.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-4 text-sm text-muted-foreground xl:w-80">
          <div className="mb-2 flex items-center gap-2 font-semibold text-foreground">
            <Globe className="h-4 w-4 text-accent" />
            Coverage model
          </div>
          <div className="space-y-2 text-xs leading-relaxed">
            <p><span className="font-semibold text-foreground">US:</span> official site, public registry network, public profile signals, and state registry launch links.</p>
            <p><span className="font-semibold text-foreground">UK:</span> official site, Companies House officers/PSC, registry-network checks, and public profile signals.</p>
            <p><span className="font-semibold text-foreground">CA/AU/NZ/IE:</span> official site, public knowledge, enrichment, registry-network checks, and official registry launch links.</p>
            <p><span className="font-semibold text-foreground">Enrichment:</span> domain contact records are used when an enrichment key is available.</p>
          </div>
        </div>
      </div>

      {!usageLoaded ? (
        <div className="rounded-2xl border border-border bg-surface p-5 text-sm text-muted-foreground">
          Checking your account access...
        </div>
      ) : !canUseFinder ? (
        <div className="rounded-2xl border border-primary/25 bg-primary/10 p-5">
          <div className="flex items-start gap-3">
            <div className="rounded-xl border border-primary/25 bg-primary/15 p-2 text-primary-light">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-bold text-foreground">Coming soon for free accounts</h2>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Decision Maker Finder is being kept as an Agency workflow because it uses deeper verification and registry checks. You can still save leads and prepare outreach from the other lead engines.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      <section className="rounded-2xl border border-border bg-gradient-card p-5">
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr_220px]">
          <label className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Business name</span>
            <div className="relative">
              <Building2 className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
              <input
                value={company}
                onChange={event => setCompany(event.target.value)}
                placeholder="e.g. Mary Cleaning Service"
                className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-3 text-sm text-foreground placeholder-muted-foreground outline-none transition-colors focus:border-primary/50"
              />
            </div>
          </label>

          <label className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Website or domain</span>
            <div className="relative">
              <Globe className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
              <input
                value={domain}
                onChange={event => setDomain(event.target.value)}
                placeholder="example.com"
                className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-3 text-sm text-foreground placeholder-muted-foreground outline-none transition-colors focus:border-primary/50"
              />
            </div>
          </label>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Country</span>
            <div className="grid grid-cols-3 gap-2 rounded-xl border border-border bg-background p-1">
              {COUNTRY_OPTIONS.map(option => (
                <button
                  key={option.code}
                  type="button"
                  onClick={() => setCountry(option.code)}
                  className={`rounded-lg px-3 py-2.5 text-sm font-bold transition-colors ${country === option.code ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <label className="space-y-2 lg:col-span-2">
            <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Google Business or social profile URL</span>
            <div className="relative">
              <Link2 className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
              <input
                value={profileUrl}
                onChange={event => setProfileUrl(event.target.value)}
                placeholder="Paste Google Maps, LinkedIn, Facebook, Instagram, Yelp, Foursquare..."
                className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-3 text-sm text-foreground placeholder-muted-foreground outline-none transition-colors focus:border-primary/50"
              />
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Use this when the business has no website or when you already found a public profile with phone/social proof.
            </p>
          </label>

          <label className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">City, state, or postcode area</span>
            <div className="relative">
              <MapPin className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
              <input
                value={location}
                onChange={event => setLocation(event.target.value)}
                placeholder={locationPlaceholder(country)}
                className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-3 text-sm text-foreground placeholder-muted-foreground outline-none transition-colors focus:border-primary/50"
              />
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">{locationHelpText(country)}</p>
          </label>

          <button
            type="button"
            onClick={() => void runLookup()}
            disabled={loading || !canUseFinder}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-hero px-5 py-3 text-sm font-bold text-white shadow-glow-primary transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45 lg:self-end"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            Find decision maker
          </button>
        </div>

        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            {error}
          </div>
        )}
      </section>

      {result && (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-foreground">{result.candidates.length} decision-maker candidate{result.candidates.length === 1 ? "" : "s"}</h2>
              <p className="text-sm text-muted-foreground">Evidence scan for {result.company} in {countryLabel(result.country)}.</p>
            </div>
            {result.domain && (
              <a
                href={`https://${result.domain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
              >
                <Globe className="h-4 w-4" />
                {result.domain}
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>

          {result.warnings.map(warning => (
            <div key={warning} className="rounded-xl border border-yellow-500/25 bg-yellow-500/10 p-3 text-sm text-yellow-200">
              {userFacingWarning(warning)}
            </div>
          ))}

          {result.candidates.length > 0 ? (
            <div className="space-y-3">
              {result.candidates.map(candidate => (
                <CandidateCard key={candidate.id} candidate={candidate} domain={result.domain} location={result.location ?? location} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-surface p-6 text-center">
              <Users className="mx-auto mb-3 h-9 w-9 text-muted-foreground" />
              <h3 className="font-bold text-foreground">No verified person found in the quick scan</h3>
              <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                That usually means the site does not publish leadership details or the public profile needs manual review. Add a profile URL or business website and run the lookup again.
              </p>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

export default function DecisionMakerFinderPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Loading Decision Maker Finder...</div>}>
      <DecisionMakerFinderInner />
    </Suspense>
  );
}
