import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Contact Us | iCloseLeads",
  description: "Get in touch with the iCloseLeads team. We typically reply within a few hours. Questions about pricing, features, or your account? We're here to help.",
  keywords: ["contact iCloseLeads", "freelance leads support", "lead generation help"],
  alternates: { canonical: "https://icloseleads.com/contact" },
  openGraph: {
    title: "Contact iCloseLeads",
    description: "Questions about iCloseLeads? Our team replies fast. Reach out any time.",
    url: "https://icloseleads.com/contact",
    type: "website",
  },
};

export default function ContactLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
