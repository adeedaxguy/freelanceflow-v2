"use client";

import Script from "next/script";
import { Suspense, useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const DEFAULT_MEASUREMENT_ID = "G-WRSW1WG2DY";
const MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? DEFAULT_MEASUREMENT_ID;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function GoogleAnalyticsPageTracker({ measurementId }: { measurementId: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const didTrackInitialRoute = useRef(false);

  useEffect(() => {
    if (!pathname) return;

    if (!didTrackInitialRoute.current) {
      didTrackInitialRoute.current = true;
      return;
    }

    const query = searchParams?.toString();
    const pagePath = query ? `${pathname}?${query}` : pathname;

    window.gtag?.("event", "page_view", {
      page_title: document.title,
      page_path: pagePath,
      page_location: window.location.href,
      send_to: measurementId,
    });
  }, [measurementId, pathname, searchParams]);

  return null;
}

export default function GoogleAnalytics() {
  if (!MEASUREMENT_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${MEASUREMENT_ID}');
        `}
      </Script>
      <Suspense fallback={null}>
        <GoogleAnalyticsPageTracker measurementId={MEASUREMENT_ID} />
      </Suspense>
    </>
  );
}
