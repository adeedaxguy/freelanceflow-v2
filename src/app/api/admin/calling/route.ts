export const dynamic = "force-dynamic";
export const maxDuration = 60;
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { securityRateLimit } from "@/lib/security-rate-limit";
import { recordAuditLog } from "@/lib/audit-log";
import { campaignInputSchema, studioProfileSchema, localCallDate, callWindowOpen, normalizeCallingNumber, type CallingAttempt } from "@/lib/admin-calling-model";
import { callingSnapshot, callingTransaction, getCampaign, saveCampaign, saveAttempt } from "@/lib/admin-calling-store";
import { getCallingSetup, saveCallingSetup, callingProviderOptions, provisionCallingAgent, discoverCallingBusinesses, researchCallingLead, tickCallingCampaign, refreshCallingAttempts, elevenRequest } from "@/lib/admin-calling-service";
import { randomUUID } from "node:crypto";

const id = z.string().uuid();
const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("setup"), profile: studioProfileSchema, voiceId: z.string().max(100), phoneId: z.string().max(100), apiKey: z.string().max(300).optional() }),
  z.object({ action: z.literal("options") }),
  z.object({ action: z.literal("provision") }),
  z.object({ action: z.literal("search"), campaign: campaignInputSchema }),
  z.object({ action: z.literal("research"), campaignId: id, leadId: id }),
  z.object({ action: z.literal("approve"), campaignId: id, leadId: id, evidence: z.string().trim().min(20).max(1200), obtainedAt: z.string().datetime(), expressAiConsent: z.literal(true), countryVerified: z.literal(true) }),
  z.object({ action: z.literal("suppress"), campaignId: id, leadId: id }),
  z.object({ action: z.literal("test_contact"), campaignId: id, name: z.string().trim().min(2).max(100), phone: z.string().max(30), ownedOrConsenting: z.literal(true) }),
  z.object({ action: z.literal("start"), campaignId: id, reviewedToday: z.literal(true) }),
  z.object({ action: z.literal("pause"), campaignId: id }),
  z.object({ action: z.literal("tick"), campaignId: id }),
  z.object({ action: z.literal("refresh") }),
  z.object({ action: z.literal("reconcile"), campaignId: id, attemptId: id, conversationId: z.string().regex(/^[a-zA-Z0-9_-]{5,100}$/) }),
  z.object({ action: z.literal("resolve_unconfirmed"), campaignId: id, attemptId: id, reviewedProvider: z.literal(true), evidence: z.string().trim().min(20).max(1200) }),
]);

async function admin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") return null;
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { id: true, role: true } });
  return user?.role === "ADMIN" ? user : null;
}
const json = (data: unknown, status = 200) => NextResponse.json(data, { status, headers: { "Cache-Control": "private, no-store" } });
export async function GET() {
  try {
    const user = await admin();
    if (!user) return json({ error: "Forbidden" }, 403);
    return json({ setup: await getCallingSetup(), ...await callingSnapshot(user.id) });
  } catch { return json({ error: "Calling workspace could not be loaded. Please retry." }, 503); }
}

export async function POST(req: NextRequest) {
  let actorId: string | undefined;
  try {
    const user = await admin();
    if (!user) return json({ error: "Forbidden" }, 403);
    actorId = user.id;
    const parsed = schema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return json({ error: parsed.error.issues[0]?.message || "Invalid request" }, 400);
    const body = parsed.data;
    const bucket = ["search", "research", "provision"].includes(body.action) ? body.action : "controls";
    const rate = await securityRateLimit(`admin-calling:${bucket}`, user.id, bucket === "search" ? 12 : bucket === "provision" ? 10 : 400, 3600000);
    if (!rate.allowed) return json({ error: "Too many requests. Wait before trying again." }, 429);
    if (body.action === "options") return json(await callingProviderOptions());
    if (body.action === "setup") await saveCallingSetup(body);
    else if (body.action === "provision") await provisionCallingAgent(user.id);
    else if (body.action === "search") return json({ campaign: await discoverCallingBusinesses(body.campaign, user.id) });
    else if (body.action === "research") await researchCallingLead(body.campaignId, body.leadId, user.id);
    else if (body.action === "refresh") await refreshCallingAttempts(user.id);
    else if (body.action === "tick") {
      await refreshCallingAttempts(user.id);
      await tickCallingCampaign(body.campaignId, user.id);
    } else if (body.action === "resolve_unconfirmed") {
      await callingTransaction(async db => {
        const campaign = await getCampaign(db, body.campaignId, user.id);
        const rows = await db.$queryRawUnsafe<{ data: CallingAttempt }[]>(`SELECT "data" FROM "AdminCallingAttempt" WHERE "id"=$1 AND "campaignId"=$2`, body.attemptId, campaign.id);
        const attempt = rows[0]?.data;
        if (!attempt || !["dispatching", "uncertain"].includes(attempt.status) || attempt.conversationId) throw new Error("Only an unconfirmed call without a provider conversation ID can be reviewed here.");
        if (Date.now() - Date.parse(attempt.createdAt) < 900000) throw new Error("Wait at least 15 minutes and check both providers before releasing this hold.");
        await saveAttempt(db, { ...attempt, status: "failed", summary: `Admin confirmed no active call after checking providers. No automatic retry. Review: ${body.evidence}` });
        campaign.status = "paused"; campaign.lastMessage = "The reviewed hold was released. Calls remain paused.";
        await saveCampaign(db, campaign);
      });
    } else if (body.action === "reconcile") {
      const result = await elevenRequest<{ user_id?: string; conversation_id: string }>(`/convai/conversations/${encodeURIComponent(body.conversationId)}`);
      if (result.user_id !== body.attemptId || result.conversation_id !== body.conversationId) throw new Error("This provider conversation does not belong to the selected call attempt.");
      await callingTransaction(async db => {
        await getCampaign(db, body.campaignId, user.id);
        await db.$executeRawUnsafe(`UPDATE "AdminCallingAttempt" SET "data"=jsonb_set(jsonb_set("data",'{conversationId}',to_jsonb($3::text)),'{status}','"active"'::jsonb) WHERE "id"=$1 AND "campaignId"=$2 AND "data"->>'status' IN ('uncertain','dispatching')`, body.attemptId, body.campaignId, body.conversationId);
      });
      await refreshCallingAttempts(user.id);
    } else if (["approve", "suppress", "test_contact", "start", "pause"].includes(body.action)) {
      // These commands cannot initiate a call. A separate tick claims each attempt.
      if (!("campaignId" in body)) throw new Error("Campaign missing.");
      await callingTransaction(async db => {
        const campaign = await getCampaign(db, body.campaignId, user.id);
        if (body.action === "start") {
          const setup = await getCallingSetup(db);
          if (!setup.ready || !setup.profile.approved) throw new Error("Complete and verify the agent setup first.");
          if (!campaign.leads.some(l => l.consent && l.brief)) throw new Error("Approve at least one researched contact first.");
          if (!callWindowOpen(campaign.timezone)) throw new Error("Pilot calls are limited to weekdays, 10am to 4pm in the recipient's timezone.");
          const other = await db.$queryRawUnsafe<{ id: string }[]>(`SELECT "id" FROM "AdminCallingCampaign" WHERE "id"<>$1 AND "data"->>'status'='running' LIMIT 1`, campaign.id);
          if (other.length) throw new Error("Pause the other campaign before starting this one.");
          campaign.status = "running"; campaign.approvedDate = localCallDate(campaign.timezone); campaign.lastMessage = "Supervised run approved. Keep this workspace open; pause stops the next call, not the current call.";
        } else if (body.action === "pause") { campaign.status = "paused"; campaign.lastMessage = "Next calls paused. A call already dispatched may finish within its three-minute limit."; }
        else if (body.action === "test_contact") {
          if (campaign.status === "running") throw new Error("Pause before adding a contact.");
          if (campaign.leads.length >= 16) throw new Error("Pilot campaigns allow 15 businesses and one test contact.");
          const phone = normalizeCallingNumber(body.phone, campaign.country);
          if (!phone) throw new Error("Enter a valid direct number in the target country.");
          if (campaign.leads.some(l => l.phone === phone)) throw new Error("This number is already in the campaign.");
          campaign.leads.unshift({ id: randomUUID(), name: body.name, phone, address: `${campaign.city}, ${campaign.country}`, website: "", source: "", countryVerified: true });
        } else if (body.action === "approve" || body.action === "suppress") {
          const lead = campaign.leads.find(l => l.id === body.leadId);
          if (!lead) throw new Error("Business not found.");
          if (body.action === "suppress") {
            lead.suppressed = true; delete lead.consent;
            await db.$executeRawUnsafe(`INSERT INTO "AdminCallingSuppression" ("phone") VALUES ($1) ON CONFLICT DO NOTHING`, lead.phone);
          } else {
            if (campaign.status === "running") throw new Error("Pause before changing consent.");
            if (!lead.brief) throw new Error("Prepare and review the business brief first.");
            const obtained = Date.parse(body.obtainedAt);
            if (obtained > Date.now() || obtained < Date.now() - 365 * 86400000) throw new Error("Use consent obtained within the last year, not a future date.");
            const suppressed = await db.$queryRawUnsafe<{ phone: string }[]>(`SELECT "phone" FROM "AdminCallingSuppression" WHERE "phone"=$1`, lead.phone);
            if (suppressed.length) throw new Error("This number has opted out and cannot be approved here.");
            lead.countryVerified = true;
            lead.consent = { evidence: body.evidence, obtainedAt: body.obtainedAt, approvedAt: new Date().toISOString(), approvedBy: user.id };
          }
        }
        await saveCampaign(db, campaign);
      });
    }
    if (!["tick", "refresh", "research"].includes(body.action)) await recordAuditLog({ action: `admin_calling_${body.action}`, actorId: user.id, targetId: "campaignId" in body ? body.campaignId : null });
    return json({ ok: true, setup: await getCallingSetup(), ...await callingSnapshot(user.id) });
  } catch (error) {
    const message = error instanceof Error && !/prisma|SQL|database|connect ECONN|Invalid.*invocation/i.test(error.message) ? error.message : "The request could not be completed. Your saved campaign is unchanged; refresh before retrying.";
    await recordAuditLog({ action: "admin_calling_error", actorId, details: { message: message.slice(0, 500) } });
    return json({ error: message }, 400);
  }
}
