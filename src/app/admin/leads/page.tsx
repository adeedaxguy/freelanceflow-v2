import { prisma } from "@/lib/prisma";
import { LeadStatusBadge } from "@/components/Badge";
import { formatDate } from "@/lib/utils";

export default async function AdminLeadsPage() {
  const [leads, total] = await Promise.all([
    prisma.lead.findMany({
      orderBy: { savedAt: "desc" },
      take: 100,
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.lead.count(),
  ]);

  const nicheStats = await prisma.lead.groupBy({ by: ["niche"], _count: { niche: true }, orderBy: { _count: { niche: "desc" } }, take: 10 });

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">All Leads</h1>
        <p className="text-muted-foreground mt-1">{total.toLocaleString()} total leads across all users</p>
      </div>

      {/* Niche breakdown */}
      <div className="bg-gradient-card border border-border rounded-2xl p-5">
        <h3 className="text-foreground font-semibold mb-3">Top Niches</h3>
        <div className="flex flex-wrap gap-2">
          {nicheStats.map((n) => (
            <span key={n.niche ?? "other"} className="px-3 py-1 rounded-full text-xs bg-primary/10 text-primary-light border border-primary/20">
              {n.niche ?? "No niche"} · {n._count.niche}
            </span>
          ))}
        </div>
      </div>

      <div className="bg-surface border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-background/50">
                {["User", "Company", "Domain", "Email", "Confidence", "Niche", "Status", "Saved"].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="border-b border-border/50 last:border-0 hover:bg-primary/5 transition-colors">
                  <td className="px-5 py-2.5 text-muted-foreground text-xs">{lead.user.name ?? lead.user.email}</td>
                  <td className="px-5 py-2.5 text-foreground text-sm font-medium">{lead.company}</td>
                  <td className="px-5 py-2.5 text-muted-foreground text-sm">{lead.domain}</td>
                  <td className="px-5 py-2.5 text-muted-foreground text-xs font-mono">{lead.email ?? "—"}</td>
                  <td className="px-5 py-2.5 text-sm">{lead.confidence != null ? <span className={lead.confidence >= 70 ? "text-accent" : "text-gold"}>{lead.confidence}%</span> : "—"}</td>
                  <td className="px-5 py-2.5 text-muted-foreground text-sm">{lead.niche ?? "—"}</td>
                  <td className="px-5 py-2.5"><LeadStatusBadge status={lead.status} /></td>
                  <td className="px-5 py-2.5 text-muted-foreground text-sm whitespace-nowrap">{formatDate(lead.savedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
