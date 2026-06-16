"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Gift,
  Link as LinkIcon,
  Loader2,
  Share2,
  ShieldCheck,
  Sparkles,
  X,
  Zap,
} from "lucide-react";

type BonusClaimResult = {
  success?: boolean;
  alreadyClaimed?: boolean;
  bonusAdded?: number;
  bonusLeads?: number;
  localDailyLimit?: number;
  message?: string;
  referralUrl?: string;
};

interface BonusLeadsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBonusClaimed: (newBonus: number, claim?: BonusClaimResult) => void;
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

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://icloseleads.com";

function toUrl(value: string): URL | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  try {
    return new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
  } catch {
    return null;
  }
}

function isLinkedInProfile(value: string) {
  const url = toUrl(value);
  if (!url) return false;
  const host = url.hostname.replace(/^www\./, "").toLowerCase();
  return host === "linkedin.com" && (/^\/in\/[^/]+\/?$/i.test(url.pathname) || /^\/posts\//i.test(url.pathname) || /^\/feed\/update\//i.test(url.pathname));
}

function isFacebookProfile(value: string) {
  const url = toUrl(value);
  if (!url) return false;
  const host = url.hostname.replace(/^www\.|^m\./, "").toLowerCase();
  if (host !== "facebook.com" && host !== "fb.com") return false;
  const path = url.pathname.replace(/\/+$/, "");
  if (!path || path === "/sharer" || path === "/dialog/share") return false;
  return /^\/[A-Za-z0-9.]+/.test(path) || /^\/profile\.php$/i.test(path) || /^\/share\//i.test(path) || /^\/permalink\.php$/i.test(path);
}

function normalizedHref(value: string) {
  return toUrl(value)?.href ?? value.trim();
}

export default function BonusLeadsModal({
  isOpen,
  onClose,
  onBonusClaimed,
  source,
  currentPlan = "free",
}: BonusLeadsModalProps) {
  const copy = SOURCE_COPY[source] ?? SOURCE_COPY["live-jobs"]!;
  const planLabel = currentPlan ? `${currentPlan.charAt(0).toUpperCase()}${currentPlan.slice(1)}` : "Free";
  const [openedLinkedIn, setOpenedLinkedIn] = useState(false);
  const [openedFacebook, setOpenedFacebook] = useState(false);
  const [linkedInUrl, setLinkedInUrl] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setOpenedLinkedIn(false);
    setOpenedFacebook(false);
    setLinkedInUrl("");
    setFacebookUrl("");
    setSubmitting(false);
    setError("");
    setSuccess("");
  }, [isOpen, source]);

  const shareUrl = useMemo(() => {
    const url = new URL(APP_URL);
    url.searchParams.set("utm_source", "bonus_share");
    url.searchParams.set("utm_medium", source);
    url.searchParams.set("utm_campaign", "free_bonus");
    return url.toString();
  }, [source]);
  const linkedInShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
  const linkedInValid = isLinkedInProfile(linkedInUrl);
  const facebookValid = isFacebookProfile(facebookUrl);
  const canClaim = openedLinkedIn && openedFacebook && linkedInValid && facebookValid && !submitting;

  const openShare = (platform: "linkedin" | "facebook") => {
    const targetUrl = platform === "linkedin" ? linkedInShareUrl : facebookShareUrl;
    window.open(targetUrl, "_blank", "noopener,noreferrer");
    if (platform === "linkedin") setOpenedLinkedIn(true);
    if (platform === "facebook") setOpenedFacebook(true);
    setError("");
  };

  const claimBonus = async () => {
    if (!canClaim) return;
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      const response = await fetch("/api/leads/claim-bonus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "share",
          source,
          openedPlatforms: ["linkedin", "facebook"],
          linkedinProfileUrl: normalizedHref(linkedInUrl),
          facebookProfileUrl: normalizedHref(facebookUrl),
        }),
      });
      const data = (await response.json()) as BonusClaimResult & { error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "Could not validate your share. Please check both profile links.");
      }
      const bonusAdded = data.bonusAdded ?? copy.bonus;
      setSuccess(data.message ?? `Unlocked ${bonusAdded} extra leads.`);
      onBonusClaimed(bonusAdded, data);
    } catch (claimError) {
      setError(claimError instanceof Error ? claimError.message : "Could not validate your share.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

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
        className="relative max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-surface shadow-2xl"
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

        <div className="space-y-5 p-7">
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
                <p className="text-xs text-muted-foreground">Share iCloseLeads to unlock instantly.</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-background/60 p-4 space-y-3">
            <div className="flex items-start gap-2">
              <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent" />
              <div>
                <p className="text-sm font-semibold text-foreground">Instant validation</p>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Open both share screens, then add your LinkedIn and Facebook profile/post links. We verify the platform links and allow one bonus claim per account.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => openShare("linkedin")}
                className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition-all ${
                  openedLinkedIn ? "border-accent/40 bg-accent/10 text-accent" : "border-border text-foreground hover:border-primary/40"
                }`}
              >
                {openedLinkedIn ? <CheckCircle2 className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
                Share LinkedIn
                <ExternalLink className="h-3.5 w-3.5 opacity-70" />
              </button>
              <button
                type="button"
                onClick={() => openShare("facebook")}
                className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition-all ${
                  openedFacebook ? "border-accent/40 bg-accent/10 text-accent" : "border-border text-foreground hover:border-primary/40"
                }`}
              >
                {openedFacebook ? <CheckCircle2 className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
                Share Facebook
                <ExternalLink className="h-3.5 w-3.5 opacity-70" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-muted-foreground">
                LinkedIn profile or post URL
              </label>
              <div className="relative">
                <LinkIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={linkedInUrl}
                  onChange={(event) => setLinkedInUrl(event.target.value)}
                  placeholder="linkedin.com/in/your-profile"
                  className={`w-full rounded-xl border bg-background py-2.5 pl-9 pr-9 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/10 ${
                    linkedInUrl && !linkedInValid ? "border-destructive/50" : "border-border focus:border-primary/60"
                  }`}
                />
                {linkedInValid && <CheckCircle2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-accent" />}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-muted-foreground">
                Facebook profile or post URL
              </label>
              <div className="relative">
                <LinkIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={facebookUrl}
                  onChange={(event) => setFacebookUrl(event.target.value)}
                  placeholder="facebook.com/your.profile"
                  className={`w-full rounded-xl border bg-background py-2.5 pl-9 pr-9 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/10 ${
                    facebookUrl && !facebookValid ? "border-destructive/50" : "border-border focus:border-primary/60"
                  }`}
                />
                {facebookValid && <CheckCircle2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-accent" />}
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-destructive/20 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-start gap-2 rounded-xl border border-accent/20 bg-accent/10 px-3 py-2.5 text-sm text-accent">
              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <div className="space-y-2.5">
            <button
              type="button"
              onClick={claimBonus}
              disabled={!canClaim}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-hero py-3.5 text-sm font-bold text-white shadow-glow-primary transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
              {submitting ? "Validating..." : "Validate & Unlock Leads"}
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
