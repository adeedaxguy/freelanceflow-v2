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
import { LeadStatusBadge, EmailStatusBadge } from "@/components/Badge";
import { formatRelativeTime } from "@/lib/utils";

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
    prisma.sentEmail.count({ where: { userId, status: { in: ["OPENED", "DELIVERED"] } } }),
    prisma.sentEmail.count({ where: { userId, status: { in: ["OPENED", "DELIVERED"] }, sentAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),
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
  { label: "Local Leads", href: "/dashboard/local-leads", icon: MapPin,   color: "bg-accent/10 text-accent border-accent/20 hover:bg-accent/20" },
  { label: "Remote Jobs", href: "/dashboard/leads",       icon: Search,   color: "bg-primary/10 text-primary-light border-primary/20 hover:bg-primary/20" },
  { label: "Live Jobs",   href: "/dashboard/live-jobs",   icon: Radio,    color: "bg-gold/10 text-gold border-gold/20 hover:bg-gold/20" },
  { label: "Saved Leads", href: "/dashboard/saved-leads", icon: Bookmark, color: "bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20" },
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
      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
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

  try {
    data = await getDashboardData(session.user.id);
  } catch (error) {
    dashboardDataError = true;
    data = getEmptyDashboardData();
    console.error("[dashboard] Failed to load overview data", error);
  }

  const firstName = session.user.name?.split(" ")[0] ?? "there";
  const isPro     = session.user.plan && session.user.plan !== "free";

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  })();

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            {greeting}, {firstName} 👋
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Here&apos;s what&apos;s happening with your outreach this month.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Cmd+K hint — client component (server page can't have onClick) */}
          <CmdKButton />
          <Link
            href="/dashboard/local-leads"
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary-light text-white text-sm font-medium transition-all shadow-glow-primary"
          >
            <MapPin className="w-4 h-4" /> Find Local Leads
          </Link>
        </div>
      </div>

      {dashboardDataError && (
        <div className="rounded-2xl border border-gold/30 bg-gold/10 p-4">
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

      {/* ── Animated stat cards ── */}
      <DashboardStats stats={{
        leadsFound: data.leadsFound,
        emailsSent: data.emailsSent,
        openRate:   data.openRate,
        responses:  data.responses,
        trends:     data.trends,
      }} />

      {/* ── Chart + Quick Actions ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <EmailChart data={data.chartData} title="Outreach Prepared — Last 30 Days" />
        </div>

        <div className="bg-gradient-card border border-border rounded-2xl p-6 flex flex-col gap-4">
          <h3 className="text-foreground font-semibold">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {QUICK_ACTIONS.map(({ label, href, icon: Icon, color }) => (
              <Link
                key={label}
                href={href}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-center transition-all hover:-translate-y-0.5 hover:shadow-md ${color}`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{label}</span>
              </Link>
            ))}
          </div>

          {!isPro && (
            <div className="mt-auto rounded-xl border border-accent/20 bg-accent/10 px-4 py-3">
              <p className="flex items-center gap-2 text-sm font-semibold text-accent">
                <CheckCircle className="w-4 h-4" /> Free launch access
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Remote jobs, live jobs, local business leads, and AI proposal prep are open while paid plans are being prepared.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Recent Activity ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Leads */}
        <div className="bg-gradient-card border border-border rounded-2xl overflow-hidden">
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
        <div className="bg-gradient-card border border-border rounded-2xl overflow-hidden">
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
        <div className="bg-gradient-to-r from-primary/10 via-accent/5 to-primary/5 border border-primary/20 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-primary-light" />
            </div>
            <div className="flex-1">
              <h3 className="text-foreground font-bold text-base">Welcome to iCloseLeads! 🎉</h3>
              <p className="text-muted-foreground text-sm mt-1 leading-relaxed">
                You&apos;re all set up. Here&apos;s how to get your first client in 3 steps:
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
                    className={`flex flex-col gap-1.5 p-4 rounded-xl border ${color} hover:opacity-90 transition-opacity`}
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
