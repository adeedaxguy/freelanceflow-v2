"use client";

import { useMemo, useState } from "react";
import {
  BarChart2,
  CheckCircle2,
  Clock,
  FileText,
  Layers,
  Mail,
  Search,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
  Wrench,
  Zap,
} from "lucide-react";
import type { FeatureSlug } from "@/data/feature-pages";
import { cn } from "@/lib/utils";

type DemoType = FeatureSlug | "overview";

const basePanel =
  "border border-border bg-surface/80 shadow-[0_24px_90px_rgba(0,0,0,0.28)] backdrop-blur";
const chip =
  "inline-flex items-center gap-1.5 rounded-lg border border-border bg-background/70 px-3 py-1.5 text-xs text-muted-foreground";
const activeChip =
  "border-primary/45 bg-primary/15 text-primary-light";

function MiniHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border px-4 py-3">
      <div>
        <p className="text-sm font-bold text-foreground">{title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
      </div>
      <span className="rounded-lg border border-accent/25 bg-accent/10 px-2.5 py-1 text-[11px] font-bold text-accent">
        Live
      </span>
    </div>
  );
}

function ScoreBar({ score, color = "bg-accent" }: { score: number; color?: string }) {
  return (
    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
      <div className={cn("h-full rounded-full transition-all", color)} style={{ width: `${score}%` }} />
    </div>
  );
}

function OverviewDemo() {
  const steps = [
    {
      label: "Find",
      icon: Search,
      title: "Fresh leads matched to your niche",
      body: "Meta ads specialist needed for DTC launch",
      detail: "Score 86 - budget signal - posted 3h ago",
    },
    {
      label: "Qualify",
      icon: Target,
      title: "Score the opportunity before you pitch",
      body: "Strong fit: paid acquisition, Shopify, urgent timeline",
      detail: "Best angle: launch audit + first 14-day sprint",
    },
    {
      label: "Propose",
      icon: Sparkles,
      title: "Draft a specific first message",
      body: "I noticed you are launching a new DTC offer and need paid social support...",
      detail: "Subject: Quick idea for your launch ads",
    },
    {
      label: "Track",
      icon: Layers,
      title: "Move the lead through pipeline",
      body: "Contacted -> Follow-Up -> Replied",
      detail: "Next action: send value-add follow-up Friday",
    },
  ];
  const [active, setActive] = useState(0);
  const current = steps[active]!;

  return (
    <div className={cn(basePanel, "overflow-hidden rounded-lg")}>
      <MiniHeader title="Client acquisition workspace" subtitle="Find, pitch, and track from one flow" />
      <div className="grid gap-0 sm:grid-cols-[168px_1fr]">
        <div className="border-b border-border p-3 sm:border-b-0 sm:border-r">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-1">
            {steps.map(({ label, icon: Icon }, index) => (
              <button
                key={label}
                onClick={() => setActive(index)}
                className={cn(
                  "flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-all",
                  active === index
                    ? "border-primary/45 bg-primary/15 text-primary-light"
                    : "border-border bg-background/60 text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="min-h-[300px] p-4">
          <div className="rounded-lg border border-border bg-background/70 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-primary-light">
              Step {active + 1}
            </p>
            <h3 className="mt-2 text-xl font-extrabold text-foreground">{current.title}</h3>
            <p className="mt-4 rounded-lg border border-border bg-surface px-4 py-3 text-sm leading-relaxed text-foreground">
              {current.body}
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-accent" />
              {current.detail}
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {["Lead saved", "Draft ready", "Follow-up set"].map((label, index) => (
              <div key={label} className="rounded-lg border border-border bg-background/55 px-3 py-2">
                <div className="mb-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <span className={cn("h-2 w-2 rounded-full", index <= active ? "bg-accent" : "bg-muted")} />
                  {label}
                </div>
                <ScoreBar score={index <= active ? 100 : 30} color={index <= active ? "bg-accent" : "bg-muted"} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function LeadDiscoveryDemo() {
  const [mode, setMode] = useState<"remote" | "local">("remote");
  const rows = mode === "remote"
    ? [
        ["Meta Ads Landing Page Audit", "Score 91", "Budget signal", "3h"],
        ["WordPress Speed Fix", "Score 84", "Contact found", "7h"],
        ["SEO Content Refresh", "Score 78", "Urgent", "12h"],
      ]
    : [
        ["Mary Cleaning Service", "Score 82", "No website", "Houston"],
        ["Peak Dental Studio", "Score 76", "Outdated site", "Austin"],
        ["Cedar Plumbing", "Score 71", "Phone found", "Dallas"],
      ];

  return (
    <div className={cn(basePanel, "overflow-hidden rounded-lg")}>
      <MiniHeader title="Lead discovery engine" subtitle="Search intent signals without tab hopping" />
      <div className="p-4">
        <div className="grid gap-3 sm:grid-cols-[1fr_150px]">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
            <Search className="h-4 w-4 text-primary-light" />
            <span className="text-sm text-foreground">
              {mode === "remote" ? "meta ads OR landing page" : "cleaning service"}
            </span>
          </div>
          <button className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white">
            Find Leads
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {(["remote", "local"] as const).map(option => (
            <button
              key={option}
              onClick={() => setMode(option)}
              className={cn(chip, mode === option && activeChip)}
            >
              {option === "remote" ? "Remote jobs" : "Local businesses"}
            </button>
          ))}
          <span className={chip}>High intent</span>
          <span className={chip}>Contactable</span>
        </div>
        <div className="mt-5 space-y-3">
          {rows.map(([title, score, tag, meta], index) => (
            <div key={title} className="rounded-lg border border-border bg-background/70 p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-foreground">{title}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="rounded-md bg-primary/10 px-2 py-1 text-[11px] text-primary-light">{tag}</span>
                    <span className="rounded-md bg-surface px-2 py-1 text-[11px] text-muted-foreground">{meta}</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-accent">{score}</span>
              </div>
              <div className="mt-3">
                <ScoreBar score={[91, 84, 78][index] ?? 70} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProposalDemo() {
  const [tone, setTone] = useState<"direct" | "warm" | "technical">("direct");
  const copy = {
    direct: {
      subject: "Quick idea for your Shopify launch ads",
      body: "I saw you are preparing a DTC launch and need paid social help. I would start with a 14-day creative test: three angles, two landing-page variants, and clear CAC targets before scaling spend.",
    },
    warm: {
      subject: "A launch ad idea for your team",
      body: "Your launch brief stood out because the offer is already clear. The missing piece looks like fast creative validation. I can help you test the first set of Meta ads without locking you into a heavy retainer.",
    },
    technical: {
      subject: "Meta ads test plan for the launch",
      body: "I would structure this as a controlled test: campaign split by angle, UTM tracking, landing-page event QA, and a weekly readout on CPA, hook rate, and checkout drop-off.",
    },
  }[tone];

  return (
    <div className={cn(basePanel, "overflow-hidden rounded-lg")}>
      <MiniHeader title="AI proposal workspace" subtitle="Draft from lead context, then edit" />
      <div className="p-4">
        <div className="mb-4 flex flex-wrap gap-2">
          {(["direct", "warm", "technical"] as const).map(option => (
            <button
              key={option}
              onClick={() => setTone(option)}
              className={cn(chip, tone === option && activeChip)}
            >
              {option[0]!.toUpperCase() + option.slice(1)}
            </button>
          ))}
        </div>
        <div className="rounded-lg border border-border bg-background p-4">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Subject</label>
          <p className="mt-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground">
            {copy.subject}
          </p>
          <div className="mt-5 flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Proposal body</label>
            <span className="text-xs text-accent">132 words target</span>
          </div>
          <p className="mt-2 min-h-[142px] rounded-lg border border-border bg-surface px-3 py-3 text-sm leading-relaxed text-foreground">
            {copy.body}
            <br />
            <br />
            If useful, I can send over a short launch checklist and one example test matrix.
          </p>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {["Lead context", "Portfolio link", "Gmail draft"].map(label => (
            <div key={label} className="rounded-lg border border-border bg-background/60 px-3 py-2 text-center text-xs text-muted-foreground">
              <CheckCircle2 className="mx-auto mb-1 h-4 w-4 text-accent" />
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function OutreachDemo() {
  const steps = ["Draft", "Review", "Prepare", "Follow up"];
  const [active, setActive] = useState(1);

  return (
    <div className={cn(basePanel, "overflow-hidden rounded-lg")}>
      <MiniHeader title="Gmail-ready outreach" subtitle="Manual send control, logged activity" />
      <div className="p-4">
        <div className="grid grid-cols-4 gap-2">
          {steps.map((step, index) => (
            <button
              key={step}
              onClick={() => setActive(index)}
              className={cn(
                "rounded-lg border px-2 py-2 text-xs font-semibold transition-all",
                active === index ? "border-blue-400/45 bg-blue-500/15 text-blue-300" : "border-border bg-background/60 text-muted-foreground"
              )}
            >
              {step}
            </button>
          ))}
        </div>
        <div className="mt-5 rounded-lg border border-border bg-background p-4">
          <div className="flex items-center gap-2 text-sm font-bold text-foreground">
            <Mail className="h-4 w-4 text-blue-300" />
            Gmail compose preview
          </div>
          <div className="mt-4 space-y-2 text-sm">
            <p className="rounded-lg border border-border bg-surface px-3 py-2 text-muted-foreground">
              To: founder@company.com
            </p>
            <p className="rounded-lg border border-border bg-surface px-3 py-2 text-foreground">
              Subject: Quick idea for your launch ads
            </p>
            <p className="min-h-[110px] rounded-lg border border-border bg-surface px-3 py-3 leading-relaxed text-foreground">
              I noticed your launch brief and had one practical idea for testing Meta ads before scaling spend...
            </p>
          </div>
        </div>
        <div className="mt-4 rounded-lg border border-accent/20 bg-accent/10 p-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-accent">Safety limit</span>
            <span className="text-muted-foreground">48 prepared today</span>
          </div>
          <div className="mt-2">
            <ScoreBar score={48} color="bg-accent" />
          </div>
        </div>
      </div>
    </div>
  );
}

function CRMDemo() {
  const stages = [
    { name: "New", count: 8, color: "bg-blue-400" },
    { name: "Contacted", count: 5, color: "bg-primary" },
    { name: "Replied", count: 2, color: "bg-gold" },
    { name: "Follow-Up", count: 4, color: "bg-orange-400" },
    { name: "Won", count: 1, color: "bg-accent" },
  ];
  const [active, setActive] = useState(1);
  const current = stages[active]!;

  return (
    <div className={cn(basePanel, "overflow-hidden rounded-lg")}>
      <MiniHeader title="Freelance CRM pipeline" subtitle="Saved leads with next steps" />
      <div className="p-4">
        <div className="grid grid-cols-5 gap-2">
          {stages.map((stage, index) => (
            <button
              key={stage.name}
              onClick={() => setActive(index)}
              className={cn(
                "rounded-lg border p-2 text-center transition-all",
                active === index ? "border-primary/45 bg-primary/15" : "border-border bg-background/60"
              )}
            >
              <span className={cn("mx-auto block h-2 w-2 rounded-full", stage.color)} />
              <span className="mt-1 block text-[11px] font-semibold text-foreground">{stage.name}</span>
              <span className="text-[11px] text-muted-foreground">{stage.count}</span>
            </button>
          ))}
        </div>
        <div className="mt-5 rounded-lg border border-border bg-background p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-foreground">{current.name} leads</p>
            <span className="rounded-md bg-surface px-2 py-1 text-[11px] text-muted-foreground">This week</span>
          </div>
          <div className="mt-4 space-y-3">
            {["Local SEO audit for dental clinic", "WordPress redesign for contractor", "Meta ads launch review"].map((title, index) => (
              <div key={title} className="rounded-lg border border-border bg-surface px-3 py-2">
                <p className="text-sm font-semibold text-foreground">{title}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Next action: {index === 0 ? "send follow-up" : index === 1 ? "add proposal proof" : "verify budget"}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AnalyticsDemo() {
  const [range, setRange] = useState<"7d" | "30d">("30d");
  const values = range === "30d" ? [34, 68, 51, 77, 59, 88, 73] : [42, 54, 39, 80, 66, 72, 61];

  return (
    <div className={cn(basePanel, "overflow-hidden rounded-lg")}>
      <MiniHeader title="Prospecting analytics" subtitle="See what is moving the pipeline" />
      <div className="p-4">
        <div className="flex gap-2">
          {(["7d", "30d"] as const).map(option => (
            <button
              key={option}
              onClick={() => setRange(option)}
              className={cn(chip, range === option && activeChip)}
            >
              {option}
            </button>
          ))}
        </div>
        <div className="mt-5 grid grid-cols-3 gap-2">
          {[
            ["Saved leads", range === "30d" ? "126" : "31"],
            ["Proposals", range === "30d" ? "42" : "11"],
            ["Replies", range === "30d" ? "9" : "3"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg border border-border bg-background p-3 text-center">
              <p className="text-2xl font-extrabold text-green-400">{value}</p>
              <p className="text-[11px] text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 rounded-lg border border-border bg-background p-4">
          <div className="mb-3 flex items-center justify-between text-xs">
            <span className="font-semibold text-foreground">Lead quality by day</span>
            <span className="text-muted-foreground">Avg score</span>
          </div>
          <div className="flex h-36 items-end gap-2">
            {values.map((value, index) => (
              <div key={index} className="flex flex-1 flex-col items-center gap-2">
                <div className="w-full rounded-t-md bg-gradient-to-t from-green-500 to-accent" style={{ height: `${value}%` }} />
                <span className="text-[10px] text-muted-foreground">{index + 1}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ToolsDemo() {
  const [monthly, setMonthly] = useState(4000);
  const [hours, setHours] = useState(80);
  const hourly = useMemo(() => Math.ceil((monthly * 1.25) / Math.max(hours, 1)), [monthly, hours]);

  return (
    <div className={cn(basePanel, "overflow-hidden rounded-lg")}>
      <MiniHeader title="Freelancer toolkit" subtitle="Small tools for sharper decisions" />
      <div className="p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="rounded-lg border border-border bg-background p-3">
            <span className="text-xs font-semibold text-muted-foreground">Monthly target</span>
            <input
              type="range"
              min={2000}
              max={12000}
              step={500}
              value={monthly}
              onChange={event => setMonthly(Number(event.target.value))}
              className="mt-3 w-full"
            />
            <span className="mt-2 block text-lg font-bold text-foreground">${monthly.toLocaleString()}</span>
          </label>
          <label className="rounded-lg border border-border bg-background p-3">
            <span className="text-xs font-semibold text-muted-foreground">Billable hours/month</span>
            <input
              type="range"
              min={40}
              max={160}
              step={10}
              value={hours}
              onChange={event => setHours(Number(event.target.value))}
              className="mt-3 w-full"
            />
            <span className="mt-2 block text-lg font-bold text-foreground">{hours}h</span>
          </label>
        </div>
        <div className="mt-4 rounded-lg border border-orange-400/25 bg-orange-500/10 p-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-orange-300">Suggested minimum rate</p>
          <p className="mt-1 text-4xl font-extrabold text-orange-300">${hourly}/hr</p>
          <p className="mt-2 text-xs text-muted-foreground">Includes a simple 25% buffer for taxes, tools, and downtime.</p>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {[
            { label: "Subject", icon: Mail },
            { label: "Spam", icon: Shield },
            { label: "Value", icon: TrendingUp },
          ].map(({ label, icon: ToolIcon }) => {
            return (
              <div key={label} className="rounded-lg border border-border bg-background/60 px-3 py-2 text-center text-xs text-muted-foreground">
                <ToolIcon className="mx-auto mb-1 h-4 w-4 text-orange-300" />
                {label}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function FeatureInteractiveDemo({ type }: { type: DemoType }) {
  switch (type) {
    case "lead-discovery":
      return <LeadDiscoveryDemo />;
    case "ai-proposals":
      return <ProposalDemo />;
    case "email-outreach":
      return <OutreachDemo />;
    case "crm-pipeline":
      return <CRMDemo />;
    case "analytics":
      return <AnalyticsDemo />;
    case "free-tools":
      return <ToolsDemo />;
    default:
      return <OverviewDemo />;
  }
}
