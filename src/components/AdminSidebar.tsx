"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Users, Mail, Search, BookOpen,
  Settings, MessageSquare, Zap, ChevronRight, BarChart2
} from "lucide-react";

const adminLinks = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard, exact: true },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "All Emails", href: "/admin/emails", icon: Mail },
  { label: "All Leads", href: "/admin/leads", icon: Search },
  { label: "Blog CMS", href: "/admin/blog", icon: BookOpen },
  { label: "Contacts", href: "/admin/contacts", icon: MessageSquare },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart2 },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="w-64 min-h-screen bg-surface border-r border-border flex flex-col"
      aria-label="Admin navigation"
    >
      <div className="p-6 border-b border-border">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-hero flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="font-bold text-foreground text-sm">FreelanceFlow</div>
            <div className="text-xs text-accent font-medium">Admin Panel</div>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1" aria-label="Admin navigation">
        {adminLinks.map((link) => {
          const Icon = link.icon;
          const isActive = link.exact
            ? pathname === link.href
            : pathname.startsWith(link.href);

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                isActive
                  ? "bg-accent/10 text-accent border border-accent/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className={cn("w-4 h-4 flex-shrink-0", isActive ? "text-accent" : "text-muted-foreground group-hover:text-foreground")} />
              <span className="flex-1">{link.label}</span>
              {isActive && <ChevronRight className="w-3 h-3 text-accent" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Switch to User Panel</span>
        </Link>
      </div>
    </aside>
  );
}
