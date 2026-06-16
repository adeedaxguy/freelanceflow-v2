"use client";

import { useState, useEffect, useCallback } from "react";
import { UserCheck, Shield, User, RefreshCw, ChevronDown, Crown, AlertTriangle } from "lucide-react";

interface StaffUser {
  id: string; name: string | null; email: string; role: string; plan: string;
  suspended: boolean; createdAt: string;
  _count: { leads: number; sentEmails: number };
}

interface AllUser { id: string; name: string | null; email: string; role: string; plan: string; }

const ROLE_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  ADMIN:   { label: "Admin",   icon: Crown,      color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" },
  MANAGER: { label: "Manager", icon: Shield,     color: "text-primary-light", bg: "bg-primary/10 border-primary/20" },
  USER:    { label: "User",    icon: User,       color: "text-muted-foreground", bg: "bg-muted border-border" },
};

export default function AdminManagersPage() {
  const [staff, setStaff]         = useState<StaffUser[]>([]);
  const [loading, setLoading]     = useState(true);
  const [allUsers, setAllUsers]   = useState<AllUser[]>([]);
  const [search, setSearch]       = useState("");
  const [promoting, setPromoting] = useState<string | null>(null);
  const [confirm, setConfirm]     = useState<{ id: string; name: string; newRole: string } | null>(null);

  const loadStaff = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/managers");
    if (res.ok) {
      const d = await res.json() as { managers: StaffUser[] };
      setStaff(d.managers);
    }
    setLoading(false);
  }, []);

  const loadUsers = useCallback(async () => {
    if (!search.trim()) { setAllUsers([]); return; }
    const res = await fetch(`/api/admin/users?search=${encodeURIComponent(search)}&limit=10`);
    if (res.ok) {
      const d = await res.json() as { users: AllUser[] };
      setAllUsers(d.users.filter(u => !["ADMIN","MANAGER"].includes(u.role)));
    }
  }, [search]);

  useEffect(() => { void loadStaff(); }, [loadStaff]);
  useEffect(() => {
    const t = setTimeout(() => void loadUsers(), 300);
    return () => clearTimeout(t);
  }, [loadUsers]);

  async function changeRole(id: string, role: string) {
    setPromoting(id);
    await fetch("/api/admin/managers", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, role }),
    });
    setConfirm(null);
    setSearch("");
    await loadStaff();
    setPromoting(null);
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-5xl">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Staff & Managers</h1>
        <p className="text-muted-foreground mt-1 text-sm">Manage who has admin or manager access to the platform.</p>
      </div>

      {/* Role descriptions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { role: "ADMIN",   desc: "Full platform control — users, settings, billing, all data." },
          { role: "MANAGER", desc: "Can manage users and view support tickets. Cannot change platform settings." },
          { role: "USER",    desc: "Standard freelancer account with no admin access." },
        ].map(({ role, desc }) => {
          const rc = ROLE_CONFIG[role]!;
          const Icon = rc.icon;
          return (
            <div key={role} className={`rounded-2xl border p-4 ${rc.bg}`}>
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-4 h-4 ${rc.color}`} />
                <span className={`text-sm font-semibold ${rc.color}`}>{rc.label}</span>
              </div>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
          );
        })}
      </div>

      {/* Add manager */}
      <div className="bg-gradient-card border border-border rounded-2xl p-6">
        <h2 className="text-foreground font-semibold mb-4 flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-primary-light" /> Promote a User
        </h2>
        <div className="relative">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 text-sm"
          />
          {allUsers.length > 0 && (
            <div className="absolute top-full mt-1 left-0 right-0 bg-surface border border-border rounded-xl shadow-xl z-10 overflow-hidden">
              {allUsers.map(u => (
                <div key={u.id} className="flex items-center justify-between px-4 py-3 hover:bg-primary/5 border-b border-border/40 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-foreground">{u.name ?? "—"}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </div>
                  <button
                    onClick={() => setConfirm({ id: u.id, name: u.name ?? u.email, newRole: "MANAGER" })}
                    disabled={promoting === u.id}
                    className="text-xs px-3 py-1.5 rounded-lg bg-primary/20 text-primary-light border border-primary/30 hover:bg-primary/30 transition-all font-medium"
                  >
                    Make Manager
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Current staff */}
      <div className="bg-gradient-card border border-border rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-foreground font-semibold">Current Staff ({staff.length})</h2>
          <button onClick={() => void loadStaff()} className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground transition-all">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {staff.map(u => {
              const rc = ROLE_CONFIG[u.role] ?? ROLE_CONFIG.USER!;
              const Icon = rc.icon;
              return (
                <div key={u.id} className="flex items-center justify-between px-6 py-4 hover:bg-primary/5 transition-colors">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${rc.bg}`}>
                      <Icon className={`w-4 h-4 ${rc.color}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">{u.name ?? "—"}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${rc.bg} ${rc.color}`}>
                      {rc.label}
                    </span>
                    {u.role !== "ADMIN" && (
                      <button
                        onClick={() => setConfirm({ id: u.id, name: u.name ?? u.email, newRole: "USER" })}
                        className="text-xs px-3 py-1.5 rounded-lg text-muted-foreground border border-border hover:text-destructive hover:border-destructive/30 transition-all"
                      >
                        Remove
                      </button>
                    )}
                    {u.role === "USER" && (
                      <button
                        onClick={() => setConfirm({ id: u.id, name: u.name ?? u.email, newRole: "MANAGER" })}
                        className="text-xs px-3 py-1.5 rounded-lg bg-primary/20 text-primary-light border border-primary/30 hover:bg-primary/30 transition-all"
                      >
                        Promote
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirm modal */}
      {confirm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Confirm Role Change</p>
                <p className="text-xs text-muted-foreground">This gives/removes platform access</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Set <strong className="text-foreground">{confirm.name}</strong> role to{" "}
              <strong className={confirm.newRole === "MANAGER" ? "text-primary-light" : "text-muted-foreground"}>
                {confirm.newRole}
              </strong>?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirm(null)}
                className="flex-1 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground transition-all">
                Cancel
              </button>
              <button onClick={() => void changeRole(confirm.id, confirm.newRole)}
                disabled={promoting === confirm.id}
                className="flex-1 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-light transition-all disabled:opacity-60">
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
