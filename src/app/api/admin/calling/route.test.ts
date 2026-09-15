/** @jest-environment node */
jest.mock("next-auth", () => ({ getServerSession: jest.fn() }));
jest.mock("@/lib/auth", () => ({ authOptions: {} }));
jest.mock("@/lib/prisma", () => ({ prisma: { user: { findUnique: jest.fn() } } }));
jest.mock("@/lib/security-rate-limit", () => ({ securityRateLimit: jest.fn() }));
jest.mock("@/lib/audit-log", () => ({ recordAuditLog: jest.fn() }));
jest.mock("@/lib/admin-calling-store", () => ({ callingSnapshot: jest.fn(), callingTransaction: jest.fn(), getCampaign: jest.fn(), saveCampaign: jest.fn(), saveAttempt: jest.fn() }));
jest.mock("@/lib/admin-calling-service", () => ({ getCallingSetup: jest.fn(), saveCallingSetup: jest.fn(), callingProviderOptions: jest.fn(), provisionCallingAgent: jest.fn(), discoverCallingBusinesses: jest.fn(), researchCallingLead: jest.fn(), tickCallingCampaign: jest.fn(), refreshCallingAttempts: jest.fn(), elevenRequest: jest.fn() }));
jest.mock("@/lib/admin-calling-twilio", () => ({ existingCallingNumbers: jest.fn(), isExistingCallingNumber: (id: string) => id.startsWith("workspace:"), readRegisteredCallingAttempt: jest.fn() }));
import { existingCallingNumbers, readRegisteredCallingAttempt } from "@/lib/admin-calling-twilio";
import { LOFTS_PROFILE } from "@/lib/admin-calling-model";
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { securityRateLimit } from "@/lib/security-rate-limit";
import { callingTransaction, callingSnapshot, getCampaign, saveAttempt } from "@/lib/admin-calling-store";
import { getCallingSetup, tickCallingCampaign, refreshCallingAttempts, discoverCallingBusinesses } from "@/lib/admin-calling-service";
import { GET, POST } from "./route";
const uuid = "ce6eb48b-1a77-4aa1-9a10-38ed36eb8b94";
const request = (body: unknown) => new NextRequest("http://localhost/api/admin/calling", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
beforeEach(() => {
  jest.clearAllMocks();
  (existingCallingNumbers as jest.Mock).mockResolvedValue([]);
  (getServerSession as jest.Mock).mockResolvedValue({ user: { id: "admin", role: "ADMIN" } });
  (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: "admin", role: "ADMIN" });
  (securityRateLimit as jest.Mock).mockResolvedValue({ allowed: true });
  (getCallingSetup as jest.Mock).mockResolvedValue({ ready: false, connected: false });
  (callingSnapshot as jest.Mock).mockResolvedValue({ campaigns: [], attempts: [] });
  (refreshCallingAttempts as jest.Mock).mockResolvedValue(false);
});
it.each([null, { user: { id: "user", role: "USER" } }])("blocks non-admin requests before providers or storage", async session => {
  (getServerSession as jest.Mock).mockResolvedValue(session);
  expect((await GET()).status).toBe(403);
  expect((await POST(request({ action: "tick", campaignId: uuid }))).status).toBe(403);
  expect(tickCallingCampaign).not.toHaveBeenCalled();
  expect(callingSnapshot).not.toHaveBeenCalled();
});
it("blocks a stale admin session after demotion", async () => {
  (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: "admin", role: "USER" });
  expect((await POST(request({ action: "provision" }))).status).toBe(403);
});
it("returns private non-cached workspace state", async () => {
  const response = await GET();
  expect(response.status).toBe(200);
  expect(response.headers.get("cache-control")).toContain("no-store");
  expect(await response.json()).toEqual({ setup: { ready: false, connected: false }, existingNumbers: [], campaigns: [], attempts: [] });
});
it("rejects missing or false consent and mismatched countries before writes", async () => {
  for (const body of [
    { action: "approve", campaignId: uuid, leadId: uuid, evidence: "Public Google Maps number, no actual consent", obtainedAt: new Date().toISOString(), expressAiConsent: false, countryVerified: true },
    { action: "start", campaignId: uuid, reviewedToday: false },
    { action: "search", campaign: { category: "Dentist", city: "Toronto", country: "CA", timezone: "Australia/Sydney" } },
    { action: "test_contact", campaignId: uuid, name: "Test", phone: "+14165550123", ownedOrConsenting: false },
  ]) expect((await POST(request(body))).status).toBe(400);
  expect(callingTransaction).not.toHaveBeenCalled();
  expect(discoverCallingBusinesses).not.toHaveBeenCalled();
});
it("does not tick when rate limited and does not run a provider check on GET", async () => {
  (securityRateLimit as jest.Mock).mockResolvedValue({ allowed: false });
  expect((await POST(request({ action: "tick", campaignId: uuid }))).status).toBe(429);
  expect(tickCallingCampaign).not.toHaveBeenCalled();
  await GET(); expect(refreshCallingAttempts).not.toHaveBeenCalled();
});
it("refreshes previous attempts before dispatching another call", async () => {
  const response = await POST(request({ action: "tick", campaignId: uuid }));
  expect(response.status).toBe(200);
  expect(refreshCallingAttempts).toHaveBeenCalledWith("admin");
  expect(tickCallingCampaign).toHaveBeenCalledWith(uuid, "admin");
  expect((refreshCallingAttempts as jest.Mock).mock.invocationCallOrder[0]).toBeLessThan((tickCallingCampaign as jest.Mock).mock.invocationCallOrder[0]!);
});
it("pause cannot initiate calls", async () => {
  (callingTransaction as jest.Mock).mockImplementation(fn => fn({}));
  (getCampaign as jest.Mock).mockResolvedValue({ id: uuid, status: "running", leads: [] });
  expect((await POST(request({ action: "pause", campaignId: uuid }))).status).toBe(200);
  expect(tickCallingCampaign).not.toHaveBeenCalled();
});
it("does not combine provider reconciliation and another dial in one request", async () => {
  (refreshCallingAttempts as jest.Mock).mockResolvedValue(true);
  expect((await POST(request({ action: "tick", campaignId: uuid }))).status).toBe(200);
  expect(tickCallingCampaign).not.toHaveBeenCalled();
});
it("does not release a recent or provider-linked uncertain call", async () => {
  for (const record of [{ status: "uncertain", createdAt: new Date().toISOString(), conversationId: null }, { status: "uncertain", createdAt: "2026-01-01", conversationId: "provider-id" }]) {
    (callingSnapshot as jest.Mock).mockResolvedValue({ campaigns: [], attempts: [{ ...record, id: uuid, campaignId: uuid }] });
    const db = { $queryRawUnsafe: jest.fn().mockResolvedValue([{ data: record }]) };
    (callingTransaction as jest.Mock).mockImplementation(fn => fn(db));
    (getCampaign as jest.Mock).mockResolvedValue({ id: uuid });
    expect((await POST(request({ action: "resolve_unconfirmed", campaignId: uuid, attemptId: uuid, reviewedProvider: true, evidence: "Operator checked both providers and found no active call." }))).status).toBe(400);
  }
  expect(saveAttempt).not.toHaveBeenCalled();
});
it("releases only an old reviewed hold, keeps it failed and never dispatches", async () => {
  (callingSnapshot as jest.Mock).mockResolvedValue({ campaigns: [], attempts: [{ id: uuid, campaignId: uuid, status: "uncertain", createdAt: "2026-01-01", conversationId: null }] });
  const db = { $queryRawUnsafe: jest.fn().mockResolvedValue([{ data: { id: uuid, status: "uncertain", createdAt: "2026-01-01", conversationId: null } }]) };
  (callingTransaction as jest.Mock).mockImplementation(fn => fn(db));
  (getCampaign as jest.Mock).mockResolvedValue({ id: uuid });
  expect((await POST(request({ action: "resolve_unconfirmed", campaignId: uuid, attemptId: uuid, reviewedProvider: true, evidence: "Operator checked both providers and found no active call." }))).status).toBe(200);
  expect(saveAttempt).toHaveBeenCalledWith(db, expect.objectContaining({ status: "failed", summary: expect.stringContaining("No automatic retry") }));
  expect(tickCallingCampaign).not.toHaveBeenCalled();
});
it("rejects selecting another admin's outgoing number", async () => {
  expect((await POST(request({ action: "setup", profile: LOFTS_PROFILE, voiceId: "", phoneId: "workspace:another" }))).status).toBe(400);
});
it("makes the existing number available without an ElevenLabs connection", async () => {
  (existingCallingNumbers as jest.Mock).mockResolvedValue([{ phone_number_id: "workspace:owned", phone_number: "+16505550123", label: "Your existing softphone number" }]);
  const result = await (await GET()).json();
  expect(result.setup.connected).toBe(false);
  expect(result.existingNumbers[0].phone_number).toBe("+16505550123");
});
it.each(["in-progress", "completed"])("verifies linked Twilio state before reviewed hold release: %s", async status => {
  const record = { id: uuid, campaignId: uuid, workspaceId: "owned", twilioCallSid: "CA" + "a".repeat(32), status: "uncertain", createdAt: "2026-01-01", conversationId: null };
  (callingSnapshot as jest.Mock).mockResolvedValue({ campaigns: [], attempts: [record] });
  (readRegisteredCallingAttempt as jest.Mock).mockResolvedValue({ status });
  const db = { $queryRawUnsafe: jest.fn().mockResolvedValue([{ data: record }]) };
  (callingTransaction as jest.Mock).mockImplementation(fn => fn(db));
  (getCampaign as jest.Mock).mockResolvedValue({ id: uuid });
  const result = await POST(request({ action: "resolve_unconfirmed", campaignId: uuid, attemptId: uuid, reviewedProvider: true, evidence: "Operator verified both providers. No active call or AI conversation." }));
  expect(result.status).toBe(status === "completed" ? 200 : 400);
  if (status === "in-progress") expect(saveAttempt).not.toHaveBeenCalled();
  else expect(saveAttempt).toHaveBeenCalledWith(db, expect.objectContaining({ status: "failed" }));
  expect(tickCallingCampaign).not.toHaveBeenCalled();
});
