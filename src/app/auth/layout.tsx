import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: { absolute: "Sign In or Create an Account | iCloseLeads" },
  description: "Sign in to iCloseLeads or create a free account to search, qualify, and manage leads.",
  alternates: { canonical: "https://icloseleads.com/auth" },
  robots: {
    index: false,
    follow: true,
    googleBot: { index: false, follow: true },
  },
};

export default function AuthLayout({ children }: { children: ReactNode }) {
  return children;
}
