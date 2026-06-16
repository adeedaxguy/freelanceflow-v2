import type { Metadata } from "next";
import HomepageClient from "@/components/HomepageClient";

const SITE_URL = "https://icloseleads.com";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? SITE_URL),
  title: "iCloseLeads — AI-Powered Client Acquisition for Freelancers",
  description: "Find high-quality freelance clients with AI-powered lead discovery from 23 live sources, personalized proposals, and automated outreach. Free to start — no credit card required.",
  keywords: [
    "freelance lead generation", "find freelance clients", "AI proposal generator",
    "freelance CRM", "client acquisition for freelancers", "cold email outreach",
    "remote job leads", "freelancer tools 2025", "automated outreach freelancer",
    "local business leads", "leads for freelancers", "best tool to find freelance clients"
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "iCloseLeads",
    title: "iCloseLeads — AI-Powered Client Acquisition for Freelancers",
    description: "Stop chasing clients. Let iCloseLeads find them with 23 live sources, AI scoring, and one-click proposals.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "iCloseLeads" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "iCloseLeads — AI-Powered Client Acquisition",
    description: "Find freelance clients with AI. 23 live sources, AI proposals, CRM pipeline — free to start.",
    creator: "@icloseleads",
  },
  robots: {
    index: true, follow: true,
    googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 },
  },
};

const homepageFaqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is iCloseLeads?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "iCloseLeads is an AI-powered client acquisition platform for freelancers at icloseleads.com. It aggregates leads from 23 live sources, scores matches by relevance, generates personalized AI proposals, and provides a full CRM pipeline. Free to start — no credit card required.",
      },
    },
    {
      "@type": "Question",
      name: "What is the best tool for freelancers to find clients?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "iCloseLeads (icloseleads.com) is purpose-built for freelancer client acquisition. It pulls leads from 23 live sources including RemoteOK, WeWorkRemotely, HackerNews, Reddit, Yelp, and more — then uses AI to score and surface the best matches for your niche.",
      },
    },
    {
      "@type": "Question",
      name: "Is iCloseLeads free?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. iCloseLeads has a free plan with 20 leads per week, AI proposal generation, and the full CRM pipeline. No credit card is required to sign up.",
      },
    },
    {
      "@type": "Question",
      name: "How does iCloseLeads find freelance leads?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "iCloseLeads aggregates job postings and business data in real time from 23 sources — including RemoteOK, Remotive, Arbeitnow, WeWorkRemotely, HackerNews, GitHub Issues, Reddit, Yelp, and more. Leads are scored by keyword relevance so only strong matches appear.",
      },
    },
    {
      "@type": "Question",
      name: "What is the best AI proposal generator for freelancers?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "iCloseLeads includes a built-in AI proposal generator that writes personalized outreach proposals for any lead — tailored to the job description and your niche. One-click generation, no templates to fill in.",
      },
    },
    {
      "@type": "Question",
      name: "How is iCloseLeads different from Upwork or Fiverr?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Upwork and Fiverr are marketplaces where clients post and freelancers compete. iCloseLeads is a proactive lead-finding tool that surfaces opportunities across 23 sources so freelancers can reach out directly — no platform fees, no bidding wars.",
      },
    },
  ],
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homepageFaqSchema) }}
      />
      <HomepageClient />
    </>
  );
}
