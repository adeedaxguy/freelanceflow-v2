import React, { type ReactNode } from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import DeferredClientChrome from "@/components/DeferredClientChrome";

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
  description: "Find high-quality clients with AI-powered lead discovery, personalized proposals, and automated outreach. The #1 client acquisition platform for freelancers.",
  keywords: ["freelance", "client acquisition", "lead generation", "cold email", "AI proposals", "freelancer tools"],
  authors: [{ name: "iCloseLeads" }],
  creator: "iCloseLeads",
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
    description: "Find high-quality clients with AI. 10,000+ leads found monthly.",
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
        {/* Prevent flash of wrong theme — runs synchronously before first paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('ff_theme');var d=t==='light'?'light':t==='dark'?'dark':(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.classList.add(d);}catch(e){}})();`,
          }}
        />
      </head>
      <body>
        <Providers>
          {children}
          <DeferredClientChrome />
        </Providers>
      </body>
    </html>
  );
}
