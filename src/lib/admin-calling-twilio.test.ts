/** @jest-environment node */
jest.mock("server-only", () => ({}));
jest.mock("./prisma", () => ({ prisma: { telephonyWorkspace: { findFirst: jest.fn() } } }));
jest.mock("./telephony", () => ({ decryptTelephonySecret: jest.fn(() => "secret"), twilio: jest.fn() }));
import { prisma } from "./prisma";
import { twilio } from "./telephony";
import { existingCallingNumbers, verifyExistingCallingNumber, startRegisteredCallingAttempt, readRegisteredCallingAttempt } from "./admin-calling-twilio";
import type { CallingAttempt } from "./admin-calling-model";

const callSid = "CA" + "a".repeat(32);
const workspace = { id: "owned", userId: "admin", status: "READY", phoneNumber: "+16506634744", phoneNumberSid: "PNowned", twilioAccountSid: "ACowned", twilioAuthTokenEncrypted: "encrypted" };
const attempt = { id: "attempt", workspaceId: "owned", fromNumber: workspace.phoneNumber, phone: "+14165550123", twilioCallSid: callSid } as CallingAttempt;
const numberFetch = jest.fn();
const callFetch = jest.fn();
const create = jest.fn();
const client = { incomingPhoneNumbers: jest.fn(() => ({ fetch: numberFetch })), calls: Object.assign(jest.fn(() => ({ fetch: callFetch })), { create }) };
beforeEach(() => {
  jest.clearAllMocks();
  (prisma.telephonyWorkspace.findFirst as jest.Mock).mockResolvedValue(workspace);
  (twilio as unknown as jest.Mock).mockReturnValue(client);
  numberFetch.mockResolvedValue({ accountSid: workspace.twilioAccountSid, phoneNumber: workspace.phoneNumber, capabilities: { voice: true } });
  create.mockResolvedValue({ sid: callSid });
  callFetch.mockResolvedValue({ sid: callSid, accountSid: workspace.twilioAccountSid, from: workspace.phoneNumber, to: attempt.phone, status: "completed" });
});
it("shows only the current admin's existing number, without returning credentials or contacting Twilio", async () => {
  expect(await existingCallingNumbers("admin")).toEqual([{ phone_number_id: "workspace:owned", phone_number: "+16506634744", label: "Your existing softphone number" }]);
  expect(prisma.telephonyWorkspace.findFirst).toHaveBeenCalledWith(expect.objectContaining({ where: { userId: "admin", user: { role: "ADMIN" }, status: "READY" } }));
  expect(twilio).not.toHaveBeenCalled();
});
it("verifies ownership with a read-only number fetch", async () => {
  expect(await verifyExistingCallingNumber("admin", "workspace:owned")).toEqual({ workspaceId: "owned", fromNumber: workspace.phoneNumber });
  expect(client.incomingPhoneNumbers).toHaveBeenCalledWith("PNowned");
  expect(create).not.toHaveBeenCalled();
});
it.each(["missing", "suspended", "subscription-status", "wrong-number", "wrong-account", "no-voice"])("blocks unavailable or mismatched numbers: %s", async mode => {
  if (mode === "missing") (prisma.telephonyWorkspace.findFirst as jest.Mock).mockResolvedValue(null);
  if (mode === "suspended") (prisma.telephonyWorkspace.findFirst as jest.Mock).mockResolvedValue({ ...workspace, status: "SUSPENDED" });
  if (mode === "subscription-status") (prisma.telephonyWorkspace.findFirst as jest.Mock).mockResolvedValue({ ...workspace, status: "ACTIVE" });
  if (mode === "wrong-number") numberFetch.mockResolvedValue({ accountSid: "ACowned", phoneNumber: "+14165550124", capabilities: { voice: true } });
  if (mode === "wrong-account") numberFetch.mockResolvedValue({ accountSid: "ACother", phoneNumber: workspace.phoneNumber, capabilities: { voice: true } });
  if (mode === "no-voice") numberFetch.mockResolvedValue({ accountSid: "ACowned", phoneNumber: workspace.phoneNumber, capabilities: { voice: false } });
  await expect(verifyExistingCallingNumber("admin", "workspace:owned")).rejects.toThrow();
  expect(create).not.toHaveBeenCalled();
});
it("uses per-call TwiML with recording off, a hard duration bound and no automatic retries", async () => {
  await startRegisteredCallingAttempt("admin", attempt, "<Response><Connect><Stream url='wss://example.test'/></Connect></Response>");
  expect(create).toHaveBeenCalledWith({ from: workspace.phoneNumber, to: attempt.phone, twiml: expect.stringContaining("<Response>"), record: false, timeout: 25, timeLimit: 180 });
  expect(twilio).toHaveBeenCalledWith("ACowned", "secret", { accountSid: "ACowned", timeout: 10000, autoRetry: false });
  expect(client.incomingPhoneNumbers).not.toHaveBeenCalled();
});
it("rejects another user's workspace and a number changed after selection", async () => {
  (prisma.telephonyWorkspace.findFirst as jest.Mock).mockResolvedValueOnce(null).mockResolvedValueOnce({ ...workspace, phoneNumber: "+14165550124" });
  await expect(startRegisteredCallingAttempt("other", attempt, "xml")).rejects.toThrow();
  await expect(startRegisteredCallingAttempt("admin", attempt, "xml")).rejects.toThrow();
  expect(prisma.telephonyWorkspace.findFirst).toHaveBeenCalledWith({ where: { id: "owned", userId: "other", user: { role: "ADMIN" } } });
  expect(create).not.toHaveBeenCalled();
});
it("will not call the outgoing number itself", async () => {
  await expect(startRegisteredCallingAttempt("admin", { ...attempt, phone: workspace.phoneNumber }, "xml")).rejects.toThrow();
  expect(create).not.toHaveBeenCalled();
});
it("rejects a mismatched Twilio result before releasing the call hold", async () => {
  callFetch.mockResolvedValue({ sid: callSid, accountSid: "ACowned", from: workspace.phoneNumber, to: "+14165550124", status: "completed" });
  await expect(readRegisteredCallingAttempt("admin", attempt)).rejects.toThrow("different call");
});
