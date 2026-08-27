"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Mail, RefreshCw, Send, ShieldCheck } from "lucide-react";

type NoticeStatus = {
  sender: { configured: boolean; fromEmail: string };
  batchSize: number;
  eligible: number;
  delivered: number;
  failed: number;
  remaining: number;
};

type SendResult = {
  attempted: number;
  delivered: number;
  skipped: number;
  failed: number;
  remaining: number;
};

export default function AccountNoticesPage() {
  const [status, setStatus] = useState<NoticeStatus | null>(null);
  const [result, setResult] = useState<SendResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [batchSize, setBatchSize] = useState(20);
  const [error, setError] = useState("");

  const loadStatus = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/free-allowance-notice", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load notice status.");
      setStatus(data);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not load notice status.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadStatus(); }, [loadStatus]);

  async function sendNextBatch() {
    if (!status || sending || status.remaining === 0) return;
    setSending(true);
    setError("");
    setResult(null);
    try {
      const response = await fetch("/api/admin/free-allowance-notice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          confirm: "SEND_FREE_ALLOWANCE_UPDATE",
          batchSize: Math.min(batchSize, status.batchSize, status.remaining),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "The notice batch could not be sent.");
      setResult(data);
      await loadStatus();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "The notice batch could not be sent.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6 lg:p-8">
      <header className="border-b border-border pb-6">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary-light">Account communication</p>
        <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">Free allowance notice</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          A factual service notice confirming the 600-lead, 3-day trial allowance. This is not a marketing campaign.
        </p>
      </header>

      {error && <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">{error}</div>}
      {result && (
        <div className="flex gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
          <p className="text-sm text-foreground">
            Batch complete: <strong>{result.delivered} accepted</strong>, {result.failed} failed, {result.skipped} skipped. {result.remaining} remain.
          </p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Eligible Free accounts", status?.eligible ?? "-"],
          ["Notice sent", status?.delivered ?? "-"],
          ["Unreachable", status?.failed ?? "-"],
          ["Remaining", status?.remaining ?? "-"],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-border bg-card p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
            <p className="mt-3 text-3xl font-semibold text-foreground">{loading ? "..." : value}</p>
          </div>
        ))}
      </div>

      <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-foreground">
              <ShieldCheck className="h-5 w-5 text-emerald-500" />
              <h2 className="font-semibold">Fixed account-update copy</h2>
            </div>
            <p className="mt-3 text-sm font-medium text-foreground">Your iCloseLeads 3-day trial includes 600 lead results</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Confirms the trial allowance, its three-day timeline, and the paid access required afterward.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs text-muted-foreground">
            <Mail className="h-4 w-4" />
            {status?.sender.fromEmail || "Checking sender..."}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3 border-t border-border pt-5">
          <label className="flex min-h-11 items-center gap-2 rounded-lg border border-border bg-background px-3 text-sm text-muted-foreground">
            Batch size
            <input
              type="number"
              min={1}
              max={Math.min(status?.batchSize ?? 20, status?.remaining ?? 20)}
              value={batchSize}
              onChange={(event) => setBatchSize(Math.max(1, Math.min(20, Number(event.target.value) || 1)))}
              className="w-14 bg-transparent text-right font-semibold text-foreground outline-none"
            />
          </label>
          <button
            type="button"
            onClick={() => void sendNextBatch()}
            disabled={loading || sending || !status?.sender.configured || !status.remaining}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
          >
            {sending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {sending ? "Sending..." : `Send next ${Math.min(batchSize, status?.batchSize ?? 20, status?.remaining ?? 20)}`}
          </button>
          <button type="button" onClick={() => void loadStatus()} disabled={loading || sending} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground disabled:opacity-50">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh counts
          </button>
        </div>
      </section>
    </div>
  );
}
