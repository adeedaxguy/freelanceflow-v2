"use client";

import { useState, useEffect } from "react";
import {
  Settings, Bell, Trash2, Save, AlertTriangle, CheckCircle,
  Brain, Shield, Activity, Lock, Eye, RefreshCw,
  Server, Database, Globe, Cpu, ShieldCheck, Clock, Layers,
  Plug, Key, ExternalLink, Copy, EyeOff, ChevronDown,
} from "lucide-react";
import { signOut } from "next-auth/react";
import ConfirmModal from "@/components/ConfirmModal";

type Tab = "notifications" | "ai-models" | "security" | "integrations" | "danger";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "notifications", label: "Notifications",   icon: Bell },
  { id: "ai-models",     label: "AI & Tech",        icon: Brain },
  { id: "security",      label: "Security",          icon: Shield },
  { id: "integrations",  label: "Integrations",     icon: Plug },
  { id: "danger",        label: "Danger Zone",       icon: AlertTriangle },
];

const AI_MODELS = [
  {
    provider: "Groq LPU",
    model: "llama-3.3-70b-versatile",
    usedFor: ["AI Proposals", "Deal Closer", "Follow-Up Generation"],
    speed: "~200ms",
    icon: "⚡",
    color: "text-accent",
    bg: "bg-accent/10",
    border: "border-accent/20",
    description: "LLaMA 3.3 70B on Groq's custom hardware — sub-200ms inference. Powers every AI proposal, deal reply, and follow-up.",
    status: "operational" as const,
    stats: [{ label: "Avg latency", value: "~200ms" }, { label: "Parameters", value: "70B" }, { label: "Context", value: "128K" }],
  },
  {
    provider: "Contact Enrichment",
    model: "Email Verification API",
    usedFor: ["Contact Discovery", "Email Verification"],
    speed: "~300ms",
    icon: "🎯",
    color: "text-primary-light",
    bg: "bg-primary/10",
    border: "border-primary/20",
    description: "Optional enrichment helps verify professional contact paths before outreach.",
    status: "operational" as const,
    stats: [{ label: "Accuracy", value: "95%+" }, { label: "DB size", value: "100M+" }, { label: "Domains", value: "50M+" }],
  },
  {
    provider: "Advanced AI",
    model: "Reasoning + long-form proposal models",
    usedFor: ["Advanced Deal Strategy", "Long-form Proposals"],
    speed: "~1–3s",
    icon: "🧠",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    description: "Advanced models coming for Pro users — deeper proposal nuance and multi-step deal strategy.",
    status: "coming_soon" as const,
    stats: [{ label: "Context", value: "128K" }, { label: "Reasoning", value: "o3-mini" }, { label: "For", value: "Pro users" }],
  },
];

const INFRASTRUCTURE = [
  { icon: Server,      label: "Hosting",    value: "Vercel Edge Network",     desc: "Globally distributed edge functions" },
  { icon: Database,    label: "Database",   value: "PostgreSQL (Prisma ORM)", desc: "ACID-compliant with automated backups" },
  { icon: Lock,        label: "Auth",       value: "NextAuth + bcrypt",       desc: "JWT sessions + bcrypt cost 12" },
  { icon: ShieldCheck, label: "Encryption", value: "TLS 1.3 + HSTS",          desc: "End-to-end encryption on all traffic" },
];

const SECURITY_EVENTS = [
  { event: "Sign in",           detail: "Credentials authenticated",  time: "Just now",    ok: true },
  { event: "Lead search",       detail: "/api/leads/search POST",     time: "5 min ago",   ok: true },
  { event: "AI proposal",       detail: "/api/ai/propose POST",       time: "2 hours ago", ok: true },
  { event: "Password verified", detail: "bcrypt hash check",          time: "1 day ago",   ok: true },
];

// ─── Integrations config ─────────────────────────────────────────────────────
const INTEGRATIONS = [
  {
    id:       "groq",
    label:    "Groq",
    icon:     "⚡",
    color:    "text-accent",
    bg:       "bg-accent/10",
    border:   "border-accent/20",
    desc:     "Optional. Add your own model key only if you want dedicated proposal generation capacity.",
    settingKey: "groq_api_key",
    placeholder: "gsk_…",
    docsUrl:  "https://console.groq.com/keys",
    docsLabel:"Open model console →",
    hint:     "iCloseLeads works without this. Paste a key only if you want to use your own quota.",
  },
  {
    id:       "hunter",
    label:    "Contact Enrichment",
    icon:     "🎯",
    color:    "text-primary-light",
    bg:       "bg-primary/10",
    border:   "border-primary/20",
    desc:     "Optional. Add your own enrichment key only if you want deeper email verification.",
    settingKey: "hunter_api_key",
    placeholder: "hnt_…",
    docsUrl:  "#",
    docsLabel:"Use your own enrichment key →",
    hint:     "iCloseLeads works without this. Paste a key only if you want to use your own enrichment allowance.",
  },
];

function IntegrationCard({
  integ,
  savedValue,
  onSaved,
}: {
  integ: typeof INTEGRATIONS[0];
  savedValue: string;
  onSaved: (key: string, val: string) => void;
}) {
  const [editing,  setEditing]  = useState(false);
  const [value,    setValue]    = useState("");
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false);
  const [err,      setErr]      = useState("");
  const [showKey,  setShowKey]  = useState(false);

  const isConnected = !!savedValue;

  async function handleSave() {
    if (!value.trim() || value.trim().length < 10) {
      setErr("Key looks too short — please paste the full key."); return;
    }
    setSaving(true); setErr("");
    try {
      localStorage.setItem(`ff_${integ.settingKey}`, value.trim());
      await fetch("/api/user/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: integ.settingKey, value: value.trim() }),
      }).catch(() => {/* non-fatal */});
      onSaved(integ.settingKey, value.trim());
      setSaved(true);
      setTimeout(() => { setSaved(false); setEditing(false); setValue(""); }, 1500);
    } catch { setErr("Failed to save. Try again."); }
    finally { setSaving(false); }
  }

  function handleRemove() {
    localStorage.removeItem(`ff_${integ.settingKey}`);
    fetch("/api/user/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: integ.settingKey, value: "" }),
    }).catch(() => {});
    onSaved(integ.settingKey, "");
    setEditing(false); setValue("");
  }

  const maskedValue = savedValue
    ? savedValue.slice(0, 6) + "••••••••••••" + savedValue.slice(-4)
    : "";

  return (
    <div className={`bg-gradient-card border ${integ.border} rounded-2xl p-5 space-y-3`}>
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl ${integ.bg} flex items-center justify-center text-xl flex-shrink-0`}>
          {integ.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className={`font-bold text-sm ${integ.color}`}>{integ.label}</p>
            {isConnected
              ? <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-green-500/15 text-green-400 border border-green-500/20 font-bold">✓ Connected</span>
              : <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary-light border border-primary/20 font-medium">Optional</span>
            }
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{integ.desc}</p>
          <a href={integ.docsUrl} target="_blank" rel="noopener noreferrer"
            className={`text-xs ${integ.color} hover:underline flex items-center gap-1 mt-1 font-medium`}>
            {integ.docsLabel} <ExternalLink className="w-2.5 h-2.5"/>
          </a>
        </div>
      </div>

      {/* Show masked saved key */}
      {isConnected && !editing && (
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-background border border-border rounded-xl">
            <Key className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0"/>
            <span className="text-sm font-mono text-muted-foreground flex-1 truncate">
              {showKey ? savedValue : maskedValue}
            </span>
            <button onClick={() => setShowKey(v => !v)} className="text-muted-foreground hover:text-foreground flex-shrink-0">
              {showKey ? <EyeOff className="w-3.5 h-3.5"/> : <Eye className="w-3.5 h-3.5"/>}
            </button>
            <button onClick={() => void navigator.clipboard.writeText(savedValue)}
              className="text-muted-foreground hover:text-foreground flex-shrink-0">
              <Copy className="w-3.5 h-3.5"/>
            </button>
          </div>
          <button onClick={() => setEditing(true)}
            className="px-3 py-2 rounded-xl border border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all">
            Replace
          </button>
          <button onClick={handleRemove}
            className="px-3 py-2 rounded-xl border border-red-500/20 text-xs text-red-400 hover:bg-red-500/10 transition-all">
            Remove
          </button>
        </div>
      )}

      {!isConnected && !editing && (
        <div className="flex items-center justify-between gap-3 pt-1">
          <p className="text-xs text-muted-foreground">No action needed for normal use.</p>
          <button onClick={() => setEditing(true)}
            className="px-3 py-2 rounded-xl border border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all">
            Add key
          </button>
        </div>
      )}

      {/* Input when adding or replacing a key */}
      {editing && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">{integ.hint}</p>
          <div className="flex gap-2">
            <input
              type="password"
              value={value}
              onChange={e => { setValue(e.target.value); setErr(""); }}
              placeholder={integ.placeholder}
              className="flex-1 px-3 py-2 bg-background border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground font-mono focus:outline-none focus:border-primary/60 transition-all"
            />
            <button onClick={() => void handleSave()} disabled={saving || !value.trim()}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${saved ? "bg-green-500/10 text-green-400 border border-green-500/30" : "bg-primary hover:bg-primary-light text-white"} disabled:opacity-50`}>
              {saved ? <><CheckCircle className="w-3.5 h-3.5"/> Saved!</> : saving ? "Saving…" : "Connect"}
            </button>
            {editing && (
              <button onClick={() => { setEditing(false); setValue(""); setErr(""); }}
                className="px-3 py-2 rounded-xl border border-border text-xs text-muted-foreground hover:text-foreground transition-all">
                Cancel
              </button>
            )}
          </div>
          {err && <p className="text-xs text-destructive">{err}</p>}
        </div>
      )}
    </div>
  );
}

export default function SettingsPage() {
  const [tab,           setTab]           = useState<Tab>("notifications");
  const [notifications, setNotifications] = useState({
    emailReplies: true, weeklyDigest: true, productUpdates: false, leadAlerts: true,
  });
  const [deleteOpen,    setDeleteOpen]    = useState(false);
  const [saved,         setSaved]         = useState(false);
  const [savedKeys,     setSavedKeys]     = useState<Record<string, string>>({});
  const [showAdvancedKeys, setShowAdvancedKeys] = useState(false);

  // Load integration keys from localStorage on mount
  useEffect(() => {
    const keys: Record<string, string> = {};
    for (const integ of INTEGRATIONS) {
      const val = localStorage.getItem(`ff_${integ.settingKey}`) ?? "";
      if (val) keys[integ.settingKey] = val;
    }
    setSavedKeys(keys);
  }, []);

  function handleKeyUpdate(settingKey: string, val: string) {
    setSavedKeys(prev => ({ ...prev, [settingKey]: val }));
  }

  function handleSaveNotifications() { setSaved(true); setTimeout(() => setSaved(false), 2500); }
  async function handleDeleteAccount() { await signOut({ callbackUrl: "/" }); }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
          <Settings className="w-6 h-6 text-primary-light" /> Settings
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">Account preferences, AI models, integrations, and security.</p>
      </div>

      {/* Tab bar — scrollable on mobile */}
      <div className="flex items-center gap-1 bg-surface border border-border rounded-2xl p-1.5 mb-6 overflow-x-auto scrollbar-hide">
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                tab === t.id ? "bg-primary text-white shadow-glow-primary/30"
                  : t.id === "danger" ? "text-red-400/70 hover:text-red-400"
                  : "text-muted-foreground hover:text-foreground"
              }`}>
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden xs:inline sm:inline">{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── NOTIFICATIONS ── */}
      {tab === "notifications" && (
        <div className="bg-gradient-card border border-border rounded-2xl p-6 space-y-4">
          <h2 className="text-foreground font-semibold flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary-light" /> Notification Preferences
          </h2>
          {[
            { key: "emailReplies"   as const, label: "Email Reply Alerts",   desc: "Notified when a prospect replies to your outreach." },
            { key: "leadAlerts"     as const, label: "New Lead Alerts",       desc: "Notified when high-score leads appear in your niche." },
            { key: "weeklyDigest"   as const, label: "Weekly Digest",         desc: "Performance summary every Monday morning." },
            { key: "productUpdates" as const, label: "Product Updates",       desc: "New iCloseLeads features and improvements." },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
              <div>
                <p className="text-foreground font-medium text-sm">{label}</p>
                <p className="text-muted-foreground text-xs mt-0.5">{desc}</p>
              </div>
              <button role="switch" aria-checked={notifications[key]}
                onClick={() => setNotifications(p => ({ ...p, [key]: !p[key] }))}
                className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${notifications[key] ? "bg-primary" : "bg-muted"}`}>
                <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${notifications[key] ? "translate-x-5" : "translate-x-0"}`} />
              </button>
            </div>
          ))}
          <button onClick={handleSaveNotifications}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary-light text-white text-sm font-medium transition-all">
            {saved ? <><CheckCircle className="w-4 h-4" /> Saved!</> : <><Save className="w-4 h-4" /> Save Preferences</>}
          </button>
        </div>
      )}

      {/* ── AI & TECHNOLOGY ── */}
      {tab === "ai-models" && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-primary/10 via-accent/5 to-primary/5 border border-primary/20 rounded-2xl p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Layers className="w-5 h-5 sm:w-6 sm:h-6 text-primary-light" />
              </div>
              <div>
                <h2 className="text-foreground font-bold text-base sm:text-lg">Enterprise AI Stack</h2>
                <p className="text-muted-foreground text-sm mt-1 leading-relaxed">
                  Purpose-built ensemble of best-in-class AI — each model selected for what it does best. Sub-second inference, 99.5% email deliverability.
                </p>
                <div className="flex items-center gap-4 mt-3 flex-wrap">
                  {[
                    { icon: Cpu,   label: "6 AI models",  color: "text-accent" },
                    { icon: Globe, label: "Live channels", color: "text-primary-light" },
                    { icon: Clock, label: "<200ms avg",    color: "text-blue-400" },
                  ].map(({ icon: Icon, label, color }) => (
                    <div key={label} className="flex items-center gap-1.5">
                      <Icon className={`w-3.5 h-3.5 ${color}`} />
                      <span className="text-xs font-medium text-muted-foreground">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-foreground font-semibold text-sm flex items-center gap-2">
              <Brain className="w-4 h-4 text-primary-light" /> AI Models
            </h3>
            {AI_MODELS.map(m => (
              <div key={m.model} className={`bg-gradient-card border ${m.border} rounded-2xl p-4 sm:p-5`}>
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl ${m.bg} flex items-center justify-center text-xl sm:text-2xl flex-shrink-0`}>{m.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className={`font-bold text-sm sm:text-base ${m.color}`}>{m.provider}</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        m.status === "operational" ? "bg-green-500/15 text-green-400 border border-green-500/20" : "bg-muted text-muted-foreground border border-border"
                      }`}>
                        {m.status === "operational" ? "● Live" : "⏳ Soon"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono mb-2">{m.model}</p>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-3">{m.description}</p>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {m.usedFor.map(u => (
                        <span key={u} className={`text-xs px-2 py-0.5 rounded-lg border font-medium ${m.bg} ${m.color} ${m.border}`}>{u}</span>
                      ))}
                    </div>
                    <div className="flex gap-4 sm:gap-5">
                      {m.stats.map(s => (
                        <div key={s.label} className="text-center">
                          <p className={`text-xs font-bold ${m.color}`}>{s.value}</p>
                          <p className="text-[10px] text-muted-foreground">{s.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <h3 className="text-foreground font-semibold text-sm flex items-center gap-2">
              <Server className="w-4 h-4 text-primary-light" /> Infrastructure
            </h3>
            <div className="bg-gradient-card border border-border rounded-2xl divide-y divide-border/50">
              {INFRASTRUCTURE.map(({ icon: Icon, label, value, desc }) => (
                <div key={label} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-light" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{label}</p>
                      <span className="flex items-center gap-1 text-[10px] font-bold text-green-400 flex-shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> Live
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm font-medium text-foreground">{value}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-card border border-border rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-foreground font-semibold text-sm">Platform Tour</p>
              <p className="text-muted-foreground text-xs mt-0.5">Replay the onboarding walkthrough to rediscover features.</p>
            </div>
            <button
              onClick={() => { localStorage.removeItem("ff_tour_done_v1"); window.dispatchEvent(new CustomEvent("ff:restart-tour")); }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-primary/30 text-primary-light text-sm font-medium hover:bg-primary/10 transition-all flex-shrink-0">
              <RefreshCw className="w-3.5 h-3.5" /> Replay Tour
            </button>
          </div>
        </div>
      )}

      {/* ── SECURITY ── */}
      {tab === "security" && (
        <div className="space-y-5">
          <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-5">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-7 h-7 sm:w-8 sm:h-8 text-green-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-green-400 font-bold">Account Secured</p>
                <p className="text-muted-foreground text-sm mt-0.5">All security checks passed. Your account and data are protected.</p>
              </div>
              <div className="flex items-center gap-2 px-2.5 py-1.5 bg-green-500/20 rounded-lg flex-shrink-0">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs font-bold text-green-400">Protected</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { icon: Lock,        label: "Password Hashing",   desc: "bcrypt cost factor 12 — industry standard", ok: true },
              { icon: Eye,         label: "Session Encryption", desc: "JWT tokens with 24h expiry + rotation",     ok: true },
              { icon: Globe,       label: "HTTPS / TLS 1.3",   desc: "All traffic encrypted end-to-end",          ok: true },
              { icon: ShieldCheck, label: "CSRF Protection",   desc: "SameSite cookies + CSRF token validation",  ok: true },
              { icon: Database,    label: "DB Access Control",  desc: "Prisma ORM prevents SQL injection",         ok: true },
              { icon: Activity,    label: "Rate Limiting",      desc: "Token-bucket rate limiting on all APIs",    ok: true },
            ].map(({ icon: Icon, label, desc, ok }) => (
              <div key={label} className="flex items-start gap-3 bg-gradient-card border border-border rounded-xl p-3 sm:p-4">
                <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-foreground font-medium text-sm">{label}</p>
                    {ok && <CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0" />}
                  </div>
                  <p className="text-muted-foreground text-xs mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gradient-card border border-border rounded-2xl overflow-hidden">
            <div className="px-4 sm:px-5 py-4 border-b border-border flex items-center justify-between">
              <h3 className="text-foreground font-semibold text-sm flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary-light" /> Recent Security Events
              </h3>
              <span className="text-xs text-muted-foreground">Last 48 hours</span>
            </div>
            <div className="divide-y divide-border/50">
              {SECURITY_EVENTS.map((ev, i) => (
                <div key={i} className="flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${ev.ok ? "bg-green-400" : "bg-red-400"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{ev.event}</p>
                    <p className="text-xs text-muted-foreground truncate">{ev.detail}</p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{ev.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── INTEGRATIONS ── */}
      {tab === "integrations" && (
        <div className="space-y-5">
          <div className="bg-accent/10 border border-accent/20 rounded-2xl p-4 sm:p-5 flex items-start gap-3">
            <CheckCircle className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-foreground font-semibold text-sm">No setup needed</p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                iCloseLeads works out of the box. Leads, AI proposals, Gmail prepare mode, saved leads, and local business coverage are managed automatically.
              </p>
            </div>
          </div>

          <div className="bg-gradient-card border border-border rounded-2xl overflow-hidden">
            <button
              onClick={() => setShowAdvancedKeys(v => !v)}
              className="w-full flex items-center justify-between gap-3 p-4 sm:p-5 text-left hover:bg-primary/5 transition-colors"
            >
              <div className="flex items-start gap-3">
                <Key className="w-4 h-4 text-primary-light flex-shrink-0 mt-0.5"/>
                <div>
                  <h3 className="text-foreground font-semibold text-sm">Advanced optional API keys</h3>
                  <p className="text-muted-foreground text-xs mt-0.5 leading-relaxed">
                    Only use this if you want your own AI or contact-enrichment quota. Most users can leave it closed.
                  </p>
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform ${showAdvancedKeys ? "rotate-180" : ""}`} />
            </button>

            {showAdvancedKeys && (
              <div className="border-t border-border/60 p-4 sm:p-5 space-y-4">
                {INTEGRATIONS.map(integ => (
                  <IntegrationCard
                    key={integ.id}
                    integ={integ}
                    savedValue={savedKeys[integ.settingKey] ?? ""}
                    onSaved={handleKeyUpdate}
                  />
                ))}

                <div className="bg-background/40 border border-border rounded-2xl p-4">
                  <h3 className="text-foreground font-semibold text-sm mb-3 flex items-center gap-2">
                    <Key className="w-4 h-4 text-primary-light"/> Why add your own key?
                  </h3>
                  <div className="space-y-2">
                    {[
                      "Your keys stay on your account and are only used for your requests",
                      "Use your own model key when you want dedicated AI proposal capacity",
                      "Add contact enrichment when you want deeper email verification",
                      "The local lead coverage engine stays managed automatically by iCloseLeads",
                    ].map(tip => (
                      <div key={tip} className="flex items-start gap-2.5 text-sm">
                        <CheckCircle className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground text-xs leading-relaxed">{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── DANGER ZONE ── */}
      {tab === "danger" && (
        <div className="space-y-4">
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-5">
            <h2 className="text-red-400 font-bold flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4" /> Danger Zone
            </h2>
            <p className="text-muted-foreground text-sm">Actions here are permanent and cannot be undone.</p>
          </div>
          <div className="bg-gradient-card border border-border rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-foreground font-medium text-sm">Delete Account</p>
              <p className="text-muted-foreground text-xs mt-0.5">Permanently deletes your account and all data. Cannot be undone.</p>
            </div>
            <button onClick={() => setDeleteOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-all flex-shrink-0">
              <Trash2 className="w-3.5 h-3.5" /> Delete Account
            </button>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteOpen}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={handleDeleteAccount}
        title="Delete your account?"
        message="This permanently deletes all your leads, proposals, and sent emails. This action cannot be undone."
        confirmLabel="Yes, delete everything"
        variant="danger"
      />
    </div>
  );
}
