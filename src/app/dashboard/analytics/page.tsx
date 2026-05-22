"use client";

import { useState, useEffect } from "react";
import { BarChart2, TrendingUp, Mail, Users } from "lucide-react";
import EmailChart from "@/components/charts/EmailChart";
import NichePieChart from "@/components/charts/NichePieChart";
import StatsCard from "@/components/StatsCard";
import { StatsCardSkeleton } from "@/components/LoadingSkeleton";

interface DashStats { leadsFound: number; emailsSent: number; openRate: number; responses: number; emailsThisMonth: { date: string; count: number }[]; }

const NICHE_MOCK = [
  { name: "Web Dev", value: 34 }, { name: "Design", value: 22 }, { name: "SEO", value: 18 },
  { name: "Copywriting", value: 14 }, { name: "Other", value: 12 },
];

const BEST_TIMES = [
  { time: "9–10 AM", rate: "24%", label: "Best" }, { time: "10–11 AM", rate: "21%", label: "Great" },
  { time: "2–3 PM", rate: "18%", label: "Good" }, { time: "11 AM–12 PM", rate: "15%", label: "Average" },
];

export default function AnalyticsPage() {
  const [stats, setStats] = useState<DashStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then(r => r.json())
      .then((d: DashStats) => { setStats(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground mt-1">Track your outreach performance and optimize for better results.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? [...Array(4)].map((_, i) => <StatsCardSkeleton key={i} />) : (
          <>
            <StatsCard title="Leads Found" value={stats?.leadsFound ?? 0} icon={<Users className="w-5 h-5" />} trend={12} trendLabel="vs last month" />
            <StatsCard title="Emails Sent" value={stats?.emailsSent ?? 0} icon={<Mail className="w-5 h-5" />} trend={8} trendLabel="vs last month" />
            <StatsCard title="Open Rate" value={`${stats?.openRate ?? 0}%`} icon={<TrendingUp className="w-5 h-5" />} variant="accent" trend={3} trendLabel="vs last month" />
            <StatsCard title="Responses" value={stats?.responses ?? 0} icon={<BarChart2 className="w-5 h-5" />} variant="gold" />
          </>
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {stats ? <EmailChart data={stats.emailsThisMonth} title="Emails Sent — Last 30 Days" /> : <div className="h-72 bg-gradient-card border border-border rounded-2xl animate-pulse" />}
        </div>
        <NichePieChart data={NICHE_MOCK} />
      </div>

      {/* Best Send Times */}
      <div className="bg-gradient-card border border-border rounded-2xl p-6">
        <h3 className="text-foreground font-semibold mb-4">Best Times to Send</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {BEST_TIMES.map((t) => (
            <div key={t.time} className="text-center p-4 bg-background rounded-xl border border-border">
              <p className="text-foreground font-bold text-lg">{t.rate}</p>
              <p className="text-muted-foreground text-xs mt-0.5">{t.time}</p>
              <span className={`text-xs font-medium mt-1 inline-block ${t.label === "Best" ? "text-accent" : t.label === "Great" ? "text-primary-light" : "text-muted-foreground"}`}>{t.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Niches Table */}
      <div className="bg-gradient-card border border-border rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="text-foreground font-semibold">Performance by Niche</h3>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-background/30">
              {["Niche", "Leads", "Emails", "Replies", "Rate"].map(h => (
                <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { niche: "Web Development", leads: 34, emails: 28, replies: 6, rate: "21%" },
              { niche: "UI/UX Design", leads: 22, emails: 18, replies: 4, rate: "22%" },
              { niche: "SEO & Content", leads: 18, emails: 15, replies: 2, rate: "13%" },
              { niche: "Copywriting", leads: 14, emails: 12, replies: 3, rate: "25%" },
            ].map((row) => (
              <tr key={row.niche} className="border-b border-border/50 last:border-0 hover:bg-primary/5 transition-colors">
                <td className="px-6 py-3 text-foreground text-sm">{row.niche}</td>
                <td className="px-6 py-3 text-muted-foreground text-sm">{row.leads}</td>
                <td className="px-6 py-3 text-muted-foreground text-sm">{row.emails}</td>
                <td className="px-6 py-3 text-muted-foreground text-sm">{row.replies}</td>
                <td className="px-6 py-3"><span className="text-accent font-semibold text-sm">{row.rate}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
