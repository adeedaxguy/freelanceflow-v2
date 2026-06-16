import { Resend } from "resend";

let resendClient: Resend | null = null;

function getResendClient(): Resend {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) throw new Error("RESEND_API_KEY is not configured");
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

export interface SendEmailParams {
  to: string;
  subject: string;
  body: string;
  fromName?: string;
  replyTo?: string;
}

export interface SendEmailResult {
  id: string;
  success: boolean;
}

export async function sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
  const client = getResendClient();
  const fromEmail = process.env.RESEND_FROM_EMAIL ?? "hello@freelanceflow.io";
  const fromName = params.fromName ?? "FreelanceFlow";

  const { data, error } = await client.emails.send({
    from: `${fromName} <${fromEmail}>`,
    to: [params.to],
    subject: params.subject,
    html: emailToHtml(params.body),
    text: params.body,
    reply_to: params.replyTo,
  });

  if (error) {
    throw new Error(`Resend error: ${error.message}`);
  }

  if (!data?.id) {
    throw new Error("No email ID returned from Resend");
  }

  return { id: data.id, success: true };
}

function emailToHtml(text: string): string {
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const paragraphs = escaped
    .split("\n\n")
    .map((p) => `<p style="margin:0 0 16px 0;line-height:1.6;">${p.replace(/\n/g, "<br>")}</p>`)
    .join("");

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:Inter,system-ui,sans-serif;background:#f9f9f9;margin:0;padding:20px;">
  <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;padding:32px;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
    ${paragraphs}
    <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
    <p style="color:#888;font-size:12px;margin:0;">Sent via FreelanceFlow — <a href="https://freelanceflow.io" style="color:#7C3AED;">freelanceflow.io</a></p>
  </div>
</body>
</html>`;
}
