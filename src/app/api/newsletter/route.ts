import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getPlatformEmailStatus, sendPlatformEmail } from "@/lib/admin-notifications";
import { requestNewsletterConfirmation } from "@/lib/newsletter";
import { getClientIp, rateLimitHeaders, securityRateLimit } from "@/lib/security-rate-limit";

const schema = z.object({ email: z.string().trim().email().max(254), topic: z.enum(["updates", "status"]), consent: z.literal(true) });

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter a valid email and agree to receive the selected updates." }, { status: 400 });
  try {
    for (const [namespace, identifier, maximum] of [
      ["newsletter-ip", getClientIp(req.headers), 10],
      ["newsletter-email", parsed.data.email.toLowerCase(), 3],
    ] as const) {
      const limit = await securityRateLimit(namespace, identifier, maximum, 3_600_000);
      if (!limit.allowed) return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429, headers: rateLimitHeaders(limit) });
    }
    const sender = await getPlatformEmailStatus();
    if (!sender.configured || !process.env.NEXTAUTH_SECRET) throw new Error("Sender unavailable");
    const subscription = await requestNewsletterConfirmation(parsed.data.email, parsed.data.topic);
    if (subscription) {
      const label = parsed.data.topic === "status" ? "service status notices" : "product updates";
      const url = `https://icloseleads.com/api/newsletter/confirm?token=${subscription.token}`;
      const delivery = await sendPlatformEmail({
        recipient: subscription.email,
        subject: `Confirm your iCloseLeads ${label}`,
        html: `<div style="font:16px/1.6 Arial,sans-serif;max-width:560px;margin:auto;padding:32px;color:#20212a"><img src="https://icloseleads.com/brand/icloseleads-email-logo.png" width="190" alt="iCloseLeads"><h1 style="font-size:24px">Confirm your email</h1><p>You requested iCloseLeads ${label}. Confirm below to receive them. This link expires in 24 hours.</p><p><a href="${url}">Confirm ${label}</a></p><p>If you did not request this, ignore this email. You will not be subscribed. Every update includes an unsubscribe link.</p></div>`,
        text: `Confirm your iCloseLeads ${label}: ${url}\n\nThis link expires in 24 hours. If you did not request this, ignore this email. You will not be subscribed.`,
      });
      if (!delivery.success) throw new Error("Delivery unavailable");
    }
    return NextResponse.json({ message: "Check your inbox to confirm. If you already subscribe to these updates, no further action is needed." });
  } catch {
    return NextResponse.json({ error: "We could not send a confirmation right now. Please try again later or contact support." }, { status: 503 });
  }
}
