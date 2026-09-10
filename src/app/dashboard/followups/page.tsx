"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Clock, Plus, Trash2, CheckCircle, RefreshCw, Send,
  Loader2, AlertCircle, CalendarDays, Edit3, X, Sparkles,
} from "lucide-react";

import { requestJson } from "@/lib/client-request";
import ConfirmModal from "@/components/ConfirmModal";

interface Lead { id: string; company: string; domain: string; email?: string | null; }
interface FollowUp {
  id: string; leadId: string; step: number; subject: string; body: string;
  scheduledAt: string; sentAt: string | null; status: string;
  lead?: { company: string; domain: string; email?: string | null };
}

const STATUS_STYLES: Record<string, string> = {
  PENDING:   "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  READY_TO_SEND: "bg-gold/10 text-gold border-gold/20",
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
  const mutation = useRef(false);
  const [busy, setBusy] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState({ subject: "", body: "" });
  const [loadError, setLoadError] = useState("");
  const [saveMsg, setSaveMsg] = useState("");
  const [actionMsg, setActionMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const [fuData, leadData] = await Promise.all([
        requestJson<{ followUps: FollowUp[] }>("/api/followup", {}, "Could not load follow-ups."),
        requestJson<{ leads: Lead[] }>("/api/leads/save?limit=100", {}, "Could not load saved leads."),
      ]);
      if (!Array.isArray(fuData.followUps) || !Array.isArray(leadData.leads)) throw new Error("Unexpected response. Please retry.");
      setFollowUps(fuData.followUps);
      setLeads(leadData.leads);
    } catch (e) { setLoadError(e instanceof Error ? e.message : "Could not load your work. Please retry."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void fetchAll(); }, [fetchAll]);

  const handleCreate = async () => {
    if (mutation.current) return;
    if (!form.leadId || !form.subject || !form.body) { setSaveMsg("Please fill all required fields."); return; }
    mutation.current = true;
    setBusy(true);
    setSaveMsg("");
    try {
      await requestJson("/api/followup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) }, "Could not save this follow-up. Your draft is still here.");
      setCreating(false);
      setForm({ leadId: "", step: 1, subject: "", body: "", sendAfterDays: 3 });
      await fetchAll();
    } catch (e) { setSaveMsg(e instanceof Error ? e.message : "Could not save. Your draft is still here."); }
    finally { mutation.current = false; setBusy(false); }
  };

  const handlePatch = async (id: string, data: Partial<FollowUp>) => {
    if (mutation.current) return;
    mutation.current = true;
    setBusy(true);
    setActionMsg(null);
    try {
      await requestJson("/api/followup", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, ...data }) }, "Changes were not saved. Please retry.");
      setFollowUps(items => items.map(item => item.id === id ? { ...item, ...data } : item));
      setEditingId(null);
      setActionMsg({ type: "success", text: "Follow-up saved." });
    } catch (e) { setActionMsg({ type: "error", text: e instanceof Error ? e.message : "Changes were not saved. Please retry." }); }
    finally { mutation.current = false; setBusy(false); }
  };

  const handlePrepareInGmail = async (fu: FollowUp) => {
    if (mutation.current) return;
    if (!fu.lead?.email) { setActionMsg({ type: "error", text: "This follow-up has no recipient email." }); return; }
    mutation.current = true;
    setBusy(true);
    const composeWindow = window.open("about:blank", "_blank");
    let prepared = false;
    setActionMsg(null);
    try {
      const data = await requestJson<{ composeUrl?: string }>("/api/email/prepare", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: fu.lead.email, subject: fu.subject, body: fu.body, leadId: fu.leadId, company: fu.lead.company, domain: fu.lead.domain }),
      }, "Could not prepare Gmail compose.");
      if (!data.composeUrl) throw new Error("No Gmail draft link was returned.");
      if (composeWindow) composeWindow.location.href = data.composeUrl;
      else window.open(data.composeUrl, "_blank");
      prepared = true;
      await requestJson("/api/followup", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: fu.id, status: "READY_TO_SEND" }) }, "Gmail opened, but the prepared status was not saved.");
      setFollowUps(items => items.map(item => item.id === fu.id ? { ...item, status: "READY_TO_SEND" } : item));
      setActionMsg({ type: "success", text: "Follow-up prepared in Gmail. Review it and click Send inside Gmail." });
    } catch (e) {
      if (!prepared) composeWindow?.close();
      setActionMsg({ type: "error", text: prepared ? "Gmail opened, but we could not record its prepared status. Your email has not been sent by iCloseLeads." : e instanceof Error ? e.message : "Could not prepare Gmail." });
    } finally { mutation.current = false; setBusy(false); }
  };

  const handleDelete = async () => {
    if (!deleteId || mutation.current) return;
    mutation.current = true;
    setBusy(true);
    try {
      await requestJson(`/api/followup?id=${encodeURIComponent(deleteId)}`, { method: "DELETE" }, "Could not delete this follow-up. Please retry.");
      setFollowUps(items => items.filter(item => item.id !== deleteId));
      setDeleteId(null);
      setActionMsg(null);
    } catch (e) { setActionMsg({ type: "error", text: e instanceof Error ? e.message : "Could not delete this follow-up." }); }
    finally { mutation.current = false; setBusy(false); }
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
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-primary-light" /> Follow-Up Sequences
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Plan follow-up drafts and prepare them in Gmail when it is time to reach out.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button aria-label="Refresh follow-ups" disabled={loading || busy} onClick={() => void fetchAll()} className="p-2 rounded-xl border border-border text-muted-foreground hover:text-foreground transition-colors">
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
        {[["all","All"], ["PENDING","Pending"], ["READY_TO_SEND","Prepared"], ["SENT","Sent"], ["CANCELLED","Cancelled"]].map(([val, label]) => (
          <button key={val} onClick={() => setFilterStatus(val!)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${filterStatus === val ? "bg-primary border-primary text-white" : "border-border text-muted-foreground hover:text-foreground"}`}>
            {label}
          </button>
        ))}
      </div>

      {loadError && <p role="alert" className="rounded-lg border border-destructive/30 p-3 text-sm">{loadError} <button onClick={() => void fetchAll()} className="ml-2 underline">Retry</button></p>}
      {actionMsg && (
        <div role="status" className={`px-4 py-3 rounded-xl border text-sm ${
          actionMsg.type === "success"
            ? "bg-accent/10 border-accent/20 text-accent"
            : "bg-destructive/10 border-destructive/20 text-destructive"
        }`}>
          {actionMsg.text}
        </div>
      )}

      {/* Create modal */}
      {creating && (
        <div className="bg-surface border border-primary/30 rounded-2xl p-6 space-y-5 animate-fade-in-up">
          <div className="flex items-center justify-between">
            <h2 className="text-foreground font-semibold flex items-center gap-2"><Plus className="w-4 h-4 text-primary-light" /> New Follow-Up Step</h2>
            <button aria-label="Close new follow-up" disabled={busy} onClick={() => { setCreating(false); setSaveMsg(""); }} className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors"><X className="w-4 h-4" /></button>
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
              <select aria-label="Lead" value={form.leadId} onChange={e => setForm(f => ({ ...f, leadId: e.target.value }))}
                className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:border-primary/50">
                <option value="">Select a lead…</option>
                {leads.map(l => <option key={l.id} value={l.id}>{l.company}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Step #</label>
              <input aria-label="Step" type="number" min={1} max={10} value={form.step} onChange={e => setForm(f => ({ ...f, step: Number(e.target.value) }))}
                className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:border-primary/50" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Prepare After (days)</label>
              <input aria-label="Prepare after days" type="number" min={1} max={90} value={form.sendAfterDays} onChange={e => setForm(f => ({ ...f, sendAfterDays: Number(e.target.value) }))}
                className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:border-primary/50" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Subject *</label>
            <input aria-label="Subject" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
              placeholder="Follow-up subject line"
              className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:border-primary/50" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Body *</label>
            <textarea aria-label="Body" value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} rows={6}
              placeholder="Email body… Use [Company], [Your Name], [niche] as placeholders"
              className="w-full px-3 py-3 bg-background border border-border rounded-xl text-foreground text-sm resize-none focus:outline-none focus:border-primary/50" />
          </div>
          {saveMsg && <p role="alert" className="text-destructive text-sm">{saveMsg}</p>}
          <div className="flex gap-3">
            <button disabled={busy} onClick={() => void handleCreate()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-light text-white font-semibold text-sm transition-all shadow-glow-primary">
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />} {busy ? "Saving..." : "Save Follow-Up"}
            </button>
            <button disabled={busy} onClick={() => { setCreating(false); setSaveMsg(""); }}
              className="px-5 py-2.5 rounded-xl border border-border text-muted-foreground hover:text-foreground text-sm transition-all">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      {loading && followUps.length === 0 ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-24 bg-surface border border-border rounded-2xl animate-pulse" />)}</div>
      ) : loadError && followUps.length === 0 ? null : Object.keys(byLead).length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-2xl bg-surface/50">
          <CalendarDays className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-40" />
          <h3 className="text-foreground font-semibold mb-2">No follow-ups planned</h3>
          <p className="text-muted-foreground text-sm mb-5 max-w-sm mx-auto">
            Create follow-up drafts for leads who have not replied, then prepare each one in Gmail when it is due.
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
                    <div key={fu.id} className="grid grid-cols-[28px_minmax(0,1fr)] gap-3 px-5 py-4 sm:flex sm:items-start sm:gap-4 hover:bg-primary/5 transition-colors">
                      {/* Step indicator */}
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${fu.status === "SENT" ? "bg-accent/20 text-accent" : fu.status === "CANCELLED" ? "bg-red-500/20 text-red-400" : "bg-primary/20 text-primary-light"}`}>
                        {fu.step}
                      </div>

                      <div className="flex-1 min-w-0">
                        {editingId === fu.id ? (
                          <div className="space-y-2">
                            <input aria-label="Edit subject" disabled={busy} value={editDraft.subject}
                              onChange={e => setEditDraft(d => ({ ...d, subject: e.target.value }))}
                              className="w-full px-3 py-1.5 bg-background border border-border rounded-lg text-foreground text-sm focus:outline-none focus:border-primary/50" />
                            <textarea aria-label="Edit body" disabled={busy} value={editDraft.body} rows={4}
                              onChange={e => setEditDraft(d => ({ ...d, body: e.target.value }))}
                              className="w-full px-3 py-1.5 bg-background border border-border rounded-lg text-foreground text-sm resize-none focus:outline-none focus:border-primary/50" />
                            <button disabled={busy} onClick={() => void handlePatch(fu.id, editDraft)} className="text-xs text-accent flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> {busy ? "Saving..." : "Save changes"}</button>
                            <button disabled={busy} onClick={() => setEditingId(null)} className="text-xs text-muted-foreground underline">Discard changes</button>
                          </div>
                        ) : (
                          <>
                            <p className="text-foreground font-medium text-sm">{fu.subject}</p>
                            <p className="text-muted-foreground text-xs mt-0.5 line-clamp-1">{fu.body.replace(/\n/g," ")}</p>
                          </>
                        )}
                      </div>

                      <div className="col-start-2 flex flex-wrap items-center gap-2 sm:flex-col sm:items-end sm:flex-shrink-0">
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${STATUS_STYLES[fu.status] ?? ""}`}>
                          {fu.status === "READY_TO_SEND" ? "PREPARED" : fu.status}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {fu.status === "SENT" && fu.sentAt
                            ? `Sent ${formatDate(fu.sentAt)}`
                            : fu.status === "READY_TO_SEND"
                            ? "Prepared"
                            : daysUntil(fu.scheduledAt)}
                        </div>
                        {(fu.status === "PENDING" || fu.status === "READY_TO_SEND") && (
                          <div className="flex items-center gap-1 mt-1">
                            <button aria-label="Edit follow-up" disabled={busy || Boolean(editingId)} onClick={() => { setEditingId(fu.id); setEditDraft({ subject: fu.subject, body: fu.body }); }}
                              className="min-h-11 min-w-11 sm:min-h-0 sm:min-w-0 p-1 rounded text-muted-foreground hover:text-foreground transition-colors">
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button aria-label="Prepare in Gmail" disabled={busy || editingId === fu.id} onClick={() => void handlePrepareInGmail(fu)}
                              title="Prepare in Gmail"
                              className="min-h-11 min-w-11 sm:min-h-0 sm:min-w-0 p-1 rounded text-muted-foreground hover:text-accent transition-colors">
                              <Send className="w-3.5 h-3.5" />
                            </button>
                            <button aria-label="Delete follow-up" disabled={busy} onClick={() => { setActionMsg(null); setDeleteId(fu.id); }}
                              className="min-h-11 min-w-11 sm:min-h-0 sm:min-w-0 p-1 rounded text-muted-foreground hover:text-destructive transition-colors">
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
      <ConfirmModal isOpen={Boolean(deleteId)} title="Delete follow-up" message={actionMsg?.type === "error" ? actionMsg.text : "This draft will be permanently deleted."} loading={busy} onConfirm={() => void handleDelete()} onCancel={() => { if (!busy) setDeleteId(null); }} />
    </div>
  );
}
