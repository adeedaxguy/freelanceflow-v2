"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle, Send, Users, X } from "lucide-react";

export interface LeadApplicationItem {
  title: string;
  url: string;
}

interface PendingApplicationPrompt extends LeadApplicationItem {
  openedAt: number;
}

const PENDING_KEY = "icl_pending_application_prompt";

function cleanLeadItems(leads: LeadApplicationItem[]): LeadApplicationItem[] {
  const seen = new Set<string>();
  return leads
    .filter(lead => lead.url?.trim())
    .filter(lead => {
      if (seen.has(lead.url)) return false;
      seen.add(lead.url);
      return true;
    })
    .slice(0, 200);
}

export function useLeadApplications(leads: LeadApplicationItem[]) {
  const leadItemsKey = useMemo(
    () => JSON.stringify(cleanLeadItems(leads).map(lead => ({ title: lead.title, url: lead.url }))),
    [leads]
  );
  const leadItems = useMemo(() => {
    try {
      return JSON.parse(leadItemsKey) as LeadApplicationItem[];
    } catch {
      return [];
    }
  }, [leadItemsKey]);
  const [appliedByUrl, setAppliedByUrl] = useState<Record<string, boolean>>({});
  const [countsByUrl, setCountsByUrl] = useState<Record<string, number>>({});
  const [loadingUrl, setLoadingUrl] = useState<string | null>(null);
  const [pendingPrompt, setPendingPrompt] = useState<PendingApplicationPrompt | null>(null);

  const refreshApplications = useCallback(async () => {
    if (leadItems.length === 0) {
      setAppliedByUrl({});
      setCountsByUrl({});
      return;
    }

    try {
      const params = new URLSearchParams();
      for (const lead of leadItems) params.append("url", lead.url);
      const res = await fetch(`/api/leads/apply?${params.toString()}`, { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json() as {
        counts?: Record<string, number>;
        applied?: Record<string, boolean>;
      };
      setCountsByUrl(data.counts ?? {});
      setAppliedByUrl(data.applied ?? {});
    } catch {
      // Non-blocking: applied tracking should not stop lead browsing.
    }
  }, [leadItems]);

  useEffect(() => {
    void refreshApplications();
  }, [refreshApplications]);

  const markApplied = useCallback(async (leadUrl: string) => {
    if (!leadUrl || loadingUrl) return;
    setLoadingUrl(leadUrl);
    try {
      const res = await fetch("/api/leads/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadUrl }),
      });
      if (!res.ok) return;
      const data = await res.json() as { applied: boolean; count: number };
      setAppliedByUrl(prev => ({ ...prev, [leadUrl]: data.applied }));
      setCountsByUrl(prev => ({ ...prev, [leadUrl]: data.count }));
    } catch {
      // Keep the current state if tracking fails.
    } finally {
      setLoadingUrl(null);
    }
  }, [loadingUrl]);

  const rememberOpenedPost = useCallback((lead: LeadApplicationItem) => {
    if (!lead.url) return;
    const pending: PendingApplicationPrompt = {
      title: lead.title || "this post",
      url: lead.url,
      openedAt: Date.now(),
    };
    try {
      sessionStorage.setItem(PENDING_KEY, JSON.stringify(pending));
    } catch {}
  }, []);

  useEffect(() => {
    const maybePrompt = () => {
      if (document.visibilityState === "hidden") return;
      let pending: PendingApplicationPrompt | null = null;
      try {
        const raw = sessionStorage.getItem(PENDING_KEY);
        if (raw) pending = JSON.parse(raw) as PendingApplicationPrompt;
      } catch {}

      if (!pending?.url) return;
      if (Date.now() - pending.openedAt < 1200) return;
      if (appliedByUrl[pending.url]) {
        try { sessionStorage.removeItem(PENDING_KEY); } catch {}
        return;
      }
      setPendingPrompt(pending);
    };

    window.addEventListener("focus", maybePrompt);
    document.addEventListener("visibilitychange", maybePrompt);
    return () => {
      window.removeEventListener("focus", maybePrompt);
      document.removeEventListener("visibilitychange", maybePrompt);
    };
  }, [appliedByUrl]);

  const closePrompt = useCallback(() => {
    try { sessionStorage.removeItem(PENDING_KEY); } catch {}
    setPendingPrompt(null);
  }, []);

  const confirmPromptApplied = useCallback(async () => {
    if (!pendingPrompt) return;
    await markApplied(pendingPrompt.url);
    closePrompt();
  }, [closePrompt, markApplied, pendingPrompt]);

  return {
    appliedByUrl,
    countsByUrl,
    loadingUrl,
    pendingPrompt,
    markApplied,
    rememberOpenedPost,
    closePrompt,
    confirmPromptApplied,
    refreshApplications,
  };
}

export function AppliedButton({
  leadUrl,
  applied,
  count,
  loading,
  onClick,
  compact = false,
  className = "",
}: {
  leadUrl: string;
  applied: boolean;
  count: number;
  loading: boolean;
  onClick: (leadUrl: string) => void | Promise<void>;
  compact?: boolean;
  className?: string;
}) {
  const label = applied ? "Applied" : compact ? "Apply" : "Mark Applied";
  const countLabel = count === 1 ? "1 applied" : `${count} applied`;

  return (
    <button
      type="button"
      onClick={() => void onClick(leadUrl)}
      disabled={loading}
      aria-pressed={applied}
      className={`flex items-center justify-center gap-1.5 rounded-lg border text-xs font-medium transition-all disabled:opacity-60 disabled:cursor-wait ${
        compact ? "px-2 py-2" : "px-3 py-2"
      } ${
        applied
          ? "bg-accent/10 text-accent border-accent/30 hover:bg-accent/15"
          : "bg-amber-500/10 text-amber-300 border-amber-500/25 hover:bg-amber-500/15"
      } ${className}`}
      title={applied ? "Click to remove your applied mark" : "Mark this job as applied"}
    >
      {applied ? <CheckCircle className="h-3.5 w-3.5" /> : <Send className="h-3.5 w-3.5" />}
      <span>{loading ? "..." : label}</span>
      <span className={`hidden rounded-full px-1.5 py-0.5 text-[10px] sm:inline-flex ${
        applied ? "bg-accent/10 text-accent" : "bg-amber-500/10 text-amber-200"
      }`}>
        {countLabel}
      </span>
    </button>
  );
}

export function AppliedReturnPrompt({
  lead,
  loading,
  onYes,
  onNo,
}: {
  lead: PendingApplicationPrompt | null;
  loading: boolean;
  onYes: () => void | Promise<void>;
  onNo: () => void;
}) {
  if (!lead) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-5 shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-accent/25 bg-accent/10 text-accent">
              <Users className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Did you apply?</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              If you applied to <span className="font-semibold text-foreground">{lead.title}</span>, mark it here so your pipeline and applied count stay accurate.
            </p>
          </div>
          <button
            type="button"
            onClick={onNo}
            className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onNo}
            className="rounded-xl border border-border px-4 py-3 text-sm font-semibold text-muted-foreground transition-all hover:border-primary/30 hover:text-foreground"
          >
            Not yet
          </button>
          <button
            type="button"
            onClick={() => void onYes()}
            disabled={loading}
            className="rounded-xl bg-gradient-hero px-4 py-3 text-sm font-semibold text-white shadow-glow-primary/20 transition-all hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Saving..." : "Yes, applied"}
          </button>
        </div>
      </div>
    </div>
  );
}
