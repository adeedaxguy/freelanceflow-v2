"use client";

import { X, Zap, Check, ArrowRight, Lock } from "lucide-react";
import Link from "next/link";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: "leads" | "proposals" | "campaigns" | "generic";
  resetDate?: string;
}

const REASON_MESSAGES: Record<string, { title: string; body: string; emoji: string }> = {
  leads:     { emoji: "🔍", title: "Weekly Lead Limit Reached", body: "You've used this week's free lead allowance. Share iCloseLeads from the lead tool to unlock bonus leads instantly." },
  proposals: { emoji: "✉️", title: "Proposal Limit Reached",    body: "You've hit your monthly proposal limit. Upgrade to Pro for unlimited AI proposals every month." },
  campaigns: { emoji: "📣", title: "Campaign Limit Reached",    body: "Free plan allows 1 campaign. Upgrade to Pro to run up to 10 simultaneous campaigns." },
  generic:   { emoji: "⚡", title: "Upgrade to iCloseLeads Pro", body: "Unlock the full power of iCloseLeads with Pro. More leads, unlimited proposals, and priority support." },
};

const PRO_FEATURES = [
  "Higher daily lead limits",
  "Unlimited AI proposals",
  "10 simultaneous campaigns",
  "Priority email support",
  "Advanced analytics",
  "Team collaboration (coming soon)",
];

export default function UpgradeModal({ isOpen, onClose, reason = "generic", resetDate }: UpgradeModalProps) {
  if (!isOpen) return null;

  const msg = REASON_MESSAGES[reason] ?? REASON_MESSAGES.generic!;
  const resetStr = resetDate
    ? new Date(resetDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : null;

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-surface border border-border rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up">

        {/* Gradient top strip */}
        <div className="h-1.5 bg-gradient-hero" />

        {/* Close */}
        <button onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all">
          <X className="w-4 h-4" />
        </button>

        <div className="p-7 space-y-6">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto text-2xl">
              {msg.emoji}
            </div>
            <h2 className="text-xl font-bold text-foreground">{msg.title}</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">{msg.body}</p>
            {resetStr && (
              <p className="text-xs text-muted-foreground bg-muted/40 border border-border rounded-lg px-3 py-2 inline-block">
                🔄 Your free limit resets on <strong className="text-foreground">{resetStr}</strong>
              </p>
            )}
          </div>

          {/* Pro features */}
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 space-y-2">
            <p className="text-xs font-bold text-primary-light uppercase tracking-wider mb-3">Pro includes:</p>
            {PRO_FEATURES.map(f => (
              <div key={f} className="flex items-center gap-2.5 text-sm text-foreground">
                <div className="w-4 h-4 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                  <Check className="w-2.5 h-2.5 text-accent" />
                </div>
                {f}
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="space-y-2.5">
            <Link href="/dashboard/upgrade" onClick={onClose}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-hero text-white font-bold text-sm shadow-glow-primary hover:opacity-90 transition-all">
              <Zap className="w-4 h-4" /> Upgrade to Pro <ArrowRight className="w-4 h-4" />
            </Link>
            <button onClick={onClose}
              className="w-full py-3 rounded-2xl border border-border text-muted-foreground hover:text-foreground hover:border-primary/30 text-sm font-medium transition-all">
              Maybe later
            </button>
          </div>

          {/* Trust signal */}
          <p className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5">
            <Lock className="w-3 h-3" /> Secure checkout · Cancel anytime · 14-day money-back
          </p>
        </div>
      </div>
    </div>
  );
}
