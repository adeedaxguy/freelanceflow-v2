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

export const WELCOME_EMAIL_SUBJECT = "Your iCloseLeads workspace is ready";

export function renderWelcomeEmail(params: { name: string | null }) {
  const firstName = params.name?.trim().split(/\s+/)[0] || "there";
  const safeFirstName = escapeHtml(firstName);
  const dashboardUrl = "https://icloseleads.com/dashboard/local-leads";
  const remoteJobsUrl = "https://icloseleads.com/dashboard/leads";
  const liveJobsUrl = "https://icloseleads.com/dashboard/live-jobs";
  const settingsUrl = "https://icloseleads.com/dashboard/settings";
  const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <style>
    @media only screen and (max-width:600px) {
      .email-shell { width:100% !important; }
      .mobile-pad { padding-left:20px !important; padding-right:20px !important; }
      .mobile-title { font-size:30px !important; line-height:1.12 !important; }
      .mobile-stack { display:block !important; width:100% !important; }
      .mobile-gap { display:block !important; height:10px !important; width:100% !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background:#eef1f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;color:#17181d">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0">Find a qualified lead, build the pitch, and follow through from one workspace.&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#eef1f6">
    <tr><td align="center" style="padding:32px 12px">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" class="email-shell" style="max-width:660px;background:#ffffff;border:1px solid #dfe3ec;border-radius:12px;overflow:hidden">
        <tr>
          <td height="5" width="25%" style="height:5px;background:#6d4aff;font-size:0;line-height:0">&nbsp;</td>
          <td height="5" width="25%" style="height:5px;background:#2f80ed;font-size:0;line-height:0">&nbsp;</td>
          <td height="5" width="25%" style="height:5px;background:#16bfa5;font-size:0;line-height:0">&nbsp;</td>
          <td height="5" width="25%" style="height:5px;background:#a3e635;font-size:0;line-height:0">&nbsp;</td>
        </tr>
        <tr><td colspan="4" class="mobile-pad" style="padding:24px 34px;background:#10111c">
          <img src="https://icloseleads.com/brand/icloseleads-email-logo.png" width="190" height="46" alt="iCloseLeads" style="display:block;width:190px;height:auto;border:0;outline:none;text-decoration:none">
        </td></tr>
        <tr><td colspan="4" class="mobile-pad" style="padding:18px 34px 34px;background:#10111c">
          <h1 class="mobile-title" style="margin:0;max-width:560px;color:#ffffff;font-size:38px;line-height:1.1;letter-spacing:0;font-weight:800">Turn one good lead into your next client.</h1>
          <p style="margin:18px 0 0;max-width:560px;color:#c9ccda;font-size:16px;line-height:1.65">Hi ${safeFirstName}, your iCloseLeads workspace is ready. Your 3-day trial includes up to 600 lead results and the complete workflow for turning an opportunity into a focused outreach plan.</p>
        </td></tr>
        <tr><td colspan="4" class="mobile-pad" style="padding:0 34px 30px;background:#10111c">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
            <tr>
              <td class="mobile-stack" width="32%" style="padding:14px;background:#191b29;border:1px solid #2d3042;border-radius:8px">
                <strong style="display:block;color:#ffffff;font-size:19px;line-height:1.2">3 paths</strong>
                <span style="display:block;margin-top:4px;color:#aeb3c7;font-size:12px;line-height:1.4">Local, remote, live</span>
              </td>
              <td class="mobile-gap" width="2%">&nbsp;</td>
              <td class="mobile-stack" width="32%" style="padding:14px;background:#191b29;border:1px solid #2d3042;border-radius:8px">
                <strong style="display:block;color:#ffffff;font-size:19px;line-height:1.2">600</strong>
                <span style="display:block;margin-top:4px;color:#aeb3c7;font-size:12px;line-height:1.4">Trial lead results</span>
              </td>
              <td class="mobile-gap" width="2%">&nbsp;</td>
              <td class="mobile-stack" width="32%" style="padding:14px;background:#191b29;border:1px solid #2d3042;border-radius:8px">
                <strong style="display:block;color:#a3e635;font-size:19px;line-height:1.2">$0</strong>
                <span style="display:block;margin-top:4px;color:#aeb3c7;font-size:12px;line-height:1.4">No card to start</span>
              </td>
            </tr>
          </table>
        </td></tr>
        <tr><td colspan="4" class="mobile-pad" style="padding:28px 34px 0">
          <img src="https://icloseleads.com/brand/client-acquisition-workflow.png" width="592" height="158" alt="The iCloseLeads client acquisition workflow" style="display:block;width:100%;max-width:592px;height:auto;border:0;border-radius:8px;outline:none;text-decoration:none">
        </td></tr>
        <tr><td colspan="4" class="mobile-pad" style="padding:34px 34px 10px">
          <h2 style="margin:0;color:#17181d;font-size:24px;line-height:1.25;letter-spacing:0">Your first client-winning loop</h2>
          <p style="margin:10px 0 24px;color:#626979;font-size:15px;line-height:1.65">Start with one niche and one location. You can complete this flow in about 15 minutes.</p>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
            <tr>
              <td width="38" valign="top" style="padding:0 0 20px"><div style="width:30px;height:30px;line-height:30px;text-align:center;border-radius:8px;background:#eeeaff;color:#5235b8;font-size:13px;font-weight:800">1</div></td>
              <td valign="top" style="padding:2px 0 20px"><strong style="display:block;color:#20212a;font-size:15px">Discover a real opportunity</strong><span style="display:block;margin-top:5px;color:#626979;font-size:14px;line-height:1.55">Search local businesses, current remote roles, or live job signals. Save three prospects that match your service.</span></td>
            </tr>
            <tr>
              <td width="38" valign="top" style="padding:0 0 20px"><div style="width:30px;height:30px;line-height:30px;text-align:center;border-radius:8px;background:#e7f8f4;color:#087c69;font-size:13px;font-weight:800">2</div></td>
              <td valign="top" style="padding:2px 0 20px"><strong style="display:block;color:#20212a;font-size:15px">Qualify before you pitch</strong><span style="display:block;margin-top:5px;color:#626979;font-size:14px;line-height:1.55">Review contact signals, website gaps, business context, and the likely decision-maker path. Keep only leads you can help.</span></td>
            </tr>
            <tr>
              <td width="38" valign="top" style="padding:0 0 20px"><div style="width:30px;height:30px;line-height:30px;text-align:center;border-radius:8px;background:#e9f2ff;color:#1f63b7;font-size:13px;font-weight:800">3</div></td>
              <td valign="top" style="padding:2px 0 20px"><strong style="display:block;color:#20212a;font-size:15px">Create something specific</strong><span style="display:block;margin-top:5px;color:#626979;font-size:14px;line-height:1.55">Draft a tailored proposal, generate the right pitch angle, or build a website concept that makes the opportunity tangible.</span></td>
            </tr>
            <tr>
              <td width="38" valign="top" style="padding:0"><div style="width:30px;height:30px;line-height:30px;text-align:center;border-radius:8px;background:#f3f8df;color:#657e13;font-size:13px;font-weight:800">4</div></td>
              <td valign="top" style="padding:2px 0"><strong style="display:block;color:#20212a;font-size:15px">Reach out and keep momentum</strong><span style="display:block;margin-top:5px;color:#626979;font-size:14px;line-height:1.55">Send through your connected email, use optional softphone number and minute add-ons, then track the follow-up in your CRM pipeline.</span></td>
            </tr>
          </table>
        </td></tr>
        <tr><td colspan="4" class="mobile-pad" style="padding:30px 34px">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f5f3ff;border:1px solid #ded8ff;border-radius:8px">
            <tr><td style="padding:24px">
              <h2 style="margin:0;color:#17181d;font-size:20px;line-height:1.3;letter-spacing:0">Make the first search count</h2>
              <p style="margin:9px 0 20px;color:#5d6271;font-size:14px;line-height:1.6">Choose a service you already sell and a city you understand. Find one business with a clear gap, save it, and build the pitch while the context is fresh.</p>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0"><tr><td style="border-radius:8px;background:#5b3de1"><a href="${dashboardUrl}" style="display:inline-block;padding:14px 21px;color:#ffffff;text-decoration:none;font-size:15px;font-weight:800">Find your first lead &rarr;</a></td></tr></table>
            </td></tr>
          </table>
        </td></tr>
        <tr><td colspan="4" class="mobile-pad" style="padding:0 34px 34px">
          <p style="margin:0 0 10px;color:#30313a;font-size:13px;font-weight:800">Other places to start</p>
          <p style="margin:0;color:#626979;font-size:14px;line-height:1.8"><a href="${remoteJobsUrl}" style="color:#4930bd;font-weight:700;text-decoration:underline">Browse remote jobs</a>&nbsp;&nbsp;&middot;&nbsp;&nbsp;<a href="${liveJobsUrl}" style="color:#4930bd;font-weight:700;text-decoration:underline">See live opportunities</a>&nbsp;&nbsp;&middot;&nbsp;&nbsp;<a href="https://icloseleads.com/dashboard/softphone" style="color:#4930bd;font-weight:700;text-decoration:underline">Set up calling</a></p>
        </td></tr>
        <tr><td colspan="4" class="mobile-pad" style="padding:22px 34px;background:#f7f8fb;border-top:1px solid #e2e5ed;color:#697080;font-size:12px;line-height:1.65">
          <strong style="color:#30313a">iCloseLeads</strong> &middot; One workspace from lead signal to follow-up<br>
          This one-time onboarding email was sent because you created an iCloseLeads account. Manage account email options in <a href="${settingsUrl}" style="color:#4930bd">Settings</a>.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
  const text = `Hi ${firstName},

Your iCloseLeads workspace is ready. Your 3-day trial includes up to 600 lead results.

Your first client-winning loop:
1. Discover a real opportunity in Local Business Leads, Remote Jobs, or Live Jobs.
2. Qualify it with contact signals, website gaps, business context, and the decision-maker path.
3. Create a tailored proposal, pitch angle, or website concept.
4. Reach out through your connected email or optional softphone add-ons, then track the follow-up in your CRM.

Find your first lead: ${dashboardUrl}
Browse remote jobs: ${remoteJobsUrl}
See live opportunities: ${liveJobsUrl}

This one-time onboarding email was sent because you created an iCloseLeads account.
Manage account email options: ${settingsUrl}`;

  return { subject: WELCOME_EMAIL_SUBJECT, html, text };
}
