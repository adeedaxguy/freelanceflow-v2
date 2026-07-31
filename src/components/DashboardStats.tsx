"use client";

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
    iconBg:    "bg-[hsl(var(--signal)/0.18)]",
    iconColor: "text-foreground",
    suffix:    "",
    trendSfx:  "%",
  },
] as const;

// ─── Component ────────────────────────────────────────────────────────────────
export default function DashboardStats({ stats }: { stats: Stats }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {CARDS.map(({ key, trendKey, label, icon: Icon, iconBg, iconColor, suffix, trendSfx }) => (
        <div
          key={key}
          className="dashboard-metric-card flex flex-col p-4 sm:p-5 transition-colors hover:border-foreground/25"
        >
          <div className="flex items-center justify-between">
            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full ${iconBg} flex items-center justify-center`}>
              <Icon className={`w-4 h-4 ${iconColor}`} />
            </div>
            <div className="text-2xl sm:text-4xl font-semibold text-foreground tracking-tight tabular-nums">
              <AnimatedCounter value={stats[key]} suffix={suffix} />
            </div>
          </div>

          <div className="mt-auto pt-5 sm:pt-6">
            <p className="text-sm sm:text-base font-semibold text-foreground">{label}</p>
            <div className="mt-1.5">
              <TrendBadge value={stats.trends[trendKey]} suffix={trendSfx} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
