/** @jest-environment node */
jest.mock("@/lib/admin-notifications", () => ({ getPlatformEmailStatus: jest.fn(), sendPlatformEmail: jest.fn() }));
jest.mock("@/lib/newsletter", () => ({ requestNewsletterConfirmation: jest.fn(), confirmNewsletter: jest.fn(), unsubscribeNewsletter: jest.fn() }));
jest.mock("@/lib/security-rate-limit", () => ({ getClientIp: () => "127.0.0.1", rateLimitHeaders: () => ({}), securityRateLimit: jest.fn() }));
import { NextRequest } from "next/server";
import { getPlatformEmailStatus, sendPlatformEmail } from "@/lib/admin-notifications";
import { requestNewsletterConfirmation, confirmNewsletter, unsubscribeNewsletter } from "@/lib/newsletter";
import { securityRateLimit } from "@/lib/security-rate-limit";
import { POST } from "./route";
import { GET as confirmGET, POST as confirmPOST } from "./confirm/route";
import { GET as unsubscribeGET } from "./unsubscribe/route";
const request = (body: unknown) => new NextRequest("https://icloseleads.com/api/newsletter", { method: "POST", body: JSON.stringify(body) });
beforeEach(() => {
  jest.clearAllMocks(); process.env.NEXTAUTH_SECRET = "test-only";
  (getPlatformEmailStatus as jest.Mock).mockResolvedValue({ configured: true });
  (sendPlatformEmail as jest.Mock).mockResolvedValue({ success: true });
  (securityRateLimit as jest.Mock).mockResolvedValue({ allowed: true });
  (requestNewsletterConfirmation as jest.Mock).mockResolvedValue({ id: "subscriber", email: "reader@example.com", token: "a".repeat(64) });
});
it.each([{ email: "invalid", consent: true, topic: "status" }, { email: "reader@example.com", consent: false, topic: "updates" }, { email: "reader@example.com", consent: true, topic: "all" }])("rejects invalid input or missing consent", async body => {
  expect((await POST(request(body))).status).toBe(400);
  expect(sendPlatformEmail).not.toHaveBeenCalled();
});
it("sends a confirmation, not a false subscribed message", async () => {
  const response = await POST(request({ email: "reader@example.com", consent: true, topic: "status" }));
  expect(response.status).toBe(200);
  expect((await response.json()).message).toContain("confirm");
  expect(sendPlatformEmail).toHaveBeenCalledWith(expect.objectContaining({ recipient: "reader@example.com", subject: "Confirm your iCloseLeads service status notices" }));
});
it("reports delivery failure and applies rate limits", async () => {
  (sendPlatformEmail as jest.Mock).mockResolvedValue({ success: false });
  expect((await POST(request({ email: "reader@example.com", consent: true, topic: "updates" }))).status).toBe(503);
  (securityRateLimit as jest.Mock).mockResolvedValue({ allowed: false });
  expect((await POST(request({ email: "reader@example.com", consent: true, topic: "updates" }))).status).toBe(429);
});
it("link scanners cannot subscribe or unsubscribe with GET", async () => {
  const confirm = new NextRequest("https://icloseleads.com/api/newsletter/confirm?token=" + "a".repeat(64));
  expect((await confirmGET(confirm)).status).toBe(200);
  expect(confirmNewsletter).not.toHaveBeenCalled();
  expect((await unsubscribeGET(new NextRequest("https://icloseleads.com/api/newsletter/unsubscribe?token=abc." + "a".repeat(43)))).status).toBe(200);
  expect(unsubscribeNewsletter).not.toHaveBeenCalled();
  (confirmNewsletter as jest.Mock).mockResolvedValue(true);
  expect((await confirmPOST(confirm)).status).toBe(200);
});
