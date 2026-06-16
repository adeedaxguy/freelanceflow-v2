export const dynamic = 'force-dynamic';

import { prisma } from "@/lib/prisma";
import { EmailStatusBadge } from "@/components/Badge";
import { formatDate } from "@/lib/utils";

export default async function AdminEmailsPage() {
  const emails = await prisma.sentEmail.findMany({
    orderBy: { sentAt: "desc" },
    take: 100,
    include: {
      user: { select: { name: true, email: true } },
      lead: { select: { company: true, domain: true } },
    },
  });

  const total = await prisma.sentEmail.count();

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">All Outreach Emails</h1>
        <p className="text-muted-foreground mt-1">{total.toLocaleString()} sent or prepared emails platform-wide</p>
      </div>

      <div className="bg-surface border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-border bg-background/50">
                {["User", "Recipient Company", "Subject", "Logged At", "Status"].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {emails.map((email) => (
                <tr key={email.id} className="border-b border-border/50 last:border-0 hover:bg-primary/5 transition-colors">
                  <td className="px-5 py-3">
                    <p className="text-foreground text-sm">{email.user.name ?? "—"}</p>
                    <p className="text-muted-foreground text-xs">{email.user.email}</p>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground text-sm">{email.lead?.company ?? "Direct"}</td>
                  <td className="px-5 py-3 text-foreground text-sm max-w-xs truncate">{email.subject}</td>
                  <td className="px-5 py-3 text-muted-foreground text-sm whitespace-nowrap">{formatDate(email.sentAt)}</td>
                  <td className="px-5 py-3"><EmailStatusBadge status={email.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
