"use client";

import { Fragment, useState, useCallback, useMemo, useEffect, useRef } from "react";
import {
  Search, Clock, Globe, Mail, Phone, ExternalLink, Bookmark, Sparkles,
  RefreshCw, Filter, X, TrendingUp, AlertCircle, CheckCircle,
  ChevronDown, Star, Zap, BarChart3, ChevronLeft, ChevronRight,
  Copy, Users, Download, DollarSign, Flame, ArrowUpDown, Timer,
  Target,
} from "lucide-react";
import NicheSelector from "@/components/NicheSelector";
import BonusLeadsModal from "@/components/BonusLeadsModal";
import { AppliedButton, AppliedReturnPrompt, useLeadApplications } from "@/components/LeadApplicationControls";
import Link from "next/link";
import type { AggregatedLead, LeadSource } from "@/lib/leads-aggregator";
import { ALL_SOURCE_LABELS } from "@/lib/leads-aggregator";
import { NICHES } from "@/types";
import { copyText } from "@/lib/clipboard";
import { trackAnalyticsEvent } from "@/lib/analytics";
import { LeadResultsAd } from "@/components/AdSenseUnit";

const HOUR_OPTIONS = [
  { label: "12h", value: 12 },
  { label: "24h", value: 24 },
  { label: "48h", value: 48 },
  { label: "72h", value: 72 },
  { label: "7d",  value: 168 },
  { label: "30d", value: 720 },
];

type SortOption = "freshest" | "best-match" | "best-quality" | "has-budget";
const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "freshest",     label: "Freshest First" },
  { value: "best-match",   label: "Best Match" },
  { value: "best-quality", label: "Best Quality" },
  { value: "has-budget",   label: "Has Budget First" },
];

const SEARCH_COOLDOWN_SECS = 30;
const FORCE_COOLDOWN_SECS  = 180;
const PAGE_SIZE = 20;

interface UsageStats {
  plan: string;
  limit: number;
  used: number;
  remaining: number;
  nextReset: string;
  percentage: number;
  bonusLeads?: number;
  shareBonusClaimed?: boolean;
}
interface SourceDiag { source: string; ok: boolean; fetched: number; kept: number; errorMessage?: string; }
interface SearchDiagnostics {
  sources: SourceDiag[];
  totalFetched: number;
  totalKeptAfterSourceFilter: number;
  totalAfterMinConfidence: number;
  totalAfterDedup: number;
  totalAfterUserDedup?: number;
  totalAfterKeywordFilter?: number;
  totalReturned?: number;
  niche: string;
  resolvedNiche: string;
  capped?: boolean;
  autoBroadened?: boolean;
  requestedMaxHours?: number;
  effectiveMaxHours?: number;
  initialResultCount?: number;
  minimumUsefulResults?: number;
  broadenReason?: "empty" | "thin" | null;
}
interface ContactInfo {
  company: string;
  email?: string;
  phone?: string;
  domain: string;
  title: string;
  url: string;
  lead: AggregatedLead;
}

// ── Cooldown formatter ────────────────────────────────────────────────────────
function fmtCooldown(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return m > 0 ? `${m}:${String(s).padStart(2, "0")}` : `0:${String(s).padStart(2, "0")}`;
}

// ── CSV export ────────────────────────────────────────────────────────────────
function exportLeadsCSV(leads: AggregatedLead[], filename = "icloseleads-leads.csv") {
  const headers = [
    "Title", "Company", "Domain", "Source", "Niche", "Match %", "Quality",
    "Budget", "Urgent", "Has Email", "Email", "Posted At", "Hours Ago",
    "Tags", "Description", "URL",
  ];
  const escape = (v: string | number | boolean | undefined) => {
    const str = String(v ?? "").replace(/"/g, '""');
    return `"${str}"`;
  };
  const rows = leads.map(l => [
    escape(l.title),
    escape(l.company),
    escape(l.domain),
    escape(ALL_SOURCE_LABELS[l.source as LeadSource] ?? l.source),
    escape(l.niche),
    escape(l.confidence),
    escape(l.qualityScore),
    escape(l.budget ?? ""),
    escape(l.urgency ? "Yes" : "No"),
    escape(l.email ? "Yes" : "No"),
    escape(l.email ?? ""),
    escape(l.postedAt),
    escape(l.hoursAgo),
    escape(l.tags.join(", ")),
    escape(l.description.slice(0, 300)),
    escape(l.url),
  ].join(","));

  // UTF-8 BOM for Excel compatibility
  const bom = "﻿";
  const csv = bom + [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function exportContactsCSV(contacts: ContactInfo[]) {
  const headers = ["Company", "Email", "Phone", "Domain", "Title", "URL"];
  const escape = (v: string | undefined) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const rows = contacts.map(c => [
    escape(c.company), escape(c.email), escape(c.phone),
    escape(c.domain),  escape(c.title), escape(c.url),
  ].join(","));
  const bom = "﻿";
  const csv = bom + [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = "icloseleads-contacts.csv";
  a.click();
  URL.revokeObjectURL(url);
}

// ── Source colour map ─────────────────────────────────────────────────────────
const SOURCE_COLORS: Record<string, string> = {
  reddit:        "bg-orange-500/15 text-orange-400 border-orange-500/20",
  remoteok:      "bg-blue-500/15 text-blue-400 border-blue-500/20",
  remotive:      "bg-violet-500/15 text-violet-400 border-violet-500/20",
  weworkremotely:"bg-green-500/15 text-green-400 border-green-500/20",
  arbeitnow:     "bg-sky-500/15 text-sky-400 border-sky-500/20",
  jobicy:        "bg-indigo-500/15 text-indigo-400 border-indigo-500/20",
  workingnomads: "bg-teal-500/15 text-teal-400 border-teal-500/20",
  hackernews:    "bg-amber-500/15 text-amber-400 border-amber-500/20",
  remoteco:      "bg-cyan-500/15 text-cyan-400 border-cyan-500/20",
  craigslist:    "bg-purple-500/15 text-purple-400 border-purple-500/20",
  githubissues:  "bg-neutral-500/15 text-neutral-300 border-neutral-500/20",
  ycjobs:        "bg-orange-500/15 text-orange-300 border-orange-500/20",
  authenticjobs: "bg-pink-500/15 text-pink-400 border-pink-500/20",
  smashingjobs:  "bg-red-500/15 text-red-400 border-red-500/20",
  dribbble:      "bg-rose-500/15 text-rose-400 border-rose-500/20",
  freelancermap: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  himalayas:     "bg-cyan-500/15 text-cyan-400 border-cyan-500/20",
  nodesk:        "bg-lime-500/15 text-lime-400 border-lime-500/20",
  greenhouse:    "bg-emerald-500/15 text-emerald-300 border-emerald-500/20",
  lever:         "bg-blue-500/15 text-blue-300 border-blue-500/20",
  ashby:         "bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/20",
};

function SourcePill({ source }: { source: string }) {
  const label = ALL_SOURCE_LABELS[source as LeadSource] ?? source;
  const color = SOURCE_COLORS[source] ?? "bg-muted text-muted-foreground border-border";
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${color}`}>
      {label}
    </span>
  );
}

function QualityDot({ score }: { score: number }) {
  if (score >= 70) return (
    <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20 font-medium flex items-center gap-1">
      <span className="w-1.5 h-1.5 rounded-full bg-accent" />High
    </span>
  );
  if (score >= 50) return (
    <span className="text-xs px-2 py-0.5 rounded-full bg-gold/10 text-gold border border-gold/20 font-medium flex items-center gap-1">
      <span className="w-1.5 h-1.5 rounded-full bg-gold" />Mid
    </span>
  );
  return null;
}

function leadNextStep(lead: AggregatedLead) {
  if (lead.email && lead.budget) return "Contact found and budget mentioned. Save it, then send a researched proposal.";
  if (lead.email) return "Contact found. Save it, then prepare a short proposal while the post is fresh.";
  if (lead.budget) return "Budget signal found. Open the post, verify fit, then save it for outreach.";
  if (lead.urgency) return "Urgency signal found. Move quickly with a specific first message.";
  return "Open the post, verify fit, then save the lead if the need is real.";
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { void copyText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1800); }); }}
      className="ml-1 p-0.5 rounded text-muted-foreground hover:text-accent transition-colors">
      {copied ? <CheckCircle className="w-3 h-3 text-accent" /> : <Copy className="w-3 h-3" />}
    </button>
  );
}

// ── Smart pagination ──────────────────────────────────────────────────────────
function SmartPagination({ page, total, onChange }: { page: number; total: number; onChange: (p: number) => void }) {
  if (total <= 1) return null;

  const pages: (number | "…")[] = useMemo(() => {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const result: (number | "…")[] = [1];
    if (page > 3)           result.push("…");
    for (let p = Math.max(2, page - 1); p <= Math.min(total - 1, page + 1); p++) result.push(p);
    if (page < total - 2)   result.push("…");
    result.push(total);
    return result;
  }, [page, total]);

  return (
    <div className="flex items-center gap-1.5">
      <button onClick={() => onChange(Math.max(1, page - 1))} disabled={page === 1}
        className="flex items-center gap-1 px-3 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
        <ChevronLeft className="w-4 h-4" /> Prev
      </button>
      {pages.map((p, i) =>
        p === "…"
          ? <span key={`e${i}`} className="px-1 text-muted-foreground text-sm">…</span>
          : <button key={p} onClick={() => onChange(p as number)}
              className={`w-8 h-8 rounded-lg border text-xs font-medium transition-all ${page === p ? "bg-primary border-primary text-white" : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"}`}>
              {p}
            </button>
      )}
      <button onClick={() => onChange(Math.min(total, page + 1))} disabled={page === total}
        className="flex items-center gap-1 px-3 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
        Next <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

function formatExactTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}
function hoursLabel(h: number): string {
  if (h < 1)  return "Just now";
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ─────────────────────────────────────────────────────────────────────────────
export default function LeadsPage() {
  const [niches,          setNiches]         = useState<string[]>([]);
  const [maxHours,        setMaxHours]       = useState(24);
  const [keyword,         setKeyword]        = useState("");
  const [forMe,           setForMe]          = useState(false);
  const [minMatch,        setMinMatch]       = useState(0);
  const [hasEmail,        setHasEmail]       = useState(false);
  const [hasBudget,       setHasBudget]      = useState(false);
  const [leads,           setLeads]          = useState<AggregatedLead[]>([]);
  const [loading,         setLoading]        = useState(false);
  const [error,           setError]          = useState("");
  const [limitHit,        setLimitHit]       = useState<{ nextReset: string | null } | null>(null);
  const [usage,           setUsage]          = useState<UsageStats | null>(null);
  const [showBonus,       setShowBonus]      = useState(false);
  const [fetchedAt,       setFetchedAt]      = useState("");
  const [savingId,        setSavingId]       = useState<string | null>(null);
  const [savedIds,        setSavedIds]       = useState<Set<string>>(new Set());
  const [showFilters,     setShowFilters]    = useState(false);
  const [searched,        setSearched]       = useState(false);
  const [page,            setPage]           = useState(1);
  const [activeTab,       setActiveTab]      = useState<"leads" | "contacts">("leads");
  const [diagnostics,     setDiagnostics]    = useState<SearchDiagnostics | null>(null);
  const [showDiag,        setShowDiag]       = useState(false);
  const [selectedSources, setSelectedSources] = useState<LeadSource[]>([]);
  const [sortBy,          setSortBy]         = useState<SortOption>("freshest");
  const [showSortMenu,    setShowSortMenu]   = useState(false);
  const [nicheFilter,     setNicheFilter]    = useState<string | null>(null);
  const [expandedIds,     setExpandedIds]    = useState<Set<string>>(new Set());
  const [searchCooldown,  setSearchCooldown] = useState(0);
  const [forceCooldown,   setForceCooldown]  = useState(0);

  const resultsTopRef = useRef<HTMLDivElement>(null);
  const {
    appliedByUrl,
    countsByUrl,
    loadingUrl: applyingUrl,
    pendingPrompt,
    markApplied,
    rememberOpenedPost,
    closePrompt,
    confirmPromptApplied,
  } = useLeadApplications(leads.map(lead => ({ title: lead.title, url: lead.url })));

  // Cooldown tickers
  useEffect(() => {
    if (searchCooldown <= 0) return;
    const t = setInterval(() => setSearchCooldown(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [searchCooldown]);
  useEffect(() => {
    if (forceCooldown <= 0) return;
    const t = setInterval(() => setForceCooldown(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [forceCooldown]);

  const refreshUsage = useCallback(async () => {
    try {
      const res = await fetch("/api/usage", { cache: "no-store" });
      const data = res.ok ? await res.json() as UsageStats : null;
      if (data?.plan) setUsage(data);
    } catch {}
  }, []);

  useEffect(() => {
    void refreshUsage();
  }, [refreshUsage]);

  // Filtered + sorted leads
  const filteredLeads = useMemo(() => {
    let r = leads;
    if (selectedSources.length > 0)
      r = r.filter(l => selectedSources.includes(l.source as LeadSource));
    if (nicheFilter)
      r = r.filter(l => l.niche === nicheFilter);
    if (forMe)        r = r.filter(l => l.confidence >= 55);
    if (minMatch > 0) r = r.filter(l => l.confidence >= minMatch);
    if (hasEmail)     r = r.filter(l => !!l.email);
    if (hasBudget)    r = r.filter(l => !!l.budget);
    if (keyword.trim()) {
      const kw = keyword.toLowerCase();
      r = r.filter(l =>
        (l.title ?? "").toLowerCase().includes(kw) ||
        (l.description ?? "").toLowerCase().includes(kw) ||
        (l.company ?? "").toLowerCase().includes(kw) ||
        (l.tags ?? []).some(t => (t ?? "").toLowerCase().includes(kw))
      );
    }
    // Sort
    switch (sortBy) {
      case "best-match":   r = [...r].sort((a, b) => b.confidence - a.confidence); break;
      case "best-quality": r = [...r].sort((a, b) => b.qualityScore - a.qualityScore); break;
      case "has-budget":   r = [...r].sort((a, b) => (b.budget ? 1 : 0) - (a.budget ? 1 : 0)); break;
      default:             r = [...r].sort((a, b) => a.hoursAgo - b.hoursAgo); break;
    }
    return r;
  }, [leads, selectedSources, nicheFilter, forMe, minMatch, hasEmail, hasBudget, keyword, sortBy]);

  // Source counts for chips
  const sourceCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const l of leads) counts[l.source] = (counts[l.source] ?? 0) + 1;
    return counts;
  }, [leads]);

  // All niches present in results
  const uniqueNiches = useMemo(() => [...new Set(leads.map(l => l.niche))], [leads]);

  const totalPages       = Math.max(1, Math.ceil(filteredLeads.length / PAGE_SIZE));
  const currentPageLeads = filteredLeads.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const contacts: ContactInfo[] = useMemo(() =>
    filteredLeads
      .filter(l => l.email)
      .map(l => ({ company: l.company, email: l.email, phone: undefined, domain: l.domain, title: l.title, url: l.url, lead: l })),
    [filteredLeads]
  );

  const budgetCount  = useMemo(() => filteredLeads.filter(l => l.budget).length, [filteredLeads]);
  const urgentCount  = useMemo(() => filteredLeads.filter(l => l.urgency).length, [filteredLeads]);
  const highQualityCount = useMemo(
    () => filteredLeads.filter(l => (l.confidence ?? 0) >= 80).length,
    [filteredLeads]
  );

  const handlePageChange = (p: number) => {
    setPage(p);
    setTimeout(() => resultsTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  const handleSearch = useCallback(async (opts: { freshOnly?: boolean } = {}) => {
    if (niches.length === 0) { setError("Please select at least one niche."); return; }
    if (!opts.freshOnly && searchCooldown > 0) return;
    if (opts.freshOnly  && forceCooldown  > 0) return;

    setError(""); setLimitHit(null); setLoading(true); setPage(1); setSearched(true);
    setNicheFilter(null); setExpandedIds(new Set());

    try {
      const res = await fetch("/api/leads/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niches, maxHours, minConfidence: 45, freshOnly: !!opts.freshOnly }),
      });

      type SearchResponse = {
        leads?: AggregatedLead[];
        usage?: UsageStats;
        fetchedAt?: string;
        error?: string;
        upgrade?: boolean;
        nextReset?: string;
        diagnostics?: SearchDiagnostics;
      };
      const data = await res.json() as SearchResponse;

      if (res.status === 429) {
        setLimitHit({ nextReset: data.nextReset ?? null });
        setShowBonus(true);
        return;
      }
      if (!res.ok) throw new Error(data.error ?? "Failed to fetch leads");

      const foundLeads = data.leads ?? [];
      setLeads(foundLeads);
      setUsage(data.usage ?? null);
      setFetchedAt(data.fetchedAt ?? "");
      setDiagnostics(data.diagnostics ?? null);
      setSelectedSources([]);
      const searchDetails = {
        lead_type: "remote_job",
        search_term: niches.join(", "),
        result_count: foundLeads.length,
        range_hours: maxHours,
        fresh_only: Boolean(opts.freshOnly),
      };
      trackAnalyticsEvent("search", searchDetails);
      trackAnalyticsEvent("lead_search", searchDetails);

      if (!opts.freshOnly) setSearchCooldown(SEARCH_COOLDOWN_SECS);
      else                 setForceCooldown(FORCE_COOLDOWN_SECS);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [niches, maxHours, searchCooldown, forceCooldown]);

  const handleSave = useCallback(async (lead: AggregatedLead) => {
    if (savedIds.has(lead.id)) return;
    setSavingId(lead.id);
    try {
      const res = await fetch("/api/leads/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: lead.company, domain: lead.domain, email: lead.email,
          confidence: lead.confidence, qualityScore: lead.qualityScore,
          niche: lead.niche, title: lead.title, sourceUrl: lead.url, source: lead.source,
        }),
      });
      if (res.ok) setSavedIds(prev => new Set([...prev, lead.id]));
    } catch { /* silent */ } finally { setSavingId(null); }
  }, [savedIds]);

  const toggleExpand = (id: string) => setExpandedIds(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const activeFilters = (forMe ? 1 : 0) + (minMatch > 0 ? 1 : 0) + (hasEmail ? 1 : 0) + (hasBudget ? 1 : 0) + (keyword ? 1 : 0);
  const allSourceKeys = Object.keys(ALL_SOURCE_LABELS) as LeadSource[];

  return (
    <div className="dashboard-page">
      <AppliedReturnPrompt
        lead={pendingPrompt}
        loading={!!pendingPrompt && applyingUrl === pendingPrompt.url}
        onYes={confirmPromptApplied}
        onNo={closePrompt}
      />
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Zap className="w-6 h-6 text-primary-light" />
            Find Leads
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Real-time opportunities from live channels — matched to your niche
          </p>
        </div>
        {fetchedAt && (
          <span className="text-xs text-muted-foreground mt-1 hidden sm:flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            Fetched {formatExactTime(fetchedAt)}
          </span>
        )}
      </div>

      {/* Usage bar */}
      {usage && (
        <div className="dashboard-control-panel rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground capitalize">{usage.plan} Plan</span>
            <span className="text-xs text-muted-foreground">{usage.used} / {usage.limit} leads today</span>
          </div>
          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all ${usage.percentage > 80 ? "bg-destructive" : "bg-gradient-hero"}`}
              style={{ width: `${Math.min(100, usage.percentage)}%` }} />
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-muted-foreground">{usage.remaining} remaining</span>
            {usage.plan === "free" && (
              <Link href="/dashboard/upgrade" className="text-xs text-primary-light hover:underline font-medium">
                Upgrade for higher daily limits →
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Niches */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
          1. Niches <span className="text-foreground/60 normal-case font-normal">(pick one or more)</span>
        </h2>
        <NicheSelector selected={niches} onChange={setNiches} maxSelect={10} />
      </section>

      {/* Time range + Filters — horizontally scrollable on mobile */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest flex-shrink-0 hidden sm:block">Range:</span>
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide flex-1 min-w-0 pb-0.5">
          {HOUR_OPTIONS.map(opt => (
            <button key={opt.value} onClick={() => setMaxHours(opt.value)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all ${maxHours === opt.value ? "bg-primary border-primary text-white shadow-glow-primary/20" : "bg-surface border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"}`}>
              {opt.label}
            </button>
          ))}
        </div>
        <button onClick={() => setShowFilters(f => !f)}
          className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all relative ${showFilters ? "bg-primary/10 border-primary/40 text-primary-light" : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"}`}>
          <Filter className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Filters</span>
          {activeFilters > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">
              {activeFilters}
            </span>
          )}
          <ChevronDown className={`w-3 h-3 transition-transform ${showFilters ? "rotate-180" : ""}`} />
        </button>
      </div>

      {/* Advanced filters panel */}
      {showFilters && (
        <div className="dashboard-control-panel rounded-xl p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up">
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-2">Keyword Filter</label>
            <div className="relative">
              <input value={keyword} onChange={e => { setKeyword(e.target.value); setPage(1); }}
                placeholder="React, Figma, WordPress…"
                className="dashboard-field w-full pl-3 pr-8 py-2 border rounded-lg text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20" />
              {keyword && (
                <button onClick={() => setKeyword("")} className="absolute right-2 top-2.5 text-muted-foreground hover:text-foreground">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-2">
              Min Match Score: <span className="text-primary-light font-bold">{minMatch}%</span>
            </label>
            <input type="range" min={0} max={80} step={10} value={minMatch}
              onChange={e => { setMinMatch(Number(e.target.value)); setPage(1); }}
              className="w-full accent-primary mt-1" />
            <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
              <span>Any</span><span>50%</span><span>80%</span>
            </div>
          </div>
          <div className="flex flex-col gap-3 justify-center">
            {[
              { val: forMe,     set: setForMe,     icon: <TrendingUp className="w-3.5 h-3.5 text-primary-light" />, label: "High Match Only",  color: "bg-primary" },
              { val: hasEmail,  set: setHasEmail,  icon: <Mail className="w-3.5 h-3.5 text-accent" />,             label: "Has Email",         color: "bg-accent" },
              { val: hasBudget, set: setHasBudget, icon: <DollarSign className="w-3.5 h-3.5 text-green-400" />,   label: "Has Budget",        color: "bg-green-500" },
            ].map(({ val, set, icon, label, color }) => (
              <label key={label} className="flex items-center gap-2.5 cursor-pointer">
                <div className={`w-9 h-5 rounded-full transition-colors relative ${val ? color : "bg-muted"}`}
                  onClick={() => { set((v: boolean) => !v); setPage(1); }}>
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${val ? "left-4" : "left-0.5"}`} />
                </div>
                <span className="text-sm text-foreground flex items-center gap-1.5">{icon} {label}</span>
              </label>
            ))}
          </div>
          <div className="flex items-end">
            <button onClick={() => { setKeyword(""); setMinMatch(0); setForMe(false); setHasEmail(false); setHasBudget(false); setPage(1); }}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border hover:border-primary/30 transition-all">
              <X className="w-3 h-3" /> Clear Filters
            </button>
          </div>
        </div>
      )}

      {/* Search buttons */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => void handleSearch()}
          disabled={loading || niches.length === 0 || searchCooldown > 0}
          className="flex items-center gap-2.5 px-8 py-3.5 rounded-xl bg-primary hover:bg-primary-light text-white font-semibold text-sm transition-all shadow-glow-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none group">
          {loading
            ? <><RefreshCw className="w-4 h-4 animate-spin" /> Scanning sources…</>
            : searchCooldown > 0
              ? <><Timer className="w-4 h-4" /> Retry in {fmtCooldown(searchCooldown)}</>
              : <><Search className="w-4 h-4 group-hover:scale-110 transition-transform" /> Find Real Leads</>
          }
        </button>
        {searched && !loading && (
          <button
            onClick={() => void handleSearch({ freshOnly: true })}
            disabled={forceCooldown > 0}
            className="flex items-center gap-1.5 px-4 py-3 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            title="Bypass cache and pull fresh">
            {forceCooldown > 0
              ? <><Timer className="w-3.5 h-3.5" /> Available in {fmtCooldown(forceCooldown)}</>
              : <><RefreshCw className="w-3.5 h-3.5" /> Force Refresh</>
            }
          </button>
        )}
        {leads.length > 0 && !loading && (
          <button
            onClick={() => exportLeadsCSV(filteredLeads)}
            className="ml-auto flex items-center gap-1.5 px-4 py-3 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:border-accent/40 transition-all">
            <Download className="w-3.5 h-3.5" />
            Export {filteredLeads.length} leads
          </button>
        )}
      </div>

      {/* Daily limit hit banner */}
      {limitHit && (
        <div className="rounded-2xl border border-gold/30 bg-gradient-to-br from-gold/8 to-primary/5 p-5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-gold/15 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-gold" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-foreground mb-1">You&apos;ve used your {usage?.limit ?? 100} free leads today</p>
              <p className="text-muted-foreground text-sm mb-3">
                Free plan resets every 24 hours.
                {limitHit.nextReset && (
                  <> Resets at <strong className="text-foreground">{new Date(limitHit.nextReset).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</strong> today.</>
                )}
              </p>
              <button
                type="button"
                onClick={() => setShowBonus(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary-light text-sm font-semibold transition-all hover:bg-primary/15"
              >
                <Sparkles className="w-4 h-4" />
                {usage?.shareBonusClaimed ? "Request more leads" : "Unlock +300 free leads"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 text-destructive bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Auto-broadened banner */}
      {diagnostics?.autoBroadened && leads.length > 0 && (
        <div className="flex items-start gap-3 text-foreground bg-gold/5 border border-gold/20 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-gold" />
          <p className="text-sm">
            {diagnostics.broadenReason === "thin" ? (
              <>
                Only <strong>{diagnostics.initialResultCount ?? 0}</strong> strong match{(diagnostics.initialResultCount ?? 0) === 1 ? "" : "es"} appeared in the last <strong>{diagnostics.requestedMaxHours}h</strong>,
                so iCloseLeads added the best nearby matches from the last <strong>{Math.round((diagnostics.effectiveMaxHours ?? 168) / 24)} days</strong>.
              </>
            ) : (
              <>
                Nothing strong appeared in the last <strong>{diagnostics.requestedMaxHours}h</strong> for these niches,
                so iCloseLeads added the best nearby matches from the last <strong>{Math.round((diagnostics.effectiveMaxHours ?? 168) / 24)} days</strong>.
              </>
            )}
          </p>
        </div>
      )}

      {/* Results */}
      {leads.length > 0 && (
        <>
          {/* Source filter chips — horizontally scrollable on mobile */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-0.5">
            <span className="text-xs text-muted-foreground font-medium flex-shrink-0">Sources:</span>
            <button
              onClick={() => { setSelectedSources([]); setPage(1); }}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${selectedSources.length === 0 ? "bg-primary border-primary text-white" : "border-border text-muted-foreground hover:border-primary/40"}`}>
              All ({leads.length})
            </button>
            {allSourceKeys.filter(s => (sourceCounts[s] ?? 0) > 0).map(s => (
              <button key={s}
                onClick={() => {
                  setSelectedSources(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
                  setPage(1);
                }}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${
                  selectedSources.includes(s)
                    ? SOURCE_COLORS[s] ?? "bg-primary/15 text-primary-light border-primary/30"
                    : "border-border text-muted-foreground hover:border-primary/30"
                }`}>
                {ALL_SOURCE_LABELS[s]} ({sourceCounts[s] ?? 0})
              </button>
            ))}
          </div>

          {/* Summary + tabs + sort */}
          <div ref={resultsTopRef} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 scroll-mt-4">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <BarChart3 className="w-4 h-4 text-primary-light" />
                {filteredLeads.length} leads found
              </div>
              {contacts.length > 0 && (
                <span className="text-xs px-2.5 py-1 rounded-full bg-accent/10 text-accent border border-accent/20 font-medium">
                  {contacts.length} with email
                </span>
              )}
              {budgetCount > 0 && (
                <span className="text-xs px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 font-medium flex items-center gap-1">
                  <DollarSign className="w-3 h-3" /> {budgetCount} with budget
                </span>
              )}
              {urgentCount > 0 && (
                <span className="text-xs px-2.5 py-1 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 font-medium flex items-center gap-1">
                  <Flame className="w-3 h-3" /> {urgentCount} urgent
                </span>
              )}
              {highQualityCount > 0 && (
                <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary-light border border-primary/20 font-medium flex items-center gap-1">
                  <Star className="w-3 h-3" /> {highQualityCount} high match
                </span>
              )}
              {diagnostics && (
                <button onClick={() => setShowDiag(v => !v)}
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 px-2 py-1 rounded-md border border-border hover:border-primary/30 transition-all">
                  Sources ({diagnostics.sources.filter(s => s.ok).length}/{diagnostics.sources.length})
                  <ChevronDown className={`w-3 h-3 transition-transform ${showDiag ? "rotate-180" : ""}`} />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* Sort dropdown */}
              <div className="relative">
                <button onClick={() => setShowSortMenu(v => !v)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all">
                  <ArrowUpDown className="w-3.5 h-3.5" />
                  {SORT_OPTIONS.find(o => o.value === sortBy)?.label}
                  <ChevronDown className={`w-3 h-3 transition-transform ${showSortMenu ? "rotate-180" : ""}`} />
                </button>
                {showSortMenu && (
                  <div className="absolute right-0 top-full mt-1 z-50 bg-surface border border-border rounded-xl shadow-card-hover min-w-[160px] overflow-hidden">
                    {SORT_OPTIONS.map(opt => (
                      <button key={opt.value} onClick={() => { setSortBy(opt.value); setShowSortMenu(false); setPage(1); }}
                        className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 text-xs font-medium transition-colors hover:bg-white/5 ${sortBy === opt.value ? "text-primary-light bg-white/5" : "text-foreground"}`}>
                        {opt.label}
                        {sortBy === opt.value && <CheckCircle className="w-3 h-3 text-accent" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {/* Tab switcher */}
              <div className="flex items-center bg-surface border border-border rounded-lg overflow-hidden">
                <button onClick={() => setActiveTab("leads")}
                  className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold transition-colors ${activeTab === "leads" ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"}`}>
                  <Search className="w-3.5 h-3.5" /> Leads ({filteredLeads.length})
                </button>
                <button onClick={() => setActiveTab("contacts")}
                  className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold transition-colors ${activeTab === "contacts" ? "bg-accent text-background" : "text-muted-foreground hover:text-foreground"}`}>
                  <Users className="w-3.5 h-3.5" /> Contacts ({contacts.length})
                </button>
              </div>
            </div>
          </div>

          {/* Source diagnostics panel */}
          {showDiag && diagnostics && (
            <div className="bg-surface border border-border rounded-xl p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 animate-fade-in-up">
              {diagnostics.sources.map(s => (
                <div key={s.source}
                  className={`flex items-center justify-between gap-2 text-xs px-3 py-2 rounded-lg border ${s.ok ? "border-border bg-background/50" : "border-destructive/30 bg-destructive/5"}`}>
                  <span className="flex items-center gap-1.5">
                    {s.ok ? <CheckCircle className="w-3 h-3 text-accent" /> : <AlertCircle className="w-3 h-3 text-destructive" />}
                    <span className="text-foreground font-medium">{ALL_SOURCE_LABELS[s.source as LeadSource] ?? s.source}</span>
                  </span>
                  <span className={`font-mono ${s.ok ? "text-muted-foreground" : "text-destructive"}`}>
                    {s.ok ? `${s.kept}/${s.fetched}` : "error"}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Niche filter chips (when multiple niches in results) */}
          {uniqueNiches.length > 1 && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xs text-muted-foreground font-medium">Niche:</span>
              <button onClick={() => { setNicheFilter(null); setPage(1); }}
                className={`px-3 py-1 rounded-full border text-xs font-medium transition-all ${!nicheFilter ? "bg-primary/15 border-primary/40 text-primary-light" : "border-border text-muted-foreground hover:border-primary/30"}`}>
                All
              </button>
              {uniqueNiches.map(n => {
                const niche = NICHES.find(x => x.id === n);
                return (
                  <button key={n} onClick={() => { setNicheFilter(n === nicheFilter ? null : n); setPage(1); }}
                    className={`px-3 py-1 rounded-full border text-xs font-medium transition-all flex items-center gap-1 ${nicheFilter === n ? "bg-primary/15 border-primary/40 text-primary-light" : "border-border text-muted-foreground hover:border-primary/30"}`}>
                    {niche?.icon && <span>{niche.icon}</span>}
                    {niche?.label ?? n}
                  </button>
                );
              })}
            </div>
          )}

          {/* ── LEADS TAB ── */}
          {activeTab === "leads" && (
            <>
              <div className="space-y-3">
                {currentPageLeads.map((lead, index) => {
                  const isSaved    = savedIds.has(lead.id);
                  const isSaving   = savingId === lead.id;
                  const isExpanded = expandedIds.has(lead.id);
                  const descLong   = lead.description.length > 180;
                  const nextStep   = leadNextStep(lead);
                  const hasApplied = !!appliedByUrl[lead.url];
                  const appliedCount = countsByUrl[lead.url] ?? 0;
                  return (
                    <Fragment key={lead.id}>
                    <div
                      className="dashboard-result-card group border hover:border-primary/35 rounded-xl p-4 sm:p-5 transition-all duration-200">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                        <div className="flex-1 min-w-0">
                          {/* Badges row */}
                          <div className="flex flex-wrap items-center gap-2 mb-2.5">
                            <SourcePill source={lead.source} />
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {hoursLabel(lead.hoursAgo)}
                              <span className="text-border mx-1">·</span>
                              {formatExactTime(lead.postedAt)}
                            </span>
                            <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium ${lead.confidence >= 70 ? "bg-primary/10 text-primary-light border-primary/20" : "bg-muted text-muted-foreground border-border"}`}>
                              <Star className="w-3 h-3" /> {lead.confidence}% match
                            </span>
                            <QualityDot score={lead.qualityScore} />
                            {lead.email && (
                              <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20 font-medium">
                                <Mail className="w-3 h-3" /> Email
                              </span>
                            )}
                            {lead.budget && (
                              <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 font-medium">
                                <DollarSign className="w-3 h-3" /> {lead.budget}
                              </span>
                            )}
                            {lead.urgency && (
                              <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 font-medium">
                                <Flame className="w-3 h-3" /> Urgent
                              </span>
                            )}
                          </div>

                          <h3 className="text-foreground font-semibold text-base leading-snug mb-1 group-hover:text-primary-light transition-colors line-clamp-2">
                            {lead.title}
                          </h3>
                          <p className="text-sm font-medium text-primary-light/80 mb-2 flex items-center gap-1.5">
                            <Globe className="w-3.5 h-3.5 flex-shrink-0" />
                            {lead.company}
                            {lead.domain && lead.domain !== "reddit.com" && lead.domain !== "weworkremotely.com" && (
                              <span className="text-muted-foreground font-normal">· {lead.domain}</span>
                            )}
                          </p>

                          {/* Expandable description */}
                          <div className="text-muted-foreground text-sm leading-relaxed mb-3">
                            <p className={isExpanded ? "" : "line-clamp-2"}>
                              {lead.description}
                            </p>
                            {descLong && (
                              <button onClick={() => toggleExpand(lead.id)}
                                className="text-primary-light text-xs mt-1 hover:underline">
                                {isExpanded ? "Show less" : "Show more"}
                              </button>
                            )}
                          </div>

                          {lead.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-3">
                              {lead.tags.slice(0, 7).map(tag => (
                                <span key={tag} className="px-2 py-0.5 rounded-md bg-surface border border-border text-xs text-muted-foreground">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                          {lead.email && (
                            <div className="flex items-center gap-1.5 text-xs text-accent font-medium">
                              <Mail className="w-3.5 h-3.5" />
                              <span className="font-mono">{lead.email}</span>
                              <CopyButton text={lead.email} />
                            </div>
                          )}
                          <div className="mt-3 flex items-start gap-2 rounded-xl border border-border/60 bg-surface/70 px-3 py-2 text-xs text-muted-foreground">
                            <Target className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-primary-light" />
                            <span><strong className="text-foreground">Next step:</strong> {nextStep}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        {/* Desktop: vertical stack. Mobile: horizontal row below content */}
                        <div className="hidden sm:flex flex-col gap-2 flex-shrink-0 w-[146px]">
                          <a href={lead.url} target="_blank" rel="noopener noreferrer" onClick={() => rememberOpenedPost({ title: lead.title, url: lead.url })}
                            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 text-xs font-medium transition-all">
                            <ExternalLink className="w-3.5 h-3.5" /> Open Post
                          </a>
                          <AppliedButton
                            leadUrl={lead.url}
                            applied={hasApplied}
                            count={appliedCount}
                            loading={applyingUrl === lead.url}
                            onClick={markApplied}
                          />
                          <button onClick={() => void handleSave(lead)} disabled={isSaved || isSaving}
                            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                              isSaved
                                ? "bg-accent/10 text-accent border border-accent/30 cursor-default"
                                : "bg-primary/10 text-primary-light border border-primary/30 hover:bg-primary/20"
                            }`}>
                            {isSaved
                              ? <><CheckCircle className="w-3.5 h-3.5" /> Saved</>
                              : <><Bookmark className="w-3.5 h-3.5" /> {isSaving ? "…" : "Save Lead"}</>
                            }
                          </button>
                          <Link
                            href={`/dashboard/proposal/new?company=${encodeURIComponent(lead.company)}&domain=${encodeURIComponent(lead.domain)}&title=${encodeURIComponent(lead.title)}&description=${encodeURIComponent(lead.description.slice(0, 400))}&url=${encodeURIComponent(lead.url)}&niche=${encodeURIComponent(lead.niche)}&email=${encodeURIComponent(lead.email ?? "")}`}
                            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-hero text-white text-xs font-semibold hover:opacity-90 transition-all shadow-glow-primary/20">
                            <Sparkles className="w-3.5 h-3.5" /> AI Proposal
                          </Link>
                        </div>
                      </div>

                      {/* Mobile action row — full width below content */}
                      <div className="sm:hidden grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-border/50">
                        <a href={lead.url} target="_blank" rel="noopener noreferrer" onClick={() => rememberOpenedPost({ title: lead.title, url: lead.url })}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg border border-border text-muted-foreground text-xs font-medium transition-all active:bg-white/5">
                          <ExternalLink className="w-3.5 h-3.5" /> Open
                        </a>
                        <AppliedButton
                          leadUrl={lead.url}
                          applied={hasApplied}
                          count={appliedCount}
                          loading={applyingUrl === lead.url}
                          onClick={markApplied}
                          compact
                          className="py-2.5"
                        />
                        <button onClick={() => void handleSave(lead)} disabled={isSaved || isSaving}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                            isSaved
                              ? "bg-accent/10 text-accent border border-accent/30"
                              : "bg-primary/10 text-primary-light border border-primary/30 active:bg-primary/20"
                          }`}>
                          {isSaved
                            ? <><CheckCircle className="w-3.5 h-3.5" /> Saved</>
                            : <><Bookmark className="w-3.5 h-3.5" /> {isSaving ? "…" : "Save"}</>
                          }
                        </button>
                        <Link
                          href={`/dashboard/proposal/new?company=${encodeURIComponent(lead.company)}&domain=${encodeURIComponent(lead.domain)}&title=${encodeURIComponent(lead.title)}&description=${encodeURIComponent(lead.description.slice(0, 400))}&url=${encodeURIComponent(lead.url)}&niche=${encodeURIComponent(lead.niche)}&email=${encodeURIComponent(lead.email ?? "")}`}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-gradient-hero text-white text-xs font-semibold transition-all">
                          <Sparkles className="w-3.5 h-3.5" /> AI Proposal
                        </Link>
                      </div>
                    </div>
                    {index === 5 && <LeadResultsAd />}
                    </Fragment>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-2">
                  <p className="text-xs text-muted-foreground">
                    Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredLeads.length)} of {filteredLeads.length}
                  </p>
                  <SmartPagination page={page} total={totalPages} onChange={handlePageChange} />
                </div>
              )}
            </>
          )}

          {/* ── CONTACTS TAB ── */}
          {activeTab === "contacts" && (
            <div className="space-y-4">
              {contacts.length > 0 && (
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">Contact info extracted from postings. Always verify before outreach.</p>
                  <button onClick={() => exportContactsCSV(contacts)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground hover:border-accent/40 transition-all">
                    <Download className="w-3.5 h-3.5" /> Export Contacts CSV
                  </button>
                </div>
              )}
              {contacts.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-border rounded-2xl bg-surface/50">
                  <Mail className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <h3 className="text-foreground font-semibold mb-1">No contact info found</h3>
                  <p className="text-muted-foreground text-sm">Try enabling "Has Email" filter or searching a broader time range.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {contacts.map((c) => {
                    const lead = c.lead;
                    const isSaved  = savedIds.has(lead.id);
                    const isSaving = savingId === lead.id;
                    const nextStep = leadNextStep(lead);

                    return (
                      <div key={lead.id} className="dashboard-result-card border hover:border-accent/35 rounded-xl p-4 transition-all">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <SourcePill source={lead.source} />
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {hoursLabel(lead.hoursAgo)}
                              </span>
                              <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium ${lead.confidence >= 70 ? "bg-primary/10 text-primary-light border-primary/20" : "bg-muted text-muted-foreground border-border"}`}>
                                <Star className="w-3 h-3" /> {lead.confidence}% match
                              </span>
                              <QualityDot score={lead.qualityScore} />
                            </div>
                            <h4 className="text-foreground font-semibold text-sm leading-snug line-clamp-2">{c.title}</h4>
                            <p className="text-primary-light/80 text-xs mt-1 font-medium line-clamp-1">{c.company}</p>
                          </div>
                          <a href={c.url} target="_blank" rel="noopener noreferrer"
                            className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground flex-shrink-0 transition-colors"
                            title="View original posting">
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>

                        <p className="text-muted-foreground text-xs leading-relaxed line-clamp-2 mb-3">
                          {lead.description}
                        </p>
                        <div className="mb-3 flex items-start gap-2 rounded-xl border border-border/60 bg-surface/70 px-3 py-2 text-xs text-muted-foreground">
                          <Target className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-primary-light" />
                          <span><strong className="text-foreground">Next step:</strong> {nextStep}</span>
                        </div>

                        <div className="space-y-1.5">
                          {c.email && (
                            <div className="flex items-center gap-2 p-2 rounded-lg bg-accent/5 border border-accent/10">
                              <Mail className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                              <span className="text-xs font-mono text-accent truncate flex-1">{c.email}</span>
                              <CopyButton text={c.email} />
                            </div>
                          )}
                          {c.phone && (
                            <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/5 border border-primary/10">
                              <Phone className="w-3.5 h-3.5 text-primary-light flex-shrink-0" />
                              <span className="text-xs font-mono text-primary-light flex-1">{c.phone}</span>
                              <CopyButton text={c.phone} />
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
                            <Globe className="w-3 h-3" />
                            <span className="truncate">{c.domain}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-border/50">
                          <a href={lead.url} target="_blank" rel="noopener noreferrer"
                            className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 text-xs font-medium transition-all">
                            <ExternalLink className="w-3.5 h-3.5" /> View
                          </a>
                          <button onClick={() => void handleSave(lead)} disabled={isSaved || isSaving}
                            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                              isSaved
                                ? "bg-accent/10 text-accent border border-accent/30 cursor-default"
                                : "bg-primary/10 text-primary-light border border-primary/30 hover:bg-primary/20"
                            }`}>
                            {isSaved
                              ? <><CheckCircle className="w-3.5 h-3.5" /> Saved</>
                              : <><Bookmark className="w-3.5 h-3.5" /> {isSaving ? "…" : "Save"}</>
                            }
                          </button>
                          <Link
                            href={`/dashboard/proposal/new?company=${encodeURIComponent(lead.company)}&domain=${encodeURIComponent(lead.domain)}&title=${encodeURIComponent(lead.title)}&description=${encodeURIComponent(lead.description.slice(0, 400))}&url=${encodeURIComponent(lead.url)}&niche=${encodeURIComponent(lead.niche)}&email=${encodeURIComponent(lead.email ?? "")}`}
                            className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-gradient-hero text-white text-xs font-semibold hover:opacity-90 transition-all shadow-glow-primary/20">
                            <Sparkles className="w-3.5 h-3.5" /> AI Proposal
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Empty state after search */}
      {!loading && leads.length === 0 && searched && !error && (
        <div className="text-center py-12 bg-surface border border-border border-dashed rounded-2xl px-6">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-primary-light" />
          </div>
          <h3 className="text-foreground font-semibold text-lg mb-2">No high-confidence matches in this window</h3>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-4">
            Try widening the time range to <strong>30d</strong>. We keep weak matches out so the list does not fill with unrelated jobs.
          </p>
          {diagnostics && (
            <div className="max-w-md mx-auto bg-background/50 border border-border rounded-xl p-4 mb-5 text-left">
              <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-primary-light" /> Search diagnostics
              </p>
              <p className="text-xs text-muted-foreground mb-3">
                Scanned {diagnostics.sources.length} sources, found {diagnostics.totalFetched} postings,
                {" "}{diagnostics.totalAfterMinConfidence} matched your niche.
              </p>
              <div className="space-y-1">
                {diagnostics.sources.map(s => (
                  <div key={s.source} className="flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      {s.ok ? <CheckCircle className="w-3 h-3 text-accent" /> : <AlertCircle className="w-3 h-3 text-destructive" />}
                      {ALL_SOURCE_LABELS[s.source as LeadSource] ?? s.source}
                    </span>
                    <span className={`font-mono ${s.ok ? "text-foreground" : "text-destructive"}`}>
                      {s.ok ? `${s.kept}/${s.fetched}` : (s.errorMessage ?? "error")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="flex flex-wrap gap-2 justify-center">
            <button onClick={() => { setMaxHours(72); setMinMatch(0); setHasEmail(false); setHasBudget(false); setKeyword(""); setForMe(false); void handleSearch({ freshOnly: true }); }}
              className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-light transition-all">
              Search Last 72 Hours
            </button>
            <button onClick={() => { setMaxHours(168); setMinMatch(0); setHasEmail(false); setHasBudget(false); setKeyword(""); setForMe(false); void handleSearch({ freshOnly: true }); }}
              className="px-5 py-2.5 rounded-xl border border-border text-sm font-medium hover:border-primary/40 transition-all">
              Search Last 7 Days
            </button>
            <button onClick={() => { setMaxHours(720); setMinMatch(0); setHasEmail(false); setHasBudget(false); setKeyword(""); setForMe(false); void handleSearch({ freshOnly: true }); }}
              className="px-5 py-2.5 rounded-xl border border-border text-sm font-medium hover:border-primary/40 transition-all">
              Search Last 30 Days
            </button>
          </div>
        </div>
      )}

      {/* Initial state */}
      {!searched && !loading && (
        <div className="text-center py-12 border border-dashed border-border rounded-xl bg-card/70">
          <div className="w-14 h-14 rounded-2xl bg-gradient-hero flex items-center justify-center mx-auto mb-4 shadow-glow-primary">
            <Zap className="w-7 h-7 text-white" />
          </div>
          <h3 className="text-foreground font-semibold mb-2">Ready to find your next client?</h3>
          <p className="text-muted-foreground text-sm mb-4">
            {niches.length === 0
              ? <>Pick one or more niches above and hit <strong>Find Real Leads</strong></>
              : <>{niches.length} niche{niches.length === 1 ? "" : "s"} selected — hit <strong>Find Real Leads</strong></>}
          </p>
          <div className="flex flex-wrap gap-1.5 justify-center max-w-lg mx-auto">
            {Object.entries(ALL_SOURCE_LABELS).map(([key, label]) => (
              <span key={key}
                className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${SOURCE_COLORS[key] ?? "bg-muted text-muted-foreground border-border"}`}>
                {label}
              </span>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">Scanning live channels in parallel</p>
        </div>
      )}
      </div>

      <BonusLeadsModal
        isOpen={showBonus}
        onClose={() => setShowBonus(false)}
        onBonusClaimed={async () => {
          setLimitHit(null);
          await refreshUsage();
        }}
        source="remote-leads"
        currentPlan={usage?.plan ?? "free"}
      />
    </div>
  );
}
