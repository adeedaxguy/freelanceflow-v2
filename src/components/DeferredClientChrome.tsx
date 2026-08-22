"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
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
  const pathname = usePathname();
  const [showCookieConsent, setShowCookieConsent] = useState(false);
  const [chatRequested, setChatRequested] = useState(false);
  const [showMobileLauncher, setShowMobileLauncher] = useState(false);
  const isDashboard = pathname?.startsWith("/dashboard");
  const isAuth = pathname?.startsWith("/auth");
  const isSitePreview = pathname?.startsWith("/site-preview");
  const launcherVisibilityClass = showMobileLauncher ? "flex" : "hidden sm:flex";

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

  useEffect(() => {
    setChatRequested(false);
  }, [pathname]);

  useEffect(() => {
    if (isDashboard || isAuth) {
      setShowMobileLauncher(false);
      return undefined;
    }

    const updateMobileLauncher = () => {
      setShowMobileLauncher(window.scrollY > 520);
    };

    updateMobileLauncher();
    window.addEventListener("scroll", updateMobileLauncher, { passive: true });
    return () => window.removeEventListener("scroll", updateMobileLauncher);
  }, [isAuth, isDashboard, pathname]);

  if (isSitePreview) {
    return null;
  }

  if (isDashboard) {
    return showCookieConsent ? <CookieConsent /> : null;
  }

  if (chatRequested) {
    return (
      <>
        <FloatingChat initialOpen />
      </>
    );
  }

  return (
    <>
      {showCookieConsent && <CookieConsent />}
      <button
        onClick={() => setChatRequested(true)}
        className={`fixed bottom-6 right-4 sm:right-6 z-50 h-14 w-14 items-center justify-center rounded-2xl bg-gradient-hero shadow-glow-primary transition-all hover:scale-105 active:scale-95 ${showCookieConsent ? "hidden sm:flex" : launcherVisibilityClass}`}
        aria-label="Open support chat"
      >
        <MessageCircle className="w-6 h-6 text-white" />
      </button>
    </>
  );
}
