"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard, Search, Bookmark, Send, BarChart2, Settings,
  FileText, Megaphone, User, Wrench, MessageCircle, Zap,
  CalendarDays, GitMerge, Mail, Menu, X, Radio, ChevronRight,
  LogOut, Crown, Shield, Sparkles, MapPin, ChevronLeft,
  Command,
} from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import Logo from "./Logo";

// ─── Nav groups ───────────────────────────────────────────────────────────────
const NAV_GROUPS = [
  {
    label: "Leads",
    items: [
      { href: "/dashboard",               label: "Overview",             icon: LayoutDashboard },
      { href: "/dashboard/live-jobs",     label: "Live Jobs",            icon: Radio,   badge: "LIVE" },
      { href: "/dashboard/leads",         label: "Remote Jobs",          icon: Search },
      { href: "/dashboard/local-leads",   label: "Local Business Leads", icon: MapPin,  badge: "NEW" },
      { href: "/dashboard/saved-leads",   label: "Saved Leads",          icon: Bookmark },
      { href: "/dashboard/pipeline",      label: "CRM Pipeline",         icon: GitMerge },
    ],
  },
  {
    label: "AI Tools",
    items: [
      { href: "/dashboard/deal-closer", label: "AI Deal Closer", icon: Zap },
      { href: "/dashboard/followups",   label: "Follow-Ups",     icon: CalendarDays },
    ],
  },
  {
    label: "Outreach",
    items: [
      { href: "/dashboard/campaigns",  label: "Campaigns",   icon: Megaphone },
      { href: "/dashboard/templates",  label: "Templates",   icon: FileText },
      { href: "/dashboard/sent",       label: "Outreach History", icon: Send },
      { href: "/dashboard/analytics",  label: "Analytics",   icon: BarChart2 },
    ],
  },
  {
    label: "Account",
    items: [
      { href: "/dashboard/email-settings", label: "Email Setup", icon: Mail },
      { href: "/dashboard/tools",          label: "Free Tools",        icon: Wrench },
      { href: "/dashboard/support",        label: "Support",           icon: MessageCircle },
      { href: "/dashboard/profile",        label: "Profile",           icon: User },
      { href: "/dashboard/settings",       label: "Settings",          icon: Settings },
    ],
  },
];

// ─── Plan config ──────────────────────────────────────────────────────────────
type PlanCfg = {
  label: string; color: string; bg: string; border: string;
  icon: React.ElementType; leadsPerWeek: string; showUpgrade: boolean;
};
const PLAN_CONFIG: Record<string, PlanCfg> = {
  // Launch phase: all features free, no upgrade pressure
  free:   { label: "Free",   color: "text-primary-light",   bg: "bg-primary/8",        border: "border-primary/20",      icon: Sparkles, leadsPerWeek: "All features free",   showUpgrade: false },
  pro:    { label: "Pro",    color: "text-primary-light",   bg: "bg-primary/10",        border: "border-primary/30",      icon: Crown,    leadsPerWeek: "500 leads / week",   showUpgrade: false },
  agency: { label: "Agency", color: "text-primary-light",   bg: "bg-primary/10",        border: "border-primary/30",      icon: Shield,   leadsPerWeek: "Unlimited leads",    showUpgrade: false },
};

// ─── Tooltip for collapsed state ─────────────────────────────────────────────
function CollapseTooltip({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="relative group/tip flex items-center">
      {children}
      <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-surface border border-border rounded-lg text-xs text-foreground font-medium whitespace-nowrap pointer-events-none opacity-0 group-hover/tip:opacity-100 transition-opacity z-50 shadow-lg">
        {label}
      </div>
    </div>
  );
}

// ─── Nav link ─────────────────────────────────────────────────────────────────
function NavLink({
  href, label, icon: Icon, active, onClick, badge, collapsed,
}: {
  href: string; label: string; icon: React.ElementType;
  active: boolean; onClick?: () => void; badge?: string; collapsed?: boolean;
}) {
  const inner = (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 rounded-xl text-sm font-medium transition-all ${
        collapsed ? "px-2.5 py-2.5 justify-center" : "px-3 py-2.5"
      } ${
        active
          ? "bg-primary/15 text-primary-light"
          : "text-muted-foreground hover:text-foreground hover:bg-white/5"
      }`}
    >
      <Icon className={`w-4 h-4 flex-shrink-0 ${active ? "text-primary-light" : ""}`} />
      {!collapsed && (
        <>
          <span className="flex-1">{label}</span>
          {badge === "LIVE" && (
            <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-accent/20 text-accent border border-accent/30">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              LIVE
            </span>
          )}
          {badge === "NEW" && (
            <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-primary/20 text-primary-light border border-primary/30">
              NEW
            </span>
          )}
        </>
      )}
    </Link>
  );

  if (collapsed) {
    return <CollapseTooltip label={label}>{inner}</CollapseTooltip>;
  }
  return inner;
}

// ─── Nav content ──────────────────────────────────────────────────────────────
function NavContent({
  pathname, onLinkClick, collapsed,
}: {
  pathname: string; onLinkClick?: () => void; collapsed?: boolean;
}) {
  return (
    <nav className="flex-1 p-2 space-y-3 overflow-y-auto">
      {NAV_GROUPS.map(group => (
        <div key={group.label}>
          {!collapsed && (
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 px-3 mb-1">
              {group.label}
            </p>
          )}
          {collapsed && <div className="my-1 border-t border-border/30" />}
          <div className="space-y-0.5">
            {group.items.map(({ href, label, icon, badge }) => {
              const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
              return (
                <NavLink
                  key={href}
                  href={href}
                  label={label}
                  icon={icon}
                  active={active}
                  onClick={onLinkClick}
                  badge={badge}
                  collapsed={collapsed}
                />
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

// ─── Logo ─────────────────────────────────────────────────────────────────────
function SidebarLogo({ collapsed }: { collapsed?: boolean }) {
  return <Logo size="sm" showText={!collapsed} />;
}

// ─── User panel ───────────────────────────────────────────────────────────────
function UserPanel({ onLinkClick, collapsed }: { onLinkClick?: () => void; collapsed?: boolean }) {
  const { data: session, status } = useSession();
  const [loggingOut, setLoggingOut] = useState(false);
  const [resolvedPlan, setResolvedPlan] = useState<string | null>(null);

  const user    = session?.user;
  const planKey = (resolvedPlan ?? user?.plan ?? "free").toLowerCase();
  const plan: PlanCfg = PLAN_CONFIG[planKey] ?? PLAN_CONFIG.free!;
  const PlanIcon = plan.icon;

  useEffect(() => {
    let active = true;

    if (!user?.id) {
      setResolvedPlan(null);
      return () => { active = false; };
    }

    fetch("/api/usage", { cache: "no-store" })
      .then(r => (r.ok ? r.json() : null))
      .then((data: { plan?: string } | null) => {
        if (active && data?.plan) setResolvedPlan(data.plan.toLowerCase());
      })
      .catch(() => {
        if (active) setResolvedPlan(null);
      });

    return () => { active = false; };
  }, [user?.id, user?.plan]);

  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : (user?.email?.[0]?.toUpperCase() ?? "?");

  const handleLogout = async () => {
    setLoggingOut(true);
    await signOut({ callbackUrl: "/" });
  };

  if (status === "loading") {
    if (collapsed) {
      return (
        <div className="p-2 border-t border-border flex flex-col items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-muted animate-pulse" />
          <div className="w-9 h-9 rounded-lg bg-muted/60 animate-pulse" />
        </div>
      );
    }

    return (
      <div className="p-3 border-t border-border space-y-2">
        <div className="rounded-xl border border-border bg-surface overflow-hidden">
          <div className="px-3 py-2 border-b border-border">
            <div className="h-3 w-24 rounded bg-muted animate-pulse" />
          </div>
          <div className="flex items-center gap-2.5 px-3 py-2.5">
            <div className="w-8 h-8 rounded-lg bg-muted animate-pulse" />
            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="h-3 w-20 rounded bg-muted animate-pulse" />
              <div className="h-2.5 w-32 rounded bg-muted/70 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-3 border-t border-border">
        <Link
          href="/auth"
          onClick={onLinkClick}
          className={`flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-primary hover:bg-primary-light text-white rounded-xl font-semibold text-sm transition-colors ${collapsed ? "px-2.5" : ""}`}
        >
          {collapsed ? <User className="w-4 h-4" /> : "Sign In"}
        </Link>
      </div>
    );
  }

  // Collapsed user panel — just avatar
  if (collapsed) {
    return (
      <div className="p-2 border-t border-border flex flex-col items-center gap-2">
        <CollapseTooltip label={`${user?.name ?? "User"} · ${plan.label}`}>
          <div className="w-9 h-9 rounded-lg bg-gradient-hero flex items-center justify-center text-white text-xs font-bold overflow-hidden">
            {user?.image
              ? <img src={user.image} alt="" className="w-full h-full object-cover" />
              : initials}
          </div>
        </CollapseTooltip>
        <CollapseTooltip label="Sign out">
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-40"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </CollapseTooltip>
      </div>
    );
  }

  return (
    <div className="p-3 border-t border-border space-y-2">
      {/* User card */}
      <div className={`rounded-xl border ${plan.border} bg-surface overflow-hidden`}>
        <div className={`flex items-center gap-2 px-3 py-1.5 ${plan.bg} border-b ${plan.border}`}>
          <PlanIcon className={`w-3 h-3 ${plan.color}`} />
          <span className={`text-[11px] font-bold tracking-wide ${plan.color}`}>{plan.label} Plan</span>
          <span className="text-[9px] text-muted-foreground ml-auto font-medium">{plan.leadsPerWeek}</span>
        </div>

        <div className="flex items-center gap-2.5 px-3 py-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-hero flex items-center justify-center text-white text-xs font-bold flex-shrink-0 overflow-hidden">
            {user?.image
              ? <img src={user.image} alt="" className="w-full h-full object-cover" />
              : initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-foreground text-xs font-semibold truncate leading-tight">{user?.name ?? "User"}</p>
            <p className="text-muted-foreground text-[10px] truncate leading-tight">{user?.email ?? ""}</p>
          </div>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            title="Sign out"
            className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-all flex-shrink-0 disabled:opacity-40"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex border-t border-border/60">
          <Link href="/dashboard/profile" onClick={onLinkClick}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 text-[10px] text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all border-r border-border/60">
            <User className="w-3 h-3" /> Profile
          </Link>
          <Link href="/dashboard/settings" onClick={onLinkClick}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 text-[10px] text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all">
            <Settings className="w-3 h-3" /> Settings
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Main Sidebar ─────────────────────────────────────────────────────────────
export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed,  setCollapsed]  = useState(false);

  // Persist collapse state
  useEffect(() => {
    const stored = localStorage.getItem("ff_sidebar_collapsed");
    if (stored === "1") setCollapsed(true);
  }, []);
  const toggleCollapse = () => {
    setCollapsed(c => {
      localStorage.setItem("ff_sidebar_collapsed", c ? "0" : "1");
      return !c;
    });
  };

  useEffect(() => { setMobileOpen(false); }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  // Expose opener globally so MobileBottomNav can trigger it
  useEffect(() => {
    (window as unknown as Record<string, unknown>).__openMobileSidebar = () => setMobileOpen(true);
    return () => { (window as unknown as Record<string, unknown>).__openMobileSidebar = undefined; };
  }, []);

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside
        className={`hidden lg:flex flex-col h-screen sticky top-0 overflow-hidden bg-surface border-r border-border transition-all duration-200 ${
          collapsed ? "w-14" : "w-64"
        }`}
      >
        {/* Header */}
        <div className={`border-b border-border flex items-center justify-between flex-shrink-0 ${collapsed ? "px-3 py-4" : "px-5 py-4"}`}>
          <SidebarLogo collapsed={collapsed} />
          {!collapsed && <ThemeToggle size="sm" />}
        </div>

        {/* Search / Cmd+K button */}
        {!collapsed && (
          <div className="px-3 pt-2">
            <button
              onClick={() => (window as unknown as Record<string, (() => void) | undefined>).__openCommandPalette?.()}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl border border-border text-muted-foreground text-xs hover:border-primary/40 hover:text-foreground transition-all"
            >
              <Command className="w-3.5 h-3.5" />
              <span className="flex-1 text-left">Search or jump to...</span>
              <kbd className="px-1 py-0.5 bg-muted/50 border border-border/60 rounded font-mono text-[10px]">⌘K</kbd>
            </button>
          </div>
        )}
        {collapsed && (
          <div className="px-2 pt-2">
            <CollapseTooltip label="Search (⌘K)">
              <button
                onClick={() => (window as unknown as Record<string, (() => void) | undefined>).__openCommandPalette?.()}
                className="w-10 h-10 flex items-center justify-center rounded-xl border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all"
              >
                <Command className="w-4 h-4" />
              </button>
            </CollapseTooltip>
          </div>
        )}

        {/* Nav */}
        <NavContent pathname={pathname} collapsed={collapsed} />

        {/* User panel */}
        <UserPanel collapsed={collapsed} />

        {/* Collapse toggle */}
        <div className={`border-t border-border flex ${collapsed ? "justify-center p-2" : "justify-end px-3 py-2"}`}>
          <button
            onClick={toggleCollapse}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all"
          >
            <ChevronLeft className={`w-4 h-4 transition-transform ${collapsed ? "rotate-180" : ""}`} />
          </button>
        </div>
      </aside>

      {/* ── Mobile top bar ── */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 h-14 bg-surface border-b border-border">
        <SidebarLogo />
        <div className="flex items-center gap-2">
          <ThemeToggle size="sm" />
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Mobile spacer */}
      <div className="lg:hidden h-14 flex-shrink-0" />

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside className={`lg:hidden fixed top-0 left-0 bottom-0 z-50 w-72 bg-surface border-r border-border flex flex-col transition-transform duration-300 ease-in-out ${
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="flex items-center justify-between p-4 border-b border-border">
          <SidebarLogo />
          <button
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
            className="w-8 h-8 flex items-center justify-center rounded-xl border border-border text-muted-foreground hover:text-foreground transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <NavContent pathname={pathname} onLinkClick={() => setMobileOpen(false)} />
        <UserPanel onLinkClick={() => setMobileOpen(false)} />
      </aside>
    </>
  );
}
