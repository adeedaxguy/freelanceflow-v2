import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { smtpSend } from "@/lib/smtp-client";

export const ADMIN_NOTIFICATION_RECIPIENT = "adnan.toprated@gmail.com";
const DEFAULT_ADMIN_NOTIFICATION_EMAIL = ADMIN_NOTIFICATION_RECIPIENT;

interface PlatformEmailConfig {
  provider: "resend" | "smtp";
  apiKey: string;
  fromEmail: string;
  host?: string;
  port?: number;
  secure?: boolean;
  user?: string;
  pass?: string;
}

async function getPlatformEmailConfig(): Promise<PlatformEmailConfig | null> {
  const envApiKey = process.env.RESEND_API_KEY?.trim();
  const envFromEmail = process.env.RESEND_FROM_EMAIL?.trim();

  if (envApiKey) {
    return {
      provider: "resend",
      apiKey: envApiKey,
      fromEmail: envFromEmail || "hello@icloseleads.com",
    };
  }

  const smtpHost = process.env.PLATFORM_SMTP_HOST?.trim();
  const smtpUser = process.env.PLATFORM_SMTP_USER?.trim();
  const smtpPass = process.env.PLATFORM_SMTP_PASS?.trim();
  const smtpFromEmail = process.env.PLATFORM_SMTP_FROM_EMAIL?.trim();
  if (smtpHost && smtpUser && smtpPass && smtpFromEmail) {
    const port = Number(process.env.PLATFORM_SMTP_PORT || 465);
    return {
      provider: "smtp",
      apiKey: "",
      fromEmail: smtpFromEmail,
      host: smtpHost,
      port: Number.isFinite(port) ? port : 465,
      secure: process.env.PLATFORM_SMTP_SECURE !== "false",
      user: smtpUser,
      pass: smtpPass,
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
      provider: "resend",
      apiKey: settings.resend_api_key,
      fromEmail: settings.resend_from_email || "hello@icloseleads.com",
    };
  } catch (error) {
    console.error("[admin-notification] Failed to read email settings", error);
    return null;
  }
}

export async function getPlatformEmailStatus() {
  const config = await getPlatformEmailConfig();
  return {
    configured: Boolean(config),
    provider: config?.provider ?? null,
    fromEmail: config?.fromEmail ?? "hello@icloseleads.com",
  };
}

export async function sendPlatformEmail(params: {
  recipient: string;
  subject: string;
  html: string;
  text: string;
  fromName?: string;
  headers?: Record<string, string>;
}) {
  const config = await getPlatformEmailConfig();
  if (!config) return { success: false as const, skipped: true as const };

  const fromName = params.fromName || "iCloseLeads";
  if (config.provider === "smtp") {
    await smtpSend({
      host: config.host!,
      port: config.port!,
      secure: config.secure!,
      user: config.user!,
      pass: config.pass!,
      fromEmail: config.fromEmail,
      fromName,
    }, params.recipient, params.subject, params.text, params.html);
    return { success: true as const, provider: "smtp" as const };
  }

  const client = new Resend(config.apiKey);
  const { data, error } = await client.emails.send({
    from: `${fromName} <${config.fromEmail}>`,
    to: [params.recipient],
    subject: params.subject,
    html: params.html,
    text: params.text,
    headers: params.headers,
  });
  if (error) throw new Error(error.message);
  return { success: true as const, provider: "resend" as const, id: data?.id };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function notificationHtml(title: string, lines: string[], label = "iCloseLeads Admin Alert"): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:24px;background:#090915;font-family:Inter,Arial,sans-serif;color:#f8f7ff;">
  <div style="max-width:620px;margin:0 auto;background:#111123;border:1px solid #292747;border-radius:18px;padding:28px;">
    <p style="margin:0 0 8px;color:#9f67ff;font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;">${escapeHtml(label)}</p>
    <h1 style="margin:0 0 20px;font-size:24px;line-height:1.25;">${escapeHtml(title)}</h1>
    <div style="background:#0b0b18;border:1px solid #272545;border-radius:14px;padding:18px;">
      ${lines.map((line) => `<p style="margin:0 0 12px;color:#c8c4dd;font-size:15px;line-height:1.55;">${line}</p>`).join("")}
    </div>
    <p style="margin:18px 0 0;color:#77718d;font-size:12px;">Sent automatically by icloseleads.com.</p>
  </div>
</body>
</html>`;
}

export async function sendAccountNotification(params: {
  recipient: string;
  subject: string;
  title: string;
  lines: string[];
}) {
  const text = params.lines.map((line) => line.replace(/<[^>]+>/g, "")).join("\n");
  return sendPlatformEmail({
    recipient: params.recipient,
    subject: params.subject,
    html: notificationHtml(params.title, params.lines, "iCloseLeads Account Update"),
    text,
  });
}

export async function sendAdminNotification(params: {
  subject: string;
  title: string;
  lines: string[];
  recipient?: string;
}) {
  const recipient = params.recipient || process.env.ADMIN_NOTIFICATION_EMAIL || DEFAULT_ADMIN_NOTIFICATION_EMAIL;
  const text = params.lines.map((line) => line.replace(/<[^>]+>/g, "")).join("\n");
  const result = await sendPlatformEmail({
    recipient,
    subject: params.subject,
    html: notificationHtml(params.title, params.lines),
    text,
  });
  if (!result.success) console.warn("[admin-notification] Email provider is not configured; skipped:", params.subject);
  return result;
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
