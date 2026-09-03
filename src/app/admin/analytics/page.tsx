export const dynamic = 'force-dynamic';

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import EmailChart from "@/components/charts/EmailChart";
import NichePieChart from "@/components/charts/NichePieChart";
import StatsCard from "@/components/StatsCard";
import { Users, Mail, Search, Zap, TrendingUp, BarChart2 } from "lucide-react";

const SOURCE_COLORS: Record<string, string> = {
  remoteok:       "bg-green-500",
  remotive:       "bg-blue-500",
  weworkremotely: "bg-purple-500",
  arbeitnow:      "bg-pink-500",
  reddit:         "bg-orange-500",
  greenhouse:     "bg-emerald-500",
  lever:          "bg-blue-500",
  ashby:          "bg-fuchsia-500",
  remotefirstjobs:"bg-teal-500",
  web3jobsradar:  "bg-amber-500",
};

const SOURCE_LABELS: Record<string, string> = {
  remoteok:       "RemoteOK",
  remotive:       "Remotive",
  weworkremotely: "WeWorkRemotely",
  arbeitnow:      "Arbeitnow",
  reddit:         "Reddit",
  greenhouse:     "Verified Hiring A",
  lever:          "Verified Hiring B",
  ashby:          "Verified Hiring C",
  remotefirstjobs:"Remote First Jobs",
  web3jobsradar:  "Web3 Jobs Radar",
};

const CRM_STAGES = [
  { key: "NEW",       label: "New",       color: "bg-slate-500"   },
  { key: "CONTACTED", label: "Contacted", color: "bg-blue-500"    },
  { key: "REPLIED",   label: "Replied",   color: "bg-yellow-500"  },
  { key: "FOLLOW_UP", label: "Follow-Up", color: "bg-orange-500"  },
  { key: "WON",       label: "Won",       color: "bg-green-500"   },
  { key: "LOST",      label: "Lost",      color: "bg-red-500"     },
];

export default async function AdminAnalyticsPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "ADMIN") redirect("/dashboard");

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo  = new Date(Date.now() - 7  * 24 * 60 * 60 * 1000);

  const [
    totalUsers, totalLeads, totalEmails, activeCampaigns,
    recentEmails, recentUsers, nicheStats, sourceStats, crmStats,
    qualityHigh, qualityMed,
    newUsers7d, newLeads7d, newEmails7d,
    freePlanUsers, proPlanUsers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.lead.count(),
    prisma.sentEmail.count(),
    prisma.campaign.count({ where: { status: "RUNNING" } }),
    prisma.sentEmail.findMany({ where: { sentAt: { gte: thirtyDaysAgo } }, select: { sentAt: true } }),
    prisma.user.findMany({ where: { createdAt: { gte: thirtyDaysAgo } }, select: { createdAt: true } }),
    prisma.lead.groupBy({ by: ["niche"], _count: { niche: true }, orderBy: { _count: { niche: "desc" } }, take: 8 }),
    prisma.lead.groupBy({ by: ["source"], _count: { source: true }, orderBy: { _count: { source: "desc" } } }),
    prisma.lead.groupBy({ by: ["status"], _count: { status: true } }),
    prisma.lead.count({ where: { qualityScore: { gte: 70 } } }),
    prisma.lead.count({ where: { qualityScore: { gte: 40, lt: 70 } } }),
    prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.lead.count({ where: { savedAt: { gte: sevenDaysAgo } } }),
    prisma.sentEmail.count({ where: { sentAt: { gte: sevenDaysAgo } } }),
    prisma.user.count({ where: { plan: "free" } }),
    prisma.user.count({ where: { plan: "pro" } }),
  ]);

  function buildDailyData(dates: Date[]) {
    const counts: Record<string, number> = {};
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today); d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      counts[key] = 0;
    }
    for (const date of dates) {
      const key = new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      if (key in counts) counts[key] = (counts[key] ?? 0) + 1;
    }
    return Object.entries(counts).map(([date, count]) => ({ date, count }));
  }

  const emailChartData  = buildDailyData(recentEmails.map((e) => e.sentAt));
  const signupChartData = buildDailyData(recentUsers.map((u) => u.createdAt));
  const pieData = nicheStats.map((n) => ({ name: (n.niche ?? "Other").replace(/-/g, " "), value: n._count.niche }));

  const crmMap: Record<string, number> = {};
  for (const row of crmStats) crmMap[row.status] = row._count.status;

  const qualityLow = totalLeads - qualityHigh - qualityMed;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Platform Analytics</h1>
        <p className="text-muted-foreground mt-1">Platform-wide usage, lead quality, and growth metrics.</p>
      </div>

      {/* Primary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Users"      value={totalUsers}                  icon={<Users  className="w-5 h-5" />} trend={newUsers7d}  trendLabel="last 7d" />
        <StatsCard title="Saved Leads"      value={totalLeads.toLocaleString()} icon={<Search className="w-5 h-5" />} trend={newLeads7d}  trendLabel="last 7d" />
        <StatsCard title="Outreach"         value={totalEmails.toLocaleString()}icon={<Mail   className="w-5 h-5" />} variant="accent" trend={newEmails7d} trendLabel="last 7d" />
        <StatsCard title="Live Campaigns"   value={activeCampaigns}             icon={<Zap    className="w-5 h-5" />} variant="gold" />
      </div>

      {/* Growth Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EmailChart data={emailChartData}  title="Outreach — Last 30 Days" />
        <EmailChart data={signupChartData} title="New Signups — Last 30 Days" />
      </div>

      {/* Lead Quality Breakdown */}
      <div className="bg-gradient-card border border-border rounded-2xl p-6">
        <h3 className="text-foreground font-semibold mb-5 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-accent" /> Lead Quality Distribution
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "High Quality",   sublabel: "Score ≥ 70", count: qualityHigh, color: "text-green-400 bg-green-500/10 border-green-500/20" },
            { label: "Medium Quality", sublabel: "Score 40–69", count: qualityMed, color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" },
            { label: "Basic",          sublabel: "Score < 40",  count: Math.max(0, qualityLow), color: "text-slate-400 bg-slate-500/10 border-slate-500/20" },
          ].map(({ label, sublabel, count, color }) => (
            <div key={label} className={`rounded-xl p-4 border text-center ${color}`}>
              <p className="text-3xl font-bold">{count.toLocaleString()}</p>
              <p className="text-sm font-medium mt-1">{label}</p>
              <p className="text-xs opacity-70 mt-0.5">{sublabel}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Source Breakdown + CRM Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gradient-card border border-border rounded-2xl p-6">
          <h3 className="text-foreground font-semibold mb-5 flex items-center gap-2">
            <Search className="w-4 h-4 text-primary-light" /> Leads by Source
          </h3>
          {sourceStats.length > 0 ? (
            <div className="space-y-3">
              {sourceStats.map((row) => {
                const src = row.source ?? "unknown";
                const count = (row._count as { source: number } | null)?.source ?? 0;
                const pct = totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0;
                return (
                  <div key={src} className="flex items-center gap-3">
                    <span className="text-sm font-medium text-foreground w-36 truncate">{SOURCE_LABELS[src] ?? src}</span>
                    <div className="flex-1 h-2 rounded-full bg-surface overflow-hidden">
                      <div className={`h-full rounded-full ${SOURCE_COLORS[src] ?? "bg-slate-500"}`} style={{ width: `${pct}%` }} />
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

        <div className="bg-gradient-card border border-border rounded-2xl p-6">
          <h3 className="text-foreground font-semibold mb-5 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-accent" /> CRM Pipeline Status
          </h3>
          <div className="space-y-3">
            {CRM_STAGES.map(({ key, label, color }) => {
              const count = crmMap[key] ?? 0;
              const pct = totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0;
              return (
                <div key={key} className="flex items-center gap-3">
                  <span className="text-sm font-medium text-foreground w-24">{label}</span>
                  <div className="flex-1 h-2 rounded-full bg-surface overflow-hidden">
                    <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-sm text-muted-foreground w-12 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Niche Pie + Plan Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {pieData.length > 0 ? (
            <NichePieChart data={pieData} />
          ) : (
            <div className="bg-gradient-card border border-border rounded-2xl p-6 flex items-center justify-center h-64">
              <p className="text-muted-foreground text-sm">No niche data yet</p>
            </div>
          )}
        </div>

        <div className="bg-gradient-card border border-border rounded-2xl p-6">
          <h3 className="text-foreground font-semibold mb-5">Plan Breakdown</h3>
          <div className="space-y-4">
            {[
              { label: "Free",   count: freePlanUsers, color: "bg-slate-500", textColor: "text-muted-foreground" },
              { label: "Pro",    count: proPlanUsers,  color: "bg-accent",    textColor: "text-accent"           },
              { label: "Agency", count: totalUsers - freePlanUsers - proPlanUsers, color: "bg-gold", textColor: "text-gold" },
            ].map(({ label, count, color, textColor }) => {
              const pct = totalUsers > 0 ? Math.round((count / totalUsers) * 100) : 0;
              return (
                <div key={label}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className={`font-medium ${textColor}`}>{label}</span>
                    <span className="text-foreground">{count} <span className="text-muted-foreground">({pct}%)</span></span>
                  </div>
                  <div className="h-2 rounded-full bg-surface overflow-hidden">
                    <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
            <div className="pt-3 border-t border-border">
              <p className="text-xs text-muted-foreground">Conversion rate (free → paid)</p>
              <p className="text-xl font-bold text-foreground mt-1">
                {totalUsers > 0 ? Math.round(((proPlanUsers + totalUsers - freePlanUsers - proPlanUsers) / totalUsers) * 100) : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
