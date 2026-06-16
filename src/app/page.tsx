import type { Metadata } from "next";
import HomepageClient from "@/components/HomepageClient";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://icloseleads.com"),
  title: "iCloseLeads — AI-Powered Client Acquisition for Freelancers",
  description: "Find high-quality clients with AI-powered lead discovery from 7 real sources, personalized proposals, and automated outreach. Start free — no credit card required.",
  keywords: [
    "freelance lead generation", "find freelance clients", "AI proposal generator",
    "freelance CRM", "client acquisition for freelancers", "cold email outreach",
    "remote job leads", "freelancer tools 2025", "automated outreach freelancer"
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://icloseleads.com",
    siteName: "iCloseLeads",
    title: "iCloseLeads — AI-Powered Client Acquisition for Freelancers",
    description: "Stop chasing clients. Let iCloseLeads find them with AI-powered lead discovery and proposal generation.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "iCloseLeads" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "iCloseLeads — AI-Powered Client Acquisition",
    description: "Find high-quality clients with AI. 7 real lead sources. Free to start.",
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
  "url": "https://icloseleads.com",
  "logo": "https://icloseleads.com/og-image.png",
  "description": "AI-powered client acquisition platform for freelancers",
  "sameAs": [
    "https://twitter.com/icloseleads",
    "https://github.com/icloseleads",
    "https://linkedin.com/company/icloseleads",
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "email": "hello@icloseleads.com",
    "contactType": "customer support",
    "availableLanguage": "English",
  },
};

const softwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "iCloseLeads",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "url": "https://icloseleads.com",
  "description": "Find high-quality clients with AI-powered lead discovery, personalized proposals, and automated outreach.",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
    "description": "Free plan available. Pro from $29/month.",
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "320",
  },
};

export default function HomePage() {
  return (
    <>
      <HomepageClient />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }} />
    </>
  );
}
