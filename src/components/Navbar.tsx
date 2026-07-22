"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  ChevronDown,
  Menu,
  Radio,
  Sparkles,
  UserRoundSearch,
  X,
} from "lucide-react";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";
import { useAuthStatus } from "@/lib/use-auth-status";

const productLinks = [
  {
    label: "Local business leads",
    description: "Find businesses with a clear reason to buy.",
    href: "/use-cases/local-business-leads",
    icon: Building2,
    tone: "text-accent bg-accent/10",
  },
  {
    label: "Remote jobs",
    description: "Catch relevant contract work while it is fresh.",
    href: "/use-cases/remote-job-leads",
    icon: BriefcaseBusiness,
    tone: "text-primary-light bg-primary/10",
  },
  {
    label: "Live demand",
    description: "Watch public requests and urgent hiring signals.",
    href: "/use-cases/live-job-leads",
    icon: Radio,
    tone: "text-gold bg-gold/10",
  },
  {
    label: "Decision makers",
    description: "Move from a business name to the owner path.",
    href: "/features/lead-discovery#capabilities",
    icon: UserRoundSearch,
    tone: "text-accent bg-accent/10",
  },
  {
    label: "AI proposals",
    description: "Draft outreach from the real opportunity context.",
    href: "/features/ai-proposals",
    icon: Sparkles,
    tone: "text-primary-light bg-primary/10",
  },
] as const;

const navLinks = [
  { label: "How it works", href: "/#how-it-works" },
  { label: "Pricing", href: "/pricing" },
  { label: "Resources", href: "/blog" },
] as const;

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [productOpen, setProductOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const productRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const authStatus = useAuthStatus();
  const isAuthenticated = authStatus === "authenticated";

  useEffect(() => {
    document.body.classList.add("marketing-site");
    return () => document.body.classList.remove("marketing-site");
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setProductOpen(false);
  }, [pathname]);

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (productRef.current && !productRef.current.contains(event.target as Node)) {
        setProductOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const primaryHref = isAuthenticated
    ? "/dashboard/local-leads"
    : "/auth?mode=signup&intent=nav-first-search&source=marketing-nav";

  return (
    <nav
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b transition-colors",
        scrolled
          ? "border-border bg-background/92 shadow-sm backdrop-blur-xl"
          : "border-transparent bg-background/82 backdrop-blur-md",
      )}
    >
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo size="md" />

        <div className="hidden items-center gap-1 lg:flex">
          <div ref={productRef} className="relative">
            <button
              type="button"
              onClick={() => setProductOpen(open => !open)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
                productOpen || pathname.startsWith("/features") || pathname.startsWith("/use-cases")
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground",
              )}
              aria-expanded={productOpen}
            >
              Product
              <ChevronDown className={cn("h-4 w-4 transition-transform", productOpen && "rotate-180")} />
            </button>

            {productOpen && (
              <div className="absolute left-1/2 top-full mt-3 w-[620px] -translate-x-1/2 rounded-lg border border-border bg-card p-3 shadow-2xl">
                <div className="grid grid-cols-2 gap-1">
                  {productLinks.map(({ label, description, href, icon: Icon, tone }) => (
                    <Link
                      key={label}
                      href={href}
                      className="group grid grid-cols-[40px_1fr] gap-3 rounded-lg p-3 transition-colors hover:bg-secondary"
                    >
                      <span className={cn("flex h-10 w-10 items-center justify-center rounded-lg", tone)}>
                        <Icon className="h-5 w-5" />
                      </span>
                      <span>
                        <span className="block text-sm font-bold text-foreground group-hover:text-primary-light">{label}</span>
                        <span className="mt-1 block text-xs leading-5 text-muted-foreground">{description}</span>
                      </span>
                    </Link>
                  ))}
                  <Link
                    href="/features"
                    className="group col-span-2 mt-1 flex items-center justify-between rounded-lg border border-border bg-background px-4 py-3 text-sm font-bold text-foreground"
                  >
                    Explore every feature
                    <ArrowRight className="h-4 w-4 text-primary-light transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
                pathname === link.href
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground",
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          <ThemeToggle size="sm" />
          {authStatus === "loading" ? (
            <div className="h-10 w-36 rounded-lg border border-border bg-secondary" aria-hidden="true" />
          ) : (
            <>
              <Link
                href={isAuthenticated ? "/dashboard" : "/auth"}
                prefetch={false}
                className="rounded-lg px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
              >
                {isAuthenticated ? "Dashboard" : "Sign in"}
              </Link>
              <Link href={primaryHref} prefetch={false} className="marketing-primary-cta">
                {isAuthenticated ? "Find leads" : "Start free"}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle size="sm" />
          <button
            type="button"
            onClick={() => setMobileOpen(open => !open)}
            className="marketing-icon-button"
            aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-border bg-background px-4 py-4 shadow-xl lg:hidden">
          <div className="mx-auto max-w-7xl space-y-1">
            <p className="px-3 pb-2 text-xs font-bold uppercase text-muted-foreground">Lead engines</p>
            {productLinks.slice(0, 3).map(({ label, href, icon: Icon }) => (
              <Link key={label} href={href} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-foreground hover:bg-secondary">
                <Icon className="h-4 w-4 text-primary-light" />
                {label}
              </Link>
            ))}
            <div className="my-3 border-t border-border" />
            {[{ label: "All features", href: "/features" }, ...navLinks].map(link => (
              <Link key={link.href} href={link.href} className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-foreground hover:bg-secondary">
                {link.label}
              </Link>
            ))}
            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-border pt-4">
              <Link href={isAuthenticated ? "/dashboard" : "/auth"} prefetch={false} className="marketing-secondary-cta">
                {isAuthenticated ? "Dashboard" : "Sign in"}
              </Link>
              <Link href={primaryHref} prefetch={false} className="marketing-primary-cta">
                {isAuthenticated ? "Find leads" : "Start free"}
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
