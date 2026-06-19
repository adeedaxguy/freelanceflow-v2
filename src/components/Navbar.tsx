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
import ThemeToggle from "@/components/ThemeToggle";

// ─── Mega Menu Data ───────────────────────────────────────────────────────────
const MEGA_FEATURES = [
  {
    category: "Lead Discovery",
    icon: Search,
    color: "text-primary-light",
    items: [
      { label: "Remote Job Leads",      desc: "Fresh opportunities matched to your niche", href: "/use-cases/remote-job-leads" },
      { label: "Local Business Leads",  desc: "Find companies worth pitching by city",      href: "/use-cases/local-business-leads" },
      { label: "Live Job Leads",        desc: "Move first on fresh freelance demand",       href: "/use-cases/live-job-leads" },
      { label: "Lead Scoring",          desc: "Prioritise fit, urgency, and contactability", href: "/features/lead-discovery#capabilities" },
    ],
  },
  {
    category: "CRM Pipeline",
    icon: Layers,
    color: "text-accent",
    items: [
      { label: "Saved Lead CRM",        desc: "Turn qualified leads into active prospects", href: "/features/crm-pipeline" },
      { label: "Pipeline Stages",       desc: "Track new, contacted, replied, and won",     href: "/features/crm-pipeline#workflow" },
      { label: "Lead Notes",            desc: "Keep pitch context beside every prospect",   href: "/features/crm-pipeline#capabilities" },
      { label: "Pipeline Exports",      desc: "Keep ownership of your prospect data",       href: "/features/crm-pipeline#capabilities" },
    ],
  },
  {
    category: "AI Proposal Engine",
    icon: Sparkles,
    color: "text-gold",
    items: [
      { label: "Proposal Drafts",       desc: "Write from real lead context",          href: "/features/ai-proposals" },
      { label: "Personalised Hooks",    desc: "Open with the prospect's actual problem", href: "/features/ai-proposals#workflow" },
      { label: "Portfolio Proof",       desc: "Add relevant links to strengthen trust", href: "/features/ai-proposals#capabilities" },
      { label: "Follow-Up Ready",       desc: "Keep the next message connected",       href: "/features/ai-proposals#use-cases" },
    ],
  },
  {
    category: "Outreach & Email",
    icon: Mail,
    color: "text-blue-400",
    items: [
      { label: "Gmail Draft Mode",      desc: "Prepare, review, and send manually",    href: "/features/email-outreach" },
      { label: "Safety Limits",         desc: "Visible guardrails for outreach volume", href: "/features/email-outreach#capabilities" },
      { label: "Outreach Ledger",       desc: "Know who has already been contacted",   href: "/features/email-outreach#workflow" },
      { label: "Follow-Up Context",     desc: "Keep email activity tied to the CRM",    href: "/features/email-outreach#use-cases" },
    ],
  },
  {
    category: "Analytics",
    icon: BarChart2,
    color: "text-green-400",
    items: [
      { label: "Dashboard Overview",   desc: "See prospecting activity at a glance",  href: "/features/analytics" },
      { label: "Source Insights",      desc: "Learn which searches create pipeline",  href: "/features/analytics#capabilities" },
      { label: "Pipeline Reports",     desc: "Spot where leads are getting stuck",    href: "/features/analytics#workflow" },
      { label: "Usage Tracking",       desc: "Understand limits and weekly activity", href: "/features/analytics#capabilities" },
    ],
  },
  {
    category: "Platform",
    icon: Shield,
    color: "text-purple-400",
    items: [
      { label: "Free Tools",           desc: "Rates, subject lines, spam checks",     href: "/features/free-tools" },
      { label: "Pricing Calculator",   desc: "Know what you should charge",          href: "/features/free-tools#workflow" },
      { label: "Proposal Checks",      desc: "Improve readability and deliverability", href: "/features/free-tools#capabilities" },
      { label: "Freelance Resources",  desc: "Guides for better client acquisition", href: "/blog" },
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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menus on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (megaRef.current && !megaRef.current.contains(e.target as Node)) setMegaOpen(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close mobile menu on navigation
  useEffect(() => { setIsOpen(false); }, [pathname]);

  const otherLinks = [
    { label: "Pricing", href: "/pricing" },
    { label: "Blog",    href: "/blog" },
    { label: "About",   href: "/about" },
  ];

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
      scrolled ? "bg-surface/80 backdrop-blur-xl border-b border-border/50 shadow-lg" : "bg-transparent"
    )}>
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
                            <div className={cn("flex items-center gap-1.5 px-2 py-1 text-xs font-bold uppercase tracking-wider mb-2", cat.color)}>
                              <CatIcon className="w-3.5 h-3.5" />
                              {cat.category}
                            </div>
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
                          { icon: Globe, label: "Live Lead Coverage" },
                          { icon: Target, label: "Niche Targeting" },
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

          {/* Right: Theme + CTA + User */}
          <div className="hidden md:flex items-center gap-2">
            <ThemeToggle size="sm" />
            {session ? (
              <div ref={userRef} className="relative">
                <button onClick={() => setUserMenuOpen(v => !v)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface border border-border hover:border-primary/40 transition-all ml-1">
                  <div className="w-7 h-7 rounded-full bg-gradient-hero flex items-center justify-center text-white text-xs font-bold overflow-hidden">
                    {session.user?.image
                      ? <img src={session.user.image} alt="" className="w-full h-full object-cover" />
                      : (session.user?.name?.[0]?.toUpperCase() ?? "U")}
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

          {/* Mobile: theme + hamburger */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle size="sm" />
            <button onClick={() => setIsOpen(v => !v)} className="p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors">
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-surface/95 backdrop-blur-xl border-t border-border overflow-hidden">
            <div className="px-4 py-4 space-y-1">
              <Link href="/features" onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-foreground hover:bg-white/5 transition-colors">
                <Zap className="w-4 h-4 text-primary-light" /> Features
              </Link>
              {otherLinks.map(l => (
                <Link key={l.href} href={l.href} onClick={() => setIsOpen(false)}
                  className="block px-3 py-2.5 rounded-lg text-sm text-foreground hover:bg-white/5 transition-colors">
                  {l.label}
                </Link>
              ))}
              <div className="pt-2 border-t border-border space-y-2">
                {session ? (
                  <>
                    <Link href="/dashboard" onClick={() => setIsOpen(false)}
                      className="block px-3 py-2.5 rounded-lg text-sm text-foreground hover:bg-white/5 transition-colors">
                      Dashboard
                    </Link>
                    <button onClick={() => { setIsOpen(false); void signOut(); }}
                      className="w-full text-left px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/auth" onClick={() => setIsOpen(false)}
                      className="block px-3 py-2.5 rounded-lg text-sm text-foreground hover:bg-white/5 transition-colors">Sign In</Link>
                    <Link href="/auth?mode=signup" onClick={() => setIsOpen(false)}
                      className="block px-3 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold text-center">
                      Get Started Free
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
