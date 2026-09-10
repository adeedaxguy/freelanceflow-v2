import type { Metadata } from "next";
import Link from "next/link";
import { Activity, Clock, Mail } from "lucide-react";
import { z } from "zod";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import NewsletterForm from "@/components/NewsletterForm";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Platform Status | iCloseLeads",
  description: "Team-published iCloseLeads service notices, maintenance updates, and support.",
  alternates: { canonical: "https://icloseleads.com/status" },
};

const services = [
  "Lead Search & Aggregation", "AI Proposal Generator", "Gmail Compose Prep",
  "Contact Enrichment", "Authentication & Sessions", "Billing & Subscriptions (Stripe)",
  "Softphone (Twilio)", "Dashboard & Web App", "API (v1)",
];
const noticeSchema = z.object({ subject: z.string(), message: z.string(), publishedAt: z.string().datetime() });

export default async function StatusPage() {
  let notice: z.infer<typeof noticeSchema> | null = null;
  let unavailable = false;
  try {
    const stored = await prisma.platformSetting.findUnique({ where: { key: "public_status_notice" } });
    if (stored) notice = noticeSchema.parse(JSON.parse(stored.value));
  } catch { unavailable = true; }

  return <>
    <Navbar />
    <main className="min-h-screen pt-16">
      <header className="border-b border-border py-10">
        <div className="mx-auto max-w-4xl px-4">
          <Activity className="mb-3 h-8 w-8 text-primary-light" aria-hidden="true" />
          <h1 className="text-3xl font-bold text-foreground">Platform Status</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">Team-published service notices. Automated uptime monitoring is not connected to this page, so it cannot confirm that every service is operational.</p>
        </div>
      </header>
      <div className="mx-auto max-w-4xl space-y-10 px-4 py-10">
        <section aria-labelledby="latest-notice">
          <h2 id="latest-notice" className="mb-4 text-xl font-semibold">Latest Service Notice</h2>
          {notice ? <article className="border-l-2 border-primary py-2 pl-4">
            <h3 className="font-semibold">{notice.subject}</h3>
            <p className="my-2 flex items-center gap-2 text-xs text-muted-foreground"><Clock className="h-4 w-4" aria-hidden="true" /><time dateTime={notice.publishedAt}>{new Date(notice.publishedAt).toLocaleString("en-US", { timeZone: "UTC", dateStyle: "medium", timeStyle: "short" })} UTC</time></p>
            <p className="whitespace-pre-line break-words text-sm leading-6 text-muted-foreground">{notice.message}</p>
          </article> : <p className="text-sm leading-6 text-muted-foreground">{unavailable ? "Service notices are temporarily unavailable. Please contact support if something is not working." : "No team notices have been published here yet. This does not confirm the absence of an incident."}</p>}
        </section>
        <section aria-labelledby="service-coverage">
          <h2 id="service-coverage" className="mb-2 text-xl font-semibold">Service Coverage</h2>
          <p className="mb-4 text-sm text-muted-foreground">Current health has not been independently verified. No measured uptime or latency history is available here.</p>
          <ul className="divide-y divide-border border-y border-border">
            {services.map(name => <li key={name} className="flex flex-col justify-between gap-2 py-4 sm:flex-row sm:items-center">
              <span className="text-sm font-medium">{name}</span><span className="text-xs text-muted-foreground">Not monitored on this page</span>
            </li>)}
          </ul>
        </section>
        <section className="border-t border-border pt-8">
          <h2 className="mb-2 text-xl font-semibold">Having trouble?</h2>
          <p className="mb-4 text-sm leading-6 text-muted-foreground">Report the affected feature and when the problem started. Never include passwords, payment details, or API keys.</p>
          <Link href="/contact" className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-semibold"><Mail className="h-4 w-4" aria-hidden="true" />Contact support</Link>
        </section>
        <section className="border-t border-border pt-8">
          <h2 className="mb-2 text-xl font-semibold">Get Status Updates</h2>
          <p className="mb-5 text-sm text-muted-foreground">Receive team-published incident and maintenance notices by email.</p>
          <NewsletterForm topic="status" />
        </section>
      </div>
    </main>
    <Footer />
  </>;
}
