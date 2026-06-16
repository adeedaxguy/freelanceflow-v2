"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Radio, RefreshCw, Clock, Globe, Mail, ExternalLink, Bookmark,
  CheckCircle, Sparkles, Star, Filter, ChevronDown, X,
  ChevronLeft, ChevronRight, Zap, AlertCircle, Copy, Target,
  TrendingUp, Lock, Heart, BarChart2, Rss, ArrowRight,
} from "lucide-react";
import Link from "next/link";
import type { AggregatedLead } from "@/lib/leads-aggregator";
import BonusLeadsModal from "@/components/BonusLeadsModal";

const LIVE_NICHES = [
  "web-development","mobile-apps","ui-ux-design","data-science",
  "devops","copywriting","seo","graphic-design","social-media",
  "shopify","wordpress","email-marketing","meta-ads",
];
const NICHE_LABELS: Record<string, string> = {
  "web-development": "Web Dev", "mobile-apps": "Mobile Apps",
  "ui-ux-design": "UI/UX", "data-science": "Data Science",
  "devops": "DevOps", "copywriting": "Copywriting",
  "seo": "SEO", "graphic-design": "Graphic Design",
  "social-media": "Social Media", "shopify": "Shopify",
  "wordpress": "WordPress", "email-marketing": "Email Marketing",
  "meta-ads": "Meta Ads",
};

// All possible sources with display labels
const ALL_SOURCES: { id: string; label: string }[] = [
  { id: "remoteok",      label: "RemoteOK" },
  { id: "remotive",      label: "Remotive" },
  { id: "reddit",        label: "Reddit" },
  { id: "weworkremotely",label: "We Work Remotely" },
  { id: "arbeitnow",     label: "Arbeitnow" },
  { id: "jobicy",        label: "Jobicy" },
  { id: "workingnomads", label: "Working Nomads" },
  { id: "hackernews",    label: "HackerNews" },
  { id: "ycjobs",        label: "YC Jobs" },
  { id: "authenticjobs", label: "Authentic Jobs" },
  { id: "githubissues",  label: "GitHub Issues" },
  { id: "freelancermap", label: "Jobspresso" },
  { id: "smashingjobs",  label: "Smashing Jobs" },
  { id: "dribbble",      label: "Dribbble" },
  { id: "himalayas",     label: "Himalayas" },
  { id: "nodesk",        label: "No Desk" },
];

const PAGE_SIZE    = 25;
const COOLDOWN_MS  = 2 * 60 * 1000;
const COOLDOWN_KEY = "ff_live_last_search";
const SEEN_KEY     = "ff_seen_lead_ids";
const PREFS_KEY    = "ff_best_match_prefs";
const SS_LIVE_KEY  = "ff_ss_live_results";

interface BestMatchPrefs {
  minConfidence: number;
  preferRemote: boolean;
  requireEmail: boolean;
  preferShortTerm: boolean;
  preferredNiches: string[];
}
interface UsageStats {
  plan: string;
  limit: number;
  used: number;
  remaining: number;
  nextReset: string;
  percentage: number;
}
const DEFAULT_PREFS: BestMatchPrefs = {
  minConfidence: 40,
  preferRemote: true,
  requireEmail: false,
  preferShortTerm: false,
  preferredNiches: [],
};

function calcBestMatch(lead: AggregatedLead, prefs: BestMatchPrefs): number {
  let score = (lead.confidence / 100) * 40;
  score += ((lead.qualityScore ?? lead.confidence) / 100) * 20;
  if (lead.email) score += 15;
  if ((prefs.preferredNiches ?? []).length > 0 && (prefs.preferredNiches ?? []).includes(lead.niche)) score += 15;
  if (lead.confidence < prefs.minConfidence) score *= 0.5;
  if (prefs.requireEmail && !lead.email) score *= 0.4;
  const t = (lead.title ?? "").toLowerCase();
  if (prefs.preferShortTerm && (t.includes("quick")||t.includes("small")||t.includes("gig"))) score += 5;
  if (prefs.preferRemote && (t.includes("remote")||false)) score += 5;
  return Math.min(100, Math.round(score));
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g," ").replace(/&[a-z]+;/gi," ").replace(/\s+/g," ").trim();
}
function hoursLabel(h: number) {
  if (h < 1) return "Just now";
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h/24)}d ago`;
}
function formatExact(iso: string) {
  return new Date(iso).toLocaleString(undefined,{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"});
}

function CopyButton({ text }: { text: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button onClick={() => void navigator.clipboard.writeText(text).then(()=>{setOk(true);setTimeout(()=>setOk(false),1500);})}
      className="ml-1 p-0.5 rounded text-muted-foreground hover:text-accent transition-colors">
      {ok ? <CheckCircle className="w-3 h-3 text-accent"/> : <Copy className="w-3 h-3"/>}
    </button>
  );
}

function BestMatchBadge({ score }: { score: number }) {
  if (score >= 80) return (
    <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 text-primary-light border border-primary/30 font-semibold">
      <Target className="w-3 h-3"/> Best Match
    </span>
  );
  if (score >= 65) return (
    <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary-light border border-primary/20 font-medium">
      <TrendingUp className="w-3 h-3"/> Good Match
    </span>
  );
  return null;
}

function BestMatchModal({ prefs, onSave, onClose }: {
  prefs: BestMatchPrefs; onSave: (p:BestMatchPrefs)=>void; onClose: ()=>void;
}) {
  const [local, setLocal] = useState<BestMatchPrefs>({...prefs});
  const niches = ["web-development","mobile-apps","ui-ux-design","data-science","devops","copywriting","seo","shopify","wordpress","meta-ads"];
  function toggleNiche(n: string) {
    setLocal(p=>({...p,preferredNiches:p.preferredNiches.includes(n)?p.preferredNiches.filter(x=>x!==n):[...p.preferredNiches,n]}));
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-surface border border-border rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-foreground font-bold text-lg flex items-center gap-2">
              <Target className="w-5 h-5 text-primary-light"/> Best Match Settings
            </h3>
            <p className="text-muted-foreground text-xs mt-0.5">Set preferences to score leads automatically</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5"/></button>
        </div>
        <div>
          <label className="text-sm font-medium text-foreground flex justify-between mb-1.5">
            Minimum Match Score <span className="text-primary-light font-bold">{local.minConfidence}%</span>
          </label>
          <input type="range" min={20} max={80} step={10} value={local.minConfidence}
            onChange={e=>setLocal(p=>({...p,minConfidence:Number(e.target.value)}))} className="w-full accent-primary"/>
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>20% (More leads)</span><span>80% (Highest quality)</span>
          </div>
        </div>
        {([
          {key:"preferRemote",   label:"Prefer remote opportunities",  Icon:Globe},
          {key:"requireEmail",   label:"Require contact email",        Icon:Mail},
          {key:"preferShortTerm",label:"Prefer quick/short-term gigs", Icon:Zap},
        ] as const).map(({key,label,Icon})=>(
          <div key={key} className="flex items-center justify-between">
            <span className="text-sm text-foreground flex items-center gap-2">
              <Icon className="w-3.5 h-3.5 text-muted-foreground"/> {label}
            </span>
            <div className={`w-9 h-5 rounded-full transition-colors cursor-pointer relative ${local[key]?"bg-accent":"bg-muted"}`}
              onClick={()=>setLocal(p=>({...p,[key]:!p[key]}))}>
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${local[key]?"left-4":"left-0.5"}`}/>
            </div>
          </div>
        ))}
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">Preferred Niches</label>
          <div className="flex flex-wrap gap-1.5">
            {niches.map(n=>(
              <button key={n} onClick={()=>toggleNiche(n)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${local.preferredNiches.includes(n)?"bg-primary/20 border-primary/40 text-primary-light":"border-border text-muted-foreground hover:border-primary/30"}`}>
                {n.replace(/-/g," ")}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3 pt-2 border-t border-border">
          <button onClick={()=>setLocal({...DEFAULT_PREFS})}
            className="flex-1 py-2 rounded-xl border border-border text-muted-foreground text-sm hover:text-foreground transition-all">
            Reset
          </button>
          <button onClick={()=>{onSave(local);onClose();}}
            className="flex-1 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-light transition-all">
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LiveJobsPage() {
  const [leads,           setLeads]           = useState<AggregatedLead[]>([]);
  const [loading,         setLoading]         = useState(false);
  const [error,           setError]           = useState("");
  const [limitHit,        setLimitHit]        = useState<{nextReset:string|null}|null>(null);
  const [showBonus,       setShowBonus]       = useState(false);
  const [page,            setPage]            = useState(1);
  const [savedIds,        setSavedIds]        = useState<Set<string>>(new Set());
  const [savingId,        setSavingId]        = useState<string|null>(null);
  const [saveError,       setSaveError]       = useState<string|null>(null);
  const [fetchedAt,       setFetchedAt]       = useState("");
  const [hasEmail,        setHasEmail]        = useState(false);
  const [minScore,        setMinScore]        = useState(0);
  const [showFilter,      setShowFilter]      = useState(false);
  const [sortBy,          setSortBy]          = useState<"newest"|"bestMatch"|"confidence">("newest");
  const [countdown,       setCountdown]       = useState(0);
  const [seenIds,         setSeenIds]         = useState<Set<string>>(new Set());
  const [prefs,           setPrefs]           = useState<BestMatchPrefs>(DEFAULT_PREFS);
  const [showBMModal,     setShowBMModal]     = useState(false);
  const [favIds,          setFavIds]          = useState<Set<string>>(new Set());
  const [selectedNiches,  setSelectedNiches]  = useState<string[]>(LIVE_NICHES);
  const [maxHours,        setMaxHours]        = useState(72);
  const [activeSources,   setActiveSources]   = useState<string[]>([]);
  const [totalFound,      setTotalFound]      = useState(0);
  const [usage,           setUsage]           = useState<UsageStats | null>(null);
  // Source filter — "all" or one specific source id
  const [sourceFilter,    setSourceFilter]    = useState<string>("all");

  const prevSeenRef = useRef<Set<string>>(new Set());
  const timerRef    = useRef<ReturnType<typeof setInterval>|null>(null);

  useEffect(() => {
    try {
      // Clear stale lead caches on schema changes
      if (sessionStorage.getItem("icl_cache_v") !== "4") {
        sessionStorage.removeItem("ff_ss_live_results");
        sessionStorage.removeItem("ff_ss_remote_results");
        sessionStorage.removeItem("ff_ss_local_results");
        sessionStorage.setItem("icl_cache_v", "4");
      }
      const p = localStorage.getItem(PREFS_KEY);
      if (p) setPrefs(JSON.parse(p) as BestMatchPrefs);
      const s = localStorage.getItem(SEEN_KEY);
      if (s) { const ids = new Set(JSON.parse(s) as string[]); setSeenIds(ids); prevSeenRef.current = ids; }
      // Restore last results so they persist when switching tabs
      const cached = sessionStorage.getItem(SS_LIVE_KEY);
      if (cached) {
        const { leads: cl, fetchedAt: ft } = JSON.parse(cached) as { leads: AggregatedLead[]; fetchedAt: string };
        setLeads(cl); setFetchedAt(ft);
      }
      const last = parseInt(localStorage.getItem(COOLDOWN_KEY)??"0");
      const elapsed = Date.now() - last;
      if (elapsed < COOLDOWN_MS) setCountdown(Math.ceil((COOLDOWN_MS - elapsed)/1000));
    } catch {}
  }, []);

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

  function startTimer(secs: number) {
    if (timerRef.current) clearInterval(timerRef.current);
    setCountdown(secs);
    timerRef.current = setInterval(()=>{
      setCountdown(c => {
        if (c <= 1) { if (timerRef.current) clearInterval(timerRef.current); return 0; }
        return c - 1;
      });
    }, 1000);
  }

  const fetchLive = useCallback(async (force = false) => {
    if (!force && countdown > 0) return;
    setLoading(true); setError(""); setActiveSources([]); setTotalFound(0);
    const nichesToFetch = selectedNiches.length > 0 ? selectedNiches : LIVE_NICHES;

    try {
      const res = await fetch("/api/leads/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niches: nichesToFetch, maxHours, minConfidence: 45 }),
      });

      if (!res.ok) {
        const d = await res.json().catch(()=>({})) as {error?:string; nextReset?:string};
        if (res.status === 429) {
          setLimitHit({ nextReset: d.nextReset ?? null });
          setShowBonus(true);
        } else {
          setError(d.error ?? "Failed to fetch leads. Please try again.");
        }
        return;
      }

      const data = await res.json() as {
        leads?: AggregatedLead[];
        total?: number;
        activeSources?: string[];
        usage?: UsageStats;
        error?: string;
      };

      const fetched = data.leads ?? [];
      setTotalFound(data.total ?? fetched.length);
      setActiveSources(data.activeSources ?? []);
      if (data.usage) setUsage(data.usage);

      const prev = prevSeenRef.current;
      fetched.sort((a, b) => {
        const aN = !prev.has(a.id), bN = !prev.has(b.id);
        if (aN && !bN) return -1; if (!aN && bN) return 1;
        return a.hoursAgo - b.hoursAgo;
      });

      setLeads(fetched);
      const ft = new Date().toISOString();
      setFetchedAt(ft);
      setPage(1);
      setSourceFilter("all"); // reset source filter on new fetch
      try { sessionStorage.setItem(SS_LIVE_KEY, JSON.stringify({ leads: fetched, fetchedAt: ft })); } catch {}

      const newSeen = new Set([...prev, ...fetched.map(l => l.id)]);
      setSeenIds(newSeen);
      prevSeenRef.current = newSeen;
      try { localStorage.setItem(SEEN_KEY, JSON.stringify([...newSeen].slice(-500))); } catch {}

      if (fetched.length > 0) {
        try { localStorage.setItem(COOLDOWN_KEY, Date.now().toString()); } catch {}
        startTimer(COOLDOWN_MS / 1000);
      }
    } catch {
      setError("Failed to load live jobs. Please try again.");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countdown, selectedNiches, maxHours]);

  function savePrefs(p: BestMatchPrefs) {
    setPrefs(p);
    try { localStorage.setItem(PREFS_KEY, JSON.stringify(p)); } catch {}
  }

  const scored = leads.map(l=>({...l, bmScore: calcBestMatch(l, prefs)}));
  const sorted = [...scored].sort((a,b)=>{
    if (favIds.has(a.id)&&!favIds.has(b.id)) return -1;
    if (!favIds.has(a.id)&&favIds.has(b.id)) return 1;
    if (sortBy==="bestMatch") return b.bmScore-a.bmScore;
    if (sortBy==="confidence") return b.confidence-a.confidence;
    const aN=!seenIds.has(a.id), bN=!seenIds.has(b.id);
    if (aN&&!bN) return -1; if (!aN&&bN) return 1;
    return a.hoursAgo-b.hoursAgo;
  });

  // Apply filters: email, score, and source
  const filtered = sorted.filter(l =>
    (!hasEmail || !!l.email) &&
    l.confidence >= minScore &&
    (sourceFilter === "all" || l.source === sourceFilter)
  );

  // Compute which sources actually appear in fetched leads
  const sourcesInResults = leads.reduce<Record<string, number>>((acc, l) => {
    acc[l.source] = (acc[l.source] ?? 0) + 1;
    return acc;
  }, {});

  const totalPages = Math.max(1, Math.ceil(filtered.length/PAGE_SIZE));
  const current = filtered.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE);
  const isOnCooldown = countdown > 0;
  const mins = Math.floor(countdown/60);
  const secs = countdown % 60;
  const newCount = scored.filter(l=>!seenIds.has(l.id)).length;
  const bestMatchCount = scored.filter(l=>l.bmScore>=80).length;
  const emailCount = leads.filter(l=>!!l.email).length;
  const usagePlanKey = (usage?.plan ?? "").toLowerCase();
  const hasPaidAccess = usagePlanKey === "pro" || usagePlanKey === "agency";
  const accessLabel = usagePlanKey === "agency" ? "Agency" : usagePlanKey === "pro" ? "Pro" : "Early Access";

  const handleSave = async (lead: AggregatedLead & { bmScore: number }) => {
    if (savedIds.has(lead.id)) return;
    setSavingId(lead.id); setSaveError(null);
    try {
      const res = await fetch("/api/leads/save",{
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          company: lead.company.trim().slice(0,200)||"Unknown",
          domain:  (lead.domain??"").trim().slice(0,200)||"unknown.com",
          email:   lead.email?.trim()||null,
          confidence: lead.confidence, qualityScore: lead.qualityScore,
          bestMatchScore: lead.bmScore,
          niche: lead.niche,
          title: (lead.title??"").slice(0,300)||null,
          description: stripHtml(lead.description??"").slice(0,2000)||null,
          sourceUrl: lead.url, source: lead.source,
        }),
      });
      if (res.ok) setSavedIds(p=>new Set([...p,lead.id]));
      else { const d=await res.json().catch(()=>({})) as {error?:string}; setSaveError(d.error??"Save failed"); }
    } catch { setSaveError("Network error"); }
    finally { setSavingId(null); }
  };

  return (
    <>
      {showBMModal && <BestMatchModal prefs={prefs} onSave={savePrefs} onClose={()=>setShowBMModal(false)}/>}
      <div className="p-4 sm:p-6 lg:p-8">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
              <span className="relative flex h-3 w-3 mt-0.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"/>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-accent"/>
              </span>
              Live Jobs Feed
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              16 sources scanned simultaneously · 2 min cooldown
              {newCount > 0 && <span className="ml-2 text-accent font-medium">· {newCount} new since last visit</span>}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {isOnCooldown && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-surface border border-border rounded-lg px-3 py-1.5">
                <Lock className="w-3 h-3 text-primary-light"/>
                <span className="text-primary-light font-mono font-semibold">{mins}:{String(secs).padStart(2,"0")}</span>
                <span className="hidden sm:inline">until refresh</span>
              </div>
            )}
            <button onClick={()=>setShowBMModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-primary/30 bg-primary/5 text-primary-light text-sm font-medium hover:bg-primary/10 transition-all">
              <Target className="w-3.5 h-3.5"/> <span className="hidden sm:inline">Best Match</span>
            </button>
            <select value={sortBy} onChange={e=>setSortBy(e.target.value as typeof sortBy)}
              className="px-3 py-2 rounded-lg border border-border bg-surface text-sm text-foreground focus:outline-none focus:border-primary/40 cursor-pointer">
              <option value="newest">Newest First</option>
              <option value="bestMatch">Best Match</option>
              <option value="confidence">Confidence</option>
            </select>
            <button onClick={()=>setShowFilter(f=>!f)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${showFilter?"bg-primary/10 border-primary/40 text-primary-light":"border-border text-muted-foreground hover:border-primary/30"}`}>
              <Filter className="w-3.5 h-3.5"/> <ChevronDown className={`w-3 h-3 transition-transform ${showFilter?"rotate-180":""}`}/>
            </button>
            <button onClick={()=>void fetchLive()} disabled={loading||isOnCooldown}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${isOnCooldown?"bg-muted border border-border text-muted-foreground cursor-not-allowed opacity-60":"bg-accent/10 border border-accent/20 text-accent hover:bg-accent/20"}`}>
              <RefreshCw className={`w-3.5 h-3.5 ${loading?"animate-spin":""}`}/>
              <span className="hidden sm:inline">{isOnCooldown?"Cooldown":"Refresh"}</span>
            </button>
          </div>
        </div>

        {/* Two-column layout on large screens */}
        <div className="flex flex-col xl:flex-row gap-6 items-start">

          {/* ── Left: main content ── */}
          <div className="flex-1 min-w-0 space-y-4">

            {/* Niche + Time + Scan */}
            <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Globe className="w-4 h-4 text-primary-light"/> Niches
                </span>
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  <select value={maxHours} onChange={e=>{setMaxHours(Number(e.target.value));}}
                    className="px-2.5 py-1.5 rounded-lg border border-border bg-background text-xs sm:text-sm text-foreground focus:outline-none focus:border-primary/40 cursor-pointer">
                    <option value={24}>Last 24h</option>
                    <option value={48}>Last 48h</option>
                    <option value={72}>Last 72h</option>
                    <option value={168}>Last 7 days</option>
                    <option value={720}>Last 30 days</option>
                  </select>
                  <button onClick={()=>setSelectedNiches(LIVE_NICHES)}
                    className="text-xs text-primary-light hover:text-primary font-medium transition-colors">All</button>
                  <button onClick={()=>setSelectedNiches([])}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors">Clear</button>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {LIVE_NICHES.map(n => {
                  const active = selectedNiches.includes(n);
                  return (
                    <button key={n} onClick={()=>setSelectedNiches(prev=>active?prev.filter(x=>x!==n):[...prev,n])}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${active?"bg-primary/15 border-primary/40 text-primary-light":"border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"}`}>
                      {NICHE_LABELS[n] ?? n}
                    </button>
                  );
                })}
              </div>
              <button onClick={()=>void fetchLive(true)} disabled={loading||selectedNiches.length===0}
                className="w-full py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-light transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                <Zap className="w-4 h-4"/>
                {loading ? "Scanning…" : `Scan ${selectedNiches.length} Niche${selectedNiches.length!==1?"s":""} · ${maxHours === 720 ? "30d" : maxHours === 168 ? "7d" : `${maxHours}h`}`}
              </button>
            </div>

            {/* Source filter pills */}
            {leads.length > 0 && !loading && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                  <Rss className="w-3.5 h-3.5 text-primary-light"/> Filter by Source
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => { setSourceFilter("all"); setPage(1); }}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${sourceFilter === "all" ? "bg-primary/15 border-primary/40 text-primary-light" : "border-border text-muted-foreground hover:border-primary/30"}`}
                  >
                    All <span className="text-[10px] opacity-60 ml-0.5">({leads.length})</span>
                  </button>
                  {ALL_SOURCES.filter(s => (sourcesInResults[s.id] ?? 0) > 0).map(s => (
                    <button
                      key={s.id}
                      onClick={() => { setSourceFilter(prev => prev === s.id ? "all" : s.id); setPage(1); }}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${sourceFilter === s.id ? "bg-accent/15 border-accent/40 text-accent" : "border-border text-muted-foreground hover:border-accent/30 hover:text-foreground"}`}
                    >
                      {s.label}
                      <span className="text-[10px] opacity-60 ml-0.5">({sourcesInResults[s.id]})</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Extra filters panel */}
            {showFilter && (
              <div className="bg-surface border border-border rounded-xl p-4 flex items-center gap-6 flex-wrap">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <div className={`w-9 h-5 rounded-full transition-colors relative ${hasEmail?"bg-accent":"bg-muted"}`}
                    onClick={()=>{setHasEmail(v=>!v);setPage(1);}}>
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${hasEmail?"left-4":"left-0.5"}`}/>
                  </div>
                  <span className="text-sm text-foreground flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-accent"/> Has Email</span>
                </label>
                <div>
                  <span className="text-xs text-muted-foreground">Min Score: <strong className="text-primary-light">{minScore}%</strong></span>
                  <input type="range" min={0} max={80} step={10} value={minScore}
                    onChange={e=>{setMinScore(Number(e.target.value));setPage(1);}} className="w-36 sm:w-40 accent-primary block mt-1"/>
                </div>
                <button onClick={()=>{setHasEmail(false);setMinScore(0);setPage(1);setSourceFilter("all");}}
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 ml-auto">
                  <X className="w-3 h-3"/> Clear All
                </button>
              </div>
            )}

            {/* Stats row */}
            {leads.length > 0 && !loading && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                <span className="font-semibold text-foreground text-sm">{filtered.length} results</span>
                {sourceFilter !== "all" && (
                  <span className="px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
                    {ALL_SOURCES.find(s => s.id === sourceFilter)?.label}
                  </span>
                )}
                <span>·</span>
                <span>Updated {fetchedAt ? formatExact(fetchedAt) : "—"}</span>
                {saveError && <span className="text-destructive flex items-center gap-1 ml-auto"><AlertCircle className="w-3.5 h-3.5"/> {saveError}</span>}
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center animate-pulse-glow">
                  <Radio className="w-8 h-8 text-accent"/>
                </div>
                <p className="text-foreground font-semibold">Scanning live job feeds…</p>
                <p className="text-muted-foreground text-sm">Aggregating from 16 sources across {selectedNiches.length} niche{selectedNiches.length!==1?"s":""}</p>
              </div>
            )}

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
                        <> Resets at <strong className="text-foreground">{new Date(limitHit.nextReset).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</strong>.</>
                      )}
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowBonus(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary-light text-sm font-semibold transition-all hover:bg-primary/15"
                    >
                      <Sparkles className="w-4 h-4" />
                      Unlock +300 free leads
                    </button>
                  </div>
                </div>
              </div>
            )}
            {error && (
              <div className="flex items-center gap-3 text-destructive bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3">
                <AlertCircle className="w-4 h-4 flex-shrink-0"/><p className="text-sm">{error}</p>
              </div>
            )}

            {/* Cards */}
            {!loading && current.length > 0 && (
              <div className="space-y-3">
                {current.map(lead=>{
                  const isSaved  = savedIds.has(lead.id);
                  const isSaving = savingId === lead.id;
                  const isFav    = favIds.has(lead.id);
                  const isNew    = !seenIds.has(lead.id);
                  return (
                    <div key={lead.id}
                      className={`group bg-gradient-card border rounded-2xl p-4 sm:p-5 transition-all hover:shadow-card-hover ${lead.bmScore>=80?"border-primary/40 hover:border-primary/60 shadow-sm shadow-primary/10":isFav?"border-yellow-500/30 hover:border-yellow-500/50":"border-border hover:border-primary/30"}`}>
                      <div className="flex items-start justify-between gap-3 sm:gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2">
                            {isNew && (
                              <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/30 font-semibold">✦ New</span>
                            )}
                            <BestMatchBadge score={lead.bmScore}/>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3"/>{hoursLabel(lead.hoursAgo)}
                            </span>
                            <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium ${lead.confidence>=70?"bg-primary/10 text-primary-light border-primary/20":"bg-muted text-muted-foreground border-border"}`}>
                              <Star className="w-3 h-3"/> {lead.confidence}%
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20 font-medium capitalize">{lead.niche.replace(/-/g," ")}</span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-surface border border-border text-muted-foreground">{lead.sourceLabel}</span>
                            {lead.email && (
                              <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 font-medium">
                                <Mail className="w-3 h-3"/> Email
                              </span>
                            )}
                          </div>
                          <h3 className="text-foreground font-semibold text-sm sm:text-base leading-snug mb-1 group-hover:text-primary-light transition-colors line-clamp-2">{lead.title}</h3>
                          <p className="text-sm font-medium text-primary-light/80 mb-1.5 flex items-center gap-1.5">
                            <Globe className="w-3.5 h-3.5 flex-shrink-0"/>{lead.company}
                            {lead.domain && <span className="text-muted-foreground font-normal text-xs">· {lead.domain}</span>}
                          </p>
                          <p className="text-muted-foreground text-sm leading-relaxed mb-2 sm:mb-3 line-clamp-2">{stripHtml(lead.description)}</p>
                          {(lead.tags ?? []).length > 0 && (
                            <div className="flex flex-wrap gap-1 sm:gap-1.5 mb-2 sm:mb-3">
                              {(lead.tags ?? []).slice(0,5).map(t=>(
                                <span key={t} className="px-1.5 sm:px-2 py-0.5 rounded-md bg-surface border border-border text-xs text-muted-foreground">{t}</span>
                              ))}
                            </div>
                          )}
                          {lead.email && (
                            <div className="flex items-center gap-1.5 text-xs text-accent font-medium">
                              <Mail className="w-3.5 h-3.5"/>
                              <span className="font-mono truncate max-w-[200px]">{lead.email}</span>
                              <CopyButton text={lead.email}/>
                            </div>
                          )}
                        </div>

                        {/* Action column */}
                        <div className="flex flex-col gap-1.5 sm:gap-2 flex-shrink-0 w-[100px] sm:w-[112px]">
                          <button onClick={()=>setFavIds(p=>{const n=new Set(p);n.has(lead.id)?n.delete(lead.id):n.add(lead.id);return n;})}
                            className={`flex items-center justify-center gap-1 px-2 sm:px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${isFav?"bg-yellow-500/15 border-yellow-500/40 text-yellow-400":"border-border text-muted-foreground hover:border-yellow-500/30 hover:text-yellow-400"}`}>
                            <Heart className={`w-3.5 h-3.5 ${isFav?"fill-yellow-400 text-yellow-400":""}`}/>{isFav?"Saved":"Fav"}
                          </button>
                          <a href={lead.url} target="_blank" rel="noopener noreferrer"
                            className="flex items-center justify-center gap-1.5 px-2 sm:px-3 py-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 text-xs font-medium transition-all">
                            <ExternalLink className="w-3.5 h-3.5"/> View Job
                          </a>
                          <button onClick={()=>void handleSave(lead)} disabled={isSaved||isSaving}
                            className={`flex items-center justify-center gap-1.5 px-2 sm:px-3 py-2 rounded-lg text-xs font-medium transition-all ${isSaved?"bg-accent/10 text-accent border border-accent/30 cursor-default":"bg-primary/10 text-primary-light border border-primary/30 hover:bg-primary/20"}`}>
                            {isSaved?<><CheckCircle className="w-3.5 h-3.5"/> Done</>:<><Bookmark className="w-3.5 h-3.5"/>{isSaving?"…":"Save"}</>}
                          </button>
                          <Link href={`/dashboard/proposal/new?company=${encodeURIComponent(lead.company)}&domain=${encodeURIComponent(lead.domain)}&title=${encodeURIComponent(lead.title)}&description=${encodeURIComponent(stripHtml(lead.description).slice(0,400))}&url=${encodeURIComponent(lead.url)}&niche=${encodeURIComponent(lead.niche)}&email=${encodeURIComponent(lead.email??"")}`}
                            className="flex items-center justify-center gap-1 px-2 sm:px-3 py-2 rounded-lg bg-gradient-hero text-white text-xs font-semibold hover:opacity-90 transition-all">
                            <Sparkles className="w-3.5 h-3.5"/> Apply
                          </Link>
                        </div>
                      </div>

                      {lead.bmScore >= 50 && (
                        <div className="mt-3 pt-3 border-t border-border/50">
                          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                            <span className="flex items-center gap-1"><Target className="w-3 h-3"/> Match Score</span>
                            <span className={`font-semibold ${lead.bmScore>=80?"text-primary-light":"text-muted-foreground"}`}>{lead.bmScore}%</span>
                          </div>
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all ${lead.bmScore>=80?"bg-gradient-to-r from-primary to-accent":"bg-primary/40"}`}
                              style={{width:`${lead.bmScore}%`}}/>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-2">
                <p className="text-xs text-muted-foreground">Showing {(page-1)*PAGE_SIZE+1}–{Math.min(page*PAGE_SIZE,filtered.length)} of {filtered.length}</p>
                <div className="flex items-center gap-1.5">
                  <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/40 disabled:opacity-40 transition-all">
                    <ChevronLeft className="w-3.5 h-3.5"/> Prev
                  </button>
                  {Array.from({length:Math.min(totalPages,5)},(_,i)=>i+1).map(p=>(
                    <button key={p} onClick={()=>setPage(p)}
                      className={`w-8 h-8 rounded-lg border text-xs font-medium transition-all ${page===p?"bg-primary border-primary text-white":"border-border text-muted-foreground hover:border-primary/40"}`}>
                      {p}
                    </button>
                  ))}
                  <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/40 disabled:opacity-40 transition-all">
                    Next <ChevronRight className="w-3.5 h-3.5"/>
                  </button>
                </div>
              </div>
            )}

            {/* Empty state */}
            {!loading && leads.length === 0 && !error && (
              <div className="text-center py-16 border border-dashed border-border rounded-2xl">
                <Radio className="w-12 h-12 text-muted-foreground mx-auto mb-3"/>
                <h3 className="text-foreground font-semibold mb-2">Select niches and scan</h3>
                <p className="text-muted-foreground text-sm mb-1">Pick your niches above, then hit Scan</p>
                <p className="text-muted-foreground text-xs">16 sources · sorted by post time</p>
                <div className="flex items-center justify-center gap-3 mt-5">
                  <button onClick={()=>{setMaxHours(72);void fetchLive(true);}} disabled={loading||selectedNiches.length===0}
                    className="px-5 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-light transition-all disabled:opacity-50 flex items-center gap-2">
                    <Zap className="w-4 h-4"/> Scan Last 72h
                  </button>
                </div>
              </div>
            )}

            {/* No results after filter */}
            {!loading && leads.length > 0 && filtered.length === 0 && (
              <div className="text-center py-10 border border-dashed border-border rounded-2xl">
                <p className="text-muted-foreground text-sm">No results match the current filters.</p>
                <button onClick={()=>{setSourceFilter("all");setHasEmail(false);setMinScore(0);}}
                  className="mt-3 text-xs text-primary-light hover:underline">Clear filters</button>
              </div>
            )}
          </div>

          {/* ── Right: Stats sidebar (hidden until wide layouts have room) ── */}
          <div className="hidden xl:flex flex-col gap-4 w-72 flex-shrink-0">

            {/* Live stats */}
            <div className="bg-surface border border-border rounded-2xl p-4 space-y-3 sticky top-6">
              <h3 className="text-foreground font-semibold text-sm flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-primary-light"/> Live Stats
              </h3>
              <div className="space-y-2.5">
                {[
                  { label: "Total fetched",  value: leads.length,       color: "text-foreground" },
                  { label: "After filters",  value: filtered.length,    color: "text-foreground" },
                  { label: "New this visit", value: newCount,            color: newCount > 0 ? "text-accent font-bold" : "text-muted-foreground" },
                  { label: "Best matches",   value: bestMatchCount,      color: bestMatchCount > 0 ? "text-primary-light font-bold" : "text-muted-foreground" },
                  { label: "Have email",     value: emailCount,          color: emailCount > 0 ? "text-green-400 font-semibold" : "text-muted-foreground" },
                  { label: "Favourited",     value: favIds.size,         color: favIds.size > 0 ? "text-yellow-400 font-semibold" : "text-muted-foreground" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground text-xs">{label}</span>
                    <span className={`text-sm font-semibold tabular-nums ${color}`}>{value}</span>
                  </div>
                ))}
              </div>

              {leads.length > 0 && (
                <div className="pt-2 border-t border-border/50">
                  <p className="text-xs text-muted-foreground mb-2">Sources found</p>
                  <div className="space-y-1">
                    {Object.entries(sourcesInResults)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 6)
                      .map(([src, count]) => {
                        const label = ALL_SOURCES.find(s => s.id === src)?.label ?? src;
                        const pct = Math.round((count / leads.length) * 100);
                        return (
                          <div key={src}>
                            <div className="flex items-center justify-between text-xs mb-0.5">
                              <span className="text-muted-foreground truncate">{label}</span>
                              <span className="text-foreground font-medium ml-2 flex-shrink-0">{count}</span>
                            </div>
                            <div className="h-1 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-primary/40 rounded-full" style={{ width: `${pct}%` }}/>
                            </div>
                          </div>
                        );
                      })
                    }
                  </div>
                </div>
              )}
            </div>

            {/* Quick tips */}
            <div className="bg-gradient-to-b from-primary/10 to-accent/5 border border-primary/20 rounded-2xl p-4 space-y-2.5">
              <h3 className="text-foreground font-semibold text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary-light"/> Pro Tips
              </h3>
              {[
                "Set Best Match preferences to auto-score leads for your niche.",
                "Filter by 'Has Email' to find leads you can cold-pitch right now.",
                "Favourite your top picks — they float to the top on your next visit.",
                "Use AI Proposal to generate a tailored draft in seconds.",
              ].map(tip => (
                <p key={tip} className="text-xs text-muted-foreground leading-relaxed flex gap-2">
                  <span className="text-accent flex-shrink-0 mt-0.5">→</span>{tip}
                </p>
              ))}
            </div>

            {/* Plan access */}
            <div className="bg-gradient-card border border-primary/20 rounded-2xl p-4 text-center space-y-2">
              <p className="text-foreground font-semibold text-sm">
                {hasPaidAccess ? `${accessLabel} access active` : "Early access active"}
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {hasPaidAccess
                  ? "High-volume live job scanning is enabled for this account."
                  : "Higher daily lead limits, priority sources, and AI proposal drafts."}
              </p>
              {hasPaidAccess ? (
                <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary-light text-xs font-semibold">
                  {accessLabel} plan
                </span>
              ) : (
                <Link href="/dashboard/upgrade"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-hero text-white text-xs font-semibold hover:opacity-90 transition-all">
                  Upgrade <ArrowRight className="w-3 h-3"/>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <BonusLeadsModal
        isOpen={showBonus}
        onClose={() => setShowBonus(false)}
        onBonusClaimed={async () => {
          setShowBonus(false);
          setLimitHit(null);
          await refreshUsage();
        }}
        source="live-jobs"
        currentPlan={usage?.plan ?? "free"}
      />
    </>
  );
}
