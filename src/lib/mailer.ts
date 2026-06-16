/**
 * Unified mailer — checks user SMTP config first, then falls back to Resend.
 * Call sendMail() from API routes instead of importing resend.ts directly.
 */

import { prisma } from "@/lib/prisma";
import { smtpSend, type SmtpConfig } from "@/lib/smtp-client";
import { Resend } from "resend";

export interface MailOptions {
  to: string;
  subject: string;
  text: string;
  /** Provide if you want rich HTML; otherwise text is converted automatically */
  html?: string;
  fromName?: string;
}

export interface MailResult {
  success: boolean;
  provider: "smtp" | "resend" | "error";
  id?: string;
  error?: string;
}

// ─── SMTP config retrieval ────────────────────────────────────────────────────

export interface UserSmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  fromEmail: string;
  fromName: string;
}

export async function getUserSmtpConfig(userId: string): Promise<UserSmtpConfig | null> {
  try {
    const row = await prisma.platformSetting.findUnique({
      where: { key: `smtp_${userId}` },
    });
    if (!row?.value) return null;
    const cfg = JSON.parse(row.value) as UserSmtpConfig;
    if (!cfg.host || !cfg.user || !cfg.pass || !cfg.fromEmail) return null;
    return cfg;
  } catch {
    return null;
  }
}

export async function saveUserSmtpConfig(userId: string, cfg: UserSmtpConfig): Promise<void> {
  await prisma.platformSetting.upsert({
    where: { key: `smtp_${userId}` },
    update: { value: JSON.stringify(cfg) },
    create: { key: `smtp_${userId}`, value: JSON.stringify(cfg) },
  });
}

export async function deleteUserSmtpConfig(userId: string): Promise<void> {
  await prisma.platformSetting.deleteMany({ where: { key: `smtp_${userId}` } }).catch(() => null);
}

// ─── HTML conversion ──────────────────────────────────────────────────────────

function textToHtml(text: string): string {
  const esc = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  const paragraphs = esc
    .split("\n\n")
    .map((p) => `<p style="margin:0 0 16px;line-height:1.6">${p.replace(/\n/g, "<br>")}</p>`)
    .join("");
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="font-family:Inter,system-ui,sans-serif;background:#f9f9f9;margin:0;padding:20px">
  <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;padding:32px;box-shadow:0 2px 8px rgba(0,0,0,0.08)">
    ${paragraphs}
    <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
    <p style="color:#888;font-size:12px;margin:0">Sent via iCloseLeads</p>
  </div>
</body></html>`;
}

// ─── Main send function ───────────────────────────────────────────────────────

export async function sendMail(userId: string, opts: MailOptions): Promise<MailResult> {
  const html = opts.html ?? textToHtml(opts.text);

  // 1. Try user's SMTP config
  const smtpCfg = await getUserSmtpConfig(userId);
  if (smtpCfg) {
    try {
      const cfg: SmtpConfig = {
        host: smtpCfg.host,
        port: smtpCfg.port,
        secure: smtpCfg.secure,
        user: smtpCfg.user,
        pass: smtpCfg.pass,
        fromEmail: smtpCfg.fromEmail,
        fromName: opts.fromName ?? smtpCfg.fromName,
      };
      await smtpSend(cfg, opts.to, opts.subject, opts.text, html);
      return { success: true, provider: "smtp" };
    } catch (e) {
      const msg = e instanceof Error ? e.message : "SMTP error";
      console.error("[mailer] SMTP failed:", msg, "— falling back to Resend");
      // Fall through to Resend
    }
  }

  // 2. Resend fallback (platform key)
  const resendKey =
    process.env.RESEND_API_KEY ?? "";
  if (!resendKey) {
    return {
      success: false,
      provider: "error",
      error: "No email provider configured. Please connect an email account in Settings → Email.",
    };
  }

  try {
    const resend = new Resend(resendKey);
    const fromEmail = process.env.RESEND_FROM_EMAIL ?? "hello@icloseleads.com";
    const fromName = opts.fromName ?? "iCloseLeads";
    const { data, error } = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: [opts.to],
      subject: opts.subject,
      html,
      text: opts.text,
    });
    if (error) throw new Error(error.message);
    return { success: true, provider: "resend", id: data?.id };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return { success: false, provider: "error", error: msg };
  }
}
