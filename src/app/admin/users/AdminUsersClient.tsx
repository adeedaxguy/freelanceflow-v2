"use client";
import { useState } from "react";
import { Search, Shield, UserX, UserCheck, Crown } from "lucide-react";

interface User {
  id: string; name: string | null; email: string; plan: string;
  role: string; suspended: boolean; createdAt: Date; weeklyLeads: number;
  _count: { leads: number; sentEmails: number };
}

export default function AdminUsersClient({ users }: { users: User[] }) {
  const [q, setQ] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [localUsers, setLocalUsers] = useState(users);

  const filtered = localUsers.filter(u => {
    const match = q ? (u.email.includes(q) || (u.name ?? "").toLowerCase().includes(q.toLowerCase())) : true;
    const planOk = planFilter === "all" || u.plan === planFilter;
    return match && planOk;
  });

  async function toggleSuspend(id: string, suspended: boolean) {
    setActionLoading(id);
    try {
      await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, suspended: !suspended }),
      });
      setLocalUsers(prev => prev.map(u => u.id === id ? { ...u, suspended: !suspended } : u));
    } finally { setActionLoading(null); }
  }

  async function changePlan(id: string, plan: string) {
    setActionLoading(id);
    try {
      await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, plan }),
      });
      setLocalUsers(prev => prev.map(u => u.id === id ? { ...u, plan } : u));
    } finally { setActionLoading(null); }
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Shield className="w-6 h-6 text-primary-light" /> User Management
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">{localUsers.length} total users</p>
        <p className="text-muted-foreground mt-1 text-xs">"Used Today" tracks lead allowance consumed across remote, live, and local lead tools. "Saved" counts leads stored in CRM.</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search by email or name…"
            className="w-full pl-9 pr-4 py-2 bg-surface border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-primary/50" />
        </div>
        {["all","free","pro","agency"].map(p => (
          <button key={p} onClick={() => setPlanFilter(p)}
            className={`px-3 py-2 rounded-lg border text-sm font-medium capitalize transition-all ${planFilter === p ? "bg-primary border-primary text-white" : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"}`}>
            {p}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-gradient-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-surface/50">
                {["User","Plan","Used Today","Saved","Emails","Status","Actions"].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-muted-foreground px-5 py-3 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id} className="border-b border-border/30 hover:bg-primary/5 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-xs font-bold text-primary-light flex-shrink-0">
                        {(u.name ?? u.email)[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-foreground flex items-center gap-1">
                          {u.name ?? "—"}
                          {u.role === "ADMIN" && <Crown className="w-3 h-3 text-gold" />}
                        </p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <select value={u.plan} disabled={actionLoading === u.id}
                      onChange={e => void changePlan(u.id, e.target.value)}
                      className="bg-surface border border-border rounded-lg px-2 py-1 text-xs text-foreground focus:outline-none focus:border-primary/50 cursor-pointer">
                      <option value="free">Free</option>
                      <option value="pro">Pro</option>
                      <option value="agency">Agency</option>
                    </select>
                  </td>
                  <td className="px-5 py-3 text-foreground font-medium">{u.weeklyLeads}</td>
                  <td className="px-5 py-3 text-foreground font-medium">{u._count.leads}</td>
                  <td className="px-5 py-3 text-foreground font-medium">{u._count.sentEmails}</td>
                  <td className="px-5 py-3">
                    <span className={`flex items-center gap-1.5 text-xs font-medium w-fit px-2 py-1 rounded-full ${u.suspended ? "bg-destructive/10 text-destructive" : "bg-green-500/10 text-green-400"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${u.suspended ? "bg-destructive" : "bg-green-400"}`} />
                      {u.suspended ? "Suspended" : "Active"}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <button onClick={() => void toggleSuspend(u.id, u.suspended)}
                      disabled={actionLoading === u.id || u.role === "ADMIN"}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                        u.suspended
                          ? "border border-green-500/30 text-green-400 hover:bg-green-500/10"
                          : "border border-red-500/30 text-red-400 hover:bg-red-500/10"
                      }`}>
                      {u.suspended
                        ? <><UserCheck className="w-3.5 h-3.5" /> Unsuspend</>
                        : <><UserX className="w-3.5 h-3.5" /> Suspend</>}
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-5 py-12 text-center text-muted-foreground text-sm">No users found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
