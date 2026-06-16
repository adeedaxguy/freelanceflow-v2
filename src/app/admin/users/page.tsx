export const dynamic = 'force-dynamic';

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminUsersClient from "./AdminUsersClient";

export default async function AdminUsersPage() {
  await getServerSession(authOptions); // role guard already in layout
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true, name: true, email: true, plan: true, role: true,
      suspended: true, createdAt: true, weeklyLeads: true,
      _count: { select: { leads: true, sentEmails: true } },
    },
  });
  return <AdminUsersClient users={users} />;
}
