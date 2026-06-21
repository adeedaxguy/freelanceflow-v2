"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";

const FloatingChat = dynamic(() => import("@/components/FloatingChat"), { ssr: false });
const CookieConsent = dynamic(() => import("@/components/CookieConsent"), { ssr: false });

function runWhenIdle(callback: () => void) {
  if (typeof window === "undefined") return () => {};

  const idleWindow = window as Window & typeof globalThis & {
    requestIdleCallback?: (cb: IdleRequestCallback, options?: IdleRequestOptions) => number;
    cancelIdleCallback?: (id: number) => void;
  };

  if (idleWindow.requestIdleCallback) {
    const id = idleWindow.requestIdleCallback(callback, { timeout: 2500 });
    return () => idleWindow.cancelIdleCallback?.(id);
  }

  const timeout = globalThis.setTimeout(callback, 1800);
  return () => globalThis.clearTimeout(timeout);
}

export default function DeferredClientChrome() {
  const [showCookieConsent, setShowCookieConsent] = useState(false);
  const [chatRequested, setChatRequested] = useState(false);

  useEffect(() => {
    let cleanupIdle = () => {};
    const timeout = globalThis.setTimeout(() => {
      cleanupIdle = runWhenIdle(() => setShowCookieConsent(true));
    }, 12000);

    return () => {
      globalThis.clearTimeout(timeout);
      cleanupIdle();
    };
  }, []);

  if (chatRequested) {
    return (
      <>
        <FloatingChat initialOpen />
        {showCookieConsent && <CookieConsent />}
      </>
    );
  }

  return (
    <>
      {showCookieConsent && <CookieConsent />}
      <button
        onClick={() => setChatRequested(true)}
        className="fixed bottom-6 right-4 sm:right-6 z-50 w-14 h-14 rounded-2xl bg-gradient-hero shadow-glow-primary flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
        aria-label="Open support chat"
      >
        <MessageCircle className="w-6 h-6 text-white" />
      </button>
    </>
  );
}
