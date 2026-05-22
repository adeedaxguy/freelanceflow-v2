import type { Metadata } from "next";
import HomepageClient from "@/components/HomepageClient";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://freelanceflow.io"),
  title: "FreelanceFlow — AI-Powered Client Acquisition for Freelancers",
  description: "Find high-quality clients with AI-powered lead discovery from 7 real sources, personalized proposals, and automated outreach. Start free — no credit card required.",
  keywords: [
    "freelance lead generation", "find freelance clients", "AI proposal generator",
    "freelance CRM", "client acquisition for freelancers", "cold email outreach",
    "remote job leads", "freelancer tools 2025", "automated outreach freelancer"
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://freelanceflow.io",
    siteName: "FreelanceFlow",
    title: "FreelanceFlow — AI-Powered Client Acquisition for Freelancers",
    description: "Stop chasing clients. Let FreelanceFlow find them with AI-powered lead discovery and proposal generation.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "FreelanceFlow" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "FreelanceFlow — AI-Powered Client Acquisition",
    description: "Find high-quality clients with AI. 7 real lead sources. Free to start.",
    creator: "@freelanceflow",
  },
  robots: {
    index: true, follow: true,
    googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 },
  },
};

export default function HomePage() {
  return <HomepageClient />;
}
