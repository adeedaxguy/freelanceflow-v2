"use client";

import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import {
  Settings, Save, CheckCircle, Key, Globe, AlertTriangle, CreditCard,
  Mail, DollarSign, Users, Eye, EyeOff, RefreshCw, Zap
} from "lucide-react";

interface Props {
  initialSettings: Record<string, string>;
  stripeEnvironment: {
    secretKey: boolean;
    webhookSecret: boolean;
    mode: "test" | "live";
  };
  lemonEnvironment: {
    apiKey: boolean;
    webhookSecret: boolean;
  };
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

export default function AdminSettingsClient({ initialSettings, stripeEnvironment, lemonEnvironment }: Props) {
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

      <Section title="Active Payment Gateway (Stripe)" icon={<CreditCard className="w-4 h-4 text-accent" />} color="primary">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2.5 text-sm">
            <span className="text-muted-foreground">Secret key</span>
            <span className={stripeEnvironment.secretKey ? "text-accent" : "text-gold"}>{stripeEnvironment.secretKey ? "Configured" : "Missing"}</span>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2.5 text-sm">
            <span className="text-muted-foreground">Webhook</span>
            <span className={stripeEnvironment.webhookSecret ? "text-accent" : "text-gold"}>{stripeEnvironment.webhookSecret ? "Configured" : "Missing"}</span>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2.5 text-sm">
            <span className="text-muted-foreground">Mode</span>
            <span className={stripeEnvironment.mode === "live" ? "text-accent" : "text-gold"}>{stripeEnvironment.mode === "live" ? "Live" : "Test"}</span>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-surface px-3 py-3 text-xs text-muted-foreground">
          Plan subscriptions, softphone numbers, and calling minute packages use Stripe. Webhook: <span className="font-mono text-foreground">https://icloseleads.com/api/webhooks/stripe</span>
        </div>
      </Section>

      <Section title="Legacy Payment Gateway (Lemon Squeezy)" icon={<CreditCard className="w-4 h-4 text-muted-foreground" />}>
        <div className="rounded-lg border border-accent/20 bg-accent/5 px-3 py-3 text-xs text-muted-foreground">
          Preserved for historical subscriptions and rollback only. New plan and softphone checkouts use Stripe.
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2.5 text-sm">
            <span className="text-muted-foreground">API key</span>
            <span className={lemonEnvironment.apiKey ? "text-accent" : "text-gold"}>{lemonEnvironment.apiKey ? "Configured" : "Missing in Vercel"}</span>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2.5 text-sm">
            <span className="text-muted-foreground">Webhook secret</span>
            <span className={lemonEnvironment.webhookSecret ? "text-accent" : "text-gold"}>{lemonEnvironment.webhookSecret ? "Configured" : "Missing in Vercel"}</span>
          </div>
        </div>
        <form onSubmit={(e: FormEvent) => { e.preventDefault(); void saveSection("lemonsqueezy", [
          "lemonsqueezy_test_mode",
          "lemonsqueezy_store_id",
          "lemonsqueezy_pro_monthly_variant_id",
          "lemonsqueezy_pro_annual_variant_id",
          "lemonsqueezy_agency_monthly_variant_id",
          "lemonsqueezy_agency_annual_variant_id",
          "lemonsqueezy_softphone_monthly_variant_id",
        ]); }}
          className="space-y-4">

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">Checkout mode</label>
            <div className="flex gap-2">
              {[{ label: "Test", value: "true" }, { label: "Live", value: "false" }].map(mode => (
                <button key={mode.value} type="button" onClick={() => set("lemonsqueezy_test_mode", mode.value)}
                  className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${get("lemonsqueezy_test_mode") === mode.value ? "bg-primary/15 border-primary/50 text-primary-light" : "bg-surface border-border text-muted-foreground"}`}>
                  {mode.label}
                </button>
              ))}
            </div>
          </div>
          <Field label="Store ID" value={get("lemonsqueezy_store_id")} onChange={v => set("lemonsqueezy_store_id", v)}
            placeholder="12345" hint="The numeric store ID from Lemon Squeezy." />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Pro monthly variant" value={get("lemonsqueezy_pro_monthly_variant_id")} onChange={v => set("lemonsqueezy_pro_monthly_variant_id", v)} placeholder="123456" />
            <Field label="Pro annual variant" value={get("lemonsqueezy_pro_annual_variant_id")} onChange={v => set("lemonsqueezy_pro_annual_variant_id", v)} placeholder="123457" />
            <Field label="Agency monthly variant" value={get("lemonsqueezy_agency_monthly_variant_id")} onChange={v => set("lemonsqueezy_agency_monthly_variant_id", v)} placeholder="123458" />
            <Field label="Agency annual variant" value={get("lemonsqueezy_agency_annual_variant_id")} onChange={v => set("lemonsqueezy_agency_annual_variant_id", v)} placeholder="123459" />
            <Field label="Softphone number monthly variant" value={get("lemonsqueezy_softphone_monthly_variant_id")} onChange={v => set("lemonsqueezy_softphone_monthly_variant_id", v)} placeholder="123460" hint="A dedicated recurring variant. Each checkout supplies the selected number's final monthly price." />
          </div>
          <div className="rounded-lg border border-border bg-surface px-3 py-3 text-xs text-muted-foreground">
            Webhook URL: <span className="font-mono text-foreground">https://icloseleads.com/api/webhooks/lemonsqueezy</span>
          </div>
          <SaveBtn sectionKey="lemonsqueezy" />
        </form>
      </Section>

      <Section title="Payment event logging" icon={<CreditCard className="w-4 h-4 text-muted-foreground" />}>
        <p className="text-sm text-muted-foreground">
          Stripe checkout failures, expired sessions, failed invoices, and subscription changes are recorded in the admin audit log.
        </p>
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
        <form onSubmit={(e: FormEvent) => { e.preventDefault(); void saveSection("apikeys", ["groq_api_key", "resend_api_key", "resend_from_email", "yelp_api_key", "here_api_key", "hunter_api_key", "opencorporates_api_key", "companies_house_key"]); }}
          className="space-y-4">
          <Field label="Groq API Key" value={get("groq_api_key")} onChange={v => set("groq_api_key", v)}
            sensitive placeholder="gsk_..."
            hint="Free at console.groq.com — powers AI proposal generation & pitch enhancement." />
          <Field label="Resend API Key" value={get("resend_api_key")} onChange={v => set("resend_api_key", v)}
            sensitive placeholder="re_..."
            hint="Free at resend.com — powers email sending from the platform." />
          <Field label="From Email (Resend)" value={get("resend_from_email")} onChange={v => set("resend_from_email", v)}
            type="email" placeholder="outreach@yourverifieddomain.com"
            hint="Must be a verified domain in Resend. iCloseLeads uses onboarding@resend.dev on free tier." />
          <div className="pt-2 border-t border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Local Business Leads (optional — boosts data quality)</p>
            <div className="space-y-4">
              <Field label="Yelp Fusion API Key" value={get("yelp_api_key")} onChange={v => set("yelp_api_key", v)}
                sensitive placeholder="Your Yelp Fusion API key"
                hint="Free 500 calls/day at yelp.com/developers — adds ratings, reviews & phone numbers to local leads." />
              <Field label="HERE Discover API Key" value={get("here_api_key")} onChange={v => set("here_api_key", v)}
                sensitive placeholder="Your HERE API key"
                hint="Free 250,000 calls/month at developer.here.com — adds international business data to local leads." />
            </div>
          </div>
          <div className="pt-2 border-t border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Decision Maker Finder (Agency)</p>
            <div className="space-y-4">
              <Field label="Hunter API Key" value={get("hunter_api_key")} onChange={v => set("hunter_api_key", v)}
                sensitive placeholder="hunter_..."
                hint="Optional domain-contact enrichment for named emails, roles, and confidence scores." />
              <Field label="OpenCorporates API Key" value={get("opencorporates_api_key")} onChange={v => set("opencorporates_api_key", v)}
                sensitive placeholder="OpenCorporates API token"
                hint="Optional US/UK registry-network checks. Without this, the finder still uses no-key public sources and verification links." />
              <Field label="Companies House API Key" value={get("companies_house_key")} onChange={v => set("companies_house_key", v)}
                sensitive placeholder="Companies House API key"
                hint="Recommended for UK decision-maker lookups: directors and persons with significant control." />
            </div>
          </div>
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
        Non-sensitive settings are stored server-side. Payment secrets are read only from protected environment variables.
      </div>
    </div>
  );
}
