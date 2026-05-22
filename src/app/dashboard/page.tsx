import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Search, Sparkles, Send, BarChart2, TrendingUp, TrendingDown, Users, Mail, Bookmark, Minus } from "lucide-react";
import StatsCard from "@/components/StatsCard";
import EmailChart from "@/components/charts/EmailChart";
import { LeadStatusBadge, EmailStatusBadge } from "@/components/Badge";
import { formatRelativeTime } from "@/lib/utils";

async function getDashboardData(userId: string) {
  const now = new Date();
  const thirtyDaysAgo  = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo   = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  const [
    leadsFound, leadsFoundPrev,
    emailsSent, emailsSentPrev,
    recentLeads, recentEmails, emailsOverTime,
  ] = await Promise.all([
    prisma.lead.count({ where: { userId, savedAt: { gte: thirtyDaysAgo } } }),
    prisma.lead.count({ where: { userId, savedAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),
    prisma.sentEmail.count({ where: { userId, sentAt: { gte: thirtyDaysAgo } } }),
    prisma.sentEmail.count({ where: { userId, sentAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),
    prisma.lead.findMany({ where: { userId }, orderBy: { savedAt: "desc" }, take: 5 }),
    prisma.sentEmail.findMany({
      where: { userId }, orderBy: { sentAt: "desc" }, take: 5,
      include: { lead: { select: { company: true } } },
    }),
    prisma.sentEmail.findMany({
      where: { userId, sentAt: { gte: thirtyDaysAgo } },
      select: { sentAt: true }, orderBy: { sentAt: "asc" },
    }),
  ]);

  const openedEmails = await prisma.sentEmail.count({
    where: { userId, status: { in: ["OPENED", "DELIVERED"] } },
  });
  const openedEmailsPrev = await prisma.sentEmail.count({
    where: { userId, status: { in: ["OPENED", "DELIVERED"] }, sentAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
  });
  const sentPrev = await prisma.sentEmail.count({
    where: { userId, sentAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
  });

  const responses = await prisma.lead.count({ where: { userId, status: "REPLIED" } });
  const responsesPrev = await prisma.lead.count({ where: { userId, status: "REPLIED", savedAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } });

  const openRate     = emailsSent > 0 ? Math.round((openedEmails / emailsSent) * 100) : 0;
  const openRatePrev = sentPrev    > 0 ? Math.round((openedEmailsPrev / sentPrev) * 100) : 0;

  // Compute real % trends (null = no prior data to compare)
  function trendPct(curr: number, prev: number): number | null {
    if (prev === 0) return null;
    return Math.round(((curr - prev) / prev) * 100);
  }

  // Build 30-day chart
  const dailyCounts: Record<string, number> = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    dailyCounts[key] = 0;
  }
  for (const e of emailsOverTime) {
    const key = new Date(e.sentAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    if (key in dailyCounts) dailyCounts[key] = (dailyCounts[key] ?? 0) + 1;
  }
  const chartData = Object.entries(dailyCounts).map(([date, count]) => ({ date, count }));

  return {
    leadsFound, emailsSent, openRate, responses, recentLeads, recentEmails, chartData,
    trends: {
      leads:     trendPct(leadsFound, leadsFoundPrev),
      emails:    trendPct(emailsSent, emailsSentPrev),
      openRate:  openRatePrev > 0 ? openRate - openRatePrev : null, // pp diff
      responses: trendPct(responses, responsesPrev),
    },
  };
}

function TrendBadge({ value, suffix = "%" }: { value: number | null; suffix?: string }) {
  if (value === null) return <span className="text-xs text-muted-foreground">No prior data</span>;
  if (value === 0) return (
    <span className="flex items-center gap-1 text-xs text-muted-foreground">
      <Minus className="w-3 h-3" /> No change
    </span>
  );
  const positive = value > 0;
  return (
    <span className={`flex items-center gap-1 text-xs font-medium ${positive ? "text-accent" : "text-destructive"}`}>
      {positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {positive ? "+" : ""}{value}{suffix} vs last 30d
    </span>
  );
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const data = await getDashboardData(session.user.id);
  const firstName = session.user.name?.split(" ")[0] ?? "there";

  const quickActions = [
    { label: "Find Leads",  href: "/dashboard/leads",    icon: Search,   color: "bg-primary/10 text-primary-light border-primary/20 hover:bg-primary/20" },
    { label: "AI Proposal", href: "/dashboard/leads",    icon: Sparkles, color: "bg-accent/10 text-accent border-accent/20 hover:bg-accent/20" },
    { label: "Sent Emails", href: "/dashboard/sent",     icon: Send,     color: "bg-gold/10 text-gold border-gold/20 hover:bg-gold/20" },
    { label: "Analytics",   href: "/dashboard/analytics",icon: BarChart2,color: "bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20" },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Welcome back, {firstName} 👋</h1>
          <p className="text-muted-foreground mt-1">Here&apos;s what&apos;s happening with your outreach this month.</p>
        </div>
        <Link
          href="/dashboard/leads"
          className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary-light text-white text-sm font-medium transition-all shadow-glow-primary"
        >
          <Search className="w-4 h-4" /> Find Leads
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-card border border-border rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Leads Found</span>
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="w-4 h-4 text-primary-light" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground">{data.leadsFound}</div>
          <TrendBadge value={data.trends.leads} />
        </div>

        <div className="bg-gradient-card border border-border rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Emails Sent</span>
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Mail className="w-4 h-4 text-primary-light" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground">{data.emailsSent}</div>
          <TrendBadge value={data.trends.emails} />
        </div>

        <div className="bg-gradient-card border border-accent/20 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Open Rate</span>
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-accent" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground">{data.openRate}%</div>
          <TrendBadge value={data.trends.openRate} suffix="pp" />
        </div>

        <div className="bg-gradient-card border border-gold/20 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Responses</span>
            <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center">
              <Bookmark className="w-4 h-4 text-gold" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground">{data.responses}</div>
          <TrendBadge value={data.trends.responses} />
        </div>
      </div>

      {/* Chart + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <EmailChart data={data.chartData} title="Emails Sent — Last 30 Days" />
        </div>
        <div className="bg-gradient-card border border-border rounded-2xl p-6">
          <h3 className="text-foreground font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((a) => {
              const Icon = a.icon;
              return (
                <Link key={a.label} href={a.href} className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-center transition-all ${a.color}`}>
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{a.label}</span>
                </Link>
              );
            })}
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <Link href="/dashboard/upgrade"
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-hero text-white text-sm font-semibold transition-all shadow-glow-primary hover:opacity-90">
              ⚡ Upgrade Plan
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gradient-card border border-border rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h3 className="text-foreground font-semibold">Recent Leads</h3>
            <Link href="/dashboard/saved-leads" className="text-primary-light text-sm hover:underline">View all</Link>
          </div>
          {data.recentLeads.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              No leads yet.{" "}
              <Link href="/dashboard/leads" className="text-primary-light hover:underline">Find your first lead →</Link>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {data.recentLeads.map((lead) => (
                <div key={lead.id} className="flex items-center justify-between px-6 py-3 hover:bg-primary/5 transition-colors">
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

        <div className="bg-gradient-card border border-border rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h3 className="text-foreground font-semibold">Recent Emails</h3>
            <Link href="/dashboard/sent" className="text-primary-light text-sm hover:underline">View all</Link>
          </div>
          {data.recentEmails.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              No emails sent yet.{" "}
              <Link href="/dashboard/leads" className="text-primary-light hover:underline">Find leads to email →</Link>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {data.recentEmails.map((email) => (
                <div key={email.id} className="flex items-center justify-between px-6 py-3 hover:bg-primary/5 transition-colors">
                  <div className="min-w-0 flex-1 mr-3">
                    <p className="text-foreground text-sm font-medium truncate">{email.lead?.company ?? "Direct"}</p>
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
    </div>
  );
}
