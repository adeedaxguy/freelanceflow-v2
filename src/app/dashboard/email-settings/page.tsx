"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Mail, Settings, CheckCircle, XCircle, Loader2, Eye, EyeOff,
  Trash2, Send, AlertTriangle, Info, ChevronDown, ChevronUp,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface SmtpFormData {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  fromEmail: string;
  fromName: string;
}

interface ProviderPreset {
  label: string;
  logo: string;
  host: string;
  port: number;
  secure: boolean;
  note: string;
  helpUrl: string;
}

// ─── Common provider presets ──────────────────────────────────────────────────
const PRESETS: ProviderPreset[] = [
  {
    label: "Gmail",
    logo: "G",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    note: "Use an App Password — not your Google account password. Required when 2FA is enabled.",
    helpUrl: "https://support.google.com/accounts/answer/185833",
  },
  {
    label: "Outlook / Microsoft 365",
    logo: "O",
    host: "smtp.office365.com",
    port: 587,
    secure: false,
    note: "Use your full Microsoft 365 email and account password.",
    helpUrl: "https://support.microsoft.com/en-us/office/pop-imap-and-smtp-settings-8361e398-8af4-4e97-b147-6c6c4ac95353",
  },
  {
    label: "Yahoo Mail",
    logo: "Y",
    host: "smtp.mail.yahoo.com",
    port: 587,
    secure: false,
    note: "Generate an App Password in Yahoo Account Security settings.",
    helpUrl: "https://help.yahoo.com/kb/generate-third-party-passwords-sln15241.html",
  },
  {
    label: "Fastmail",
    logo: "F",
    host: "smtp.fastmail.com",
    port: 465,
    secure: true,
    note: "Use an App Password from Fastmail Settings → Privacy & Security.",
    helpUrl: "https://www.fastmail.help/hc/en-us/articles/1500000278342",
  },
  {
    label: "Custom SMTP",
    logo: "✦",
    host: "",
    port: 587,
    secure: false,
    note: "Use any SMTP server — e.g. your hosting provider's mail server.",
    helpUrl: "",
  },
];

// ─── Field component ──────────────────────────────────────────────────────────
function Field({
  label, hint, children,
}: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-foreground">{label}</label>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      {children}
    </div>
  );
}

const inputCls =
  "w-full px-3 py-2.5 bg-background border border-border rounded-xl text-foreground text-sm placeholder-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/25 transition-all";

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function EmailSettingsPage() {
  const [connected, setConnected]   = useState(false);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [testing, setTesting]       = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [showPass, setShowPass]     = useState(false);
  const [status, setStatus]         = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const [showAdvanced, setShowAdvanced]     = useState(false);
  const [existingUser, setExistingUser]     = useState(""); // for masking

  const [form, setForm] = useState<SmtpFormData>({
    host: "",
    port: 587,
    secure: false,
    user: "",
    pass: "",
    fromEmail: "",
    fromName: "",
  });

  // ── Load existing config ──────────────────────────────────────────────────
  const loadConfig = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/email/settings");
      const data = await res.json() as {
        connected: boolean; host?: string; port?: number; secure?: boolean;
        user?: string; fromEmail?: string; fromName?: string;
      };
      if (data.connected) {
        setConnected(true);
        setExistingUser(data.user ?? "");
        setForm(prev => ({
          ...prev,
          host:      data.host      ?? prev.host,
          port:      data.port      ?? prev.port,
          secure:    data.secure    ?? prev.secure,
          user:      data.user      ?? prev.user,
          fromEmail: data.fromEmail ?? prev.fromEmail,
          fromName:  data.fromName  ?? prev.fromName,
        }));
      }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void loadConfig(); }, [loadConfig]);

  // ── Preset selection ──────────────────────────────────────────────────────
  const applyPreset = (idx: number) => {
    const p = PRESETS[idx]!;
    setSelectedPreset(idx);
    setForm(prev => ({
      ...prev,
      host:   p.host,
      port:   p.port,
      secure: p.secure,
    }));
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  const update = (key: keyof SmtpFormData, value: string | number | boolean) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const clearStatus = () => setStatus(null);

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    clearStatus();
    if (!form.host || !form.user || !form.fromEmail) {
      setStatus({ type: "error", msg: "Host, username, and From Email are required." });
      return;
    }
    // If pass is empty and already connected, don't overwrite it
    const payload = { ...form };
    if (!payload.pass && connected) {
      setStatus({ type: "error", msg: "Enter your password (or App Password) to update the connection." });
      return;
    }
    setSaving(true);
    try {
      const res  = await fetch("/api/email/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json() as { success?: boolean; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      setConnected(true);
      setExistingUser(form.user);
      setForm(prev => ({ ...prev, pass: "" }));
      setStatus({ type: "success", msg: "Email connection saved successfully." });
    } catch (e) {
      setStatus({ type: "error", msg: e instanceof Error ? e.message : "Save failed" });
    } finally { setSaving(false); }
  };

  // ── Test connection ───────────────────────────────────────────────────────
  const handleTest = async () => {
    clearStatus();
    if (!form.host || !form.user) {
      setStatus({ type: "error", msg: "Fill in your SMTP credentials first." });
      return;
    }
    const payload = { ...form };
    if (!payload.pass && connected) {
      setStatus({ type: "error", msg: "Enter your password to test the connection." });
      return;
    }
    setTesting(true);
    try {
      const res  = await fetch("/api/email/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json() as { success?: boolean; message?: string; error?: string };
      if (!res.ok || !data.success) throw new Error(data.error ?? "Test failed");
      setStatus({ type: "success", msg: data.message ?? "Test email sent — check your inbox!" });
    } catch (e) {
      setStatus({ type: "error", msg: e instanceof Error ? e.message : "Test failed" });
    } finally { setTesting(false); }
  };

  // ── Disconnect ────────────────────────────────────────────────────────────
  const handleDisconnect = async () => {
    if (!confirm("Disconnect your email? Emails will fall back to the platform sender.")) return;
    setDisconnecting(true);
    try {
      await fetch("/api/email/settings", { method: "DELETE" });
      setConnected(false);
      setExistingUser("");
      setForm({ host: "", port: 587, secure: false, user: "", pass: "", fromEmail: "", fromName: "" });
      setSelectedPreset(null);
      setStatus({ type: "success", msg: "Email disconnected." });
    } catch { setStatus({ type: "error", msg: "Failed to disconnect." }); }
    finally { setDisconnecting(false); }
  };

  // ─────────────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="p-6 lg:p-8 max-w-2xl space-y-4">
        {[1, 2, 3].map(i => <div key={i} className="h-20 rounded-2xl shimmer-line" />)}
      </div>
    );
  }

  const activePreset = selectedPreset !== null ? PRESETS[selectedPreset] : null;

  return (
    <div className="p-6 lg:p-8 max-w-2xl space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Mail className="w-6 h-6 text-accent" /> Email Connection
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Connect your own email to send proposals and follow-ups from your address, not a generic platform address.
        </p>
      </div>

      {/* Status banner */}
      {connected && (
        <div className="flex items-center justify-between gap-3 bg-green-500/10 border border-green-500/20 rounded-2xl px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-4 h-4 text-green-400" />
            </div>
            <div>
              <p className="text-foreground font-semibold text-sm">SMTP Connected</p>
              <p className="text-muted-foreground text-xs">
                Sending as <span className="text-foreground">{form.fromEmail || existingUser}</span> via {form.host}
              </p>
            </div>
          </div>
          <button
            onClick={() => void handleDisconnect()}
            disabled={disconnecting}
            className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-400/40 px-3 py-1.5 rounded-lg transition-all"
          >
            {disconnecting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
            Disconnect
          </button>
        </div>
      )}

      {/* Feedback message */}
      {status && (
        <div className={`flex items-start gap-3 rounded-xl px-4 py-3 text-sm border ${
          status.type === "success"
            ? "bg-green-500/10 border-green-500/20 text-green-400"
            : "bg-destructive/10 border-destructive/20 text-destructive"
        }`}>
          {status.type === "success"
            ? <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            : <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />}
          {status.msg}
        </div>
      )}

      {/* Provider selection */}
      <div className="bg-gradient-card border border-border rounded-2xl p-5 space-y-4">
        <h2 className="text-foreground font-semibold text-sm flex items-center gap-2">
          <Settings className="w-4 h-4 text-primary-light" />
          Choose your email provider
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {PRESETS.map((p, i) => (
            <button
              key={p.label}
              onClick={() => applyPreset(i)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                selectedPreset === i
                  ? "border-primary/60 bg-primary/10 text-primary-light"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-primary/30 bg-surface/50"
              }`}
            >
              <span className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center text-xs font-bold flex-shrink-0">
                {p.logo}
              </span>
              {p.label}
            </button>
          ))}
        </div>

        {/* Provider note */}
        {activePreset?.note && (
          <div className="flex items-start gap-2.5 bg-accent/5 border border-accent/15 rounded-xl px-4 py-3 text-xs text-muted-foreground">
            <Info className="w-3.5 h-3.5 text-accent flex-shrink-0 mt-0.5" />
            <span>
              {activePreset.note}
              {activePreset.helpUrl && (
                <a href={activePreset.helpUrl} target="_blank" rel="noopener noreferrer"
                  className="ml-1.5 text-accent hover:underline">
                  Learn how →
                </a>
              )}
            </span>
          </div>
        )}
      </div>

      {/* SMTP Form */}
      <div className="bg-gradient-card border border-border rounded-2xl p-5 space-y-4">
        <h2 className="text-foreground font-semibold text-sm">SMTP Credentials</h2>

        <div className="grid grid-cols-2 gap-3">
          <Field label="SMTP Host">
            <input
              value={form.host}
              onChange={e => update("host", e.target.value)}
              placeholder="smtp.gmail.com"
              className={inputCls}
            />
          </Field>
          <Field label="Port">
            <select
              value={form.port}
              onChange={e => update("port", parseInt(e.target.value))}
              className={inputCls}
            >
              <option value={587}>587 (STARTTLS)</option>
              <option value={465}>465 (TLS)</option>
              <option value={25}>25 (Plain)</option>
            </select>
          </Field>
        </div>

        <Field label="Username / Email" hint="Usually your full email address">
          <input
            value={form.user}
            onChange={e => update("user", e.target.value)}
            placeholder="you@gmail.com"
            autoComplete="username"
            className={inputCls}
          />
        </Field>

        <Field
          label={connected ? "Password / App Password (leave blank to keep current)" : "Password / App Password"}
          hint={connected ? `Currently connected as ${existingUser}` : ""}
        >
          <div className="relative">
            <input
              type={showPass ? "text" : "password"}
              value={form.pass}
              onChange={e => update("pass", e.target.value)}
              placeholder={connected ? "••••••••  (unchanged)" : "Your password or App Password"}
              autoComplete="current-password"
              className={`${inputCls} pr-10`}
            />
            <button
              type="button"
              onClick={() => setShowPass(p => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </Field>

        {/* Advanced / From fields */}
        <button
          onClick={() => setShowAdvanced(p => !p)}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          Sender identity (From name & address)
        </button>

        {showAdvanced && (
          <div className="space-y-3 pt-1">
            <Field label="From Name" hint="Displayed as the sender name in email clients">
              <input
                value={form.fromName}
                onChange={e => update("fromName", e.target.value)}
                placeholder="Your Name or Company"
                className={inputCls}
              />
            </Field>
            <Field label="From Email" hint="Must be authorised on your SMTP server">
              <input
                type="email"
                value={form.fromEmail}
                onChange={e => update("fromEmail", e.target.value)}
                placeholder="you@gmail.com"
                className={inputCls}
              />
            </Field>
            <div className="flex items-center gap-3 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <div
                  role="switch"
                  aria-checked={form.secure}
                  onClick={() => update("secure", !form.secure)}
                  className={`relative w-9 h-5 rounded-full transition-colors cursor-pointer ${form.secure ? "bg-primary" : "bg-muted"}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.secure ? "translate-x-4" : "translate-x-0"}`} />
                </div>
                <span className="text-sm text-muted-foreground">Implicit TLS (port 465)</span>
              </label>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2.5 pt-1">
          <button
            onClick={() => void handleSave()}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-hero text-white font-semibold text-sm shadow-glow-primary hover:opacity-90 disabled:opacity-50 transition-all"
          >
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : <><CheckCircle className="w-4 h-4" /> Save Connection</>}
          </button>
          <button
            onClick={() => void handleTest()}
            disabled={testing}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-accent/30 text-accent hover:bg-accent/10 font-semibold text-sm disabled:opacity-50 transition-all"
          >
            {testing ? <><Loader2 className="w-4 h-4 animate-spin" /> Testing…</> : <><Send className="w-4 h-4" /> Send Test</>}
          </button>
        </div>
      </div>

      {/* Gmail OAuth card — informational for now */}
      <div className="bg-gradient-card border border-border rounded-2xl p-5 space-y-3 opacity-70">
        <div className="flex items-center justify-between">
          <h2 className="text-foreground font-semibold text-sm flex items-center gap-2">
            <span className="w-5 h-5 rounded bg-white/10 flex items-center justify-center text-xs font-bold">G</span>
            Connect with Google OAuth
          </h2>
          <span className="text-xs bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-2.5 py-1 rounded-full font-medium">
            Coming soon
          </span>
        </div>
        <p className="text-muted-foreground text-xs leading-relaxed">
          A one-click Gmail OAuth connection (no App Password needed) is on the roadmap.
          For now, use Gmail SMTP with an App Password — it works the same way.
        </p>
        <a
          href="https://support.google.com/accounts/answer/185833"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-accent hover:underline"
        >
          Set up Gmail App Password →
        </a>
      </div>

      {/* How it works */}
      <div className="bg-gradient-card border border-border rounded-2xl p-5 space-y-3">
        <h2 className="text-foreground font-semibold text-sm flex items-center gap-2">
          <Info className="w-4 h-4 text-muted-foreground" /> How it works
        </h2>
        <ul className="space-y-2 text-xs text-muted-foreground">
          {[
            "Your SMTP password is stored encrypted in the database — never exposed in the UI.",
            "When you send a proposal or follow-up, FreelanceFlow uses your SMTP server to deliver it.",
            "If SMTP is unavailable, emails fall back to the platform's Resend account.",
            "Your recipients see your name and email address — not a generic FreelanceFlow address.",
          ].map((t, i) => (
            <li key={i} className="flex items-start gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-accent flex-shrink-0 mt-0.5" />
              {t}
            </li>
          ))}
        </ul>
      </div>

      {/* Security notice */}
      <div className="flex items-start gap-3 bg-yellow-500/5 border border-yellow-500/15 rounded-xl px-4 py-3 text-xs text-muted-foreground">
        <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
        <span>
          For Gmail and Outlook, always use an <strong className="text-foreground">App Password</strong> rather than
          your main account password. App Passwords can be revoked at any time without changing your account password.
        </span>
      </div>
    </div>
  );
}
