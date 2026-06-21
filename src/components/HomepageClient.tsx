"use client";

import {
  forwardRef,
  useEffect,
  useRef,
  useState,
  useCallback,
  type HTMLAttributes,
  type MouseEvent,
  type ReactNode,
  type RefObject,
  type SVGProps,
} from "react";
import Link from "next/link";
import {
  ArrowRight, Search, Sparkles, BarChart2, Check, Zap,
  ChevronDown, ChevronLeft, ChevronRight, Star, Shield, Globe, TrendingUp,
  Target, Layers, Bot, Send, Play, ExternalLink,
  CheckCircle2, X,
  Briefcase, Building2, Radio, MapPin, SlidersHorizontal, Users,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PricingCard from "@/components/PricingCard";
import TestimonialCard from "@/components/TestimonialCard";
import { PRICING_TIERS, TESTIMONIALS, type Testimonial } from "@/data/marketing";

type MotionExtras = {
  initial?: unknown;
  animate?: unknown;
  exit?: unknown;
  transition?: unknown;
  whileHover?: unknown;
  layout?: unknown;
};

const motion = {
  div: forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement> & MotionExtras>(
    ({ initial: _initial, animate: _animate, exit: _exit, transition: _transition, whileHover: _whileHover, layout: _layout, ...props }, ref) => (
      <div ref={ref} {...props} />
    )
  ),
  h1: ({ initial: _initial, animate: _animate, exit: _exit, transition: _transition, whileHover: _whileHover, layout: _layout, ...props }: HTMLAttributes<HTMLHeadingElement> & MotionExtras) => (
    <h1 {...props} />
  ),
  p: ({ initial: _initial, animate: _animate, exit: _exit, transition: _transition, whileHover: _whileHover, layout: _layout, ...props }: HTMLAttributes<HTMLParagraphElement> & MotionExtras) => (
    <p {...props} />
  ),
  span: ({ initial: _initial, animate: _animate, exit: _exit, transition: _transition, whileHover: _whileHover, layout: _layout, ...props }: HTMLAttributes<HTMLSpanElement> & MotionExtras) => (
    <span {...props} />
  ),
  svg: ({ initial: _initial, animate: _animate, exit: _exit, transition: _transition, whileHover: _whileHover, layout: _layout, ...props }: SVGProps<SVGSVGElement> & MotionExtras) => (
    <svg {...props} />
  ),
  path: ({ initial: _initial, animate: _animate, exit: _exit, transition: _transition, whileHover: _whileHover, layout: _layout, ...props }: SVGProps<SVGPathElement> & MotionExtras) => (
    <path {...props} />
  ),
};

motion.div.displayName = "MotionDiv";

function AnimatePresence({ children }: { children: ReactNode; mode?: string }) {
  return <>{children}</>;
}

function useInView(ref: RefObject<Element>, { once = true, margin = "0px" }: { once?: boolean; margin?: string } = {}) {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!ref.current) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { rootMargin: margin }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [margin, once, ref]);

  return inView;
}

function useScroll(_: unknown = undefined) {
  return { scrollYProgress: 0 };
}

function useTransform<T>(_: unknown, __: unknown[], output: T[]) {
  return output[0] as T;
}

function useMotionValue(initial: number) {
  const valueRef = useRef(initial);
  return {
    get: () => valueRef.current,
    set: (next: number) => {
      valueRef.current = next;
    },
  };
}

// ── Scroll Reveal ────────────────────────────────────────────────────
function Reveal({ children, delay = 0, y = 28, className = "" }: {
  children: ReactNode; delay?: number; y?: number; className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}>
      {children}
    </motion.div>
  );
}

function TestimonialsCarousel({ testimonials }: { testimonials: Testimonial[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const updateActiveIndex = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const slides = Array.from(scroller.children) as HTMLElement[];
    if (!slides.length) return;

    const viewportStart = scroller.scrollLeft + 16;
    let nearestIndex = 0;
    let nearestDistance = Number.POSITIVE_INFINITY;

    slides.forEach((slide, index) => {
      const distance = Math.abs(slide.offsetLeft - viewportStart);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    });

    setActiveIndex(nearestIndex);
  }, []);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return undefined;

    updateActiveIndex();
    scroller.addEventListener("scroll", updateActiveIndex, { passive: true });
    window.addEventListener("resize", updateActiveIndex);

    return () => {
      scroller.removeEventListener("scroll", updateActiveIndex);
      window.removeEventListener("resize", updateActiveIndex);
    };
  }, [testimonials.length, updateActiveIndex]);

  const scrollToIndex = useCallback((index: number) => {
    const scroller = scrollerRef.current;
    const target = scroller?.children[index] as HTMLElement | undefined;
    if (!scroller || !target) return;

    scroller.scrollTo({
      left: target.offsetLeft - 16,
      behavior: "smooth",
    });
  }, []);

  const scrollByPage = useCallback((direction: -1 | 1) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    scroller.scrollBy({
      left: direction * Math.max(scroller.clientWidth * 0.84, 320),
      behavior: "smooth",
    });
  }, []);

  return (
    <div className="mt-16">
      <div className="mb-5 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => scrollByPage(-1)}
          aria-label="Previous review"
          title="Previous review"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface/80 text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => scrollByPage(1)}
          aria-label="Next review"
          title="Next review"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface/80 text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div
        ref={scrollerRef}
        className="scrollbar-hide -mx-4 flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth px-4 pb-2"
        aria-label="Customer feedback"
      >
        {testimonials.map((testimonial, index) => (
          <div
            key={`${testimonial.name}-${testimonial.niche ?? index}`}
            className="h-[300px] min-w-0 shrink-0 basis-[86%] snap-start sm:basis-[420px] md:basis-[47%] lg:basis-[31.5%]"
          >
            <motion.div
              whileHover={{ y: -4, borderColor: "rgba(159,103,255,0.35)" }}
              transition={{ type: "spring", stiffness: 280, damping: 22 }}
              className="h-full"
            >
              <TestimonialCard testimonial={testimonial} index={index} />
            </motion.div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-center gap-2" aria-label="Review carousel pagination">
        {testimonials.map((testimonial, index) => (
          <button
            key={`${testimonial.avatar}-${index}`}
            type="button"
            onClick={() => scrollToIndex(index)}
            aria-label={`Show review ${index + 1}`}
            title={`Show review ${index + 1}`}
            className={`h-2.5 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${
              activeIndex === index
                ? "w-8 bg-primary"
                : "w-2.5 bg-border hover:bg-primary/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

// ── Animated Counter ─────────────────────────────────────────────────
function Counter({ to, suffix = "", prefix = "", duration = 2200 }: {
  to: number; suffix?: string; prefix?: string; duration?: number;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setCount(Math.round(ease * to));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, to, duration]);
  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
}

// ── 3D Tilt Card ─────────────────────────────────────────────────────
function TiltCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const handleMouseMove = useCallback((e: MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  }, [x, y]);

  return (
    <motion.div ref={ref} onMouseMove={handleMouseMove}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      style={{ transformStyle: "preserve-3d" }}
      className={className}>
      {children}
    </motion.div>
  );
}

// ── Animated Tag Badge ────────────────────────────────────────────────
function Badge({ children, color = "primary" }: { children: ReactNode; color?: "primary" | "accent" | "gold" }) {
  const cls = color === "accent" ? "bg-accent/10 border-accent/25 text-accent"
    : color === "gold" ? "bg-gold/10 border-gold/25 text-gold"
    : "bg-primary/10 border-primary/25 text-primary-light";
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold tracking-wide ${cls}`}>
      {children}
    </span>
  );
}

// ── Section heading ───────────────────────────────────────────────────
function SectionHeading({ badge, badgeColor, title, sub, center = true }: {
  badge?: string; badgeColor?: "primary"|"accent"|"gold"; title: ReactNode; sub?: ReactNode; center?: boolean;
}) {
  return (
    <Reveal className={center ? "text-center" : ""}>
      {badge && <div className={`mb-5 ${center ? "flex justify-center" : ""}`}><Badge color={badgeColor}>{badge}</Badge></div>}
      <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold text-foreground leading-tight mb-4 tracking-tight">{title}</h2>
      {sub && <p className={`text-muted-foreground text-lg leading-relaxed ${center ? "max-w-2xl mx-auto" : ""}`}>{sub}</p>}
    </Reveal>
  );
}

// ── FAQ Item ─────────────────────────────────────────────────────────
function FAQItem({ q, a, i }: { q: string; a: string; i: number }) {
  const [open, setOpen] = useState(false);
  return (
    <Reveal delay={i * 0.06}>
      <div className={`border rounded-2xl overflow-hidden transition-all duration-300 ${open ? "border-primary/40 bg-surface" : "border-border bg-gradient-card"}`}>
        <button onClick={() => setOpen(o => !o)}
          className="w-full flex items-center justify-between px-6 py-4 text-left gap-4 group">
          <span className={`font-semibold text-sm leading-snug transition-colors ${open ? "text-foreground" : "text-foreground/80 group-hover:text-foreground"}`}>{q}</span>
          <motion.div animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.2 }}
            className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${open ? "bg-primary text-white" : "bg-border text-muted-foreground"}`}>
            <ChevronDown className="w-3.5 h-3.5" />
          </motion.div>
        </button>
        <AnimatePresence>
          {open && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
              <p className="px-6 pb-5 text-muted-foreground text-sm leading-relaxed">{a}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Reveal>
  );
}

// ── Step card ────────────────────────────────────────────────────────
function StepCard({ n, icon, title, desc, isLast }: {
  n: string; icon: React.ReactNode; title: string; desc: string; isLast?: boolean;
}) {
  return (
    <div className="relative flex gap-5 group">
      {/* Vertical line */}
      {!isLast && (
        <div className="absolute left-5 top-14 bottom-0 w-px bg-gradient-to-b from-primary/40 via-border to-transparent" />
      )}
      {/* Step circle */}
      <motion.div whileHover={{ scale: 1.1 }} transition={{ type: "spring", stiffness: 400, damping: 20 }}
        className="relative z-10 w-10 h-10 rounded-xl bg-gradient-hero flex items-center justify-center text-white shadow-glow-primary flex-shrink-0 mt-1">
        {icon}
        <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-background border-2 border-primary text-primary-light text-[10px] font-bold flex items-center justify-center">
          {n}
        </span>
      </motion.div>
      <div className="pb-10">
        <h3 className="text-foreground font-bold text-base mb-2 group-hover:text-primary-light transition-colors">{title}</h3>
        <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

// ── Data ─────────────────────────────────────────────────────────────
type LeadEngine = {
  id: string;
  icon: React.ReactNode;
  label: string;
  eyebrow: string;
  title: string;
  promise: string;
  seoLine: string;
  pitch: string;
  route: string;
  publicRoute: string;
  color: string;
  metrics: Array<{ label: string; value: string }>;
  filters: string[];
  leads: Array<{ name: string; detail: string; score: number; signal: string; cta: string }>;
  playbook: string[];
  keywords: string[];
};

const LEAD_ENGINES: LeadEngine[] = [
  {
    id: "remote-jobs",
    icon: <Briefcase className="w-5 h-5" />,
    label: "Remote Jobs",
    eyebrow: "First priority",
    title: "Remote job leads before the crowd floods the inbox",
    promise: "Track fresh remote freelance jobs, contract roles, and async hiring posts by niche, then turn the best matches into personal pitches.",
    seoLine: "Built for searches like remote freelance jobs, remote job leads, freelance job alerts, and work from home client opportunities.",
    pitch: "The best remote jobs do not stay quiet for long. iCloseLeads helps you spot the ones that match your skill before every freelancer on the internet sends the same proposal.",
    route: "/dashboard/leads",
    publicRoute: "/use-cases/remote-job-leads",
    color: "#9F67FF",
    metrics: [
      { label: "Best for", value: "Retainers and contract roles" },
      { label: "Speed angle", value: "Freshest first" },
      { label: "Pitch style", value: "Proof-led intro" },
    ],
    filters: ["WordPress", "Meta ads", "SEO", "React", "Copywriting"],
    leads: [
      { name: "B2B SaaS needs Webflow cleanup", detail: "Remote contract - marketing site refresh", score: 94, signal: "Posted recently", cta: "Lead with speed and proof" },
      { name: "Founder hiring Meta ads specialist", detail: "Growth role - paid social testing", score: 91, signal: "Budget mentioned", cta: "Pitch a 14-day test plan" },
      { name: "Agency needs overflow WordPress help", detail: "Async freelance support", score: 86, signal: "Urgent delivery window", cta: "Offer a rescue sprint" },
    ],
    playbook: [
      "Search one niche at a time so the score stays meaningful.",
      "Open with the specific job signal, not your life story.",
      "Use the AI proposal draft as a starting point, then add one sharp proof point.",
    ],
    keywords: ["remote freelance jobs", "remote job leads", "freelance job alerts", "remote contract work"],
  },
  {
    id: "local-business-leads",
    icon: <Building2 className="w-5 h-5" />,
    label: "Local Business Leads",
    eyebrow: "Second priority",
    title: "Local businesses plus the owner/contact path",
    promise: "Find local business leads that need websites, SEO, booking flows, ads, content, or modernization, then move into owner and manager verification when the lead looks worth pitching.",
    seoLine: "Designed around high-intent searches like local business leads, businesses without websites, outdated website leads, business owner name finder, and web design clients.",
    pitch: "A local business with a weak website is not a random prospect. It is a business already losing trust, bookings, or calls. The Decision Maker layer helps you move from company name to owner, manager, public phone, social proof, and the best next verification step.",
    route: "/dashboard/local-leads",
    publicRoute: "/use-cases/local-business-leads",
    color: "#00E5A0",
    metrics: [
      { label: "Best for", value: "Web, SEO, ads, content" },
      { label: "Buying clue", value: "No site or outdated site" },
      { label: "Contact path", value: "Owner or manager check" },
    ],
    filters: ["No website", "Outdated site", "Has phone", "Find owner", "City search"],
    leads: [
      { name: "Family dental clinic", detail: "Outdated site - strong local reviews", score: 89, signal: "Owner check next", cta: "Pitch booking improvements" },
      { name: "Cleaning company in Houston", detail: "No verified website - phone present", score: 82, signal: "Public contact path", cta: "Find owner then pitch" },
      { name: "Local fitness studio", detail: "Mobile site issues - active business", score: 78, signal: "Manager/social check", cta: "Pitch conversion audit" },
    ],
    playbook: [
      "Start with a helpful observation from the business profile.",
      "Use Decision Maker Finder to look for the owner, manager, social profile, phone route, or proof link before outreach.",
      "Tie the website or marketing gap to calls, bookings, or local trust.",
    ],
    keywords: ["local business leads", "business owner name finder", "businesses without websites", "outdated website leads"],
  },
  {
    id: "live-jobs",
    icon: <Radio className="w-5 h-5" />,
    label: "Live Jobs",
    eyebrow: "Third priority",
    title: "Live job signals you can act on today",
    promise: "Watch public hiring demand, urgent project posts, and fresh client requests in one live feed so you do not miss timing-sensitive opportunities.",
    seoLine: "Useful for live job leads, real-time freelance leads, urgent hiring posts, and fresh freelance opportunities.",
    pitch: "Some leads are won because your offer is better. Others are won because you show up while the problem is still hot. Live Jobs is built for that second window.",
    route: "/dashboard/live-jobs",
    publicRoute: "/use-cases/live-job-leads",
    color: "#FFD166",
    metrics: [
      { label: "Best for", value: "Fast-moving opportunities" },
      { label: "Timing cue", value: "Urgency and recency" },
      { label: "Pitch style", value: "Solve it now" },
    ],
    filters: ["Urgent", "With budget", "With email", "Freshest first", "Source mix"],
    leads: [
      { name: "Startup needs landing page this week", detail: "Launch support - public request", score: 92, signal: "Deadline stated", cta: "Offer a 48-hour scope" },
      { name: "Creator hiring email funnel help", detail: "Revenue project - clear need", score: 84, signal: "Contact signal found", cta: "Pitch quick funnel review" },
      { name: "Small team needs analytics setup", detail: "Tracking issue - immediate pain", score: 80, signal: "Specific problem", cta: "Send diagnostic plan" },
    ],
    playbook: [
      "Sort by freshness when timing matters more than volume.",
      "Use contact filters when you want direct outreach-ready opportunities.",
      "Save the lead and generate a proposal before context gets stale.",
    ],
    keywords: ["live job leads", "real-time freelance leads", "fresh freelance opportunities", "urgent hiring posts"],
  },
];

const FEATURES = [
  {
    icon: <SlidersHorizontal className="w-5 h-5 text-primary-light" />,
    tag: "Lead Filters",
    tagColor: "#9F67FF",
    title: "Search by niche, signal, urgency, and contact fit",
    desc: "Filter remote jobs, local businesses, and live job leads by skill, location, contact data, budget clues, freshness, and website status.",
    stat: "Cleaner search",
  },
  {
    icon: <Users className="w-5 h-5 text-accent" />,
    tag: "Decision Makers",
    tagColor: "#00E5A0",
    title: "Move from business name to owner path",
    desc: "For local leads, open owner and manager checks, social profile searches, public phone routes, registry guidance, and proof links before outreach.",
    stat: "Owner checks",
  },
  {
    icon: <Bot className="w-5 h-5 text-accent" />,
    tag: "AI Proposal",
    tagColor: "#00E5A0",
    title: "Draft outreach that sounds researched",
    desc: "The proposal generator reads the opportunity context and turns it into a practical opener, value angle, subject line, and next step.",
    stat: "Human tone",
  },
  {
    icon: <Target className="w-5 h-5 text-gold" />,
    tag: "Scoring",
    tagColor: "#FFD166",
    title: "Know why a lead is worth your time",
    desc: "Lead scores blend relevance, freshness, urgency, business fit, and contact readiness so you can prioritize instead of guessing.",
    stat: "Signal-based",
  },
  {
    icon: <Layers className="w-5 h-5 text-blue-400" />,
    tag: "CRM",
    tagColor: "#60A5FA",
    title: "A pipeline built for solo closers",
    desc: "Move leads from saved to contacted, replied, follow-up, won, or lost. Keep remote jobs and local business leads in one clean workflow.",
    stat: "6 stages",
  },
  {
    icon: <Send className="w-5 h-5 text-pink-400" />,
    tag: "Outreach",
    tagColor: "#F472B6",
    title: "Gmail-ready, review-first outreach",
    desc: "Prepare polished drafts in Gmail, review every line yourself, and log the outreach inside iCloseLeads without risky auto-send behavior.",
    stat: "Safe prep",
  },
  {
    icon: <BarChart2 className="w-5 h-5 text-purple-400" />,
    tag: "Analytics",
    tagColor: "#A78BFA",
    title: "See which lead engine is working",
    desc: "Track searches, saved leads, prepared proposals, outreach volume, and pipeline movement so your client acquisition becomes measurable.",
    stat: "Full analytics",
  },
];

const SOURCES = ["Remote job leads", "Local business leads", "Owner checks", "Live job signals", "Startup hiring", "Urgent projects", "Website gaps", "Marketing leads", "Design leads", "SEO leads"];

const STATS = [
  { to: 3, suffix: "", prefix: "", label: "Core lead engines", sub: "remote, local + owners, and live jobs", color: "text-primary-light" },
  { to: 16, suffix: "+", prefix: "", label: "Signal paths monitored", sub: "fresh demand in one workflow", color: "text-accent" },
  { to: 100, suffix: "", prefix: "", label: "Free daily lead allowance", sub: "during early access", color: "text-gold" },
  { to: 6, suffix: "", prefix: "", label: "Pipeline stages", sub: "from saved lead to won deal", color: "text-blue-400" },
];

const FAQS = [
  { q: "What are the top three iCloseLeads features?", a: "The homepage focuses on the three lead engines freelancers use most: Remote Jobs for contract and freelance roles, Local Business Leads with Decision Maker checks for owner and manager paths, and Live Jobs for urgent public hiring signals." },
  { q: "Is it really free to start?", a: "Yes. The Free plan gives you fresh lead discovery, AI-assisted proposals, local business search, live job signals, the CRM pipeline, and useful freelancer tools during early access. No credit card is required." },
  { q: "Can I use it to find remote freelance jobs?", a: "Yes. Remote Jobs is built for niche searches like WordPress, Meta ads, SEO, React, design, copywriting, and other freelance skills. It helps you find relevant remote job leads and draft a better first message." },
  { q: "Can I use it for local business lead generation?", a: "Yes. Local Business Leads helps freelancers find businesses with useful outreach angles such as no website, outdated website, phone available, active local profile, or high review potential. Decision Maker Finder then helps you look for the owner, manager, public phone route, social profile, and proof links before pitching." },
  { q: "How does the AI proposal writing work without sounding generic?", a: "The proposal workflow starts from the actual lead context: the job title, business type, visible pain, niche, and your service angle. You still review and edit the message before sending, which keeps the outreach human." },
  { q: "Can I cancel at any time?", a: "Yes — cancel anytime from your profile with zero friction. You keep access until the end of your billing period. No cancellation fees." },
];

function LeadEngineShowcase() {
  const [activeId, setActiveId] = useState(LEAD_ENGINES[0]!.id);
  const active = LEAD_ENGINES.find(engine => engine.id === activeId) ?? LEAD_ENGINES[0]!;

  return (
    <section className="py-24 px-4 relative overflow-hidden" id="lead-engines">
      <div className="absolute inset-0 bg-gradient-to-b from-surface/0 via-surface/45 to-surface/0 pointer-events-none" />
      <div className="max-w-6xl mx-auto relative">
        <SectionHeading
          badge="Lead Engines"
          badgeColor="gold"
          title={<>Three ways to find your<br />next serious client</>}
          sub="Remote jobs first, local business leads second, live jobs third — with Decision Maker Finder built into the local business path so you can move from company name to owner or manager verification."
        />

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-[0.82fr_1.18fr] gap-6 items-stretch">
          <Reveal className="space-y-3">
            {LEAD_ENGINES.map((engine, i) => {
              const isActive = engine.id === active.id;
              return (
                <button
                  key={engine.id}
                  onClick={() => setActiveId(engine.id)}
                  className={`w-full text-left rounded-2xl border p-5 transition-all ${isActive ? "border-primary/50 bg-primary/10 shadow-glow-primary" : "border-border bg-gradient-card hover:border-primary/30 hover:bg-surface"}`}
                >
                  <div className="flex items-start gap-4">
                    <span
                      className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 border"
                      style={{ color: engine.color, background: `${engine.color}16`, borderColor: `${engine.color}35` }}
                    >
                      {engine.icon}
                    </span>
                    <span className="min-w-0">
                      <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground font-bold">{engine.eyebrow}</span>
                      <span className={`block mt-1 font-bold ${isActive ? "text-foreground" : "text-foreground/85"}`}>{i + 1}. {engine.label}</span>
                      <span className="block mt-1 text-sm font-semibold text-foreground/80 leading-snug">{engine.title}</span>
                      <span className="block mt-1.5 text-sm text-muted-foreground leading-relaxed">{engine.promise}</span>
                      {engine.id === "local-business-leads" && (
                        <span className="mt-4 flex flex-wrap items-center gap-2 border-t border-accent/15 pt-3 text-xs">
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/25 bg-accent/10 px-2.5 py-1 font-bold text-accent">
                            <Users className="h-3.5 w-3.5" /> Decision Maker Finder included
                          </span>
                          <span className="text-muted-foreground">Owner, manager, phone route, social proof</span>
                        </span>
                      )}
                    </span>
                  </div>
                </button>
              );
            })}
          </Reveal>

          <Reveal delay={0.12}>
            <div className="h-full rounded-2xl border border-border bg-gradient-card overflow-hidden">
              <div className="border-b border-border bg-background/40 p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div>
                    <Badge color={active.id === "live-jobs" ? "gold" : active.id === "local-business-leads" ? "accent" : "primary"}>
                      {active.label}
                    </Badge>
                    <h3 className="mt-4 text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">{active.title}</h3>
                    <p className="mt-3 text-muted-foreground leading-relaxed">{active.pitch}</p>
                  </div>
                  <div className="flex flex-col gap-2 sm:items-end">
                    <Link
                      href={active.route}
                      prefetch={false}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-primary/35 bg-primary/10 px-4 py-3 text-sm font-semibold text-primary-light hover:bg-primary/20 transition-all flex-shrink-0"
                    >
                      Try this engine <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                      href={active.publicRoute}
                      className="inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Read use case <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {active.metrics.map(metric => (
                    <div key={metric.label} className="rounded-xl border border-border bg-background/55 p-3">
                      <div className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground font-bold">{metric.label}</div>
                      <div className="mt-1 text-sm font-semibold text-foreground">{metric.value}</div>
                    </div>
                  ))}
                </div>
                {active.id === "local-business-leads" && (
                  <div className="mt-5 border-y border-accent/15 py-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-start gap-3">
                        <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-accent/30 bg-accent/10 text-accent">
                          <Users className="h-5 w-5" />
                        </span>
                        <div>
                          <p className="text-sm font-bold text-foreground">Decision Maker Finder is part of this path</p>
                          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                            After you find a local business worth pitching, check for owner names, managers, public phone routes, social profiles, registry guidance, and proof links.
                          </p>
                        </div>
                      </div>
                      <Link
                        href="/features/lead-discovery#capabilities"
                        className="inline-flex flex-shrink-0 items-center justify-center gap-2 rounded-xl border border-accent/30 bg-accent/10 px-4 py-2.5 text-sm font-semibold text-accent hover:bg-accent/15 transition-all"
                      >
                        See owner finder <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-5 sm:p-6">
                <div className="flex flex-wrap gap-2 mb-5">
                  {active.filters.map(filter => (
                    <span key={filter} className="rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold text-muted-foreground">
                      {filter}
                    </span>
                  ))}
                </div>

                <div className="space-y-3">
                  {active.leads.map((lead, i) => (
                    <motion.div
                      key={lead.name}
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="rounded-2xl border border-border bg-background/70 p-4"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${active.color}16`, color: active.color }}>
                          {active.id === "local-business-leads" ? <MapPin className="w-5 h-5" /> : active.id === "live-jobs" ? <Radio className="w-5 h-5" /> : <Briefcase className="w-5 h-5" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-foreground">{lead.name}</h4>
                            <span className="rounded-full bg-accent/10 border border-accent/20 px-2 py-0.5 text-[11px] font-bold text-accent">Score {lead.score}</span>
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">{lead.detail}</p>
                          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                            <span className="rounded-full bg-gold/10 border border-gold/20 px-2.5 py-1 text-gold">{lead.signal}</span>
                            <span className="rounded-full bg-primary/10 border border-primary/20 px-2.5 py-1 text-primary-light">{lead.cta}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-5 rounded-2xl border border-primary/20 bg-primary/5 p-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-foreground mb-3">
                    <Sparkles className="w-4 h-4 text-primary-light" />
                    Recommended playbook
                  </div>
                  <ul className="space-y-2">
                    {active.playbook.map(item => (
                      <li key={item} className="flex gap-2 text-sm text-muted-foreground leading-relaxed">
                        <CheckCircle2 className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-4 text-xs text-muted-foreground leading-relaxed">{active.seoLine}</p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function OpportunityCommandCenter() {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = LEAD_ENGINES[activeIndex] ?? LEAD_ENGINES[0]!;
  const bars = active.leads.map(lead => lead.score);

  return (
    <TiltCard className="relative">
      <div className="relative rounded-2xl border border-border overflow-hidden bg-gradient-card shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-2 px-5 py-3.5 border-b border-border bg-surface/80">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-destructive/60" />
            <div className="w-3 h-3 rounded-full bg-gold/60" />
            <div className="w-3 h-3 rounded-full bg-accent/60" />
          </div>
          <span className="text-xs text-muted-foreground ml-2 font-mono">iCloseLeads - Opportunity Command Center</span>
        </div>

        <div className="p-5">
          <div className="grid grid-cols-3 gap-2 mb-5">
            {LEAD_ENGINES.map((engine, i) => (
              <button
                key={engine.id}
                onClick={() => setActiveIndex(i)}
                className={`rounded-xl border px-2.5 py-2 text-xs font-bold transition-all ${i === activeIndex ? "border-primary/45 bg-primary/15 text-foreground" : "border-border bg-background text-muted-foreground hover:border-primary/30"}`}
              >
                {engine.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 mb-5 px-4 py-3 rounded-xl bg-background border border-border">
            <Search className="w-4 h-4 text-primary-light flex-shrink-0" />
            <span className="text-sm text-foreground font-medium">{active.keywords[0]}</span>
            <span className="ml-auto text-xs text-muted-foreground">Freshest first</span>
            <motion.div className="w-2 h-2 rounded-full bg-accent" animate={{ opacity: [1, 0, 1] }} transition={{ duration: 1, repeat: Infinity }} />
          </div>

          <div className="rounded-2xl border border-border bg-background/60 p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Signal strength</span>
              <span className="text-xs font-bold" style={{ color: active.color }}>{active.label}</span>
            </div>
            <div className="space-y-3">
              {bars.map((score, i) => (
                <div key={`${active.id}-${i}`} className="flex items-center gap-3">
                  <span className="w-16 text-xs text-muted-foreground">Lead {i + 1}</span>
                  <div className="h-2 flex-1 rounded-full bg-border overflow-hidden">
                    <motion.div
                      key={`${active.id}-${score}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${score}%` }}
                      transition={{ duration: 0.55, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{ background: `linear-gradient(90deg, ${active.color}, #00E5A0)` }}
                    />
                  </div>
                  <span className="w-8 text-right text-xs font-bold text-foreground">{score}</span>
                </div>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={active.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
              className="rounded-2xl border border-primary/20 bg-primary/5 p-4"
            >
              <div className="flex items-center gap-2 mb-2.5">
                <Sparkles className="w-3.5 h-3.5 text-accent" />
                <span className="text-xs font-semibold text-foreground">AI pitch angle</span>
                <span className="ml-auto text-[10px] text-accent font-medium">Review before sending</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {active.leads[0]?.cta}. Open with the exact signal, show one relevant proof point, and ask for a small next step.
              </p>
              <Link href={active.route} prefetch={false} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-primary-light transition-colors">
                Explore {active.label} <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -right-4 top-24 px-3 py-2 rounded-xl glass-card border border-accent/25 text-xs font-semibold text-foreground shadow-xl hidden lg:flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
        Fresh signal found
      </motion.div>
    </TiltCard>
  );
}


// ── Early Access Banner (dismissible) ────────────────────────────────────────
function EarlyAccessBanner({ visible, onDismiss }: { visible: boolean; onDismiss: () => void }) {
  if (!visible) return null;
  return (
    <motion.div
      initial={false}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.4 }}
      className="relative z-40 mt-16 overflow-hidden"
    >
      <div className="bg-[#0d0d1f] border-b border-primary/20 text-center py-2 px-10 text-sm">
        <span className="inline-flex items-center gap-2 flex-wrap justify-center">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/15 text-accent text-xs font-bold border border-accent/25">
            ✦ FREE
          </span>
          <span className="text-white/80">
            <strong className="text-white">Early Access</strong> — core lead tools free, no credit card.
          </span>
          <span className="text-white/40 hidden sm:inline">·</span>
          <span className="text-white/60 text-xs hidden sm:inline">Pro &amp; Agency launching soon</span>
          <Link
            href="/auth?mode=signup"
            prefetch={false}
            className="ml-1 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/20 hover:bg-primary/30 text-primary-light text-xs font-semibold border border-primary/25 transition-all"
          >
            Get free access <ArrowRight className="w-3 h-3" />
          </Link>
        </span>
        <button
          onClick={onDismiss}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors p-1"
          aria-label="Dismiss"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
}

// ── Main Component ────────────────────────────────────────────────────
export default function HomepageClient() {
  const heroRef = useRef<HTMLElement>(null);
  const [showEarlyAccess, setShowEarlyAccess] = useState(true);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY       = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  // Force dark mode on homepage regardless of user preference.
  // On unmount (navigation away), restore the saved class.
  useEffect(() => {
    const html     = document.documentElement;
    const savedCls = html.className; // e.g. "light" or ""
    html.classList.remove("light");
    html.style.colorScheme = "dark";
    return () => {
      html.className = savedCls;
      html.style.colorScheme = "";
    };
  }, []);

  return (
    <main className="min-h-screen bg-[#090915] overflow-x-hidden">
      <Navbar />

      {/* ── Early Access Banner ── */}
      <EarlyAccessBanner visible={showEarlyAccess} onDismiss={() => setShowEarlyAccess(false)} />

      {/* ════════════════════════════════════════════
          HERO
      ════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        className={`relative min-h-screen flex items-center justify-center overflow-hidden ${showEarlyAccess ? "pt-8 sm:pt-10" : "pt-20"}`}
      >

        {/* Layered mesh gradient background */}
        <div className="absolute inset-0 mesh-gradient" />

        {/* Grid lines */}
        <div className="absolute inset-0 opacity-[0.035]"
          style={{ backgroundImage: "linear-gradient(rgba(159,103,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(159,103,255,1) 1px, transparent 1px)", backgroundSize: "72px 72px" }} />

        {/* Animated glows */}
        <motion.div animate={{ scale: [1, 1.08, 1], opacity: [0.18, 0.28, 0.18] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 hidden md:block w-[700px] h-[700px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(124,58,237,0.25) 0%, transparent 70%)", filter: "blur(60px)" }} />
        <motion.div animate={{ scale: [1.05, 1, 1.05], opacity: [0.12, 0.2, 0.12] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-1/3 right-1/4 hidden md:block w-[500px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(0,229,160,0.2) 0%, transparent 70%)", filter: "blur(50px)" }} />

        {/* Floating particles */}
        {[
          { x: 12, y: 22, s: 5,  c: "rgba(159,103,255,0.7)", d: 0    },
          { x: 82, y: 18, s: 8,  c: "rgba(0,229,160,0.6)",   d: 1.2  },
          { x: 68, y: 65, s: 6,  c: "rgba(255,209,102,0.5)", d: 0.6  },
          { x: 25, y: 72, s: 10, c: "rgba(124,58,237,0.5)",  d: 1.8  },
          { x: 55, y: 8,  s: 4,  c: "rgba(0,229,160,0.5)",   d: 0.9  },
          { x: 88, y: 78, s: 7,  c: "rgba(159,103,255,0.5)", d: 2.4  },
          { x: 40, y: 85, s: 5,  c: "rgba(255,209,102,0.4)", d: 0.3  },
          { x: 5,  y: 50, s: 3,  c: "rgba(0,229,160,0.4)",   d: 1.5  },
        ].map((p, i) => (
          <motion.div key={i}
            className="absolute hidden sm:block rounded-full pointer-events-none"
            style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.s, height: p.s, background: p.c, boxShadow: `0 0 ${p.s * 3}px ${p.c}` }}
            animate={{ y: [0, -20, 0], opacity: [0.4, 1, 0.4], scale: [1, 1.3, 1] }}
            transition={{ duration: 4 + p.d, repeat: Infinity, delay: p.d, ease: "easeInOut" }}
          />
        ))}

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 text-center px-4 max-w-5xl mx-auto">

          {/* Social proof chip */}
          <motion.div initial={false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2.5 mb-8">
            <div className="flex -space-x-2">
              {["#7C3AED","#00E5A0","#FFD166","#F472B6","#60A5FA"].map((c, i) => (
                <div key={i} className="w-7 h-7 rounded-full border-2 border-background flex items-center justify-center text-[10px] font-bold text-white"
                  style={{ background: c }}>
                  {["M","S","J","A","R"][i]}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-card text-sm">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-gold text-gold" />)}
              </div>
              <span className="text-foreground font-semibold">Remote, local, and live leads</span>
              <span className="text-muted-foreground">in one focused workflow</span>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1 initial={false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.75, delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-foreground leading-[1.05] tracking-tight mb-6">
            Your next{" "}
            <span className="relative inline-block">
              <span className="gradient-text">$10k client</span>
              <motion.svg className="absolute -bottom-2 left-0 w-full" height="8" viewBox="0 0 300 8" fill="none" preserveAspectRatio="none"
                initial={false} animate={{ pathLength: 1, opacity: 1 }} transition={{ delay: 0.8, duration: 0.7 }}>
                <motion.path d="M0 6 Q75 1 150 5 Q225 9 300 4" stroke="url(#ug)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                <defs>
                  <linearGradient id="ug" x1="0" y1="0" x2="300" y2="0" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#9F67FF" />
                    <stop offset="100%" stopColor="#00E5A0" />
                  </linearGradient>
                </defs>
              </motion.svg>
            </span>
            <br />is already out there.
            <br /><span className="text-muted-foreground font-normal text-4xl sm:text-5xl lg:text-6xl">Let AI find them for you.</span>
          </motion.h1>

          {/* Sub */}
          <motion.p initial={false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.25 }}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            iCloseLeads helps freelancers find <strong className="text-foreground">remote job leads</strong>, local business leads, and live job opportunities, then turns each signal into a sharper pitch, Gmail-ready outreach, and a tracked pipeline.
          </motion.p>

          {/* CTAs */}
          <motion.div initial={false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link href="/auth?mode=signup" prefetch={false} className="group relative flex items-center gap-2.5 px-9 py-4 rounded-2xl bg-primary text-white text-base font-bold transition-all shadow-glow-primary hover:shadow-lg hover:bg-primary-light hover:-translate-y-0.5 overflow-hidden">
              <span className="absolute inset-0 bg-gradient-hero opacity-0 group-hover:opacity-100 transition-opacity" />
              <Zap className="w-5 h-5 relative z-10" />
              <span className="relative z-10">Start Free — No Card Needed</span>
              <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a href="#how-it-works" className="flex items-center gap-2 px-7 py-4 rounded-2xl border border-border hover:border-primary/40 text-muted-foreground hover:text-foreground text-base font-medium transition-all hover:bg-surface/60 hover:-translate-y-0.5">
              <Play className="w-4 h-4" />
              See how it works
            </a>
          </motion.div>

          {/* Trust bar */}
          <motion.div initial={false} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-wrap items-center justify-center gap-5 text-sm text-muted-foreground">
            {[
              { icon: <Shield className="w-4 h-4 text-accent" />, t: "Free forever plan" },
              { icon: <Zap className="w-4 h-4 text-gold" />,      t: "Remote jobs first" },
              { icon: <Globe className="w-4 h-4 text-primary-light" />, t: "Local business discovery" },
              { icon: <TrendingUp className="w-4 h-4 text-blue-400" />, t: "Review-first Gmail outreach" },
            ].map(({ icon, t }) => (
              <div key={t} className="flex items-center gap-1.5">{icon}<span>{t}</span></div>
            ))}
          </motion.div>

          {/* Source pills */}
          <motion.div initial={false} animate={{ opacity: 1 }} transition={{ delay: 0.9, duration: 0.6 }}
            className="flex flex-wrap items-center justify-center gap-2 mt-8">
            <span className="text-xs text-muted-foreground mr-1">Lead engines and high-intent signals:</span>
            {SOURCES.map((s, i) => (
              <motion.span key={s} initial={false} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1 + i * 0.06 }}
                className="px-2.5 py-1 rounded-full bg-surface border border-border text-xs text-muted-foreground font-medium">
                {s}
              </motion.span>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll cue */}
        <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          animate={{ y: [0, 8, 0] }} transition={{ duration: 2.2, repeat: Infinity }}>
          <div className="w-5 h-8 rounded-full border border-border/60 flex justify-center pt-1.5">
            <motion.div className="w-1 h-2 rounded-full bg-primary-light/60" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2.2, repeat: Infinity }} />
          </div>
        </motion.div>
      </section>

      <LeadEngineShowcase />

      {/* ════════════════════════════════════════════
          STATS BAR
      ════════════════════════════════════════════ */}
      <section className="py-16 px-4 border-y border-border/60 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 pointer-events-none" />
        <div className="max-w-5xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {STATS.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.1} className="text-center">
              <div className={`text-4xl font-extrabold mb-1 ${s.color}`}>
                <Counter to={s.to} suffix={s.suffix} prefix={s.prefix} />
              </div>
              <div className="text-foreground font-semibold text-sm mb-0.5">{s.label}</div>
              <div className="text-muted-foreground text-xs">{s.sub}</div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════
          HOW IT WORKS
      ════════════════════════════════════════════ */}
      <section className="py-24 px-4" id="how-it-works">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            {/* Left: steps */}
            <div>
              <SectionHeading
                badge="How It Works"
                badgeColor="primary"
                title={<>From lead signal to<br />confident outreach</>}
                sub="The homepage promise is simple: find the right opportunity, understand the angle, write a useful message, and keep every follow-up visible."
                center={false}
              />
              <div className="mt-10 space-y-0">
                <Reveal delay={0.1}>
                  <StepCard n="1" icon={<Search className="w-5 h-5" />}
                    title="Pick the lead engine"
                    desc="Start with Remote Jobs for contract work, Local Business Leads for service businesses and owner/contact discovery, or Live Jobs for fresh public demand. The search language changes with the opportunity type." />
                </Reveal>
                <Reveal delay={0.2}>
                  <StepCard n="2" icon={<Target className="w-5 h-5" />}
                    title="Qualify by signal, not volume"
                    desc="Use relevance, freshness, urgency, contact readiness, website status, and owner/manager verification paths to separate real opportunities from noisy listings." />
                </Reveal>
                <Reveal delay={0.3}>
                  <StepCard n="3" icon={<Sparkles className="w-5 h-5" />}
                    title="Write the first message with context"
                    desc="Generate an AI-assisted proposal that references the actual lead, your niche, and the business reason they should reply. Edit it so it still sounds like you." />
                </Reveal>
                <Reveal delay={0.4}>
                  <StepCard n="4" icon={<Send className="w-5 h-5" />}
                    title="Prepare, save, and follow up" isLast
                    desc="Open Gmail with the draft prepared, save the lead, and keep the deal moving through your freelance CRM until it becomes a client or a clean no." />
                </Reveal>
              </div>
            </div>

            {/* Right: animated dashboard preview */}
            <Reveal delay={0.15}>
              <div className="lg:sticky lg:top-32">
                <OpportunityCommandCenter />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          FEATURES
      ════════════════════════════════════════════ */}
      <section className="py-24 px-4 relative" id="features">
        <div className="absolute inset-0 bg-gradient-to-b from-surface/0 via-surface/50 to-surface/0 pointer-events-none" />
        <div className="max-w-6xl mx-auto relative">
          <SectionHeading
            badge="Everything You Need"
            badgeColor="accent"
            title={<>The complete client<br />acquisition system</>}
            sub="Every tool you need to find leads, write proposals, send emails, and track deals — in one focused platform."
          />

          <div className="mt-16 grid auto-rows-[340px] grid-cols-1 gap-5 sm:auto-rows-[320px] md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={i * 0.07} className="h-full">
                <motion.div
                  whileHover={{ y: -6, borderColor: `${f.tagColor}40` }}
                  transition={{ type: "spring", stiffness: 280, damping: 22 }}
                  className="group relative flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-border bg-gradient-card p-6 cursor-default shimmer-line">
                  {/* Hover glow */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
                    style={{ background: `radial-gradient(ellipse at top left, ${f.tagColor}12 0%, transparent 60%)` }} />

                  <div className="flex items-start justify-between mb-4 relative">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center"
                      style={{ background: `${f.tagColor}15`, border: `1px solid ${f.tagColor}25` }}>
                      {f.icon}
                    </div>
                    <span className="shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-full"
                      style={{ background: `${f.tagColor}12`, color: f.tagColor, border: `1px solid ${f.tagColor}20` }}>
                      {f.tag}
                    </span>
                  </div>

                  <h3 className="relative mb-2.5 line-clamp-2 text-base font-bold text-foreground transition-colors group-hover:text-white">{f.title}</h3>
                  <p className="relative line-clamp-5 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>

                  <div className="relative mt-auto flex items-center justify-between border-t border-border/60 pt-4">
                    <span className="text-xs font-semibold" style={{ color: f.tagColor }}>{f.stat}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
                  </div>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          TESTIMONIALS
      ════════════════════════════════════════════ */}
      <section className="py-24 px-4" id="testimonials">
        <div className="max-w-6xl mx-auto">
          <SectionHeading
            badge="Early Feedback"
            badgeColor="gold"
            title={<>What freelancers notice<br />after 30 days</>}
            sub="The pattern is simple: better lead timing, more relevant outreach, and a cleaner follow-up system."
          />

          <Reveal delay={0.1}>
            <TestimonialsCarousel testimonials={TESTIMONIALS} />
          </Reveal>

          {/* Bottom number strip */}
          <Reveal delay={0.3} className="mt-14 grid grid-cols-3 gap-4">
            {[
              { n: "3", label: "lead engines built around real buying signals" },
              { n: "1", label: "workflow from lead discovery to follow-up" },
              { n: "6", label: "pipeline stages for every client opportunity" },
            ].map(({ n, label }) => (
              <div key={label} className="text-center p-5 rounded-2xl bg-gradient-card border border-border">
                <div className="text-3xl font-extrabold gradient-text mb-1">{n}</div>
                <div className="text-muted-foreground text-sm">{label}</div>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          PRICING
      ════════════════════════════════════════════ */}
      <section className="py-24 px-4 relative" id="pricing">
        <div className="absolute inset-0 bg-gradient-to-b from-surface/0 via-surface/40 to-surface/0 pointer-events-none" />
        <div className="max-w-5xl mx-auto relative">
          <SectionHeading
            badge="Pricing"
            title={<>Free during Early Access.<br />Pro plans coming soon.</>}
            sub="Start with the core lead discovery, AI proposal, CRM, and outreach workflow for free during early access. Pro and Agency plans are launching soon."
          />

          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {PRICING_TIERS.map((tier, i) => (
              <Reveal key={tier.name} delay={i * 0.1}>
                <motion.div whileHover={{ y: tier.highlight ? 0 : -4 }}
                  transition={{ type: "spring", stiffness: 280, damping: 22 }}>
                  <PricingCard tier={tier} index={i} />
                </motion.div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.35} className="mt-8 text-center">
            <p className="text-muted-foreground text-sm">
              Core features are <strong className="text-foreground">free during Early Access</strong>. Paid plans launch later with clear limits and no surprise charges.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          FAQ
      ════════════════════════════════════════════ */}
      <section className="py-24 px-4" id="faq">
        <div className="max-w-3xl mx-auto">
          <SectionHeading
            title="Common questions"
            sub={<>Still not sure? <Link href="/contact" className="text-primary-light hover:underline font-medium">Chat with us →</Link></>}
          />
          <div className="mt-10 space-y-3">
            {FAQS.map((faq, i) => <FAQItem key={i} q={faq.q} a={faq.a} i={i} />)}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          FINAL CTA
      ════════════════════════════════════════════ */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <div className="relative rounded-3xl overflow-hidden border border-primary/25">
              {/* Animated background */}
              <div className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/10" />
                <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 6, repeat: Infinity }}
                  className="absolute top-0 left-1/4 w-96 h-96 rounded-full"
                  style={{ background: "radial-gradient(circle, rgba(124,58,237,0.3) 0%, transparent 70%)", filter: "blur(40px)" }} />
                <motion.div animate={{ scale: [1.05, 1, 1.05], opacity: [0.2, 0.35, 0.2] }} transition={{ duration: 8, repeat: Infinity, delay: 2 }}
                  className="absolute bottom-0 right-1/4 w-72 h-72 rounded-full"
                  style={{ background: "radial-gradient(circle, rgba(0,229,160,0.25) 0%, transparent 70%)", filter: "blur(35px)" }} />
                {/* Grid overlay */}
                <div className="absolute inset-0 opacity-[0.04]"
                  style={{ backgroundImage: "linear-gradient(rgba(159,103,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(159,103,255,1) 1px, transparent 1px)", backgroundSize: "50px 50px" }} />
              </div>

              <div className="relative z-10 py-20 px-8 text-center">
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="w-16 h-16 mx-auto mb-7 rounded-2xl bg-gradient-hero flex items-center justify-center shadow-glow-primary">
                  <Zap className="w-8 h-8 text-white" />
                </motion.div>

                <h2 className="text-4xl sm:text-5xl font-extrabold text-foreground mb-5 tracking-tight">
                  Stop waiting for clients<br />to come to you.
                </h2>
                <p className="text-muted-foreground text-xl mb-10 max-w-lg mx-auto leading-relaxed">
                  Start with remote job leads, local business leads, and live job signals. Then write a better pitch and track every follow-up without leaving the workflow.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link href="/auth?mode=signup" prefetch={false}
                    className="group relative flex items-center gap-3 px-10 py-4 rounded-2xl bg-primary text-white text-lg font-bold transition-all shadow-glow-primary hover:shadow-xl hover:bg-primary-light hover:-translate-y-1 overflow-hidden">
                    <span className="absolute inset-0 bg-gradient-hero opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Zap className="w-5 h-5 relative z-10" />
                    <span className="relative z-10">Find My First Lead — Free</span>
                    <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link href="/auth?mode=signup&plan=pro" prefetch={false}
                    className="flex items-center gap-2 px-8 py-4 rounded-2xl border border-gold/30 hover:border-gold/60 text-gold font-semibold text-base transition-all hover:-translate-y-0.5 hover:bg-gold/5">
                    <Star className="w-4 h-4 fill-gold" />
                    See Early Access
                  </Link>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-accent" /> No credit card</span>
                  <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-accent" /> Free early access</span>
                  <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-accent" /> Remote, local, and live leads</span>
                  <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-accent" /> Review-first outreach</span>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </main>
  );
}
