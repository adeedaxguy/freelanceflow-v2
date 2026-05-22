import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const saveSchema = z.object({
  company:      z.string().min(1).max(200),
  domain:       z.string().min(1).max(200),
  email:        z.string().email().optional().nullable(),
  phone:        z.string().max(30).optional().nullable(),
  // Clamp confidence 0-100 server-side — prevents client spoofing
  confidence:   z.number().min(0).max(100).int().optional().nullable()
                  .transform(v => (v != null ? Math.min(100, Math.max(0, Math.round(v))) : null)),
  qualityScore: z.number().min(0).max(100).int().optional().nullable()
                  .transform(v => (v != null ? Math.min(100, Math.max(0, Math.round(v))) : null)),
  niche:        z.string().max(100).optional().nullable(),
  title:        z.string().max(300).optional().nullable(),
  sourceUrl:    z.string().url().optional().nullable().catch(null), // silently drop invalid URLs
  source:       z.string().max(50).optional().nullable(),
  notes:        z.string().max(5000).optional().nullable(),
});

const patchSchema = z.object({
  id:     z.string().min(1),
  status: z.enum(["NEW", "CONTACTED", "REPLIED", "NEGOTIATION", "FOLLOW_UP", "WON", "LOST"]).optional(),
  notes:  z.string().optional().nullable(),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = (await req.json()) as unknown;
    const parsed = saveSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid data", details: parsed.error.flatten() }, { status: 400 });
    const d = parsed.data;
    const lead = await prisma.lead.create({
      data: {
        userId: session.user.id, company: d.company, domain: d.domain,
        email: d.email ?? null, phone: d.phone ?? null,
        confidence: d.confidence ?? null, qualityScore: d.qualityScore ?? null,
        niche: d.niche ?? null, title: d.title ?? null,
        sourceUrl: d.sourceUrl ?? null, source: d.source ?? null, notes: d.notes ?? null,
      },
    });
    return NextResponse.json({ lead }, { status: 201 });
  } catch (err) {
    console.error("Save lead error:", err);
    return NextResponse.json({ error: "Failed to save lead" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = (await req.json()) as unknown;
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    const { id, status, notes } = parsed.data;
    const existing = await prisma.lead.findFirst({ where: { id, userId: session.user.id } });
    if (!existing) return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    const updateData: Record<string, unknown> = {};
    if (status !== undefined) updateData.status = status;
    if (notes !== undefined)  updateData.notes  = notes;
    const lead = await prisma.lead.update({ where: { id }, data: updateData });
    return NextResponse.json({ lead });
  } catch (err) {
    console.error("Patch lead error:", err);
    return NextResponse.json({ error: "Failed to update lead" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);

  // Single lead lookup
  const singleId = searchParams.get("id");
  if (singleId) {
    const lead = await prisma.lead.findFirst({ where: { id: singleId, userId: session.user.id } });
    if (!lead) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ lead });
  }

  // List with filters
  const page   = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit  = Math.min(100, parseInt(searchParams.get("limit") ?? "20"));
  const status = searchParams.get("status");
  const search = searchParams.get("search") ?? "";
  const where: Record<string, unknown> = { userId: session.user.id };
  if (status && status !== "all") where.status = status;
  if (search) {
    where.OR = [
      { company: { contains: search } }, { domain: { contains: search } },
      { email: { contains: search } },   { niche: { contains: search } },
    ];
  }
  const [leads, total] = await Promise.all([
    prisma.lead.findMany({ where, orderBy: { savedAt: "desc" }, skip: (page - 1) * limit, take: limit }),
    prisma.lead.count({ where }),
  ]);
  return NextResponse.json({ leads, total, page, totalPages: Math.ceil(total / limit) });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
  await prisma.lead.deleteMany({ where: { id, userId: session.user.id } });
  return NextResponse.json({ success: true });
}
