"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  FileText,
  Layers3,
  Mail,
  MapPin,
  PhoneCall,
  Radio,
  Search,
  Sparkles,
  Target,
  UserRoundSearch,
  Zap,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PricingCard from "@/components/PricingCard";
import TestimonialCard from "@/components/TestimonialCard";
import { MarketingAdBand } from "@/components/AdSenseUnit";
import { PRICING_TIERS, TESTIMONIALS } from "@/data/marketing";
import { useAuthStatus } from "@/lib/use-auth-status";

const leadEngines = [
  {
    id: "local",
    label: "Local businesses",
    icon: Building2,
    color: "text-accent",
    wash: "bg-accent/10",
    title: "Find businesses with a visible reason to buy.",
    description:
      "Search by service and city, spot website and contact gaps, then move from the business profile to the owner or manager path.",
    href: "/use-cases/local-business-leads",
    dashboard: "/dashboard/local-leads",
    filters: ["No website", "Outdated site", "Has phone", "Small operator"],
    results: [
      ["Houston family dental", "Outdated booking flow", "Owner path ready", "91"],
      ["Brooklyn auto repair", "No verified website", "Phone available", "86"],
      ["Austin cleaning service", "Weak local presence", "Manager check", "82"],
    ],
  },
  {
    id: "remote",
    label: "Remote jobs",
    icon: BriefcaseBusiness,
    color: "text-primary-light",
    wash: "bg-primary/10",
    title: "Catch strong remote opportunities while they are fresh.",
    description:
      "Filter contract and freelance roles by niche, freshness, budget clues, and contact readiness before the crowded proposal wave arrives.",
    href: "/use-cases/remote-job-leads",
    dashboard: "/dashboard/leads",
    filters: ["WordPress", "Meta ads", "SEO", "Posted today"],
    results: [
      ["SaaS needs Webflow cleanup", "Remote contract", "Posted 2h ago", "94"],
      ["Agency needs WordPress help", "Overflow support", "Budget signal", "89"],
      ["Founder hiring SEO consultant", "B2B growth", "Email found", "84"],
    ],
  },
  {
    id: "live",
    label: "Live demand",
    icon: Radio,
    color: "text-gold",
    wash: "bg-gold/10",
    title: "Act on public demand while the problem is still hot.",
    description:
      "Watch fresh hiring signals, urgent project requests, and community opportunities, then turn the best match into a pitch immediately.",
    href: "/use-cases/live-job-leads",
    dashboard: "/dashboard/live-jobs",
    filters: ["Urgent", "With budget", "With email", "Freshest first"],
    results: [
      ["Startup needs launch page", "Delivery this week", "Urgent", "92"],
      ["Creator needs email funnel", "Revenue project", "Contact found", "87"],
      ["Team needs analytics setup", "Tracking problem", "Public request", "80"],
    ],
  },
] as const;

const workflow = [
  {
    icon: Search,
    number: "01",
    title: "Choose one market",
    description: "Pick the service, niche, city, or remote role you actually want to win this week.",
    note: "Less noise. Better fit.",
  },
  {
    icon: Target,
    number: "02",
    title: "Find the buying signal",
    description: "See website gaps, fresh hiring posts, urgency, contact details, and opportunity scores together.",
    note: "A reason to reach out.",
  },
  {
    icon: UserRoundSearch,
    number: "03",
    title: "Verify the route",
    description: "Check the owner, manager, public phone, profile, or original job context before you pitch.",
    note: "Know who and why.",
  },
  {
    icon: PhoneCall,
    number: "04",
    title: "Call, pitch, and follow up",
    description: "Draft the proposal, prepare outreach, call from the softphone when useful, and keep the next action visible in CRM.",
    note: "From signal to live conversation.",
  },
];

const features = [
  [UserRoundSearch, "Decision maker paths", "Move from a local business name to owner, manager, social, phone, and proof checks."],
  [Sparkles, "Context-aware proposals", "Start from the actual lead signal so your first draft sounds researched, not mass-produced."],
  [Mail, "Review-first outreach", "Prepare a Gmail-ready message, check every line yourself, and keep the activity attached to the lead."],
  [PhoneCall, "Built-in softphone", "Buy a dedicated number and monthly minutes, then call leads from the same workspace."],
  [Layers3, "A freelancer CRM", "Track saved, contacted, replied, follow-up, won, and lost without adopting an enterprise sales stack."],
  [BarChart3, "Useful analytics", "See which searches, niches, and outreach actions are creating real pipeline movement."],
  [FileText, "Client-ready website concepts", "Turn a qualified local lead into a tailored website direction you can share in the sales conversation."],
] as const;

const audiences = [
  ["Web designers", "Find businesses with no site, an outdated site, or a weak booking journey.", "/lead-generation/web-design-leads"],
  ["SEO and ads specialists", "Spot local and remote buyers already showing growth intent.", "/lead-generation/local-business-leads"],
  ["Developers", "Catch remote contracts and urgent implementation work by stack.", "/lead-generation/remote-freelance-jobs"],
  ["Lean agencies", "Build a focused prospect list, share context, and keep follow-up visible.", "/use-cases/freelance-cold-outreach"],
] as const;

const faq = [
  ["What does iCloseLeads actually do?", "It brings local business leads, remote jobs, live opportunity signals, decision-maker research, AI proposals, outreach preparation, softphone calling, and CRM follow-up into one freelancer-focused workflow."],
  ["Is it free to start?", "Yes. Free users can start with 600 weekly lead searches without a credit card. Choose Pro or Agency when you want higher limits and advanced workflows."],
  ["Can I call leads from iCloseLeads?", "Yes. Every plan can access the softphone option. You can buy a dedicated phone number and monthly calling minutes, then call prospects from the dashboard while keeping the lead context nearby."],
  ["Where do the leads come from?", "iCloseLeads monitors public opportunity signals and business data paths, then normalizes and scores the results so you can search them from one place."],
  ["Does AI send messages automatically?", "No. AI helps create a stronger draft, but you review the message and stay in control of what is sent."],
  ["Can I find local business owners?", "The Decision Maker workflow helps you check possible owner or manager paths, public profiles, phone routes, social searches, and supporting proof before outreach."],
  ["Is this another generic job board?", "No. A job board stops at the listing. iCloseLeads connects discovery to qualification, proposal writing, outreach, notes, application tracking, and follow-up."],
] as const;

function marketingEvent(name: string, data: Record<string, string> = {}) {
  if (typeof window === "undefined") return;
  window.gtag?.("event", name, data);
  window.dispatchEvent(new CustomEvent("icloseleads:marketing", { detail: { name, ...data } }));
}

function signupHref(intent: string, source: string) {
  return `/auth?mode=signup&intent=${encodeURIComponent(intent)}&source=${encodeURIComponent(source)}`;
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="marketing-kicker inline-flex items-center gap-2">
      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
      {children}
    </p>
  );
}

function ProductPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[620px] lg:mx-0">
      <div className="absolute -left-5 top-20 hidden w-44 rounded-lg border border-border bg-background p-3 shadow-card sm:block">
        <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-accent/10 text-accent"><MapPin className="h-4 w-4" /></span>
          Local signal found
        </div>
        <p className="mt-2 text-xs leading-5 text-muted-foreground">No verified website. Public phone available.</p>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-card">
        <div className="flex items-center justify-between border-b border-border bg-background/75 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-gold" />
            <span className="h-2.5 w-2.5 rounded-full bg-accent" />
          </div>
          <span className="text-xs font-semibold text-muted-foreground">Lead workspace</span>
          <span className="rounded-full bg-accent/10 px-2 py-1 text-[11px] font-bold text-accent">LIVE</span>
        </div>

        <div className="grid min-h-[430px] sm:grid-cols-[170px_1fr]">
          <div className="hidden border-r border-border bg-background/55 p-4 sm:block">
            <p className="text-[11px] font-bold uppercase text-muted-foreground">Lead engines</p>
            <div className="mt-4 space-y-2">
              {[
                [Building2, "Local leads", true],
                [BriefcaseBusiness, "Remote jobs", false],
                [Radio, "Live demand", false],
              ].map(([Icon, label, active]) => {
                const ItemIcon = Icon as typeof Building2;
                return (
                  <div key={label as string} className={`flex items-center gap-2 rounded-md px-3 py-2 text-xs font-semibold ${active ? "bg-primary text-white" : "text-muted-foreground"}`}>
                    <ItemIcon className="h-4 w-4" /> {label as string}
                  </div>
                );
              })}
            </div>
            <div className="mt-8 border-t border-border pt-4">
              <p className="text-[11px] font-bold uppercase text-muted-foreground">Pipeline</p>
              <div className="mt-3 space-y-2 text-xs text-muted-foreground">
                <p>Saved leads <strong className="float-right text-foreground">18</strong></p>
                <p>Follow-ups <strong className="float-right text-foreground">6</strong></p>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-primary-light">LOCAL BUSINESS LEADS</p>
                <h2 className="mt-1 text-xl font-bold text-foreground">Businesses worth a closer look</h2>
              </div>
              <span className="hidden rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-muted-foreground sm:block">Houston, TX</span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {["No website", "Has phone", "4+ rating"].map((filter, index) => (
                <span key={filter} className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${index === 0 ? "border-primary/35 bg-primary/10 text-primary-light" : "border-border text-muted-foreground"}`}>{filter}</span>
              ))}
            </div>

            <div className="mt-5 divide-y divide-border overflow-hidden rounded-lg border border-border bg-background/55">
              {[
                ["Northline Dental", "Clinic", "Outdated booking flow", "91"],
                ["Brightway Cleaning", "Home service", "No verified website", "86"],
                ["Peak Fitness Studio", "Fitness", "Mobile experience gap", "82"],
              ].map(([name, category, signal, score]) => (
                <div key={name} className="grid grid-cols-[1fr_auto] items-center gap-4 p-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-bold text-foreground">{name}</p>
                      <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-bold text-accent">{category}</span>
                    </div>
                    <p className="mt-1 truncate text-xs text-muted-foreground">{signal}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-foreground">{score}</p>
                    <p className="text-[10px] text-muted-foreground">score</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between rounded-lg border border-accent/20 bg-accent/10 px-4 py-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-accent" />
                <span className="text-xs font-semibold text-foreground">Pitch angle ready</span>
              </div>
              <ArrowRight className="h-4 w-4 text-accent" />
            </div>
          </div>
        </div>
      </div>

      <div className="absolute -bottom-5 -right-3 hidden w-48 rounded-lg border border-border bg-background p-3 shadow-card sm:block">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary-light"><Sparkles className="h-4 w-4" /></span>
          <div>
            <p className="text-xs font-bold text-foreground">Proposal drafted</p>
            <p className="text-[11px] text-muted-foreground">Ready for your review</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function LeadEngineSection({ isAuthenticated }: { isAuthenticated: boolean }) {
  const [active, setActive] = useState<(typeof leadEngines)[number]["id"]>("local");
  const engine = leadEngines.find(item => item.id === active) ?? leadEngines[0];
  const Icon = engine.icon;

  return (
    <section id="lead-engines" className="marketing-section bg-surface/45">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div className="lg:sticky lg:top-24">
            <Eyebrow>Three ways into the market</Eyebrow>
            <h2 className="marketing-display mt-5 max-w-xl text-4xl font-bold text-foreground sm:text-5xl">
              Start where your next client is already showing intent.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-8 text-muted-foreground">
              Switch lead engines without changing your workflow. Every strong result can move into the same proposal, notes, outreach, and follow-up system.
            </p>

            <div className="mt-8 grid gap-2" role="tablist" aria-label="Lead engines">
              {leadEngines.map(item => {
                const TabIcon = item.icon;
                const selected = active === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    onClick={() => setActive(item.id)}
                    className={`flex min-h-[58px] items-center justify-between rounded-lg border px-4 py-3 text-left transition-colors ${selected ? "border-primary/40 bg-background text-foreground shadow-card" : "border-transparent text-muted-foreground hover:border-border hover:bg-background/60"}`}
                  >
                    <span className="flex items-center gap-3 font-semibold"><TabIcon className={`h-5 w-5 ${item.color}`} />{item.label}</span>
                    <ArrowRight className={`h-4 w-4 ${selected ? "text-primary-light" : "text-muted-foreground"}`} />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-border bg-background shadow-card">
            <div className="border-b border-border p-5 sm:p-7">
              <div className={`mb-5 flex h-11 w-11 items-center justify-center rounded-lg ${engine.wash} ${engine.color}`}><Icon className="h-5 w-5" /></div>
              <h3 className="text-2xl font-bold text-foreground sm:text-3xl">{engine.title}</h3>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">{engine.description}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {engine.filters.map(filter => <span key={filter} className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold text-muted-foreground">{filter}</span>)}
              </div>
            </div>

            <div className="divide-y divide-border">
              {engine.results.map(([name, detail, signal, score]) => (
                <div key={name} className="grid gap-4 p-5 sm:grid-cols-[1fr_auto] sm:items-center sm:px-7">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold text-foreground">{name}</p>
                      <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[11px] font-bold text-accent">Score {score}</span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{detail} - {signal}</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="inline-flex items-center rounded-md border border-border px-3 py-2 text-xs font-semibold text-muted-foreground">Save</span>
                    <span className="inline-flex items-center gap-1 rounded-md bg-blue-700 px-3 py-2 text-xs font-semibold text-white">Draft pitch <Sparkles className="h-3 w-3" /></span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3 border-t border-border bg-surface/65 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
              <Link href={engine.href} className="text-sm font-semibold text-primary-light hover:text-primary">Explore this workflow</Link>
              <Link
                href={isAuthenticated ? engine.dashboard : signupHref(engine.id, "homepage-engine")}
                prefetch={false}
                onClick={() => marketingEvent("homepage_engine_cta", { engine: engine.id })}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-foreground px-4 py-2.5 text-sm font-bold text-background"
              >
                {isAuthenticated ? "Open search" : "Try it free"} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SoftphoneInfographic({ isAuthenticated }: { isAuthenticated: boolean }) {
  const steps = [
    [Search, "Find", "Local lead or remote prospect"],
    [UserRoundSearch, "Verify", "Owner, manager, or phone route"],
    [PhoneCall, "Call", "Browser softphone in iCloseLeads"],
    [Layers3, "Follow up", "Notes and status stay in CRM"],
  ] as const;

  return (
    <section id="softphone" className="marketing-section border-y border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
          <div>
            <Eyebrow>Built-in softphone</Eyebrow>
            <h2 className="marketing-display mt-5 text-4xl font-bold text-foreground sm:text-5xl">
              Call from the same place you found the lead.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-8 text-muted-foreground">
              Every plan can access the softphone option. Activate a dedicated phone number, choose a monthly minute package, and call prospects without leaving the lead workflow.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href={isAuthenticated ? "/dashboard/softphone" : signupHref("softphone", "homepage-softphone")}
                prefetch={false}
                onClick={() => marketingEvent("homepage_softphone_cta", { state: isAuthenticated ? "authenticated" : "guest" })}
                className="marketing-primary-cta"
              >
                {isAuthenticated ? "Open softphone" : "Start free, add calling later"}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/features/softphone" className="marketing-secondary-cta">
                See softphone feature
              </Link>
            </div>
            <p className="mt-4 text-xs leading-5 text-muted-foreground">
              Phone numbers and calling minute packages are billed separately through secure checkout.
            </p>
          </div>

          <div className="rounded-lg border border-border bg-surface p-4 shadow-card sm:p-5">
            <div className="grid gap-3 sm:grid-cols-4">
              {steps.map(([StepIcon, title, detail], index) => (
                <div key={title} className="relative rounded-lg border border-border bg-background p-4">
                  {index < steps.length - 1 && (
                    <div className="absolute left-[calc(100%-0.25rem)] top-9 hidden h-px w-4 bg-border sm:block" aria-hidden="true" />
                  )}
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                    <StepIcon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 text-sm font-bold text-foreground">{title}</h3>
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">{detail}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-lg border border-border bg-background p-5">
                <p className="text-xs font-bold uppercase text-muted-foreground">Lead context</p>
                <h3 className="mt-2 text-xl font-bold text-foreground">Northline Dental</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Outdated booking flow. Public phone available. Owner route ready for review.
                </p>
                <div className="mt-5 space-y-2 text-xs text-muted-foreground">
                  {["Best angle: appointment friction", "Status: qualified", "Next step: call or email"].map(item => (
                    <p key={item} className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-accent" />
                      {item}
                    </p>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-accent/25 bg-accent/10 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase text-accent">Softphone ready</p>
                    <p className="mt-1 text-sm text-muted-foreground">Dedicated number + monthly minutes</p>
                  </div>
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-background text-accent">
                    <PhoneCall className="h-5 w-5" />
                  </span>
                </div>
                <div className="mt-5 rounded-lg border border-border bg-background px-4 py-5 text-center">
                  <p className="text-xs font-semibold text-muted-foreground">Calling</p>
                  <p className="mt-1 text-2xl font-extrabold text-foreground">(713) 555-0148</p>
                </div>
                <div className="mt-4 flex items-center justify-between rounded-lg border border-border bg-background px-4 py-3">
                  <span className="text-xs font-semibold text-muted-foreground">Minutes remaining</span>
                  <span className="text-sm font-bold text-accent">182</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const ref = useRef<HTMLDivElement>(null);
  const move = (direction: number) => ref.current?.scrollBy({ left: direction * 420, behavior: "smooth" });

  return (
    <section className="marketing-section overflow-hidden bg-surface/45">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Eyebrow>What early users notice</Eyebrow>
            <h2 className="marketing-display mt-5 max-w-3xl text-4xl font-bold text-foreground sm:text-5xl">A calmer way to keep client acquisition moving.</h2>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => move(-1)} aria-label="Previous reviews" className="marketing-icon-button"><ChevronLeft className="h-5 w-5" /></button>
            <button type="button" onClick={() => move(1)} aria-label="Next reviews" className="marketing-icon-button"><ChevronRight className="h-5 w-5" /></button>
          </div>
        </div>
        <div ref={ref} className="scrollbar-hide -mx-4 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2">
          {TESTIMONIALS.map((testimonial, index) => (
            <div key={`${testimonial.name}-${index}`} className="h-[310px] shrink-0 basis-[88%] snap-start sm:basis-[420px] lg:basis-[32%]">
              <TestimonialCard testimonial={testimonial} index={index} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function HomepageClient() {
  const authStatus = useAuthStatus();
  const isAuthenticated = authStatus === "authenticated";
  const [openFaq, setOpenFaq] = useState(0);
  const primaryHref = isAuthenticated ? "/dashboard/local-leads" : signupHref("first-search", "homepage-hero");

  return (
    <div className="marketing-shell min-h-screen overflow-x-hidden bg-background text-foreground">
      <Navbar />
      <main>
        <section className="marketing-hero relative overflow-hidden border-b border-border pt-16">
          <div className="marketing-grid absolute inset-0 opacity-60" aria-hidden="true" />
          <div className="relative mx-auto grid min-h-[calc(100svh-7rem)] max-w-7xl items-center gap-14 px-4 py-14 sm:px-6 sm:py-20 lg:min-h-[760px] lg:grid-cols-[0.92fr_1.08fr] lg:px-8 lg:py-24">
            <div className="min-w-0 max-w-2xl">
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-border bg-surface/80 px-3 py-1.5 text-xs font-bold text-muted-foreground shadow-sm">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/15 text-accent"><Zap className="h-3 w-3" /></span>
                600 free weekly lead searches - no card required
              </div>
              <h1 className="marketing-display break-words text-5xl font-bold leading-[1.02] text-foreground sm:text-6xl lg:text-[72px]">
                Find the lead. Know the angle. Start the conversation.
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
                iCloseLeads helps freelancers find local businesses, remote jobs, and live demand, then verify the contact path, draft the pitch, call from the platform, and track every follow-up.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={primaryHref}
                  prefetch={false}
                  onClick={() => marketingEvent("homepage_primary_cta", { state: isAuthenticated ? "authenticated" : "guest" })}
                  className="marketing-primary-cta"
                >
                  {isAuthenticated ? "Open your lead workspace" : "Start free with 600 leads"}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="#how-it-works" className="marketing-secondary-cta">See how it works</Link>
              </div>

              <div className="mt-5 flex flex-col gap-2 text-sm font-semibold text-muted-foreground sm:flex-row sm:flex-wrap sm:items-center">
                <Link
                  href="/blog/freelance-client-acquisition-system"
                  prefetch={false}
                  onClick={() => marketingEvent("homepage_gsc_insight_guide_click", { guide: "freelance-client-acquisition-system" })}
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface/70 px-3 py-2 text-foreground transition-colors hover:border-primary/50 hover:text-primary-light"
                >
                  Popular guide: turn 600 weekly leads into a focused sprint
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href={isAuthenticated ? "/dashboard/local-leads" : signupHref("freelance-client-acquisition-system", "homepage-gsc-insight")}
                  prefetch={false}
                  onClick={() => marketingEvent("homepage_gsc_insight_signup_click", { state: isAuthenticated ? "authenticated" : "guest" })}
                  className="inline-flex items-center gap-2 text-primary-light hover:text-foreground"
                >
                  Start a focused lead search
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                {["600 weekly lead searches", "Stripe plan upgrades", "Paid softphone add-ons"].map(item => (
                  <span key={item} className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-accent" />{item}</span>
                ))}
              </div>
            </div>

            <ProductPreview />
          </div>
        </section>

        <section className="border-b border-border bg-surface/60 px-4 py-7 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-7xl flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <p className="text-sm font-semibold text-foreground">One client acquisition workflow for independent experts</p>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 sm:flex sm:flex-wrap sm:items-center sm:gap-8">
              {[
                ["3", "lead engines"],
                ["16+", "signal paths"],
                ["6", "pipeline stages"],
                ["$0", "to start"],
              ].map(([value, label]) => (
                <div key={label} className="flex items-baseline gap-2"><strong className="text-xl text-foreground">{value}</strong><span className="text-xs text-muted-foreground">{label}</span></div>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="marketing-section">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <Eyebrow>How iCloseLeads works</Eyebrow>
              <h2 className="marketing-display mt-5 text-4xl font-bold text-foreground sm:text-5xl">Four steps from open market to open conversation.</h2>
              <p className="mt-5 text-base leading-8 text-muted-foreground">No giant sales stack. No stale spreadsheet. Start with one focused search and keep the context all the way through follow-up.</p>
            </div>

            <div className="relative mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="absolute left-[10%] right-[10%] top-8 hidden border-t border-dashed border-primary/35 lg:block" aria-hidden="true" />
              {workflow.map(({ icon: Icon, number, title, description, note }) => (
                <article key={number} className="relative rounded-lg border border-border bg-surface p-5">
                  <div className="relative z-10 flex items-center justify-between">
                    <span className="flex h-12 w-12 items-center justify-center rounded-lg border border-primary/25 bg-background text-primary-light"><Icon className="h-5 w-5" /></span>
                    <span className="text-xs font-bold text-muted-foreground">{number}</span>
                  </div>
                  <h3 className="mt-8 text-xl font-bold text-foreground">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{description}</p>
                  <p className="mt-6 border-t border-border pt-4 text-xs font-bold text-primary-light">{note}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <LeadEngineSection isAuthenticated={isAuthenticated} />

        <SoftphoneInfographic isAuthenticated={isAuthenticated} />

        <MarketingAdBand />

        <section className="marketing-section">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-[0.86fr_1.14fr] lg:items-center">
              <div>
                <Eyebrow>Prospecting without the drag</Eyebrow>
                <h2 className="marketing-display mt-5 text-4xl font-bold text-foreground sm:text-5xl">Client acquisition should not feel like a second job.</h2>
                <p className="mt-5 text-base leading-8 text-muted-foreground">The useful parts of research, writing, and follow-up stay connected. The repetitive tab-hopping does not.</p>
                <Link href={isAuthenticated ? "/dashboard/local-leads" : signupHref("old-vs-new", "homepage-comparison")} prefetch={false} className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-primary-light">Try the simpler workflow <ArrowRight className="h-4 w-4" /></Link>
              </div>

              <div className="grid overflow-hidden rounded-lg border border-border bg-surface sm:grid-cols-2">
                <div className="border-b border-border p-6 sm:border-b-0 sm:border-r">
                  <p className="text-xs font-bold uppercase text-muted-foreground">The scattered way</p>
                  <div className="mt-6 space-y-5">
                    {["Refresh several job boards", "Copy leads into another spreadsheet", "Write from a blank page", "Forget who needs a follow-up"].map(item => (
                      <p key={item} className="flex gap-3 text-sm leading-6 text-muted-foreground"><CircleDot className="mt-1 h-4 w-4 shrink-0 text-red-400" />{item}</p>
                    ))}
                  </div>
                </div>
                <div className="bg-primary/[0.06] p-6">
                  <p className="text-xs font-bold uppercase text-primary-light">The iCloseLeads way</p>
                  <div className="mt-6 space-y-5">
                    {["Search three lead engines in one place", "Score and save only the pitchable leads", "Draft or call from the real opportunity context", "Keep every next step visible"].map(item => (
                      <p key={item} className="flex gap-3 text-sm font-medium leading-6 text-foreground"><Check className="mt-1 h-4 w-4 shrink-0 text-accent" />{item}</p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="marketing-section overflow-x-clip border-y border-border bg-card text-foreground">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid min-w-0 gap-10 xl:grid-cols-[minmax(17rem,0.72fr)_minmax(0,1.28fr)] xl:gap-14">
              <div className="min-w-0 max-w-xl">
                <p className="text-xs font-bold uppercase text-muted-foreground">One connected workspace</p>
                <h2 className="marketing-display mt-5 break-words text-4xl font-bold sm:text-5xl">The lead is only useful if you know what to do next.</h2>
                <p className="mt-5 text-base leading-8 text-muted-foreground">Every feature supports the same motion: find, understand, email or call, and follow up.</p>
              </div>
              <div className="grid min-w-0 divide-y divide-border border-y border-border sm:grid-cols-2 sm:divide-x sm:divide-y-0">
                {features.map(([Icon, title, description], index) => (
                  <div key={title} className={`min-w-0 p-5 sm:p-6 ${index > 1 ? "sm:border-t sm:border-border" : ""}`}>
                    <Icon className="h-5 w-5 text-accent" />
                    <h3 className="mt-5 text-lg font-bold">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="marketing-section">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <Eyebrow>Built around how you sell</Eyebrow>
              <h2 className="marketing-display mt-5 text-4xl font-bold text-foreground sm:text-5xl">Useful for specialists, not just sales teams.</h2>
            </div>
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {audiences.map(([title, description, href], index) => (
                <Link key={title} href={href} className="group flex min-h-[245px] flex-col rounded-lg border border-border bg-surface p-5 transition-colors hover:border-primary/40">
                  <span className="text-xs font-bold text-muted-foreground">0{index + 1}</span>
                  <h3 className="mt-10 text-xl font-bold text-foreground">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{description}</p>
                  <span className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-bold text-primary-light">See the workflow <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <Testimonials />

        <section id="pricing" className="marketing-section">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <Eyebrow>Start free, continue when ready</Eyebrow>
              <h2 className="marketing-display mt-5 text-4xl font-bold text-foreground sm:text-5xl">Find out if the leads are worth pitching first.</h2>
              <p className="mt-5 text-base leading-8 text-muted-foreground">The free weekly allowance gives you a real starting point with 600 lead searches. Pro and Agency keep lead discovery active at higher volume, while every plan can add paid softphone calling with a dedicated number and monthly minutes.</p>
            </div>
            <div className="mx-auto mt-12 grid max-w-6xl gap-5 lg:grid-cols-3">
              {PRICING_TIERS.map((tier, index) => <PricingCard key={tier.name} tier={tier} index={index} />)}
            </div>
          </div>
        </section>

        <section className="marketing-section border-y border-border bg-surface/45">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.75fr_1.25fr] lg:px-8">
            <div>
              <Eyebrow>Frequently asked</Eyebrow>
              <h2 className="marketing-display mt-5 text-4xl font-bold text-foreground sm:text-5xl">Questions before your first search.</h2>
              <p className="mt-5 text-base leading-8 text-muted-foreground">Still unsure? Start free and judge the workflow by the leads it gives you.</p>
            </div>
            <div className="divide-y divide-border border-y border-border">
              {faq.map(([question, answer], index) => {
                const open = openFaq === index;
                return (
                  <div key={question}>
                    <button type="button" onClick={() => setOpenFaq(open ? -1 : index)} className="flex w-full items-center justify-between gap-5 py-5 text-left" aria-expanded={open}>
                      <span className="font-bold text-foreground">{question}</span>
                      <ChevronDown className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
                    </button>
                    {open && <p className="max-w-2xl pb-6 text-sm leading-7 text-muted-foreground">{answer}</p>}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto grid max-w-7xl overflow-hidden rounded-lg border border-blue-700 bg-blue-800 text-white lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="p-7 sm:p-10 lg:p-12">
              <p className="text-xs font-bold uppercase text-blue-100">Your next client is already showing a signal</p>
              <h2 className="marketing-display mt-4 max-w-3xl text-4xl font-bold sm:text-5xl">Stop wondering where the next conversation will come from.</h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-blue-100">Run one focused search, save the best opportunity, and write or call from the same workspace.</p>
            </div>
            <div className="border-t border-white/20 p-7 lg:border-l lg:border-t-0 lg:p-12">
              <Link href={primaryHref} prefetch={false} className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-bold text-blue-800">
                {isAuthenticated ? "Open workspace" : "Start free"} <ArrowRight className="h-4 w-4" />
              </Link>
              <p className="mt-3 text-xs text-blue-100">No card. Cancel nothing.</p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
