import "server-only";
import { prisma } from "./prisma";
import { decryptTelephonySecret, twilio } from "./telephony";
import { CALL_SECONDS, type CallingAttempt } from "./admin-calling-model";

export const isExistingCallingNumber = (id: string) => id.startsWith("workspace:");

export async function existingCallingNumbers(userId: string) {
  const workspace = await prisma.telephonyWorkspace.findFirst({
    where: { userId, user: { role: "ADMIN" }, status: "READY" },
    select: { id: true, phoneNumber: true, phoneNumberSid: true, twilioAccountSid: true, twilioAuthTokenEncrypted: true },
  });
  if (!workspace?.phoneNumber || !workspace.phoneNumberSid || !workspace.twilioAccountSid || !workspace.twilioAuthTokenEncrypted) return [];
  return [{ phone_number_id: `workspace:${workspace.id}`, phone_number: workspace.phoneNumber, label: "Your existing softphone number" }];
}

async function workspaceClient(userId: string, workspaceId: string) {
  const workspace = await prisma.telephonyWorkspace.findFirst({
    where: { id: workspaceId, userId, user: { role: "ADMIN" } },
  });
  if (!workspace?.twilioAccountSid || !workspace.twilioAuthTokenEncrypted) throw new Error("Your admin calling workspace is unavailable.");
  const client = twilio(workspace.twilioAccountSid, decryptTelephonySecret(workspace.twilioAuthTokenEncrypted), {
    accountSid: workspace.twilioAccountSid, timeout: 10000, autoRetry: false,
  });
  return { workspace, client };
}

export async function verifyExistingCallingNumber(userId: string, phoneId: string) {
  if (!isExistingCallingNumber(phoneId)) throw new Error("Select your existing softphone number.");
  const { workspace, client } = await workspaceClient(userId, phoneId.slice("workspace:".length));
  if (workspace.status !== "READY" || !workspace.phoneNumber || !workspace.phoneNumberSid) throw new Error("Your softphone number is not ready.");
  const number = await client.incomingPhoneNumbers(workspace.phoneNumberSid).fetch();
  if (number.accountSid !== workspace.twilioAccountSid || number.phoneNumber !== workspace.phoneNumber || !number.capabilities.voice) {
    throw new Error("Twilio could not verify ownership and voice capability for this number.");
  }
  return { workspaceId: workspace.id, fromNumber: workspace.phoneNumber };
}

export async function startRegisteredCallingAttempt(userId: string, attempt: CallingAttempt, twiml: string) {
  const { workspace, client } = await workspaceClient(userId, attempt.workspaceId || "");
  if (workspace.status !== "READY" || workspace.phoneNumber !== attempt.fromNumber || !attempt.fromNumber || attempt.fromNumber === attempt.phone) {
    throw new Error("The outgoing number changed or matches the recipient.");
  }
  // Per-call TwiML only: never update the number, TwiML app or incoming routing.
  return client.calls.create({
    from: attempt.fromNumber, to: attempt.phone, twiml,
    record: false, timeout: 25, timeLimit: CALL_SECONDS,
  });
}

export async function readRegisteredCallingAttempt(userId: string, attempt: CallingAttempt) {
  if (!attempt.twilioCallSid || !/^CA[a-f0-9]{32}$/i.test(attempt.twilioCallSid)) throw new Error("A confirmed Twilio call ID is required.");
  const { workspace, client } = await workspaceClient(userId, attempt.workspaceId || "");
  const call = await client.calls(attempt.twilioCallSid).fetch();
  if (call.sid !== attempt.twilioCallSid || call.accountSid !== workspace.twilioAccountSid || call.from !== attempt.fromNumber || call.to !== attempt.phone) {
    throw new Error("Twilio returned a different call. Manual review is required.");
  }
  return call;
}
