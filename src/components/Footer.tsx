"use client";

import Link from "next/link";
import { ArrowRight, Mail, Radar, ShieldCheck, Sparkles } from "lucide-react";
import Logo from "./Logo";

const primaryLinks = [
  { label: "Local Business Leads", href: "/lead-generation/local-business-leads" },
  { label: "Remote Freelance Jobs", href: "/lead-generation/remote-freelance-jobs" },
  { label: "Live Job Leads", href: "/use-cases/live-job-leads" },
  { label: "Decision Maker Finder", href: "/features/lead-discovery#capabilities" },
  { label: "Web Design Leads", href: "/lead-generation/web-design-leads" },
];

const footerGroups = [
  {
    title: "Platform",
    links: [
      { label: "Features", href: "/features" },
      { label: "Pricing", href: "/pricing" },
      { label: "Use cases", href: "/use-cases" },
      { label: "Resources", href: "/resources" },
    ],
  },
  {
    title: "Lead engines",
    links: primaryLinks,
  },
  {
    title: "Workflows",
    links: [
      { label: "AI Proposals", href: "/features/ai-proposals" },
      { label: "CRM Pipeline", href: "/features/crm-pipeline" },
      { label: "Email Outreach", href: "/features/email-outreach" },
      { label: "Lead Calculator", href: "/tools/lead-calculator" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Blog", href: "/blog" },
      { label: "Status", href: "/status" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Help Center", href: "/help" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "Cookies", href: "/cookie-policy" },
    ],
  },
];

const trustNotes = [
  { icon: Radar, label: "Remote, local, and live lead signals" },
  { icon: Sparkles, label: "AI proposal and follow-up workflow" },
  { icon: ShieldCheck, label: "Review-first outreach, no risky auto-send" },
];

const mobileFooterLinks = [
  { label: "Local leads", href: "/lead-generation/local-business-leads" },
  { label: "Remote jobs", href: "/lead-generation/remote-freelance-jobs" },
  { label: "Live jobs", href: "/use-cases/live-job-leads" },
  { label: "Decision makers", href: "/features/lead-discovery#capabilities" },
  { label: "Web design leads", href: "/lead-generation/web-design-leads" },
  { label: "Pricing", href: "/pricing" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

export default function Footer() {
  return (
    <footer className="border-t border-border bg-background/95" aria-label="Site footer">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <div className="site-footer-panel overflow-hidden border border-border bg-surface/90">
          <div className="grid gap-0 lg:grid-cols-[0.92fr_1.58fr]">
            <div className="border-b border-border p-5 sm:p-6 lg:border-b-0 lg:border-r">
              <Logo size="md" href="/" />
              <p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground">
                iCloseLeads helps freelancers find real buying signals, qualify the right prospects,
                and turn each opportunity into a sharper pitch.
              </p>

              <div className="mt-5 hidden gap-2.5 sm:grid">
                {trustNotes.map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border border-accent/20 bg-accent/10 text-accent">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span>{label}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/auth?mode=signup"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-hero px-4 py-2.5 text-sm font-semibold text-white shadow-glow-primary transition-transform hover:-translate-y-0.5"
                >
                  Start free
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="mailto:hello@icloseleads.com"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background/70 px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-primary/40 hover:text-primary-light"
                >
                  <Mail className="h-4 w-4" />
                  Contact
                </a>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              <div className="mb-5 flex flex-col gap-3 border-b border-border pb-5 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary-light">
                    Client acquisition OS
                  </p>
                  <h2 className="mt-2 text-lg font-bold text-foreground">
                    Find leads, verify intent, pitch faster.
                  </h2>
                </div>
                <Link
                  href="/lead-generation"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary-light hover:text-primary"
                >
                  Explore lead engines
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:hidden">
                {mobileFooterLinks.map(link => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="rounded-lg border border-border bg-background/60 px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:border-accent/40 hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="hidden grid-cols-2 gap-x-7 gap-y-7 sm:grid sm:grid-cols-3 lg:grid-cols-5">
                {footerGroups.map(group => (
                  <div key={group.title} className="min-w-0">
                    <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-foreground">
                      {group.title}
                    </h3>
                    <ul className="space-y-2">
                      {group.links.map(link => (
                        <li key={`${group.title}-${link.label}`}>
                          <Link
                            href={link.href}
                            className="block text-sm leading-5 text-muted-foreground transition-colors hover:text-foreground"
                          >
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="hidden flex-col gap-4 border-b border-border px-1 py-5 text-sm text-muted-foreground sm:flex sm:flex-row sm:items-center sm:justify-between">
          <p>Built for freelancers, consultants, and lean agencies who need better timing.</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {primaryLinks.slice(0, 3).map(link => (
              <Link key={link.label} href={link.href} className="hover:text-foreground">
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 px-1 pt-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} iCloseLeads. All rights reserved.</p>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground">Terms</Link>
            <Link href="/cookie-policy" className="hover:text-foreground">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
