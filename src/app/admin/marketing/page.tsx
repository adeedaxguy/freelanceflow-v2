"use client";

import { useState, useEffect } from "react";
import { Download, Users, MessageCircle, Share2, Bell, RefreshCw, Search } from "lucide-react";

interface Subscriber {
  id: string;
  name: string | null;
  email: string;
  whatsapp: string | null;
  marketingConsent: boolean;
  bonusClaimed: string | null;
  bonusLeads: number;
  referralCode: string | null;
  referredBy: string | null;
  createdAt: string;
  plan: string;
}

interface Stats {
  total: number;
  withWhatsapp: number;
  withConsent: number;
  claimedShare: number;
  claimedSubscribe: number;
  totalBonusLeads: number;
}

export default function AdminMarketingPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [stats,       setStats]       = useState<Stats | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState("");

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/marketing");
      const data = await res.json() as { subscribers: Subscriber[]; stats: Stats };
      setSubscribers(data.subscribers ?? []);
      setStats(data.stats ?? null);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }

  useEffect(() => { void load(); }, []);

  function exportCSV() {
    const rows = [
      ["Name", "Email", "WhatsApp", "Plan", "Bonus Leads", "Claimed", "Referral Code", "Joined"].join(","),
      ...filtered.map(s => [
        s.name ?? "",
        s.email,
        s.whatsapp ?? "",
        s.plan,
        s.bonusLeads,
        JSON.parse(s.bonusClaimed ?? "[]").join("+"),
        s.referralCode ?? "",
        new Date(s.createdAt).toLocaleDateString(),
      ].map(v => `"${v}"`).join(",")),
    ];
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `icloseleads-marketing-${new Date().toISOString().slice(0,10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  }

  const filtered = subscribers.filter(s =>
    !search || s.email.includes(search) || s.name?.toLowerCase().includes(search.toLowerCase()) || (s.whatsapp ?? "").includes(search)
  );

  return (
    <div className="p-6 lg:p-8 max-w-7xl">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Marketing Subscribers</h1>
          <p className="text-muted-foreground text-sm mt-1">Users who claimed bonus leads — your warm outreach list</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => void load()} disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-muted-foreground hover:text-foreground text-sm transition-colors">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-light transition-colors">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {[
            { icon: <Users className="w-4 h-4 text-primary-light" />,     label: "Total",           val: stats.total },
            { icon: <MessageCircle className="w-4 h-4 text-accent" />,    label: "WhatsApp",        val: stats.withWhatsapp },
            { icon: <Bell className="w-4 h-4 text-primary-light" />,      label: "Email Consent",   val: stats.withConsent },
            { icon: <Share2 className="w-4 h-4 text-gold" />,             label: "Shared",          val: stats.claimedShare },
            { icon: <Bell className="w-4 h-4 text-accent" />,             label: "Subscribed",      val: stats.claimedSubscribe },
            { icon: <span className="text-xs font-bold text-primary-light">🎁</span>, label: "Bonus Leads", val: stats.totalBonusLeads },
          ].map(s => (
            <div key={s.label} className="bg-surface border border-border rounded-xl p-4 text-center">
              <div className="flex justify-center mb-1">{s.icon}</div>
              <div className="text-xl font-extrabold text-foreground">{s.val}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search email, name, or WhatsApp..."
          className="w-full pl-9 pr-4 py-2.5 bg-surface border border-border rounded-xl text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-primary/60 transition-colors" />
      </div>

      {/* Table */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/20">
                {["Name", "Email", "WhatsApp", "Plan", "Bonus", "Claimed Via", "Referral Code", "Joined"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="text-center py-12 text-muted-foreground">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12 text-muted-foreground">No subscribers yet</td></tr>
              ) : filtered.map(s => {
                const claimed: string[] = JSON.parse(s.bonusClaimed ?? "[]");
                return (
                  <tr key={s.id} className="border-b border-border/60 hover:bg-muted/10 transition-colors">
                    <td className="px-4 py-3 text-foreground font-medium">{s.name ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{s.email}</td>
                    <td className="px-4 py-3">
                      {s.whatsapp
                        ? <a href={`https://wa.me/${s.whatsapp.replace(/\D/g,"")}`} target="_blank" rel="noopener noreferrer"
                            className="text-accent hover:underline flex items-center gap-1">
                            <MessageCircle className="w-3.5 h-3.5" />{s.whatsapp}
                          </a>
                        : <span className="text-muted-foreground/40">—</span>
                      }
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${s.plan === "agency" ? "bg-gold/10 text-gold" : s.plan === "pro" ? "bg-primary/10 text-primary-light" : "bg-muted/30 text-muted-foreground"}`}>
                        {s.plan}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-accent font-semibold">+{s.bonusLeads}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 flex-wrap">
                        {claimed.map(c => (
                          <span key={c} className={`px-2 py-0.5 rounded-full text-xs font-medium ${c === "share" ? "bg-gold/10 text-gold" : "bg-primary/10 text-primary-light"}`}>
                            {c}
                          </span>
                        ))}
                        {claimed.length === 0 && <span className="text-muted-foreground/40 text-xs">—</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {s.referralCode
                        ? <span className="font-mono text-xs bg-muted/30 px-2 py-0.5 rounded text-foreground">{s.referralCode}</span>
                        : <span className="text-muted-foreground/40">—</span>
                      }
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {new Date(s.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mt-4">
        {filtered.length} of {subscribers.length} subscribers shown
        {stats?.withWhatsapp ? ` · ${stats.withWhatsapp} have WhatsApp` : ""}
      </p>
    </div>
  );
}
