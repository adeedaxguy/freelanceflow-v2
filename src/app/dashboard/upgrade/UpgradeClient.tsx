"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Zap, Crown, Loader2, ArrowRight, Shield } from "lucide-react";
import Link from "next/link";

interface Props {
  currentPlan: string;
  userName: string;
  userEmail: string;
  pricing: {
    proPrice: string;
    agencyPrice: string;
    proLeads: string;
    agencyLeads: string;
  };
}

export default function UpgradeClient({ currentPlan, userEmail, pricing }: Props) {
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const proMonthly    = parseInt(pricing.proPrice);
  const agencyMonthly = parseInt(pricing.agencyPrice);
  const proAnnual     = Math.round(proMonthly * 10);
  const agencyAnnual  = Math.round(agencyMonthly * 10);

  async function handleUpgrade(plan: string) {
    setLoading(plan);
    setMessage("");
    try {
      const res = await fetch("/api/user/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, billing }),
      });
      const data = await res.json() as { url?: string; error?: string };
      if (data.url) {
        window.location.href = data.url; // Stripe checkout redirect
      } else if (data.error) {
        setMessage(data.error);
      } else {
        setMessage("Something went wrong. Please contact support.");
      }
    } catch {
      setMessage("Failed to initiate upgrade. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  const plans = [
    {
      id: "free",
      name: "Free",
      icon: <Zap className="w-5 h-5" />,
      price: { monthly: 0, annual: 0 },
      description: "Get started and test the waters",
      color: "border-border",
      badge: null,
      features: [
        `${pricing.proLeads === "100" ? "20" : "20"} leads per week`,
        "7 lead sources",
        "Basic AI proposals",
        "CRM pipeline (3 stages)",
        "Email outreach",
        "Community support",
      ],
      cta: "Current Plan",
    },
    {
      id: "pro",
      name: "Pro",
      icon: <Zap className="w-5 h-5 text-primary-light" />,
      price: { monthly: proMonthly, annual: proAnnual },
      description: "For serious freelancers scaling fast",
      color: "border-primary/40 shadow-glow-primary",
      badge: "Most Popular",
      features: [
        `${pricing.proLeads} leads per week`,
        "Priority lead quality scoring",
        "Advanced AI proposals (GPT-quality)",
        "Full 6-stage CRM pipeline",
        "Bulk email campaigns",
        "Analytics & reporting",
        "Priority email support",
        "Export leads to CSV",
      ],
      cta: "Upgrade to Pro",
    },
    {
      id: "agency",
      name: "Agency",
      icon: <Crown className="w-5 h-5 text-gold" />,
      price: { monthly: agencyMonthly, annual: agencyAnnual },
      description: "For agencies managing multiple clients",
      color: "border-gold/30",
      badge: "Best Value",
      features: [
        `${pricing.agencyLeads} leads per week`,
        "White-label proposals",
        "Multi-client workspace",
        "Team collaboration (5 seats)",
        "Custom email domains",
        "API access",
        "Dedicated account manager",
        "Custom integrations",
        "SLA guarantee",
      ],
      cta: "Upgrade to Agency",
    },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-foreground">Upgrade Your Plan</h1>
        <p className="text-muted-foreground mt-2">
          You&apos;re currently on the <span className="text-foreground font-semibold capitalize">{currentPlan}</span> plan.
          Unlock more leads, better AI, and premium features.
        </p>
        <p className="text-xs text-muted-foreground mt-1">Account: {userEmail}</p>
      </div>

      {/* Billing toggle */}
      <div className="flex items-center gap-3 mb-8">
        <span className={`text-sm font-medium ${billing === "monthly" ? "text-foreground" : "text-muted-foreground"}`}>Monthly</span>
        <button
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
        <div className="mb-6 px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          {message}
        </div>
      )}

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan, i) => {
          const price = billing === "monthly" ? plan.price.monthly : plan.price.annual;
          const isCurrentPlan = currentPlan === plan.id;
          const canUpgrade = !isCurrentPlan && plan.id !== "free";

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative bg-gradient-card border rounded-2xl p-6 flex flex-col ${plan.color} ${isCurrentPlan ? "ring-2 ring-primary/30" : ""}`}
            >
              {plan.badge && (
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
                  Free Forever
                </div>
              ) : (
                <button
                  onClick={() => void handleUpgrade(plan.id)}
                  disabled={!!loading}
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white text-sm font-semibold transition-all disabled:opacity-60 ${
                    plan.id === "pro" ? "bg-primary hover:bg-primary-light shadow-glow-primary" : "bg-gradient-to-r from-gold/80 to-amber-500 hover:from-gold hover:to-amber-400 shadow-lg shadow-gold/20"
                  }`}
                >
                  {loading === plan.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ArrowRight className="w-4 h-4" />
                  )}
                  {plan.cta}
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
          Secure checkout via Stripe
        </div>
        <div className="flex items-center gap-1.5">
          <Check className="w-4 h-4 text-accent" />
          Cancel anytime
        </div>
        <div className="flex items-center gap-1.5">
          <Check className="w-4 h-4 text-accent" />
          14-day money-back guarantee
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground mt-4">
        Need help choosing?{" "}
        <Link href="/dashboard/support" className="text-primary-light hover:underline">Chat with us →</Link>
      </p>
    </div>
  );
}
