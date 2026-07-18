import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Lock,
  ShieldCheck,
} from "lucide-react";

type ReadinessCheck = {
  label: string;
  ready: boolean;
  note?: string;
};

type BetaFeaturePageProps = {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  description: string;
  isAdmin: boolean;
  userHighlights: string[];
  adminSteps: string[];
  adminChecks?: ReadinessCheck[];
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
};

function StatusBadge({ isAdmin }: { isAdmin: boolean }) {
  if (isAdmin) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/25 bg-accent/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-accent">
        <ShieldCheck className="h-3.5 w-3.5" />
        Admin beta
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/25 bg-gold/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-gold">
      <Clock3 className="h-3.5 w-3.5" />
      Coming soon
    </span>
  );
}

export default function BetaFeaturePage({
  icon: Icon,
  eyebrow,
  title,
  description,
  isAdmin,
  userHighlights,
  adminSteps,
  adminChecks = [],
  primaryHref = "/dashboard/local-leads",
  primaryLabel = "Find local leads",
  secondaryHref = "/dashboard/email-settings",
  secondaryLabel = "Use Gmail prepare mode",
}: BetaFeaturePageProps) {
  const readyCount = adminChecks.filter(check => check.ready).length;

  return (
    <div className="beta-feature-page p-4 sm:p-6 lg:p-8 max-w-6xl space-y-6">
      <section className="overflow-hidden rounded-3xl border border-border bg-gradient-card">
        <div className="relative p-6 sm:p-8 lg:p-10">
          <div className="absolute inset-0 bg-grid-pattern bg-grid-sm opacity-20" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-5 flex flex-wrap items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10">
                  <Icon className="h-6 w-6 text-primary-light" />
                </div>
                <StatusBadge isAdmin={isAdmin} />
              </div>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.26em] text-muted-foreground">
                {eyebrow}
              </p>
              <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                {title}
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
                {description}
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-surface p-4 lg:w-72">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                {isAdmin ? (
                  <ShieldCheck className="h-4 w-4 text-accent" />
                ) : (
                  <Lock className="h-4 w-4 text-gold" />
                )}
                {isAdmin ? "Admin testing enabled" : "Not released to users"}
              </div>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                {isAdmin
                  ? "You can review the beta flow, readiness checklist, and release guardrails from this account."
                  : "This feature is visible as a preview only. It will not send calls, texts, or bulk messages yet."}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-2xl border border-border bg-gradient-card p-5 sm:p-6">
          <div className="mb-5 flex items-center gap-2">
            {isAdmin ? (
              <ShieldCheck className="h-5 w-5 text-accent" />
            ) : (
              <Clock3 className="h-5 w-5 text-gold" />
            )}
            <h2 className="text-lg font-bold text-foreground">
              {isAdmin ? "Admin beta workspace" : "What users will see for now"}
            </h2>
          </div>

          {isAdmin ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {adminSteps.map((step, index) => (
                <div key={step} className="rounded-xl border border-border bg-surface p-4">
                  <span className="text-xs font-bold uppercase tracking-widest text-primary-light">
                    Step {index + 1}
                  </span>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{step}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {userHighlights.map(highlight => (
                <div key={highlight} className="flex items-start gap-3 rounded-xl border border-border bg-surface p-4">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent" />
                  <p className="text-sm leading-6 text-muted-foreground">{highlight}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-border bg-gradient-card p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className={`h-5 w-5 ${isAdmin ? "text-accent" : "text-gold"}`} />
              <h2 className="text-lg font-bold text-foreground">
                {isAdmin ? "Readiness checks" : "Release guardrails"}
              </h2>
            </div>
            {isAdmin && adminChecks.length > 0 && (
              <span className="rounded-full border border-border bg-surface px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                {readyCount}/{adminChecks.length} ready
              </span>
            )}
          </div>

          {isAdmin && adminChecks.length > 0 ? (
            <div className="space-y-3">
              {adminChecks.map(check => (
                <div key={check.label} className="rounded-xl border border-border bg-surface p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-foreground">{check.label}</p>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      check.ready
                        ? "bg-accent/10 text-accent"
                        : "bg-gold/10 text-gold"
                    }`}>
                      {check.ready ? "Ready" : "Needed"}
                    </span>
                  </div>
                  {check.note && (
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">{check.note}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3 text-sm leading-6 text-muted-foreground">
              <p>
                We are holding this behind a coming-soon state until throttling, consent,
                audit logs, provider setup, and opt-out behavior are fully tested.
              </p>
              <p>
                The live workflow remains review-first: find leads, save the right ones,
                generate a specific proposal, then send manually through Gmail.
              </p>
            </div>
          )}
        </section>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href={primaryHref}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-hero px-4 py-2.5 text-sm font-semibold text-white shadow-glow-primary transition-all hover:opacity-90"
        >
          {primaryLabel}
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href={secondaryHref}
          className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-muted-foreground transition-all hover:border-primary/40 hover:text-foreground"
        >
          {secondaryLabel}
        </Link>
      </div>
    </div>
  );
}
