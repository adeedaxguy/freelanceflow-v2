"use client";

import { useState, useCallback } from "react";
import {
  Calculator, Mail, DollarSign, Clock, Zap, CheckCircle, XCircle,
  Loader2, Copy, RefreshCw, Target, TrendingUp, FileText,
  AlertCircle, ShieldCheck, BarChart2, Sparkles,
} from "lucide-react";

// ─── Shared helpers ───────────────────────────────────────────────────────────
function useCopy() {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(key);
    setTimeout(() => setCopied(null), 1800);
  };
  return { copied, copy };
}

function ToolCard({ title, icon: Icon, iconColor, badge, description, children }: {
  title: string; icon: React.ElementType; iconColor: string;
  badge?: string; description: string; children: React.ReactNode;
}) {
  return (
    <div className="bg-gradient-card border border-border rounded-2xl p-6 space-y-5 flex flex-col">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconColor.replace("text-", "bg-").replace("400","") + "/10"}`}>
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-foreground text-sm">{title}</h3>
              {badge && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/20">{badge}</span>}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          </div>
        </div>
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}

// ─── Tool 1: Freelance Rate Calculator ───────────────────────────────────────
function RateCalculator() {
  const [income,   setIncome]   = useState("60000");
  const [hours,    setHours]    = useState("40");
  const [expenses, setExpenses] = useState("5000");
  const [vacation, setVacation] = useState("2");
  const [buffer,   setBuffer]   = useState("20");
  const [result,   setResult]   = useState<{ hourly: number; daily: number; monthly: number; minProject: number } | null>(null);

  const calculate = () => {
    const annual   = parseFloat(income)   || 0;
    const wkHours  = parseFloat(hours)    || 40;
    const exp      = parseFloat(expenses) || 0;
    const vacWks   = parseFloat(vacation) || 2;
    const bufferPct = (parseFloat(buffer) || 20) / 100;
    const billable  = (52 - vacWks) * wkHours * 0.75;
    const total     = (annual + exp) * (1 + bufferPct);
    const hourly    = Math.ceil(total / billable);
    setResult({ hourly, daily: hourly * 8, monthly: Math.ceil(total / 12), minProject: hourly * 10 });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Target Annual Income ($)", value: income,   set: setIncome,   ph: "60000" },
          { label: "Billable Hours / Week",    value: hours,    set: setHours,    ph: "40" },
          { label: "Annual Business Expenses", value: expenses, set: setExpenses, ph: "5000" },
          { label: "Vacation Weeks / Year",    value: vacation, set: setVacation, ph: "2" },
          { label: "Profit Buffer %",          value: buffer,   set: setBuffer,   ph: "20" },
        ].map(({ label, value, set, ph }) => (
          <div key={label} className={label.includes("Buffer") ? "col-span-2" : ""}>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">{label}</label>
            <input type="number" value={value} onChange={e => set(e.target.value)} placeholder={ph}
              className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:border-primary/50 transition-colors" />
          </div>
        ))}
      </div>
      <button onClick={calculate}
        className="w-full py-2.5 bg-gradient-hero text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-all shadow-glow-primary">
        Calculate My Rate
      </button>
      {result && (
        <div className="grid grid-cols-2 gap-2.5">
          {[
            { label: "Hourly Rate",    value: `$${result.hourly}`,       color: "text-primary-light bg-primary/10 border-primary/20" },
            { label: "Day Rate",       value: `$${result.daily}`,        color: "text-accent bg-accent/10 border-accent/20" },
            { label: "Monthly Target", value: `$${result.monthly.toLocaleString()}`, color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" },
            { label: "Min Project",    value: `$${result.minProject}`,   color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
          ].map(({ label, value, color }) => (
            <div key={label} className={`rounded-xl p-3.5 border text-center ${color}`}>
              <p className="text-lg font-bold">{value}</p>
              <p className="text-[10px] mt-0.5 opacity-70 font-medium uppercase tracking-wider">{label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Tool 2: AI Subject Line Generator ───────────────────────────────────────
function SubjectLineGen() {
  const { copied, copy } = useCopy();
  const [niche,   setNiche]   = useState("");
  const [company, setCompany] = useState("");
  const [goal,    setGoal]    = useState("get a reply");
  const [lines,   setLines]   = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const TEMPLATES: Record<string, string[]> = {
    "web-development": [
      "Quick question about {company}'s website speed",
      "I noticed something on {company}.com — worth 5 mins?",
      "How {company} could add $X in revenue with one change",
      "Your competitor just redesigned — here's what works",
      "3 UX wins I'd add to {company}'s site this week",
    ],
    "design": [
      "The one thing missing from {company}'s brand",
      "Quick design audit of {company} — 3 things I noticed",
      "Your brand vs. your competitors (honest comparison)",
      "Design idea that could lift {company}'s conversions",
      "I redesigned one page of {company}'s site (screenshot inside)",
    ],
    "copywriting": [
      "Your homepage is losing you leads — here's why",
      "{company}'s copy is 80% there — quick fix?",
      "I rewrote your headline. Want to see it?",
      "One word change that could boost {company}'s signups",
      "Why {company}'s CTA isn't converting (and the fix)",
    ],
    "default": [
      "Quick idea for {company}",
      "Something I noticed about {company}",
      "Free audit for {company} — no strings attached",
      "How I'd approach {company}'s biggest challenge",
      "This worked for {company}'s competitors — worth a look?",
    ],
  };

  const generate = async () => {
    if (!niche.trim()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 700));
    const base = TEMPLATES[niche] ?? TEMPLATES["default"]!;
    const co = company.trim() || "your company";
    setLines(base.map(t => t.replace(/\{company\}/g, co)));
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Your Niche</label>
          <select value={niche} onChange={e => setNiche(e.target.value)}
            className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:border-primary/50">
            <option value="">Select niche…</option>
            {["web-development","design","copywriting","seo","social-media","video-editing","data-analysis","marketing"].map(n => (
              <option key={n} value={n}>{n.replace(/-/g," ").replace(/\b\w/g,c=>c.toUpperCase())}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Prospect Company (optional)</label>
          <input value={company} onChange={e => setCompany(e.target.value)} placeholder="Acme Corp"
            className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:border-primary/50 transition-colors" />
        </div>
      </div>
      <button onClick={generate} disabled={!niche || loading}
        className="w-full py-2.5 bg-gradient-hero text-white rounded-xl font-semibold text-sm hover:opacity-90 disabled:opacity-40 transition-all shadow-glow-primary flex items-center justify-center gap-2">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
        Generate Subject Lines
      </button>
      {lines.length > 0 && (
        <div className="space-y-2">
          {lines.map((line, i) => (
            <div key={i} className="flex items-center justify-between gap-2 bg-background border border-border rounded-xl px-3 py-2.5">
              <span className="text-sm text-foreground flex-1">{line}</span>
              <button onClick={() => copy(line, `line-${i}`)}
                className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0">
                {copied === `line-${i}` ? <CheckCircle className="w-3.5 h-3.5 text-accent" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Tool 3: Proposal Readability Scorer ─────────────────────────────────────
function ProposalScorer() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<{
    score: number; grade: string; avgWords: number; passiveCount: number;
    longSentences: number; suggestions: string[];
  } | null>(null);

  const analyse = () => {
    if (!text.trim()) return;
    const sentences  = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words      = text.trim().split(/\s+/).filter(Boolean);
    const avgWords   = sentences.length > 0 ? Math.round(words.length / sentences.length) : 0;
    const longSents  = sentences.filter(s => s.trim().split(/\s+/).length > 20).length;
    const passiveRx  = /\b(is|are|was|were|be|been|being)\s+\w+ed\b/gi;
    const passiveCount = (text.match(passiveRx) ?? []).length;
    const fillerRx   = /\b(just|very|really|actually|basically|literally|honestly)\b/gi;
    const fillerCount = (text.match(fillerRx) ?? []).length;

    let score = 100;
    if (avgWords > 20) score -= 15;
    else if (avgWords > 15) score -= 7;
    score -= Math.min(30, longSents * 8);
    score -= Math.min(20, passiveCount * 5);
    score -= Math.min(10, fillerCount * 3);
    score = Math.max(0, Math.min(100, score));

    const grade = score >= 80 ? "Excellent" : score >= 60 ? "Good" : score >= 40 ? "Needs Work" : "Poor";
    const suggestions: string[] = [];
    if (avgWords > 15) suggestions.push(`Avg sentence length is ${avgWords} words — aim for ≤15 for easy scanning.`);
    if (longSents > 0) suggestions.push(`${longSents} sentence${longSents > 1 ? "s are" : " is"} too long — break them up.`);
    if (passiveCount > 0) suggestions.push(`${passiveCount} passive voice instance${passiveCount > 1 ? "s" : ""} — use active voice ("We deliver" not "It will be delivered").`);
    if (fillerCount > 0) suggestions.push(`${fillerCount} filler word${fillerCount > 1 ? "s" : ""} detected — remove them for sharper writing.`);
    if (words.length < 80) suggestions.push("Proposal seems short — add more specific value points.");
    if (suggestions.length === 0) suggestions.push("Great proposal! Clear, concise, and easy to read.");

    setResult({ score, grade, avgWords, passiveCount, longSentences: longSents, suggestions });
  };

  const scoreColor = result
    ? result.score >= 80 ? "text-accent" : result.score >= 60 ? "text-yellow-400" : "text-destructive"
    : "";

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">Paste your proposal or email draft</label>
        <textarea value={text} onChange={e => setText(e.target.value)} rows={5} placeholder="Paste your proposal text here…"
          className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:border-primary/50 transition-colors resize-none" />
        <p className="text-[10px] text-muted-foreground mt-1">{text.trim().split(/\s+/).filter(Boolean).length} words</p>
      </div>
      <button onClick={analyse} disabled={!text.trim()}
        className="w-full py-2.5 bg-gradient-hero text-white rounded-xl font-semibold text-sm hover:opacity-90 disabled:opacity-40 transition-all shadow-glow-primary flex items-center justify-center gap-2">
        <BarChart2 className="w-4 h-4" /> Analyse Proposal
      </button>
      {result && (
        <div className="space-y-3">
          <div className="flex items-center gap-4 bg-background border border-border rounded-xl p-4">
            <div className="text-center">
              <p className={`text-3xl font-bold ${scoreColor}`}>{result.score}</p>
              <p className={`text-xs font-semibold ${scoreColor}`}>{result.grade}</p>
            </div>
            <div className="flex-1">
              <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${result.score >= 80 ? "bg-accent" : result.score >= 60 ? "bg-yellow-400" : "bg-destructive"}`}
                  style={{ width: `${result.score}%` }} />
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1.5">
                <span>Avg sentence: {result.avgWords}w</span>
                <span>Passive: {result.passiveCount}</span>
                <span>Long sentences: {result.longSentences}</span>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            {result.suggestions.map((s, i) => (
              <div key={i} className="flex items-start gap-2.5 text-xs bg-background border border-border rounded-xl px-3 py-2.5">
                {s.startsWith("Great") ? <CheckCircle className="w-3.5 h-3.5 text-accent flex-shrink-0 mt-0.5" /> : <AlertCircle className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0 mt-0.5" />}
                <span className="text-foreground">{s}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Tool 4: Spam Score Checker ───────────────────────────────────────────────
function SpamChecker() {
  const [subject, setSubject] = useState("");
  const [body,    setBody]    = useState("");
  const [result,  setResult]  = useState<{ score: number; flags: { word: string; reason: string }[]; safe: boolean } | null>(null);

  const SPAM_WORDS: { word: string | RegExp; reason: string }[] = [
    { word: /free\b/i,          reason: '"Free" is a top spam trigger word' },
    { word: /guaranteed/i,      reason: '"Guaranteed" raises spam filters' },
    { word: /click here/i,      reason: '"Click here" is an old-school spam phrase' },
    { word: /limited time/i,    reason: 'Urgency phrases often trigger filters' },
    { word: /act now/i,         reason: 'Action urgency words are flagged' },
    { word: /earn money/i,      reason: 'Income-claim phrases are heavily filtered' },
    { word: /make money/i,      reason: 'Income-claim phrases are heavily filtered' },
    { word: /\$\$\$/,           reason: 'Multiple $ signs trigger spam filters' },
    { word: /100%/i,            reason: 'Percentage guarantees raise flags' },
    { word: /urgent/i,          reason: '"Urgent" is a common spam trigger' },
    { word: /winner/i,          reason: '"Winner" frequently flagged in cold outreach' },
    { word: /congratulations/i, reason: 'Congratulatory openers are heavily filtered' },
    { word: /unsubscribe/i,     reason: 'Missing unsubscribe footer may be needed' },
    { word: /\!\!/,             reason: 'Multiple exclamation marks look spammy' },
    { word: /ALL CAPS/,         reason: 'ALL CAPS triggers spam filters' },
  ];

  const check = () => {
    const combined = `${subject} ${body}`;
    const flags: { word: string; reason: string }[] = [];

    for (const { word, reason } of SPAM_WORDS) {
      const rx = typeof word === "string" ? new RegExp(word, "i") : word;
      if (rx.test(combined)) {
        const match = combined.match(rx)?.[0] ?? String(word);
        if (!flags.find(f => f.reason === reason)) flags.push({ word: match, reason });
      }
    }

    // ALL CAPS check
    const words = combined.split(/\s+/);
    const capsWords = words.filter(w => w.length > 3 && w === w.toUpperCase() && /[A-Z]/.test(w));
    if (capsWords.length > 2) flags.push({ word: capsWords.slice(0, 3).join(", "), reason: "Too many ALL CAPS words" });

    const score = Math.max(0, 100 - flags.length * 15);
    setResult({ score, flags, safe: flags.length === 0 });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Email Subject Line</label>
          <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Your subject line…"
            className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:border-primary/50 transition-colors" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Email Body</label>
          <textarea value={body} onChange={e => setBody(e.target.value)} rows={4} placeholder="Paste your email body…"
            className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:border-primary/50 transition-colors resize-none" />
        </div>
      </div>
      <button onClick={check} disabled={!subject && !body}
        className="w-full py-2.5 bg-gradient-hero text-white rounded-xl font-semibold text-sm hover:opacity-90 disabled:opacity-40 transition-all shadow-glow-primary flex items-center justify-center gap-2">
        <ShieldCheck className="w-4 h-4" /> Check Spam Score
      </button>
      {result && (
        <div className="space-y-3">
          <div className={`flex items-center gap-3 rounded-xl p-4 border ${result.safe ? "bg-accent/10 border-accent/20" : result.score > 50 ? "bg-yellow-500/10 border-yellow-500/20" : "bg-destructive/10 border-destructive/20"}`}>
            {result.safe
              ? <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
              : <XCircle className="w-5 h-5 text-destructive flex-shrink-0" />}
            <div>
              <p className={`font-bold text-sm ${result.safe ? "text-accent" : result.score > 50 ? "text-yellow-400" : "text-destructive"}`}>
                {result.safe ? "Looks clean! ✅" : `${result.flags.length} issue${result.flags.length > 1 ? "s" : ""} found`}
              </p>
              <p className="text-xs text-muted-foreground">Deliverability score: {result.score}/100</p>
            </div>
          </div>
          {result.flags.map((f, i) => (
            <div key={i} className="flex items-start gap-2.5 text-xs bg-background border border-border/50 rounded-xl px-3 py-2.5">
              <AlertCircle className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-foreground">"{f.word}"</span>
                <span className="text-muted-foreground ml-1">— {f.reason}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Tool 5: Client Lifetime Value Calculator ─────────────────────────────────
function CLVCalculator() {
  const [monthly, setMonthly]   = useState("2000");
  const [months,  setMonths]    = useState("6");
  const [referrals, setReferrals] = useState("1");
  const [refValue, setRefValue] = useState("1500");
  const [result, setResult]    = useState<{ clv: number; refBonus: number; total: number; hourly: number; dailyCost: number } | null>(null);
  const [hours,   setHours]    = useState("10");

  const calculate = () => {
    const m  = parseFloat(monthly)   || 0;
    const mo = parseFloat(months)    || 1;
    const r  = parseFloat(referrals) || 0;
    const rv = parseFloat(refValue)  || 0;
    const h  = parseFloat(hours)     || 1;
    const clv      = m * mo;
    const refBonus = r * rv;
    const total    = clv + refBonus;
    const hourly   = Math.round(total / (mo * 4 * h));
    const dailyCost = Math.round(total / (mo * 30));
    setResult({ clv, refBonus, total, hourly, dailyCost });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Monthly Retainer ($)", value: monthly,   set: setMonthly,   ph: "2000" },
          { label: "Avg Contract (months)", value: months,   set: setMonths,    ph: "6" },
          { label: "Hours / Week",          value: hours,    set: setHours,     ph: "10" },
          { label: "Referrals Expected",    value: referrals,set: setReferrals, ph: "1" },
          { label: "Avg Referral Value ($)",value: refValue, set: setRefValue,  ph: "1500" },
        ].map(({ label, value, set, ph }) => (
          <div key={label}>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">{label}</label>
            <input type="number" value={value} onChange={e => set(e.target.value)} placeholder={ph}
              className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:border-primary/50 transition-colors" />
          </div>
        ))}
      </div>
      <button onClick={calculate}
        className="w-full py-2.5 bg-gradient-hero text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-all shadow-glow-primary flex items-center justify-center gap-2">
        <TrendingUp className="w-4 h-4" /> Calculate Client Value
      </button>
      {result && (
        <div className="space-y-2">
          {[
            { label: "Direct Contract Value", value: `$${result.clv.toLocaleString()}`,   color: "text-primary-light bg-primary/10 border-primary/20" },
            { label: "Referral Bonus",         value: `$${result.refBonus.toLocaleString()}`, color: "text-accent bg-accent/10 border-accent/20" },
            { label: "Total Lifetime Value",   value: `$${result.total.toLocaleString()}`, color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" },
            { label: "Your Effective Hourly",  value: `$${result.hourly}/hr`,             color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
          ].map(({ label, value, color }) => (
            <div key={label} className={`flex items-center justify-between rounded-xl px-4 py-3 border ${color}`}>
              <span className="text-xs font-medium opacity-80">{label}</span>
              <span className="font-bold text-sm">{value}</span>
            </div>
          ))}
          <p className="text-[10px] text-muted-foreground text-center pt-1">
            This client is worth ${result.dailyCost}/day to your business. Prioritise them accordingly.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Tool 6: Niche Demand Estimator ──────────────────────────────────────────
const NICHE_DATA: Record<string, { demand: number; competition: string; avgRate: string; trend: string; tip: string }> = {
  "web-development":   { demand: 92, competition: "High",   avgRate: "$75–$150/hr", trend: "↑ Growing", tip: "Specialise in Next.js or Web3 to stand out." },
  "mobile-development":{ demand: 88, competition: "High",   avgRate: "$80–$160/hr", trend: "↑ Growing", tip: "Flutter + iOS dual-skill commands premium rates." },
  "design":            { demand: 75, competition: "High",   avgRate: "$50–$120/hr", trend: "→ Stable",  tip: "Add UX research skills to separate from pure visual designers." },
  "copywriting":       { demand: 80, competition: "Medium", avgRate: "$50–$100/hr", trend: "↑ Growing", tip: "AI-assisted copywriters who audit + edit earn 2–3× more." },
  "seo":               { demand: 78, competition: "Medium", avgRate: "$60–$120/hr", trend: "↑ Growing", tip: "Technical SEO + Core Web Vitals is the fastest path to $100/hr." },
  "social-media":      { demand: 70, competition: "Very High", avgRate: "$30–$80/hr", trend: "→ Stable", tip: "Short-form video (Reels/TikTok) doubles your per-post rate." },
  "data-analysis":     { demand: 95, competition: "Low",    avgRate: "$90–$180/hr", trend: "↑ Booming", tip: "Python + SQL + Tableau is the fastest $100k freelance stack." },
  "marketing":         { demand: 82, competition: "Medium", avgRate: "$55–$110/hr", trend: "↑ Growing", tip: "Demand-gen and paid media specialists are most sought-after." },
  "video-editing":     { demand: 68, competition: "High",   avgRate: "$40–$90/hr",  trend: "↑ Growing", tip: "YouTube/long-form video editing pays 40% more than social clips." },
  "ai-ml":             { demand: 98, competition: "Low",    avgRate: "$120–$250/hr", trend: "🚀 Explosive", tip: "Fine-tuning + RAG pipelines are the #1 AI freelance skill in 2025." },
};

function NicheDemandEstimator() {
  const [niche, setNiche] = useState("");
  const d = niche ? NICHE_DATA[niche] : null;

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">Select Your Niche</label>
        <select value={niche} onChange={e => setNiche(e.target.value)}
          className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:border-primary/50">
          <option value="">Choose a niche…</option>
          {Object.keys(NICHE_DATA).map(n => (
            <option key={n} value={n}>{n.replace(/-/g," ").replace(/\b\w/g,c=>c.toUpperCase())}</option>
          ))}
        </select>
      </div>

      {d && (
        <div className="space-y-3">
          <div className="bg-background border border-border rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-medium">Market Demand</span>
              <span className={`text-xs font-bold ${d.demand >= 90 ? "text-accent" : d.demand >= 75 ? "text-yellow-400" : "text-muted-foreground"}`}>{d.demand}/100</span>
            </div>
            <div className="h-2.5 bg-muted rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${d.demand >= 90 ? "bg-accent" : d.demand >= 75 ? "bg-yellow-400" : "bg-primary"}`}
                style={{ width: `${d.demand}%` }} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-background border border-border rounded-xl p-3 text-center">
              <p className="text-xs text-muted-foreground">Avg Rate</p>
              <p className="text-xs font-bold text-foreground mt-0.5">{d.avgRate}</p>
            </div>
            <div className="bg-background border border-border rounded-xl p-3 text-center">
              <p className="text-xs text-muted-foreground">Competition</p>
              <p className={`text-xs font-bold mt-0.5 ${d.competition === "Low" ? "text-accent" : d.competition === "Very High" ? "text-destructive" : "text-yellow-400"}`}>{d.competition}</p>
            </div>
            <div className="bg-background border border-border rounded-xl p-3 text-center">
              <p className="text-xs text-muted-foreground">Trend</p>
              <p className="text-xs font-bold text-primary-light mt-0.5">{d.trend}</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5 bg-primary/5 border border-primary/20 rounded-xl px-3 py-3">
            <Target className="w-3.5 h-3.5 text-primary-light flex-shrink-0 mt-0.5" />
            <p className="text-xs text-foreground"><strong>Pro tip:</strong> {d.tip}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
const TOOLS = [
  {
    title: "Freelance Rate Calculator",
    icon: Calculator, iconColor: "text-primary-light",
    badge: "Essential",
    description: "Calculate your true hourly rate including expenses, taxes & profit buffer.",
    component: RateCalculator,
  },
  {
    title: "Email Subject Line Generator",
    icon: Mail, iconColor: "text-blue-400",
    badge: "AI",
    description: "Generate 5 high-converting subject lines tailored to your niche.",
    component: SubjectLineGen,
  },
  {
    title: "Proposal Readability Scorer",
    icon: FileText, iconColor: "text-yellow-400",
    badge: "New",
    description: "Score your proposal for clarity, passive voice and sentence length.",
    component: ProposalScorer,
  },
  {
    title: "Spam Score Checker",
    icon: ShieldCheck, iconColor: "text-accent",
    badge: "Essential",
    description: "Scan your emails for spam trigger words before you hit send.",
    component: SpamChecker,
  },
  {
    title: "Client Lifetime Value",
    icon: TrendingUp, iconColor: "text-green-400",
    badge: "New",
    description: "Calculate the full value a client brings including referrals.",
    component: CLVCalculator,
  },
  {
    title: "Niche Demand Estimator",
    icon: Target, iconColor: "text-orange-400",
    badge: "Data",
    description: "See market demand, competition level and average rates for your niche.",
    component: NicheDemandEstimator,
  },
];

export default function ToolsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Zap className="w-5 h-5 text-primary-light" />
          <span className="text-xs font-bold uppercase tracking-wider text-primary-light">Free Tools</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Freelancer Toolkit</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Six essential tools to price smarter, write better, and close faster — all free, all instant.
        </p>
      </div>

      {/* Tools grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {TOOLS.map(({ title, icon, iconColor, badge, description, component: Component }) => (
          <ToolCard key={title} title={title} icon={icon} iconColor={iconColor} badge={badge} description={description}>
            <Component />
          </ToolCard>
        ))}
      </div>

      {/* Pro teaser */}
      <div className="bg-gradient-hero rounded-2xl p-6 flex items-center justify-between gap-6">
        <div>
          <p className="text-white font-bold text-lg">More tools unlocked with Pro</p>
          <p className="text-white/70 text-sm mt-1">
            AI Proposal Writer, Competitor Analyser, Invoice Generator, Contract Builder, and more — coming for Pro users.
          </p>
        </div>
        <a href="/dashboard/upgrade"
          className="flex-shrink-0 px-5 py-2.5 bg-white text-primary font-bold text-sm rounded-xl hover:bg-white/90 transition-all whitespace-nowrap">
          Upgrade to Pro →
        </a>
      </div>
    </div>
  );
}
