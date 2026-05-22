"use client";

import { useState, useEffect, useCallback } from "react";
import { Send, ChevronDown, ChevronUp, RotateCw } from "lucide-react";
import { EmailStatusBadge } from "@/components/Badge";
import { formatDate } from "@/lib/utils";

interface SentEmail { id: string; subject: string; body: string; sentAt: string; status: string; lead: { company: string; domain: string } | null; }
interface ApiResp { emails: SentEmail[]; total: number; totalPages: number; }

export default function SentPage() {
  const [emails, setEmails] = useState<SentEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchEmails = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/emails/sent?page=${page}`);
    if (res.ok) { const d = (await res.json()) as ApiResp; setEmails(d.emails); setTotalPages(d.totalPages); }
    setLoading(false);
  }, [page]);

  useEffect(() => { void fetchEmails(); }, [fetchEmails]);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Sent Emails</h1>
          <p className="text-muted-foreground mt-1">Full history of all outreach emails.</p>
        </div>
        <button onClick={() => void fetchEmails()} className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors" aria-label="Refresh">
          <RotateCw className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-gradient-card border border-border rounded-xl animate-pulse" />)}</div>
      ) : emails.length === 0 ? (
        <div className="bg-gradient-card border border-border rounded-2xl p-12 text-center">
          <Send className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-40" />
          <h3 className="text-foreground font-medium mb-1">No emails sent yet</h3>
          <p className="text-muted-foreground text-sm">Send your first proposal from the Leads page.</p>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-background/50">
                {["Recipient / Company", "Subject", "Sent At", "Status", ""].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {emails.map((email) => (
                <>
                  <tr key={email.id} className="border-b border-border/50 last:border-0 hover:bg-primary/5 transition-colors">
                    <td className="px-5 py-3">
                      <p className="text-foreground text-sm font-medium">{email.lead?.company ?? "Direct"}</p>
                      <p className="text-muted-foreground text-xs">{email.lead?.domain ?? ""}</p>
                    </td>
                    <td className="px-5 py-3 text-foreground text-sm max-w-xs truncate">{email.subject}</td>
                    <td className="px-5 py-3 text-muted-foreground text-sm whitespace-nowrap">{formatDate(email.sentAt)}</td>
                    <td className="px-5 py-3"><EmailStatusBadge status={email.status} /></td>
                    <td className="px-5 py-3 text-right">
                      <button onClick={() => setExpanded(expanded === email.id ? null : email.id)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors" aria-label="Expand">
                        {expanded === email.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </td>
                  </tr>
                  {expanded === email.id && (
                    <tr key={`${email.id}-expanded`} className="border-b border-border/50 bg-background/30">
                      <td colSpan={5} className="px-5 py-4">
                        <pre className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap font-sans">{email.body}</pre>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground disabled:opacity-40">Prev</button>
          <span className="text-muted-foreground text-sm">Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground disabled:opacity-40">Next</button>
        </div>
      )}
    </div>
  );
}
