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
      { label: "Use Cases", href: "/use-cases" },
      { label: "Resources", href: "/resources" },
      { label: "Blog", href: "/blog" },
    ],
  },
  {
    title: "Lead Engines",
    links: primaryLinks,
  },
  {
    title: "Workflows",
    links: [
      { label: "AI Proposals", href: "/features/ai-proposals" },
      { label: "CRM Pipeline", href: "/features/crm-pipeline" },
      { label: "Email Outreach", href: "/features/email-outreach" },
      { label: "Lead Calculator", href: "/tools/lead-calculator" },
      { label: "Lead Scoring", href: "/blog/the-complete-guide-to-freelance-lead-scoring" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Affiliate", href: "/affiliate" },
      { label: "Press", href: "/press" },
      { label: "Careers", href: "/careers" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "Help Center", href: "/help" },
      { label: "Status", href: "/status" },
      { label: "Changelog", href: "/changelog" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
];

const trustNotes = [
  { icon: Radar, label: "Remote, local, and live lead signals" },
  { icon: Sparkles, label: "AI proposal and follow-up workflow" },
  { icon: ShieldCheck, label: "Review-first outreach, no risky auto-send" },
];

export default function Footer() {
  return (
    <footer className="border-t border-border bg-background/95" aria-label="Site footer">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <div className="site-footer-panel overflow-hidden rounded-3xl border border-border bg-white/90 shadow-card dark:bg-card/90">
          <div className="grid gap-0 lg:grid-cols-[1.05fr_1.45fr]">
            <div className="border-b border-border p-6 sm:p-8 lg:border-b-0 lg:border-r">
              <Logo size="md" href="/" />
              <p className="mt-5 max-w-md text-sm leading-6 text-muted-foreground">
                iCloseLeads helps freelancers find real buying signals, qualify the right prospects,
                and turn each opportunity into a sharper pitch.
              </p>

              <div className="mt-6 hidden gap-3 sm:grid">
                {trustNotes.map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary-light">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span>{label}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:mt-7 sm:flex-row">
                <Link
                  href="/auth?mode=signup"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-hero px-4 py-3 text-sm font-semibold text-white shadow-glow-primary transition-transform hover:-translate-y-0.5"
                >
                  Start free
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="mailto:hello@icloseleads.com"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background/70 px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:border-primary/40 hover:text-primary-light"
                >
                  <Mail className="h-4 w-4" />
                  Contact
                </a>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <div className="mb-7 flex flex-col gap-3 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary-light">
                    Client acquisition OS
                  </p>
                  <h2 className="mt-2 text-xl font-bold text-foreground">
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

              <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
                {footerGroups.map(group => (
                  <div key={group.title} className="min-w-0">
                    <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-foreground">
                      {group.title}
                    </h3>
                    <ul className="space-y-2.5">
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

        <div className="hidden flex-col gap-4 border-b border-border px-1 py-6 text-sm text-muted-foreground sm:flex sm:flex-row sm:items-center sm:justify-between">
          <p>Built for freelancers, consultants, and lean agencies who need better timing.</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {primaryLinks.slice(0, 3).map(link => (
              <Link key={link.label} href={link.href} className="hover:text-foreground">
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 px-1 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
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
