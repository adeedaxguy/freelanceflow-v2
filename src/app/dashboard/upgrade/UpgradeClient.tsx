"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check, Zap, Crown, Loader2, ArrowRight, Shield, ExternalLink } from "lucide-react";
import Link from "next/link";
import { isPlanUpgrade } from "@/lib/plan-limits";
import { PLAN_FEATURES } from "@/lib/plan-pricing";
import { trackAnalyticsEvent } from "@/lib/analytics";

interface Props {
  currentPlan: string;
  userEmail: string;
  billingReady: boolean;
  billingTestMode: boolean;
  canCheckout: boolean;
  hasBillingSubscription: boolean;
  checkoutReturned: boolean;
  checkoutCancelled: boolean;
  selectedPlan?: "pro" | "agency";
  pricing: {
    proPrice: string;
    agencyPrice: string;
    proLeads: string;
    agencyLeads: string;
  };
}

export default function UpgradeClient({
  currentPlan,
  userEmail,
  pricing,
  billingReady,
  billingTestMode,
  canCheckout,
  hasBillingSubscription,
  checkoutReturned,
  checkoutCancelled,
  selectedPlan,
}: Props) {
  const router = useRouter();
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [activationPending, setActivationPending] = useState(checkoutReturned);
  const [activationDelayed, setActivationDelayed] = useState(false);

  const proMonthly    = Number(pricing.proPrice);
  const agencyMonthly = Number(pricing.agencyPrice);
  const proAnnual     = Math.round(proMonthly * 10);
  const agencyAnnual  = Math.round(agencyMonthly * 10);
  const hasHighestPlan = currentPlan === "agency";

  useEffect(() => {
    trackAnalyticsEvent("view_plans", { current_plan: currentPlan, selected_plan: selectedPlan });
  }, [currentPlan, selectedPlan]);

  useEffect(() => {
    if (!checkoutReturned || billingTestMode) { setActivationPending(false); return; }
    if (selectedPlan && currentPlan === selectedPlan) { setActivationPending(false); return; }
    let attempts = 0;
    const controller = new AbortController();
    const timer = window.setInterval(async () => {
      attempts++;
      try {
        const response = await fetch("/api/usage", { signal: controller.signal });
        const usage = response.ok ? await response.json() : null;
        if (usage && (selectedPlan ? usage.plan === selectedPlan : usage.plan !== "free")) {
          window.clearInterval(timer);
          setActivationPending(false);
          router.refresh();
          return;
        }
      } catch { /* A delayed webhook or connection can be retried without another charge. */ }
      if (attempts >= 10) {
        window.clearInterval(timer);
        setActivationDelayed(true);
      }
    }, 3000);
    return () => { controller.abort(); window.clearInterval(timer); };
  }, [checkoutReturned, billingTestMode, currentPlan, selectedPlan, router]);

  async function handleUpgrade(plan: string) {
    setLoading(plan);
    setMessage("");
    trackAnalyticsEvent("begin_checkout", { plan, billing_interval: billing });
    try {
      const res = await fetch("/api/user/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, billing }),
      });
      const data = await res.json() as { url?: string; error?: string };
      if (data.url) {
        window.location.href = data.url;
      } else if (data.error) {
        setMessage(data.error);
        trackAnalyticsEvent("checkout_error", { plan, status: res.status });
      } else {
        setMessage("Something went wrong. Please contact support.");
      }
    } catch {
      setMessage("Failed to initiate upgrade. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  async function openBillingPortal() {
    setLoading("portal");
    setMessage("");
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = await res.json() as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error || "Billing portal is unavailable.");
      window.location.href = data.url;
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not open billing settings.");
    } finally {
      setLoading(null);
    }
  }

  const plans = [
    {
      id: "free",
      name: "3-Day Trial",
      icon: <Zap className="w-5 h-5" />,
      price: { monthly: 0, annual: 0 },
      description: "Explore the core workflow without a card",
      color: "border-border",
      badge: null,
      features: PLAN_FEATURES.free,
      cta: "Current Plan",
    },
    {
      id: "pro",
      name: "Pro",
      icon: <Zap className="w-5 h-5 text-primary-light" />,
      price: { monthly: proMonthly, annual: proAnnual },
      description: "For freelancers landing clients consistently",
      color: "border-primary/40 shadow-glow-primary",
      badge: "For solo outreach",
      features: PLAN_FEATURES.pro,
      cta: "Upgrade to Pro",
    },
    {
      id: "agency",
      name: "Agency",
      icon: <Crown className="w-5 h-5 text-gold" />,
      price: { monthly: agencyMonthly, annual: agencyAnnual },
      description: `More prospecting capacity for $${agencyMonthly - proMonthly}/mo extra`,
      color: "border-gold/30",
      badge: "Best Value",
      features: PLAN_FEATURES.agency,
      cta: "Upgrade to Agency",
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl">
      <div className="mb-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-foreground">Plans and billing</h1>
            <p className="text-muted-foreground mt-2">
              You&apos;re currently on the <span className="text-foreground font-semibold capitalize">{currentPlan}</span> plan.
              {hasHighestPlan
                ? " Agency access is active. Billing status is separate from account access."
                : " Upgrade securely through Stripe for higher limits and more outreach capacity."}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Account: {userEmail}</p>
          </div>
          {hasBillingSubscription && (
            <button
              type="button"
              onClick={() => void openBillingPortal()}
              disabled={loading === "portal"}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-medium text-foreground hover:border-primary/40 disabled:opacity-60"
            >
              {loading === "portal" ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
              Manage billing
            </button>
          )}
        </div>
      </div>

      {!canCheckout && (
        <div className="mb-6 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
          {billingReady && billingTestMode
            ? "Paid plans are in private Stripe checkout testing. Your saved leads remain accessible."
            : "Stripe checkout is temporarily unavailable. Your saved leads remain accessible. Please contact support if you need to renew."}
        </div>
      )}
      {canCheckout && billingTestMode && (
        <div className="mb-6 rounded-xl border border-gold/25 bg-gold/5 px-4 py-3 text-sm text-muted-foreground">
          Stripe test mode is active for admins. These checkouts do not change production plan access.
        </div>
      )}

      {checkoutReturned && (
        <div role="status" className="mb-6 border-l border-accent pl-4 text-sm text-foreground">
          {billingTestMode ? "Test checkout returned. Test payments do not change your live plan." : activationPending
            ? activationDelayed ? "Stripe confirmation is taking longer than usual. Do not pay again. Refresh this page or contact support with your receipt." : "Waiting for Stripe to confirm your subscription..."
            : "Your paid-plan access is ready. Stripe sends your billing receipt separately."}
          <Link href="/dashboard/local-leads" className="mt-2 inline-flex items-center gap-2 text-primary-light">Find prospects <ArrowRight className="h-4 w-4" /></Link>
        </div>
      )}
      {checkoutCancelled && <p role="status" className="mb-6 text-sm text-muted-foreground">You returned from checkout. Review your plan below, or keep working with your saved leads.</p>}
      <p className="mb-6 text-sm text-muted-foreground">Choose Pro for a focused solo workflow. Choose Agency for higher outreach volume or API access. Every plan uses the same lead-quality checks; results and replies are not guaranteed.</p>

      {/* Billing toggle */}
      <div className="flex items-center gap-3 mb-8">
        <span className={`text-sm font-medium ${billing === "monthly" ? "text-foreground" : "text-muted-foreground"}`}>Monthly</span>
        <button
          type="button"
          role="switch"
          aria-label="Use annual billing"
          aria-checked={billing === "annual"}
          onClick={() => setBilling(b => b === "monthly" ? "annual" : "monthly")}
          className={`relative w-12 h-6 rounded-full transition-colors ${billing === "annual" ? "bg-primary" : "bg-muted"}`}
        >
          <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${billing === "annual" ? "translate-x-6" : "translate-x-0"}`} />
        </button>
        <span className={`text-sm font-medium ${billing === "annual" ? "text-foreground" : "text-muted-foreground"}`}>
          Annual <span className="ml-1 px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20 text-xs font-semibold">Save 17%</span>
        </span>
      </div>

      {message && (
        <div role="alert" className="mb-6 px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          {message}
        </div>
      )}

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan, i) => {
          const price = billing === "monthly" ? plan.price.monthly : plan.price.annual;
          const isCurrentPlan = currentPlan === plan.id;
          const canSelectPlan = billingTestMode || isPlanUpgrade(currentPlan, plan.id);
          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative bg-card border rounded-lg p-6 flex flex-col ${plan.color} ${isCurrentPlan || selectedPlan === plan.id ? "ring-2 ring-primary/30" : ""}`}
            >
              {plan.badge && !isCurrentPlan && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-white text-xs font-bold shadow-glow-primary whitespace-nowrap">
                  {plan.badge}
                </div>
              )}
              {isCurrentPlan && (
                <div className="absolute -top-3 right-4 px-3 py-1 rounded-full bg-accent/20 border border-accent/30 text-accent text-xs font-bold whitespace-nowrap">
                  Current
                </div>
              )}

              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  {plan.icon}
                </div>
                <div>
                  <h3 className="text-foreground font-bold">{plan.name}</h3>
                  <p className="text-muted-foreground text-xs">{plan.description}</p>
                </div>
              </div>

              <div className="mb-6">
                {price === 0 ? (
                  <div className="text-3xl font-extrabold text-foreground">Free</div>
                ) : (
                  <div className="flex items-end gap-1">
                    <span className="text-3xl font-extrabold text-foreground">${price}</span>
                    <span className="text-muted-foreground text-sm mb-1">/{billing === "monthly" ? "mo" : "yr"}</span>
                  </div>
                )}
                {billing === "annual" && price > 0 && (
                  <p className="text-xs text-accent mt-1">${Math.round(price / 12)}/mo billed annually</p>
                )}
              </div>

              <ul className="space-y-2.5 flex-1 mb-6">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              {isCurrentPlan ? (
                <button disabled className="w-full py-3 rounded-xl border border-border text-muted-foreground text-sm font-medium cursor-not-allowed">
                  ✓ Current Plan
                </button>
              ) : plan.id === "free" ? (
                <div className="w-full py-3 rounded-xl border border-border text-muted-foreground text-sm font-medium text-center">
                  Trial access only
                </div>
              ) : !canSelectPlan ? (
                <div className="w-full py-3 rounded-xl border border-border text-muted-foreground text-sm font-medium text-center">
                  Included in your {currentPlan === "agency" ? "Agency" : "current"} plan
                </div>
              ) : (
                <button
                  onClick={() => void handleUpgrade(plan.id)}
                  disabled={!!loading || !canCheckout || activationPending}
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white text-sm font-semibold transition-all disabled:opacity-60 ${
                    plan.id === "pro" ? "bg-primary hover:bg-primary-light shadow-glow-primary" : "bg-gradient-to-r from-gold/80 to-amber-500 hover:from-gold hover:to-amber-400 shadow-lg shadow-gold/20"
                  }`}
                >
                  {loading === plan.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ArrowRight className="w-4 h-4" />
                  )}
                  {activationPending ? "Awaiting confirmation" : canCheckout ? (billingTestMode ? `Test ${plan.name} checkout` : plan.cta) : "Temporarily unavailable"}
                </button>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Trust badges */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Shield className="w-4 h-4 text-accent" />
          Secure Stripe checkout
        </div>
        <div className="flex items-center gap-1.5">
          <Check className="w-4 h-4 text-accent" />
          Cancel anytime
        </div>
        <div className="flex items-center gap-1.5">
          <Check className="w-4 h-4 text-accent" />
          Clear recurring billing
        </div>
        <div className="flex items-center gap-1.5">
          <Check className="w-4 h-4 text-accent" />
          USD pricing
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground mt-4">
        Need help choosing?{" "}
        <Link href="/dashboard/support" className="text-primary-light hover:underline">Chat with us →</Link>
      </p>
    </div>
  );
}
