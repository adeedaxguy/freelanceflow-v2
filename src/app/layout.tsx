import React, { type ReactNode } from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import FloatingChat from "@/components/FloatingChat";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://freelanceflow.io"),
  title: {
    default: "FreelanceFlow — AI-Powered Client Acquisition for Freelancers",
    template: "%s | FreelanceFlow",
  },
  description: "Find high-quality clients with AI-powered lead discovery, personalized proposals, and automated outreach. The #1 client acquisition platform for freelancers.",
  keywords: ["freelance", "client acquisition", "lead generation", "cold email", "AI proposals", "freelancer tools"],
  authors: [{ name: "FreelanceFlow" }],
  creator: "FreelanceFlow",
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
    description: "Find high-quality clients with AI. 10,000+ leads found monthly.",
    creator: "@freelanceflow",
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
      <body>
        <Providers>
          {children}
          <FloatingChat />
        </Providers>
      </body>
    </html>
  );
}
