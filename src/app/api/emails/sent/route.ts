import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "20");

  const isAdmin = session.user.role === "ADMIN";
  const where = isAdmin && searchParams.get("all") === "true" ? {} : { userId: session.user.id };

  const [emails, total] = await Promise.all([
    prisma.sentEmail.findMany({
      where,
      include: { lead: { select: { company: true, domain: true } }, user: { select: { name: true, email: true } } },
      orderBy: { sentAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.sentEmail.count({ where }),
  ]);

  return NextResponse.json({ emails, total, page, totalPages: Math.ceil(total / limit) });
}
