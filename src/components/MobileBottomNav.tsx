"use client";

/**
 * MobileBottomNav — native-app-style bottom tab bar.
 * Shown only on mobile (hidden on lg+). Provides instant one-tap access
 * to the five most-used pages. "More" opens the full sidebar drawer.
 */

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Search, Radio, Bookmark, MoreHorizontal,
} from "lucide-react";

const TABS: Array<{
  href: string;
  label: string;
  icon: React.ElementType;
  isLive?: boolean;
  tourId?: string;
}> = [
  { href: "/dashboard",             label: "Home",  icon: LayoutDashboard, tourId: "mobile-home" },
  { href: "/dashboard/leads",       label: "Jobs",  icon: Search,          tourId: "mobile-jobs" },
  { href: "/dashboard/live-jobs",   label: "Live",  icon: Radio,           isLive: true, tourId: "mobile-live" },
  { href: "/dashboard/saved-leads", label: "Saved", icon: Bookmark,        tourId: "mobile-saved" },
];

export default function MobileBottomNav() {
  const pathname = usePathname();

  const openSidebar = () => {
    (window as unknown as Record<string, (() => void) | undefined>).__openMobileSidebar?.();
  };

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-md border-t border-border"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex items-stretch justify-around h-16">
        {TABS.map(({ href, label, icon: Icon, isLive, tourId }) => {
          const active =
            pathname === href ||
            (href !== "/dashboard" && pathname.startsWith(href));

          return (
            <Link
              key={href}
              href={href}
              data-tour={tourId}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 px-1 relative transition-colors ${
                active ? "text-primary-light" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {/* Live pulse dot */}
              {isLive && (
                <span className="absolute top-2.5 right-1/2 -translate-x-[-10px] w-2 h-2 rounded-full bg-accent animate-pulse" />
              )}

              <Icon className={`w-5 h-5 transition-transform ${active ? "scale-110" : ""}`} />
              <span className={`text-[10px] font-semibold tracking-wide ${active ? "text-primary-light" : ""}`}>
                {label}
              </span>

              {/* Active indicator pip */}
              {active && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-primary-light" />
              )}
            </Link>
          );
        })}

        {/* More — opens the full sidebar drawer */}
        <button
          onClick={openSidebar}
          data-tour="mobile-more"
          aria-label="Open full dashboard menu"
          className="flex flex-col items-center justify-center gap-0.5 flex-1 px-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <MoreHorizontal className="w-5 h-5" />
          <span className="text-[10px] font-semibold tracking-wide">More</span>
        </button>
      </div>
    </nav>
  );
}
