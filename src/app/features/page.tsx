import type { Metadata } from "next";
import FeatureOverviewPage from "@/components/FeatureOverviewPage";
import { seoDescription, seoTitle } from "@/lib/seo-copy";

export const metadata: Metadata = {
  metadataBase: new URL("https://icloseleads.com"),
  title: { absolute: seoTitle("Lead Discovery, Outreach, Softphone and CRM") },
  description: seoDescription(
    "Explore live lead discovery, local business leads, AI proposals, Gmail-ready outreach, softphone calling, CRM, analytics, and free tools.",
  ),
  keywords: [
    "freelance lead generation software",
    "AI proposal generator for freelancers",
    "freelance CRM software",
    "cold email outreach for freelancers",
    "softphone for freelancers",
    "local business leads",
    "freelance analytics dashboard",
  ],
  alternates: { canonical: "https://icloseleads.com/features" },
  openGraph: {
    title: "iCloseLeads Features: Client Acquisition Software for Freelancers",
    description:
      "Find leads, write proposals, prepare outreach, call prospects, track pipeline, and understand what is working from one freelancer-focused platform.",
    url: "https://icloseleads.com/features",
    type: "website",
    siteName: "iCloseLeads",
  },
  twitter: {
    card: "summary_large_image",
    title: "iCloseLeads Features",
    description:
      "Lead discovery, AI proposals, softphone calling, Gmail-ready outreach, CRM pipeline, analytics, and free tools for freelancers.",
  },
};

export default function FeaturesPage() {
  return <FeatureOverviewPage />;
}
