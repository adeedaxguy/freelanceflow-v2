"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Search, Shield, Ban, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/Badge";
import ConfirmModal from "@/components/ConfirmModal";
import { formatDate } from "@/lib/utils";

interface AdminUser { id: string; name: string | null; email: string; role: string; niche: string | null; suspended: boolean; createdAt: string; _count: { sentEmails: number; leads: number }; }
interface ApiResp { users: AdminUser[]; total: number; totalPages: number; }

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (search) params.set("search", search);
    if (roleFilter) params.set("role", roleFilter);
    const res = await fetch(`/api/admin/users?${params.toString()}`);
    if (res.ok) { const d = (await res.json()) as ApiResp; setUsers(d.users); setTotalPages(d.totalPages); setTotal(d.total); }
    setLoading(false);
  }, [page, search, roleFilter]);

  useEffect(() => { void fetchUsers(); }, [fetchUsers]);

  async function handleSuspend(user: AdminUser) {
    await fetch("/api/admin/users", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: user.id, suspended: !user.suspended }) });
    void fetchUsers();
  }

  async function handleRoleToggle(user: AdminUser) {
    await fetch("/api/admin/users", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: user.id, role: user.role === "ADMIN" ? "USER" : "ADMIN" }) });
    void fetchUsers();
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    await fetch(`/api/admin/users?id=${deleteId}`, { method: "DELETE" });
    setDeleteId(null); setDeleting(false); void fetchUsers();
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">User Management</h1>
        <p className="text-muted-foreground mt-1">{total} total users on the platform</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name or email..." className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50" />
        </div>
        <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 bg-surface border border-border rounded-xl text-foreground text-sm focus:outline-none focus:border-primary/50">
          <option value="">All Roles</option>
          <option value="USER">User</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>

      <div className="bg-surface border border-border rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Loading users...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-background/50">
                  {["User", "Role", "Niche", "Leads", "Emails", "Joined", "Status", "Actions"].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-border/50 last:border-0 hover:bg-primary/5 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-hero flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {user.name?.[0]?.toUpperCase() ?? "U"}
                        </div>
                        <div>
                          <p className="text-foreground text-sm font-medium">{user.name ?? "—"}</p>
                          <p className="text-muted-foreground text-xs">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <Badge variant={user.role === "ADMIN" ? "primary" : "outline"}>{user.role}</Badge>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground text-sm">{user.niche ?? "—"}</td>
                    <td className="px-5 py-3 text-muted-foreground text-sm">{user._count.leads}</td>
                    <td className="px-5 py-3 text-muted-foreground text-sm">{user._count.sentEmails}</td>
                    <td className="px-5 py-3 text-muted-foreground text-sm whitespace-nowrap">{formatDate(user.createdAt)}</td>
                    <td className="px-5 py-3">
                      <Badge variant={user.suspended ? "red" : "accent"}>{user.suspended ? "Suspended" : "Active"}</Badge>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1">
                        <Link href={`/admin/users/${user.id}`} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors" title="View user">
                          <Search className="w-3.5 h-3.5" />
                        </Link>
                        <button onClick={() => void handleRoleToggle(user)} className="p-1.5 rounded-lg text-muted-foreground hover:text-primary-light hover:bg-primary/10 transition-colors" title="Toggle admin">
                          <Shield className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => void handleSuspend(user)} className="p-1.5 rounded-lg text-muted-foreground hover:text-gold hover:bg-gold/10 transition-colors" title={user.suspended ? "Unsuspend" : "Suspend"}>
                          <Ban className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setDeleteId(user.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors" title="Delete user">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground disabled:opacity-40">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-muted-foreground text-sm">Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground disabled:opacity-40">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      <ConfirmModal isOpen={!!deleteId} title="Delete User" message="This user and all their data will be permanently deleted." confirmLabel="Delete User" onConfirm={() => void handleDelete()} onCancel={() => setDeleteId(null)} loading={deleting} />
    </div>
  );
}
