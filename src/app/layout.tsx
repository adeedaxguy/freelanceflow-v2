import React, { type ReactNode } from "react";
import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import DeferredClientChrome from "@/components/DeferredClientChrome";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://icloseleads.com"),
  title: {
    default: "iCloseLeads - Freelance Lead Generation and Cold Outreach Software",
    template: "%s | iCloseLeads",
  },
  description: "iCloseLeads helps freelancers find remote job leads, local business leads, decision-maker paths, and live job signals, then write better cold outreach and track follow-up.",
  keywords: ["iCloseLeads", "freelance cold outreach", "freelance lead generation", "remote job leads", "local business leads", "decision maker finder", "AI proposals", "freelancer tools"],
  authors: [{ name: "iCloseLeads" }],
  creator: "iCloseLeads",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://icloseleads.com",
    siteName: "iCloseLeads",
    title: "iCloseLeads - Freelance Lead Generation and Cold Outreach Software",
    description: "Find remote job leads, local business leads, decision-maker paths, live job signals, AI proposals, and CRM follow-up in one workflow.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "iCloseLeads" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "iCloseLeads - Freelance Lead Generation",
    description: "Find better freelance leads, write stronger outreach, and track every follow-up.",
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
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Prevent flash of wrong theme — runs synchronously before first paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('ff_theme');var d=t==='light'?'light':'dark';var r=document.documentElement;r.classList.remove(d==='light'?'dark':'light');r.classList.add(d);r.style.colorScheme=d;}catch(e){document.documentElement.classList.add('dark');document.documentElement.style.colorScheme='dark';}})();`,
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
