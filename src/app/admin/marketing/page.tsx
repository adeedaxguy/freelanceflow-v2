"use client";

import { useState, useEffect } from "react";
import { Download, Users, MessageCircle, Share2, Bell, RefreshCw, Search, Gauge, Gift } from "lucide-react";

type Audience = "consented" | "at-limit" | "bonus" | "all";

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
  weeklyLeads: number;
  weeklyLeadReset: string;
  reachedFreeLimit: boolean;
  atFreeLimit: boolean;
}

interface Stats {
  total: number;
  withWhatsapp: number;
  withConsent: number;
  reachedFreeLimit: number;
  atFreeLimit: number;
  claimedShare: number;
  claimedSubscribe: number;
  totalBonusLeads: number;
}

export default function AdminMarketingPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [stats,       setStats]       = useState<Stats | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState("");
  const [audience,    setAudience]    = useState<Audience>("consented");
  const [notifying,   setNotifying]   = useState(false);
  const [noticeResult, setNoticeResult] = useState("");

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

  async function notifyLimitUsers() {
    if (!window.confirm("Send one upgrade notice to free users who reached their 600-lead trial limit?")) return;
    setNotifying(true);
    setNoticeResult("");
    try {
      const response = await fetch("/api/admin/marketing/notify-limit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: "notify-free-limit-users" }),
      });
      const data = await response.json() as {
        error?: string;
        sent?: number;
        skipped?: number;
        failed?: { email: string }[];
      };
      if (!response.ok) throw new Error(data.error ?? "Could not send notices.");
      setNoticeResult(`Sent ${data.sent ?? 0}; skipped ${data.skipped ?? 0}; failed ${data.failed?.length ?? 0}.`);
      await load();
    } catch (error) {
      setNoticeResult(error instanceof Error ? error.message : "Could not send notices.");
    } finally {
      setNotifying(false);
    }
  }

  function exportCSV() {
    const rows = [
      ["Name", "Email", "Marketing Consent", "Plan", "Last Recorded Usage", "Reached Free Limit", "Bonus Leads", "Joined"].join(","),
      ...filtered.map(s => [
        s.name ?? "",
        s.email,
        s.marketingConsent ? "yes" : "no",
        s.plan,
        s.weeklyLeads,
        s.reachedFreeLimit ? "yes" : "no",
        s.bonusLeads,
        new Date(s.createdAt).toLocaleDateString(),
      ].map(v => `"${v}"`).join(",")),
    ];
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `icloseleads-${audience}-${new Date().toISOString().slice(0,10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  }

  const filtered = subscribers.filter(subscriber => {
    const matchesAudience =
      audience === "all"
      || (audience === "consented" && subscriber.marketingConsent)
      || (audience === "at-limit" && subscriber.reachedFreeLimit)
      || (audience === "bonus" && subscriber.bonusLeads > 0);
    const query = search.trim().toLowerCase();
    const matchesSearch = !query
      || subscriber.email.toLowerCase().includes(query)
      || subscriber.name?.toLowerCase().includes(query)
      || (subscriber.whatsapp ?? "").includes(query);
    return matchesAudience && matchesSearch;
  });

  return (
    <div className="p-6 lg:p-8 max-w-7xl">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Email Audiences</h1>
          <p className="text-muted-foreground text-sm mt-1">Separate account notices from consented Zoho marketing contacts.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => void notifyLimitUsers()}
            disabled={notifying || !stats?.reachedFreeLimit}
            className="flex items-center gap-2 rounded-xl border border-gold/30 bg-gold/10 px-4 py-2 text-sm font-semibold text-gold transition-colors hover:bg-gold/15 disabled:opacity-50"
          >
            <Bell className="h-4 w-4" />
            {notifying ? "Sending…" : "Notify trial limit users"}
          </button>
          <button onClick={() => void load()} disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-muted-foreground hover:text-foreground text-sm transition-colors">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-light transition-colors">
            <Download className="w-4 h-4" /> Export selected
          </button>
        </div>
      </div>
      {noticeResult && (
        <p className="mb-5 rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground">
          {noticeResult}
        </p>
      )}

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          {[
            { icon: <Users className="w-4 h-4 text-primary-light" />,     label: "Total",           val: stats.total },
            { icon: <Gauge className="w-4 h-4 text-gold" />,              label: "Reached 100",     val: stats.reachedFreeLimit },
            { icon: <MessageCircle className="w-4 h-4 text-accent" />,    label: "WhatsApp",        val: stats.withWhatsapp },
            { icon: <Bell className="w-4 h-4 text-primary-light" />,      label: "Email Consent",   val: stats.withConsent },
            { icon: <Share2 className="w-4 h-4 text-gold" />,             label: "Shared",          val: stats.claimedShare },
            { icon: <Bell className="w-4 h-4 text-accent" />,             label: "Subscribed",      val: stats.claimedSubscribe },
            { icon: <Gift className="w-4 h-4 text-primary-light" />,       label: "Bonus Leads",     val: stats.totalBonusLeads },
          ].map(s => (
            <div key={s.label} className="bg-surface border border-border rounded-xl p-4 text-center">
              <div className="flex justify-center mb-1">{s.icon}</div>
              <div className="text-xl font-extrabold text-foreground">{s.val}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="mb-4 flex flex-wrap gap-2">
        {([
          ["consented", "Zoho opt-ins"],
          ["at-limit", "Free users who reached 100"],
          ["bonus", "Bonus active"],
          ["all", "All relevant users"],
        ] as const).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setAudience(value)}
            className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
              audience === value
                ? "border-primary bg-primary/15 text-primary-light"
                : "border-border bg-surface text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mb-4 rounded-xl border border-border bg-surface px-4 py-3 text-xs leading-5 text-muted-foreground">
        <strong className="text-foreground">Zoho Campaigns:</strong> export only the “Zoho opt-ins” audience for recurring promotional email. “Free users who reached 100” is for a one-time account notice about the verified bonus flow, not automatic marketing enrollment.
      </div>

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
                {["Name", "Email", "Consent", "Plan", "Last usage", "Bonus", "Claimed Via", "Joined"].map(h => (
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
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        s.marketingConsent ? "bg-accent/10 text-accent" : "bg-muted/30 text-muted-foreground"
                      }`}>
                        {s.marketingConsent ? "Opted in" : "No opt-in"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${s.plan === "agency" ? "bg-gold/10 text-gold" : s.plan === "pro" ? "bg-primary/10 text-primary-light" : "bg-muted/30 text-muted-foreground"}`}>
                        {s.plan}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={s.reachedFreeLimit ? "font-semibold text-gold" : "text-muted-foreground"}>
                        {s.weeklyLeads}{s.reachedFreeLimit ? " · reached 600" : ""}
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
        {filtered.length} of {subscribers.length} relevant users shown
        {stats?.withWhatsapp ? ` · ${stats.withWhatsapp} have WhatsApp` : ""}
      </p>
    </div>
  );
}
