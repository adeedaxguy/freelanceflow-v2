"use client";

import { useState, useEffect, useCallback } from "react";
import { Shield, RefreshCw, Clock, User, ChevronLeft, ChevronRight } from "lucide-react";

interface AuditEntry {
  id: string; adminId: string; adminEmail: string; action: string;
  targetType: string | null; targetId: string | null;
  details: string | null; createdAt: string;
}

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  support_update: { label: "Support Reply",   color: "text-blue-400"   },
  role_change:    { label: "Role Change",     color: "text-yellow-400" },
  broadcast:      { label: "Broadcast Sent",  color: "text-purple-400" },
  user_suspend:   { label: "User Suspended",  color: "text-red-400"    },
  user_restore:   { label: "User Restored",   color: "text-green-400"  },
  plan_change:    { label: "Plan Changed",    color: "text-primary-light" },
  payment_failed: { label: "Payment Failed",  color: "text-red-400" },
  payment_checkout_failed: { label: "Checkout Failed", color: "text-red-400" },
  payment_checkout_expired: { label: "Checkout Expired", color: "text-yellow-400" },
  payment_webhook_error: { label: "Stripe Webhook Error", color: "text-red-400" },
};

export default function AdminAuditPage() {
  const [logs, setLogs]     = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage]     = useState(1);
  const [total, setTotal]   = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/audit?page=${page}`);
      if (!res.ok) throw new Error("Audit history is unavailable. Please retry.");
      const d = await res.json() as { logs: AuditEntry[]; total: number; totalPages: number };
      setLogs(d.logs);
      setTotal(d.total);
      setTotalPages(d.totalPages);
    } catch {
      setError("Audit history is unavailable. Please retry.");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { void load(); }, [load]);

  function parseDetails(entry: AuditEntry) {
    if (!entry.details) return null;
    try {
      const d = JSON.parse(entry.details) as Record<string, unknown>;
      return Object.entries(d)
        .map(([k, v]) => `${k}: ${String(v)}`)
        .join(" · ");
    } catch { return entry.details; }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Audit Log</h1>
          <p className="text-muted-foreground mt-1 text-sm">{total} account, search and payment events recorded</p>
        </div>
        <button onClick={() => void load()} disabled={loading} aria-label="Refresh audit history" title="Refresh audit history" className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground transition-all">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <div className="border-y border-border overflow-x-auto">
        <div className="min-w-[600px]">
        <div className="px-6 py-3 border-b border-border bg-muted/20">
          <div className="grid grid-cols-12 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            <span className="col-span-3">Action</span>
            <span className="col-span-3">Actor</span>
            <span className="col-span-3">Target</span>
            <span className="col-span-3">Time</span>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : !error && logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Shield className="w-10 h-10 mb-3 opacity-20" />
            <p className="text-sm">No events recorded yet</p>
            <p className="text-xs mt-1 opacity-60">New account, search and payment events will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {logs.map(entry => {
              const ac = ACTION_LABELS[entry.action] ?? { label: entry.action, color: "text-muted-foreground" };
              const details = parseDetails(entry);
              return (
                <div key={entry.id} className="grid grid-cols-12 gap-2 px-6 py-3.5 hover:bg-primary/5 transition-colors text-sm">
                  <div className="col-span-3">
                    <span className={`font-medium ${ac.color}`}>{ac.label}</span>
                    {details && <details className="mt-1 text-xs text-muted-foreground"><summary className="cursor-pointer">Details</summary><p className="mt-2 break-words">{details}</p></details>}
                  </div>
                  <div className="col-span-3 flex items-center gap-2 min-w-0">
                    <User className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                    <span className="text-muted-foreground text-xs truncate">{entry.adminEmail}</span>
                  </div>
                  <div className="col-span-3 text-xs text-muted-foreground">
                    {entry.targetType && <span className="text-foreground font-medium">{entry.targetType}</span>}
                    {entry.targetId && <span className="ml-1 opacity-50">#{entry.targetId.slice(0, 8)}</span>}
                  </div>
                  <div className="col-span-3 flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {new Date(entry.createdAt).toLocaleString("en-US", {
                      month: "short", day: "numeric",
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-border">
            <span className="text-xs text-muted-foreground">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground disabled:opacity-40 transition-all">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground disabled:opacity-40 transition-all">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
