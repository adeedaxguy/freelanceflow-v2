import type { Metadata } from "next";

import { getPaddleConfig } from "@/lib/paddle";
import PaddleCheckoutClient from "./PaddleCheckoutClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Secure checkout | iCloseLeads",
  robots: { index: false, follow: false },
};

export default function PaddleCheckoutPage() {
  const config = getPaddleConfig();
  const appUrl = (
    process.env.NEXT_PUBLIC_APP_URL
    || process.env.NEXTAUTH_URL
    || "https://icloseleads.com"
  ).replace(/\/$/, "");

  return (
    <PaddleCheckoutClient
      clientToken={config.clientToken}
      environment={config.environment}
      successUrl={`${appUrl}/dashboard/upgrade?checkout=success`}
    />
  );
}
