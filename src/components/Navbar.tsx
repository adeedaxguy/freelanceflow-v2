"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu, X, ChevronDown, LogOut, Settings, LayoutDashboard, User,
  Search, Layers, Sparkles, Mail, BarChart2, FileText, Shield,
  Zap, Globe, Target, Star, Users, BookOpen, ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Logo from "@/components/Logo";

// ─── Mega Menu Data ───────────────────────────────────────────────────────────
const MEGA_FEATURES = [
  {
    category: "Lead Discovery",
    icon: Search,
    color: "text-primary-light",
    href: "/features/lead-discovery",
    items: [
      { label: "11-Source Aggregator",  desc: "RemoteOK, Reddit, Remote.co + more",   href: "/features/lead-discovery" },
      { label: "AI Quality Scoring",    desc: "0–100 confidence score per lead",      href: "/features/lead-discovery#scoring" },
      { label: "Niche Targeting",       desc: "15+ freelance niches supported",       href: "/features/lead-discovery#niches" },
      { label: "Smart Deduplication",   desc: "Never see the same lead twice",        href: "/features/lead-discovery#dedup" },
    ],
  },
  {
    category: "CRM Pipeline",
    icon: Layers,
    color: "text-accent",
    href: "/features/crm-pipeline",
    items: [
      { label: "6-Stage Pipeline",      desc: "New → Contacted → Won → Lost",        href: "/features/crm-pipeline" },
      { label: "Lead Notes",            desc: "Private notes per opportunity",        href: "/features/crm-pipeline#notes" },
      { label: "Status Tracking",       desc: "Move leads with one click",            href: "/features/crm-pipeline#status" },
      { label: "CSV Export",            desc: "Export your pipeline anytime",         href: "/features/crm-pipeline#export" },
    ],
  },
  {
    category: "AI Proposal Engine",
    icon: Sparkles,
    color: "text-gold",
    href: "/features/ai-proposals",
    items: [
      { label: "Groq-Powered AI",       desc: "llama-3.3-70b for human-like copy",   href: "/features/ai-proposals" },
      { label: "Niche Personalisation", desc: "Tailored to every job posting",       href: "/features/ai-proposals#personalisation" },
      { label: "Custom Templates",      desc: "Save & reuse winning formats",        href: "/features/ai-proposals#templates" },
      { label: "Follow-Up Writer",      desc: "AI-crafted follow-up sequences",      href: "/features/ai-proposals#followup" },
    ],
  },
  {
    category: "Outreach & Email",
    icon: Mail,
    color: "text-blue-400",
    href: "/features/email-outreach",
    items: [
      { label: "One-Click Send",        desc: "Send via Gmail, logged instantly",    href: "/features/email-outreach" },
      { label: "Campaign Builder",      desc: "Multi-step outreach sequences",       href: "/features/email-outreach#campaigns" },
      { label: "Open & Click Tracking", desc: "See who opened, who clicked",         href: "/features/email-outreach#tracking" },
      { label: "No Duplicates",         desc: "Prevent repeat outreach automatically", href: "/features/email-outreach#dedup" },
    ],
  },
  {
    category: "Analytics",
    icon: BarChart2,
    color: "text-green-400",
    href: "/features/analytics",
    items: [
      { label: "Dashboard Overview",    desc: "Leads, proposals, replies at a glance", href: "/features/analytics" },
      { label: "Source Breakdown",      desc: "Which sources convert best",           href: "/features/analytics#sources" },
      { label: "Pipeline Reports",      desc: "Win rate and conversion tracking",     href: "/features/analytics#pipeline" },
      { label: "Revenue Tracking",      desc: "Monthly revenue won, automatically",  href: "/features/analytics#revenue" },
    ],
  },
  {
    category: "Free Tools",
    icon: Shield,
    color: "text-purple-400",
    href: "/features/free-tools",
    items: [
      { label: "Rate Calculator",       desc: "Know exactly what to charge",         href: "/features/free-tools#rate" },
      { label: "Subject Line Generator",desc: "AI subject lines that get opened",    href: "/features/free-tools#subject" },
      { label: "Red Flag Detector",     desc: "Spot bad clients before you sign",    href: "/features/free-tools#redflags" },
      { label: "Blog & Resources",      desc: "Freelance guides and strategies",     href: "/blog" },
    ],
  },
];

export default function Navbar() {
  const [isOpen,       setIsOpen]       = useState(false);
  const [scrolled,     setScrolled]     = useState(false);
  const [megaOpen,     setMegaOpen]     = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const megaRef  = useRef<HTMLDivElement>(null);
  const userRef  = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { data: session } = useSession();

  const [bannerH, setBannerH] = useState(44);

  useEffect(() => {
    // Measure the fixed banner height so navbar sits directly below it
    const measure = () => {
      const banner = document.getElementById("top-banner");
      if (banner) setBannerH(banner.getBoundingClientRect().height);
    };
    // Small delay to let the banner render fully on first load
    setTimeout(measure, 50);
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > bannerH);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [bannerH]);

  // Close menus on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (megaRef.current && !megaRef.current.contains(e.target as Node)) setMegaOpen(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const otherLinks = [
    { label: "Pricing", href: "/pricing" },
    { label: "Blog",    href: "/blog" },
    { label: "About",   href: "/about" },
  ];

  return (
    <nav
      style={{ top: scrolled ? 0 : bannerH }}
      className={cn(
        "fixed left-0 right-0 z-50 transition-all duration-300",
        scrolled ? "bg-surface/95 backdrop-blur-xl border-b border-border/50 shadow-lg" : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Logo size="md" />

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {/* Features Mega Menu */}
            <div ref={megaRef} className="relative">
              <button
                onClick={() => setMegaOpen(v => !v)}
                className={cn(
                  "flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  megaOpen || pathname.startsWith("/features")
                    ? "text-primary-light bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                )}
              >
                Features
                <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", megaOpen && "rotate-180")} />
              </button>

              <AnimatePresence>
                {megaOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[760px] bg-surface/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl overflow-hidden"
                  >
                    {/* Top bar */}
                    <div className="flex items-center justify-between px-5 py-3 border-b border-border/60 bg-gradient-to-r from-primary/5 to-accent/5">
                      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <Zap className="w-4 h-4 text-primary-light" /> All Features
                      </div>
                      <Link href="/features" onClick={() => setMegaOpen(false)}
                        className="flex items-center gap-1 text-xs text-primary-light hover:underline">
                        View full overview <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>

                    {/* Grid */}
                    <div className="grid grid-cols-3 gap-0 p-5">
                      {MEGA_FEATURES.map((cat) => {
                        const CatIcon = cat.icon;
                        return (
                          <div key={cat.category} className="space-y-1">
                            <Link href={cat.href} onClick={() => setMegaOpen(false)}
                              className={cn("flex items-center gap-1.5 px-2 py-1 text-xs font-bold uppercase tracking-wider mb-2 rounded-lg hover:bg-white/5 transition-colors", cat.color)}>
                              <CatIcon className="w-3.5 h-3.5" />
                              {cat.category}
                            </Link>
                            {cat.items.map((item) => (
                              <Link key={item.label} href={item.href} onClick={() => setMegaOpen(false)}
                                className="block px-2 py-2 rounded-lg hover:bg-white/5 transition-colors group">
                                <p className="text-sm font-medium text-foreground group-hover:text-primary-light transition-colors">{item.label}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                              </Link>
                            ))}
                          </div>
                        );
                      })}
                    </div>

                    {/* CTA bar */}
                    <div className="px-5 py-3 border-t border-border/60 bg-gradient-to-r from-primary/5 to-accent/5 flex items-center justify-between">
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        {[
                          { icon: Globe, label: "25 Source Integrations" },
                          { icon: Target, label: "15+ Niches" },
                          { icon: Star,   label: "Free to Start" },
                          { icon: Users,  label: "No Credit Card" },
                        ].map(({ icon: Icon, label }) => (
                          <span key={label} className="flex items-center gap-1">
                            <Icon className="w-3 h-3 text-primary-light" /> {label}
                          </span>
                        ))}
                      </div>
                      <Link href="/auth?mode=signup" onClick={() => setMegaOpen(false)}
                        className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-primary hover:bg-primary-light text-white text-xs font-semibold transition-colors">
                        Get Started Free <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Other links */}
            {otherLinks.map((link) => (
              <Link key={link.href} href={link.href}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  pathname === link.href ? "text-primary-light bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                )}>
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right: CTA + User */}
          <div className="hidden md:flex items-center gap-3">
            {session ? (
              <div ref={userRef} className="relative">
                <button onClick={() => setUserMenuOpen(v => !v)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface border border-border hover:border-primary/40 transition-all">
                  <div className="w-7 h-7 rounded-full bg-gradient-hero flex items-center justify-center text-white text-xs font-bold">
                    {session.user?.name?.[0]?.toUpperCase() ?? "U"}
                  </div>
                  <span className="text-sm text-foreground max-w-24 truncate">{session.user?.name ?? "Account"}</span>
                  <ChevronDown className={cn("w-3.5 h-3.5 text-muted-foreground transition-transform", userMenuOpen && "rotate-180")} />
                </button>
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      className="absolute right-0 mt-2 w-48 bg-surface border border-border rounded-xl shadow-xl overflow-hidden z-50">
                      {[
                        { icon: LayoutDashboard, label: "Dashboard",  href: "/dashboard" },
                        { icon: User,            label: "Profile",    href: "/dashboard/profile" },
                        { icon: Settings,        label: "Settings",   href: "/dashboard/settings" },
                      ].map(({ icon: Icon, label, href }) => (
                        <Link key={href} href={href} onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-white/5 transition-colors">
                          <Icon className="w-4 h-4 text-muted-foreground" /> {label}
                        </Link>
                      ))}
                      <button onClick={() => void signOut({ callbackUrl: "/" })}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors border-t border-border">
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link href="/auth" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Sign In
                </Link>
                <Link href="/auth?mode=signup"
                  className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-light text-white text-sm font-semibold transition-all shadow-glow-primary/50">
                  Get Started Free
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button onClick={() => setIsOpen(v => !v)} className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors">
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu — full-screen overlay below navbar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="md:hidden fixed inset-x-0 bg-[#0d0a1a]/98 backdrop-blur-xl border-t border-border shadow-2xl z-40 overflow-y-auto"
            style={{ top: bannerH + 64, maxHeight: `calc(100dvh - ${bannerH + 64}px)` }}
          >
            <div className="px-5 py-5 space-y-1">
              <Link href="/features" onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-foreground hover:bg-white/5 active:bg-white/10 transition-colors">
                <Zap className="w-5 h-5 text-primary-light flex-shrink-0" /> Features
              </Link>
              {otherLinks.map(l => (
                <Link key={l.href} href={l.href} onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-foreground hover:bg-white/5 active:bg-white/10 transition-colors">
                  {l.label}
                </Link>
              ))}

              <div className="pt-3 mt-3 border-t border-border/60 space-y-3">
                {session ? (
                  <>
                    <Link href="/dashboard" onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-foreground hover:bg-white/5 transition-colors">
                      <LayoutDashboard className="w-5 h-5 text-muted-foreground" /> Dashboard
                    </Link>
                    <button onClick={() => { setIsOpen(false); void signOut(); }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-red-400 hover:bg-red-500/10 transition-colors">
                      <LogOut className="w-5 h-5" /> Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/auth" onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors">
                      Sign In
                    </Link>
                    <Link href="/auth?mode=signup" onClick={() => setIsOpen(false)}
                      className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-primary hover:bg-primary-light text-white text-base font-bold transition-colors shadow-glow-primary/50">
                      <Zap className="w-4 h-4" /> Get Started Free
                    </Link>
                  </>
                )}
              </div>

              {/* Quick stats inside mobile menu */}
              <div className="pt-4 pb-2 flex items-center justify-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Star className="w-3 h-3 text-gold fill-gold" /> Free Plan</span>
                <span>•</span>
                <span>25 source integrations</span>
                <span>•</span>
                <span>No credit card</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
