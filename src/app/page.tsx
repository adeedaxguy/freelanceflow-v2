import type { Metadata } from "next";
import HomepageClient from "@/components/HomepageClient";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://icloseleads.com"),
  title: "Freelance Lead Generation Software for Remote Jobs and Local Business Leads",
  description: "Find remote job leads, local business leads, and live job opportunities. Generate AI proposals, prepare Gmail outreach, and track every freelance client in one CRM.",
  keywords: [
    "freelance lead generation",
    "remote job leads",
    "local business leads",
    "live job leads",
    "find freelance clients",
    "AI proposal generator",
    "freelance CRM",
    "client acquisition for freelancers",
    "businesses without websites",
    "cold email outreach for freelancers"
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://icloseleads.com",
    siteName: "iCloseLeads",
    title: "Freelance Lead Generation Software for Remote Jobs and Local Business Leads",
    description: "Find remote job leads, local business leads, and live job opportunities, then turn each signal into AI-assisted outreach and a tracked freelance pipeline.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "iCloseLeads" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Remote Jobs, Local Business Leads, and AI Proposals",
    description: "Find better freelance leads, draft sharper outreach, and track every client opportunity in one workflow.",
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
  "description": "Freelance lead generation software for finding remote job leads, local business leads, live job opportunities, AI proposals, Gmail-ready outreach, and CRM pipeline tracking.",
  "featureList": [
    "Remote job lead discovery",
    "Local business lead generation",
    "Live job opportunity feed",
    "AI proposal generator",
    "Gmail-ready outreach preparation",
    "Freelance CRM pipeline",
    "Lead scoring and analytics"
  ],
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
    "description": "Free early access plan available.",
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
