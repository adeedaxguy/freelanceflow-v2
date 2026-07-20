export const dynamic = 'force-dynamic';

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  Users, Mail, Bookmark, BarChart2, Shield, Activity, TrendingUp,
  Settings, MessageSquare, DollarSign, Megaphone, UserCheck, FileText,
  ArrowUpRight, Clock, Zap,
} from "lucide-react";

const PLAN_PRICE: Record<string, number> = { free: 0, pro: 29, agency: 79 };

async function getAdminStats() {
  const now = new Date();
  const days7  = new Date(now.getTime() - 7  * 86400000);
  const days30 = new Date(now.getTime() - 30 * 86400000);

  const [
    totalUsers, newUsers7d, newUsers30d,
    totalLeads, newLeads7d,
    totalEmails, newEmails7d,
    planDist,
    recentUsers,
    openTickets,
    totalCampaigns,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: days7 } } }),
    prisma.user.count({ where: { createdAt: { gte: days30 } } }),
    prisma.lead.count(),
    prisma.lead.count({ where: { savedAt: { gte: days7 } } }),
    prisma.sentEmail.count(),
    prisma.sentEmail.count({ where: { sentAt: { gte: days7 } } }),
    (prisma as any).user.groupBy({ by: ["plan"], _count: { _all: true } }) as Promise<Array<{ plan: string; _count: { _all: number } }>>,
    prisma.user.findMany({
      orderBy: { createdAt: "desc" }, take: 8,
      select: { id: true, name: true, email: true, plan: true, role: true, createdAt: true, suspended: true, niche: true },
    }),
    prisma.supportTicket.count({ where: { status: { notIn: ['resolved', 'closed'] } } }),
    prisma.campaign.count(),
  ]);

  const planMap: Record<string, number> = {};
  for (const p of planDist) planMap[p.plan] = p._count._all;

  const mrr = Object.entries(planMap).reduce((s, [plan, cnt]) => s + (PLAN_PRICE[plan] ?? 0) * cnt, 0);
  const proUsers   = planMap.pro    ?? 0;
  const agencyUsers = planMap.agency ?? 0;
  const freeUsers  = planMap.free   ?? 0;
  const paidUsers  = proUsers + agencyUsers;
  const convRate   = totalUsers > 0 ? Math.round((paidUsers / totalUsers) * 100) : 0;

  return {
    totalUsers, newUsers7d, newUsers30d,
    totalLeads, newLeads7d,
    totalEmails, newEmails7d,
    mrr, paidUsers, freeUsers, proUsers, agencyUsers, convRate,
    recentUsers,
    openTickets: openTickets ?? 0,
    totalCampaigns,
  };
}

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  const s = await getAdminStats();

  const kpis = [
    {
      label: "Total Users",    value: s.totalUsers.toLocaleString(),
      sub: `+${s.newUsers7d} this week`, icon: Users, color: "text-primary-light", bg: "bg-primary/10",
      href: "/admin/users",
    },
    {
      label: "MRR",            value: `$${s.mrr.toLocaleString()}`,
      sub: `${s.convRate}% conversion`, icon: DollarSign, color: "text-accent", bg: "bg-accent/10",
      href: "/admin/revenue",
    },
    {
      label: "Leads Saved",    value: s.totalLeads.toLocaleString(),
      sub: `+${s.newLeads7d} this week`, icon: Bookmark, color: "text-blue-400", bg: "bg-blue-500/10",
      href: "/admin/analytics",
    },
    {
      label: "Outreach",       value: s.totalEmails.toLocaleString(),
      sub: `+${s.newEmails7d} this week`, icon: Mail, color: "text-green-400", bg: "bg-green-500/10",
      href: "/admin/analytics",
    },
    {
      label: "Open Tickets",   value: s.openTickets.toString(),
      sub: "Awaiting response", icon: MessageSquare, color: "text-orange-400", bg: "bg-orange-500/10",
      href: "/admin/support",
    },
    {
      label: "Campaigns",      value: s.totalCampaigns.toLocaleString(),
      sub: "Platform-wide", icon: Megaphone, color: "text-pink-400", bg: "bg-pink-500/10",
      href: "/admin/analytics",
    },
    {
      label: "Paid Users",     value: s.paidUsers.toString(),
      sub: `${s.proUsers} Pro · ${s.agencyUsers} Agency`, icon: UserCheck, color: "text-yellow-400", bg: "bg-yellow-500/10",
      href: "/admin/revenue",
    },
    {
      label: "New Signups (30d)", value: s.newUsers30d.toString(),
      sub: "Last 30 days", icon: TrendingUp, color: "text-purple-400", bg: "bg-purple-500/10",
      href: "/admin/users",
    },
  ];

  const quickNav = [
    { label: "User Management",  href: "/admin/users",     icon: Users,        desc: "Suspend, promote, change plans" },
    { label: "Staff & Managers", href: "/admin/managers",  icon: UserCheck,    desc: "Assign admin & manager roles" },
    { label: "Revenue / MRR",    href: "/admin/revenue",   icon: DollarSign,   desc: "MRR, ARR, plan breakdown" },
    { label: "Support Tickets",  href: "/admin/support",   icon: MessageSquare,desc: "Respond to user requests" },
    { label: "Broadcast",        href: "/admin/broadcast", icon: Megaphone,    desc: "Email all users or segments" },
    { label: "Analytics",        href: "/admin/analytics", icon: BarChart2,    desc: "Growth, usage, funnels" },
    { label: "Blog & Content",   href: "/admin/blog",      icon: FileText,     desc: "Manage blog posts" },
    { label: "Platform Settings",href: "/admin/settings",  icon: Settings,     desc: "Configure platform config" },
    { label: "Audit Log",        href: "/admin/audit",     icon: Shield,       desc: "Admin action history" },
  ];

  return (
    <div className="w-full max-w-full overflow-hidden p-4 sm:p-6 lg:p-8 space-y-8">

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-5 h-5 text-primary-light" />
            <span className="text-xs font-bold uppercase tracking-wider text-primary-light">Master Admin Panel</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Overview</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Welcome, {session?.user?.name ?? "Admin"}. Full platform control.
          </p>
        </div>
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end sm:gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-lg">
            <Activity className="w-3.5 h-3.5 text-green-400" />
            <span className="text-xs font-medium text-green-400">System Online</span>
          </div>
          <Link href="/admin/broadcast"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-light transition-all">
            <Megaphone className="w-4 h-4" /> Broadcast
          </Link>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-4 gap-4">
        {kpis.map(c => {
          const Icon = c.icon;
          return (
            <Link key={c.label} href={c.href}
              className="min-w-0 bg-gradient-card border border-border rounded-2xl p-5 space-y-3 hover:border-primary/30 transition-all group">
              <div className="flex items-center justify-between">
                <span className="min-w-0 truncate text-xs font-medium text-muted-foreground uppercase tracking-wider">{c.label}</span>
                <div className={`w-8 h-8 rounded-lg ${c.bg} flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${c.color}`} />
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-foreground">{c.value}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3 text-accent opacity-60" />{c.sub}
              </p>
            </Link>
          );
        })}
      </div>

      {/* Plan distribution bar */}
      <div className="bg-gradient-card border border-border rounded-2xl p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
          <h3 className="text-foreground font-semibold">Plan Distribution</h3>
          <Link href="/admin/revenue" className="text-xs text-primary-light hover:underline flex items-center gap-1">
            Revenue details <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="h-3 rounded-full bg-muted overflow-hidden flex">
          {s.totalUsers > 0 && (
            <>
              <div className="h-full bg-slate-500 transition-all" style={{ width: `${(s.freeUsers / s.totalUsers) * 100}%` }} title={`Free: ${s.freeUsers}`} />
              <div className="h-full bg-primary transition-all" style={{ width: `${(s.proUsers / s.totalUsers) * 100}%` }} title={`Pro: ${s.proUsers}`} />
              <div className="h-full bg-accent transition-all" style={{ width: `${(s.agencyUsers / s.totalUsers) * 100}%` }} title={`Agency: ${s.agencyUsers}`} />
            </>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-3 text-xs">
          {[
            { label: "Free",   count: s.freeUsers,   color: "bg-slate-500" },
            { label: "Pro",    count: s.proUsers,    color: "bg-primary" },
            { label: "Agency", count: s.agencyUsers, color: "bg-accent" },
          ].map(({ label, count, color }) => (
            <span key={label} className="flex items-center gap-1.5 text-muted-foreground">
              <span className={`w-2 h-2 rounded-full ${color}`} />
              {label} <strong className="text-foreground">{count}</strong>
            </span>
          ))}
          <span className="w-full text-muted-foreground sm:ml-auto sm:w-auto">
            Conversion: <strong className="text-accent">{s.convRate}%</strong>
          </span>
        </div>
      </div>

      {/* Quick Nav + Recent Signups */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Quick nav */}
        <div className="bg-gradient-card border border-border rounded-2xl p-5">
          <h3 className="text-foreground font-semibold mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4 text-accent" /> Quick Navigation
          </h3>
          <div className="space-y-1">
            {quickNav.map(item => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all group">
                  <Icon className="w-4 h-4 text-primary-light flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium text-foreground text-xs">{item.label}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{item.desc}</p>
                  </div>
                  <ArrowUpRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent signups */}
        <div className="lg:col-span-2 bg-gradient-card border border-border rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h3 className="text-foreground font-semibold">Recent Signups</h3>
            <Link href="/admin/users" className="text-primary-light text-xs hover:underline flex items-center gap-1">
              View all <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-border/40">
            {s.recentUsers.map(u => (
              <div key={u.id} className="flex flex-col gap-2 px-5 py-3 hover:bg-primary/5 transition-colors sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">{u.name ?? "—"}</p>
                  <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:ml-4 sm:flex-shrink-0 sm:justify-end">
                  {u.niche && (
                    <span className="hidden sm:block text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full truncate max-w-[80px]">
                      {u.niche.replace(/-/g, " ")}
                    </span>
                  )}
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                    u.plan === "pro"    ? "bg-primary/15 text-primary-light border-primary/30" :
                    u.plan === "agency" ? "bg-accent/15 text-accent border-accent/30" :
                    "bg-muted text-muted-foreground border-border"
                  }`}>{u.plan}</span>
                  <span className={`flex items-center gap-1 text-[10px] font-medium ${u.suspended ? "text-red-400" : "text-green-400"}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${u.suspended ? "bg-red-400" : "bg-green-400"}`} />
                    {u.suspended ? "Suspended" : "Active"}
                  </span>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                    <Clock className="w-2.5 h-2.5" />
                    {new Date(u.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
