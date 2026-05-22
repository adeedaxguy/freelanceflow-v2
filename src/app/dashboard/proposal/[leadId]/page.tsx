"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { Sparkles, Send, Eye, EyeOff, Loader2, CheckCircle, AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";
import ConfirmModal from "@/components/ConfirmModal";

interface Lead { company: string; domain: string; email?: string | null; niche?: string | null; title?: string | null; }
interface ProposalBuilderProps { leadId: string; }

function ProposalBuilder({ leadId }: ProposalBuilderProps) {
  const [lead,       setLead]       = useState<Lead | null>(null);
  const [subject,    setSubject]    = useState("");
  const [body,       setBody]       = useState("");
  const [preview,    setPreview]    = useState(false);
  const [generating, setGenerating] = useState(false);
  const [sending,    setSending]    = useState(false);
  const [sent,       setSent]       = useState(false);
  const [error,      setError]      = useState("");
  const [confirmOpen,setConfirmOpen]= useState(false);
  const [aiSource,   setAiSource]   = useState<string | null>(null);
  const [toEmail,    setToEmail]    = useState("");

  // Load the saved lead
  useEffect(() => {
    fetch(`/api/leads/save?id=${leadId}`)
      .then(r => r.json())
      .then((d: { lead?: Lead }) => {
        if (d.lead) {
          setLead(d.lead);
          if (d.lead.email) setToEmail(d.lead.email);
        }
      })
      .catch(() => {/* non-fatal */});
  }, [leadId]);

  const handleGenerate = useCallback(async () => {
    if (!lead) return;
    setGenerating(true); setError("");
    try {
      const res = await fetch("/api/proposal/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobTitle:    lead.title ?? "Freelance Project",
          company:     lead.company,
          description: "",
          niche:       lead.niche ?? "",
        }),
      });
      const data = await res.json() as { subject?: string; body?: string; source?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Generation failed");
      setSubject(data.subject ?? "");
      setBody(data.body ?? "");
      setAiSource(data.source ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed. Please try again.");
    } finally {
      setGenerating(false);
    }
  }, [lead]);

  // Auto-generate once lead is loaded
  useEffect(() => {
    if (lead && !body) void handleGenerate();
  }, [lead]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSend() {
    if (!toEmail) { setError("No email address for this lead."); return; }
    setSending(true); setError("");
    const res = await fetch("/api/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to: toEmail, subject, body, leadId }),
    });
    if (res.ok) { setSent(true); }
    else { const d = await res.json() as { error?: string }; setError(d.error ?? "Send failed"); }
    setSending(false);
    setConfirmOpen(false);
  }

  return (
    <div className="max-w-3xl mx-auto p-6 lg:p-8 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/saved-leads"
          className="p-2 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold text-foreground">Proposal Builder</h1>
            {aiSource && (
              <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${
                aiSource === "groq" ? "bg-accent/10 text-accent border-accent/20" : "bg-primary/10 text-primary-light border-primary/20"
              }`}>
                {aiSource === "groq" ? "✦ AI Generated" : "✦ Template"}
              </span>
            )}
          </div>
          <p className="text-muted-foreground text-sm mt-0.5">
            {lead ? `Writing for ${lead.company}` : "Loading lead data…"}
          </p>
        </div>
      </div>

      {/* Lead card */}
      {lead && (
        <div className="bg-surface border border-border rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary-light font-bold flex-shrink-0">
            {lead.company[0]?.toUpperCase() ?? "?"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-foreground font-semibold text-sm">{lead.company}</p>
            <p className="text-muted-foreground text-xs">{lead.domain}</p>
          </div>
          {lead.niche && (
            <span className="px-2.5 py-1 rounded-full text-xs bg-primary/10 text-primary-light border border-primary/20 flex-shrink-0">
              {lead.niche}
            </span>
          )}
        </div>
      )}

      {/* Generating */}
      {generating && (
        <div className="bg-surface border border-border rounded-xl p-8 flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center animate-pulse-glow">
            <Sparkles className="w-6 h-6 text-primary-light" />
          </div>
          <p className="text-foreground font-semibold">Crafting your proposal…</p>
          <Loader2 className="w-5 h-5 animate-spin text-primary-light" />
        </div>
      )}

      {!generating && (
        <>
          {/* Recipient */}
          <div className="bg-surface border border-border rounded-2xl p-5 space-y-3">
            <h2 className="text-sm font-semibold text-foreground">Recipient</h2>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Email Address *</label>
              <input
                type="email"
                value={toEmail}
                onChange={e => setToEmail(e.target.value)}
                placeholder="hiring@company.com"
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/25 text-sm transition-all"
              />
            </div>
          </div>

          {/* Proposal */}
          <div className="bg-surface border border-border rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">Proposal</h2>
              <button onClick={() => setPreview(p => !p)}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                {preview ? <><EyeOff className="w-3.5 h-3.5" /> Edit</> : <><Eye className="w-3.5 h-3.5" /> Preview</>}
              </button>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Subject Line</label>
              <input
                type="text"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/60 text-sm transition-all"
                placeholder="Subject line…"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Body</label>
              {preview ? (
                <div className="bg-background border border-border rounded-xl p-5 text-sm text-foreground whitespace-pre-wrap leading-relaxed min-h-[260px]">
                  {body}
                </div>
              ) : (
                <textarea
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  rows={13}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/60 text-sm resize-none leading-relaxed transition-all"
                  placeholder="Proposal body…"
                />
              )}
              <p className="text-xs text-muted-foreground mt-1.5">{body.split(/\s+/).filter(Boolean).length} words</p>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
            </div>
          )}
          {sent && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-accent/10 border border-accent/20 text-accent text-sm">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              Email sent! View in <Link href="/dashboard/sent" className="underline ml-1">Sent Emails</Link>.
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pb-8">
            <button onClick={() => void handleGenerate()} disabled={generating || !lead}
              className="flex items-center gap-2 px-5 py-3 rounded-xl border border-primary/30 text-primary-light hover:bg-primary/10 font-semibold text-sm transition-all">
              <RefreshCw className="w-4 h-4" /> Regenerate
            </button>
            <button
              onClick={() => { if (!toEmail) { setError("Please enter recipient email."); return; } setConfirmOpen(true); }}
              disabled={!body || !subject || sent}
              className="flex items-center gap-2 px-7 py-3 rounded-xl bg-gradient-hero text-white font-bold text-sm transition-all shadow-glow-primary hover:opacity-90 disabled:opacity-50">
              <Send className="w-4 h-4" /> {sent ? "Sent!" : "Send Proposal"}
            </button>
          </div>
        </>
      )}

      <ConfirmModal
        isOpen={confirmOpen}
        title="Send Proposal"
        message={`Send this proposal to ${toEmail}? It will be logged in your Sent Emails.`}
        confirmLabel="Send Now"
        onConfirm={() => void handleSend()}
        onCancel={() => setConfirmOpen(false)}
        loading={sending}
      />
    </div>
  );
}

interface PageProps { params: { leadId: string } }

export default function ProposalPage({ params }: PageProps) {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary-light animate-spin" />
      </div>
    }>
      <ProposalBuilder leadId={params.leadId} />
    </Suspense>
  );
}
