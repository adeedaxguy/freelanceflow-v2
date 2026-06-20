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
              {candidate.sourceType}
            </span>
          </div>
          <h3 className="text-lg font-bold text-foreground">{candidate.name}</h3>
          <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-primary-light">
            <Users className="h-4 w-4" />
            {candidate.role}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{candidate.proof}</p>
          <p className="mt-2 text-sm leading-relaxed text-foreground/85">{candidate.outreachAngle}</p>

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
  const initialLocation = params.get("location") ?? "";
  const initialCountry = inferCountryFromParams(params.get("country"), initialLocation);

  const [company, setCompany] = useState(initialCompany);
  const [domain, setDomain] = useState(normalizeDomain(initialDomain));
  const [location, setLocation] = useState(initialLocation);
  const [country, setCountry] = useState<DecisionCountry>(initialCountry);
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [usageLoaded, setUsageLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<DecisionFinderResult | null>(null);

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
  const cleanDomain = useMemo(() => normalizeDomain(domain), [domain]);

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
    setResult(null);
    try {
      const hunterKey = window.localStorage.getItem("ff_hunter_api_key") ?? "";
      const response = await fetch("/api/decision-makers/find", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company,
          country,
          domain: cleanDomain || undefined,
          location: location || undefined,
          hunterKey: hunterKey.length > 10 ? hunterKey : undefined,
        }),
      });
      const data = await response.json() as FinderResponse;
      if (!response.ok || !data.result) throw new Error(data.error ?? "Lookup failed");
      setResult(data.result);
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

          <div className="grid gap-4 xl:grid-cols-2">
            <div className="rounded-2xl border border-border bg-surface p-5">
              <h3 className="mb-3 flex items-center gap-2 font-bold text-foreground">
                <Shield className="h-4 w-4 text-accent" />
                Sources checked
              </h3>
              <div className="space-y-2">
                {result.evidence.map(item => (
                  <div key={`${item.label}-${item.detail}`} className="rounded-xl border border-border/70 bg-background/55 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-semibold text-foreground">{item.label}</span>
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                        item.status === "checked"
                          ? "border-accent/30 bg-accent/10 text-accent"
                          : item.status === "needs_key"
                            ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-300"
                            : "border-border bg-muted/30 text-muted-foreground"
                      }`}>
                        {item.status.replace("_", " ")}
                      </span>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.detail}</p>
                    {item.url && (
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-primary-light hover:underline">
                        Open source <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-surface p-5">
              <h3 className="mb-3 flex items-center gap-2 font-bold text-foreground">
                <Search className="h-4 w-4 text-primary-light" />
                Next verification links
              </h3>
              <div className="space-y-2">
                {result.searchLinks.map(link => (
                  <a
                    key={link.label}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-xl border border-border/70 bg-background/55 p-3 transition-colors hover:border-primary/35"
                  >
                    <span className="flex items-center justify-between gap-3 font-semibold text-foreground">
                      {link.label}
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                    </span>
                    <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">{link.detail}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
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
