/** @jest-environment node */
jest.mock("server-only", () => ({}));
jest.mock("@/lib/platform-secrets", () => ({ getPlatformSetting: jest.fn().mockResolvedValue("webhook-test-key") }));
jest.mock("@/lib/admin-calling-service", () => ({ saveRetellNotes: jest.fn() }));
import { createHmac } from "node:crypto";
import { NextRequest } from "next/server";
import { saveRetellNotes } from "@/lib/admin-calling-service";
import { POST } from "./route";
const payload = { event: "call_analyzed", call: { call_id: "call_test", agent_id: "agent_test", call_type: "phone_call", direction: "outbound", from_number: "+16505550123", to_number: "+14165550123", metadata: { attemptId: "cf10257b-7f66-4cf0-82f2-2b089c610119" }, call_status: "ended", recording_url: "https://do-not-store.example.test/audio", transcript_object: [{ role: "user", content: "Stop calling me" }] } };
function request(raw = JSON.stringify(payload), key = "webhook-test-key", time = Date.now()) {
  return new NextRequest("https://icloseleads.com/api/admin-calling/retell", { method: "POST", body: raw, headers: { "x-retell-signature": `v=${time},d=${createHmac("sha256", key).update(raw + time).digest("hex")}` } });
}
beforeEach(() => { jest.clearAllMocks(); (saveRetellNotes as jest.Mock).mockResolvedValue(undefined); });
it("accepts an authentic raw-body event without retaining recording links or extra provider fields", async () => {
  expect((await POST(request())).status).toBe(204);
  expect(saveRetellNotes).toHaveBeenCalledWith(expect.objectContaining({ call_id: "call_test" }), true);
  expect(JSON.stringify((saveRetellNotes as jest.Mock).mock.calls)).not.toContain("recording_url");
});
it("rejects forged or expired signatures before saving anything", async () => {
  expect((await POST(request(JSON.stringify(payload), "forged"))).status).toBe(401);
  expect((await POST(request(JSON.stringify(payload), "webhook-test-key", Date.now() - 300001))).status).toBe(401);
  expect(saveRetellNotes).not.toHaveBeenCalled();
});
it("rejects malformed and oversized payloads", async () => {
  expect((await POST(request(JSON.stringify({ event: "call_analyzed", call: {} })))).status).toBe(400);
  expect((await POST(request("x".repeat(256001)))).status).toBe(413);
  expect(saveRetellNotes).not.toHaveBeenCalled();
});
it("requests a provider retry when an authentic event cannot be persisted", async () => {
  (saveRetellNotes as jest.Mock).mockRejectedValue(new Error("database unavailable"));
  expect((await POST(request())).status).toBe(503);
});
