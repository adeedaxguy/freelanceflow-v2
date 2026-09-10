/** @jest-environment node */
jest.mock("next-auth", () => ({ getServerSession: jest.fn() }));
jest.mock("@/lib/auth", () => ({ authOptions: {} }));
jest.mock("@/lib/admin-notifications", () => ({ getPlatformEmailStatus: jest.fn(), sendPlatformEmail: jest.fn() }));
jest.mock("@/lib/newsletter", () => ({ newsletterCount: jest.fn(), newsletterRecipients: jest.fn(), newsletterUnsubscribeUrl: jest.fn() }));
jest.mock("@/lib/prisma", () => ({ prisma: {
  user: { count: jest.fn(), findMany: jest.fn() },
  platformSetting: { findMany: jest.fn(), create: jest.fn(), update: jest.fn(), upsert: jest.fn() },
  $transaction: jest.fn(), $executeRawUnsafe: jest.fn(),
} }));
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { getPlatformEmailStatus, sendPlatformEmail } from "@/lib/admin-notifications";
import { newsletterCount, newsletterRecipients, newsletterUnsubscribeUrl } from "@/lib/newsletter";
import { GET, POST } from "./route";
const request = (segment: string, extra = {}) => new NextRequest("https://icloseleads.com/api/admin/broadcast", { method: "POST", body: JSON.stringify({ campaignId: "ff1180b1-d143-4dd7-9a3f-eeb7cfb622aa", subject: "Service notice", message: "An actual team-published notice about a service.", segment, confirm: "SEND_CONSENTED_CAMPAIGN", ...extra }) });
beforeEach(() => {
  jest.clearAllMocks(); process.env.NEXTAUTH_SECRET = "test-only";
  (getServerSession as jest.Mock).mockResolvedValue({ user: { id: "admin", email: "admin@example.com", role: "ADMIN" } });
  (getPlatformEmailStatus as jest.Mock).mockResolvedValue({ configured: true, fromEmail: "hello@icloseleads.com" });
  (sendPlatformEmail as jest.Mock).mockResolvedValue({ success: true });
  (prisma.platformSetting.findMany as jest.Mock).mockResolvedValue([]);
  (prisma.$transaction as jest.Mock).mockResolvedValue([]);
  (prisma.$executeRawUnsafe as jest.Mock).mockResolvedValue(1);
  (prisma.user.findMany as jest.Mock).mockResolvedValue([{ id: "user-1", email: "user@example.com", name: "User" }]);
  (prisma.user.count as jest.Mock).mockResolvedValue(1);
  (newsletterCount as jest.Mock).mockResolvedValue(1);
  (newsletterRecipients as jest.Mock).mockResolvedValue([{ id: "subscriber-1", email: "reader@example.com", name: null, topic: "status" }]);
  (newsletterUnsubscribeUrl as jest.Mock).mockReturnValue("https://icloseleads.com/api/newsletter/unsubscribe?token=test");
});
it.each([null, { user: { id: "user-1", role: "USER" } }])("rejects non-admin access without sending mail", async session => {
  (getServerSession as jest.Mock).mockResolvedValue(session);
  expect((await GET()).status).toBe(403);
  expect((await POST(request("updates"))).status).toBe(403);
  expect(sendPlatformEmail).not.toHaveBeenCalled();
});
it("requires explicit confirmation to publish a status notice", async () => {
  expect((await POST(request("status"))).status).toBe(400);
  expect(sendPlatformEmail).not.toHaveBeenCalled();
  expect(prisma.platformSetting.upsert).not.toHaveBeenCalled();
});
it("delivers only to confirmed topic subscribers with the topic unsubscribe link", async () => {
  expect((await POST(request("status", { publishStatus: true }))).status).toBe(200);
  expect(newsletterRecipients).toHaveBeenCalledWith("status", 200);
  expect(prisma.user.findMany).not.toHaveBeenCalled();
  expect(sendPlatformEmail).toHaveBeenCalledWith(expect.objectContaining({ recipient: "reader@example.com", html: expect.stringContaining("Service status notices"), headers: expect.objectContaining({ "List-Unsubscribe": "<https://icloseleads.com/api/newsletter/unsubscribe?token=test>" }) }));
  expect(prisma.platformSetting.upsert).toHaveBeenCalledWith(expect.objectContaining({ where: { key: "public_status_notice" }, update: { value: expect.stringContaining('"subject":"Service notice"') } }));
});
it("preserves the existing consent and plan restrictions for account campaigns", async () => {
  expect((await POST(request("pro"))).status).toBe(200);
  expect(prisma.user.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { suspended: false, marketingConsent: true, plan: "pro" }, take: 200 }));
  expect(newsletterRecipients).not.toHaveBeenCalled();
  expect(prisma.platformSetting.upsert).not.toHaveBeenCalled();
});
it("counts failed deliveries as failures instead of successful sends", async () => {
  (sendPlatformEmail as jest.Mock).mockResolvedValue({ success: false });
  expect(await (await POST(request("updates"))).json()).toMatchObject({ success: false, delivered: 0, failed: 1 });
});
