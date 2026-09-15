/** @jest-environment node */
jest.mock("server-only", () => ({}));
jest.mock("sanitize-html", () => ({ __esModule: true, default: (value: string) => value }));
jest.mock("./prisma", () => ({ prisma: { telephonyWorkspace: { findMany: jest.fn() }, telephonyPurchase: { findMany: jest.fn() } } }));
jest.mock("./platform-secrets", () => ({ getPlatformSetting: jest.fn(), getPlatformSettings: jest.fn(), encodePlatformSetting: jest.fn() }));
jest.mock("./local-leads-engine", () => ({ searchLocalBusinesses: jest.fn() }));
jest.mock("./safe-fetch", () => ({ safeFetch: jest.fn(), readLimitedText: jest.fn() }));
jest.mock("./audit-log", () => ({ recordAuditLog: jest.fn() }));
jest.mock("./secret-box", () => ({ readStoredSecret: (value: string) => value }));
jest.mock("./admin-calling-store", () => ({ callingTransaction: jest.fn(), getCampaign: jest.fn(), saveCampaign: jest.fn(), saveAttempt: jest.fn(), insertCampaign: jest.fn(), callingSnapshot: jest.fn() }));
jest.mock("./admin-calling-twilio", () => ({ existingCallingNumbers: jest.fn(), isExistingCallingNumber: (id: string) => id.startsWith("workspace:"), verifyExistingCallingNumber: jest.fn(), startRegisteredCallingAttempt: jest.fn(), readRegisteredCallingAttempt: jest.fn() }));
import { existingCallingNumbers, verifyExistingCallingNumber, startRegisteredCallingAttempt, readRegisteredCallingAttempt } from "./admin-calling-twilio";
import { getPlatformSetting } from "./platform-secrets";
import { callingTransaction, getCampaign, saveAttempt, callingSnapshot } from "./admin-calling-store";
import { tickCallingCampaign, refreshCallingAttempts, suppressCallingToken, callingProviderOptions, researchCallingLead } from "./admin-calling-service";
import { prisma } from "./prisma";
import { safeFetch } from "./safe-fetch";
import { saveCampaign } from "./admin-calling-store";
import { LOFTS_PROFILE, managedAgentConfig, type CallingCampaign, type CallingSetup } from "./admin-calling-model";
const setup: CallingSetup = { profile: { ...LOFTS_PROFILE, approved: true }, voiceId: "voice", phoneId: "phone", agentId: "agent", ready: true, connected: true };
const sample = (): CallingCampaign => ({ id: "campaign", userId: "admin", category: "Dentists", city: "Sydney", country: "AU", timezone: "Australia/Sydney", createdAt: "2026-09-15T00:00:00Z", status: "running", approvedDate: "2026-09-15", sources: [], leads: [{ id: "lead", phone: "+61280001234", name: "Consenting test", address: "Sydney", source: "https://example.com", website: "", countryVerified: true, brief: { facts: "Test prospect", offer: "Website review", question: "What matters?", sources: [], status: "unavailable", checkedAt: "2026-09-15T00:00:00Z" }, consent: { evidence: "Owner has consented specifically to Lofts Studio AI test calls to this number.", obtainedAt: "2026-09-14T00:00:00Z", approvedAt: "2026-09-15T00:00:00Z", approvedBy: "admin" } }] });
const db = { $queryRawUnsafe: jest.fn(), $executeRawUnsafe: jest.fn(), voiceCall: { findMany: jest.fn() }, platformSetting: { findMany: jest.fn() } };
let busy = false;
let optedOut = false;
let campaign: CallingCampaign;
let fetchMock: jest.Mock;
beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers({ doNotFake: ["nextTick", "setImmediate", "setTimeout"] });
  jest.setSystemTime(new Date("2026-09-15T02:00:00Z"));
  busy = false; optedOut = false; campaign = sample();
  (existingCallingNumbers as jest.Mock).mockResolvedValue([]);
  (getPlatformSetting as jest.Mock).mockImplementation(key => Promise.resolve(key === "admin_calling_setup" ? JSON.stringify(setup) : "provider-test-key"));
  (getCampaign as jest.Mock).mockImplementation(() => Promise.resolve(campaign));
  db.platformSetting.findMany.mockResolvedValue([{ key: "admin_calling_setup", value: JSON.stringify(setup) }, { key: "admin_calling_elevenlabs_key", value: "test-key" }]);
  let lock = Promise.resolve();
  (callingTransaction as jest.Mock).mockImplementation(fn => { const result = lock.then(() => fn(db)); lock = result.catch(() => undefined); return result; });
  db.voiceCall.findMany.mockResolvedValue([]);
  db.$queryRawUnsafe.mockImplementation((query: string) => {
    if (query.includes("count(*)")) return Promise.resolve([{ count: BigInt(0) }]);
    if (query.includes("->>'status'")) return Promise.resolve(busy ? [{ id: "active" }] : []);
    if (query.includes("AdminCallingSuppression")) return Promise.resolve(optedOut ? [{ phone: "+61280001234" }] : []);
    return Promise.resolve([]);
  });
  db.$executeRawUnsafe.mockImplementation((query: string) => { if (query.includes('INSERT INTO "AdminCallingAttempt"')) busy = true; return Promise.resolve(1); });
  fetchMock = jest.fn(async (url: string) => ({ ok: true, json: async () => url.includes("outbound-call") ? { success: true, conversation_id: "conversation" } : managedAgentConfig("voice", "https://icloseleads.com/api/admin-calling/opt-out") }));
  global.fetch = fetchMock;
});
afterEach(() => { jest.useRealTimers(); });
it("claims one call atomically before a concurrent second request can dispatch", async () => {
  await Promise.all([tickCallingCampaign("campaign", "admin"), tickCallingCampaign("campaign", "admin")]);
  const outbound = fetchMock.mock.calls.filter(([url]) => String(url).includes("outbound-call"));
  expect(outbound).toHaveLength(1);
  const payload = JSON.parse(outbound[0]![1].body);
  expect(payload.to_number).toBe("+61280001234");
  expect(payload.agent_phone_number_id).toBe("phone");
  expect(payload.call_recording_enabled).toBe(false);
  expect(payload.conversation_initiation_client_data.dynamic_variables.secret__call_token).toMatch(/^[a-f0-9]{64}$/);
  expect(saveAttempt).toHaveBeenCalledWith(db, expect.objectContaining({ status: "active", conversationId: "conversation" }));
});
it.each(["no-consent", "suppressed", "paused", "busy", "stale", "daily-limit"])("does not call when blocked: %s", async mode => {
  if (mode === "no-consent") delete campaign.leads[0]!.consent;
  if (mode === "suppressed") optedOut = true;
  if (mode === "paused") campaign.status = "paused";
  if (mode === "busy") busy = true;
  if (mode === "stale") campaign.leads[0]!.brief!.checkedAt = "2025-01-01";
  if (mode === "daily-limit") db.$queryRawUnsafe.mockImplementation((q: string) => Promise.resolve(q.includes("count(*)") ? [{ count: BigInt(10) }] : []));
  await tickCallingCampaign("campaign", "admin").catch(() => undefined);
  expect(fetchMock.mock.calls.some(([url]) => String(url).includes("outbound-call"))).toBe(false);
});
it("holds an ambiguous call, pauses the campaign and never blindly retries", async () => {
  fetchMock.mockImplementation(async (url: string) => {
    if (url.includes("outbound-call")) throw new Error("Timeout");
    return { ok: true, json: async () => managedAgentConfig("voice", "https://icloseleads.com/api/admin-calling/opt-out") };
  });
  await tickCallingCampaign("campaign", "admin");
  expect(saveAttempt).toHaveBeenCalledWith(db, expect.objectContaining({ status: "uncertain" }));
  expect(campaign.status).toBe("paused");
  await tickCallingCampaign("campaign", "admin");
  expect(fetchMock.mock.calls.filter(([url]) => String(url).includes("outbound-call"))).toHaveLength(1);
});
it("redacts provider errors and pauses definite rejections", async () => {
  fetchMock.mockImplementation(async (url: string) => url.includes("outbound-call") ? { ok: false, status: 402, json: async () => ({ secret: "never-return-this" }) } : { ok: true, json: async () => managedAgentConfig("voice", "https://icloseleads.com/api/admin-calling/opt-out") });
  await tickCallingCampaign("campaign", "admin");
  expect(saveAttempt).toHaveBeenCalledWith(db, expect.objectContaining({ status: "failed", summary: expect.stringContaining("rejected") }));
  expect(JSON.stringify((saveAttempt as jest.Mock).mock.calls)).not.toContain("never-return-this");
});
it("rejects missing and expired per-call opt-out tokens", async () => {
  expect(await suppressCallingToken("bad")).toBe(false);
  expect(await suppressCallingToken("a".repeat(64))).toBe(false);
  expect(db.$executeRawUnsafe).not.toHaveBeenCalled();
});
it("records opt-outs from the prospect transcript and terminal provider state", async () => {
  (callingSnapshot as jest.Mock).mockResolvedValue({ attempts: [{ id: "attempt", campaignId: "campaign", leadId: "lead", phone: "+61280001234", status: "active", conversationId: "conversation" }] });
  fetchMock.mockResolvedValue({ ok: true, json: async () => ({ conversation_id: "conversation", status: "done", transcript: [{ role: "user", message: "Please do not call me again" }], analysis: { transcript_summary: "Opted out" }, metadata: { call_duration_secs: 15 } }) });
  await refreshCallingAttempts("admin");
  expect(saveAttempt).toHaveBeenCalledWith(db, expect.objectContaining({ status: "done", duration: 15 }));
  expect(db.$executeRawUnsafe).toHaveBeenCalledWith(expect.stringContaining("AdminCallingSuppression"), "+61280001234");
});
it("excludes customer-owned and disabled phone numbers and non-female voices", async () => {
  (prisma.telephonyWorkspace.findMany as jest.Mock).mockResolvedValue([{ phoneNumber: "+61280001111" }]);
  (prisma.telephonyPurchase.findMany as jest.Mock).mockResolvedValue([{ phoneNumber: "+61280002222" }]);
  const number = (phone_number: string, supports_outbound = true) => ({ phone_number, supports_outbound, phone_number_id: phone_number, provider: "twilio" });
  fetchMock.mockImplementation(async (url: string) => ({ ok: true, json: async () => url.includes("phone-numbers") ? [number("+61280001111"), number("+61280002222"), number("+61280003333"), number("+61280004444", false)] : { voices: [{ voice_id: "f", name: "Voice", labels: { gender: "female" } }, { voice_id: "m", name: "Other", labels: { gender: "male" } }] } }));
  const result = await callingProviderOptions("admin");
  expect(result.numbers.map(n => n.phone_number)).toEqual(["+61280003333"]);
  expect(result.voices.map(v => v.id)).toEqual(["f"]);
});

function useExistingNumber() {
  const config = { ...setup, phoneId: "workspace:owned" };
  (getPlatformSetting as jest.Mock).mockImplementation(key => Promise.resolve(key === "admin_calling_setup" ? JSON.stringify(config) : "test-key"));
  db.platformSetting.findMany.mockResolvedValue([{ key: "admin_calling_setup", value: JSON.stringify(config) }, { key: "admin_calling_elevenlabs_key", value: "test-key" }]);
  (verifyExistingCallingNumber as jest.Mock).mockResolvedValue({ workspaceId: "owned", fromNumber: "+16506634744" });
  (startRegisteredCallingAttempt as jest.Mock).mockResolvedValue({ sid: "CA" + "a".repeat(32) });
  fetchMock.mockImplementation(async (url: string) => ({
    ok: true, headers: new Headers({ "content-type": "application/json" }),
    json: async () => url.includes("register-call") ? "<Response><Connect><Stream url='wss://example.test'/></Connect></Response>" : managedAgentConfig("voice", "https://icloseleads.com/api/admin-calling/opt-out"),
  }));
}
it("registers before dialing the existing number and retains the atomic one-call guard", async () => {
  useExistingNumber();
  await Promise.all([tickCallingCampaign("campaign", "admin"), tickCallingCampaign("campaign", "admin")]);
  expect(startRegisteredCallingAttempt).toHaveBeenCalledTimes(1);
  const registration = fetchMock.mock.calls.find(([url]) => url.includes("register-call"));
  expect(JSON.parse(registration![1].body)).toEqual(expect.objectContaining({ from_number: "+16506634744", to_number: "+61280001234", direction: "outbound" }));
  expect(fetchMock.mock.calls.some(([url]) => url.includes("outbound-call"))).toBe(false);
  expect(saveAttempt).toHaveBeenCalledWith(db, expect.objectContaining({ status: "active", workspaceId: "owned", twilioCallSid: "CA" + "a".repeat(32), agentId: "agent" }));
});
it("does not dial if AI registration fails or returns an invalid body", async () => {
  useExistingNumber();
  fetchMock.mockImplementation(async (url: string) => ({ ok: true, headers: new Headers({ "content-type": "application/json" }), json: async () => url.includes("register-call") ? {} : managedAgentConfig("voice", "https://icloseleads.com/api/admin-calling/opt-out") }));
  await tickCallingCampaign("campaign", "admin");
  expect(startRegisteredCallingAttempt).not.toHaveBeenCalled();
  expect(saveAttempt).toHaveBeenCalledWith(db, expect.objectContaining({ status: "failed", summary: expect.stringContaining("No telephone call") }));
});
it("does not dial if paused while ElevenLabs prepares the call", async () => {
  useExistingNumber();
  fetchMock.mockImplementation(async (url: string) => {
    if (url.includes("register-call")) campaign.status = "paused";
    return { ok: true, headers: new Headers({ "content-type": "application/json" }), json: async () => url.includes("register-call") ? "<Response><Connect><Stream url='wss://example.test'/></Connect></Response>" : managedAgentConfig("voice", "https://icloseleads.com/api/admin-calling/opt-out") };
  });
  await tickCallingCampaign("campaign", "admin");
  expect(startRegisteredCallingAttempt).not.toHaveBeenCalled();
  expect(saveAttempt).toHaveBeenCalledWith(db, expect.objectContaining({ status: "failed", summary: expect.stringContaining("No telephone call") }));
});
it.each([400, 500, "timeout"])("does not retry Twilio dispatch failure: %s", async status => {
  useExistingNumber();
  (startRegisteredCallingAttempt as jest.Mock).mockRejectedValue(status === "timeout" ? new Error("timeout") : { status, message: "secret-provider-details" });
  await tickCallingCampaign("campaign", "admin");
  expect(saveAttempt).toHaveBeenCalledWith(db, expect.objectContaining({ status: status === 400 ? "failed" : "uncertain" }));
  expect(campaign.status).toBe("paused");
  await tickCallingCampaign("campaign", "admin");
  expect(startRegisteredCallingAttempt).toHaveBeenCalledTimes(1);
  expect(JSON.stringify((saveAttempt as jest.Mock).mock.calls)).not.toContain("secret-provider-details");
});
const registeredAttempt = { id: "attempt", campaignId: "campaign", leadId: "lead", phone: "+61280001234", status: "active", workspaceId: "owned", fromNumber: "+16506634744", twilioCallSid: "CA" + "a".repeat(32), agentId: "agent", conversationId: null, createdAt: "2026-09-15T01:59:00Z" };
it("does not release a registered call until Twilio itself is terminal", async () => {
  (callingSnapshot as jest.Mock).mockResolvedValue({ attempts: [registeredAttempt] });
  (readRegisteredCallingAttempt as jest.Mock).mockResolvedValue({ status: "in-progress" });
  await refreshCallingAttempts("admin");
  expect(saveAttempt).not.toHaveBeenCalled();
  expect(fetchMock).not.toHaveBeenCalled();
});
it("handles an unanswered Twilio call without requiring an AI conversation", async () => {
  (callingSnapshot as jest.Mock).mockResolvedValue({ attempts: [registeredAttempt] });
  (readRegisteredCallingAttempt as jest.Mock).mockResolvedValue({ status: "no-answer" });
  await refreshCallingAttempts("admin");
  expect(saveAttempt).toHaveBeenCalledWith(db, expect.objectContaining({ status: "failed", summary: expect.stringContaining("no-answer") }));
  expect(fetchMock).not.toHaveBeenCalled();
});
it("matches the registered conversation to its exact attempt and saves opt-outs", async () => {
  (callingSnapshot as jest.Mock).mockResolvedValue({ attempts: [{ ...registeredAttempt }] });
  (readRegisteredCallingAttempt as jest.Mock).mockResolvedValue({ status: "completed" });
  fetchMock.mockImplementation(async (url: string) => ({ ok: true, json: async () => url.includes("?") ? { conversations: [{ agent_id: "agent", conversation_id: "conversation" }] } : { conversation_id: "conversation", agent_id: "agent", user_id: "attempt", status: "done", transcript: [{ role: "user", message: "Do not call me again" }] } }));
  await refreshCallingAttempts("admin");
  expect(fetchMock.mock.calls[0][0]).toContain("user_id=attempt");
  expect(saveAttempt).toHaveBeenCalledWith(db, expect.objectContaining({ conversationId: "conversation", status: "done" }));
  expect(db.$executeRawUnsafe).toHaveBeenCalledWith(expect.stringContaining("AdminCallingSuppression"), "+61280001234");
});
it("rejects a conversation returned for another attempt", async () => {
  (callingSnapshot as jest.Mock).mockResolvedValue({ attempts: [{ ...registeredAttempt, conversationId: "conversation" }] });
  (readRegisteredCallingAttempt as jest.Mock).mockResolvedValue({ status: "completed" });
  fetchMock.mockResolvedValue({ ok: true, json: async () => ({ user_id: "other", agent_id: "agent", conversation_id: "conversation", status: "done" }) });
  await expect(refreshCallingAttempts("admin")).rejects.toThrow("does not belong");
  expect(saveAttempt).not.toHaveBeenCalled();
});
it("holds a completed call with missing AI notes instead of blindly starting another", async () => {
  (callingSnapshot as jest.Mock).mockResolvedValue({ attempts: [{ ...registeredAttempt, createdAt: "2026-09-15T01:00:00Z" }] });
  (readRegisteredCallingAttempt as jest.Mock).mockResolvedValue({ status: "completed" });
  fetchMock.mockResolvedValue({ ok: true, json: async () => ({ conversations: [] }) });
  await refreshCallingAttempts("admin");
  expect(saveAttempt).toHaveBeenCalledWith(db, expect.objectContaining({ status: "uncertain" }));
  expect(campaign.status).toBe("paused");
});
it("will not dispatch if someone removed the provider duration limit", async () => {
  const config = managedAgentConfig("voice", "https://icloseleads.com/api/admin-calling/opt-out");
  config.conversation_config.conversation.max_duration_seconds = 3600;
  fetchMock.mockResolvedValue({ ok: true, json: async () => config });
  await expect(tickCallingCampaign("campaign", "admin")).rejects.toThrow("provider agent changed");
  expect(fetchMock.mock.calls.some(([url]) => String(url).includes("outbound-call"))).toBe(false);
});
it("saves an honest fallback when website and AI research fail, and clears old approval", async () => {
  campaign.status = "draft";
  campaign.leads[0]!.website = "https://example.test/unavailable";
  (safeFetch as jest.Mock).mockRejectedValue(new Error("Website unavailable"));
  fetchMock.mockResolvedValue({ ok: false });
  await researchCallingLead("campaign", "lead", "admin");
  expect(saveCampaign).toHaveBeenCalledWith(db, expect.objectContaining({ leads: [expect.objectContaining({ brief: expect.objectContaining({ status: "unavailable", facts: expect.stringContaining("unverified"), error: expect.stringContaining("fallback") }) })] }));
  expect(campaign.leads[0]!.consent).toBeUndefined();
});
