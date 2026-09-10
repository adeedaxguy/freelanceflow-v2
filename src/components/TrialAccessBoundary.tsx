"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Clock3, ArrowRight } from "lucide-react";
import { PLAN_MONTHLY_PRICES } from "@/lib/plan-pricing";

export type TrialUsage = {
  plan: string;
  remaining: number;
  trialEndsAt: string | null;
  trialExpired: boolean;
  unlimited: boolean;
};

export default function TrialAccessBoundary({ initialUsage, children }: {
  initialUsage: TrialUsage | null;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [usage, setUsage] = useState(initialUsage);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const controller = new AbortController();
    const refresh = () => {
      setNow(Date.now());
      fetch("/api/usage", { cache: "no-store", signal: controller.signal })
        .then(r => r.ok ? r.json() : null)
        .then((data: TrialUsage | null) => {
          if (!controller.signal.aborted && data) setUsage(data);
        }).catch(() => {});
    };
    refresh();
    window.addEventListener("focus", refresh);
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => {
      controller.abort();
      window.removeEventListener("focus", refresh);
      window.clearInterval(timer);
    };
  }, [pathname]);

  const endsAt = usage?.trialEndsAt ? Date.parse(usage.trialEndsAt) : NaN;
  const isTrial = usage?.plan === "free" && !usage.unlimited;
  const expired = isTrial && (usage.trialExpired || now >= endsAt);
  const hours = Math.max(0, Math.ceil((endsAt - now) / 3_600_000));
  const blocksDesign = pathname === "/dashboard/web-design" && (expired || !usage);

  return <>
    {isTrial && Number.isFinite(endsAt) && (
      <aside aria-label="Trial status" className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-start gap-2">
          <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-primary-light" aria-hidden="true" />
          <div className="min-w-0 text-sm">
            <p className="font-semibold text-foreground">{expired ? "Your 3-day trial has ended" : `Free 3-day trial: ${hours < 1 ? "less than 1 hour" : `${hours} hour${hours === 1 ? "" : "s"}`} left`}</p>
            <p className="text-xs text-muted-foreground">
              {expired
                ? "Choose a paid plan for new searches, AI tools, and outreach. Saved work stays available."
                : `${usage.remaining} lead results remaining across Local, Remote, and Live Jobs. No automatic charge.`}
            </p>
            {!expired && <p className="text-xs text-muted-foreground">Ends <time dateTime={usage.trialEndsAt!}>{new Date(endsAt).toUTCString()}</time></p>}
          </div>
        </div>
        <Link href="/dashboard/upgrade" className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white hover:bg-primary/90">
          {expired ? "Choose a plan" : "View paid plans"} <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </aside>
    )}
    {blocksDesign ? (
      <section className="px-4 py-10 sm:px-8">
        <h1 className="text-2xl font-bold">{expired ? "Continue creating website concepts" : "Checking your access"}</h1>
        <p className="mt-3 max-w-xl text-sm text-muted-foreground">{expired
          ? `Website design is included during your trial and with Pro ($${PLAN_MONTHLY_PRICES.pro}/month) or Agency ($${PLAN_MONTHLY_PRICES.agency}/month). Previously shared previews stay available.`
          : "Your account access could not be verified. Reload this page to try again."}</p>
        <Link href="/dashboard/upgrade" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary-light">View plans <ArrowRight className="h-4 w-4" /></Link>
      </section>
    ) : children}
  </>;
}
