import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import {
  API_SCOPES,
  createApiKey,
  ensureApiKeyTable,
  getApiDailyLimit,
  parseScopes,
  type ApiScope,
} from "@/lib/public-api";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const createSchema = z.object({
  name: z.string().trim().min(2).max(50),
  scopes: z.array(z.enum(API_SCOPES)).min(1).max(API_SCOPES.length),
});

async function apiAccount(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true, role: true },
  });
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await ensureApiKeyTable();
  const account = await apiAccount(session.user.id);
  const limit = getApiDailyLimit(account?.plan ?? "free", account?.role ?? "USER");
  const keys = await prisma.apiKey.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true,
      name: true,
      prefix: true,
      scopes: true,
      requestsToday: true,
      totalRequests: true,
      lastUsedAt: true,
      revokedAt: true,
      createdAt: true,
    },
  });

  return NextResponse.json({
    eligible: limit > 0,
    dailyLimit: limit,
    availableScopes: API_SCOPES,
    keys: keys.map(key => ({ ...key, scopes: parseScopes(key.scopes) })),
  });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid API key settings", details: parsed.error.flatten() }, { status: 400 });
  }

  await ensureApiKeyTable();
  const account = await apiAccount(session.user.id);
  const limit = getApiDailyLimit(account?.plan ?? "free", account?.role ?? "USER");
  if (!limit) {
    return NextResponse.json({ error: "Developer API access requires an Agency plan." }, { status: 403 });
  }

  const activeKeys = await prisma.apiKey.count({ where: { userId: session.user.id, revokedAt: null } });
  if (activeKeys >= 5) {
    return NextResponse.json({ error: "Revoke an existing key before creating another." }, { status: 409 });
  }

  const key = createApiKey();
  const record = await prisma.apiKey.create({
    data: {
      userId: session.user.id,
      name: parsed.data.name,
      keyHash: key.hash,
      prefix: key.prefix,
      scopes: JSON.stringify(parsed.data.scopes satisfies ApiScope[]),
    },
    select: { id: true, name: true, prefix: true, createdAt: true },
  });

  return NextResponse.json({
    key: key.secret,
    record: { ...record, scopes: parsed.data.scopes },
    warning: "Store this key now. It will not be shown again.",
  }, { status: 201 });
}
