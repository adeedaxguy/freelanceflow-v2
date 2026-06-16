"use client";

import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import {
  Settings, Save, CheckCircle, Key, Globe, AlertTriangle, CreditCard,
  Mail, DollarSign, Users, Eye, EyeOff, RefreshCw, Zap
} from "lucide-react";

interface Props {
  initialSettings: Record<string, string>;
}

function Field({
  label, value, onChange, type = "text", placeholder = "", sensitive = false, hint = "",
}: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; sensitive?: boolean; hint?: string;
}) {
  const [show, setShow] = useState(false);
  const inputType = sensitive ? (show ? "text" : "password") : type;
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-foreground">{label}</label>
      <div className="relative">
        <input
          type={inputType}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder || (sensitive ? "Leave blank to keep existing" : "")}
          className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:border-primary/50 pr-10"
        />
        {sensitive && (
          <button type="button" onClick={() => setShow(s => !s)}
            className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground">
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function Section({ title, icon, children, color = "primary" }: {
  title: string; icon: React.ReactNode; children: React.ReactNode; color?: string;
}) {
  const borderColor = color === "gold" ? "border-gold/20" : color === "destructive" ? "border-destructive/20" : "border-border";
  return (
    <div className={`bg-gradient-card border ${borderColor} rounded-2xl p-6 space-y-5`}>
      <h2 className="text-foreground font-semibold flex items-center gap-2 text-base">
        {icon}
        {title}
      </h2>
      {children}
    </div>
  );
}

export default function AdminSettingsClient({ initialSettings }: Props) {
  const [s, setS] = useState<Record<string, string>>({ ...initialSettings });
  const [saving, setSaving] = useState<string | null>(null);
  const [savedSections, setSavedSections] = useState<Set<string>>(new Set());
  const [error, setError] = useState("");

  function set(key: string, value: string) {
    setS(prev => ({ ...prev, [key]: value }));
  }

  function get(key: string): string { return s[key] ?? ""; }

  async function saveSection(sectionKey: string, keys: string[]) {
    setSaving(sectionKey);
    setError("");
    try {
      const updates: Record<string, string> = {};
      for (const k of keys) {
        // Only include if value is non-empty (avoids clearing existing secrets)
        if (s[k] !== undefined && s[k] !== "") updates[k] = s[k] ?? "";
        else if (initialSettings[k] !== undefined) updates[k] = initialSettings[k] ?? ""; // preserve existing
      }
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates }),
      });
      if (!res.ok) throw new Error("Save failed");
      setSavedSections(prev => new Set([...prev, sectionKey]));
      setTimeout(() => setSavedSections(prev => { const n = new Set(prev); n.delete(sectionKey); return n; }), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(null);
    }
  }

  function SaveBtn({ sectionKey }: { sectionKey: string }) {
    const isSaving  = saving === sectionKey;
    const isSaved   = savedSections.has(sectionKey);
    return (
      <button type="submit"
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary-light text-white text-sm font-medium transition-all disabled:opacity-60"
        disabled={isSaving}>
        {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : isSaved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
        {isSaved ? "Saved!" : "Save Changes"}
      </button>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Settings className="w-6 h-6 text-primary-light" />
          Platform Settings
        </h1>
        <p className="text-muted-foreground mt-1">Full control over the iCloseLeads platform. Changes take effect immediately.</p>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">{error}</div>
      )}

      {/* ── Site Info ── */}
      <Section title="Site Configuration" icon={<Globe className="w-4 h-4 text-primary-light" />}>
        <form onSubmit={(e: FormEvent) => { e.preventDefault(); void saveSection("site", ["site_name", "support_email", "maintenance_mode"]); }}
          className="space-y-4">
          <Field label="Site Name" value={get("site_name")} onChange={v => set("site_name", v)} placeholder="iCloseLeads" />
          <Field label="Support Email" value={get("support_email")} onChange={v => set("support_email", v)} type="email" placeholder="support@icloseleads.com" />

          <div className="flex items-center justify-between p-4 bg-gold/5 border border-gold/10 rounded-xl">
            <div>
              <p className="text-foreground font-medium text-sm">Maintenance Mode</p>
              <p className="text-muted-foreground text-xs">Shows a maintenance page to all non-admin users.</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={get("maintenance_mode") === "true"}
              onClick={() => set("maintenance_mode", get("maintenance_mode") === "true" ? "false" : "true")}
              className={`relative w-11 h-6 rounded-full transition-colors ${get("maintenance_mode") === "true" ? "bg-gold" : "bg-muted"}`}
            >
              <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${get("maintenance_mode") === "true" ? "translate-x-5" : "translate-x-0"}`} />
            </button>
          </div>

          <SaveBtn sectionKey="site" />
        </form>
      </Section>

      {/* ── Stripe / Payment Gateway ── */}
      <Section title="Payment Gateway (Stripe)" icon={<CreditCard className="w-4 h-4 text-accent" />} color="primary">
        <div className="px-3 py-2 rounded-lg bg-accent/5 border border-accent/20 text-xs text-muted-foreground mb-2">
          💳 Get your keys at{" "}
          <a href="https://dashboard.stripe.com/apikeys" target="_blank" rel="noreferrer" className="text-primary-light hover:underline">
            dashboard.stripe.com/apikeys
          </a>
          . Use <strong className="text-foreground">test keys</strong> during development, live keys in production.
        </div>
        <form onSubmit={(e: FormEvent) => { e.preventDefault(); void saveSection("stripe", ["stripe_mode", "stripe_public_key", "stripe_secret_key", "stripe_webhook_secret", "pro_price_id", "agency_price_id"]); }}
          className="space-y-4">

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">Mode</label>
            <div className="flex gap-2">
              {["test", "live"].map(m => (
                <button key={m} type="button" onClick={() => set("stripe_mode", m)}
                  className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all capitalize ${get("stripe_mode") === m ? "bg-primary/15 border-primary/50 text-primary-light" : "bg-surface border-border text-muted-foreground"}`}>
                  {m}
                </button>
              ))}
            </div>
          </div>

          <Field label="Publishable Key (pk_...)" value={get("stripe_public_key")} onChange={v => set("stripe_public_key", v)}
            placeholder="pk_test_..." sensitive
            hint="Used on the frontend. Safe to expose." />
          <Field label="Secret Key (sk_...)" value={get("stripe_secret_key")} onChange={v => set("stripe_secret_key", v)}
            placeholder="sk_test_..." sensitive
            hint="⚠ Never expose this publicly. Server-side only." />
          <Field label="Webhook Secret (whsec_...)" value={get("stripe_webhook_secret")} onChange={v => set("stripe_webhook_secret", v)}
            placeholder="whsec_..." sensitive
            hint="From Stripe Dashboard → Webhooks → your endpoint → Signing secret." />

          <div className="grid grid-cols-2 gap-4">
            <Field label="Pro Plan Price ID" value={get("pro_price_id")} onChange={v => set("pro_price_id", v)}
              placeholder="price_..." hint="From Stripe Products." />
            <Field label="Agency Plan Price ID" value={get("agency_price_id")} onChange={v => set("agency_price_id", v)}
              placeholder="price_..." hint="From Stripe Products." />
          </div>

          <SaveBtn sectionKey="stripe" />
        </form>
      </Section>

      {/* ── Pricing Config ── */}
      <Section title="Pricing Display" icon={<DollarSign className="w-4 h-4 text-gold" />} color="gold">
        <form onSubmit={(e: FormEvent) => { e.preventDefault(); void saveSection("pricing", ["pro_price_monthly", "agency_price_monthly"]); }}
          className="space-y-4">
          <p className="text-xs text-muted-foreground">These control the prices displayed on the upgrade page and landing page.</p>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Pro Monthly Price ($)" value={get("pro_price_monthly")} onChange={v => set("pro_price_monthly", v)} type="number" placeholder="29" />
            <Field label="Agency Monthly Price ($)" value={get("agency_price_monthly")} onChange={v => set("agency_price_monthly", v)} type="number" placeholder="79" />
          </div>
          <SaveBtn sectionKey="pricing" />
        </form>
      </Section>

      {/* ── Lead Limits ── */}
      <Section title="Lead Limits Per Plan" icon={<Users className="w-4 h-4 text-blue-400" />}>
        <form onSubmit={(e: FormEvent) => { e.preventDefault(); void saveSection("leads", ["free_leads_per_week", "pro_leads_per_week", "agency_leads_per_week"]); }}
          className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Field label="Free (per week)" value={get("free_leads_per_week")} onChange={v => set("free_leads_per_week", v)} type="number" placeholder="20" />
            <Field label="Pro (per week)" value={get("pro_leads_per_week")} onChange={v => set("pro_leads_per_week", v)} type="number" placeholder="100" />
            <Field label="Agency (per week)" value={get("agency_leads_per_week")} onChange={v => set("agency_leads_per_week", v)} type="number" placeholder="500" />
          </div>
          <SaveBtn sectionKey="leads" />
        </form>
      </Section>

      {/* ── API Keys ── */}
      <Section title="API Keys" icon={<Key className="w-4 h-4 text-accent" />}>
        <form onSubmit={(e: FormEvent) => { e.preventDefault(); void saveSection("apikeys", ["groq_api_key", "resend_api_key", "resend_from_email"]); }}
          className="space-y-4">
          <Field label="Groq API Key" value={get("groq_api_key")} onChange={v => set("groq_api_key", v)}
            sensitive placeholder="gsk_..."
            hint="Free at console.groq.com — powers AI proposal generation." />
          <Field label="Resend API Key" value={get("resend_api_key")} onChange={v => set("resend_api_key", v)}
            sensitive placeholder="re_..."
            hint="Free at resend.com — powers email sending from the platform." />
          <Field label="From Email (Resend)" value={get("resend_from_email")} onChange={v => set("resend_from_email", v)}
            type="email" placeholder="outreach@yourverifieddomain.com"
            hint="Must be a verified domain in Resend. iCloseLeads uses onboarding@resend.dev on free tier." />
          <SaveBtn sectionKey="apikeys" />
        </form>
      </Section>

      {/* ── Email Settings ── */}
      <Section title="Email Configuration" icon={<Mail className="w-4 h-4 text-primary-light" />}>
        <div className="space-y-3 text-sm">
          <p className="text-muted-foreground">
            iCloseLeads uses <a href="https://resend.com" target="_blank" rel="noreferrer" className="text-primary-light hover:underline">Resend</a> for transactional email.
            Add your Resend API key above to enable email sending.
          </p>
          <div className="px-4 py-3 rounded-xl bg-surface border border-border space-y-2">
            <p className="text-foreground font-medium text-xs uppercase tracking-wider">Setup Guide</p>
            <ol className="text-muted-foreground text-xs space-y-1 list-decimal list-inside">
              <li>Sign up at resend.com (free — 3,000 emails/month)</li>
              <li>Add and verify your domain in Resend</li>
              <li>Create an API key and paste it above</li>
              <li>Set the From Email to a verified address on your domain</li>
            </ol>
          </div>
        </div>
      </Section>

      {/* ── Danger Zone ── */}
      <Section title="Danger Zone" icon={<AlertTriangle className="w-4 h-4 text-destructive" />} color="destructive">
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Destructive actions cannot be undone. Proceed with extreme caution.
          </p>
          <div className="flex items-center justify-between p-4 bg-destructive/5 border border-destructive/20 rounded-xl">
            <div>
              <p className="text-foreground font-medium text-sm">Reset All Settings to Defaults</p>
              <p className="text-muted-foreground text-xs">Clears all API keys and settings. Requires re-configuration.</p>
            </div>
            <button type="button"
              onClick={() => { if (confirm("Are you sure? This will clear all API keys and settings.")) { /* implement if needed */ } }}
              className="px-3 py-1.5 rounded-lg border border-destructive/40 text-destructive text-sm font-medium hover:bg-destructive/10 transition-colors">
              Reset
            </button>
          </div>
        </div>
      </Section>

      <div className="flex items-center gap-2 text-xs text-muted-foreground pt-4 border-t border-border">
        <Zap className="w-3.5 h-3.5 text-primary-light" />
        Settings are stored encrypted in the database and take effect immediately without a redeploy.
      </div>
    </div>
  );
}
