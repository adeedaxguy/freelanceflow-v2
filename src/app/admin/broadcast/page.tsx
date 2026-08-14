"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Eye,
  MailCheck,
  RefreshCw,
  Send,
  ShieldCheck,
  Users,
} from "lucide-react";

type Segment = "all" | "free" | "pro" | "agency";
type Status = {
  sender: { configured: boolean; provider: "resend" | "smtp" | null; fromEmail: string };
  counts: Record<Segment, number>;
  maxBatchSize: number;
};

const ACTIVATION_TEMPLATE = {
  label: "Free user activation",
  subject: "Find your first client lead with iCloseLeads",
  body: `Hi {name},

Your iCloseLeads workspace is ready. Start with Local Business Leads: choose a business type and location, review the results, and save the opportunities that fit your service.

A good first search:
• Pick one service you sell
• Search one city
• Open the business profile before outreach
• Save only leads you can genuinely help

Start your search:
https://icloseleads.com/dashboard/local-leads

Best,
The iCloseLeads team`,
};

const TEMPLATES = [
  ACTIVATION_TEMPLATE,
  {
    label: "Product update",
    subject: "A useful iCloseLeads update for your next search",
    body: `Hi {name},

We have improved the iCloseLeads workflow so it is easier to move from a lead to a practical next step.

What is new:
• Clearer local business searches
• Better owner and decision-maker research paths
• Faster proposal preparation

Open your workspace and try one focused search today.

Best,
The iCloseLeads team`,
  },
];

const SEGMENTS: Array<{ key: Segment; label: string; description: string }> = [
  { key: "all", label: "All opted-in users", description: "Every active user who accepted product emails" },
  { key: "free", label: "Free", description: "Opted-in users on the free plan" },
  { key: "pro", label: "Pro", description: "Opted-in users on the Pro plan" },
  { key: "agency", label: "Agency", description: "Opted-in users on the Agency plan" },
];

export default function AdminBroadcastPage() {
  const [segment, setSegment] = useState<Segment>("free");
  const [subject, setSubject] = useState(ACTIVATION_TEMPLATE.subject);
  const [message, setMessage] = useState(ACTIVATION_TEMPLATE.body);
  const [status, setStatus] = useState<Status | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ delivered: number; failed: number; skipped: number } | null>(null);

  const audienceCount = status?.counts[segment] ?? 0;
  const previewMessage = useMemo(() => message.replaceAll("{name}", "Alex"), [message]);

  useEffect(() => {
    let active = true;
    fetch("/api/admin/broadcast", { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json() as Status & { error?: string };
        if (!response.ok) throw new Error(data.error || "Could not load campaign status.");
        if (active) setStatus(data);
      })
      .catch((requestError: unknown) => {
        if (active) setError(requestError instanceof Error ? requestError.message : "Could not load campaign status.");
      })
      .finally(() => {
        if (active) setLoadingStatus(false);
      });
    return () => { active = false; };
  }, []);

  function markChanged() {
    setPreviewId(null);
    setConfirmed(false);
    setResult(null);
  }

  function applyTemplate(template: typeof ACTIVATION_TEMPLATE) {
    setSubject(template.subject);
    setMessage(template.body);
    markChanged();
  }

  function preview() {
    if (subject.trim().length < 3 || message.trim().length < 20) {
      setError("Add a complete subject and message before previewing.");
      return;
    }
    setError("");
    setConfirmed(false);
    setPreviewId(crypto.randomUUID());
  }

  async function sendCampaign() {
    if (!previewId || !confirmed) return;
    setSending(true);
    setError("");
    setResult(null);
    try {
      const response = await fetch("/api/admin/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId: previewId,
          subject,
          message,
          segment,
          confirm: "SEND_CONSENTED_CAMPAIGN",
        }),
      });
      const data = await response.json() as {
        delivered?: number;
        failed?: number;
        skipped?: number;
        error?: string;
      };
      if (!response.ok) throw new Error(data.error || "Campaign delivery failed.");
      setResult({ delivered: data.delivered ?? 0, failed: data.failed ?? 0, skipped: data.skipped ?? 0 });
      setConfirmed(false);
      setPreviewId(null);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Campaign delivery failed.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6 lg:p-8">
      <header className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary-light">Admin communication</p>
          <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">Email campaigns</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Review the exact email, confirm the consented audience, then send through the configured iCloseLeads mailbox.
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
          <span className={`h-2.5 w-2.5 rounded-full ${status?.sender.configured ? "bg-emerald-500" : "bg-amber-400"}`} />
          <div>
            <p className="text-xs font-medium text-foreground">
              {loadingStatus ? "Checking sender" : status?.sender.configured ? "Sender ready" : "Sender not configured"}
            </p>
            <p className="text-xs text-muted-foreground">{status?.sender.fromEmail || "hello@icloseleads.com"}</p>
          </div>
        </div>
      </header>

      {!loadingStatus && !status?.sender.configured && (
        <div className="flex gap-3 rounded-lg border border-amber-500/35 bg-amber-500/10 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
          <div>
            <p className="text-sm font-semibold text-foreground">Preview is available; delivery is locked</p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Verify hello@icloseleads.com in Resend and connect its API key. No campaign can be presented as sent until the sender is verified.
            </p>
          </div>
        </div>
      )}

      {result && (
        <div className="flex gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
          <p className="text-sm text-foreground">
            Campaign complete: <strong>{result.delivered} delivered</strong>, {result.failed} failed, {result.skipped} held outside this batch.
          </p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.8fr)]">
        <section className="space-y-5 rounded-xl border border-border bg-card p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 font-semibold text-foreground">
                <MailCheck className="h-4 w-4 text-primary-light" /> Compose
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">Use {"{name}"} for first-name personalization.</p>
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              {TEMPLATES.map((template) => (
                <button
                  key={template.label}
                  type="button"
                  onClick={() => applyTemplate(template)}
                  className="rounded-md border border-border bg-background px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
                >
                  {template.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="campaign-subject" className="mb-2 block text-sm font-medium text-foreground">Subject</label>
            <input
              id="campaign-subject"
              value={subject}
              onChange={(event) => { setSubject(event.target.value); markChanged(); }}
              className="h-12 w-full rounded-lg border border-border bg-background px-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </div>

          <div>
            <label htmlFor="campaign-message" className="mb-2 block text-sm font-medium text-foreground">Message</label>
            <textarea
              id="campaign-message"
              value={message}
              onChange={(event) => { setMessage(event.target.value); markChanged(); }}
              rows={14}
              className="w-full resize-y rounded-lg border border-border bg-background px-4 py-3 font-mono text-sm leading-6 text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">Consented audience</label>
              <span className="text-sm font-semibold tabular-nums text-foreground">{audienceCount} recipients</span>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {SEGMENTS.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => { setSegment(option.key); markChanged(); }}
                  className={`rounded-lg border p-3 text-left transition-colors ${
                    segment === option.key
                      ? "border-primary bg-primary/10"
                      : "border-border bg-background hover:border-primary/40"
                  }`}
                >
                  <span className="flex items-center justify-between gap-3 text-sm font-medium text-foreground">
                    {option.label}
                    <span className="tabular-nums text-muted-foreground">{status?.counts[option.key] ?? 0}</span>
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-muted-foreground">{option.description}</span>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div role="alert" className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
            </div>
          )}

          <button
            type="button"
            onClick={preview}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-light"
          >
            <Eye className="h-4 w-4" /> Preview email
          </button>
        </section>

        <aside className="self-start rounded-xl border border-border bg-card p-5 sm:p-6 lg:sticky lg:top-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 font-semibold text-foreground">
              <Eye className="h-4 w-4 text-primary-light" /> Recipient preview
            </h2>
            {previewId && <span className="rounded-full bg-emerald-500/12 px-2.5 py-1 text-xs font-semibold text-emerald-500">Reviewed</span>}
          </div>

          <div className="overflow-hidden rounded-lg border border-border bg-white text-[#171522] shadow-sm">
            <div className="border-b border-[#ece9f2] px-6 py-5 text-lg font-bold">
              iClose<span className="text-[#6842e8]">Leads</span>
            </div>
            <div className="px-6 py-6">
              <p className="mb-5 text-xs font-semibold uppercase tracking-wider text-[#716c80]">Subject</p>
              <p className="mb-6 font-semibold leading-6">{subject || "Your subject will appear here"}</p>
              <div className="whitespace-pre-line text-sm leading-6 text-[#29263a]">{previewMessage || "Your message will appear here."}</div>
              <span className="mt-6 inline-flex rounded-md bg-[#6842e8] px-4 py-2.5 text-sm font-semibold text-white">Open iCloseLeads</span>
            </div>
            <div className="border-t border-[#ece9f2] bg-[#f8f7fb] px-6 py-4 text-xs leading-5 text-[#716c80]">
              Includes an unsubscribe link and email-preference notice for every recipient.
            </div>
          </div>

          <div className="mt-5 rounded-lg border border-border bg-background p-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <ShieldCheck className="h-4 w-4 text-emerald-500" /> Delivery safeguards
            </p>
            <ul className="mt-3 space-y-2 text-xs leading-5 text-muted-foreground">
              <li>Only active users with marketing consent are included.</li>
              <li>Each reviewed send has duplicate-delivery protection.</li>
              <li>The current batch is capped at {status?.maxBatchSize ?? 200} recipients.</li>
            </ul>
          </div>

          {previewId && (
            <div className="mt-5 space-y-4 border-t border-border pt-5">
              <label className="flex cursor-pointer items-start gap-3 text-sm leading-6 text-muted-foreground">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(event) => setConfirmed(event.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-border accent-primary"
                />
                I reviewed this email and confirm delivery to {audienceCount} opted-in {segment === "all" ? "users" : `${segment} users`}.
              </label>
              <button
                type="button"
                onClick={() => void sendCampaign()}
                disabled={!confirmed || sending || !status?.sender.configured || audienceCount === 0}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-light disabled:cursor-not-allowed disabled:opacity-45"
              >
                {sending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {sending ? "Delivering" : `Send to ${audienceCount} opted-in users`}
              </button>
            </div>
          )}

          {!previewId && (
            <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
              <Users className="h-4 w-4" /> Preview again after every edit before delivery is enabled.
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
