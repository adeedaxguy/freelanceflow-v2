import { createHmac, timingSafeEqual } from "crypto";

const RESET_WINDOW_MS = 60 * 60 * 1000;

type ResetPayload = {
  userId: string;
  version: number;
  expiresAt: number;
};

function secret() {
  const value = process.env.PASSWORD_RESET_SECRET || process.env.NEXTAUTH_SECRET;
  if (!value) throw new Error("Password reset secret is not configured.");
  return value;
}

function signature(value: string) {
  return createHmac("sha256", secret()).update(`password-reset:${value}`).digest("base64url");
}

export function createPasswordResetToken(user: { id: string; updatedAt: Date }, now = Date.now()) {
  const payload: ResetPayload = {
    userId: user.id,
    version: user.updatedAt.getTime(),
    expiresAt: now + RESET_WINDOW_MS,
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encoded}.${signature(encoded)}`;
}

export function verifyPasswordResetToken(token: string, now = Date.now()): ResetPayload | null {
  const [encoded, supplied, extra] = token.split(".");
  if (!encoded || !supplied || extra || token.length > 2048) return null;

  const expected = signature(encoded);
  const suppliedBuffer = Buffer.from(supplied);
  const expectedBuffer = Buffer.from(expected);
  if (suppliedBuffer.length !== expectedBuffer.length || !timingSafeEqual(suppliedBuffer, expectedBuffer)) return null;

  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as Partial<ResetPayload>;
    if (
      typeof payload.userId !== "string" || !payload.userId || payload.userId.length > 128 ||
      typeof payload.version !== "number" || !Number.isSafeInteger(payload.version) ||
      typeof payload.expiresAt !== "number" || !Number.isSafeInteger(payload.expiresAt) ||
      payload.expiresAt <= now
    ) return null;
    return payload as ResetPayload;
  } catch {
    return null;
  }
}

export function renderPasswordResetEmail(resetUrl: string) {
  const subject = "Reset your iCloseLeads password";
  const html = `<!doctype html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#eef1f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;color:#17181d">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#eef1f6">
    <tr><td align="center" style="padding:32px 12px">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;background:#ffffff;border:1px solid #dfe3ec;border-radius:12px;overflow:hidden">
        <tr><td style="height:5px;background:#5b3de1;font-size:0;line-height:0">&nbsp;</td></tr>
        <tr><td style="padding:24px 32px;background:#10111c">
          <img src="https://icloseleads.com/brand/icloseleads-email-logo.png" width="190" height="46" alt="iCloseLeads" style="display:block;width:190px;height:auto;border:0">
        </td></tr>
        <tr><td style="padding:32px">
          <h1 style="margin:0;color:#17181d;font-size:28px;line-height:1.2;letter-spacing:0">Choose a new password</h1>
          <p style="margin:16px 0 0;color:#626979;font-size:15px;line-height:1.65">We received a request to reset your iCloseLeads password. This secure link expires in one hour and can only be used once.</p>
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin-top:24px"><tr><td style="border-radius:8px;background:#5b3de1"><a href="${resetUrl}" style="display:inline-block;padding:14px 20px;color:#ffffff;text-decoration:none;font-size:15px;font-weight:800">Reset password</a></td></tr></table>
          <p style="margin:24px 0 0;color:#626979;font-size:13px;line-height:1.6">Joined with Google or GitHub? Setting a password lets you also sign in with your email address. Your original sign-in method will keep working.</p>
          <p style="margin:18px 0 0;color:#7a8090;font-size:12px;line-height:1.6">If you did not request this, you can ignore this email. Your account will remain unchanged.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
  const text = `Reset your iCloseLeads password\n\nOpen this link within one hour: ${resetUrl}\n\nIf you joined with Google or GitHub, setting a password lets you also sign in with your email address. Your original sign-in method will keep working.\n\nIf you did not request this, ignore this email.`;
  return { subject, html, text };
}
