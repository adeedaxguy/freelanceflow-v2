"use client";

import { useState, useEffect, useCallback } from "react";
import { MessageSquare, CheckCircle, Clock } from "lucide-react";
import { Badge } from "@/components/Badge";
import { formatDate } from "@/lib/utils";

interface ContactSub { id: string; name: string; email: string; message: string; resolved: boolean; createdAt: string; }
interface ApiResp { submissions: ContactSub[]; }

export default function AdminContactsPage() {
  const [contacts, setContacts] = useState<ContactSub[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "open" | "resolved">("all");

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    const params = filter === "all" ? "" : `?resolved=${filter === "resolved"}`;
    const res = await fetch(`/api/contact${params}`);
    if (res.ok) { const d = (await res.json()) as ApiResp; setContacts(d.submissions); }
    setLoading(false);
  }, [filter]);

  useEffect(() => { void fetchContacts(); }, [fetchContacts]);

  async function markResolved(id: string, resolved: boolean) {
    await fetch(`/api/contact?id=${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ resolved }) });
    void fetchContacts();
  }

  const open = contacts.filter(c => !c.resolved).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Contact Submissions</h1>
          <p className="text-muted-foreground mt-1">{open} unresolved messages</p>
        </div>
      </div>

      <div className="flex gap-2">
        {(["all", "open", "resolved"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${filter === f ? "bg-primary text-white" : "border border-border text-muted-foreground hover:text-foreground"}`}>
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-gradient-card border border-border rounded-2xl animate-pulse" />)}</div>
      ) : contacts.length === 0 ? (
        <div className="bg-gradient-card border border-border rounded-2xl p-12 text-center">
          <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-40" />
          <p className="text-foreground font-medium">No contact submissions</p>
        </div>
      ) : (
        <div className="space-y-4">
          {contacts.map((c) => (
            <div key={c.id} className={`bg-gradient-card border rounded-2xl p-5 transition-all ${c.resolved ? "border-border opacity-60" : "border-primary/20"}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-hero flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {c.name[0]?.toUpperCase() ?? "?"}
                  </div>
                  <div>
                    <p className="text-foreground font-semibold text-sm">{c.name}</p>
                    <p className="text-muted-foreground text-xs">{c.email} · {formatDate(c.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge variant={c.resolved ? "outline" : "primary"}>{c.resolved ? "Resolved" : "Open"}</Badge>
                  <button onClick={() => void markResolved(c.id, !c.resolved)}
                    className={`p-1.5 rounded-lg transition-colors ${c.resolved ? "text-muted-foreground hover:text-foreground" : "text-accent hover:bg-accent/10"}`}
                    title={c.resolved ? "Mark open" : "Mark resolved"}>
                    {c.resolved ? <Clock className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <p className="text-muted-foreground text-sm mt-3 leading-relaxed pl-12">{c.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
