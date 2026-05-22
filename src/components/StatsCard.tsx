"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: number;
  trendLabel?: string;
  className?: string;
  variant?: "default" | "accent" | "gold";
}

export default function StatsCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendLabel,
  className,
  variant = "default",
}: StatsCardProps) {
  const trendPositive = trend !== undefined && trend > 0;
  const trendNegative = trend !== undefined && trend < 0;

  const variantStyles = {
    default: "border-border hover:border-primary/30",
    accent: "border-accent/20 hover:border-accent/50",
    gold: "border-gold/20 hover:border-gold/40",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "bg-gradient-card border rounded-2xl p-6 transition-all duration-200 hover:shadow-card-hover",
        variantStyles[variant],
        className
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-muted-foreground text-sm font-medium">{title}</p>
        </div>
        {icon && (
          <div
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center",
              variant === "accent" ? "bg-accent/10 text-accent" :
              variant === "gold" ? "bg-gold/10 text-gold" :
              "bg-primary/10 text-primary-light"
            )}
          >
            {icon}
          </div>
        )}
      </div>

      <div className="space-y-1">
        <p
          className={cn(
            "text-3xl font-bold tabular-nums",
            variant === "accent" ? "text-accent" :
            variant === "gold" ? "text-gold" :
            "text-foreground"
          )}
        >
          {value}
        </p>
        {subtitle && (
          <p className="text-muted-foreground text-sm">{subtitle}</p>
        )}
      </div>

      {trend !== undefined && (
        <div className="mt-4 flex items-center gap-1.5">
          {trendPositive ? (
            <TrendingUp className="w-4 h-4 text-accent" />
          ) : trendNegative ? (
            <TrendingDown className="w-4 h-4 text-red-400" />
          ) : (
            <Minus className="w-4 h-4 text-muted-foreground" />
          )}
          <span
            className={cn(
              "text-sm font-medium",
              trendPositive ? "text-accent" :
              trendNegative ? "text-red-400" :
              "text-muted-foreground"
            )}
          >
            {trendPositive ? "+" : ""}{trend}%
          </span>
          {trendLabel && (
            <span className="text-muted-foreground text-sm">{trendLabel}</span>
          )}
        </div>
      )}
    </motion.div>
  );
}
