import { Resend } from "resend";
import { prisma } from "@/lib/prisma";

export const ADMIN_NOTIFICATION_RECIPIENT = "adnan.toprated@gmail.com";
const DEFAULT_ADMIN_NOTIFICATION_EMAIL = ADMIN_NOTIFICATION_RECIPIENT;

interface PlatformEmailConfig {
  apiKey: string;
  fromEmail: string;
}

async function getPlatformEmailConfig(): Promise<PlatformEmailConfig | null> {
  const envApiKey = process.env.RESEND_API_KEY?.trim();
  const envFromEmail = process.env.RESEND_FROM_EMAIL?.trim();

  if (envApiKey) {
    return {
      apiKey: envApiKey,
      fromEmail: envFromEmail || "hello@icloseleads.com",
    };
  }

  try {
    const rows = await prisma.platformSetting.findMany({
      where: { key: { in: ["resend_api_key", "resend_from_email"] } },
      select: { key: true, value: true },
    });
    const settings = Object.fromEntries(rows.map((row) => [row.key, row.value?.trim() ?? ""]));
    if (!settings.resend_api_key) return null;

    return {
      apiKey: settings.resend_api_key,
      fromEmail: settings.resend_from_email || "hello@icloseleads.com",
    };
  } catch (error) {
    console.error("[admin-notification] Failed to read email settings", error);
    return null;
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function notificationHtml(title: string, lines: string[]): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:24px;background:#090915;font-family:Inter,Arial,sans-serif;color:#f8f7ff;">
  <div style="max-width:620px;margin:0 auto;background:#111123;border:1px solid #292747;border-radius:18px;padding:28px;">
    <p style="margin:0 0 8px;color:#9f67ff;font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;">iCloseLeads Admin Alert</p>
    <h1 style="margin:0 0 20px;font-size:24px;line-height:1.25;">${escapeHtml(title)}</h1>
    <div style="background:#0b0b18;border:1px solid #272545;border-radius:14px;padding:18px;">
      ${lines.map((line) => `<p style="margin:0 0 12px;color:#c8c4dd;font-size:15px;line-height:1.55;">${line}</p>`).join("")}
    </div>
    <p style="margin:18px 0 0;color:#77718d;font-size:12px;">Sent automatically by icloseleads.com.</p>
  </div>
</body>
</html>`;
}

export async function sendAdminNotification(params: {
  subject: string;
  title: string;
  lines: string[];
  recipient?: string;
}) {
  const config = await getPlatformEmailConfig();
  if (!config) {
    console.warn("[admin-notification] Resend is not configured; skipped:", params.subject);
    return { success: false, skipped: true };
  }

  const recipient = params.recipient || process.env.ADMIN_NOTIFICATION_EMAIL || DEFAULT_ADMIN_NOTIFICATION_EMAIL;
  const client = new Resend(config.apiKey);
  const text = params.lines.map((line) => line.replace(/<[^>]+>/g, "")).join("\n");

  const { data, error } = await client.emails.send({
    from: `iCloseLeads <${config.fromEmail}>`,
    to: [recipient],
    subject: params.subject,
    html: notificationHtml(params.title, params.lines),
    text,
  });

  if (error) throw new Error(error.message);
  return { success: true, id: data?.id };
}

export async function notifyNewUserSignup(user: {
  id: string;
  name: string | null;
  email: string;
  plan?: string | null;
  expertise?: string[];
  referralSource?: string | null;
}) {
  const expertise = user.expertise?.length ? user.expertise.join(", ") : "Not provided";
  const referralSource = user.referralSource?.trim() || "Not provided";

  return sendAdminNotification({
    subject: `New iCloseLeads signup: ${user.email}`,
    title: "New user signed up",
    lines: [
      `<strong>Name:</strong> ${escapeHtml(user.name || "Not provided")}`,
      `<strong>Email:</strong> ${escapeHtml(user.email)}`,
      `<strong>Plan:</strong> ${escapeHtml(user.plan || "free")}`,
      `<strong>Expertise:</strong> ${escapeHtml(expertise)}`,
      `<strong>Referral source:</strong> ${escapeHtml(referralSource)}`,
      `<strong>User ID:</strong> ${escapeHtml(user.id)}`,
    ],
    recipient: ADMIN_NOTIFICATION_RECIPIENT,
  });
}

export async function notifyMoreLeadsRequest(request: {
  userId: string;
  name: string | null;
  email: string;
  plan: string | null;
  source: string;
  message?: string | null;
  weeklyLeads?: number | null;
  bonusLeads?: number | null;
  claimSummary?: string[];
}) {
  const claimSummary = request.claimSummary?.length ? request.claimSummary.join(", ") : "No claim metadata found";
  const message = request.message?.trim() || "No extra message provided";

  return sendAdminNotification({
    subject: `More leads requested: ${request.email}`,
    title: "Free user requested more leads",
    lines: [
      `<strong>Name:</strong> ${escapeHtml(request.name || "Not provided")}`,
      `<strong>Email:</strong> ${escapeHtml(request.email)}`,
      `<strong>Plan:</strong> ${escapeHtml(request.plan || "free")}`,
      `<strong>Lead tool:</strong> ${escapeHtml(request.source)}`,
      `<strong>Used leads:</strong> ${escapeHtml(String(request.weeklyLeads ?? 0))}`,
      `<strong>Bonus leads:</strong> ${escapeHtml(String(request.bonusLeads ?? 0))}`,
      `<strong>Bonus claims:</strong> ${escapeHtml(claimSummary)}`,
      `<strong>Message:</strong> ${escapeHtml(message)}`,
      `<strong>User ID:</strong> ${escapeHtml(request.userId)}`,
    ],
    recipient: ADMIN_NOTIFICATION_RECIPIENT,
  });
}
