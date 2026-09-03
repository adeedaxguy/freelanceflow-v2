const mockResendSend = jest.fn();

jest.mock("resend", () => ({
  Resend: jest.fn(() => ({ emails: { send: mockResendSend } })),
}));
jest.mock("@/lib/smtp-client", () => ({ smtpSend: jest.fn() }));
jest.mock("@/lib/prisma", () => ({
  prisma: {
    platformSetting: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));

import { prisma } from "@/lib/prisma";
import {
  notifyNewUserSignup,
  sendWelcomeEmail,
  WELCOME_EMAIL_KEY_PREFIX,
} from "@/lib/admin-notifications";

describe("welcome email delivery", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.RESEND_API_KEY = "re_test_key";
    process.env.RESEND_FROM_EMAIL = "hello@icloseleads.com";
    (prisma.platformSetting.create as jest.Mock).mockResolvedValue({});
    (prisma.platformSetting.update as jest.Mock).mockResolvedValue({});
    mockResendSend.mockResolvedValue({ data: { id: "email_123" }, error: null });
  });

  afterAll(() => {
    delete process.env.RESEND_API_KEY;
    delete process.env.RESEND_FROM_EMAIL;
  });

  it("sends and records a personalized welcome email", async () => {
    const result = await sendWelcomeEmail({ id: "user-1", name: "Alex Rivera", email: "alex@example.com" });

    expect(result).toEqual(expect.objectContaining({ success: true, skipped: false, id: "email_123" }));
    expect(prisma.platformSetting.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ key: `${WELCOME_EMAIL_KEY_PREFIX}user-1` }),
    });
    expect(mockResendSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: ["alex@example.com"],
        subject: "Your iCloseLeads workspace is ready",
        html: expect.stringContaining("Hi Alex"),
      }),
      { idempotencyKey: `${WELCOME_EMAIL_KEY_PREFIX}user-1` },
    );
    expect(prisma.platformSetting.update).toHaveBeenLastCalledWith(expect.objectContaining({
      where: { key: `${WELCOME_EMAIL_KEY_PREFIX}user-1` },
      data: { value: expect.stringContaining('"status":"sent"') },
    }));
  });

  it("skips a welcome email that was already sent", async () => {
    (prisma.platformSetting.create as jest.Mock).mockRejectedValue(new Error("duplicate key"));
    (prisma.platformSetting.findUnique as jest.Mock).mockResolvedValue({
      id: "setting-1",
      key: `${WELCOME_EMAIL_KEY_PREFIX}user-1`,
      value: JSON.stringify({ status: "sent" }),
      updatedAt: new Date(),
    });

    const result = await sendWelcomeEmail({ id: "user-1", name: "Alex", email: "alex@example.com" });

    expect(result).toEqual({ success: true, skipped: true });
    expect(mockResendSend).not.toHaveBeenCalled();
  });

  it("sends the welcome email from the shared new-user notifier", async () => {
    await notifyNewUserSignup({
      id: "user-2",
      name: "Sam Lee",
      email: "sam@example.com",
      plan: "free",
    });

    expect(mockResendSend).toHaveBeenCalledTimes(2);
    expect(mockResendSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: ["sam@example.com"],
        subject: "Your iCloseLeads workspace is ready",
      }),
      { idempotencyKey: `${WELCOME_EMAIL_KEY_PREFIX}user-2` },
    );
  });
});
