"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Search, Bookmark, Send, BarChart2, Settings, FileText, Megaphone, User, Wrench, MessageCircle, Zap, CalendarDays, GitMerge } from "lucide-react";

const NAV = [
  { href: "/dashboard",              label: "Overview",     icon: LayoutDashboard },
  { href: "/dashboard/leads",        label: "Find Leads",   icon: Search },
  { href: "/dashboard/saved-leads",  label: "Saved Leads",  icon: Bookmark },
  { href: "/dashboard/pipeline",     label: "CRM Pipeline", icon: GitMerge },
  { href: "/dashboard/deal-closer",  label: "AI Deal Closer", icon: Zap },
  { href: "/dashboard/followups",    label: "Follow-Ups",   icon: CalendarDays },
  { href: "/dashboard/campaigns",    label: "Campaigns",    icon: Megaphone },
  { href: "/dashboard/templates",    label: "Templates",    icon: FileText },
  { href: "/dashboard/sent",         label: "Sent Emails",  icon: Send },
  { href: "/dashboard/analytics",    label: "Analytics",    icon: BarChart2 },
  { href: "/dashboard/tools",        label: "Free Tools",   icon: Wrench },
  { href: "/dashboard/support",      label: "Support",      icon: MessageCircle },
  { href: "/dashboard/profile",      label: "Profile",      icon: User },
  { href: "/dashboard/settings",     label: "Settings",     icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-surface border-r border-border flex flex-col min-h-screen">
      {/* Logo */}
      <div className="p-5 border-b border-border">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-hero flex items-center justify-center shadow-glow-primary">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-extrabold text-foreground text-lg">iCloseLeads</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? "bg-primary/15 text-primary-light shadow-glow-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              }`}>
              <Icon className={`w-4 h-4 flex-shrink-0 ${active ? "text-primary-light" : ""}`} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Upgrade banner */}
      <div className="p-3 border-t border-border">
        <Link href="/dashboard/upgrade" className="block bg-gradient-hero rounded-xl p-4 hover:opacity-90 transition-all">
          <div className="text-white font-bold text-sm mb-0.5">Upgrade to Pro</div>
          <div className="text-white/70 text-xs">500 leads/week · Unlimited AI proposals</div>
        </Link>
      </div>
    </aside>
  );
}
