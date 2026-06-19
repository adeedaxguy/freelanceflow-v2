"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ToastProvider } from "@/components/Toaster";
import DeferredCommandPalette from "@/components/DeferredCommandPalette";
import type { ReactNode } from "react";

const SessionBoundary = dynamic(() => import("@/components/SessionBoundary"), { ssr: false });

export function Providers({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const needsSession = pathname?.startsWith("/auth") || pathname?.startsWith("/dashboard");
  const needsCommandPalette = pathname?.startsWith("/dashboard");

  const content = (
    <ThemeProvider>
      <ToastProvider>
        {children}
        {needsCommandPalette && (
          <>
            {/* Global command palette - Cmd+K / Ctrl+K */}
            <DeferredCommandPalette />
          </>
        )}
      </ToastProvider>
    </ThemeProvider>
  );

  return needsSession ? <SessionBoundary>{content}</SessionBoundary> : content;
}
