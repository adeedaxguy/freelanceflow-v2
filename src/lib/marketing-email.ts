import { createHmac, timingSafeEqual } from "crypto";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function secret(): string {
  return process.env.NEXTAUTH_SECRET || "";
}

export function createUnsubscribeToken(userId: string, email: string): string {
  const signature = createHmac("sha256", secret())
    .update(`${userId}:${email.toLowerCase()}`)
    .digest("base64url");
  return `${userId}.${signature}`;
}

export function verifyUnsubscribeToken(token: string, email: string): string | null {
  const separator = token.lastIndexOf(".");
  if (separator < 1 || !secret()) return null;
  const userId = token.slice(0, separator);
  const supplied = Buffer.from(token.slice(separator + 1));
  const expected = Buffer.from(createUnsubscribeToken(userId, email).slice(separator + 1));
  return supplied.length === expected.length && timingSafeEqual(supplied, expected) ? userId : null;
}

function messageHtml(message: string): string {
  return message.trim().split(/\n\s*\n/).map((block) => {
    const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
    if (lines.length && lines.every((line) => /^[•*-]\s+/.test(line))) {
      return `<ul style="margin:0 0 20px;padding-left:22px;color:#29263a;line-height:1.7">${lines
        .map((line) => `<li>${escapeHtml(line.replace(/^[•*-]\s+/, ""))}</li>`)
        .join("")}</ul>`;
    }
    return `<p style="margin:0 0 18px;color:#29263a;font-size:16px;line-height:1.65">${lines.map(escapeHtml).join("<br>")}</p>`;
  }).join("");
}

export function renderMarketingEmail(params: {
  name: string | null;
  userId: string;
  email: string;
  subject: string;
  message: string;
}) {
  const firstName = params.name?.trim().split(/\s+/)[0] || "there";
  const personalized = params.message.replaceAll("{name}", firstName);
  const token = createUnsubscribeToken(params.userId, params.email);
  const unsubscribeUrl = `https://icloseleads.com/api/email/unsubscribe?token=${encodeURIComponent(token)}`;
  const html = `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f3f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#171522">
  <div style="display:none;max-height:0;overflow:hidden">${escapeHtml(params.subject)}</div>
  <div style="padding:28px 14px">
    <div style="max-width:620px;margin:0 auto;background:#ffffff;border:1px solid #dedbe8;border-radius:14px;overflow:hidden">
      <div style="padding:22px 28px;border-bottom:1px solid #ece9f2">
        <strong style="font-size:20px;color:#171522">iClose<span style="color:#6d4aff">Leads</span></strong>
      </div>
      <div style="padding:30px 28px 12px">${messageHtml(personalized)}</div>
      <div style="padding:0 28px 30px">
        <a href="https://icloseleads.com/dashboard/local-leads" style="display:inline-block;background:#6842e8;color:#ffffff;text-decoration:none;font-weight:700;padding:12px 18px;border-radius:8px">Open iCloseLeads</a>
      </div>
      <div style="padding:20px 28px;background:#f8f7fb;border-top:1px solid #ece9f2;color:#716c80;font-size:12px;line-height:1.6">
        You received this because you opted in to iCloseLeads product emails.
        <a href="${unsubscribeUrl}" style="color:#5b3bc4">Unsubscribe</a> or update preferences in your dashboard settings.
      </div>
    </div>
  </div>
</body></html>`;
  const text = `${personalized}\n\nOpen iCloseLeads: https://icloseleads.com/dashboard/local-leads\n\nUnsubscribe: ${unsubscribeUrl}`;
  return { html, text, unsubscribeUrl };
}
