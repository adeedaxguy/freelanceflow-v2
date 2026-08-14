import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Freelance Lead Value and ROI Calculator",
  description:
    "Calculate how many freelance leads you need, what manual prospecting costs, and how lead quality affects revenue.",
  alternates: { canonical: "https://icloseleads.com/tools/lead-calculator" },
  openGraph: {
    title: "Freelance Lead Value and ROI Calculator",
    description:
      "Estimate lead volume, close rate, revenue, and manual prospecting cost before building your next freelance outreach pipeline.",
    url: "https://icloseleads.com/tools/lead-calculator",
    siteName: "iCloseLeads",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-snippet": -1 },
  },
};

export default function LeadCalculatorLayout({ children }: { children: React.ReactNode }) {
  return children;
}
