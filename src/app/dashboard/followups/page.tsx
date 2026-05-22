"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Clock, Plus, Trash2, CheckCircle, RefreshCw, Send,
  Loader2, AlertCircle, CalendarDays, Edit3, X, Sparkles,
} from "lucide-react";

interface Lead { id: string; company: string; domain: string; email?: string | null; }
interface FollowUp {
  id: string; leadId: string; step: number; subject: string; body: string;
  scheduledAt: string; sentAt: string | null; status: string;
  lead?: { company: string; domain: string; email?: string | null };
}

const STATUS_STYLES: Record<string, string> = {
  PENDING:   "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  SENT:      "bg-green-500/10  text-green-400  border-green-500/20",
  CANCELLED: "bg-red-500/10    text-red-400    border-red-500/20",
};

const STEP_TEMPLATES = [
  { step: 1, daysAfter: 3,  label: "Day 3 Follow-up",  subject: "Re: Quick follow-up", body: "Hi,\n\nJust wanted to circle back on my previous message. I understand you're busy — I'll keep this short.\n\nI genuinely believe I can help [Company] with [niche]. Would a 10-minute call this week make sense?\n\n[Your Name]" },
  { step: 2, daysAfter: 7,  label: "Day 7 Value Add",  subject: "One thing that might help [Company]", body: "Hi,\n\nI've been thinking about [Company] and wanted to share a quick idea that could [benefit].\n\n[Specific insight or tip relevant to their business]\n\nHappy to dive deeper on a call if this resonates. Either way, hope it's useful!\n\n[Your Name]" },
  { step: 3, daysAfter: 14, label: "Day 14 Last Touch", subject: "Last one from me", body: "Hi,\n\nI've reached out a couple of times — I know timing isn't always right, so this will be my last message.\n\nIf you ever need help with [niche] in the future, I'd love to hear from you.\n\nWishing you and the [Company] team all the best!\n\n[Your Name]" },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function daysUntil(iso: string) {
  const diff = new Date(iso).getTime() - Date.now();
  const days = Math.ceil(diff / 86_400_000);
  if (days < 0) return "Overdue";
  if (days === 0) return "Today";
  return `In ${days}d`;
}

export default function FollowUpsPage() {
  const [followUps,   setFollowUps]   = useState<FollowUp[]>([]);
  const [leads,       setLeads]       = useState<Lead[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [creating,    setCreating]    = useState(false);
  const [editingId,   setEditingId]   = useState<string | null>(null);
  const [filterStatus,setFilterStatus]= useState("all");
  const [form, setForm] = useState({ leadId: "", step: 1, subject: "", body: "", sendAfterDays: 3 });
  const [saveMsg, setSaveMsg] = useState("");

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [fuRes, leadsRes] = await Promise.all([
        fetch("/api/followup"),
        fetch("/api/leads/save?limit=100"),
      ]);
      if (fuRes.ok) { const d = await fuRes.json() as { followUps: FollowUp[] }; setFollowUps(d.followUps); }
      if (leadsRes.ok) { const d = await leadsRes.json() as { leads: Lead[] }; setLeads(d.leads); }
    } catch { /* silent */ }
    setLoading(false);
  }, []);

  useEffect(() => { void fetchAll(); }, [fetchAll]);

  const handleCreate = async () => {
    if (!form.leadId || !form.subject || !form.body) { setSaveMsg("Please fill all required fields."); return; }
    const res = await fetch("/api/followup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) { setCreating(false); setForm({ leadId: "", step: 1, subject: "", body: "", sendAfterDays: 3 }); void fetchAll(); }
    else { const d = await res.json() as { error?: string }; setSaveMsg(d.error ?? "Failed to create."); }
  };

  const handlePatch = async (id: string, data: Partial<FollowUp>) => {
    await fetch("/api/followup", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...data }),
    });
    void fetchAll();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/followup?id=${id}`, { method: "DELETE" });
    void fetchAll();
  };

  const loadTemplate = (tpl: typeof STEP_TEMPLATES[0]) => {
    setForm(f => ({ ...f, step: tpl.step, subject: tpl.subject, body: tpl.body, sendAfterDays: tpl.daysAfter }));
  };

  const filtered = filterStatus === "all" ? followUps : followUps.filter(f => f.status === filterStatus);

  // Group by lead
  const byLead = filtered.reduce<Record<string, FollowUp[]>>((acc, fu) => {
    const key = fu.leadId;
    if (!acc[key]) acc[key] = [];
    acc[key]!.push(fu);
    return acc;
  }, {});

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-primary-light" /> Follow-Up Sequences
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Schedule multi-step follow-ups for leads who haven't replied yet.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => void fetchAll()} className="p-2 rounded-xl border border-border text-muted-foreground hover:text-foreground transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={() => setCreating(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-light text-white text-sm font-semibold transition-all shadow-glow-primary">
            <Plus className="w-4 h-4" /> New Follow-Up
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {[["all","All"], ["PENDING","Pending"], ["SENT","Sent"], ["CANCELLED","Cancelled"]].map(([val, label]) => (
          <button key={val} onClick={() => setFilterStatus(val!)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${filterStatus === val ? "bg-primary border-primary text-white" : "border-border text-muted-foreground hover:text-foreground"}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Create modal */}
      {creating && (
        <div className="bg-surface border border-primary/30 rounded-2xl p-6 space-y-5 animate-fade-in-up">
          <div className="flex items-center justify-between">
            <h2 className="text-foreground font-semibold flex items-center gap-2"><Plus className="w-4 h-4 text-primary-light" /> New Follow-Up Step</h2>
            <button onClick={() => { setCreating(false); setSaveMsg(""); }} className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors"><X className="w-4 h-4" /></button>
          </div>

          {/* Template picker */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-primary-light" /> Load Template</p>
            <div className="flex flex-wrap gap-2">
              {STEP_TEMPLATES.map(tpl => (
                <button key={tpl.step} onClick={() => loadTemplate(tpl)}
                  className="px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:text-primary-light hover:border-primary/40 transition-all">
                  {tpl.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Lead *</label>
              <select value={form.leadId} onChange={e => setForm(f => ({ ...f, leadId: e.target.value }))}
                className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:border-primary/50">
                <option value="">Select a lead…</option>
                {leads.map(l => <option key={l.id} value={l.id}>{l.company}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Step #</label>
              <input type="number" min={1} max={10} value={form.step} onChange={e => setForm(f => ({ ...f, step: Number(e.target.value) }))}
                className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:border-primary/50" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Send After (days)</label>
              <input type="number" min={1} max={90} value={form.sendAfterDays} onChange={e => setForm(f => ({ ...f, sendAfterDays: Number(e.target.value) }))}
                className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:border-primary/50" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Subject *</label>
            <input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
              placeholder="Follow-up subject line"
              className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:border-primary/50" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Body *</label>
            <textarea value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} rows={6}
              placeholder="Email body… Use [Company], [Your Name], [niche] as placeholders"
              className="w-full px-3 py-3 bg-background border border-border rounded-xl text-foreground text-sm resize-none focus:outline-none focus:border-primary/50" />
          </div>
          {saveMsg && <p className="text-destructive text-sm">{saveMsg}</p>}
          <div className="flex gap-3">
            <button onClick={() => void handleCreate()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-light text-white font-semibold text-sm transition-all shadow-glow-primary">
              <CheckCircle className="w-4 h-4" /> Schedule Follow-Up
            </button>
            <button onClick={() => { setCreating(false); setSaveMsg(""); }}
              className="px-5 py-2.5 rounded-xl border border-border text-muted-foreground hover:text-foreground text-sm transition-all">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-24 bg-surface border border-border rounded-2xl animate-pulse" />)}</div>
      ) : Object.keys(byLead).length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-2xl bg-surface/50">
          <CalendarDays className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-40" />
          <h3 className="text-foreground font-semibold mb-2">No follow-ups scheduled</h3>
          <p className="text-muted-foreground text-sm mb-5 max-w-sm mx-auto">
            Create follow-up sequences for leads who haven't replied to keep deals moving forward.
          </p>
          <button onClick={() => setCreating(true)}
            className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-light transition-all shadow-glow-primary">
            <Plus className="w-4 h-4 inline mr-2" />Create First Follow-Up
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(byLead).map(([leadId, steps]) => {
            const company = steps[0]?.lead?.company ?? leads.find(l => l.id === leadId)?.company ?? leadId;
            return (
              <div key={leadId} className="bg-gradient-card border border-border rounded-2xl overflow-hidden">
                <div className="px-5 py-3 border-b border-border flex items-center justify-between bg-background/30">
                  <h3 className="font-semibold text-foreground text-sm">{company}</h3>
                  <span className="text-xs text-muted-foreground">{steps.length} step{steps.length !== 1 ? "s" : ""}</span>
                </div>
                <div className="divide-y divide-border/50">
                  {steps.sort((a,b) => a.step - b.step).map(fu => (
                    <div key={fu.id} className="px-5 py-4 flex items-start gap-4 hover:bg-primary/5 transition-colors">
                      {/* Step indicator */}
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${fu.status === "SENT" ? "bg-accent/20 text-accent" : fu.status === "CANCELLED" ? "bg-red-500/20 text-red-400" : "bg-primary/20 text-primary-light"}`}>
                        {fu.step}
                      </div>

                      <div className="flex-1 min-w-0">
                        {editingId === fu.id ? (
                          <div className="space-y-2">
                            <input defaultValue={fu.subject}
                              onBlur={e => { if (e.target.value !== fu.subject) void handlePatch(fu.id, { subject: e.target.value }); }}
                              className="w-full px-3 py-1.5 bg-background border border-border rounded-lg text-foreground text-sm focus:outline-none focus:border-primary/50" />
                            <textarea defaultValue={fu.body} rows={4}
                              onBlur={e => { if (e.target.value !== fu.body) void handlePatch(fu.id, { body: e.target.value }); }}
                              className="w-full px-3 py-1.5 bg-background border border-border rounded-lg text-foreground text-sm resize-none focus:outline-none focus:border-primary/50" />
                            <button onClick={() => setEditingId(null)} className="text-xs text-accent flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Done</button>
                          </div>
                        ) : (
                          <>
                            <p className="text-foreground font-medium text-sm">{fu.subject}</p>
                            <p className="text-muted-foreground text-xs mt-0.5 line-clamp-1">{fu.body.replace(/\n/g," ")}</p>
                          </>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${STATUS_STYLES[fu.status] ?? ""}`}>
                          {fu.status}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {fu.status === "SENT" && fu.sentAt ? `Sent ${formatDate(fu.sentAt)}` : daysUntil(fu.scheduledAt)}
                        </div>
                        {fu.status === "PENDING" && (
                          <div className="flex items-center gap-1 mt-1">
                            <button onClick={() => setEditingId(editingId === fu.id ? null : fu.id)}
                              className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors">
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => void handlePatch(fu.id, { status: "SENT" } as Partial<FollowUp>)}
                              title="Mark as sent"
                              className="p-1 rounded text-muted-foreground hover:text-accent transition-colors">
                              <Send className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => void handleDelete(fu.id)}
                              className="p-1 rounded text-muted-foreground hover:text-destructive transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tips */}
      <div className="bg-surface border border-border rounded-xl p-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-gold" /> Best Practices
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { icon: "3️⃣", title: "3-step max", desc: "More than 3 follow-ups looks spammy. Quality over quantity." },
            { icon: "⏳", title: "Space them out", desc: "Day 3, Day 7, Day 14 is the proven cadence that works." },
            { icon: "🎯", title: "Add value each time", desc: "Each follow-up should bring new insight, not just a bump." },
          ].map(tip => (
            <div key={tip.title} className="flex items-start gap-3">
              <span className="text-lg flex-shrink-0">{tip.icon}</span>
              <div>
                <p className="text-foreground text-xs font-semibold">{tip.title}</p>
                <p className="text-muted-foreground text-xs mt-0.5">{tip.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
