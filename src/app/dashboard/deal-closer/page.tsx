"use client";

import { useState, useCallback } from "react";
import {
  Zap, Send, RefreshCw, Copy, CheckCircle, Eye, EyeOff,
  Loader2, Sparkles, ArrowRight, Info,
} from "lucide-react";

interface ReplyResult {
  subject: string; body: string; source: "groq" | "template";
  intent: string; intentLabel: string; intentEmoji: string; confidence: number;
}

const INTENT_COLORS: Record<string, string> = {
  interested:    "bg-green-500/10  text-green-400  border-green-500/20",
  price:         "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  timing:        "bg-orange-500/10 text-orange-400 border-orange-500/20",
  not_right_fit: "bg-red-500/10    text-red-400    border-red-500/20",
  more_info:     "bg-blue-500/10   text-blue-400   border-blue-500/20",
  referral:      "bg-purple-500/10 text-purple-400 border-purple-500/20",
  objection:     "bg-amber-500/10  text-amber-400  border-amber-500/20",
  positive:      "bg-accent/10     text-accent     border-accent/20",
};

const EXAMPLE_REPLIES = [
  { label: "Interested", text: "This looks really interesting! Let's schedule a call to discuss further." },
  { label: "Price Concern", text: "Sounds good but I'm worried about the cost. What's your rate?" },
  { label: "Bad Timing", text: "Thanks for reaching out — we're a bit busy right now. Maybe next quarter?" },
  { label: "Wants Info", text: "Can you share some past work or case studies? I'd love to see examples." },
  { label: "Not a Fit", text: "We already have an in-house team handling this. Thanks anyway." },
];

export default function DealCloserPage() {
  const [replyText,    setReplyText]    = useState("");
  const [company,      setCompany]      = useState("");
  const [originalBody, setOriginalBody] = useState("");
  const [niche,        setNiche]        = useState("");
  const [result,       setResult]       = useState<ReplyResult | null>(null);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState("");
  const [previewMode,  setPreviewMode]  = useState(false);
  const [subject,      setSubject]      = useState("");
  const [body,         setBody]         = useState("");
  const [copied,       setCopied]       = useState<"subject" | "body" | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!replyText.trim()) { setError("Please paste the client reply first."); return; }
    setLoading(true); setError(""); setResult(null);
    try {
      const res = await fetch("/api/reply/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ replyText, company, originalBody, niche }),
      });
      const data = await res.json() as ReplyResult & { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Generation failed");
      setResult(data);
      setSubject(data.subject);
      setBody(data.body);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally { setLoading(false); }
  }, [replyText, company, originalBody, niche]);

  const handleCopy = (type: "subject" | "body") => {
    void navigator.clipboard.writeText(type === "subject" ? subject : body);
    setCopied(type);
    setTimeout(() => setCopied(null), 1800);
  };

  return (
    <div className="p-6 lg:p-8 max-w-5xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Zap className="w-6 h-6 text-accent" /> AI Deal Closer
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Paste a client reply — AI detects their intent and writes a reply that moves the deal forward.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT — Inputs */}
        <div className="space-y-5">
          {/* Quick examples */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">Quick Load Examples</p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_REPLIES.map(ex => (
                <button key={ex.label} onClick={() => setReplyText(ex.text)}
                  className="px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all">
                  {ex.label}
                </button>
              ))}
            </div>
          </div>

          {/* Client reply */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5">Client Reply *</label>
            <textarea
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              rows={5}
              placeholder="Paste the email reply you received from the client here…"
              className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/25 text-sm resize-none transition-all"
            />
          </div>

          {/* Context (collapsible) */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" /> Context (optional — improves quality)
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Company Name</label>
                <input value={company} onChange={e => setCompany(e.target.value)}
                  placeholder="Acme Inc"
                  className="w-full px-3 py-2.5 bg-surface border border-border rounded-xl text-foreground text-sm placeholder-muted-foreground focus:outline-none focus:border-primary/50 transition-all" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Your Niche</label>
                <input value={niche} onChange={e => setNiche(e.target.value)}
                  placeholder="web development"
                  className="w-full px-3 py-2.5 bg-surface border border-border rounded-xl text-foreground text-sm placeholder-muted-foreground focus:outline-none focus:border-primary/50 transition-all" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Your Original Proposal (snippet)</label>
              <textarea value={originalBody} onChange={e => setOriginalBody(e.target.value)} rows={3}
                placeholder="Paste your original proposal here for more personalised reply…"
                className="w-full px-3 py-3 bg-surface border border-border rounded-xl text-foreground text-sm placeholder-muted-foreground focus:outline-none focus:border-primary/50 resize-none transition-all" />
            </div>
          </div>

          <button onClick={() => void handleGenerate()} disabled={loading || !replyText.trim()}
            className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl bg-gradient-hero text-white font-bold text-sm transition-all shadow-glow-primary hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed">
            {loading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Analysing &amp; generating…</>
              : <><Sparkles className="w-4 h-4" /> Generate Closing Reply <ArrowRight className="w-4 h-4" /></>
            }
          </button>

          {error && <p className="text-destructive text-sm bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3">{error}</p>}
        </div>

        {/* RIGHT — Result */}
        <div className="space-y-4">
          {!result && !loading && (
            <div className="h-full flex flex-col items-center justify-center py-16 border border-dashed border-border rounded-2xl bg-surface/40 text-center">
              <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-4">
                <Zap className="w-7 h-7 text-accent" />
              </div>
              <h3 className="text-foreground font-semibold mb-1">AI closes deals for you</h3>
              <p className="text-muted-foreground text-sm max-w-xs">
                Paste a client reply on the left and let AI craft the perfect response to move the deal forward.
              </p>
            </div>
          )}

          {loading && (
            <div className="h-full flex flex-col items-center justify-center py-16 border border-border rounded-2xl bg-surface/40 text-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center animate-pulse-glow">
                <Sparkles className="w-7 h-7 text-primary-light" />
              </div>
              <div>
                <p className="text-foreground font-semibold">Analysing intent…</p>
                <p className="text-muted-foreground text-sm mt-1">Crafting your closing reply</p>
              </div>
            </div>
          )}

          {result && (
            <div className="space-y-4 animate-fade-in-up">
              {/* Intent badge */}
              <div className="flex items-center gap-3 flex-wrap">
                <span className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm font-semibold ${INTENT_COLORS[result.intent] ?? "bg-muted text-muted-foreground border-border"}`}>
                  <span>{result.intentEmoji}</span>
                  {result.intentLabel}
                </span>
                <span className="text-xs text-muted-foreground">{result.confidence}% confidence</span>
                <span className={`ml-auto text-xs px-2.5 py-1 rounded-full border font-medium ${result.source === "groq" ? "bg-accent/10 text-accent border-accent/20" : "bg-primary/10 text-primary-light border-primary/20"}`}>
                  {result.source === "groq" ? "✦ AI" : "✦ Template"}
                </span>
              </div>

              {/* Editor / Preview toggle */}
              <div className="bg-surface border border-border rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">Closing Reply</h3>
                  <div className="flex items-center gap-2">
                    <button onClick={() => void handleGenerate()} disabled={loading}
                      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors border border-border px-2.5 py-1.5 rounded-lg hover:border-primary/40">
                      <RefreshCw className="w-3 h-3" /> Regenerate
                    </button>
                    <button onClick={() => setPreviewMode(p => !p)}
                      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors border border-border px-2.5 py-1.5 rounded-lg hover:border-primary/40">
                      {previewMode ? <><EyeOff className="w-3 h-3" /> Edit</> : <><Eye className="w-3 h-3" /> Preview</>}
                    </button>
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Subject</label>
                    <button onClick={() => handleCopy("subject")} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-accent transition-colors">
                      {copied === "subject" ? <><CheckCircle className="w-3 h-3 text-accent" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
                    </button>
                  </div>
                  <input value={subject} onChange={e => setSubject(e.target.value)}
                    className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:border-primary/50 transition-all" />
                </div>

                {/* Body */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Body</label>
                    <button onClick={() => handleCopy("body")} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-accent transition-colors">
                      {copied === "body" ? <><CheckCircle className="w-3 h-3 text-accent" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
                    </button>
                  </div>
                  {previewMode
                    ? <div className="bg-background border border-border rounded-xl p-4 text-sm text-foreground whitespace-pre-wrap leading-relaxed min-h-[200px]">{body}</div>
                    : <textarea value={body} onChange={e => setBody(e.target.value)} rows={10}
                        className="w-full px-3 py-3 bg-background border border-border rounded-xl text-foreground text-sm resize-none leading-relaxed focus:outline-none focus:border-primary/50 transition-all" />
                  }
                </div>
              </div>

              {/* Send CTAs */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const full = `Subject: ${subject}\n\n${body}`;
                    void navigator.clipboard.writeText(full);
                    setCopied("body");
                    setTimeout(() => setCopied(null), 2000);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 font-semibold text-sm transition-all">
                  {copied === "body"
                    ? <><CheckCircle className="w-4 h-4 text-accent" /> Copied!</>
                    : <><Copy className="w-4 h-4" /> Copy All</>}
                </button>
                <button
                  onClick={() => {
                    const mailto = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                    window.open(mailto);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-primary/30 text-primary-light hover:bg-primary/10 font-semibold text-sm transition-all">
                  <Send className="w-4 h-4" /> Open in Mail App
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
