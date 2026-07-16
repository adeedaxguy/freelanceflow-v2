"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, LayoutDashboard, Radio, Bookmark,
  Send, BarChart2, Settings, FileText, Megaphone, User,
  Wrench, MessageCircle, Zap, CalendarDays, GitMerge,
  Mail, MapPin, ArrowRight, Crown, Users, Palette, PhoneCall,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// ─── Command list ─────────────────────────────────────────────────────────────
const COMMANDS = [
  { id: "dashboard",      label: "Overview",               desc: "Your dashboard",         href: "/dashboard",                  icon: LayoutDashboard, group: "Navigate" },
  { id: "live-jobs",      label: "Live Jobs",              desc: "Real-time job feed",     href: "/dashboard/live-jobs",        icon: Radio,           group: "Navigate", badge: "LIVE" },
  { id: "leads",          label: "Find Leads",             desc: "Search for new leads",   href: "/dashboard/leads",            icon: Search,          group: "Navigate" },
  { id: "local-leads",    label: "Local Business Leads",   desc: "Nearby opportunities",   href: "/dashboard/local-leads",      icon: MapPin,          group: "Navigate" },
  { id: "decision-makers",label: "Decision Makers",        desc: "Find US and UK decision makers", href: "/dashboard/decision-makers", icon: Users,      group: "Navigate" },
  { id: "saved-leads",    label: "Saved Leads",            desc: "Your saved leads",       href: "/dashboard/saved-leads",      icon: Bookmark,        group: "Navigate" },
  { id: "pipeline",       label: "CRM Pipeline",           desc: "Manage your deals",      href: "/dashboard/pipeline",         icon: GitMerge,        group: "Navigate" },
  { id: "deal-closer",    label: "AI Deal Closer",         desc: "Close more deals",       href: "/dashboard/deal-closer",      icon: Zap,             group: "AI Tools" },
  { id: "web-design",     label: "Web Design",             desc: "Create client website concepts", href: "/dashboard/web-design", icon: Palette,     group: "AI Tools", badge: "NEW" },
  { id: "followups",      label: "Follow-Ups",             desc: "Plan Gmail follow-ups",  href: "/dashboard/followups",        icon: CalendarDays,    group: "AI Tools" },
  { id: "campaigns",      label: "Campaigns",              desc: "Organize outreach",      href: "/dashboard/campaigns",        icon: Megaphone,       group: "Outreach" },
  { id: "softphone",      label: "Softphone",              desc: "Calling workspace coming soon", href: "/dashboard/softphone", icon: PhoneCall,      group: "Outreach", badge: "SOON" },
  { id: "whatsapp",       label: "WhatsApp",               desc: "WhatsApp outreach coming soon", href: "/dashboard/whatsapp",  icon: MessageCircle,  group: "Outreach", badge: "SOON" },
  { id: "templates",      label: "Templates",              desc: "Email templates",        href: "/dashboard/templates",        icon: FileText,        group: "Outreach" },
  { id: "sent",           label: "Outreach History",       desc: "Prepared and sent emails", href: "/dashboard/sent",           icon: Send,            group: "Outreach" },
  { id: "analytics",      label: "Analytics",              desc: "Performance stats",      href: "/dashboard/analytics",        icon: BarChart2,       group: "Outreach" },
  { id: "email-settings", label: "Email Setup",            desc: "Safe Gmail prepare mode", href: "/dashboard/email-settings",   icon: Mail,            group: "Account" },
  { id: "tools",          label: "Free Tools",             desc: "Useful utilities",       href: "/dashboard/tools",            icon: Wrench,          group: "Account" },
  { id: "support",        label: "Support",                desc: "Get help",               href: "/dashboard/support",          icon: MessageCircle,   group: "Account" },
  { id: "profile",        label: "Profile",                desc: "Your profile",           href: "/dashboard/profile",          icon: User,            group: "Account" },
  { id: "settings",       label: "Settings",               desc: "Account settings",       href: "/dashboard/settings",         icon: Settings,        group: "Account" },
  { id: "upgrade",        label: "Upgrade Plan",           desc: "Go Pro or Agency",       href: "/dashboard/upgrade",          icon: Crown,           group: "Account" },
];

type CommandItem = typeof COMMANDS[number];

function groupCommands(filtered: CommandItem[]) {
  const groups: Record<string, CommandItem[]> = {};
  for (const cmd of filtered) {
    if (!groups[cmd.group]) groups[cmd.group] = [];
    groups[cmd.group]!.push(cmd);
  }
  return groups;
}

export default function CommandPalette() {
  const [open, setOpen]             = useState(false);
  const [query, setQuery]           = useState("");
  const [selectedIndex, setSelected] = useState(0);
  const router                       = useRouter();
  const inputRef                     = useRef<HTMLInputElement>(null);

  const filtered = query.trim()
    ? COMMANDS.filter(c =>
        c.label.toLowerCase().includes(query.toLowerCase()) ||
        c.desc.toLowerCase().includes(query.toLowerCase())  ||
        c.group.toLowerCase().includes(query.toLowerCase())
      )
    : COMMANDS;

  const handleOpen = useCallback(() => {
    setOpen(true);
    setQuery("");
    setSelected(0);
  }, []);

  // Global keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (open) setOpen(false);
        else handleOpen();
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, handleOpen]);

  // Auto-focus input when opened
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  // Reset selection on query change
  useEffect(() => { setSelected(0); }, [query]);

  // Expose opener globally so Sidebar button can call it
  useEffect(() => {
    (window as unknown as Record<string, unknown>).__openCommandPalette = handleOpen;
  }, [handleOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelected(i => Math.min(i + 1, filtered.length - 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelected(i => Math.max(i - 1, 0));
    }
    if (e.key === "Enter") {
      const cmd = filtered[selectedIndex];
      if (cmd) { router.push(cmd.href); setOpen(false); }
    }
  };

  const groups = groupCommands(filtered);

  // Build a flat-indexed map for hover → selectedIndex
  let flatIdx = 0;
  const indexedGroups = Object.entries(groups).map(([group, cmds]) => ({
    group,
    cmds: cmds.map(cmd => ({ cmd, flatIdx: flatIdx++ })),
  }));

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Palette modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="fixed top-[18%] left-1/2 -translate-x-1/2 z-[9999] w-full max-w-xl px-4"
            onKeyDown={handleKeyDown}
          >
            <div className="bg-surface border border-border rounded-2xl shadow-2xl shadow-black/60 overflow-hidden">

              {/* Search input */}
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border">
                <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search pages, tools, settings..."
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground text-sm outline-none"
                />
                <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground bg-muted/50 border border-border/60 rounded">
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <div className="max-h-[340px] overflow-y-auto p-2">
                {indexedGroups.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-10">
                    No results for &quot;{query}&quot;
                  </p>
                ) : (
                  indexedGroups.map(({ group, cmds }) => (
                    <div key={group} className="mb-2 last:mb-0">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 px-2 py-1.5">
                        {group}
                      </p>
                      {cmds.map(({ cmd, flatIdx: fi }) => {
                        const Icon = cmd.icon;
                        const isSelected = fi === selectedIndex;
                        return (
                          <Link
                            key={cmd.id}
                            href={cmd.href}
                            onClick={() => setOpen(false)}
                            onMouseEnter={() => setSelected(fi)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${
                              isSelected
                                ? "bg-primary/15 text-primary-light"
                                : "text-foreground hover:bg-white/5"
                            }`}
                          >
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                              isSelected ? "bg-primary/20" : "bg-muted/50"
                            }`}>
                              <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-primary-light" : "text-muted-foreground"}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium ${isSelected ? "text-primary-light" : "text-foreground"}`}>
                                {cmd.label}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">{cmd.desc}</p>
                            </div>
                            {"badge" in cmd && cmd.badge && (
                              <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full border flex-shrink-0 ${
                                cmd.badge === "LIVE"
                                  ? "bg-accent/20 text-accent border-accent/30"
                                  : cmd.badge === "SOON"
                                    ? "bg-gold/10 text-gold border-gold/25"
                                    : "bg-primary/20 text-primary-light border-primary/30"
                              }`}>
                                {cmd.badge}
                              </span>
                            )}
                            <ArrowRight className={`w-3.5 h-3.5 flex-shrink-0 transition-opacity ${
                              isSelected ? "opacity-50" : "opacity-0 group-hover:opacity-20"
                            }`} />
                          </Link>
                        );
                      })}
                    </div>
                  ))
                )}
              </div>

              {/* Footer hints */}
              <div className="flex items-center justify-between px-4 py-2.5 border-t border-border/50">
                <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1 py-0.5 bg-muted/50 border border-border/60 rounded font-mono text-[10px]">↑↓</kbd>
                    Navigate
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1 py-0.5 bg-muted/50 border border-border/60 rounded font-mono text-[10px]">↵</kbd>
                    Open
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <kbd className="px-1 py-0.5 bg-muted/50 border border-border/60 rounded font-mono">⌘K</kbd>
                  to toggle
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
