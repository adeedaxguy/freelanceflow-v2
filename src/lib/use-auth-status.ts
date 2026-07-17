"use client";

import { useEffect, useState } from "react";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export function useAuthStatus() {
  const [status, setStatus] = useState<AuthStatus>("loading");

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/auth/session", {
      cache: "no-store",
      credentials: "same-origin",
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) return null;
        return response.json() as Promise<{ user?: unknown } | null>;
      })
      .then((session) => {
        if (!controller.signal.aborted) {
          setStatus(session?.user ? "authenticated" : "unauthenticated");
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) setStatus("unauthenticated");
      });

    return () => controller.abort();
  }, []);

  return status;
}
