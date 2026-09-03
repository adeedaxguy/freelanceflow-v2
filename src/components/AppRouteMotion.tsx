"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";

export function MarketingRouteMotion({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();

  if (pathname.startsWith("/dashboard") || pathname.startsWith("/admin")) {
    return children;
  }

  return (
    <motion.div
      key={pathname}
      initial={reduceMotion ? false : { opacity: 0.92, filter: "blur(4px)" }}
      animate={{ opacity: 1, filter: "blur(0px)" }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function DashboardRouteMotion({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      key={pathname}
      className="min-h-full"
      initial={reduceMotion ? false : { opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
