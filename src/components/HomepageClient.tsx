"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  motion, useScroll, useTransform, useInView,
  AnimatePresence, useMotionValue, useSpring,
} from "framer-motion";
import Link from "next/link";
import {
  ArrowRight, Search, Sparkles, BarChart2, Check, Zap,
  ChevronDown, Star, Shield, Globe, Users, TrendingUp,
  Target, Layers, Bot, Send, Mail, Play, ExternalLink,
  CheckCircle2, X, AlertCircle, Clock, DollarSign,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PricingCard from "@/components/PricingCard";
import TestimonialCard from "@/components/TestimonialCard";
import { PRICING_TIERS, TESTIMONIALS } from "@/data/marketing";

// ── Variants ────────────────────────────────────────────────────────
const fadeUp = {
  hidden:  { opacity: 0, y: 32 },
  visible: (d: number = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.65, delay: d, ease: [0.22, 1, 0.36, 1] } }),
};
const fadeIn = {
  hidden:  { opacity: 0 },
  visible: (d: number = 0) => ({ opacity: 1, transition: { duration: 0.5, delay: d } }),
};
const stagger = { visible: { transition: { staggerChildren: 0.09 } } };

// ── Scroll Reveal ────────────────────────────────────────────────────
function Reveal({ children, delay = 0, y = 28, className = "" }: {
  children: React.ReactNode; delay?: number; y?: number; className?: string;
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
function TiltCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), { stiffness: 300, damping: 30 });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  }, [x, y]);

  return (
    <motion.div ref={ref} onMouseMove={handleMouseMove}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className={className}>
      {children}
    </motion.div>
  );
}

// ── Animated Tag Badge ────────────────────────────────────────────────
function Badge({ children, color = "primary" }: { children: React.ReactNode; color?: "primary" | "accent" | "gold" }) {
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
  badge?: string; badgeColor?: "primary"|"accent"|"gold"; title: React.ReactNode; sub?: React.ReactNode; center?: boolean;
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

// ── Animated Checkmark row ────────────────────────────────────────────
function CheckRow({ text, delay = 0 }: { text: string; delay?: number }) {
  return (
    <motion.li variants={fadeUp} custom={delay} className="flex items-start gap-3 text-sm text-muted-foreground">
      <CheckCircle2 className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
      <span>{text}</span>
    </motion.li>
  );
}

// ── Orbiting dots ─────────────────────────────────────────────────────
function OrbitDot({ r, angle, color, size = 6 }: { r: number; angle: number; color: string; size?: number }) {
  return (
    <motion.div
      className={`absolute rounded-full`}
      style={{ width: size, height: size, background: color, boxShadow: `0 0 ${size * 2}px ${color}` }}
      animate={{ rotate: [angle, angle + 360] }}
      transition={{ duration: 12 + r / 10, repeat: Infinity, ease: "linear" }}
      transformTemplate={({ rotate }) => `rotate(${rotate}deg) translateX(${r}px) rotate(-${rotate}deg)`}
    />
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
const PAIN_POINTS = [
  { icon: <Clock className="w-5 h-5" />, bad: "Wasting hours scrolling job boards manually", good: "Get 100+ qualified leads in 30 seconds" },
  { icon: <AlertCircle className="w-5 h-5" />, bad: "Sending generic proposals that get ignored", good: "AI writes personalized outreach for each lead" },
  { icon: <X className="w-5 h-5" />, bad: "No system — leads fall through the cracks", good: "Built-in CRM tracks every deal to close" },
];

const FEATURES = [
  {
    icon: <Search className="w-5 h-5 text-primary-light" />,
    tag: "Discovery",
    tagColor: "#9F67FF",
    title: "16 Live Sources, One Search",
    desc: "We simultaneously scan remote job boards, Reddit, Hacker News, GitHub bounty issues, and curated freelance feeds. Every result is fresh, real, and scored.",
    stat: "16 sources",
  },
  {
    icon: <Bot className="w-5 h-5 text-accent" />,
    tag: "AI Engine",
    tagColor: "#00E5A0",
    title: "Proposals That Actually Get Replies",
    desc: "Groq's Llama 3.3 reads the lead context and writes a cold email that sounds like you wrote it — not like ChatGPT. Personalized in 3 seconds.",
    stat: "3-sec generation",
  },
  {
    icon: <Target className="w-5 h-5 text-gold" />,
    tag: "Scoring",
    tagColor: "#FFD166",
    title: "Quality Score 0–100 on Every Lead",
    desc: "Our AI rates every lead on relevance, recency, and signal strength. You see only what's worth your time — not a sea of noise.",
    stat: "100% scored",
  },
  {
    icon: <Layers className="w-5 h-5 text-blue-400" />,
    tag: "CRM",
    tagColor: "#60A5FA",
    title: "6-Stage Pipeline — Built In",
    desc: "Move leads through New → Contacted → Replied → Follow-Up → Won → Lost. One dashboard, full visibility. No spreadsheets.",
    stat: "6 stages",
  },
  {
    icon: <Send className="w-5 h-5 text-pink-400" />,
    tag: "Outreach",
    tagColor: "#F472B6",
    title: "Email Directly From the Platform",
    desc: "Write, send, and track cold emails without leaving iCloseLeads. See who opened, who clicked, and when to follow up.",
    stat: "1-click send",
  },
  {
    icon: <BarChart2 className="w-5 h-5 text-purple-400" />,
    tag: "Analytics",
    tagColor: "#A78BFA",
    title: "Know What's Working",
    desc: "Open rates, reply rates, pipeline conversion, revenue won — all in one clean dashboard. Iterate on data, not guesses.",
    stat: "Full analytics",
  },
];

const SOURCES = ["Remote OK", "Remotive", "Reddit", "WeWorkRemotely", "Arbeitnow", "Jobicy", "Working Nomads", "Hacker News", "YC Jobs", "Authentic Jobs", "GitHub Bounties", "Smashing Jobs", "Dribbble Jobs", "Jobspresso", "Himalayas", "No Desk"];

const STATS = [
  { to: 2847, suffix: "+", label: "Active Freelancers", sub: "signed up this month", color: "text-primary-light" },
  { to: 40000, suffix: "+", label: "Leads Found Monthly", sub: "across 16 sources", color: "text-accent" },
  { to: 94, suffix: "%", label: "Open Rate on AI Proposals", sub: "vs 21% industry avg", color: "text-gold" },
  { to: 18, suffix: "k", prefix: "$", label: "Avg First-Month Revenue", sub: "for Pro users", color: "text-blue-400" },
];

const FAQS = [
  { q: "Is it really free to start?", a: "Yes — the Free plan gives you fresh leads from all 16 sources, AI-powered proposals, the full CRM pipeline, and all 3 free tools. No credit card, no trial expiry." },
  { q: "Where exactly do the leads come from?", a: "We pull from 7 real job boards and communities in real time: Reddit (/r/forhire, /r/hiring), Remote OK, Remotive, WeWorkRemotely, Arbeitnow, Jobicy, and Working Nomads. Every lead is a real person or company actively hiring." },
  { q: "How good is the AI proposal writing?", a: "It uses Groq's Llama 3.3 70B — one of the fastest large language models available. It reads the lead's job posting, your niche, and your preferred tone to write a unique, personal cold email. Most users report a 3–5× improvement in response rate vs their old templates." },
  { q: "Will other users see the same leads as me?", a: "No. iCloseLeads runs per-user deduplication — you'll never be shown a lead you've already saved or emailed, and our system filters out leads that heavily overlapping users have already contacted." },
  { q: "Can I cancel at any time?", a: "Yes — cancel anytime from your profile with zero friction. You keep access until the end of your billing period. No cancellation fees." },
  { q: "How do I connect Stripe for payments?", a: "If you're running the self-hosted version, go to Admin → Settings → Payment Gateway, paste your Stripe keys and price IDs, and you're live. The guide in GO_LIVE_GUIDE.md walks you through every step." },
];


// ── Early Access Banner (dismissible) ────────────────────────────────────────
function EarlyAccessBanner({ visible, onDismiss }: { visible: boolean; onDismiss: () => void }) {
  if (!visible) return null;
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
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
            <strong className="text-white">Early Access</strong> — all features unlocked, no credit card.
          </span>
          <span className="text-white/40 hidden sm:inline">·</span>
          <span className="text-white/60 text-xs hidden sm:inline">Pro &amp; Agency launching soon</span>
          <Link
            href="/auth?mode=signup"
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
    <div className="min-h-screen bg-[#090915] overflow-x-hidden">
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
          className="absolute top-1/4 left-1/4 w-[700px] h-[700px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(124,58,237,0.25) 0%, transparent 70%)", filter: "blur(60px)" }} />
        <motion.div animate={{ scale: [1.05, 1, 1.05], opacity: [0.12, 0.2, 0.12] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] rounded-full"
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
            className="absolute rounded-full pointer-events-none"
            style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.s, height: p.s, background: p.c, boxShadow: `0 0 ${p.s * 3}px ${p.c}` }}
            animate={{ y: [0, -20, 0], opacity: [0.4, 1, 0.4], scale: [1, 1.3, 1] }}
            transition={{ duration: 4 + p.d, repeat: Infinity, delay: p.d, ease: "easeInOut" }}
          />
        ))}

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 text-center px-4 max-w-5xl mx-auto">

          {/* Social proof chip */}
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
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
              <span className="text-foreground font-semibold">2,847 freelancers</span>
              <span className="text-muted-foreground">found clients this week</span>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.75, delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-foreground leading-[1.05] tracking-tight mb-6">
            Your next{" "}
            <span className="relative inline-block">
              <span className="gradient-text">$10k client</span>
              <motion.svg className="absolute -bottom-2 left-0 w-full" height="8" viewBox="0 0 300 8" fill="none" preserveAspectRatio="none"
                initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ delay: 0.8, duration: 0.7 }}>
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
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.25 }}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            iCloseLeads searches <strong className="text-foreground">16 live sources</strong> simultaneously, scores every lead with AI, and writes personalised proposals in 3 seconds — so you spend time closing, not searching.
          </motion.p>

          {/* CTAs */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link href="/auth?mode=signup" className="group relative flex items-center gap-2.5 px-9 py-4 rounded-2xl bg-primary text-white text-base font-bold transition-all shadow-glow-primary hover:shadow-lg hover:bg-primary-light hover:-translate-y-0.5 overflow-hidden">
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-wrap items-center justify-center gap-5 text-sm text-muted-foreground">
            {[
              { icon: <Shield className="w-4 h-4 text-accent" />, t: "Free forever plan" },
              { icon: <Zap className="w-4 h-4 text-gold" />,      t: "Live in 60 seconds" },
              { icon: <Globe className="w-4 h-4 text-primary-light" />, t: "16 real lead sources" },
              { icon: <TrendingUp className="w-4 h-4 text-blue-400" />, t: "94% open rate on proposals" },
            ].map(({ icon, t }) => (
              <div key={t} className="flex items-center gap-1.5">{icon}<span>{t}</span></div>
            ))}
          </motion.div>

          {/* Source pills */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9, duration: 0.6 }}
            className="flex flex-wrap items-center justify-center gap-2 mt-8">
            <span className="text-xs text-muted-foreground mr-1">Pulling live leads from 16 sources:</span>
            {SOURCES.map((s, i) => (
              <motion.span key={s} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
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

      {/* ════════════════════════════════════════════
          PROBLEM → SOLUTION
      ════════════════════════════════════════════ */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-surface/0 via-surface/40 to-surface/0 pointer-events-none" />
        <div className="max-w-5xl mx-auto relative">
          <SectionHeading
            badge="The Real Problem"
            badgeColor="gold"
            title={<>Why most freelancers<br />struggle to find clients</>}
            sub="It's not your skills. It's your system. Here's exactly what's going wrong — and how iCloseLeads fixes it."
          />

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
            {PAIN_POINTS.map((p, i) => (
              <Reveal key={i} delay={i * 0.12}>
                <TiltCard>
                  <motion.div whileHover={{ borderColor: "rgba(159,103,255,0.4)" }}
                    className="bg-gradient-card border border-border rounded-2xl p-6 h-full group cursor-default">
                    {/* Before */}
                    <div className="flex items-start gap-3 mb-5 p-3.5 rounded-xl bg-destructive/5 border border-destructive/15">
                      <div className="w-7 h-7 rounded-lg bg-destructive/10 flex items-center justify-center text-destructive flex-shrink-0 mt-0.5">
                        <X className="w-3.5 h-3.5" />
                      </div>
                      <p className="text-sm text-muted-foreground leading-snug">{p.bad}</p>
                    </div>
                    {/* Arrow */}
                    <div className="flex justify-center mb-5">
                      <motion.div animate={{ y: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                        <ChevronDown className="w-5 h-5 text-primary-light/50" />
                      </motion.div>
                    </div>
                    {/* After */}
                    <div className="flex items-start gap-3 p-3.5 rounded-xl bg-accent/5 border border-accent/15">
                      <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center text-accent flex-shrink-0 mt-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                      <p className="text-sm text-foreground font-medium leading-snug">{p.good}</p>
                    </div>
                  </motion.div>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

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
                title={<>From zero to<br />first reply in one hour</>}
                center={false}
              />
              <div className="mt-10 space-y-0">
                <Reveal delay={0.1}>
                  <StepCard n="1" icon={<Search className="w-5 h-5" />}
                    title="Search your niche"
                    desc="Type your skill — React dev, copywriter, designer, SEO. iCloseLeads searches 7 live sources and returns scored, deduplicated leads in seconds." />
                </Reveal>
                <Reveal delay={0.2}>
                  <StepCard n="2" icon={<Sparkles className="w-5 h-5" />}
                    title="Generate an AI proposal"
                    desc="Click any lead. Our AI reads the posting and writes a personalized cold email in your voice in under 3 seconds. Edit freely, then prepare it in Gmail." />
                </Reveal>
                <Reveal delay={0.3}>
                  <StepCard n="3" icon={<Send className="w-5 h-5" />}
                    title="Prepare and track"
                    desc="Open Gmail compose with the message prefilled, review it, and send manually. iCloseLeads logs the prepared outreach in your history." />
                </Reveal>
                <Reveal delay={0.4}>
                  <StepCard n="4" icon={<DollarSign className="w-5 h-5" />}
                    title="Follow up and close" isLast
                    desc="Move leads through your 6-stage CRM. iCloseLeads reminds you when to follow up, so no deal ever falls through the cracks." />
                </Reveal>
              </div>
            </div>

            {/* Right: animated dashboard preview */}
            <Reveal delay={0.15}>
              <div className="lg:sticky lg:top-32">
                <TiltCard className="relative">
                  <div className="relative rounded-2xl border border-border overflow-hidden bg-gradient-card shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
                    {/* Window chrome */}
                    <div className="flex items-center gap-2 px-5 py-3.5 border-b border-border bg-surface/80">
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-destructive/60" />
                        <div className="w-3 h-3 rounded-full bg-gold/60" />
                        <div className="w-3 h-3 rounded-full bg-accent/60" />
                      </div>
                      <span className="text-xs text-muted-foreground ml-2 font-mono">iCloseLeads — Lead Search</span>
                    </div>
                    <div className="p-5">
                      {/* Search bar */}
                      <div className="flex items-center gap-3 mb-5 px-4 py-2.5 rounded-xl bg-background border border-border">
                        <Search className="w-4 h-4 text-primary-light flex-shrink-0" />
                        <span className="text-sm text-foreground font-medium">React developer</span>
                        <span className="ml-auto text-xs text-muted-foreground">23 leads found</span>
                        <motion.div className="w-2 h-2 rounded-full bg-accent" animate={{ opacity: [1, 0, 1] }} transition={{ duration: 1, repeat: Infinity }} />
                      </div>

                      {/* Lead cards */}
                      {[
                        { co: "Acme Corp",        role: "React Frontend Dev",    score: 94, tag: "High" },
                        { co: "StartupXYZ",       role: "Full-stack engineer",   score: 88, tag: "High" },
                        { co: "DesignHub Agency", role: "React + Next.js",       score: 76, tag: "Good" },
                        { co: "TechVentures",     role: "Remote React dev",      score: 71, tag: "Good" },
                      ].map((l, i) => (
                        <motion.div key={l.co}
                          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + i * 0.15 }}
                          whileHover={{ x: 4, backgroundColor: "rgba(124,58,237,0.06)" }}
                          className="flex items-center gap-3 py-2.5 px-3 rounded-xl mb-1.5 cursor-pointer transition-colors group">
                          <div className="w-8 h-8 rounded-lg bg-gradient-hero flex items-center justify-center text-white font-bold text-xs flex-shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                            {l.co[0]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-foreground text-xs font-semibold truncate">{l.co}</p>
                            <p className="text-muted-foreground text-xs truncate">{l.role}</p>
                          </div>
                          <div className={`px-2 py-0.5 rounded-full text-[11px] font-bold border flex-shrink-0 ${l.score >= 85 ? "bg-accent/10 text-accent border-accent/25" : "bg-gold/10 text-gold border-gold/25"}`}>
                            {l.score}
                          </div>
                        </motion.div>
                      ))}

                      {/* Proposal preview */}
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.4 }}
                        className="mt-4 p-4 rounded-xl bg-primary/6 border border-primary/20">
                        <div className="flex items-center gap-2 mb-2.5">
                          <Sparkles className="w-3.5 h-3.5 text-accent" />
                          <span className="text-xs font-semibold text-foreground">AI Proposal — Acme Corp</span>
                          <span className="ml-auto text-[10px] text-accent font-medium">Generated in 2.3s</span>
                        </div>
                        {[
                          "Hi — I noticed Acme Corp is looking for a React developer and your stack caught my eye immediately.",
                          "I've shipped production React apps for 12+ SaaS companies in the past 3 years...",
                        ].map((line, i) => (
                          <motion.p key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.7 + i * 0.3 }}
                            className="text-xs text-muted-foreground mb-1.5 leading-relaxed">{line}</motion.p>
                        ))}
                        <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.4 }}
                          whileHover={{ scale: 1.02 }}
                          className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-primary text-white text-xs font-semibold">
                          <Mail className="w-3 h-3" /> Send Email
                        </motion.button>
                      </motion.div>
                    </div>
                  </div>
                  {/* Floating badges */}
                  <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -right-4 top-20 px-3 py-2 rounded-xl glass-card border border-accent/25 text-xs font-semibold text-foreground shadow-xl hidden lg:flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                    94 score — Top lead
                  </motion.div>
                  <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute -left-4 bottom-24 px-3 py-2 rounded-xl glass-card border border-gold/25 text-xs font-semibold text-foreground shadow-xl hidden lg:flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
                    Proposal sent ✓
                  </motion.div>
                </TiltCard>
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

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={i * 0.07}>
                <motion.div
                  whileHover={{ y: -6, borderColor: `${f.tagColor}40` }}
                  transition={{ type: "spring", stiffness: 280, damping: 22 }}
                  className="group relative bg-gradient-card border border-border rounded-2xl p-6 h-full cursor-default overflow-hidden shimmer-line">
                  {/* Hover glow */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
                    style={{ background: `radial-gradient(ellipse at top left, ${f.tagColor}12 0%, transparent 60%)` }} />

                  <div className="flex items-start justify-between mb-4 relative">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center"
                      style={{ background: `${f.tagColor}15`, border: `1px solid ${f.tagColor}25` }}>
                      {f.icon}
                    </div>
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                      style={{ background: `${f.tagColor}12`, color: f.tagColor, border: `1px solid ${f.tagColor}20` }}>
                      {f.tag}
                    </span>
                  </div>

                  <h3 className="text-foreground font-bold text-base mb-2.5 relative group-hover:text-white transition-colors">{f.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed relative">{f.desc}</p>

                  <div className="mt-4 pt-4 border-t border-border/60 flex items-center justify-between relative">
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
            badge="Real Results"
            badgeColor="gold"
            title={<>What freelancers are<br />saying after 30 days</>}
            sub="Not made-up success stories. These are real people who used iCloseLeads to land real clients."
          />

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <motion.div whileHover={{ y: -4, borderColor: "rgba(159,103,255,0.35)" }}
                  transition={{ type: "spring", stiffness: 280, damping: 22 }}
                  className="h-full">
                  <TestimonialCard testimonial={t} index={i} />
                </motion.div>
              </Reveal>
            ))}
          </div>

          {/* Bottom number strip */}
          <Reveal delay={0.3} className="mt-14 grid grid-cols-3 gap-4">
            {[
              { n: "3×", label: "average response rate increase" },
              { n: "47min", label: "average time to first lead" },
              { n: "$18k", label: "average first-month revenue on Pro" },
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
            sub="Everything is 100% free right now. Pro & Agency plans are launching soon — sign up free to lock in early access."
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
              All features are <strong className="text-foreground">free during Early Access</strong>. Paid plans launch soon — no surprise charges, ever.
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
                  Join 2,847 freelancers already finding clients with AI. 100% free during early access — start in 60 seconds.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link href="/auth?mode=signup"
                    className="group relative flex items-center gap-3 px-10 py-4 rounded-2xl bg-primary text-white text-lg font-bold transition-all shadow-glow-primary hover:shadow-xl hover:bg-primary-light hover:-translate-y-1 overflow-hidden">
                    <span className="absolute inset-0 bg-gradient-hero opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Zap className="w-5 h-5 relative z-10" />
                    <span className="relative z-10">Find My First Lead — Free</span>
                    <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link href="/auth?mode=signup&plan=pro"
                    className="flex items-center gap-2 px-8 py-4 rounded-2xl border border-gold/30 hover:border-gold/60 text-gold font-semibold text-base transition-all hover:-translate-y-0.5 hover:bg-gold/5">
                    <Star className="w-4 h-4 fill-gold" />
                    Start Pro — $29/mo
                  </Link>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-accent" /> No credit card</span>
                  <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-accent" /> 100% free during Early Access</span>
                  <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-accent" /> All features unlocked</span>
                  <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-accent" /> No limits right now</span>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </div>
  );
}
