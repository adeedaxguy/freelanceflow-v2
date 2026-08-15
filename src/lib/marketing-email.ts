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
  const loginUrl = "https://icloseleads.com/auth";
  const localLeadsUrl = "https://icloseleads.com/dashboard/local-leads";
  const html = `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f3f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;color:#17181d">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(subject)}&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f1f3f8">
    <tr><td align="center" style="padding:36px 14px">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:640px;background:#ffffff;border:1px solid #dfe3ec;border-radius:14px;overflow:hidden">
        <tr>
          <td height="6" width="25%" style="height:6px;background:#6d4aff;font-size:0;line-height:0">&nbsp;</td>
          <td height="6" width="25%" style="height:6px;background:#2f80ed;font-size:0;line-height:0">&nbsp;</td>
          <td height="6" width="25%" style="height:6px;background:#16bfa5;font-size:0;line-height:0">&nbsp;</td>
          <td height="6" width="25%" style="height:6px;background:#a3e635;font-size:0;line-height:0">&nbsp;</td>
        </tr>
        <tr><td colspan="4" style="padding:22px 30px;background:#111329">
          <img src="https://icloseleads.com/brand/icloseleads-email-logo.png" width="190" height="46" alt="iCloseLeads" style="display:block;width:190px;height:auto;border:0;outline:none;text-decoration:none">
        </td></tr>
        <tr><td colspan="4" style="padding:34px 30px 28px;background:#f0edff;border-bottom:1px solid #dfd9ff">
          <p style="margin:0 0 11px;color:#5b3de1;font-size:11px;font-weight:800;letter-spacing:1.3px;text-transform:uppercase">Product update</p>
          <h1 style="margin:0;max-width:540px;color:#17181d;font-size:29px;line-height:1.18;letter-spacing:-.55px">${escapeHtml(subject)}</h1>
        </td></tr>
        <tr><td colspan="4" style="padding:26px 30px 6px">
          <img src="https://icloseleads.com/brand/client-acquisition-workflow.png" width="580" height="155" alt="Find, qualify, contact, and follow up in one iCloseLeads workflow" style="display:block;width:100%;max-width:580px;height:auto;border:0;border-radius:12px;outline:none;text-decoration:none">
        </td></tr>
        <tr><td colspan="4" style="padding:22px 30px 8px">${messageHtml(personalized)}</td></tr>
        <tr><td colspan="4" style="padding:6px 30px 36px">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0">
            <tr>
              <td style="border-radius:8px;background:#5b3de1"><a href="${loginUrl}" style="display:inline-block;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 20px">Log in to your workspace</a></td>
              <td width="16" style="width:16px">&nbsp;</td>
              <td><a href="${localLeadsUrl}" style="color:#4930bd;text-decoration:underline;text-underline-offset:3px;font-size:14px;font-weight:700">Find local business leads &rarr;</a></td>
            </tr>
          </table>
        </td></tr>
        <tr><td colspan="4" style="padding:21px 30px;background:#f7f8fb;border-top:1px solid #e2e5ed;color:#697080;font-size:12px;line-height:1.65">
          <strong style="color:#30313a">iCloseLeads</strong> &middot; Client acquisition software<br>
          You received this because you opted in to iCloseLeads product emails.
          <a href="${unsubscribeUrl}" style="color:#4930bd">Unsubscribe</a> or update your email preferences in Settings.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
  const text = `${personalized}\n\nLog in to your workspace: ${loginUrl}\nFind local business leads: ${localLeadsUrl}\n\nUnsubscribe: ${unsubscribeUrl}`;
  return { html, text, unsubscribeUrl };
}
