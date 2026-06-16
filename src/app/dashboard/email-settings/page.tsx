"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckCircle,
  Copy,
  ExternalLink,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

interface OutreachUsage {
  plan: string;
  label: string;
  daily: number;
  monthly: number;
  perMinute: number;
  usedToday: number;
  usedThisMonth: number;
  remainingToday: number;
  remainingThisMonth: number;
}

function UsageBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
      <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function EmailSettingsPage() {
  const [usage, setUsage] = useState<OutreachUsage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch("/api/email/usage", { cache: "no-store" })
      .then(r => (r.ok ? r.json() : null))
      .then((data: { usage?: OutreachUsage } | null) => {
        if (active) setUsage(data?.usage ?? null);
      })
      .catch(() => {
        if (active) setUsage(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, []);

  const planLabel = usage?.label ?? "Safe";
  const usedToday = usage?.usedToday ?? 0;
  const daily = usage?.daily ?? 0;
  const usedThisMonth = usage?.usedThisMonth ?? 0;
  const monthly = usage?.monthly ?? 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Mail className="w-6 h-6 text-accent" /> Email Setup
        </h1>
        <p className="text-muted-foreground mt-1 text-sm max-w-2xl">
          No connection is required. iCloseLeads prepares the email, opens Gmail compose,
          and you review and send it manually from your own Gmail account.
        </p>
      </div>

      <div className="bg-gradient-card border border-accent/20 rounded-2xl p-5 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h2 className="text-foreground font-semibold">Safe Gmail prepare mode is active</h2>
            <p className="text-muted-foreground text-sm mt-1 leading-relaxed">
              The app does not need provider approvals, passwords, or technical setup for normal outreach.
              You stay in control and press Send inside Gmail.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            "No password setup required",
            "No approval setup required",
            "Manual review before sending",
          ].map(item => (
            <div key={item} className="rounded-xl border border-border bg-background/60 px-3 py-2.5 text-xs text-muted-foreground flex items-center gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-accent flex-shrink-0" />
              {item}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-gradient-card border border-border rounded-2xl p-5 space-y-4">
          <h2 className="text-foreground font-semibold text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary-light" />
            How outreach works now
          </h2>
          <div className="space-y-3">
            {[
              "Open any lead and click AI Proposal.",
              "Review or edit the generated subject and proposal.",
              "Use Prepare in Gmail when an email address is available.",
              "Gmail opens with the message filled in; you send it there.",
            ].map((step, i) => (
              <div key={step} className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary-light border border-primary/20 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {i + 1}
                </span>
                <p className="text-sm text-muted-foreground leading-relaxed">{step}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-card border border-border rounded-2xl p-5 space-y-4">
          <h2 className="text-foreground font-semibold text-sm flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-accent" />
            {planLabel} outreach safety limit
          </h2>

          {loading ? (
            <div className="space-y-3">
              <div className="h-4 w-40 rounded bg-muted animate-pulse" />
              <div className="h-2 rounded bg-muted animate-pulse" />
              <div className="h-4 w-56 rounded bg-muted/70 animate-pulse" />
            </div>
          ) : usage ? (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                  <span>Today</span>
                  <span>{usedToday}/{daily}</span>
                </div>
                <UsageBar value={usedToday} max={daily} />
              </div>
              <div>
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                  <span>This month</span>
                  <span>{usedThisMonth}/{monthly}</span>
                </div>
                <UsageBar value={usedThisMonth} max={monthly} />
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Prepare up to {monthly.toLocaleString()} Gmail drafts/month,
                capped at {daily.toLocaleString()}/day and {usage.perMinute}/minute.
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Usage is temporarily unavailable. Proposal preparation will still check the limit before opening Gmail.
            </p>
          )}
        </div>
      </div>

      <div className="bg-gradient-card border border-border rounded-2xl p-5 space-y-4">
        <h2 className="text-foreground font-semibold text-sm flex items-center gap-2">
          <Copy className="w-4 h-4 text-primary-light" />
          Fallbacks built in
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            "If a lead has no email, copy the proposal and apply on the source website.",
            "If Gmail does not open, copy the subject and body from the proposal page.",
            "Saved outreach is logged as prepared so your limits remain accurate.",
            "Templates and profile links still personalise each proposal.",
          ].map(item => (
            <div key={item} className="rounded-xl border border-border bg-background/60 px-3 py-2.5 text-xs text-muted-foreground flex items-start gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-accent flex-shrink-0 mt-0.5" />
              {item}
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/dashboard/leads"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-hero text-white text-sm font-semibold shadow-glow-primary hover:opacity-90 transition-all"
        >
          Find Remote Leads <ExternalLink className="w-3.5 h-3.5" />
        </Link>
        <Link
          href="/dashboard/local-leads"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 text-sm font-semibold transition-all"
        >
          Find Local Leads <ExternalLink className="w-3.5 h-3.5" />
        </Link>
        <Link
          href="/dashboard/templates"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 text-sm font-semibold transition-all"
        >
          Edit Templates <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
