"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowUpRight, RefreshCw } from "lucide-react";
import Link from "next/link";

type RevenueData = {
  baseMrr: number | null; stripeError: string | null; customers: number;
  subscribers: number; complimentary: number; duplicateSubscriptions: number;
  planCounts: Record<string, number>;
  cohort: { signups: number; saved: number; outreach: number; replied: number; won: number; subscribed: number; complimentary: number };
  events: Array<{ action: string; count: number; users: number }> | null;
};
const EVENT_LABELS: Record<string, string> = {
  lead_search_completed: "Searches with results",
  lead_search_empty: "Searches without results",
  lead_search_failed: "Search errors",
  payment_checkout_started: "Checkouts opened",
  payment_plan_change_started: "Plan changes opened",
  payment_checkout_completed: "Checkouts confirmed",
  payment_checkout_blocked: "Checkouts blocked by configuration",
  payment_checkout_failed: "Checkout creation errors",
  payment_failed: "Failed payments",
  payment_webhook_error: "Webhook errors",
  payment_checkout_expired: "Expired checkouts",
};

export default function AdminRevenuePage() {
  const [data, setData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/revenue");
      if (!response.ok) throw new Error("Revenue data could not be loaded. Please retry.");
      setData(await response.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Revenue data is unavailable.");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { void refresh(); }, [refresh]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl space-y-8">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Revenue and conversion</h1>
          <p className="mt-2 text-sm text-muted-foreground">Customer activity and live subscriptions. Staff and internal accounts excluded.</p>
        </div>
        <button type="button" onClick={() => void refresh()} disabled={loading} aria-label="Refresh revenue data" title="Refresh revenue data" className="h-10 w-10 shrink-0 flex items-center justify-center rounded-lg border border-border disabled:opacity-50">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </header>
      {loading && !data && <p role="status" className="text-sm text-muted-foreground">Loading customer and billing activity...</p>}
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      {data && <>
        {data.stripeError && <p role="status" className="text-sm text-muted-foreground">{data.stripeError}</p>}
        <dl className="grid grid-cols-2 lg:grid-cols-4 gap-6 border-y border-border py-6">
          {[
            ["Stripe base MRR", data.baseMrr === null ? "Unavailable" : `$${data.baseMrr.toFixed(2)}`],
            ["Live subscribers", data.subscribers.toLocaleString()],
            ["Pro subscribers", String(data.planCounts.pro ?? 0)],
            ["Agency subscribers", String(data.planCounts.agency ?? 0)],
          ].map(([label, value]) => <div key={label} className="min-w-0">
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className="mt-2 text-xl font-semibold break-words">{value}</dd>
          </div>)}
        </dl>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Base MRR uses active Stripe price amounts before discounts, refunds and tax; it is not cash collected.
          Trial subscriptions and softphone add-ons are excluded. Annual prices are divided by 12.
          Live subscriber counts use recorded subscription status, not manually assigned account plans.
        </p>
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Complimentary and other unpaid plan access</h2>
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">{data.complimentary}</strong> customer accounts have Pro or Agency access without a recorded active paid-plan subscription.
            This includes free testing access assigned by an administrator. It is not paid conversion or revenue. Access has not been changed.
          </p>
          {data.duplicateSubscriptions > 0 && <p className="text-sm text-destructive">{data.duplicateSubscriptions} additional active subscriptions belong to customers who already have one. Review billing for possible duplicates.</p>}
          <Link href="/admin/users" className="inline-flex items-center gap-1 text-sm text-primary-light">Review accounts <ArrowUpRight className="h-4 w-4" /></Link>
        </section>
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">New-customer activation</h2>
            <p className="mt-1 text-sm text-muted-foreground">{data.cohort.signups} customers registered in the last 30 days. Each milestone counts distinct people in that same signup group.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-muted-foreground border-b border-border"><tr><th className="py-3 font-medium">Milestone</th><th className="py-3 font-medium text-right">Customers</th><th className="py-3 font-medium text-right">Of signups</th></tr></thead>
              <tbody>{[
                ["Signed up", data.cohort.signups],
                ["Saved a lead", data.cohort.saved],
                ["Prepared or sent outreach", data.cohort.outreach],
                ["Recorded a reply or later stage", data.cohort.replied],
                ["Recorded a won deal", data.cohort.won],
                ["Has an active live subscription", data.cohort.subscribed],
              ].map(([label, count]) => <tr key={label} className="border-b border-border/60">
                <td className="py-3 pr-3">{label}</td><td className="py-3 text-right tabular-nums">{count}</td>
                <td className="py-3 text-right tabular-nums">{data.cohort.signups ? `${Math.round(Number(count) / data.cohort.signups * 100)}%` : "N/A"}</td>
              </tr>)}</tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground">Milestones are not necessarily sequential. Prepared outreach is not proof of delivery; replies and won deals are customer-recorded.</p>
          <p className="text-xs text-muted-foreground">{data.cohort.complimentary} of these new customers currently have paid-plan access without a subscription, including free testing grants. Their usage is included above, but their access does not count as a paid conversion.</p>
        </section>
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Search and checkout activity</h2>
          <p className="text-sm text-muted-foreground">Last 30 days, all customer accounts. New event tracking starts with this release; earlier activity may be missing.</p>
          {data.events === null ? <p className="text-sm text-muted-foreground">Event history is unavailable.</p> : data.events.length === 0 ? <p className="text-sm text-muted-foreground">No recorded events yet. This does not mean nobody tried to search or pay before tracking began.</p> : (
            <table className="w-full text-sm text-left">
              <thead className="text-muted-foreground border-b border-border"><tr><th className="py-3 font-medium">Event</th><th className="py-3 font-medium text-right">Attempts</th><th className="py-3 font-medium text-right">Customers</th></tr></thead>
              <tbody>{data.events.map(event => <tr key={event.action} className="border-b border-border/60">
                <td className="py-3 pr-3">{EVENT_LABELS[event.action] ?? event.action}</td><td className="py-3 text-right">{event.count}</td><td className="py-3 text-right">{event.users}</td>
              </tr>)}</tbody>
            </table>
          )}
          <Link href="/admin/audit" className="inline-flex items-center gap-1 text-sm text-primary-light">Review payment errors <ArrowUpRight className="h-4 w-4" /></Link>
        </section>
      </>}
    </div>
  );
}
