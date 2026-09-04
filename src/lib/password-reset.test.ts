import { createPasswordResetToken, renderPasswordResetEmail, verifyPasswordResetToken } from "@/lib/password-reset";

describe("password reset tokens", () => {
  beforeEach(() => { process.env.PASSWORD_RESET_SECRET = "test-reset-secret"; });
  afterAll(() => { delete process.env.PASSWORD_RESET_SECRET; });

  it("creates a one-hour token tied to the account version", () => {
    const now = Date.UTC(2026, 8, 4, 12);
    const user = { id: "oauth-user", updatedAt: new Date(now - 5000) };
    const token = createPasswordResetToken(user, now);

    expect(verifyPasswordResetToken(token, now + 59 * 60 * 1000)).toEqual({
      userId: user.id,
      version: user.updatedAt.getTime(),
      expiresAt: now + 60 * 60 * 1000,
    });
    expect(verifyPasswordResetToken(token, now + 60 * 60 * 1000)).toBeNull();
    expect(verifyPasswordResetToken(`${token}x`, now)).toBeNull();
  });

  it("renders a branded reset email with OAuth guidance", () => {
    const rendered = renderPasswordResetEmail("https://icloseleads.com/auth/reset-password?token=test");
    expect(rendered.subject).toBe("Reset your iCloseLeads password");
    expect(rendered.html).toContain("icloseleads-email-logo.png");
    expect(rendered.html).toContain("Google or GitHub");
    expect(rendered.text).toContain("within one hour");
  });
});
