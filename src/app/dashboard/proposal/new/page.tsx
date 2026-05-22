"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Sparkles, Send, Eye, EyeOff, Loader2, CheckCircle,
  ArrowLeft, ExternalLink, Mail, Building2, Briefcase, RefreshCw,
} from "lucide-react";
import Link from "next/link";

interface ProposalResult { subject: string; body: string; source: string; }

function NewProposalInner() {
  const params = useSearchParams();
  const company     = params.get("company") ?? "";
  const domain      = params.get("domain") ?? "";
  const jobTitle    = params.get("title") ?? "";
  const description = params.get("description") ?? "";
  const jobUrl      = params.get("url") ?? "";
  const niche       = params.get("niche") ?? "";
  const emailParam  = params.get("email") ?? "";

  const [subject,    setSubject]    = useState("");
  const [body,       setBody]       = useState("");
  const [preview,    setPreview]    = useState(false);
  const [generating, setGenerating] = useState(false);
  const [sending,    setSending]    = useState(false);
  const [sent,       setSent]       = useState(false);
  const [toEmail,    setToEmail]    = useState(emailParam);
  const [aiSource,   setAiSource]   = useState<string | null>(null);
  const [error,      setError]      = useState("");

  const generate = useCallback(async () => {
    setGenerating(true); setError("");
    try {
      const res = await fetch("/api/proposal/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobTitle: jobTitle || "Freelance Project",
          company:  company || "this company",
          description,
          niche,
        }),
      });
      const data = await res.json() as ProposalResult & { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setSubject(data.subject);
      setBody(data.body);
      setAiSource(data.source);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed. Please try again.");
    } finally {
      setGenerating(false);
    }
  }, [jobTitle, company, description, niche]);

  useEffect(() => { void generate(); }, [generate]);

  const handleSend = useCallback(async () => {
    if (!toEmail) { setError("Please enter the recipient's email address."); return; }
    if (!subject) { setError("Subject line is required."); return; }
    if (!body)    { setError("Proposal body is required."); return; }
    setSending(true); setError("");
    try {
      const res = await fetch("/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: toEmail, subject, body, company, domain }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Send failed");
      setSent(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Send failed. Please try again.");
    } finally {
      setSending(false);
    }
  }, [toEmail, subject, body, company, domain]);

  if (sent) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <div className="w-20 h-20 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-accent" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Proposal Sent!</h2>
        <p className="text-muted-foreground mb-8">Your proposal to <span className="text-foreground font-semibold">{company}</span> has been sent successfully.</p>
        <div className="flex gap-3 justify-center">
          <Link href="/dashboard/leads"
            className="px-5 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-light transition-all shadow-glow-primary">
            Find More Leads
          </Link>
          <Link href="/dashboard/sent"
            className="px-5 py-2.5 rounded-xl border border-border text-muted-foreground hover:text-foreground text-sm transition-all">
            View Sent
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link href="/dashboard/leads"
          className="mt-1 p-2 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all flex-shrink-0">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h1 className="text-2xl font-extrabold text-foreground">AI Proposal</h1>
            {aiSource && (
              <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${
                aiSource === "groq"
                  ? "bg-accent/10 text-accent border-accent/20"
                  : "bg-primary/10 text-primary-light border-primary/20"
              }`}>
                {aiSource === "groq" ? "✦ AI Generated" : "✦ Template"}
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
            {company && (
              <span className="flex items-center gap-1.5 text-primary-light font-semibold">
                <Building2 className="w-3.5 h-3.5" /> {company}
              </span>
            )}
            {domain && domain !== "reddit.com" && (
              <span className="text-muted-foreground">{domain}</span>
            )}
            {jobTitle && (
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Briefcase className="w-3.5 h-3.5" /> {jobTitle}
              </span>
            )}
            {jobUrl && (
              <a href={jobUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary-light transition-colors">
                <ExternalLink className="w-3 h-3" /> View Job
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Job snippet */}
      {description && (
        <div className="bg-surface border border-border rounded-xl p-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Job Brief</p>
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
            {description.replace(/<[^>]+>/g, "").slice(0, 350)}
          </p>
        </div>
      )}

      {/* Generating */}
      {generating && (
        <div className="bg-surface border border-border rounded-2xl p-10 flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center animate-pulse-glow">
              <Sparkles className="w-7 h-7 text-primary-light" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-foreground font-semibold">Crafting your proposal…</p>
            <p className="text-muted-foreground text-sm mt-1">Personalising it for {company || "this company"}</p>
          </div>
          <Loader2 className="w-5 h-5 animate-spin text-primary-light" />
        </div>
      )}

      {!generating && (
        <>
          {/* Recipient Email */}
          <div className="bg-surface border border-border rounded-2xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Mail className="w-4 h-4 text-accent" /> Recipient
            </h2>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Email Address *</label>
              <div className="relative">
                <input
                  type="email"
                  value={toEmail}
                  onChange={e => setToEmail(e.target.value)}
                  placeholder="hiring@company.com"
                  className="w-full pl-4 pr-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/25 text-sm transition-all"
                />
              </div>
              {!toEmail && (
                <p className="text-xs text-gold mt-1.5 flex items-center gap-1">
                  ⚠ Enter the recipient's email to send this proposal
                </p>
              )}
              {emailParam && toEmail === emailParam && (
                <p className="text-xs text-accent mt-1.5">✓ Pre-filled from lead data</p>
              )}
            </div>
          </div>

          {/* Proposal */}
          <div className="bg-surface border border-border rounded-2xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary-light" /> Proposal
            </h2>

            {/* Subject */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Subject Line</label>
              <input
                type="text"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="Compelling subject line…"
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/25 text-sm transition-all"
              />
            </div>

            {/* Body */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-muted-foreground">Proposal Body</label>
                <button onClick={() => setPreview(p => !p)}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                  {preview ? <><EyeOff className="w-3.5 h-3.5" /> Edit</> : <><Eye className="w-3.5 h-3.5" /> Preview</>}
                </button>
              </div>
              {preview ? (
                <div className="bg-background border border-border rounded-xl p-5 text-sm text-foreground whitespace-pre-wrap leading-relaxed min-h-[280px]">
                  {body}
                </div>
              ) : (
                <textarea
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  rows={14}
                  placeholder="Your proposal will appear here…"
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/25 text-sm resize-none leading-relaxed transition-all"
                />
              )}
              <p className="text-xs text-muted-foreground mt-1.5">
                {body.split(/\s+/).filter(Boolean).length} words
              </p>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="text-destructive text-sm bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1 pb-8">
            <button
              onClick={() => void generate()}
              className="flex items-center gap-2 px-5 py-3 rounded-xl border border-primary/30 text-primary-light hover:bg-primary/10 font-semibold text-sm transition-all">
              <RefreshCw className="w-4 h-4" /> Regenerate
            </button>
            <button
              onClick={() => void handleSend()}
              disabled={sending || !toEmail || !subject || !body}
              className="flex items-center gap-2 px-7 py-3 rounded-xl bg-gradient-hero text-white font-bold text-sm transition-all shadow-glow-primary hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none">
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {sending ? "Sending…" : "Send Proposal"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function NewProposalPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin text-primary-light" />
        <p className="text-sm">Loading proposal…</p>
      </div>
    }>
      <NewProposalInner />
    </Suspense>
  );
}
