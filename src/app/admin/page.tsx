import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Users, Mail, Search, Zap, TrendingUp, MessageSquare, BarChart2, FileText, Star } from "lucide-react";
import StatsCard from "@/components/StatsCard";
import EmailChart from "@/components/charts/EmailChart";
import { formatRelativeTime } from "@/lib/utils";

async function getAdminStats() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo  = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalUsers, totalLeads, totalEmails, activeCampaigns,
    recentSignups, recentEmails, newContacts,
    openTickets, totalTemplates, totalProposals,
    freePlanUsers, proPlanUsers, agencyPlanUsers,
    newUsersThisWeek, newLeadsThisWeek,
    crmStats, sourceStats, topNiches,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.lead.count(),
    prisma.sentEmail.count(),
    prisma.campaign.count({ where: { status: "RUNNING" } }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" }, take: 5,
      select: { id: true, name: true, email: true, plan: true, createdAt: true, niche: true },
    }),
    prisma.sentEmail.findMany({ where: { sentAt: { gte: thirtyDaysAgo } }, select: { sentAt: true } }),
    prisma.contactSubmission.count({ where: { resolved: false } }),
    prisma.supportTicket.count({ where: { status: "open" } }),
    prisma.template.count(),
    prisma.sentEmail.count({ where: { sentAt: { gte: thirtyDaysAgo } } }),
    prisma.user.count({ where: { plan: "free" } }),
    prisma.user.count({ where: { plan: "pro" } }),
    prisma.user.count({ where: { plan: "agency" } }),
    prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.lead.count({ where: { savedAt: { gte: sevenDaysAgo } } }),
    // CRM pipeline breakdown
    prisma.lead.groupBy({ by: ["status"], _count: { status: true } }),
    // Source breakdown
    prisma.lead.groupBy({ by: ["source"], _count: { source: true }, orderBy: { _count: { source: "desc" } } }),
    // Top niches
    prisma.lead.groupBy({ by: ["niche"], _count: { niche: true }, orderBy: { _count: { niche: "desc" } }, take: 5 }),
  ]);

  // Build 30-day email chart
  const dailyCounts: Record<string, number> = {};
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today); d.setDate(d.getDate() - i);
    const key = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    dailyCounts[key] = 0;
  }
  for (const e of recentEmails) {
    const key = new Date(e.sentAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    if (key in dailyCounts) dailyCounts[key] = (dailyCounts[key] ?? 0) + 1;
  }
  const chartData = Object.entries(dailyCounts).map(([date, count]) => ({ date, count }));

  const crmMap: Record<string, number> = {};
  for (const row of crmStats) crmMap[row.status] = row._count.status;

  return {
    totalUsers, totalLeads, totalEmails, activeCampaigns,
    recentSignups, chartData, newContacts, openTickets,
    totalTemplates, totalProposals,
    freePlanUsers, proPlanUsers, agencyPlanUsers,
    newUsersThisWeek, newLeadsThisWeek,
    crmMap, sourceStats, topNiches,
  };
}

const CRM_STAGES = [
  { key: "NEW",        label: "New",        color: "text-slate-400  bg-slate-500/10  border-slate-500/20"  },
  { key: "CONTACTED",  label: "Contacted",  color: "text-blue-400   bg-blue-500/10   border-blue-500/20"   },
  { key: "REPLIED",    label: "Replied",    color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" },
  { key: "FOLLOW_UP",  label: "Follow-Up",  color: "text-orange-400 bg-orange-500/10 border-orange-500/20" },
  { key: "WON",        label: "Won",        color: "text-green-400  bg-green-500/10  border-green-500/20"  },
  { key: "LOST",       label: "Lost",       color: "text-red-400    bg-red-500/10    border-red-500/20"    },
];

const SOURCE_COLORS: Record<string, string> = {
  remoteok:        "text-green-400",
  remotive:        "text-blue-400",
  weworkremotely:  "text-purple-400",
  arbeitnow:       "text-pink-400",
  reddit:          "text-orange-400",
};

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "ADMIN") redirect("/dashboard");

  const data = await getAdminStats();
  const totalPlanUsers = data.freePlanUsers + data.proPlanUsers + data.agencyPlanUsers || 1;

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Platform-wide overview and management.</p>
        </div>
        <div className="flex items-center gap-3">
          {data.openTickets > 0 && (
            <Link href="/admin/users" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-colors">
              <MessageSquare className="w-3.5 h-3.5" />
              {data.openTickets} open ticket{data.openTickets > 1 ? "s" : ""}
            </Link>
          )}
          {data.newContacts > 0 && (
            <Link href="/admin/contacts" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gold/10 border border-gold/20 text-gold text-sm font-medium hover:bg-gold/20 transition-colors">
              {data.newContacts} unread contact{data.newContacts > 1 ? "s" : ""}
            </Link>
          )}
        </div>
      </div>

      {/* Primary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Users"       value={data.totalUsers}                   icon={<Users    className="w-5 h-5" />} trend={data.newUsersThisWeek}  trendLabel="this week" />
        <StatsCard title="Saved Leads"       value={data.totalLeads.toLocaleString()}  icon={<Search   className="w-5 h-5" />} trend={data.newLeadsThisWeek}  trendLabel="this week" />
        <StatsCard title="Emails Sent"       value={data.totalEmails.toLocaleString()} icon={<Mail     className="w-5 h-5" />} variant="accent" trend={data.totalProposals} trendLabel="last 30d" />
        <StatsCard title="Active Campaigns"  value={data.activeCampaigns}              icon={<Zap      className="w-5 h-5" />} variant="gold" />
      </div>

      {/* Secondary Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-gradient-card border border-border rounded-2xl p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Templates</p>
          <p className="text-2xl font-bold text-foreground">{data.totalTemplates}</p>
        </div>
        <div className="bg-gradient-card border border-border rounded-2xl p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Open Tickets</p>
          <p className={`text-2xl font-bold ${data.openTickets > 0 ? "text-red-400" : "text-foreground"}`}>{data.openTickets}</p>
        </div>
        <div className="bg-gradient-card border border-border rounded-2xl p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Pro Users</p>
          <p className="text-2xl font-bold text-accent">{data.proPlanUsers}</p>
        </div>
        <div className="bg-gradient-card border border-border rounded-2xl p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Agency Users</p>
          <p className="text-2xl font-bold text-gold">{data.agencyPlanUsers}</p>
        </div>
      </div>

      {/* Chart + Recent Signups */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <EmailChart data={data.chartData} title="Platform Emails — Last 30 Days" />
        </div>

        <div className="bg-gradient-card border border-border rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h3 className="text-foreground font-semibold">Recent Signups</h3>
            <Link href="/admin/users" className="text-primary-light text-xs hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-border/50">
            {data.recentSignups.map((user: { id: string; name: string | null; email: string; plan: string | null; niche: string | null; createdAt: Date }) => (
              <div key={user.id} className="flex items-center gap-3 px-5 py-3">
                <div className="w-8 h-8 rounded-full bg-gradient-hero flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {user.name?.[0]?.toUpperCase() ?? "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-foreground text-sm font-medium truncate">{user.name ?? "Unnamed"}</p>
                  <p className="text-muted-foreground text-xs truncate">{user.email}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full border ${user.plan === "pro" ? "text-accent bg-accent/10 border-accent/20" : user.plan === "agency" ? "text-gold bg-gold/10 border-gold/20" : "text-muted-foreground bg-surface border-border"}`}>
                  {user.plan ?? "free"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Plan Breakdown + CRM Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Plan Breakdown */}
        <div className="bg-gradient-card border border-border rounded-2xl p-6">
          <h3 className="text-foreground font-semibold mb-5 flex items-center gap-2">
            <Star className="w-4 h-4 text-gold" /> Plan Distribution
          </h3>
          <div className="space-y-4">
            {[
              { label: "Free",   count: data.freePlanUsers,   color: "bg-slate-500"   },
              { label: "Pro",    count: data.proPlanUsers,    color: "bg-accent"      },
              { label: "Agency", count: data.agencyPlanUsers, color: "bg-gold"        },
            ].map(({ label, count, color }) => {
              const pct = Math.round((count / totalPlanUsers) * 100);
              return (
                <div key={label}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="text-foreground font-medium">{count} <span className="text-muted-foreground font-normal">({pct}%)</span></span>
                  </div>
                  <div className="h-2 rounded-full bg-surface overflow-hidden">
                    <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CRM Pipeline Breakdown */}
        <div className="bg-gradient-card border border-border rounded-2xl p-6">
          <h3 className="text-foreground font-semibold mb-5 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-primary-light" /> CRM Pipeline (All Users)
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {CRM_STAGES.map(({ key, label, color }) => (
              <div key={key} className={`rounded-xl p-3 border text-center ${color}`}>
                <p className="text-2xl font-bold">{(data.crmMap[key] ?? 0).toLocaleString()}</p>
                <p className="text-xs mt-0.5 opacity-80">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lead Sources + Top Niches */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Source Breakdown */}
        <div className="bg-gradient-card border border-border rounded-2xl p-6">
          <h3 className="text-foreground font-semibold mb-5 flex items-center gap-2">
            <Search className="w-4 h-4 text-accent" /> Saved Leads by Source
          </h3>
          {data.sourceStats.length > 0 ? (
            <div className="space-y-3">
              {data.sourceStats.map((row: { source: string | null; _count: { source: number } | Record<string, number> }) => {
                const src = row.source ?? "unknown";
                const count = (row._count as { source: number } | null)?.source ?? 0;
                const pct = Math.round((count / data.totalLeads) * 100);
                return (
                  <div key={src} className="flex items-center gap-3">
                    <span className={`text-sm font-medium w-28 capitalize ${SOURCE_COLORS[src] ?? "text-muted-foreground"}`}>{src}</span>
                    <div className="flex-1 h-2 rounded-full bg-surface overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-hero" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-sm text-muted-foreground w-12 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No leads saved yet.</p>
          )}
        </div>

        {/* Top Niches */}
        <div className="bg-gradient-card border border-border rounded-2xl p-6">
          <h3 className="text-foreground font-semibold mb-5 flex items-center gap-2">
            <FileText className="w-4 h-4 text-gold" /> Top 5 Niches by Saved Leads
          </h3>
          {data.topNiches.length > 0 ? (
            <div className="space-y-3">
              {data.topNiches.map((row: { niche: string | null; _count: { niche: number } | Record<string, number> }, i: number) => {
                const niche = row.niche ?? "Other";
                const count = (row._count as { niche: number } | null)?.niche ?? 0;
                const pct = Math.round((count / data.totalLeads) * 100);
                return (
                  <div key={niche} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-muted-foreground w-4">{i + 1}</span>
                    <span className="text-sm font-medium text-foreground flex-1 truncate capitalize">{niche.replace(/-/g, " ")}</span>
                    <div className="w-24 h-2 rounded-full bg-surface overflow-hidden">
                      <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-sm text-muted-foreground w-8 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No niche data yet.</p>
          )}
        </div>
      </div>

      {/* Quick Nav */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Manage Users",    href: "/admin/users",     icon: Users,          color: "text-primary-light bg-primary/10 border-primary/20"    },
          { label: "All Emails",      href: "/admin/emails",    icon: Mail,           color: "text-accent bg-accent/10 border-accent/20"             },
          { label: "Blog CMS",        href: "/admin/blog",      icon: TrendingUp,     color: "text-gold bg-gold/10 border-gold/20"                   },
          { label: "Contacts",        href: "/admin/contacts",  icon: MessageSquare,  color: "text-blue-400 bg-blue-500/10 border-blue-500/20"       },
        ].map(({ label, href, icon: Icon, color }) => (
          <Link key={href} href={href} className={`flex flex-col items-center gap-2 p-5 rounded-2xl border text-center transition-all hover:scale-105 ${color}`}>
            <Icon className="w-6 h-6" />
            <span className="text-sm font-medium text-foreground">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
