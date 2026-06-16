"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Zap, Clock, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PricingTier } from "@/data/marketing";

interface PricingCardProps {
  tier: PricingTier;
  index?: number;
}

export default function PricingCard({ tier, index = 0 }: PricingCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={cn(
        "relative flex flex-col rounded-2xl border p-8 transition-all duration-300",
        tier.highlight
          ? "bg-gradient-card border-primary/50 shadow-glow-primary/20 scale-105"
          : "bg-surface border-border hover:border-primary/30 hover:shadow-card-hover",
        tier.comingSoon && "opacity-90"
      )}
    >
      {tier.comingSoon && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
          <span className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-gold/90 to-amber-400 text-background shadow-glow-gold">
            <Clock className="w-3 h-3" /> Coming Soon
          </span>
        </div>
      )}

      {tier.badge && !tier.comingSoon && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="px-4 py-1 rounded-full text-xs font-bold bg-gradient-hero text-white shadow-glow-primary">
            {tier.badge}
          </span>
        </div>
      )}

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          {tier.highlight && !tier.comingSoon && <Zap className="w-4 h-4 text-primary-light" />}
          <h3 className={cn("font-bold text-lg", tier.highlight ? "text-primary-light" : "text-foreground")}>
            {tier.name}
          </h3>
        </div>
        <p className="text-muted-foreground text-sm mb-4">{tier.description}</p>
        <div className="flex items-baseline gap-1">
          <span className={cn("text-4xl font-bold", tier.comingSoon ? "text-muted-foreground" : "text-foreground")}>
            {tier.price}
          </span>
          {tier.period && <span className="text-muted-foreground text-sm">/{tier.period}</span>}
        </div>
      </div>

      <ul className="space-y-3 flex-1 mb-8">
        {tier.features.map((feature) => (
          <li key={feature} className="flex items-start gap-3">
            <div className={cn(
              "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
              tier.comingSoon ? "bg-muted/40 text-muted-foreground"
                : tier.highlight ? "bg-primary/20 text-primary-light" : "bg-accent/10 text-accent"
            )}>
              <Check className="w-3 h-3" />
            </div>
            <span className={cn("text-sm", tier.comingSoon ? "text-muted-foreground/60" : "text-muted-foreground")}>
              {feature}
            </span>
          </li>
        ))}
      </ul>

      {tier.comingSoon ? (
        <button disabled className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm bg-muted/30 border border-border text-muted-foreground cursor-not-allowed select-none">
          <Bell className="w-4 h-4" /> Notify Me When Live
        </button>
      ) : (
        <Link href={tier.href} className={cn(
          "block w-full text-center px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200",
          tier.highlight
            ? "bg-primary hover:bg-primary-light text-white shadow-glow-primary hover:shadow-glow-primary/70"
            : "bg-background border border-border text-foreground hover:border-primary/50 hover:text-primary-light"
        )}>
          {tier.cta}
        </Link>
      )}
    </motion.div>
  );
}
