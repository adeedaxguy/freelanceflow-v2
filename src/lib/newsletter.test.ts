/** @jest-environment node */
jest.mock("@/lib/prisma", () => ({ prisma: { $executeRawUnsafe: jest.fn(async () => 1), $queryRawUnsafe: jest.fn() } }));
import { prisma } from "@/lib/prisma";
import { confirmNewsletter, newsletterRecipients, newsletterUnsubscribeUrl, requestNewsletterConfirmation, unsubscribeNewsletter } from "./newsletter";
const query = prisma.$queryRawUnsafe as jest.Mock;
const write = prisma.$executeRawUnsafe as jest.Mock;
beforeEach(() => { jest.clearAllMocks(); process.env.NEXTAUTH_SECRET = "newsletter-test-only"; });

it("stores a hash, expiry, and separate topic, never the raw confirmation token", async () => {
  query.mockResolvedValue([{ id: "subscriber-1", email: "reader@example.com", topic: "status" }]);
  const result = await requestNewsletterConfirmation("Reader@Example.com", "status");
  const args = query.mock.calls[0];
  expect(args[2]).toBe("reader@example.com");
  expect(args[3]).toBe("status");
  expect(args[4]).toMatch(/^[a-f0-9]{64}$/);
  expect(args[4]).not.toBe(result?.token);
  expect(args[5]).toBeInstanceOf(Date);
  expect(args[0]).toContain('ON CONFLICT ("email", "topic")');
});
it("does not send another confirmation for an active subscription", async () => {
  query.mockResolvedValue([]);
  expect(await requestNewsletterConfirmation("reader@example.com", "updates")).toBeNull();
  expect(query.mock.calls[0][0]).toContain('"confirmedAt" IS NULL OR');
});
it("rejects invalid and expired confirmations, and consumes valid ones once", async () => {
  expect(await confirmNewsletter("<invalid>")).toBe(false);
  expect(query).not.toHaveBeenCalled();
  query.mockResolvedValueOnce([{ id: "subscriber-1" }]).mockResolvedValueOnce([]);
  expect(await confirmNewsletter("a".repeat(64))).toBe(true);
  expect(await confirmNewsletter("a".repeat(64))).toBe(false);
  expect(query.mock.calls[0][0]).toContain('"expiresAt" > CURRENT_TIMESTAMP');
  expect(query.mock.calls[0][0]).toContain('"tokenHash" = NULL');
});
it("selects only confirmed, active subscribers to the requested topic", async () => {
  query.mockResolvedValue([]);
  await newsletterRecipients("status", 200);
  expect(query).toHaveBeenCalledWith(expect.stringContaining('"confirmedAt" IS NOT NULL AND "unsubscribedAt" IS NULL'), "status", 200);
});
it("binds unsubscribe to one subscriber and rejects forged tokens", async () => {
  const subscriber = { id: "subscriber-1", email: "reader@example.com", topic: "status" as const };
  const token = new URL(newsletterUnsubscribeUrl(subscriber)).searchParams.get("token")!;
  query.mockResolvedValue([subscriber]);
  expect(await unsubscribeNewsletter(token + "x")).toBe(false);
  write.mockClear();
  expect(await unsubscribeNewsletter(token)).toBe(true);
  expect(write).toHaveBeenCalledWith(expect.stringContaining('"unsubscribedAt" = CURRENT_TIMESTAMP'), "subscriber-1");
});
