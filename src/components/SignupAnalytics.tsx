"use client";

import { useEffect } from "react";
import { trackAnalyticsEvent } from "@/lib/analytics";

const PENDING_SIGNUP_KEY = "icl_pending_oauth_signup";
const MAX_OAUTH_SIGNUP_AGE_MS = 60 * 60 * 1000;

export default function SignupAnalytics({ createdAt }: { createdAt?: string }) {
  useEffect(() => {
    let raw: string | null = null;
    try {
      raw = sessionStorage.getItem(PENDING_SIGNUP_KEY);
    } catch {
      return;
    }
    if (!raw) return;

    try {
      const pending = JSON.parse(raw) as { method?: string; intent?: string; source?: string };
      const accountAge = Date.now() - new Date(createdAt ?? 0).getTime();
      if (!Number.isFinite(accountAge) || accountAge < 0 || accountAge > MAX_OAUTH_SIGNUP_AGE_MS) {
        sessionStorage.removeItem(PENDING_SIGNUP_KEY);
        return;
      }

      const attribution = {
        method: pending.method ?? "oauth",
        signup_intent: pending.intent || "default",
        signup_source: pending.source || "direct",
      };
      const send = () => {
        if (!window.gtag) return false;
        trackAnalyticsEvent("sign_up", attribution);
        trackAnalyticsEvent("signup_completed", attribution);
        sessionStorage.removeItem(PENDING_SIGNUP_KEY);
        return true;
      };

      if (send()) return;
      const retry = window.setTimeout(send, 1_000);
      return () => window.clearTimeout(retry);
    } catch {
      sessionStorage.removeItem(PENDING_SIGNUP_KEY);
    }
  }, [createdAt]);

  return null;
}
