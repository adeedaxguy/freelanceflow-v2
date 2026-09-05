export const dynamic = 'force-dynamic';

import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, Search, Bookmark } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Badge, LeadStatusBadge, EmailStatusBadge } from "@/components/Badge";
import { formatDate } from "@/lib/utils";

interface PageProps { params: Promise<{ id: string }> }

export default async function AdminUserDetailPage({ params }: PageProps) {
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      leads: { orderBy: { savedAt: "desc" }, take: 10 },
      sentEmails: { orderBy: { sentAt: "desc" }, take: 10, include: { lead: { select: { company: true } } } },
      campaigns: { orderBy: { createdAt: "desc" }, take: 5 },
    },
  });

  if (!user) notFound();

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/admin/users" className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">User Detail</h1>
          <p className="text-muted-foreground text-sm">{user.email}</p>
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-gradient-card border border-border rounded-2xl p-6 flex items-start gap-5">
        <div className="w-16 h-16 rounded-full bg-gradient-hero flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
          {user.name?.[0]?.toUpperCase() ?? "U"}
        </div>
        <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div><p className="text-xs text-muted-foreground mb-0.5">Name</p><p className="text-foreground font-medium">{user.name ?? "—"}</p></div>
          <div><p className="text-xs text-muted-foreground mb-0.5">Email</p><p className="text-foreground font-medium text-sm">{user.email}</p></div>
          <div><p className="text-xs text-muted-foreground mb-0.5">Role</p><Badge variant={user.role === "ADMIN" ? "primary" : "outline"}>{user.role}</Badge></div>
          <div><p className="text-xs text-muted-foreground mb-0.5">Status</p><Badge variant={user.suspended ? "red" : "accent"}>{user.suspended ? "Suspended" : "Active"}</Badge></div>
          <div><p className="text-xs text-muted-foreground mb-0.5">Niche</p><p className="text-foreground text-sm">{user.niche ?? "—"}</p></div>
          <div><p className="text-xs text-muted-foreground mb-0.5">Rate</p><p className="text-foreground text-sm">{user.rate ? `$${user.rate}/hr` : "—"}</p></div>
          <div><p className="text-xs text-muted-foreground mb-0.5">Portfolio</p><p className="text-foreground text-sm truncate">{user.portfolio ?? "—"}</p></div>
          <div><p className="text-xs text-muted-foreground mb-0.5">Joined</p><p className="text-foreground text-sm">{formatDate(user.createdAt)}</p></div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: Search, label: "Leads Saved", value: user.leads.length, color: "text-primary-light bg-primary/10" },
          { icon: Mail, label: "Outreach", value: user.sentEmails.length, color: "text-accent bg-accent/10" },
          { icon: Bookmark, label: "Campaigns", value: user.campaigns.length, color: "text-gold bg-gold/10" },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-gradient-card border border-border rounded-2xl p-5 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{value}</p>
              <p className="text-muted-foreground text-xs">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Leads */}
      <div className="bg-gradient-card border border-border rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="text-foreground font-semibold">Recent Leads</h3>
        </div>
        {user.leads.length === 0 ? (
          <p className="px-6 py-4 text-muted-foreground text-sm">No leads yet.</p>
        ) : (
          <div className="overflow-x-auto"><table className="w-full min-w-[600px]">
            <thead><tr className="border-b border-border bg-background/30">
              {["Company", "Domain", "Email", "Status", "Saved"].map(h => <th key={h} className="text-left px-5 py-2.5 text-xs font-semibold text-muted-foreground uppercase">{h}</th>)}
            </tr></thead>
            <tbody>
              {user.leads.map(l => (
                <tr key={l.id} className="border-b border-border/40 last:border-0 hover:bg-primary/5">
                  <td className="px-5 py-2.5 text-foreground text-sm">{l.company}</td>
                  <td className="px-5 py-2.5 text-muted-foreground text-sm">{l.domain}</td>
                  <td className="px-5 py-2.5 text-muted-foreground text-xs font-mono">{l.email ?? "—"}</td>
                  <td className="px-5 py-2.5"><LeadStatusBadge status={l.status} /></td>
                  <td className="px-5 py-2.5 text-muted-foreground text-sm">{formatDate(l.savedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table></div>
        )}
      </div>

      {/* Recent Outreach */}
      <div className="bg-gradient-card border border-border rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="text-foreground font-semibold">Recent Outreach</h3>
        </div>
        {user.sentEmails.length === 0 ? (
          <p className="px-6 py-4 text-muted-foreground text-sm">No outreach yet.</p>
        ) : (
          <div className="overflow-x-auto"><table className="w-full min-w-[600px]">
            <thead><tr className="border-b border-border bg-background/30">
              {["Company", "Subject", "Logged", "Status"].map(h => <th key={h} className="text-left px-5 py-2.5 text-xs font-semibold text-muted-foreground uppercase">{h}</th>)}
            </tr></thead>
            <tbody>
              {user.sentEmails.map(e => (
                <tr key={e.id} className="border-b border-border/40 last:border-0 hover:bg-primary/5">
                  <td className="px-5 py-2.5 text-foreground text-sm">{e.lead?.company ?? "Direct"}</td>
                  <td className="px-5 py-2.5 text-muted-foreground text-sm max-w-xs truncate">{e.subject}</td>
                  <td className="px-5 py-2.5 text-muted-foreground text-sm whitespace-nowrap">{formatDate(e.sentAt)}</td>
                  <td className="px-5 py-2.5"><EmailStatusBadge status={e.status} /></td>
                </tr>
              ))}
            </tbody>
          </table></div>
        )}
      </div>
    </div>
  );
}
