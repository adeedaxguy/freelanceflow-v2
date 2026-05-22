"use client";

import { useState } from "react";
import { Calculator, Mail, AlertTriangle, DollarSign, Clock, Zap, CheckCircle, XCircle, Loader2 } from "lucide-react";

// ─── Rate Calculator ──────────────────────────────────────────────────────────
function RateCalculator() {
  const [income,   setIncome]   = useState("60000");
  const [hours,    setHours]    = useState("40");
  const [expenses, setExpenses] = useState("5000");
  const [vacation, setVacation] = useState("2");
  const [result,   setResult]   = useState<{ hourly: number; daily: number; monthly: number } | null>(null);

  const calculate = () => {
    const annual   = parseFloat(income)   || 0;
    const wkHours  = parseFloat(hours)    || 40;
    const exp      = parseFloat(expenses) || 0;
    const vacWks   = parseFloat(vacation) || 2;
    const billable = (52 - vacWks) * wkHours * 0.75;
    const total    = annual + exp;
    const hourly   = Math.ceil(total / billable);
    setResult({ hourly, daily: hourly * 8, monthly: Math.ceil(total / 12) });
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: "Desired Annual Income", value: income, set: setIncome, prefix: "$", placeholder: "60000" },
          { label: "Hours per Week",        value: hours,    set: setHours,    prefix: "h", placeholder: "40" },
          { label: "Annual Expenses",       value: expenses, set: setExpenses, prefix: "$", placeholder: "5000" },
          { label: "Vacation Weeks/Year",   value: vacation, set: setVacation, prefix: "w", placeholder: "2" },
        ].map(({ label, value, set, prefix, placeholder }) => (
          <div key={label}>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{label}</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{prefix}</span>
              <input type="number" value={value} onChange={e => set(e.target.value)} placeholder={placeholder}
                className="w-full pl-7 pr-3 py-2.5 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:border-primary/50 transition-colors" />
            </div>
          </div>
        ))}
      </div>

      <button onClick={calculate} className="w-full py-3 bg-gradient-hero text-white rounded-xl font-semibold text-sm transition-all hover:opacity-90 shadow-glow-primary">
        Calculate My Rate
      </button>

      {result && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Hourly Rate", value: `$${result.hourly}`,   icon: Clock,        color: "text-primary-light bg-primary/10 border-primary/20" },
            { label: "Day Rate",    value: `$${result.daily}`,    icon: DollarSign,   color: "text-accent bg-accent/10 border-accent/20" },
            { label: "Monthly",     value: `$${result.monthly}`,  icon: Calculator,   color: "text-gold bg-gold/10 border-gold/20" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className={`rounded-xl p-4 border text-center ${color}`}>
              <Icon className="w-4 h-4 mx-auto mb-2 opacity-70" />
              <p className="text-xl font-bold">{value}</p>
              <p className="text-xs mt-0.5 opacity-70">{label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Subject Line Generator ───────────────────────────────────────────────────
function SubjectLineGen() {
  const [niche,   setNiche]   = useState("");
  const [company, setCompany] = useState("");
  const [lines,   setLines]   = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied,  setCopied]  = useState<number | null>(null);

  const generate = async () => {
    if (!niche.trim()) return;
    setLoading(true);
    // Generate locally — no API call needed
    await new Promise(r => setTimeout(r, 600));
    const co = company.trim() || "your company";
    const n  = niche.toLowerCase();
    setLines([
      `Quick question about ${co}'s ${n} — 2 min?`,
      `I helped [similar company] 3x their ${n} results`,
      `Found a gap in ${co}'s ${n} — here's how I'd fix it`,
      `${co} + ${n} freelancer → worth a chat?`,
      `Idea for ${co}: ${n} upgrade that pays for itself`,
      `${n.charAt(0).toUpperCase() + n.slice(1)} audit for ${co} — no strings`,
    ]);
    setLoading(false);
  };

  const copy = (text: string, i: number) => {
    void navigator.clipboard.writeText(text);
    setCopied(i);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Your Niche</label>
          <input value={niche} onChange={e => setNiche(e.target.value)} placeholder="e.g. web design"
            className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:border-primary/50 transition-colors" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Target Company (optional)</label>
          <input value={company} onChange={e => setCompany(e.target.value)} placeholder="e.g. Acme Inc"
            className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:border-primary/50 transition-colors" />
        </div>
      </div>
      <button onClick={generate} disabled={loading || !niche.trim()}
        className="w-full py-3 bg-gradient-hero text-white rounded-xl font-semibold text-sm transition-all hover:opacity-90 shadow-glow-primary disabled:opacity-40 flex items-center justify-center gap-2">
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</> : <><Zap className="w-4 h-4" /> Generate 6 Subject Lines</>}
      </button>
      {lines.length > 0 && (
        <div className="space-y-2">
          {lines.map((line, i) => (
            <div key={i} className="flex items-center gap-3 bg-surface border border-border rounded-xl px-4 py-3 group hover:border-primary/30 transition-colors">
              <span className="text-sm text-foreground flex-1">{line}</span>
              <button onClick={() => copy(line, i)}
                className="text-xs px-2 py-1 rounded-lg bg-primary/10 text-primary-light opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary/20">
                {copied === i ? "Copied!" : "Copy"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Red Flag Checker ─────────────────────────────────────────────────────────
const RED_FLAGS = [
  { pattern: /spec\s*work|unpaid\s*trial|test\s*project\s*first/i,   label: "Requests spec/unpaid work",     severity: "high" },
  { pattern: /per\s*word|per\s*article|per\s*post/i,                 label: "Content mill pricing",           severity: "high" },
  { pattern: /we('ll| will) promote you|exposure|portfolio/i,         label: "Offers exposure instead of pay", severity: "high" },
  { pattern: /urgent|asap|yesterday|immediately/i,                    label: "Unrealistic urgency",            severity: "medium" },
  { pattern: /revisions? until (perfect|happy|satisfied)/i,           label: "Unlimited revisions",            severity: "high" },
  { pattern: /low budget|tight budget|can't afford/i,                 label: "Budget concerns upfront",        severity: "medium" },
  { pattern: /\$[1-9]\d?\b|\$[1-9]\d?\/hr/,                          label: "Very low budget mentioned",      severity: "high" },
  { pattern: /no\s*contract|handshake\s*deal|trust\s*me/i,            label: "Avoids contracts",               severity: "high" },
  { pattern: /own all rights|work for hire|full IP/i,                 label: "Claims all IP ownership",        severity: "medium" },
  { pattern: /passive income|residual|recurring.*\$\d/i,              label: "Misleading income promises",     severity: "low" },
];

function RedFlagChecker() {
  const [text,   setText]   = useState("");
  const [result, setResult] = useState<{ label: string; severity: string }[] | null>(null);

  const check = () => {
    if (!text.trim()) return;
    const found = RED_FLAGS.filter(f => f.pattern.test(text));
    setResult(found);
  };

  const severityStyle = (s: string) =>
    s === "high"   ? "text-red-400 bg-red-500/10 border-red-500/20" :
    s === "medium" ? "text-orange-400 bg-orange-500/10 border-orange-500/20" :
                     "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Paste Job Post or Message</label>
        <textarea value={text} onChange={e => setText(e.target.value)} rows={6}
          placeholder="Paste the job listing or client message here…"
          className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:border-primary/50 transition-colors resize-none" />
      </div>
      <button onClick={check} disabled={!text.trim()}
        className="w-full py-3 bg-gradient-hero text-white rounded-xl font-semibold text-sm transition-all hover:opacity-90 shadow-glow-primary disabled:opacity-40 flex items-center justify-center gap-2">
        <AlertTriangle className="w-4 h-4" /> Scan for Red Flags
      </button>
      {result !== null && (
        <div className="space-y-2">
          {result.length === 0 ? (
            <div className="flex items-center gap-3 px-4 py-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              No red flags detected — looks like a legitimate opportunity!
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <XCircle className="w-4 h-4 text-red-400" />
                Found {result.length} red flag{result.length > 1 ? "s" : ""}
              </div>
              {result.map((r, i) => (
                <div key={i} className={`flex items-center justify-between px-4 py-3 rounded-xl border text-sm ${severityStyle(r.severity)}`}>
                  <span>{r.label}</span>
                  <span className="text-xs uppercase font-bold opacity-70">{r.severity}</span>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const TOOLS = [
  { id: "rate",     icon: Calculator,    label: "Rate Calculator",    desc: "Figure out exactly what to charge", component: RateCalculator },
  { id: "subject",  icon: Mail,          label: "Subject Line Gen",   desc: "6 high-converting subject lines",   component: SubjectLineGen },
  { id: "redflag",  icon: AlertTriangle, label: "Red Flag Checker",   desc: "Scan job posts for warning signs",  component: RedFlagChecker },
];

export default function ToolsPage() {
  const [active, setActive] = useState("rate");
  const ActiveTool = TOOLS.find(t => t.id === active)?.component ?? RateCalculator;

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-1">Free Tools</h1>
        <p className="text-muted-foreground">Handy tools to help you win more clients and protect yourself.</p>
      </div>

      {/* Tool tabs */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {TOOLS.map(({ id, icon: Icon, label, desc }) => (
          <button key={id} onClick={() => setActive(id)}
            className={`text-left p-4 rounded-2xl border transition-all ${
              active === id
                ? "bg-primary/10 border-primary/30 shadow-glow-primary/20"
                : "bg-gradient-card border-border hover:border-primary/20"
            }`}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${active === id ? "bg-primary/20 text-primary-light" : "bg-surface text-muted-foreground"}`}>
              <Icon className="w-4 h-4" />
            </div>
            <p className={`text-sm font-semibold mb-0.5 ${active === id ? "text-primary-light" : "text-foreground"}`}>{label}</p>
            <p className="text-xs text-muted-foreground">{desc}</p>
          </button>
        ))}
      </div>

      {/* Active tool */}
      <div className="bg-gradient-card border border-border rounded-2xl p-6">
        <ActiveTool />
      </div>
    </div>
  );
}
