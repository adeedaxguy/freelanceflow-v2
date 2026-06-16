"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ToastProvider } from "@/components/Toaster";
import CommandPalette from "@/components/CommandPalette";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <ToastProvider>
          {children}
          {/* Global command palette — Cmd+K / Ctrl+K */}
          <CommandPalette />
        </ToastProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
