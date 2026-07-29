"use client";

import { CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import Link from "next/link";
import Script from "next/script";
import { useState } from "react";

interface PaddleWindow {
  Environment: { set: (environment: "sandbox") => void };
  Initialize: (options: {
    token: string;
    checkout: {
      settings: {
        allowLogout: boolean;
        displayMode: "overlay";
        locale: "en";
        successUrl: string;
        theme: "light";
        variant: "one-page";
      };
    };
  }) => void;
}

declare global {
  interface Window {
    Paddle?: PaddleWindow;
    __iclPaddleInitialized?: boolean;
  }
}

export default function PaddleCheckoutClient({
  clientToken,
  environment,
  successUrl,
}: {
  clientToken: string;
  environment: "sandbox" | "live";
  successUrl: string;
}) {
  const [error, setError] = useState("");

  function initializePaddle() {
    if (!window.Paddle || window.__iclPaddleInitialized) return;
    if (!clientToken) {
      setError("Checkout is not available yet. Please return to iCloseLeads.");
      return;
    }

    try {
      if (environment === "sandbox") window.Paddle.Environment.set("sandbox");
      window.Paddle.Initialize({
        token: clientToken,
        checkout: {
          settings: {
            allowLogout: false,
            displayMode: "overlay",
            locale: "en",
            successUrl,
            theme: "light",
            variant: "one-page",
          },
        },
      });
      window.__iclPaddleInitialized = true;
    } catch {
      setError("Secure checkout could not load. Please try again.");
    }
  }

  return (
    <main className="min-h-screen bg-background px-5 py-16 text-foreground">
      <Script
        src="https://cdn.paddle.com/paddle/v2/paddle.js"
        strategy="afterInteractive"
        onLoad={initializePaddle}
        onReady={initializePaddle}
        onError={() => setError("Secure checkout could not load. Please try again.")}
      />
      <section className="mx-auto max-w-lg border border-border bg-card p-8 text-center shadow-sm">
        <ShieldCheck className="mx-auto h-10 w-10 text-accent" />
        <h1 className="mt-5 text-2xl font-semibold">Secure iCloseLeads checkout</h1>
        {error ? (
          <>
            <p className="mt-3 text-sm text-destructive">{error}</p>
            <Link
              href="/dashboard/upgrade"
              className="mt-6 inline-flex min-h-11 items-center justify-center bg-primary px-5 font-medium text-primary-foreground"
            >
              Return to plans
            </Link>
          </>
        ) : (
          <>
            <Loader2 className="mx-auto mt-6 h-6 w-6 animate-spin text-primary" />
            <p className="mt-3 text-sm text-muted-foreground">
              Loading the protected Paddle payment window.
            </p>
            <p className="mt-5 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-accent" />
              Your plan changes only after signed payment confirmation.
            </p>
          </>
        )}
      </section>
    </main>
  );
}
