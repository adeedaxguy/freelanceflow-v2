"use client";

import { useState, useEffect } from "react";
import { DollarSign, TrendingUp, Users, ArrowUpRight, RefreshCw, Zap, Crown, Star } from "lucide-react";

interface RevenueData {
  mrr: number; arr: number; paidUsers: number; totalUsers: number; convRate: number;
  planDist: Record<string, number>;
  monthlyData: Array<{ label: string; mrr: number }>;
  planPrices: Record<string, number>;
}

export default function AdminRevenuePage() {
  const [data, setData]     = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/revenue")
      .then(r => r.json())
      .then((d: RevenueData) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
    </div>
  );

  if (!data) return (
    <div className="p-4 sm:p-8 text-muted-foreground">Failed to load revenue data.</div>
  );

  const maxMrr = Math.max(...data.monthlyData.map(m => m.mrr), 1);
  const plans = [
    { key: "free",   label: "Free",   price: 0,  icon: Star,   color: "text-slate-400",  bg: "bg-slate-500/10 border-slate-500/20"  },
    { key: "pro",    label: "Pro",    price: 29, icon: Zap,    color: "text-primary-light", bg: "bg-primary/10 border-primary/20"   },
    { key: "agency", label: "Agency", price: 79, icon: Crown,  color: "text-accent",      bg: "bg-accent/10 border-accent/20"      },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-5xl">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Revenue & MRR</h1>
        <p className="text-muted-foreground mt-1 text-sm">Monthly recurring revenue, plan breakdown, and conversion metrics.</p>
      </div>

      {/* Primary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "MRR",         value: `$${data.mrr.toLocaleString()}`,     icon: DollarSign,  color: "text-accent",        bg: "bg-accent/10",   sub: "Monthly Recurring Revenue" },
          { label: "ARR",         value: `$${data.arr.toLocaleString()}`,     icon: TrendingUp,  color: "text-green-400",     bg: "bg-green-500/10",sub: "Annual Run Rate" },
          { label: "Paid Users",  value: data.paidUsers.toString(),           icon: Users,       color: "text-primary-light", bg: "bg-primary/10",  sub: "Pro + Agency subscribers" },
          { label: "Conversion",  value: `${data.convRate}%`,                 icon: ArrowUpRight,color: "text-yellow-400",    bg: "bg-yellow-500/10",sub: "Free → Paid rate" },
        ].map(c => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="bg-gradient-card border border-border rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{c.label}</span>
                <div className={`w-8 h-8 rounded-lg ${c.bg} flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${c.color}`} />
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-foreground">{c.value}</div>
              <p className="text-xs text-muted-foreground">{c.sub}</p>
            </div>
          );
        })}
      </div>

      {/* MRR chart + plan breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* MRR over time bar chart */}
        <div className="lg:col-span-2 bg-gradient-card border border-border rounded-2xl p-6">
          <h3 className="text-foreground font-semibold mb-6">MRR Trend (6 Months)</h3>
          <div className="flex items-end gap-3 h-40">
            {data.monthlyData.map((m, i) => {
              const pct = maxMrr > 0 ? (m.mrr / maxMrr) * 100 : 0;
              const isLast = i === data.monthlyData.length - 1;
              return (
                <div key={m.label} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-[10px] text-muted-foreground font-medium">${m.mrr}</span>
                  <div className="w-full flex items-end justify-center" style={{ height: "100px" }}>
                    <div
                      className={`w-full rounded-t-lg transition-all duration-500 ${isLast ? "bg-gradient-hero" : "bg-primary/40"}`}
                      style={{ height: `${Math.max(pct, 4)}%` }}
                      title={`${m.label}: $${m.mrr}`}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground text-center leading-tight">{m.label}</span>
                </div>
              );
            })}
          </div>
          {data.mrr === 0 && (
            <p className="text-center text-sm text-muted-foreground mt-4">
              No paid users yet — MRR will grow as users upgrade.
            </p>
          )}
        </div>

        {/* Plan breakdown */}
        <div className="bg-gradient-card border border-border rounded-2xl p-6 space-y-4">
          <h3 className="text-foreground font-semibold">Plan Distribution</h3>
          {plans.map(({ key, label, price, icon: Icon, color, bg }) => {
            const count = data.planDist[key] ?? 0;
            const revenue = count * price;
            const pct = data.totalUsers > 0 ? Math.round((count / data.totalUsers) * 100) : 0;
            return (
              <div key={key} className={`rounded-xl border p-4 ${bg}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${color}`} />
                    <span className={`text-sm font-semibold ${color}`}>{label}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">${price}/mo</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{count} users ({pct}%)</span>
                  <span className="font-semibold text-foreground">${revenue.toLocaleString()}/mo</span>
                </div>
              </div>
            );
          })}
          <div className="pt-3 border-t border-border">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total MRR</span>
              <span className="font-bold text-foreground">${data.mrr.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-muted-foreground">Projected ARR</span>
              <span className="font-bold text-accent">${data.arr.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue milestones */}
      <div className="bg-gradient-card border border-border rounded-2xl p-6">
        <h3 className="text-foreground font-semibold mb-5">Revenue Milestones</h3>
        <div className="space-y-4">
          {[
            { label: "$1K MRR",   target: 1000,   desc: "Ramen profitable" },
            { label: "$5K MRR",   target: 5000,   desc: "First hire possible" },
            { label: "$10K MRR",  target: 10000,  desc: "Sustainable business" },
            { label: "$50K MRR",  target: 50000,  desc: "Series A territory" },
          ].map(({ label, target, desc }) => {
            const pct = Math.min(100, Math.round((data.mrr / target) * 100));
            const done = pct >= 100;
            return (
              <div key={label}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className={`font-medium ${done ? "text-accent" : "text-foreground"}`}>
                    {done ? "✅ " : ""}{label}
                  </span>
                  <span className="text-muted-foreground text-xs">{desc} · {pct}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${done ? "bg-accent" : "bg-primary/60"}`}
                    style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
