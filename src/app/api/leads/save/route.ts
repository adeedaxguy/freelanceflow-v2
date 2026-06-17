import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import type { Prisma } from "@prisma/client";

export const dynamic = 'force-dynamic';

// ─── Schemas ──────────────────────────────────────────────────────────────────
const saveSchema = z.object({
  company:        z.string().min(1).max(200),
  domain:         z.string().min(1).max(200),
  email:          z.string().email().optional().nullable().catch(null),
  phone:          z.string().max(30).optional().nullable(),
  confidence:     z.number().min(0).max(100).optional().nullable()
                    .transform(v => (v != null ? Math.min(100, Math.max(0, Math.round(v))) : null)),
  qualityScore:   z.number().min(0).max(100).optional().nullable()
                    .transform(v => (v != null ? Math.min(100, Math.max(0, Math.round(v))) : null)),
  bestMatchScore: z.number().min(0).max(100).optional().nullable()
                    .transform(v => (v != null ? Math.min(100, Math.max(0, Math.round(v))) : null)),
  niche:          z.string().max(100).optional().nullable(),
  title:          z.string().max(300).optional().nullable(),
  description:    z.string().max(10000).optional().nullable(),
  sourceUrl:      z.string().optional().nullable().catch(null)
                    .transform(v => {
                      if (!v) return null;
                      try { new URL(v); return v; } catch { return null; }
                    }),
  source:         z.string().max(50).optional().nullable(),
  notes:          z.string().max(5000).optional().nullable(),
  isManual:       z.boolean().optional().default(false),
});

const patchSchema = z.object({
  id:          z.string().min(1),
  status:      z.enum(["NEW", "CONTACTED", "REPLIED", "NEGOTIATION", "FOLLOW_UP", "WON", "LOST"]).optional(),
  notes:       z.string().max(5000).optional().nullable(),
  description: z.string().max(10000).optional().nullable(),
});

const US_STATE_CODES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "IA", "ID", "IL", "IN", "KS", "KY", "LA",
  "MA", "MD", "ME", "MI", "MN", "MO", "MS", "MT", "NC", "ND", "NE", "NH", "NJ", "NM", "NV", "NY", "OH", "OK",
  "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VA", "VT", "WA", "WI", "WV", "WY", "DC",
];

function textContains(field: "company" | "domain" | "email" | "niche" | "title" | "notes" | "description" | "sourceUrl", value: string): Prisma.LeadWhereInput {
  return { [field]: { contains: value, mode: "insensitive" } };
}

function textContainsExactCase(field: "title" | "notes", value: string): Prisma.LeadWhereInput {
  return { [field]: { contains: value } };
}

function countryWhere(country: string | null): Prisma.LeadWhereInput | null {
  if (country === "uk") {
    return {
      OR: [
        textContains("notes", "United Kingdom"),
        textContains("notes", "Great Britain"),
        textContains("notes", "England"),
        textContains("notes", "Scotland"),
        textContains("notes", "Wales"),
        textContains("notes", "Northern Ireland"),
        textContains("notes", ", UK"),
        textContains("title", ", UK"),
        textContains("description", ", UK"),
        textContains("domain", ".co.uk"),
        { domain: { endsWith: ".uk", mode: "insensitive" } },
        textContains("sourceUrl", ".co.uk"),
        textContains("sourceUrl", ".uk"),
      ],
    };
  }

  if (country === "usa") {
    const stateMatches = US_STATE_CODES.flatMap(code => [
      textContainsExactCase("notes", `, ${code}`),
      textContainsExactCase("title", `, ${code}`),
    ]);

    return {
      OR: [
        textContains("notes", "United States"),
        textContains("notes", "USA"),
        textContains("notes", "U.S."),
        textContains("title", "United States"),
        textContains("title", "USA"),
        textContains("description", "United States"),
        textContains("description", "USA"),
        { domain: { endsWith: ".us", mode: "insensitive" } },
        textContains("sourceUrl", ".us"),
        ...stateMatches,
      ],
    };
  }

  return null;
}

// ─── POST — save a lead ───────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = (await req.json()) as unknown;
    const parsed = saveSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data", details: parsed.error.flatten() }, { status: 400 });
    }
    const d = parsed.data;
    const company = d.company.trim();
    const domain = d.domain.trim().toLowerCase();
    const phone = d.phone?.trim() || null;

    const duplicateChecks: Prisma.LeadWhereInput[] = [];
    if (d.sourceUrl) duplicateChecks.push({ sourceUrl: d.sourceUrl });
    if (d.title) duplicateChecks.push({ company, domain, title: d.title });
    else duplicateChecks.push({ company, domain });
    if (phone && d.source?.startsWith("local_business")) duplicateChecks.push({ company, phone });

    const existing = await prisma.lead.findFirst({
      where: { userId: session.user.id, OR: duplicateChecks },
      orderBy: { savedAt: "desc" },
      select: { id: true, company: true, domain: true, status: true, savedAt: true, sourceUrl: true },
    });

    if (existing) {
      return NextResponse.json({ lead: existing, duplicate: true }, { status: 200 });
    }

    const lead = await prisma.lead.create({
      data: {
        userId:         session.user.id,
        company,
        domain,
        email:          d.email          ?? null,
        phone,
        confidence:     d.confidence     ?? null,
        qualityScore:   d.qualityScore   ?? null,
        bestMatchScore: d.bestMatchScore ?? null,
        niche:          d.niche          ?? null,
        title:          d.title          ?? null,
        description:    d.description    ?? null,
        sourceUrl:      d.sourceUrl      ?? null,
        source:         d.source         ?? null,
        notes:          d.notes          ?? null,
        isManual:       d.isManual,
        status:         "NEW",
      },
      select: { id: true, company: true, domain: true, status: true, savedAt: true, sourceUrl: true },
    });

    return NextResponse.json({ lead }, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Save lead error:", msg);
    return NextResponse.json({ error: "Failed to save lead", detail: msg }, { status: 500 });
  }
}

// ─── PATCH — update status / notes / description ──────────────────────────────
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = (await req.json()) as unknown;
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    const { id, status, notes, description } = parsed.data;

    const existing = await prisma.lead.findFirst({ where: { id, userId: session.user.id } });
    if (!existing) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

    const updateData: Record<string, unknown> = {};
    if (status      !== undefined) updateData.status      = status;
    if (notes       !== undefined) updateData.notes       = notes;
    if (description !== undefined) updateData.description = description;
    if (Object.keys(updateData).length === 0) return NextResponse.json({ error: "Nothing to update" }, { status: 400 });

    await prisma.lead.update({ where: { id }, data: updateData });
    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Patch lead error:", msg);
    return NextResponse.json({ error: "Failed to update lead", detail: msg }, { status: 500 });
  }
}

// ─── GET — list or single lead ────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);

  const singleId = searchParams.get("id");
  if (singleId) {
    const lead = await prisma.lead.findFirst({ where: { id: singleId, userId: session.user.id } });
    if (!lead) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ lead });
  }

  const page   = Math.max(1, parseInt(searchParams.get("page")  ?? "1"));
  const limit  = Math.min(100, parseInt(searchParams.get("limit") ?? "20"));
  const status = searchParams.get("status");
  const search = searchParams.get("search") ?? "";
  const country = searchParams.get("country");
  const where: Prisma.LeadWhereInput = { userId: session.user.id };
  const andFilters: Prisma.LeadWhereInput[] = [];
  if (status && status !== "all") where.status = status;
  if (search) {
    andFilters.push({ OR: [
      { company: { contains: search } }, { domain:  { contains: search } },
      { email:   { contains: search } }, { niche:   { contains: search } },
      { title:   { contains: search } }, { notes:   { contains: search } },
    ] });
  }
  const countryFilter = countryWhere(country);
  if (countryFilter) andFilters.push(countryFilter);
  if (andFilters.length > 0) where.AND = andFilters;

  const [leads, total] = await Promise.all([
    prisma.lead.findMany({ where, orderBy: { savedAt: "desc" }, skip: (page - 1) * limit, take: limit }),
    prisma.lead.count({ where }),
  ]);
  return NextResponse.json({ leads, total, page, totalPages: Math.ceil(total / limit) });
}

// ─── DELETE ───────────────────────────────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
  await prisma.lead.deleteMany({ where: { id, userId: session.user.id } });
  return NextResponse.json({ success: true });
}
