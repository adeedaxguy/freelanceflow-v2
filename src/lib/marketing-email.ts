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
    const firstLine = lines[0];
    const ownUrl = firstLine && /^https:\/\/icloseleads\.com\/[^\s]+$/.test(firstLine)
      ? firstLine
      : null;
    if (ownUrl) {
      const label = ownUrl.includes("600-free-leads")
        ? "Read the 600-lead weekly playbook"
        : "Open this iCloseLeads page";
      return `<p style="margin:0 0 22px"><a href="${escapeHtml(ownUrl)}" style="color:#5235b8;font-size:15px;font-weight:700;text-decoration:underline;text-underline-offset:3px">${label} &rarr;</a></p>`;
    }
    if (lines.length && lines.every((line) => /^[•*-]\s+/.test(line))) {
      return `<ul style="margin:0 0 22px;padding-left:22px;color:#30313a;font-size:15px;line-height:1.7">${lines
        .map((line) => `<li>${escapeHtml(line.replace(/^[•*-]\s+/, ""))}</li>`)
        .join("")}</ul>`;
    }
    if (lines.length && lines.every((line) => /^\d+\.\s+/.test(line))) {
      return `<ol style="margin:0 0 22px;padding-left:22px;color:#30313a;font-size:15px;line-height:1.7">${lines
        .map((line) => `<li>${escapeHtml(line.replace(/^\d+\.\s+/, ""))}</li>`)
        .join("")}</ol>`;
    }
    return `<p style="margin:0 0 18px;color:#30313a;font-size:15px;line-height:1.7">${lines.map(escapeHtml).join("<br>")}</p>`;
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
  const subject = params.subject.replaceAll("{name}", firstName);
  const html = `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#eef0f3;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;color:#17181d">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(subject)}&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#eef0f3">
    <tr><td align="center" style="padding:32px 14px">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;background:#ffffff;border:1px solid #dfe2e7;border-radius:12px;overflow:hidden">
        <tr><td style="padding:22px 28px;border-bottom:1px solid #e7e9ed">
          <strong style="font-size:19px;letter-spacing:-.2px;color:#17181d">iClose<span style="color:#6547d8">Leads</span></strong>
        </td></tr>
        <tr><td style="padding:32px 28px 8px">
          <p style="margin:0 0 12px;color:#6547d8;font-size:11px;font-weight:800;letter-spacing:1.3px;text-transform:uppercase">Product update</p>
          <h1 style="margin:0;color:#17181d;font-size:27px;line-height:1.2;letter-spacing:-.5px">${escapeHtml(subject)}</h1>
        </td></tr>
        <tr><td style="padding:20px 28px 8px">${messageHtml(personalized)}</td></tr>
        <tr><td style="padding:4px 28px 34px">
          <a href="https://icloseleads.com/dashboard/local-leads" style="display:inline-block;background:#17181d;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:13px 18px;border-radius:7px">Run a focused lead search</a>
        </td></tr>
        <tr><td style="padding:20px 28px;background:#f7f8fa;border-top:1px solid #e7e9ed;color:#6d707a;font-size:12px;line-height:1.65">
          <strong style="color:#30313a">iCloseLeads</strong> &middot; Client acquisition software<br>
          You received this because you opted in to iCloseLeads product emails.
          <a href="${unsubscribeUrl}" style="color:#5235b8">Unsubscribe</a> or update your email preferences in Settings.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
  const text = `${personalized}\n\nRun a focused lead search: https://icloseleads.com/dashboard/local-leads\n\nUnsubscribe: ${unsubscribeUrl}`;
  return { html, text, unsubscribeUrl };
}
