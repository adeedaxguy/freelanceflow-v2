"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  GitMerge, RefreshCw, Loader2, ExternalLink, Mail, Building2,
  Trophy, XCircle, Zap, MessageSquare, Phone, Calendar, MoreHorizontal,
  ChevronRight,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type LeadStatus = "NEW" | "CONTACTED" | "REPLIED" | "NEGOTIATION" | "FOLLOW_UP" | "WON" | "LOST";

interface Lead {
  id: string;
  company: string;
  domain: string;
  email: string | null;
  title: string | null;
  niche: string | null;
  status: LeadStatus;
  confidence: number | null;
  notes: string | null;
  savedAt: string;
}

// ─── Column definitions ───────────────────────────────────────────────────────
const COLUMNS: {
  status: LeadStatus;
  label: string;
  icon: React.ElementType;
  color: string;
  accent: string;
}[] = [
  { status: "NEW",         label: "New Leads",    icon: Zap,            color: "border-blue-500/30 bg-blue-500/5",      accent: "text-blue-400" },
  { status: "CONTACTED",   label: "Contacted",    icon: Mail,           color: "border-purple-500/30 bg-purple-500/5",  accent: "text-purple-400" },
  { status: "REPLIED",     label: "Replied",      icon: MessageSquare,  color: "border-accent/30 bg-accent/5",          accent: "text-accent" },
  { status: "NEGOTIATION", label: "Negotiating",  icon: Phone,          color: "border-yellow-500/30 bg-yellow-500/5",  accent: "text-yellow-400" },
  { status: "FOLLOW_UP",   label: "Follow-Up",    icon: Calendar,       color: "border-orange-500/30 bg-orange-500/5",  accent: "text-orange-400" },
  { status: "WON",         label: "Won 🎉",       icon: Trophy,         color: "border-green-500/30 bg-green-500/5",    accent: "text-green-400" },
  { status: "LOST",        label: "Lost",         icon: XCircle,        color: "border-red-500/30 bg-red-500/5",        accent: "text-red-400" },
];

const STATUS_BADGE: Record<LeadStatus, string> = {
  NEW:         "bg-blue-500/15 text-blue-400",
  CONTACTED:   "bg-purple-500/15 text-purple-400",
  REPLIED:     "bg-accent/15 text-accent",
  NEGOTIATION: "bg-yellow-500/15 text-yellow-400",
  FOLLOW_UP:   "bg-orange-500/15 text-orange-400",
  WON:         "bg-green-500/15 text-green-400",
  LOST:        "bg-red-500/15 text-red-400",
};

// ─── Lead Card ────────────────────────────────────────────────────────────────
function LeadCard({
  lead,
  onDragStart,
  onDragEnd,
}: {
  lead: Lead;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragEnd: () => void;
}) {
  return (
    <div
      draggable
      onDragStart={e => onDragStart(e, lead.id)}
      onDragEnd={onDragEnd}
      className="bg-surface border border-border rounded-xl p-3.5 cursor-grab active:cursor-grabbing hover:border-primary/40 hover:shadow-md transition-all select-none group"
    >
      {/* Company + domain */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <p className="font-semibold text-foreground text-sm truncate">{lead.company}</p>
          <p className="text-muted-foreground text-xs truncate">{lead.domain}</p>
        </div>
        <Link
          href={`/dashboard/proposal/new?company=${encodeURIComponent(lead.company)}&email=${encodeURIComponent(lead.email ?? "")}`}
          className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
          title="Open proposal"
        >
          <ExternalLink className="w-3.5 h-3.5 text-muted-foreground hover:text-accent" />
        </Link>
      </div>

      {/* Title pill */}
      {lead.title && (
        <p className="text-xs text-muted-foreground bg-white/5 rounded-lg px-2 py-1 mb-2 truncate">
          {lead.title}
        </p>
      )}

      {/* Email */}
      {lead.email && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
          <Mail className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{lead.email}</span>
        </div>
      )}

      {/* Footer: confidence + date */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
        {lead.confidence != null
          ? <span className="text-xs font-medium text-accent">{lead.confidence}% match</span>
          : <span />}
        <span className="text-xs text-muted-foreground">
          {new Date(lead.savedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </span>
      </div>
    </div>
  );
}

// ─── Column ───────────────────────────────────────────────────────────────────
function KanbanColumn({
  status, label, icon: Icon, color, accent,
  leads,
  isDragOver,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragStart,
  onDragEnd,
}: {
  status: LeadStatus;
  label: string;
  icon: React.ElementType;
  color: string;
  accent: string;
  leads: Lead[];
  isDragOver: boolean;
  onDragOver: (e: React.DragEvent, status: LeadStatus) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent, status: LeadStatus) => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragEnd: () => void;
}) {
  return (
    <div
      className={`flex flex-col min-w-[240px] max-w-[260px] rounded-2xl border transition-all ${color} ${isDragOver ? "ring-2 ring-primary/50 scale-[1.01]" : ""}`}
      onDragOver={e => { e.preventDefault(); onDragOver(e, status); }}
      onDragLeave={onDragLeave}
      onDrop={e => onDrop(e, status)}
    >
      {/* Column header */}
      <div className={`flex items-center justify-between px-3.5 py-3 border-b border-border/40`}>
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${accent}`} />
          <span className="text-sm font-semibold text-foreground">{label}</span>
        </div>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${STATUS_BADGE[status]}`}>
          {leads.length}
        </span>
      </div>

      {/* Cards */}
      <div className="flex-1 p-2.5 space-y-2.5 overflow-y-auto max-h-[calc(100vh-220px)]">
        {leads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center mb-2">
              <Icon className={`w-4 h-4 ${accent} opacity-40`} />
            </div>
            <p className="text-xs text-muted-foreground">Drop leads here</p>
          </div>
        ) : (
          leads.map(lead => (
            <LeadCard
              key={lead.id}
              lead={lead}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
const FETCH_LIMIT = 500;

export default function PipelinePage() {
  const [leads, setLeads]         = useState<Lead[]>([]);
  const [total, setTotal]         = useState(0);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [dragOver, setDragOver]   = useState<LeadStatus | null>(null);
  const [updating, setUpdating]   = useState<string | null>(null);

  // Refs to avoid stale closure in drop handler
  const dragId      = useRef<string | null>(null);
  const prevStatus  = useRef<LeadStatus | null>(null); // pre-drag status for rollback

  // Fetch all saved leads up to FETCH_LIMIT
  const fetchLeads = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const res  = await fetch(`/api/leads/save?limit=${FETCH_LIMIT}`);
      const data = await res.json() as { leads?: Lead[]; total?: number; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Failed to load");
      setLeads(data.leads ?? []);
      setTotal(data.total ?? 0);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load leads");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void fetchLeads(); }, [fetchLeads]);

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    dragId.current    = id;
    prevStatus.current = leads.find(l => l.id === id)?.status ?? null;
    e.dataTransfer.effectAllowed = "move";
  };
  const handleDragEnd   = () => { dragId.current = null; prevStatus.current = null; setDragOver(null); };
  const handleDragOver  = (e: React.DragEvent, status: LeadStatus) => {
    e.preventDefault();
    if (dragOver !== status) setDragOver(status);
  };
  const handleDragLeave = () => setDragOver(null);

  const handleDrop = async (e: React.DragEvent, newStatus: LeadStatus) => {
    e.preventDefault();
    setDragOver(null);
    const id      = dragId.current;
    const oldStat = prevStatus.current; // captured at drag-start, safe from race conditions
    if (!id || !oldStat || oldStat === newStatus) return;

    // Optimistic update
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l));
    setUpdating(id);

    try {
      const res = await fetch("/api/leads/save", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (!res.ok) throw new Error("Update failed");
    } catch {
      // Rollback using ref value — immune to stale closure
      setLeads(prev => prev.map(l => l.id === id ? { ...l, status: oldStat } : l));
    } finally {
      setUpdating(null);
    }
  };

  // Group leads by status
  const grouped = COLUMNS.reduce<Record<LeadStatus, Lead[]>>((acc, col) => {
    acc[col.status] = leads.filter(l => l.status === col.status);
    return acc;
  }, {} as Record<LeadStatus, Lead[]>);

  const totalValue = leads.filter(l => l.status === "WON").length;

  return (
    <div className="p-6 lg:p-8 h-full flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <GitMerge className="w-6 h-6 text-accent" /> CRM Pipeline
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Drag &amp; drop leads across stages to track your deals.
            {leads.length > 0 && (
              <span className="ml-2 text-foreground/60">
                Showing {leads.length}{total > leads.length ? ` of ${total}` : ""} leads · {totalValue} won
              </span>
            )}
            {total > FETCH_LIMIT && (
              <span className="ml-2 text-yellow-400 text-xs font-medium">
                ⚠ Only the first {FETCH_LIMIT} leads are shown
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {updating && (
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…
            </span>
          )}
          <button
            onClick={() => void fetchLeads()}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <Link
            href="/dashboard/saved-leads"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all"
          >
            <Building2 className="w-3.5 h-3.5" /> All Leads <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUMNS.map(col => (
            <div key={col.status} className="min-w-[240px] rounded-2xl border border-border bg-surface/40 p-3 space-y-2.5">
              <div className="h-8 bg-white/5 rounded-xl shimmer-line mb-3" />
              {[1, 2].map(i => (
                <div key={i} className="h-24 bg-white/5 rounded-xl shimmer-line" />
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Kanban board */}
      {!loading && (
        <div className="flex gap-4 overflow-x-auto pb-6 flex-1">
          {COLUMNS.map(col => (
            <KanbanColumn
              key={col.status}
              {...col}
              leads={grouped[col.status]}
              isDragOver={dragOver === col.status}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && leads.length === 0 && !error && (
        <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-border rounded-2xl py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-4">
            <GitMerge className="w-8 h-8 text-accent" />
          </div>
          <h3 className="text-foreground font-semibold mb-2">No leads in the pipeline</h3>
          <p className="text-muted-foreground text-sm max-w-xs mb-6">
            Save leads from the Find Leads page and they will appear here for you to track and manage.
          </p>
          <Link
            href="/dashboard/leads"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-hero text-white text-sm font-semibold shadow-glow-primary hover:opacity-90 transition-all"
          >
            <Zap className="w-4 h-4" /> Find Leads
          </Link>
        </div>
      )}
    </div>
  );
}
