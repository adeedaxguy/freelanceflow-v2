"use client";

import { Gift, Sparkles, X, Zap } from "lucide-react";

interface BonusLeadsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBonusClaimed: (newBonus: number) => void;
  source: "live-jobs" | "local-leads" | string;
  currentPlan?: string;
}

const SOURCE_COPY: Record<string, { title: string; body: string; bonus: number }> = {
  "live-jobs": {
    title: "Extra Live Job Leads",
    body: "Free early access is active. Claim a fresh lead allowance and keep searching for client opportunities.",
    bonus: 100,
  },
  "local-leads": {
    title: "Extra Local Business Leads",
    body: "Free early access is active. Add more local lead allowance and keep finding real businesses to pitch.",
    bonus: 300,
  },
};

export default function BonusLeadsModal({
  isOpen,
  onClose,
  onBonusClaimed,
  source,
  currentPlan = "free",
}: BonusLeadsModalProps) {
  if (!isOpen) return null;

  const copy = SOURCE_COPY[source] ?? SOURCE_COPY["live-jobs"]!;
  const planLabel = currentPlan ? `${currentPlan.charAt(0).toUpperCase()}${currentPlan.slice(1)}` : "Free";

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center p-4"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      role="presentation"
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="bonus-leads-title"
      >
        <div className="h-1.5 bg-gradient-hero" />

        <button
          type="button"
          onClick={onClose}
          aria-label="Close bonus leads modal"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-all hover:bg-white/5 hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="space-y-6 p-7">
          <div className="space-y-3 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary-light">
              <Gift className="h-7 w-7" />
            </div>
            <div>
              <p className="mb-1 text-xs font-bold uppercase tracking-wide text-primary-light">{planLabel} early access</p>
              <h2 id="bonus-leads-title" className="text-xl font-bold text-foreground">
                {copy.title}
              </h2>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">{copy.body}</p>
          </div>

          <div className="rounded-2xl border border-accent/20 bg-accent/10 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{copy.bonus} more leads available</p>
                <p className="text-xs text-muted-foreground">No card required during launch access.</p>
              </div>
            </div>
          </div>

          <div className="space-y-2.5">
            <button
              type="button"
              onClick={() => onBonusClaimed(copy.bonus)}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-hero py-3.5 text-sm font-bold text-white shadow-glow-primary transition-all hover:opacity-90"
            >
              <Zap className="h-4 w-4" />
              Claim Bonus Leads
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-2xl border border-border py-3 text-sm font-medium text-muted-foreground transition-all hover:border-primary/30 hover:text-foreground"
            >
              Not now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
