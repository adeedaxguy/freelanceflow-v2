"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  Building2,
  CheckCircle,
  Copy,
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
  DecisionFinderEvidence,
  DecisionFinderSearchLink,
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

function inferCountryFromParams(country: string | null, location: string | null): DecisionCountry {
  const blob = `${country ?? ""} ${location ?? ""}`.toLowerCase();
  if (/\b(uk|gb|united kingdom|england|scotland|wales|northern ireland)\b/.test(blob)) return "uk";
  if (/\b(ca|canada|ontario|quebec|british columbia|alberta|toronto|vancouver|montreal)\b/.test(blob)) return "ca";
  if (/\b(au|australia|nsw|new south wales|victoria|queensland|sydney|melbourne|brisbane)\b/.test(blob)) return "au";
  if (/\b(nz|new zealand|auckland|wellington|christchurch)\b/.test(blob)) return "nz";
  if (/\b(ie|ireland|dublin|cork|galway|limerick)\b/.test(blob)) return "ie";
  return "us";
}

function CopyButton({ value, label = "Copy" }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        void navigator.clipboard.writeText(value).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        });
      }}
      className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
    >
      {copied ? <CheckCircle className="h-3.5 w-3.5 text-accent" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Copied" : label}
    </button>
  );
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

function candidateProfileSearchUrl(candidate: DecisionMakerCandidate) {
  if (candidate.isGenericContact) {
    return googleSearchUrl(`"${candidate.company}" (owner OR founder OR manager OR director) (site:linkedin.com/in OR site:x.com OR site:facebook.com OR site:instagram.com)`);
  }
  return googleSearchUrl(`"${candidate.name}" "${candidate.company}" (site:linkedin.com/in OR site:x.com OR site:facebook.com OR site:instagram.com)`);
}

function candidateContactSearchUrl(candidate: DecisionMakerCandidate, domain?: string) {
  if (candidate.isGenericContact) {
    const query = domain
      ? `site:${domain} ("${candidate.company}" OR owner OR founder OR manager OR contact) (email OR phone OR telephone OR contact)`
      : `"${candidate.company}" (owner OR founder OR manager OR contact) (email OR phone OR telephone OR mobile OR WhatsApp)`;
    return googleSearchUrl(query);
  }
  const query = domain
    ? `site:${domain} "${candidate.name}" (email OR phone OR telephone OR contact)`
    : `"${candidate.name}" "${candidate.company}" (email OR phone OR telephone OR contact)`;
  return googleSearchUrl(query);
}

function ownerSearchLabel(candidate: DecisionMakerCandidate) {
  return candidate.isGenericContact ? "Find possible owner" : "Verify profile";
}

function contactSearchLabel(candidate: DecisionMakerCandidate) {
  return candidate.isGenericContact ? "Verify phone/email" : "Verify email/phone";
}

function socialDiscoveryLinks(company: string) {
  return [
    {
      label: "LinkedIn",
      icon: Users,
      url: googleSearchUrl(`"${company}" (owner OR founder OR manager OR director) (site:linkedin.com/in OR site:linkedin.com/company)`),
    },
    {
      label: "Facebook",
      icon: Globe,
      url: googleSearchUrl(`"${company}" (owner OR manager OR contact OR phone) site:facebook.com`),
    },
    {
      label: "Instagram",
      icon: Sparkles,
      url: googleSearchUrl(`"${company}" (owner OR manager OR contact OR phone) site:instagram.com`),
    },
    {
      label: "X",
      icon: Link2,
      url: googleSearchUrl(`"${company}" (owner OR founder OR manager OR contact) (site:x.com OR site:twitter.com)`),
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

function userFacingEvidence(item: DecisionFinderEvidence) {
  const normalized = item.label.toLowerCase();
  const isReferenceSafe =
    normalized.includes("pasted") ||
    normalized.includes("official website") ||
    normalized.includes("business/profile");
  if (normalized.includes("pasted profile")) {
    return {
      label: "Provided profile checked",
      detail: item.detail.replace(/pasted LinkedIn profile|pasted Crunchbase profile/gi, "provided profile"),
      url: isReferenceSafe ? item.url : undefined,
    };
  }
  if (normalized.includes("pasted business") || normalized.includes("business/profile")) {
    return {
      label: "Provided business profile checked",
      detail: "The supplied profile was saved as the main proof link. Open it to verify owner, phone, hours, and public contact details.",
      url: isReferenceSafe ? item.url : undefined,
    };
  }
  if (normalized.includes("official website")) {
    return {
      label: "Business website checked",
      detail: item.detail.replace(/official website/gi, "business website"),
      url: isReferenceSafe ? item.url : undefined,
    };
  }
  if (normalized.includes("email enrichment")) {
    return {
      label: "Contact enrichment checked",
      detail: item.detail.replace(/Hunter(?:\.io)?/gi, "contact enrichment"),
      url: item.url,
    };
  }
  if (normalized.includes("professional profile")) {
    return {
      label: "Professional profiles checked",
      detail: item.detail
        .replace(/official-site structured data, official-site profile links, and the public knowledge graph/gi, "public profile signals")
        .replace(/professional\/social/gi, "professional"),
      url: item.url,
    };
  }
  if (normalized.includes("knowledge graph")) {
    return {
      label: "Public profile scan checked",
      detail: item.detail.replace(/Wikidata entity/gi, "public profile record"),
      url: item.url,
    };
  }
  if (normalized.includes("registry")) {
    return {
      label: "Business registry guidance ready",
      detail: "Official registry checks are available from the recommended links when a public owner profile is not published.",
      url: item.url,
    };
  }
  return {
    label: "Verification check completed",
    detail: item.detail,
    url: item.url,
  };
}

function userFacingSearchLink(link: DecisionFinderSearchLink) {
  const normalized = link.label.toLowerCase();
  if (normalized.startsWith("open ")) {
    return { ...link, label: "Open provided profile" };
  }
  if (normalized.includes("owner and phone")) {
    return { ...link, label: "Search owner and phone mentions" };
  }
  if (normalized.includes("linkedin")) {
    return { ...link, label: "Search professional profiles" };
  }
  if (normalized.includes("social")) {
    return { ...link, label: "Search public social profiles" };
  }
  if (normalized.includes("official site")) {
    return { ...link, label: "Search the business website" };
  }
  if (normalized.includes("contact detail")) {
    return { ...link, label: "Search official contact details" };
  }
  if (normalized.includes("registry") || normalized.includes("companies house")) {
    return { ...link, label: "Check official business registry" };
  }
  return link;
}

function searchLinkIcon(label: string) {
  const normalized = label.toLowerCase();
  if (normalized.includes("profile")) return Users;
  if (normalized.includes("phone") || normalized.includes("contact")) return Phone;
  if (normalized.includes("social")) return Link2;
  if (normalized.includes("website")) return Globe;
  if (normalized.includes("registry")) return Building2;
  return Search;
}

function VerificationSummary({ result }: { result: DecisionFinderResult }) {
  const checked = result.evidence
    .filter(item => {
      if (item.status !== "checked") return false;
      const detail = item.detail.toLowerCase();
      const label = item.label.toLowerCase();
      if (/^no\b/.test(detail)) return false;
      if (detail.includes("no direct social profile") || detail.includes("no named decision maker")) return false;
      if (detail.includes("did not expose officer names") || detail.includes("did not expose a reliable person name")) return false;
      if (label.includes("knowledge graph") && !detail.includes("found")) return false;
      return true;
    })
    .map(userFacingEvidence);
  const visibleChecks = checked.slice(0, 4);
  const hiddenCheckCount = Math.max(checked.length - visibleChecks.length, 0);
  const blockedCheckCount = result.evidence.filter(item => item.status !== "checked").length;
  const nextLinks = result.searchLinks.map(userFacingSearchLink).slice(0, 5);

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <div className="rounded-2xl border border-border bg-surface p-5">
        <h3 className="mb-3 flex items-center gap-2 font-bold text-foreground">
          <Shield className="h-4 w-4 text-accent" />
          Verification summary
        </h3>
        <div className="space-y-2">
          {visibleChecks.length ? (
            visibleChecks.map(item => (
              <div key={`${item.label}-${item.detail}`} className="rounded-xl border border-border/70 bg-background/55 p-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold text-foreground">{item.label}</span>
                  <span className="rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-accent">
                    Checked
                  </span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.detail}</p>
                {item.url && (
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-primary-light hover:underline">
                    Open reference <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-border/70 bg-background/55 p-3 text-sm text-muted-foreground">
              Run a lookup with a website or profile URL to see verified public signals here.
            </div>
          )}
        </div>
        {(hiddenCheckCount > 0 || blockedCheckCount > 0) && (
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            {hiddenCheckCount > 0 ? `${hiddenCheckCount} more background check${hiddenCheckCount === 1 ? "" : "s"} completed. ` : ""}
            {blockedCheckCount > 0 ? "Add a business website when available to run deeper website checks." : ""}
          </p>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-surface p-5">
        <h3 className="mb-3 flex items-center gap-2 font-bold text-foreground">
          <Search className="h-4 w-4 text-primary-light" />
          Recommended checks
        </h3>
        <div className="space-y-2">
          {nextLinks.map(link => {
            const Icon = searchLinkIcon(link.label);
            return (
              <a
                key={`${link.label}-${link.url}`}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-xl border border-border/70 bg-background/55 p-3 transition-colors hover:border-primary/35"
              >
                <span className="flex items-center justify-between gap-3 font-semibold text-foreground">
                  <span className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-primary-light" />
                    {link.label}
                  </span>
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                </span>
                <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">{link.detail}</span>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function CandidateCard({ candidate, domain }: { candidate: DecisionMakerCandidate; domain?: string }) {
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
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{candidate.proof}</p>
          <p className="mt-2 text-sm leading-relaxed text-foreground/85">{candidate.outreachAngle}</p>
          <ContactSignalBadges candidate={candidate} />

          {candidate.isGenericContact && (
            <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-3">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-primary-light">
                <Search className="h-3.5 w-3.5" />
                Suggested verification flow
              </p>
              <div className="mt-2 grid gap-2 text-xs text-muted-foreground sm:grid-cols-3">
                <span className="rounded-lg border border-border/70 bg-background/55 px-3 py-2">1. Find possible owner name</span>
                <span className="rounded-lg border border-border/70 bg-background/55 px-3 py-2">2. Match phone or email</span>
                <span className="rounded-lg border border-border/70 bg-background/55 px-3 py-2">3. Confirm on profile/socials</span>
              </div>
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-2">
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
                Proof
              </a>
            )}
            <CopyButton value={`${candidate.name} - ${candidate.role}`} />
          </div>

          {candidate.socialProfiles?.length ? (
            <div className="mt-4 rounded-xl border border-border/70 bg-background/50 p-3">
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">Profile links</p>
              <div className="flex flex-wrap gap-2">
                {candidate.socialProfiles.map(profile => (
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
              </div>
            </div>
          ) : null}

          {candidate.isGenericContact && !candidate.socialProfiles?.length ? (
            <div className="mt-4 rounded-xl border border-border/70 bg-background/50 p-3">
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">Find social profiles</p>
              <div className="flex flex-wrap gap-2">
                {socialDiscoveryLinks(candidate.company).map(link => {
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
                })}
              </div>
            </div>
          ) : null}

          <div className="mt-3 flex flex-wrap gap-2">
            <a
              href={candidateProfileSearchUrl(candidate)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            >
              <Users className="h-3.5 w-3.5" />
              {ownerSearchLabel(candidate)}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <a
              href={candidateContactSearchUrl(candidate, domain)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            >
              <Mail className="h-3.5 w-3.5" />
              {contactSearchLabel(candidate)}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
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
              {warning}
            </div>
          ))}

          {result.candidates.length > 0 ? (
            <div className="space-y-3">
              {result.candidates.map(candidate => (
                <CandidateCard key={candidate.id} candidate={candidate} domain={result.domain} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-surface p-6 text-center">
              <Users className="mx-auto mb-3 h-9 w-9 text-muted-foreground" />
              <h3 className="font-bold text-foreground">No verified person found in the quick scan</h3>
              <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                That usually means the site does not publish leadership details or the official registry needs manual review. Use the next-step links below.
              </p>
            </div>
          )}

          <VerificationSummary result={result} />
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
