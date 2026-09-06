export const dynamic = 'force-dynamic';

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  Search, Sparkles, Send,
  Users, Mail, Bookmark, CheckCircle,
  MapPin, Radio, AlertTriangle,
} from "lucide-react";
import EmailChart from "@/components/charts/EmailChart";
import DashboardStats from "@/components/DashboardStats";
import CmdKButton from "@/components/CmdKButton";
import MarketingEmailOptIn from "@/components/MarketingEmailOptIn";
import { LeadStatusBadge, EmailStatusBadge } from "@/components/Badge";
import { formatRelativeTime } from "@/lib/utils";
import { DashboardOverviewAd } from "@/components/AdSenseUnit";
import { getUsageStats } from "@/lib/usage";
import { PLAN_MONTHLY_PRICES } from "@/lib/plan-pricing";

const DIRECT_EMAIL_STATUSES = ["SENT", "DELIVERED", "OPENED", "BOUNCED", "FAILED"];
const OUTREACH_STATUSES = [...DIRECT_EMAIL_STATUSES, "READY_TO_SEND"];

function buildEmptyChartData(now = new Date()) {
  return Array.from({ length: 30 }, (_, index) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (29 - index));
    return {
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      count: 0,
    };
  });
}

// ─── Data fetching ─────────────────────────────────────────────────────────────
async function getDashboardData(userId: string) {
  const now           = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo  = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  const [
    leadsFound, leadsFoundPrev,
    emailsSent, emailsSentPrev,
    recentLeads, recentEmails, emailsOverTime,
  ] = await Promise.all([
    prisma.lead.count({ where: { userId, savedAt: { gte: thirtyDaysAgo } } }),
    prisma.lead.count({ where: { userId, savedAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),
    prisma.sentEmail.count({ where: { userId, status: { in: OUTREACH_STATUSES }, sentAt: { gte: thirtyDaysAgo } } }),
    prisma.sentEmail.count({ where: { userId, status: { in: OUTREACH_STATUSES }, sentAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),
    prisma.lead.findMany({ where: { userId }, orderBy: { savedAt: "desc" }, take: 5 }),
    prisma.sentEmail.findMany({
      where: { userId }, orderBy: { sentAt: "desc" }, take: 5,
      include: { lead: { select: { company: true } } },
    }),
    prisma.sentEmail.findMany({
      where: { userId, status: { in: OUTREACH_STATUSES }, sentAt: { gte: thirtyDaysAgo } },
      select: { sentAt: true }, orderBy: { sentAt: "asc" },
    }),
  ]);

  const [directEmails, directEmailsPrev, openedEmails, openedEmailsPrev, responses, responsesPrev] = await Promise.all([
    prisma.sentEmail.count({ where: { userId, status: { in: DIRECT_EMAIL_STATUSES }, sentAt: { gte: thirtyDaysAgo } } }),
    prisma.sentEmail.count({ where: { userId, status: { in: DIRECT_EMAIL_STATUSES }, sentAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),
    prisma.sentEmail.count({ where: { userId, status: "OPENED", sentAt: { gte: thirtyDaysAgo } } }),
    prisma.sentEmail.count({ where: { userId, status: "OPENED", sentAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),
    prisma.lead.count({ where: { userId, status: "REPLIED" } }),
    prisma.lead.count({ where: { userId, status: "REPLIED", savedAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),
  ]);

  const openRate     = directEmails > 0 ? Math.round((openedEmails / directEmails) * 100) : 0;
  const openRatePrev = directEmailsPrev > 0 ? Math.round((openedEmailsPrev / directEmailsPrev) * 100) : 0;

  function trendPct(curr: number, prev: number): number | null {
    if (prev === 0) return null;
    return Math.round(((curr - prev) / prev) * 100);
  }

  // Build 30-day chart
  const dailyCounts: Record<string, number> = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    dailyCounts[d.toLocaleDateString("en-US", { month: "short", day: "numeric" })] = 0;
  }
  for (const e of emailsOverTime) {
    const key = new Date(e.sentAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    if (key in dailyCounts) dailyCounts[key] = (dailyCounts[key] ?? 0) + 1;
  }
  const chartData = Object.entries(dailyCounts).map(([date, count]) => ({ date, count }));

  return {
    leadsFound, emailsSent, openRate, responses,
    recentLeads, recentEmails, chartData,
    trends: {
      leads:     trendPct(leadsFound, leadsFoundPrev),
      emails:    trendPct(emailsSent, emailsSentPrev),
      openRate:  openRatePrev > 0 ? openRate - openRatePrev : null,
      responses: trendPct(responses, responsesPrev),
    },
  };
}

type DashboardData = Awaited<ReturnType<typeof getDashboardData>>;

function getEmptyDashboardData(): DashboardData {
  return {
    leadsFound: 0,
    emailsSent: 0,
    openRate: 0,
    responses: 0,
    recentLeads: [],
    recentEmails: [],
    chartData: buildEmptyChartData(),
    trends: {
      leads: null,
      emails: null,
      openRate: null,
      responses: null,
    },
  };
}

// ─── Quick Actions ─────────────────────────────────────────────────────────────
const QUICK_ACTIONS = [
  { label: "Local Leads", href: "/dashboard/local-leads", icon: MapPin },
  { label: "Remote Jobs", href: "/dashboard/leads",       icon: Search },
  { label: "Live Jobs",   href: "/dashboard/live-jobs",   icon: Radio },
  { label: "Saved Leads", href: "/dashboard/saved-leads", icon: Bookmark },
];

// ─── Empty state component ─────────────────────────────────────────────────────
function EmptyState({
  icon: Icon,
  title,
  desc,
  cta,
  ctaHref,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
  cta: string;
  ctaHref: string;
}) {
  return (
    <div className="py-12 flex flex-col items-center gap-3 text-center px-4">
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
        <Icon className="w-6 h-6 text-primary-light opacity-60" />
      </div>
      <p className="text-foreground font-semibold text-sm">{title}</p>
      <p className="text-muted-foreground text-xs max-w-[180px]">{desc}</p>
      <Link
        href={ctaHref}
        className="mt-1 text-xs text-primary-light hover:underline font-medium"
      >
        {cta} →
      </Link>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  let data: DashboardData;
  let dashboardDataError = false;
  let marketingConsent = true;

  try {
    data = await getDashboardData(session.user.id);
  } catch (error) {
    dashboardDataError = true;
    data = getEmptyDashboardData();
    console.error("[dashboard] Failed to load overview data", error);
  }

  try {
    const preferences = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { marketingConsent: true },
    });
    marketingConsent = preferences?.marketingConsent ?? true;
  } catch (error) {
    console.error("[dashboard] Failed to load email preferences", error);
  }

  const firstName = session.user.name?.split(" ")[0] ?? "there";
  const isPro     = session.user.plan && session.user.plan !== "free";
  const usage = await getUsageStats(session.user.id).catch(() => null);
  const hasSavedLead = data.recentLeads.length > 0;
  const hasOutreach = data.recentEmails.some(email => ["READY_TO_SEND", "SENT", "DELIVERED", "OPENED"].includes(email.status));
  const nextAction = !hasSavedLead
    ? { label: "Find your first prospect", href: "/dashboard/local-leads" }
    : !hasOutreach
      ? { label: "Prepare your first outreach", href: "/dashboard/saved-leads" }
      : { label: "Review your follow-ups", href: "/dashboard/followups" };

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  })();

  return (
    <div className="dashboard-page max-w-7xl space-y-6">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 pt-1">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Workspace overview</p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-medium tracking-tight text-foreground">
            {greeting}, {firstName}.
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Here&apos;s what&apos;s happening with your outreach this month.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Cmd+K hint — client component (server page can't have onClick) */}
          <CmdKButton />
          <Link
            href="/dashboard/local-leads"
            className="hidden sm:flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-light"
          >
            <MapPin className="w-4 h-4" /> Find Local Leads
          </Link>
        </div>
      </div>

      {dashboardDataError && (
        <div className="rounded-xl border border-gold/30 bg-gold/10 p-4">
          <div className="flex gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-gold" />
            <div>
              <p className="text-sm font-semibold text-foreground">Dashboard stats are refreshing</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                The lead engines, saved leads, and outreach tools are still available. This page will keep working even if one stats feed is delayed.
              </p>
            </div>
          </div>
        </div>
      )}

      {!dashboardDataError && (
        <section aria-label="Your next step" className="border-y border-border py-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold">{nextAction.label}</h2>
              <ol className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><CheckCircle className={`h-4 w-4 ${hasSavedLead ? "text-accent" : ""}`} />{hasSavedLead ? "Prospect saved" : "1. Save a prospect"}</li>
                <li className="flex items-center gap-2"><Send className={`h-4 w-4 ${hasOutreach ? "text-accent" : ""}`} />{hasOutreach ? "Outreach prepared" : "2. Prepare outreach"}</li>
                <li className="flex items-center gap-2"><Bookmark className="h-4 w-4" />3. Track the conversation</li>
              </ol>
            </div>
            <Link href={nextAction.href} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white">
              {hasSavedLead ? "Continue outreach" : "Find prospects"} <Search className="h-4 w-4" />
            </Link>
          </div>
          {!isPro && usage && <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-t border-border pt-4">
            <p className="text-sm text-muted-foreground">{usage.trialExpired
              ? "Your trial has ended. Saved leads remain available; a paid plan continues discovery."
              : `${usage.remaining} trial results remaining. Trial ends ${new Date(usage.trialEndsAt ?? usage.nextReset).toUTCString()}.`}</p>
            <Link href="/dashboard/upgrade" className="shrink-0 text-sm font-semibold text-primary-light">Pro $${PLAN_MONTHLY_PRICES.pro} / Agency $${PLAN_MONTHLY_PRICES.agency} monthly</Link>
          </div>}
        </section>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.15fr)] gap-4">
        <DashboardStats stats={{
          leadsFound: data.leadsFound,
          emailsSent: data.emailsSent,
          openRate: data.openRate,
          responses: data.responses,
          trends: data.trends,
        }} />
        <div>
          <EmailChart data={data.chartData} title="Outreach Prepared — Last 30 Days" />
        </div>
      </div>

      {!isPro && hasSavedLead && <DashboardOverviewAd />}
      {!marketingConsent && <MarketingEmailOptIn />}

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Quick access</span>
          {QUICK_ACTIONS.map(({ label, href, icon: Icon }) => (
            <Link
              key={label}
              href={href}
              className="dashboard-action-pill flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium transition-colors"
            >
              <Icon className="w-4 h-4 text-primary-light" />
              <span>{label}</span>
            </Link>
          ))}
        </div>

        {!isPro && (
          <div className="dashboard-surface flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-center gap-2 text-sm font-semibold text-accent">
              <CheckCircle className="w-4 h-4" /> {usage?.trialExpired ? "Trial complete" : "3-day trial"}
            </p>
            <p className="text-xs leading-relaxed text-muted-foreground">
              {usage?.trialExpired ? "Your saved work is still available." : "Up to 600 lead results. No automatic charge."}
            </p>
          </div>
        )}
      </div>

      {/* ── Recent Activity ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Leads */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h3 className="text-foreground font-semibold flex items-center gap-2">
              <Users className="w-4 h-4 text-primary-light" /> Recent Leads
            </h3>
            <Link href="/dashboard/saved-leads" className="text-primary-light text-xs hover:underline">
              View all →
            </Link>
          </div>
          {data.recentLeads.length === 0 ? (
            <EmptyState
              icon={Search}
              title="No leads yet"
              desc="Search for your first lead to get started"
              cta="Find leads"
              ctaHref="/dashboard/local-leads"
            />
          ) : (
            <div className="divide-y divide-border/50">
              {data.recentLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="flex items-center justify-between px-6 py-3 hover:bg-primary/5 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-primary-light font-semibold text-xs flex-shrink-0">
                      {lead.company[0]?.toUpperCase() ?? "?"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-foreground text-sm font-medium truncate">{lead.company}</p>
                      <p className="text-muted-foreground text-xs truncate">{lead.domain}</p>
                    </div>
                  </div>
                  <LeadStatusBadge status={lead.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Outreach */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h3 className="text-foreground font-semibold flex items-center gap-2">
              <Mail className="w-4 h-4 text-primary-light" /> Recent Outreach
            </h3>
            <Link href="/dashboard/sent" className="text-primary-light text-xs hover:underline">
              View all →
            </Link>
          </div>
          {data.recentEmails.length === 0 ? (
            <EmptyState
              icon={Send}
              title="No outreach yet"
              desc="Find leads and prepare AI-powered proposals"
              cta="Find leads"
              ctaHref="/dashboard/local-leads"
            />
          ) : (
            <div className="divide-y divide-border/50">
              {data.recentEmails.map((email) => (
                <div
                  key={email.id}
                  className="flex items-center justify-between px-6 py-3 hover:bg-primary/5 transition-colors"
                >
                  <div className="min-w-0 flex-1 mr-3">
                    <p className="text-foreground text-sm font-medium truncate">
                      {email.lead?.company ?? "Direct"}
                    </p>
                    <p className="text-muted-foreground text-xs truncate">{email.subject}</p>
                    <p className="text-muted-foreground text-xs">{formatRelativeTime(email.sentAt)}</p>
                  </div>
                  <EmailStatusBadge status={email.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Onboarding prompt (only for new users with 0 leads) ── */}
      {data.leadsFound === 0 && data.emailsSent === 0 && (
        <div className="rounded-xl border border-primary/20 bg-card p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-primary-light" />
            </div>
            <div className="flex-1">
              <h3 className="text-foreground font-bold text-base">Start with your first lead search</h3>
              <p className="text-muted-foreground text-sm mt-1 leading-relaxed">
                Your workspace is ready. Use this three-step path to move from a real signal to a tracked conversation.
              </p>
              <div className="mt-4 grid sm:grid-cols-3 gap-3">
                {[
                  { step: "1", title: "Find Local Leads", desc: "Start with nearby businesses that need a clearer site, contact path, or offer", href: "/dashboard/local-leads", color: "border-primary/30 bg-primary/5" },
                  { step: "2", title: "Prepare Pitch",    desc: "Open the lead, find the owner path, and draft a researched outreach angle",      href: "/dashboard/local-leads", color: "border-accent/30 bg-accent/5" },
                  { step: "3", title: "Track Replies",  desc: "Manage follow-ups and close deals in your CRM pipeline", href: "/dashboard/pipeline",  color: "border-gold/30 bg-gold/5" },
                ].map(({ step, title, desc, href, color }) => (
                  <Link
                    key={step}
                    href={href}
                    className={`flex flex-col gap-1.5 p-4 rounded-lg border ${color} hover:border-foreground/20 transition-colors`}
                  >
                    <span className="text-xs font-bold text-muted-foreground">Step {step}</span>
                    <p className="text-foreground font-semibold text-sm">{title}</p>
                    <p className="text-muted-foreground text-xs leading-relaxed">{desc}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
