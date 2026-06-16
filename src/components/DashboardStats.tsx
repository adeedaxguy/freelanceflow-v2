"use client";

import { motion } from "framer-motion";
import { Users, Mail, TrendingUp, TrendingDown, Bookmark, Minus } from "lucide-react";
import AnimatedCounter from "./AnimatedCounter";

// ─── Shared trend badge ───────────────────────────────────────────────────────
export function TrendBadge({ value, suffix = "%" }: { value: number | null; suffix?: string }) {
  if (value === null)
    return <span className="text-xs text-muted-foreground">No prior data</span>;
  if (value === 0)
    return (
      <span className="flex items-center gap-1 text-xs text-muted-foreground">
        <Minus className="w-3 h-3" /> No change
      </span>
    );
  const up = value > 0;
  return (
    <span className={`flex items-center gap-1 text-xs font-medium ${up ? "text-accent" : "text-destructive"}`}>
      {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {up ? "+" : ""}{value}{suffix} vs last 30d
    </span>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface Stats {
  leadsFound: number;
  emailsSent: number;
  openRate:   number;
  responses:  number;
  trends: {
    leads:     number | null;
    emails:    number | null;
    openRate:  number | null;
    responses: number | null;
  };
}

// ─── Card config ──────────────────────────────────────────────────────────────
const CARDS = [
  {
    key:       "leadsFound" as const,
    trendKey:  "leads"     as const,
    label:     "Leads Found",
    icon:      Users,
    border:    "border-border",
    iconBg:    "bg-primary/10",
    iconColor: "text-primary-light",
    suffix:    "",
    trendSfx:  "%",
  },
  {
    key:       "emailsSent" as const,
    trendKey:  "emails"    as const,
    label:     "Outreach",
    icon:      Mail,
    border:    "border-border",
    iconBg:    "bg-primary/10",
    iconColor: "text-primary-light",
    suffix:    "",
    trendSfx:  "%",
  },
  {
    key:       "openRate"  as const,
    trendKey:  "openRate"  as const,
    label:     "Open Rate",
    icon:      TrendingUp,
    border:    "border-accent/20",
    iconBg:    "bg-accent/10",
    iconColor: "text-accent",
    suffix:    "%",
    trendSfx:  "pp",
  },
  {
    key:       "responses" as const,
    trendKey:  "responses" as const,
    label:     "Responses",
    icon:      Bookmark,
    border:    "border-gold/20",
    iconBg:    "bg-gold/10",
    iconColor: "text-gold",
    suffix:    "",
    trendSfx:  "%",
  },
] as const;

// ─── Component ────────────────────────────────────────────────────────────────
export default function DashboardStats({ stats }: { stats: Stats }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {CARDS.map(({ key, trendKey, label, icon: Icon, border, iconBg, iconColor, suffix, trendSfx }, i) => (
        <motion.div
          key={key}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.07, duration: 0.4, ease: "easeOut" }}
          className={`bg-gradient-card border ${border} rounded-2xl p-5 space-y-2 group hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200`}
        >
          {/* Header row */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {label}
            </span>
            <div className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
              <Icon className={`w-4 h-4 ${iconColor}`} />
            </div>
          </div>

          {/* Animated number */}
          <div className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            <AnimatedCounter value={stats[key]} suffix={suffix} />
          </div>

          {/* Trend */}
          <TrendBadge value={stats.trends[trendKey]} suffix={trendSfx} />
        </motion.div>
      ))}
    </div>
  );
}
