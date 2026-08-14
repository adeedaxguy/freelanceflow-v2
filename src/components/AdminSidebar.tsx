"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard, Users, Settings, BarChart2, Shield, LogOut, Zap,
  MessageSquare, DollarSign, Megaphone, UserCheck, FileText, BookOpen,
  Inbox, Mail, ChevronRight, Menu, X, MessageCircle,
} from "lucide-react";
import { signOut } from "next-auth/react";
import ThemeToggle from "./ThemeToggle";
import Logo from "./Logo";

const NAV_GROUPS = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard",        href: "/admin",           icon: LayoutDashboard },
    ],
  },
  {
    label: "Users & Staff",
    items: [
      { label: "User Management",  href: "/admin/users",     icon: Users         },
      { label: "Staff & Managers", href: "/admin/managers",  icon: UserCheck     },
    ],
  },
  {
    label: "Revenue & Growth",
    items: [
      { label: "Revenue / MRR",    href: "/admin/revenue",   icon: DollarSign    },
      { label: "Analytics",        href: "/admin/analytics", icon: BarChart2     },
    ],
  },
  {
    label: "Communication",
    items: [
      { label: "Mailbox",          href: "/admin/inbox",     icon: Inbox         },
      { label: "Support Tickets",  href: "/admin/support",   icon: MessageSquare },
      { label: "Broadcast",        href: "/admin/broadcast", icon: Megaphone     },
      { label: "Contact Forms",    href: "/admin/contacts",  icon: Mail          },
    ],
  },
  {
    label: "Content",
    items: [
      { label: "Blog Posts",       href: "/admin/blog",      icon: BookOpen      },
      { label: "Blog Comments",    href: "/admin/comments",  icon: MessageCircle },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Platform Settings",href: "/admin/settings",  icon: Settings      },
      { label: "Audit Log",        href: "/admin/audit",     icon: Shield        },
    ],
  },
];

function NavContent({ onLinkClick }: { onLinkClick?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex-1 py-3 px-3 space-y-4 overflow-y-auto">
      {NAV_GROUPS.map(group => (
        <div key={group.label}>
          <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50 px-3 mb-1">
            {group.label}
          </p>
          <div className="space-y-0.5">
            {group.items.map(item => {
              const Icon = item.icon;
              const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
              return (
                <Link key={item.href} href={item.href} onClick={onLinkClick}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? "bg-primary/15 text-primary-light border border-primary/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  }`}>
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1 text-xs">{item.label}</span>
                  {active && <ChevronRight className="w-3 h-3 opacity-50" />}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

function SidebarFooter({ onLinkClick }: { onLinkClick?: () => void }) {
  return (
    <div className="p-3 border-t border-border space-y-1">
      <Link href="/dashboard" onClick={onLinkClick}
        className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-lg hover:bg-white/5">
        ← User Dashboard
      </Link>
      <button onClick={() => void signOut({ callbackUrl: "/" })}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all">
        <LogOut className="w-3.5 h-3.5" /> Sign Out
      </button>
    </div>
  );
}

function SidebarLogo() {
  return (
    <div className="flex items-center gap-2">
      <Logo size="sm" href="/admin" />
      <span className="text-[10px] text-primary-light font-bold uppercase tracking-wider bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded-md">
        Admin
      </span>
    </div>
  );
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close on navigation
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  // Lock scroll when open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside className="hidden lg:flex w-60 flex-shrink-0 bg-surface border-r border-border flex-col min-h-screen">
        <div className="px-4 py-4 border-b border-border flex items-center justify-between">
          <SidebarLogo />
          <ThemeToggle size="sm" />
        </div>
        <NavContent />
        <SidebarFooter />
      </aside>

      {/* ── Mobile top bar ── */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 h-14 bg-surface border-b border-border">
        <SidebarLogo />
        <div className="flex items-center gap-2">
          <ThemeToggle size="sm" />
          <button onClick={() => setMobileOpen(true)} aria-label="Open admin menu"
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all">
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Mobile spacer */}
      <div className="lg:hidden h-14 flex-shrink-0" />

      {/* ── Mobile overlay ── */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)} />
      )}

      {/* ── Mobile drawer ── */}
      <aside className={`lg:hidden fixed top-0 left-0 bottom-0 z-50 w-72 bg-surface border-r border-border flex flex-col transition-transform duration-300 ease-in-out ${
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="flex items-center justify-between p-4 border-b border-border">
          <SidebarLogo />
          <button onClick={() => setMobileOpen(false)} aria-label="Close menu"
            className="w-8 h-8 flex items-center justify-center rounded-xl border border-border text-muted-foreground hover:text-foreground transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>
        <NavContent onLinkClick={() => setMobileOpen(false)} />
        <SidebarFooter onLinkClick={() => setMobileOpen(false)} />
      </aside>
    </>
  );
}
