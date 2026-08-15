"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

declare global {
  interface Window {
    adsbygoogle?: Array<Record<string, never>>;
  }
}

const AD_CLIENT = "ca-pub-7576940446912367";

type AdSenseUnitProps = {
  slot: string;
  format: "auto" | "fluid";
  layoutKey?: string;
  fullWidthResponsive?: boolean;
  className?: string;
};

function AdSenseUnit({
  slot,
  format,
  layoutKey,
  fullWidthResponsive = false,
  className = "",
}: AdSenseUnitProps) {
  const adRef = useRef<HTMLModElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current || adRef.current?.dataset.adsbygoogleStatus) return;

    initialized.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("AdSense unit could not initialize", error);
      }
    }
  }, []);

  return (
    <aside aria-label="Advertisement" className={`min-w-0 ${className}`}>
      <p className="mb-2 text-center text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
        Advertisement
      </p>
      <div className="min-h-[128px] min-w-0 overflow-hidden rounded-xl border border-border/70 bg-card p-3">
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{ display: "block" }}
          data-ad-client={AD_CLIENT}
          data-ad-slot={slot}
          data-ad-format={format}
          data-ad-layout-key={layoutKey}
          data-full-width-responsive={fullWidthResponsive ? "true" : undefined}
        />
      </div>
    </aside>
  );
}

export function MarketingAdBand({ className = "" }: { className?: string }) {
  return (
    <section className={`border-y border-border bg-surface/25 px-4 py-10 sm:px-6 lg:px-8 ${className}`}>
      <div className="mx-auto max-w-6xl">
        <AdSenseUnit slot="1080749546" format="auto" fullWidthResponsive />
      </div>
    </section>
  );
}

export function BlogInlineAd({ className = "" }: { className?: string }) {
  return (
    <AdSenseUnit
      slot="1080749546"
      format="auto"
      fullWidthResponsive
      className={`my-10 ${className}`}
    />
  );
}

const PUBLIC_AD_PATHS = new Set([
  "/about",
  "/affiliate",
  "/blog",
  "/careers",
  "/changelog",
  "/features",
  "/lead-generation",
  "/press",
  "/pricing",
  "/resources",
  "/use-cases",
]);

const PUBLIC_AD_PREFIXES = [
  "/features/",
  "/for/",
  "/lead-generation/",
  "/resources/",
  "/tools/",
  "/use-cases/",
];

export function PublicFooterAd() {
  const pathname = usePathname();
  const isBlogPost = pathname.startsWith("/blog/");
  const isEligible = PUBLIC_AD_PATHS.has(pathname)
    || PUBLIC_AD_PREFIXES.some(prefix => pathname.startsWith(prefix));

  if (!isEligible || isBlogPost) return null;

  return <MarketingAdBand className="border-b-0" />;
}

export function LeadResultsAd() {
  const [viewport, setViewport] = useState<"mobile" | "desktop" | null>(null);

  useEffect(() => {
    setViewport(window.matchMedia("(max-width: 767px)").matches ? "mobile" : "desktop");
  }, []);

  if (!viewport) return null;

  return viewport === "mobile" ? (
    <AdSenseUnit
      slot="9482129532"
      format="fluid"
      layoutKey="-6c+e7+1e-40+6x"
      className="my-7"
    />
  ) : (
    <AdSenseUnit
      slot="1014084754"
      format="fluid"
      layoutKey="-ex+5g+64-d5+3t"
      className="my-7"
    />
  );
}

export function DashboardBottomAd() {
  return (
    <AdSenseUnit
      slot="1080749546"
      format="auto"
      fullWidthResponsive
      className="mt-8"
    />
  );
}
