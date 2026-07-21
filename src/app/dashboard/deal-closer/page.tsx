"use client";

import { useState, useCallback } from "react";
import {
  Zap, Send, RefreshCw, Copy, CheckCircle, Eye, EyeOff,
  Loader2, Sparkles, ArrowRight, Info, History, TrendingUp,
  BookOpen, Target, ChevronDown, ChevronUp, X, Plus,
} from "lucide-react";
import { copyText } from "@/lib/clipboard";

interface ReplyResult {
  subject: string; body: string; source: "groq" | "template";
  intent: string; intentLabel: string; intentEmoji: string; confidence: number;
}
interface ConversationTurn { role: "prospect" | "you"; text: string; result?: ReplyResult; timestamp: string; }

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
  { label: "Interested",    text: "This looks really interesting! Let's schedule a call to discuss further." },
  { label: "Price Concern", text: "Sounds good but I'm worried about the cost. What's your rate?" },
  { label: "Bad Timing",    text: "Thanks for reaching out — we're a bit busy right now. Maybe next quarter?" },
  { label: "Wants Info",    text: "Can you share some past work or case studies? I'd love to see examples." },
  { label: "Not a Fit",     text: "We already have an in-house team handling this. Thanks anyway." },
];

const OBJECTION_LIBRARY = [
  { objection: "Too expensive",           tactic: "ROI reframe",   tip: "Show cost vs. value. Quote the cost of NOT solving the problem." },
  { objection: "Need to think about it",  tactic: "FOMO + urgency", tip: "Create gentle urgency. Ask what decision they're weighing." },
  { objection: "Have an in-house team",   tactic: "Complement pitch", tip: "Position as a specialist who augments their team, not replaces." },
  { objection: "Bad timing",              tactic: "Future anchor",  tip: "Lock in a specific future date. 'Can we revisit in 2 weeks?'" },
  { objection: "Need more examples",      tactic: "Social proof",   tip: "Share a specific similar case study or outcome metric." },
  { objection: "Will check with partner", tactic: "Champion build", tip: "Offer a short summary doc they can forward to the decision-maker." },
];

const TONE_OPTIONS = [
  { value: "professional", label: "Professional" },
  { value: "friendly",     label: "Friendly" },
  { value: "assertive",    label: "Assertive" },
  { value: "empathetic",   label: "Empathetic" },
];

export default function DealCloserPage() {
  const [replyText,    setReplyText]    = useState("");
  const [company,      setCompany]      = useState("");
  const [originalBody, setOriginalBody] = useState("");
  const [niche,        setNiche]        = useState("");
  const [tone,         setTone]         = useState("professional");
  const [result,       setResult]       = useState<ReplyResult | null>(null);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState("");
  const [previewMode,  setPreviewMode]  = useState(false);
  const [subject,      setSubject]      = useState("");
  const [body,         setBody]         = useState("");
  const [copied,       setCopied]       = useState<"subject"|"body"|"all"|null>(null);
  const [activeSection, setActiveSection] = useState<"compose"|"history"|"library">("compose");
  const [history,      setHistory]      = useState<ConversationTurn[]>([]);
  const [showContext,  setShowContext]   = useState(false);
  const [dealScore,    setDealScore]     = useState<number | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!replyText.trim()) { setError("Please paste the client reply first."); return; }
    setLoading(true); setError(""); setResult(null);
    try {
      const res = await fetch("/api/reply/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ replyText, company, originalBody, niche, tone }),
      });
      const data = await res.json() as ReplyResult & { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Generation failed");
      setResult(data);
      setSubject(data.subject);
      setBody(data.body);
      // Compute deal score from intent
      const scores: Record<string, number> = {
        interested: 85, positive: 80, more_info: 60, referral: 55,
        price: 45, timing: 35, objection: 25, not_right_fit: 10,
      };
      setDealScore(scores[data.intent] ?? 50);
      // Add to conversation history
      const ts = new Date().toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
      setHistory(h => [
        { role: "prospect", text: replyText, timestamp: ts },
        { role: "you", text: data.body, result: data, timestamp: ts },
        ...h,
      ]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally { setLoading(false); }
  }, [replyText, company, originalBody, niche, tone]);

  const handleCopy = (type: "subject" | "body" | "all") => {
    const text = type === "all" ? `Subject: ${subject}\n\n${body}` : type === "subject" ? subject : body;
    void copyText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 1800);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Zap className="w-6 h-6 text-accent" /> AI Deal Closer
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Paste a prospect reply — AI detects intent and writes the perfect closing response in seconds.
          </p>
        </div>
        {/* Deal score */}
        {dealScore !== null && (
          <div className="flex items-center gap-3 bg-surface border border-border rounded-2xl px-5 py-3">
            <TrendingUp className="w-4 h-4 text-primary-light" />
            <div>
              <p className="text-xs text-muted-foreground font-medium">Deal Win Probability</p>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${dealScore >= 70 ? "bg-accent" : dealScore >= 40 ? "bg-yellow-400" : "bg-destructive"}`}
                    style={{ width: `${dealScore}%` }} />
                </div>
                <span className={`text-sm font-bold ${dealScore >= 70 ? "text-accent" : dealScore >= 40 ? "text-yellow-400" : "text-destructive"}`}>
                  {dealScore}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Section tabs */}
      <div className="flex items-center gap-1 bg-surface border border-border rounded-xl p-1">
        {[
          { id: "compose" as const, label: "Compose Reply", icon: Sparkles },
          { id: "history" as const, label: `History (${history.length})`, icon: History },
          { id: "library" as const, label: "Objection Library", icon: BookOpen },
        ].map(s => {
          const Icon = s.icon;
          return (
            <button key={s.id} onClick={() => setActiveSection(s.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all flex-1 justify-center ${activeSection === s.id ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"}`}>
              <Icon className="w-3.5 h-3.5" />{s.label}
            </button>
          );
        })}
      </div>

      {/* ── COMPOSE ── */}
      {activeSection === "compose" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT */}
          <div className="space-y-5">
            {/* Quick examples */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">Load Example Reply</p>
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
              <label className="block text-sm font-semibold text-foreground mb-1.5">
                Client Reply <span className="text-destructive">*</span>
              </label>
              <textarea value={replyText} onChange={e => setReplyText(e.target.value)} rows={5}
                placeholder="Paste the email reply you received from the client…"
                className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/25 text-sm resize-none transition-all" />
              <p className="text-xs text-muted-foreground mt-1">{replyText.length} characters</p>
            </div>

            {/* Tone selector */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">Reply Tone</p>
              <div className="flex gap-2 flex-wrap">
                {TONE_OPTIONS.map(t => (
                  <button key={t.value} onClick={() => setTone(t.value)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${tone === t.value ? "bg-primary border-primary text-white" : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"}`}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Context (collapsible) */}
            <div className="border border-border rounded-xl overflow-hidden">
              <button onClick={() => setShowContext(v => !v)}
                className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                <span className="flex items-center gap-1.5"><Info className="w-3.5 h-3.5" /> Context (optional — improves quality)</span>
                {showContext ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {showContext && (
                <div className="px-4 pb-4 space-y-3 border-t border-border bg-surface/50">
                  <div className="grid grid-cols-2 gap-3 pt-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Company Name</label>
                      <input value={company} onChange={e => setCompany(e.target.value)} placeholder="Acme Inc"
                        className="w-full px-3 py-2.5 bg-surface border border-border rounded-xl text-foreground text-sm placeholder-muted-foreground focus:outline-none focus:border-primary/50 transition-all" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Your Niche</label>
                      <input value={niche} onChange={e => setNiche(e.target.value)} placeholder="web development"
                        className="w-full px-3 py-2.5 bg-surface border border-border rounded-xl text-foreground text-sm placeholder-muted-foreground focus:outline-none focus:border-primary/50 transition-all" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Your Original Proposal (snippet)</label>
                    <textarea value={originalBody} onChange={e => setOriginalBody(e.target.value)} rows={3}
                      placeholder="Paste your original proposal for more personalised context…"
                      className="w-full px-3 py-3 bg-surface border border-border rounded-xl text-foreground text-sm placeholder-muted-foreground focus:outline-none focus:border-primary/50 resize-none transition-all" />
                  </div>
                </div>
              )}
            </div>

            <button onClick={() => void handleGenerate()} disabled={loading || !replyText.trim()}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl bg-gradient-hero text-white font-bold text-sm transition-all shadow-glow-primary hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Analysing &amp; generating…</>
                : <><Sparkles className="w-4 h-4" /> Generate Closing Reply <ArrowRight className="w-4 h-4" /></>}
            </button>
            {error && <p className="text-destructive text-sm bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3">{error}</p>}
          </div>

          {/* RIGHT — Result */}
          <div className="space-y-4">
            {!result && !loading && (
              <div className="h-full flex flex-col items-center justify-center py-16 border border-dashed border-border rounded-2xl bg-surface/40 text-center">
                <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-4">
                  <Target className="w-7 h-7 text-accent" />
                </div>
                <h3 className="text-foreground font-semibold mb-1">AI closes deals for you</h3>
                <p className="text-muted-foreground text-sm max-w-xs">Paste a client reply, select a tone, and get the perfect closing response — instantly.</p>
                <div className="mt-5 grid grid-cols-2 gap-2 text-xs text-muted-foreground max-w-xs w-full">
                  {["Detects 8 intent types", "Adapts to your tone", "Editable before sending", "Tracks win probability"].map(f => (
                    <div key={f} className="flex items-center gap-1.5 bg-surface border border-border rounded-lg px-2.5 py-2">
                      <CheckCircle className="w-3 h-3 text-accent flex-shrink-0" /> {f}
                    </div>
                  ))}
                </div>
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
                {/* Intent + confidence */}
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm font-semibold ${INTENT_COLORS[result.intent] ?? "bg-muted text-muted-foreground border-border"}`}>
                    <span>{result.intentEmoji}</span>{result.intentLabel}
                  </span>
                  <span className="text-xs text-muted-foreground">{result.confidence}% confidence</span>
                  <span className={`ml-auto text-xs px-2.5 py-1 rounded-full border font-medium ${result.source === "groq" ? "bg-accent/10 text-accent border-accent/20" : "bg-primary/10 text-primary-light border-primary/20"}`}>
                    {result.source === "groq" ? "✦ Groq AI" : "✦ Template"}
                  </span>
                </div>

                {/* Editor */}
                <div className="bg-surface border border-border rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-foreground">Closing Reply</h3>
                    <div className="flex items-center gap-2">
                      <button onClick={() => void handleGenerate()} disabled={loading}
                        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-border px-2.5 py-1.5 rounded-lg hover:border-primary/40 transition-all">
                        <RefreshCw className="w-3 h-3" /> Regen
                      </button>
                      <button onClick={() => setPreviewMode(p => !p)}
                        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-border px-2.5 py-1.5 rounded-lg hover:border-primary/40 transition-all">
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
                      ? <div className="bg-background border border-border rounded-xl p-4 text-sm text-foreground whitespace-pre-wrap leading-relaxed min-h-[180px]">{body}</div>
                      : <textarea value={body} onChange={e => setBody(e.target.value)} rows={9}
                          className="w-full px-3 py-3 bg-background border border-border rounded-xl text-foreground text-sm resize-none leading-relaxed focus:outline-none focus:border-primary/50 transition-all" />
                    }
                  </div>
                </div>

                {/* CTAs */}
                <div className="grid grid-cols-3 gap-2">
                  <button onClick={() => handleCopy("all")}
                    className="flex items-center justify-center gap-1.5 py-3 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 font-semibold text-xs transition-all">
                    {copied === "all" ? <><CheckCircle className="w-3.5 h-3.5 text-accent" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy All</>}
                  </button>
                  <button onClick={() => window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`)}
                    className="flex items-center justify-center gap-1.5 py-3 rounded-xl border border-primary/30 text-primary-light hover:bg-primary/10 font-semibold text-xs transition-all">
                    <Send className="w-3.5 h-3.5" /> Mail App
                  </button>
                  <button onClick={() => { setReplyText(""); setResult(null); setDealScore(null); }}
                    className="flex items-center justify-center gap-1.5 py-3 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:border-border font-semibold text-xs transition-all">
                    <Plus className="w-3.5 h-3.5" /> New
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── HISTORY ── */}
      {activeSection === "history" && (
        <div className="space-y-4">
          {history.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-border rounded-2xl">
              <History className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-foreground font-semibold mb-1">No conversation history yet</h3>
              <p className="text-muted-foreground text-sm">Generate replies to build up your deal history here.</p>
            </div>
          ) : (
            history.map((turn, i) => (
              <div key={i} className={`flex ${turn.role === "you" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-lg rounded-2xl p-4 space-y-2 ${turn.role === "you" ? "bg-primary/15 border border-primary/25" : "bg-surface border border-border"}`}>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-semibold text-muted-foreground capitalize">{turn.role === "you" ? "Your Reply (AI)" : "Prospect"}</span>
                    <span className="text-xs text-muted-foreground">{turn.timestamp}</span>
                  </div>
                  {turn.result && (
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${INTENT_COLORS[turn.result.intent] ?? "bg-muted text-muted-foreground border-border"}`}>
                        {turn.result.intentEmoji} {turn.result.intentLabel}
                      </span>
                    </div>
                  )}
                  <p className="text-sm text-foreground leading-relaxed line-clamp-4">{turn.text}</p>
                </div>
              </div>
            ))
          )}
          {history.length > 0 && (
            <button onClick={() => setHistory([])}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors">
              <X className="w-3.5 h-3.5" /> Clear history
            </button>
          )}
        </div>
      )}

      {/* ── OBJECTION LIBRARY ── */}
      {activeSection === "library" && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-primary/10 to-accent/5 border border-primary/20 rounded-2xl p-5">
            <h2 className="text-foreground font-bold flex items-center gap-2 mb-1">
              <BookOpen className="w-5 h-5 text-primary-light" /> Objection Handling Playbook
            </h2>
            <p className="text-muted-foreground text-sm">Every objection has a proven counter. Use these tactics when prospects push back.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {OBJECTION_LIBRARY.map((o, i) => (
              <div key={i} className="bg-gradient-card border border-border hover:border-primary/30 rounded-2xl p-5 transition-all">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <p className="text-foreground font-semibold text-sm">"{o.objection}"</p>
                    <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary-light border border-primary/20 font-medium">
                      {o.tactic}
                    </span>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">{o.tip}</p>
                <button onClick={() => { setReplyText(o.objection); setActiveSection("compose"); }}
                  className="mt-3 text-xs text-primary-light hover:text-foreground flex items-center gap-1 transition-colors">
                  <Sparkles className="w-3 h-3" /> Generate reply for this →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
