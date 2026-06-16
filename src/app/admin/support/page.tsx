"use client";

import { useState, useEffect, useCallback } from "react";
import {
  MessageSquare, CheckCircle, Clock, AlertTriangle, X,
  ChevronDown, Send, RefreshCw, User, Shield,
} from "lucide-react";

interface TicketMessage { role: "user" | "admin"; text: string; adminEmail?: string; at: string; }
interface Ticket {
  id: string; userId: string | null; email: string; subject: string;
  messages: string; status: string; priority: string; category: string | null;
  assignedTo: string | null; createdAt: string; updatedAt: string;
  userName?: string; userPlan?: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  open:        { label: "Open",        color: "text-blue-400",   bg: "bg-blue-500/10 border-blue-500/20"  },
  in_progress: { label: "In Progress", color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" },
  resolved:    { label: "Resolved",    color: "text-green-400",  bg: "bg-green-500/10 border-green-500/20" },
  closed:      { label: "Closed",      color: "text-slate-400",  bg: "bg-slate-500/10 border-slate-500/20" },
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  low:    { label: "Low",    color: "text-slate-400" },
  normal: { label: "Normal", color: "text-blue-400"  },
  high:   { label: "High",   color: "text-orange-400" },
  urgent: { label: "Urgent", color: "text-red-400"   },
};

export default function AdminSupportPage() {
  const [tickets, setTickets]     = useState<Ticket[]>([]);
  const [loading, setLoading]     = useState(true);
  const [selected, setSelected]   = useState<Ticket | null>(null);
  const [reply, setReply]         = useState("");
  const [sending, setSending]     = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [counts, setCounts]       = useState<Record<string, number>>({});

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/support?status=${statusFilter}`);
    if (res.ok) {
      const d = await res.json() as { tickets: Ticket[]; counts: Array<{ status: string; cnt: number }> };
      setTickets(d.tickets);
      const cm: Record<string, number> = {};
      for (const c of d.counts) cm[c.status] = Number(c.cnt);
      setCounts(cm);
    }
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => { void load(); }, [load]);

  async function handleReply() {
    if (!selected || !reply.trim()) return;
    setSending(true);
    await fetch("/api/admin/support", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: selected.id, reply: reply.trim(), status: "in_progress" }),
    });
    setReply("");
    setSending(false);
    await load();
    // Refresh selected ticket
    const fresh = tickets.find(t => t.id === selected.id);
    if (fresh) setSelected(fresh);
  }

  async function updateStatus(id: string, status: string) {
    await fetch("/api/admin/support", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    await load();
    if (selected?.id === id) setSelected(null);
  }

  const parsedMessages = (t: Ticket): TicketMessage[] => {
    try { return JSON.parse(t.messages) as TicketMessage[]; } catch { return []; }
  };

  const openCount   = Object.entries(counts).filter(([s]) => !["resolved","closed"].includes(s)).reduce((s,[,n]) => s+n, 0);

  return (
    <div className="flex h-full min-h-screen bg-background">

      {/* Left: Ticket List */}
      <div className={`${selected ? "hidden lg:flex" : "flex"} flex-col w-full lg:w-96 xl:w-[420px] flex-shrink-0 border-r border-border`}>

        {/* Header */}
        <div className="p-5 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-lg font-bold text-foreground">Support Tickets</h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                {openCount} open · {counts.resolved ?? 0} resolved
              </p>
            </div>
            <button onClick={() => void load()} className="p-2 rounded-xl border border-border text-muted-foreground hover:text-foreground transition-all">
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>

          {/* Status filter tabs */}
          <div className="flex gap-1 bg-muted/30 rounded-xl p-1">
            {[
              { key: "all", label: "All" },
              { key: "open", label: "Open" },
              { key: "in_progress", label: "Active" },
              { key: "resolved", label: "Done" },
            ].map(tab => (
              <button key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`flex-1 text-xs py-1.5 rounded-lg font-medium transition-all ${
                  statusFilter === tab.key
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Ticket list */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <RefreshCw className="w-6 h-6 text-muted-foreground animate-spin" />
            </div>
          ) : tickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <CheckCircle className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm">No tickets found</p>
            </div>
          ) : (
            tickets.map(t => {
              const sc = STATUS_CONFIG[t.status] ?? STATUS_CONFIG.open!;
              const pc = PRIORITY_CONFIG[t.priority] ?? PRIORITY_CONFIG.normal!;
              const msgs = parsedMessages(t);
              const isSelected = selected?.id === t.id;
              return (
                <button key={t.id} onClick={() => setSelected(t)}
                  className={`w-full text-left p-4 border-b border-border/40 transition-all ${
                    isSelected ? "bg-primary/10 border-l-2 border-l-primary" : "hover:bg-primary/5"
                  }`}>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <p className="text-sm font-medium text-foreground line-clamp-1 flex-1">{t.subject}</p>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border flex-shrink-0 ${sc.bg} ${sc.color}`}>
                      {sc.label}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{t.email}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className={`text-[10px] font-medium ${pc.color}`}>
                      {t.priority === "urgent" && "🔴 "}{pc.label}
                    </span>
                    <div className="flex items-center gap-2">
                      {msgs.length > 1 && (
                        <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                          <MessageSquare className="w-2.5 h-2.5" /> {msgs.length}
                        </span>
                      )}
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(t.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Right: Ticket Detail */}
      {selected ? (
        <div className="flex-1 flex flex-col min-w-0">

          {/* Detail header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <button onClick={() => setSelected(null)} className="lg:hidden p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
              <div className="min-w-0">
                <p className="font-semibold text-foreground truncate">{selected.subject}</p>
                <p className="text-xs text-muted-foreground">{selected.email}
                  {selected.userPlan && <span className="ml-2 px-1.5 py-0.5 bg-muted rounded-full">{selected.userPlan}</span>}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Priority selector */}
              <select
                defaultValue={selected.priority}
                onChange={async e => {
                  await fetch("/api/admin/support", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: selected.id, priority: e.target.value }),
                  });
                  await load();
                }}
                className="text-xs bg-background border border-border rounded-lg px-2 py-1 text-foreground focus:outline-none"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
              {/* Status actions */}
              {selected.status !== "resolved" && (
                <button onClick={() => void updateStatus(selected.id, "resolved")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-500/10 text-green-400 border border-green-500/20 text-xs font-medium hover:bg-green-500/20 transition-all">
                  <CheckCircle className="w-3.5 h-3.5" /> Resolve
                </button>
              )}
              {selected.status !== "closed" && (
                <button onClick={() => void updateStatus(selected.id, "closed")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted text-muted-foreground border border-border text-xs font-medium hover:text-foreground transition-all">
                  <X className="w-3.5 h-3.5" /> Close
                </button>
              )}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {parsedMessages(selected).map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === "admin" ? "flex-row-reverse" : ""}`}>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  msg.role === "admin" ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                }`}>
                  {msg.role === "admin" ? <Shield className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>
                <div className={`max-w-xl rounded-2xl px-4 py-3 ${
                  msg.role === "admin"
                    ? "bg-primary/15 border border-primary/20 rounded-tr-sm"
                    : "bg-background border border-border rounded-tl-sm"
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-foreground">
                      {msg.role === "admin" ? (msg.adminEmail ?? "Admin") : selected.email}
                    </span>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                      <Clock className="w-2.5 h-2.5" />
                      {new Date(msg.at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <p className="text-sm text-foreground whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Reply box */}
          {!["resolved","closed"].includes(selected.status) && (
            <div className="border-t border-border p-4 flex-shrink-0">
              <textarea
                value={reply}
                onChange={e => setReply(e.target.value)}
                placeholder="Type your reply…"
                rows={3}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 resize-none"
              />
              <div className="flex items-center justify-end gap-2 mt-2">
                <button onClick={() => void handleReply()} disabled={!reply.trim() || sending}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-light transition-all disabled:opacity-50">
                  {sending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Send Reply
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="hidden lg:flex flex-1 items-center justify-center text-muted-foreground">
          <div className="text-center">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">Select a ticket to view</p>
          </div>
        </div>
      )}
    </div>
  );
}
