/** @jest-environment node */
import { NextRequest } from "next/server";
import { POST } from "./route";
import { prisma } from "@/lib/prisma";
import { getCallingMinuteState } from "@/lib/calling-packages";
import { validateTwilioWebhook } from "@/lib/telephony";

jest.mock("@/lib/prisma", () => ({ prisma: { voiceCall: {
  count: jest.fn(async () => 0), create: jest.fn(async () => ({ id: "call_qa" })),
  updateMany: jest.fn(async () => ({ count: 1 })),
} } }));
jest.mock("@/lib/calling-packages", () => ({ getCallingMinuteState: jest.fn() }));
jest.mock("@/lib/telephony", () => ({
  ...jest.requireActual("@/lib/telephony"),
  validateTwilioWebhook: jest.fn(),
  listWorkspacePhoneNumbers: jest.fn(async () => [{ phoneNumber: "+15005550006", callable: true }]),
}));

function request(path = "", params = { To: "+14155550123" }) {
  return new NextRequest(`http://localhost/api/softphone/voice${path}`, {
    method: "POST", body: new URLSearchParams(params),
  });
}

describe("softphone dialing and callback flow (no real calls)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (validateTwilioWebhook as jest.Mock).mockResolvedValue({ id: "workspace_qa", userId: "user_qa" });
  });

  it("rejects unauthenticated Twilio callbacks", async () => {
    (validateTwilioWebhook as jest.Mock).mockResolvedValueOnce(null);
    expect((await POST(request())).status).toBe(403);
    expect(prisma.voiceCall.create).not.toHaveBeenCalled();
  });

  it("does not dial when the minute package is missing or exhausted", async () => {
    (getCallingMinuteState as jest.Mock).mockResolvedValue({ canCall: false, unlimited: false, remainingSeconds: 0 });
    const body = await (await POST(request())).text();
    expect(body).toContain("<Hangup");
    expect(body).not.toContain("<Dial");
    expect(prisma.voiceCall.create).not.toHaveBeenCalled();
  });

  it.each([[false, 45, 45], [true, 0, 1800]])("enforces the call duration limit (admin=%s)", async (unlimited, remainingSeconds, expected) => {
    (getCallingMinuteState as jest.Mock).mockResolvedValue({ canCall: true, unlimited, remainingSeconds });
    const body = await (await POST(request())).text();
    expect(body).toContain(`timeLimit="${expected}"`);
    expect(body).toContain("+14155550123");
    expect(prisma.voiceCall.create).toHaveBeenCalledTimes(1);
  });

  it("records the signed call duration against the correct workspace", async () => {
    const response = await POST(new NextRequest("http://localhost/api/softphone/voice?mode=status&recordId=call_qa", {
      method: "POST", body: new URLSearchParams({ CallStatus: "completed", CallDuration: "42" }),
    }));
    expect(response.status).toBe(204);
    expect(prisma.voiceCall.updateMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: "call_qa", workspaceId: "workspace_qa" },
      data: expect.objectContaining({ status: "completed", durationSeconds: 42 }),
    }));
  });
});
