"use client";

import Link from "next/link";
import { Check, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PricingTier } from "@/data/marketing";
import AnimatedContent from "@/components/react-bits/AnimatedContent";

interface PricingCardProps {
  tier: PricingTier;
  index?: number;
}

export default function PricingCard({ tier, index = 0 }: PricingCardProps) {
  return (
    <AnimatedContent delay={index * 0.08} distance={18} className="h-full">
    <div
      className={cn(
        "relative flex h-full flex-col rounded-2xl border p-8 transition-all duration-300",
        tier.highlight
          ? "bg-gradient-card border-primary/50 shadow-glow-primary/20 scale-105"
          : "bg-surface border-border hover:border-primary/30 hover:shadow-card-hover"
      )}
    >
      {tier.badge && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="px-4 py-1 rounded-full text-xs font-bold bg-gradient-hero text-white shadow-glow-primary">
            {tier.badge}
          </span>
        </div>
      )}

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          {tier.highlight && <Zap className="w-4 h-4 text-primary-light" />}
          <h3 className={cn("font-bold text-lg", tier.highlight ? "text-primary-light" : "text-foreground")}>
            {tier.name}
          </h3>
        </div>
        <p className="text-muted-foreground text-sm mb-4">{tier.description}</p>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold text-foreground">
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
              tier.highlight ? "bg-primary/20 text-primary-light" : "bg-accent/10 text-accent"
            )}>
              <Check className="w-3 h-3" />
            </div>
            <span className="text-sm text-muted-foreground">
              {feature}
            </span>
          </li>
        ))}
      </ul>

      <Link href={tier.href} className={cn(
        "block w-full text-center px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200",
        tier.highlight
          ? "bg-primary hover:bg-primary-light text-white shadow-glow-primary hover:shadow-glow-primary/70"
          : "bg-background border border-border text-foreground hover:border-primary/50 hover:text-primary-light"
      )}>
        {tier.cta}
      </Link>
    </div>
    </AnimatedContent>
  );
}
