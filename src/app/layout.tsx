import React, { type ReactNode } from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Providers } from "./providers";
import FloatingChat from "@/components/FloatingChat";
import { PostHogProvider } from "@/components/PostHogProvider";
import { PostHogPageview } from "@/components/PostHogPageview";

const GA_ID = "G-WRSW1WG2DY";
const SITE_URL = "https://icloseleads.com";

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "iCloseLeads",
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  description: "iCloseLeads is an AI-powered client acquisition platform for freelancers. It aggregates leads from up to 25 source integrations, scores by relevance, generates personalized AI proposals, and provides a full CRM pipeline. Free to start at icloseleads.com.",
  foundingDate: "2024",
  knowsAbout: [
    "Freelance lead generation",
    "Client acquisition for freelancers",
    "AI proposal generation",
    "Cold outreach for freelancers",
    "Remote job lead aggregation",
    "Local business lead generation",
    "Freelancer CRM",
    "Follow-up automation for freelancers",
    "Upwork alternative lead sources",
    "Freelance client pipeline management",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    email: "adnan@technodigg.com",
    contactType: "customer support",
  },
  sameAs: [],
};

const softwareApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "iCloseLeads",
  url: SITE_URL,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web Browser",
  description: "AI-powered client acquisition platform for freelancers. Find leads from up to 25 source integrations, generate personalized proposals, and manage your sales pipeline.",
  featureList: [
    "Lead discovery from up to 25 source integrations",
    "AI proposal generator",
    "Local business lead finder",
    "CRM pipeline",
    "Follow-up automation",
    "Live job feed",
  ],
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    description: "Free plan available — 20 leads/week, AI proposals, full CRM. No credit card required.",
  },
  creator: {
    "@type": "Organization",
    name: "iCloseLeads",
    url: SITE_URL,
  },
};

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://icloseleads.com"),
  title: {
    default: "iCloseLeads — AI-Powered Client Acquisition for Freelancers",
    template: "%s | iCloseLeads",
  },
  description: "Find high-quality freelance clients with AI-powered lead discovery across up to 25 source integrations, personalised proposals, and automated outreach. Free to start.",
  keywords: ["freelance leads", "client acquisition", "find freelance clients", "lead generation for freelancers", "cold email automation", "AI proposals", "freelancer tools", "local business leads"],
  authors: [{ name: "iCloseLeads" }],
  creator: "iCloseLeads",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://icloseleads.com",
    siteName: "iCloseLeads",
    title: "iCloseLeads — AI-Powered Client Acquisition for Freelancers",
    description: "Stop chasing clients. Let iCloseLeads find them with up to 25 source integrations, AI scoring, and one-click proposals.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "iCloseLeads" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "iCloseLeads — AI-Powered Client Acquisition",
    description: "Find freelance clients with AI. Up to 25 source integrations, AI proposals, CRM pipeline — free to start.",
    creator: "@icloseleads",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 },
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationSchema) }}
        />
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}', { page_path: window.location.pathname });
          `}
        </Script>
      </head>
      <body>
        <PostHogProvider>
          <Providers>
            <PostHogPageview />
            {children}
            <FloatingChat />
          </Providers>
        </PostHogProvider>
      </body>
    </html>
  );
}
