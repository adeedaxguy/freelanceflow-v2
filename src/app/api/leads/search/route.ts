import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  aggregateLeadsWithDiagnostics,
  type LeadSource,
  type AggregatedLead,
} from "@/lib/leads-aggregator";
import { checkAndIncrementLeads, getUsageStats } from "@/lib/usage";
import { FREE_TRIAL_LEAD_LIMIT } from "@/lib/plan-limits";
import { z } from "zod";

// Accept either `niche: "web-development"` (legacy) or `niches: ["web-development", "shopify"]`.
const searchSchema = z.object({
  niche:         z.string().min(1).optional(),
  niches:        z.array(z.string().min(1)).max(15).optional(),
  maxHours:      z.number().int().min(1).max(720).optional().default(48),
  source:        z.string().optional(),
  keyword:       z.string().optional(),
  minConfidence: z.number().int().min(0).max(100).optional().default(45),
  hasEmail:      z.boolean().optional().default(false),
  freshOnly:     z.boolean().optional().default(false),
}).refine(d => !!(d.niche || (d.niches && d.niches.length > 0)), {
  message: "At least one niche is required",
});

const VALID_SOURCES: LeadSource[] = [
  "remoteok", "remotive", "reddit", "weworkremotely",
  "arbeitnow", "remotejobsorg", "jobopportunities", "jobicy", "workingnomads", "hackernews",
  "ycjobs", "authenticjobs", "githubissues",
  "freelancermap", "smashingjobs", "dribbble",
  "himalayas", "nodesk", "greenhouse", "lever", "ashby",
  "remotefirstjobs", "web3jobsradar",
];

const UNLIMITED_EMAILS = new Set([
  "adeedaxguy@gmail.com",
  "adnan@technodigg.com",
  "adnanaimanager@gmail.com",
]);

const MIN_USEFUL_FRESH_RESULTS = 12;

/**
 * Per-user dedup keys. Match either the exact posting URL or company + title,
 * without treating every future role from the same company as a duplicate.
 */
function fingerprints(company: string, domain: string, title = "", sourceUrl = ""): string[] {
  const keys: string[] = [];
  const url = sourceUrl.replace(/[?#].*$/, "").replace(/\/+$/, "").toLowerCase();
  if (url) keys.push(`url:${url}`);
  const co  = (company ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const dom = (domain ?? "").toLowerCase().replace(/^www\./, "");
  const ti  = title.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 80);
  if (co && ti) keys.push(`job:${co}|${dom}|${ti}`);
  return keys;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: unknown = await req.json();
    const parsed = searchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
    }

    const { niche, niches, maxHours, source, keyword, minConfidence, hasEmail, freshOnly } = parsed.data;
    const nicheList: string[] = niches && niches.length > 0
      ? niches
      : (niche ? [niche] : ["web-development"]);

    const userEmail = (session.user.email ?? "").toLowerCase();
    const isUnlimitedUser = UNLIMITED_EMAILS.has(userEmail);

    // Usage stats — agency/pro bypass first; fall back to free defaults if DB unavailable.
    let usage = {
      plan: isUnlimitedUser ? "agency" : "free",
      limit: isUnlimitedUser ? 99999 : FREE_TRIAL_LEAD_LIMIT,
      used: 0,
      remaining: isUnlimitedUser ? 99999 : FREE_TRIAL_LEAD_LIMIT,
      nextReset: new Date(Date.now() + 3 * 86_400_000).toISOString(),
      percentage: 0,
      trialEndsAt: isUnlimitedUser ? null : new Date(Date.now() + 3 * 86_400_000).toISOString(),
      trialExpired: false,
    };
    if (!isUnlimitedUser) {
      try {
        const u = await getUsageStats(session.user.id);
        if (u) usage = u;
      } catch { /* non-fatal */ }
    }

    if (usage.remaining === 0) {
      return NextResponse.json({
        error:     usage.trialExpired
          ? "Your 3-day trial has ended. Upgrade to Pro or Agency to keep finding leads."
          : `Trial limit reached. You have used your ${usage.limit} included leads.`,
        plan:      usage.plan,
        limit:     usage.limit,
        nextReset: usage.nextReset,
        upgrade:   true,
        bonusAvailable: !usage.trialExpired,
        trialExpired: usage.trialExpired,
      }, { status: 429 });
    }

    // Per-user dedup: build a fingerprint set from previously SAVED leads so we
    // don't re-show the same company+title to the same user. Uses the FULL
    // fingerprint (company + title + domain) — not a loose substring — so that
    // saving one lead from reddit.com doesn't hide every future reddit lead.
    const savedFingerprints = new Set<string>();
    try {
      const saved = await prisma.lead.findMany({
        where: { userId: session.user.id },
        select: { company: true, domain: true, title: true, sourceUrl: true },
      });
      for (const s of saved) {
        for (const key of fingerprints(s.company, s.domain, s.title ?? "", s.sourceUrl ?? "")) {
          savedFingerprints.add(key);
        }
      }
    } catch { /* non-fatal */ }

    const filterSource: LeadSource | undefined =
      source && source !== "all" && (VALID_SOURCES as string[]).includes(source)
        ? (source as LeadSource)
        : undefined;

    let { leads: rawLeads, diagnostics } = await aggregateLeadsWithDiagnostics(nicheList, {
      maxHours,
      filterSource,
      minConfidence,
      freshOnly,
    });

    // Auto-broaden fallback: if a fresh search returns nothing, or returns too
    // few useful matches, widen the time window. We tell the UI it was broadened
    // so it can be honest that these are the best nearby matches, not only the
    // strict requested window.
    let effectiveMaxHours = maxHours;
    let autoBroadened = false;
    const initialResultCount = rawLeads.length;
    let broadenReason: "empty" | "thin" | null =
      initialResultCount === 0 ? "empty" :
      initialResultCount < MIN_USEFUL_FRESH_RESULTS ? "thin" :
      null;

    const shouldBroaden = () =>
      rawLeads.length < MIN_USEFUL_FRESH_RESULTS && effectiveMaxHours < 720;

    if (shouldBroaden() && maxHours < 168) {
      effectiveMaxHours = 168;
      autoBroadened = true;
      const retry = await aggregateLeadsWithDiagnostics(nicheList, {
        maxHours: effectiveMaxHours,
        filterSource,
        minConfidence,
        freshOnly,
      });
      rawLeads = retry.leads;
      diagnostics = retry.diagnostics;
    }
    if (shouldBroaden()) {
      effectiveMaxHours = 720;
      autoBroadened = true;
      const retry = await aggregateLeadsWithDiagnostics(nicheList, {
        maxHours: effectiveMaxHours,
        filterSource,
        minConfidence,
        freshOnly,
      });
      rawLeads = retry.leads;
      diagnostics = retry.diagnostics;
    }
    if (autoBroadened && !broadenReason) {
      broadenReason = rawLeads.length === 0 ? "empty" : "thin";
    }

    let leads: AggregatedLead[] = rawLeads.filter(l =>
      !fingerprints(l.company, l.domain, l.title, l.url).some(key => savedFingerprints.has(key))
    );
    const totalAfterUserDedup = leads.length;

    if (keyword?.trim()) {
      const kw = keyword.toLowerCase();
      leads = leads.filter(l =>
        (l.title ?? "").toLowerCase().includes(kw) ||
        (l.description ?? "").toLowerCase().includes(kw) ||
        (l.company ?? "").toLowerCase().includes(kw) ||
        (l.tags ?? []).some(t => (t ?? "").toLowerCase().includes(kw))
      );
    }
    if (hasEmail) leads = leads.filter(l => !!l.email);

    // Respect the user's current cap exactly. Bonus claims increase this value
    // through getUsageStats, so the UI and API always share one threshold.
    const cap = usage.remaining;
    const toReturn = leads.slice(0, cap);

    if (toReturn.length > 0) {
      try { await checkAndIncrementLeads(session.user.id, toReturn.length); }
      catch { /* non-fatal */ }
    }

    let updatedUsage = usage;
    try {
      const u = await getUsageStats(session.user.id);
      if (u) updatedUsage = u;
    } catch { /* non-fatal */ }

    // Per-source breakdown for the UI.
    const sources: Record<string, number> = Object.fromEntries(
      VALID_SOURCES.map(s => [s, 0])
    );
    for (const l of toReturn) {
      if (l.source in sources) sources[l.source] = (sources[l.source] ?? 0) + 1;
    }

    return NextResponse.json({
      leads:     toReturn,
      total:     toReturn.length,
      sources,
      usage:     updatedUsage,
      fetchedAt: new Date().toISOString(),
      maxHours: effectiveMaxHours,
      requestedMaxHours: maxHours,
      autoBroadened,
      diagnostics: {
        ...diagnostics,
        totalAfterUserDedup,
        totalAfterKeywordFilter: leads.length,
        totalReturned: toReturn.length,
        capped: leads.length > cap,
        autoBroadened,
        requestedMaxHours: maxHours,
        effectiveMaxHours,
        initialResultCount,
        minimumUsefulResults: MIN_USEFUL_FRESH_RESULTS,
        broadenReason,
      },
    });
  } catch (error) {
    console.error("Lead search error:", error);
    return NextResponse.json({
      error: "Failed to fetch leads. Please try again.",
      detail: error instanceof Error ? error.message : "unknown error",
    }, { status: 500 });
  }
}
