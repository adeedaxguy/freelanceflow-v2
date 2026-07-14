import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { RESOURCE_PAGES } from "@/data/resource-pages";

const BASE_URL = "https://icloseleads.com";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: "Lead Generation Resources, Tools, CRM Workflows, Proposal Templates, and Follow-Ups",
  description:
    "Practical iCloseLeads resources for freelancer lead generation tools, cold outreach CRM workflows, decision maker email research, proposal templates, local prospecting, and client acquisition.",
  keywords: [
    "best lead generation tools for freelancers",
    "cold outreach CRM for freelancers",
    "find decision maker email small business",
    "web design leads",
    "businesses without websites",
    "freelance cold outreach",
    "local business leads for web designers",
    "freelance lead generation resources",
    "outbound lead generation software",
    "what is a sales pipeline",
    "b2b lead generation agency",
    "lead generation services",
    "professional email",
    "reverse email lookup",
    "email validator",
    "email verifier",
    "email finder",
    "email lookup",
    "lead list builder",
    "sales prospecting tool",
    "b2b prospecting tool",
    "client acquisition platform",
    "freelance lead management",
    "lead qualification checklist",
    "lead scoring for freelancers",
    "local business lead generation software",
    "google maps lead generation",
    "cold email outreach software",
    "proposal generator for freelancers",
    "freelance outreach automation",
    "find business owner email",
    "small business leads",
    "agency client acquisition software",
    "freelancer CRM with email follow up",
    "lead enrichment for freelance prospecting",
    "outbound sales workflow",
    "freelance prospecting tool",
    "sales leads for web designers",
    "remote client leads",
    "lead generation workflow for freelancers",
  ],
  alternates: { canonical: `${BASE_URL}/resources` },
  openGraph: {
    title: "Lead Generation Resources for Freelancers | iCloseLeads",
    description:
      "Guides and workflows for finding better freelance leads, qualifying prospects, writing pitches, and turning search intent into signups and first outreach.",
    url: `${BASE_URL}/resources`,
    type: "website",
    siteName: "iCloseLeads",
  },
};

function ResourcesJsonLd() {
  const graph = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Lead Generation Resources",
      description:
        "A practical resource hub for freelancers and agencies using iCloseLeads to find and pitch better leads.",
      url: `${BASE_URL}/resources`,
      isPartOf: { "@type": "WebSite", name: "iCloseLeads", url: BASE_URL },
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "iCloseLeads resources",
      itemListElement: RESOURCE_PAGES.map((page, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: page.title,
        url: `${BASE_URL}/resources/${page.slug}`,
      })),
    },
  ];

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }} />;
}

export default function ResourcesPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <ResourcesJsonLd />
      <Navbar />
      <main className="pt-16">
        <section className="border-b border-border px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="inline-flex items-center gap-2 rounded-lg border border-primary/25 bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary-light">
              <BookOpen className="h-4 w-4" />
              SEO-backed playbooks
            </div>
            <h1 className="mt-6 max-w-4xl text-4xl font-extrabold leading-tight text-foreground sm:text-5xl lg:text-6xl">
              Lead generation resources built for signups, first searches, proposals, CRM follow-ups, and decision-maker research
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-muted-foreground">
              Guides for freelancers and agencies who need clients, not vague motivation. Learn how to compare lead generation tools, build a cold outreach CRM workflow, find decision-maker paths, qualify web design leads, write proposals, and follow up in a way that moves a visitor toward a real account and workflow run.
            </p>
            <div className="mt-6 max-w-3xl rounded-2xl border border-primary/25 bg-primary/10 p-5">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary-light">Short answer</p>
              <p className="mt-3 text-base leading-7 text-foreground">
                These resources help freelancers turn lead-generation searches into a practical next step: find a better prospect, understand why the lead matters, and move into iCloseLeads for the search, saved lead, proposal draft, and follow-up workflow.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/auth?mode=signup&intent=resources-overview&source=resources-hero" className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-glow-primary transition hover:bg-primary-light">
                Start Free and Run a Search
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/use-cases/local-business-leads" className="inline-flex items-center justify-center rounded-xl border border-border bg-surface px-6 py-3 text-sm font-semibold text-muted-foreground transition hover:text-foreground">
                Explore Local Lead Workflows
              </Link>
            </div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-2 xl:grid-cols-3">
            {RESOURCE_PAGES.map((page) => (
              <Link key={page.slug} href={`/resources/${page.slug}`} className="group flex min-h-[360px] min-w-0 flex-col rounded-lg border border-border bg-surface p-6 transition hover:border-primary/40">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary-light">{page.keyword}</p>
                <h2 className="mt-4 text-2xl font-extrabold leading-tight text-foreground group-hover:text-primary-light">{page.title}</h2>
                <p className="mt-4 flex-1 text-sm leading-7 text-muted-foreground">{page.summary}</p>
                <div className="mt-6 flex items-center gap-2 border-t border-border pt-5 text-sm font-semibold text-primary-light">
                  Read playbook
                  <ArrowRight className="h-4 w-4" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="border-y border-border bg-surface/35 px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
            {[
              "Every guide points to a product workflow, not a dead-end article.",
              "Each topic is tied to GSC, GA4, SERP, competitor, or product evidence.",
              "Internal links connect resources to signup-intent use cases, proposal paths, and feature pages.",
            ].map((item) => (
              <div key={item} className="rounded-lg border border-border bg-background p-5 text-sm leading-6 text-muted-foreground">
                <CheckCircle2 className="mb-3 h-5 w-5 text-accent" />
                {item}
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
