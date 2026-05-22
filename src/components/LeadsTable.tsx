"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Sparkles, BookmarkPlus, ChevronUp, ChevronDown, Mail, Phone, Building } from "lucide-react";
import { LeadStatusBadge } from "@/components/Badge";
import { cn } from "@/lib/utils";
import type { Lead } from "@/types";

interface LeadsTableProps {
  leads: Lead[];
  loading?: boolean;
  onGenerateProposal?: (lead: Lead) => void;
  onSaveLead?: (lead: Lead) => void;
  showStatus?: boolean;
}

type SortKey = "company" | "confidence" | "savedAt";
type SortDir = "asc" | "desc";

export default function LeadsTable({
  leads,
  loading = false,
  onGenerateProposal,
  onSaveLead,
  showStatus = false,
}: LeadsTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("confidence");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const sorted = [...leads].sort((a, b) => {
    let aVal: string | number, bVal: string | number;
    if (sortKey === "company") {
      aVal = a.company.toLowerCase();
      bVal = b.company.toLowerCase();
    } else if (sortKey === "confidence") {
      aVal = a.confidence ?? 0;
      bVal = b.confidence ?? 0;
    } else {
      aVal = new Date(a.savedAt).getTime();
      bVal = new Date(b.savedAt).getTime();
    }
    return sortDir === "asc" ? (aVal < bVal ? -1 : 1) : (aVal > bVal ? -1 : 1);
  });

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <ChevronDown className="w-3 h-3 opacity-30" />;
    return sortDir === "asc" ? <ChevronUp className="w-3 h-3 text-primary-light" /> : <ChevronDown className="w-3 h-3 text-primary-light" />;
  }

  if (loading) {
    return (
      <div className="bg-surface border border-border rounded-2xl overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-border last:border-0 animate-pulse">
            <div className="w-8 h-8 bg-muted/50 rounded-lg" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted/50 rounded w-1/3" />
              <div className="h-3 bg-muted/50 rounded w-1/2" />
            </div>
            <div className="h-6 bg-muted/50 rounded w-20" />
          </div>
        ))}
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="bg-surface border border-border rounded-2xl p-12 text-center">
        <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
        <p className="text-foreground font-medium mb-1">No leads found</p>
        <p className="text-muted-foreground text-sm">Search for a domain or company to find leads.</p>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full" role="table">
          <thead>
            <tr className="border-b border-border bg-background/50">
              <th className="text-left px-6 py-3">
                <button className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground uppercase tracking-wider transition-colors" onClick={() => toggleSort("company")}>
                  <Building className="w-3 h-3" /> Company <SortIcon col="company" />
                </button>
              </th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Domain</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email</th>
              <th className="text-left px-6 py-3">
                <button className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground uppercase tracking-wider transition-colors" onClick={() => toggleSort("confidence")}>
                  Confidence <SortIcon col="confidence" />
                </button>
              </th>
              {showStatus && (
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
              )}
              <th className="text-right px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((lead, i) => (
              <motion.tr
                key={lead.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="border-b border-border/50 last:border-0 hover:bg-primary/5 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-primary-light font-semibold text-xs flex-shrink-0">
                      {lead.company[0]?.toUpperCase() ?? "?"}
                    </div>
                    <span className="text-foreground font-medium text-sm">{lead.company}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <a href={`https://${lead.domain}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-muted-foreground hover:text-primary-light transition-colors text-sm">
                    {lead.domain} <ExternalLink className="w-3 h-3" />
                  </a>
                </td>
                <td className="px-6 py-4">
                  {lead.email ? (
                    <span className="text-sm text-foreground font-mono">{lead.email}</span>
                  ) : (
                    <span className="text-sm text-muted-foreground italic">Not found</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {lead.confidence !== null ? (
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn("h-full rounded-full", lead.confidence >= 70 ? "bg-accent" : lead.confidence >= 40 ? "bg-gold" : "bg-red-400")}
                          style={{ width: `${lead.confidence}%` }}
                        />
                      </div>
                      <span className={cn("text-xs font-semibold", lead.confidence >= 70 ? "text-accent" : lead.confidence >= 40 ? "text-gold" : "text-red-400")}>
                        {lead.confidence}%
                      </span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                  )}
                </td>
                {showStatus && (
                  <td className="px-6 py-4">
                    <LeadStatusBadge status={lead.status} />
                  </td>
                )}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 justify-end">
                    {onSaveLead && (
                      <button
                        onClick={() => onSaveLead(lead)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-accent hover:bg-accent/10 transition-colors"
                        title="Save lead"
                        aria-label={`Save ${lead.company}`}
                      >
                        <BookmarkPlus className="w-4 h-4" />
                      </button>
                    )}
                    {onGenerateProposal && (
                      <button
                        onClick={() => onGenerateProposal(lead)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary-light text-xs font-medium transition-colors border border-primary/20"
                        aria-label={`Generate proposal for ${lead.company}`}
                      >
                        <Sparkles className="w-3 h-3" />
                        Propose
                      </button>
                    )}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
