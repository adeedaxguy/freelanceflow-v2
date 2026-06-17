"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Bookmark, Download, Trash2, RefreshCw, StickyNote, Check, Globe,
  Mail, Sparkles, ChevronDown, Search, ExternalLink, X, CalendarClock, MapPin,
} from "lucide-react";
import ConfirmModal from "@/components/ConfirmModal";
import type { Lead } from "@/types";

type CRMStatus = "NEW" | "CONTACTED" | "REPLIED" | "FOLLOW_UP" | "WON" | "LOST";
type CountryFilter = "all" | "usa" | "uk";
type LeadCountry = Exclude<CountryFilter, "all"> | null;
interface LeadExt extends Omit<Lead, "status"> { status: CRMStatus; notes?: string | null; title?: string | null; description?: string | null; sourceUrl?: string | null; source?: string | null; qualityScore?: number | null; }
interface ApiResponse { leads: LeadExt[]; total: number; page: number; totalPages: number; }
const MAX_LEAD_NOTES_LENGTH = 5000;
const USER_NOTES_MARKER = "\n\nUser Notes:\n";
const COUNTRY_FILTERS: { value: CountryFilter; label: string }[] = [
  { value: "all", label: "All countries" },
  { value: "usa", label: "USA" },
  { value: "uk", label: "UK" },
];
const US_STATE_CODES = "AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|IA|ID|IL|IN|KS|KY|LA|MA|MD|ME|MI|MN|MO|MS|MT|NC|ND|NE|NH|NJ|NM|NV|NY|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VA|VT|WA|WI|WV|WY|DC";
const US_STATE_NAMES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida",
  "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine",
  "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska",
  "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio",
  "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas",
  "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming",
];
const US_STATE_ADDRESS_RE = new RegExp(`,\\s*(?:${US_STATE_CODES})(?:\\s+\\d{5}(?:-\\d{4})?)?\\b`);
const US_STATE_ZIP_RE = new RegExp(`,\\s*(?:${US_STATE_CODES})\\s+\\d{5}(?:-\\d{4})?\\b`, "i");
const US_STATE_NAME_RE = new RegExp(`\\b(?:${US_STATE_NAMES.join("|")})\\b`, "i");
const UK_POSTCODE_RE = /\b[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}\b/i;

function isLocalBusinessLead(lead: LeadExt) {
  return lead.source?.startsWith("local_business") ?? false;
}

function displayLeadSource(lead: LeadExt) {
  if (isLocalBusinessLead(lead)) return "Local Business";
  return lead.source ?? "";
}

function sanitizeLeadNotes(notes?: string | null) {
  return (notes ?? "").replace(/^Data Source:\s*.+$/gim, "Lead Coverage: Live local search");
}

function looksLikeLeadContext(notes: string) {
  return /^(Address|Phone|Website|Rating|Revenue Potential|Guessed Emails|Lead Coverage|Priority Score|Pitch Points):/im.test(notes);
}

function splitUserNotes(notes?: string | null) {
  const cleaned = sanitizeLeadNotes(notes).trim();
  if (!cleaned) return { context: "", userNotes: "" };

  const marker = cleaned.match(/(?:^|\n)User Notes:\s*\n?/i);
  if (marker?.index !== undefined) {
    return {
      context: cleaned.slice(0, marker.index).trim(),
      userNotes: cleaned.slice(marker.index + marker[0].length).trim(),
    };
  }

  if (looksLikeLeadContext(cleaned)) return { context: cleaned, userNotes: "" };
  return { context: "", userNotes: cleaned };
}

function buildLeadNotes(existingNotes: string | null | undefined, userNotes: string) {
  const context = splitUserNotes(existingNotes).context;
  const cleanedUserNotes = userNotes.trim();
  if (!context) return cleanedUserNotes;
  if (!cleanedUserNotes) return context;
  return `${context}${USER_NOTES_MARKER}${cleanedUserNotes}`;
}

function displayUserNotes(notes?: string | null) {
  return splitUserNotes(notes).userNotes;
}

function decodeMaybe(value?: string | null) {
  if (!value) return "";
  try { return decodeURIComponent(value.replace(/\+/g, " ")); } catch { return value; }
}

function inferLeadCountry(lead: LeadExt): LeadCountry {
  const blob = [
    lead.notes,
    lead.domain,
    lead.email,
    lead.phone,
    lead.sourceUrl,
    decodeMaybe(lead.sourceUrl),
    lead.title,
    lead.description,
    lead.company,
  ].filter(Boolean).join(" ");

  if (/(country:\s*(?:uk|gb|gbr|united kingdom|great britain)\b|united kingdom|great britain|england|scotland|wales|northern ireland|\buk\b)/i.test(blob) || /\.(?:co\.)?uk(?:\/|$)/i.test(blob)) {
    return "uk";
  }
  if (UK_POSTCODE_RE.test(blob) || /\+44\b/.test(blob)) return "uk";
  if (
    /(country:\s*(?:us|usa|united states|united states of america)\b|united states|usa|u\.s\.a\.|u\.s\.)/i.test(blob)
    || /\.us(?:\/|$)/i.test(blob)
    || US_STATE_ADDRESS_RE.test(blob)
    || US_STATE_ZIP_RE.test(blob)
    || US_STATE_NAME_RE.test(blob)
    || /\+1\b/.test(blob)
  ) {
    return "usa";
  }
  return null;
}

function countryLabel(country: LeadCountry) {
  if (country === "usa") return "USA";
  if (country === "uk") return "UK";
  return null;
}

function formatSavedDateTime(savedAt: Date | string) {
  return new Date(savedAt).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function displayLeadTitle(lead: LeadExt) {
  if (!lead.title) return null;
  if (!isLocalBusinessLead(lead)) return lead.title;

  const websiteLine = lead.notes?.match(/^Website:\s*(.+)$/im)?.[1]?.toLowerCase() ?? "";
  const label =
    websiteLine.includes("unknown")     ? "Website unverified" :
    websiteLine.includes("outdated")    ? "Outdated site" :
    websiteLine.includes("unreachable") ? "Site down" :
    websiteLine.includes("none")        ? "No website" :
    null;

  if (!label) return lead.title;
  return lead.title.replace(/\((?:Has website|No website|Website unverified|Outdated site|Site down)\)$/i, `(${label})`);
}

const CRM_PIPELINE: { value: CRMStatus; label: string; color: string; bg: string; desc: string }[] = [
  { value: "NEW",       label: "New",        color: "text-blue-400",    bg: "bg-blue-500/10 border-blue-500/20",     desc: "Just discovered" },
  { value: "CONTACTED", label: "Contacted",  color: "text-purple-400",  bg: "bg-purple-500/10 border-purple-500/20", desc: "Proposal sent" },
  { value: "REPLIED",   label: "Replied",    color: "text-yellow-400",  bg: "bg-yellow-500/10 border-yellow-500/20", desc: "They responded" },
  { value: "FOLLOW_UP", label: "Follow-Up",  color: "text-orange-400",  bg: "bg-orange-500/10 border-orange-500/20", desc: "Needs follow-up" },
  { value: "WON",       label: "Won 🎉",     color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", desc: "Client landed!" },
  { value: "LOST",      label: "Lost",       color: "text-red-400",     bg: "bg-red-500/10 border-red-500/20",       desc: "Didn't work out" },
];

function StatusDropdown({ current, onChange }: { current: string; onChange: (s: CRMStatus) => void }) {
  const [open, setOpen] = useState(false);
  const curr = CRM_PIPELINE.find(s => s.value === current) ?? CRM_PIPELINE[0]!;
  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold ${curr.bg} ${curr.color} transition-all`}>
        {curr.label}
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute top-full mt-1 left-0 z-50 bg-surface border border-border rounded-xl shadow-card-hover min-w-[160px] overflow-hidden">
          {CRM_PIPELINE.map(s => (
            <button key={s.value} onClick={() => { onChange(s.value); setOpen(false); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-medium transition-colors hover:bg-white/5 ${s.value === current ? "bg-white/5" : ""}`}>
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${s.bg.replace("/10", "/60").split(" ")[0]}`} />
              <div className="text-left">
                <div className={s.color}>{s.label}</div>
                <div className="text-muted-foreground text-[10px]">{s.desc}</div>
              </div>
              {s.value === current && <Check className="w-3 h-3 ml-auto text-accent" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function NotesEditor({ leadId, initialNotes, onSave }: { leadId: string; initialNotes?: string | null; onSave: (notes: string) => void }) {
  const [value,      setValue]      = useState(displayUserNotes(initialNotes));
  const [savedValue, setSavedValue] = useState(displayUserNotes(initialNotes));
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState("");
  const [saved,      setSaved]      = useState(false);
  const contextLength = splitUserNotes(initialNotes).context.length;
  const noteLimit = Math.max(0, MAX_LEAD_NOTES_LENGTH - contextLength - (contextLength ? USER_NOTES_MARKER.length : 0));

  useEffect(() => {
    const next = displayUserNotes(initialNotes);
    setValue(next);
    setSavedValue(next);
    setSaved(false);
    setError("");
  }, [initialNotes]);

  async function save() {
    if (value.length > noteLimit) {
      setError("Note is too long");
      return;
    }
    const nextNotes = buildLeadNotes(initialNotes, value);
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const response = await fetch("/api/leads/save", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: leadId, notes: nextNotes }),
      });

      if (!response.ok) throw new Error("Save failed");

      const trimmed = value.trim();
      setValue(trimmed);
      setSavedValue(trimmed);
      setSaved(true);
      onSave(nextNotes);
    } catch {
      setError("Could not save note");
    } finally {
      setSaving(false);
    }
  }

  const dirty = value.trim() !== savedValue;
  const tooLong = value.length > noteLimit;

  return (
    <section className="rounded-xl border border-border/70 bg-background/45 p-3">
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
          <StickyNote className="w-3.5 h-3.5 text-primary-light" />
          Notes
        </div>
        <div className="text-[10px] text-muted-foreground">
          {saving ? "Saving..." : saved ? "Saved" : dirty ? "Unsaved" : `${value.length}/${noteLimit}`}
        </div>
      </div>
      <textarea
        value={value}
        onChange={e => { setValue(e.target.value); setSaved(false); }}
        placeholder="Next step, decision maker, objection, call recap..."
        maxLength={noteLimit}
        className="w-full min-h-[92px] resize-y rounded-lg border border-border bg-surface/70 p-3 text-sm leading-relaxed text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/50"
      />
      <div className="mt-2 flex items-center justify-between gap-3">
        <div className="min-h-4 text-[11px] text-destructive">{tooLong ? "Note is too long" : error}</div>
        <div className="flex items-center gap-2">
          {dirty && (
            <button
              type="button"
              onClick={() => { setValue(savedValue); setError(""); setSaved(false); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-3.5 h-3.5" /> Cancel
            </button>
          )}
          <button
            type="button"
            onClick={() => void save()}
            disabled={!dirty || saving || tooLong}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-xs font-semibold text-white hover:bg-primary-light transition-colors disabled:opacity-45 disabled:cursor-not-allowed"
          >
            <Check className="w-3.5 h-3.5" /> Save Note
          </button>
        </div>
      </div>
    </section>
  );
}

export default function SavedLeadsPage() {
  const router   = useRouter();
  const [leads,        setLeads]       = useState<LeadExt[]>([]);
  const [loading,      setLoading]     = useState(true);
  const [statusFilter, setStatusFilter]= useState("all");
  const [countryFilter,setCountryFilter]= useState<CountryFilter>("all");
  const [search,       setSearch]      = useState("");
  const [deleteId,     setDeleteId]    = useState<string | null>(null);
  const [deleting,     setDeleting]    = useState(false);
  const [total,        setTotal]       = useState(0);
  const [viewMode,     setViewMode]    = useState<"list" | "pipeline">("list");

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ limit: "100" });
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (countryFilter !== "all") params.set("country", countryFilter);
    if (search) params.set("search", search);
    const res = await fetch(`/api/leads/save?${params.toString()}`);
    if (res.ok) {
      const data = (await res.json()) as ApiResponse;
      setLeads(data.leads);
      setTotal(data.total);
    }
    setLoading(false);
  }, [statusFilter, countryFilter, search]);

  useEffect(() => { void fetchLeads(); }, [fetchLeads]);

  async function updateStatus(id: string, status: CRMStatus) {
    await fetch("/api/leads/save", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l));
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    await fetch(`/api/leads/save?id=${deleteId}`, { method: "DELETE" });
    setDeleteId(null);
    setDeleting(false);
    void fetchLeads();
  }

  const displayedLeads = countryFilter === "all" ? leads : leads.filter(lead => inferLeadCountry(lead) === countryFilter);

  function exportCSV() {
    const esc = (v: string | number | null | undefined) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const headers = [
      "Company", "Domain", "Email", "Niche", "Title", "Lead Type",
      "Match %", "Quality Score", "Pipeline Status", "Source URL",
      "Country", "Notes", "Saved Date & Time",
    ];
    const rows = displayedLeads.map(l => [
      esc(l.company), esc(l.domain), esc(l.email),
      esc(l.niche), esc(displayLeadTitle(l)), esc(displayLeadSource(l)),
      esc(l.confidence), esc(l.qualityScore),
      esc(l.status), esc(l.sourceUrl),
      esc(countryLabel(inferLeadCountry(l))), esc(displayUserNotes(l.notes)), esc(formatSavedDateTime(l.savedAt)),
    ].join(","));
    // UTF-8 BOM makes Excel open the file correctly without garbled characters
    const bom = "﻿";
    const csv = bom + [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `icloseleads-saved-leads-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const pipelineGroups = CRM_PIPELINE.map(s => ({ ...s, items: displayedLeads.filter(l => l.status === s.value) }));

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Bookmark className="w-6 h-6 text-primary-light" /> Saved Leads
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">{total} saved leads across list and pipeline views</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-surface border border-border rounded-lg overflow-hidden">
            {(["list","pipeline"] as const).map(mode => (
              <button key={mode} onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 text-xs font-medium capitalize transition-colors ${viewMode===mode ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"}`}>
                {mode}
              </button>
            ))}
          </div>
          <button onClick={() => void fetchLeads()} className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={exportCSV} disabled={displayedLeads.length === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-muted-foreground hover:text-foreground text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            <Download className="w-4 h-4" /> Export {displayedLeads.length > 0 ? `${displayedLeads.length} leads` : "CSV"}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…"
            className="pl-8 pr-3 py-2 bg-surface border border-border rounded-lg text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/50 w-40" />
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-border bg-surface p-1">
          <MapPin className="w-3.5 h-3.5 text-muted-foreground ml-1" />
          {COUNTRY_FILTERS.map(country => (
            <button
              key={country.value}
              type="button"
              onClick={() => setCountryFilter(country.value)}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${countryFilter === country.value ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"}`}
            >
              {country.label}
            </button>
          ))}
        </div>
        <button onClick={() => setStatusFilter("all")}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${statusFilter==="all" ? "bg-primary text-white" : "border border-border text-muted-foreground hover:text-foreground"}`}>
          All ({total})
        </button>
        {CRM_PIPELINE.map(s => {
          const cnt = displayedLeads.filter(l => l.status === s.value).length;
          return (
            <button key={s.value} onClick={() => setStatusFilter(s.value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${statusFilter===s.value ? `${s.bg} ${s.color} border-current` : "border-border text-muted-foreground hover:text-foreground"}`}>
              {s.label} {cnt > 0 && `(${cnt})`}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i=><div key={i} className="h-24 bg-surface border border-border rounded-2xl animate-pulse" />)}</div>
      ) : displayedLeads.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-2xl bg-surface/50">
          <Bookmark className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-foreground font-semibold mb-2">No leads saved yet</h3>
          <p className="text-muted-foreground text-sm mb-4">Find leads and click Save to start your pipeline.</p>
          <a href="/dashboard/leads" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-light transition-all">
            <Search className="w-4 h-4" /> Find Leads
          </a>
        </div>
      ) : viewMode === "pipeline" ? (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
          {pipelineGroups.map(stage => (
            <div key={stage.value} className={`bg-surface border rounded-xl overflow-hidden border-l-2 ${stage.bg}`}>
              <div className="px-3 py-2.5 border-b border-border">
                <div className={`text-xs font-bold ${stage.color}`}>{stage.label}</div>
                <div className="text-[10px] text-muted-foreground">{stage.items.length} lead{stage.items.length!==1?"s":""}</div>
              </div>
              <div className="p-2 space-y-2 min-h-[60px]">
                {stage.items.map(lead => (
                  <div key={lead.id} onClick={() => router.push(`/dashboard/proposal/${lead.id}`)}
                    className="bg-background border border-border rounded-lg p-2 hover:border-primary/30 transition-all cursor-pointer">
                    <div className="font-medium text-xs text-foreground line-clamp-1">{lead.company}</div>
                    {displayLeadTitle(lead) && <div className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">{displayLeadTitle(lead)}</div>}
                    <div className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                      <CalendarClock className="w-2.5 h-2.5" /> {formatSavedDateTime(lead.savedAt)}
                    </div>
                    {lead.email && <div className="text-[10px] text-accent mt-1 flex items-center gap-1"><Mail className="w-2.5 h-2.5" />{lead.email}</div>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {displayedLeads.map(lead => (
            <div key={lead.id} className="group bg-gradient-card border border-border hover:border-primary/30 rounded-2xl p-5 transition-all">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0 font-bold text-primary-light text-sm">
                  {lead.company.slice(0,2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-foreground text-sm">{lead.company}</h3>
                        <StatusDropdown current={lead.status} onChange={s => void updateStatus(lead.id, s)} />
                      </div>
                      {displayLeadTitle(lead) && <p className="text-xs text-muted-foreground mt-0.5">{displayLeadTitle(lead)}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      {lead.sourceUrl && (
                        <a href={lead.sourceUrl} target="_blank" rel="noopener noreferrer"
                          className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <button onClick={() => router.push(`/dashboard/proposal/${lead.id}`)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary-light border border-primary/30 hover:bg-primary/20 text-xs font-medium transition-all">
                        <Sparkles className="w-3.5 h-3.5" /> Proposal
                      </button>
                      <button onClick={() => setDeleteId(lead.id)}
                        className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-destructive hover:border-destructive/30 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center flex-wrap gap-3 text-xs text-muted-foreground mb-3">
                    <span className="flex items-center gap-1 whitespace-nowrap"><CalendarClock className="w-3 h-3" />Saved {formatSavedDateTime(lead.savedAt)}</span>
                    {countryLabel(inferLeadCountry(lead)) && <span className="flex items-center gap-1 whitespace-nowrap"><MapPin className="w-3 h-3" />{countryLabel(inferLeadCountry(lead))}</span>}
                    <span className="flex items-center gap-1"><Globe className="w-3 h-3" />{lead.domain}</span>
                    {lead.email && <span className="flex items-center gap-1 text-accent"><Mail className="w-3 h-3" />{lead.email}</span>}
                    {lead.niche && <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary-light border border-primary/20">{lead.niche}</span>}
                    {lead.confidence && <span className="text-primary-light/70">{lead.confidence}% match</span>}
                  </div>
                  <div className="pt-3 border-t border-border/50">
                    <NotesEditor leadId={lead.id} initialNotes={lead.notes}
                      onSave={notes => setLeads(prev => prev.map(l => l.id===lead.id ? {...l,notes} : l))} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal isOpen={!!deleteId} title="Remove Lead" message="This lead will be permanently removed from your pipeline."
        confirmLabel="Remove" onConfirm={() => void handleDelete()} onCancel={() => setDeleteId(null)} loading={deleting} />
    </div>
  );
}
