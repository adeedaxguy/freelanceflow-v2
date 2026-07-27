export const dynamic = 'force-dynamic';

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminUsersClient from "./AdminUsersClient";

export default async function AdminUsersPage() {
  await getServerSession(authOptions); // role guard already in layout
  const rows = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true, name: true, email: true, plan: true, role: true,
      suspended: true, createdAt: true, weeklyLeads: true,
      weeklyLeadReset: true, bonusLeads: true,
      _count: { select: { leads: true, sentEmails: true } },
    },
  });
  const now = Date.now();
  const users = rows.map(({ weeklyLeadReset, ...user }) => ({
    ...user,
    weeklyLeads:
      now - weeklyLeadReset.getTime() < 24 * 60 * 60 * 1000
        ? user.weeklyLeads
        : 0,
  }));
  return <AdminUsersClient users={users} />;
}
