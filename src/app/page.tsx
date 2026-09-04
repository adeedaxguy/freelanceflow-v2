import type { Metadata } from "next";
import HomepageClient from "@/components/HomepageClient";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://icloseleads.com"),
  title: { absolute: "iCloseLeads - Freelance Lead Generation Software" },
  description: "Find local, web design, and remote freelance leads. Qualify prospects, draft proposals, call, and manage follow-up in one client acquisition workflow.",
  keywords: [
    "iCloseLeads",
    "icloseleads.com",
    "freelance lead generation",
    "free business leads",
    "business leads free",
    "web design leads",
    "local business leads for web designers",
    "freelance cold outreach",
    "freelance cold email",
    "cold outreach for freelancers",
    "remote job leads",
    "local business leads",
    "decision maker finder",
    "business owner name finder",
    "live job leads",
    "find freelance clients",
    "AI proposal generator",
    "softphone for freelancers",
    "sales softphone",
    "client acquisition software for freelancers",
    "call leads from CRM",
    "freelance CRM",
    "client acquisition for freelancers",
    "businesses without websites",
    "cold email outreach for freelancers"
  ],
  alternates: {
    canonical: "https://icloseleads.com",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://icloseleads.com",
    siteName: "iCloseLeads",
    title: "iCloseLeads - Freelance Lead Generation Software",
    description: "Find web design leads, local business prospects, remote job leads, owner paths, AI proposals, Gmail drafts, softphone calling, and CRM follow-up in one workflow.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "iCloseLeads" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "iCloseLeads - Freelance Lead Generation",
    description: "Find better freelance leads, draft sharper outreach, call prospects from the platform, and track every client opportunity.",
    creator: "@icloseleads",
  },
  robots: {
    index: true, follow: true,
    googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 },
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "iCloseLeads",
  "alternateName": ["iCloseLeads"],
  "url": "https://icloseleads.com",
  "logo": "https://icloseleads.com/og-image.png",
    "description": "Freelance lead generation and cold outreach software for free business leads, web design leads, remote job leads, local business leads, decision-maker research, AI proposals, softphone calling, and CRM follow-up.",
  "disambiguatingDescription": "iCloseLeads is an independent freelance lead generation platform. It is not iClose or iCloser.",
  "knowsAbout": [
    "freelance cold outreach",
    "remote job leads",
    "local business leads",
    "decision maker finder",
    "AI proposals",
    "softphone calling",
    "freelance CRM",
    "free business leads",
    "client acquisition software"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "email": "hello@icloseleads.com",
    "contactType": "customer support",
    "availableLanguage": "English",
  },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "iCloseLeads",
  "alternateName": "iCloseLeads.com",
  "url": "https://icloseleads.com",
  "description": "Freelance lead generation software for free business leads, cold outreach, web design leads, remote job leads, local business leads, decision maker discovery, live job opportunities, AI proposals, softphone calling, and CRM follow-up.",
};

const softwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "iCloseLeads",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "url": "https://icloseleads.com",
  "description": "Freelance lead generation software for finding free business leads, web design leads, remote job leads, local business leads, owner and manager contact paths, live job opportunities, AI proposals, Gmail-ready outreach, softphone calling, and CRM pipeline tracking.",
  "featureList": [
    "Freelance cold outreach workflow",
    "Remote job lead discovery",
    "Local business lead generation",
    "Free business lead search",
    "Decision maker and owner contact path discovery",
    "Live job opportunity feed",
    "AI proposal generator",
    "Gmail-ready outreach preparation",
    "Built-in softphone option for calling leads",
    "Prompt-to-website design concepts for qualified leads",
    "Freelance CRM pipeline",
    "Lead scoring and analytics"
  ],
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
    "description": "Free early access plan available.",
  },
  "potentialAction": {
    "@type": "RegisterAction",
    "target": "https://icloseleads.com/auth?mode=signup&intent=first-search",
    "name": "Run a free iCloseLeads lead search"
  }
};

const useCaseItemListJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "iCloseLeads lead generation use cases",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Remote Job Leads",
      "url": "https://icloseleads.com/use-cases/remote-job-leads",
      "description": "Find fresh remote job leads, freelance job alerts, and contract opportunities by niche.",
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Freelance Cold Outreach",
      "url": "https://icloseleads.com/use-cases/freelance-cold-outreach",
      "description": "Find lead signals, write researched cold outreach, prepare Gmail drafts, and track follow-up without losing context.",
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Local Business Leads",
      "url": "https://icloseleads.com/use-cases/local-business-leads",
      "description": "Find local businesses with no website, outdated websites, visible marketing gaps, and owner or manager verification paths.",
    },
    {
      "@type": "ListItem",
      "position": 4,
      "name": "Live Job Leads",
      "url": "https://icloseleads.com/use-cases/live-job-leads",
      "description": "Monitor live freelance opportunities and turn fresh demand into saved leads and outreach.",
    },
  ],
};

const leadGenerationItemListJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "iCloseLeads signup-intent lead generation pages",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Web Design Leads",
      "url": "https://icloseleads.com/lead-generation/web-design-leads",
      "description": "Find businesses and remote opportunities with visible website, conversion, or local SEO needs.",
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Freelance Client Leads",
      "url": "https://icloseleads.com/lead-generation/freelance-client-leads",
      "description": "Find freelance prospects from remote jobs, local business signals, live opportunities, and outreach-ready context.",
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Remote Freelance Jobs",
      "url": "https://icloseleads.com/lead-generation/remote-freelance-jobs",
      "description": "Find fresh remote freelance jobs and turn the best matches into proposal-ready leads.",
    },
    {
      "@type": "ListItem",
      "position": 4,
      "name": "Local Business Leads",
      "url": "https://icloseleads.com/lead-generation/local-business-leads",
      "description": "Search local businesses by city, category, website signal, phone route, and pitch fit.",
    },
    {
      "@type": "ListItem",
      "position": 5,
      "name": "Businesses Without Websites",
      "url": "https://icloseleads.com/lead-generation/businesses-without-websites",
      "description": "Find no-website or unknown-website local prospects and verify them before pitching.",
    },
  ],
};

export default function HomePage() {
  return (
    <>
      <HomepageClient />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(useCaseItemListJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(leadGenerationItemListJsonLd) }} />
    </>
  );
}
