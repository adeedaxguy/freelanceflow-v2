import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Raw body needed for Stripe signature verification
export const dynamic = "force-dynamic";

interface StripeEvent {
  type: string;
  data: {
    object: Record<string, unknown>;
  };
}

async function verifyStripeSignature(
  body: string,
  signature: string,
  secret: string
): Promise<boolean> {
  try {
    // Parse the timestamp and signature from the header
    const parts = signature.split(",");
    const tPart = parts.find(p => p.startsWith("t="));
    const v1Part = parts.find(p => p.startsWith("v1="));
    if (!tPart || !v1Part) return false;

    const timestamp = tPart.slice(2);
    const receivedSig = v1Part.slice(3);

    const payload = `${timestamp}.${body}`;

    // Use Web Crypto API (available in Next.js edge + Node)
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signatureBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
    const computedSig = Buffer.from(signatureBuffer).toString("hex");

    return computedSig === receivedSig;
  } catch {
    return false;
  }
}

const PLAN_MAP: Record<string, string> = {
  // populated from price IDs at runtime via DB lookup
};

async function getPlanFromPriceId(priceId: string): Promise<string | null> {
  try {
    const [proSetting, agencySetting] = await Promise.all([
      prisma.platformSetting.findUnique({ where: { key: "pro_price_id" } }),
      prisma.platformSetting.findUnique({ where: { key: "agency_price_id" } }),
    ]);
    if (proSetting?.value === priceId) return "pro";
    if (agencySetting?.value === priceId) return "agency";
    return null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature") ?? "";

  // Get webhook secret from DB or env
  let webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? "";
  try {
    const setting = await prisma.platformSetting.findUnique({ where: { key: "stripe_webhook_secret" } });
    if (setting?.value && setting.value.length > 10) webhookSecret = setting.value;
  } catch { /* use env */ }

  if (!webhookSecret) {
    console.error("Legacy Stripe webhook rejected: signing secret is not configured.");
    return NextResponse.json({ error: "Webhook is not configured" }, { status: 503 });
  }

  const valid = await verifyStripeSignature(body, signature, webhookSecret);
  if (!valid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: StripeEvent;
  try {
    event = JSON.parse(body) as StripeEvent;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as {
          metadata?: { userId?: string; plan?: string };
          payment_status?: string;
        };
        const userId = session.metadata?.userId;
        const plan   = session.metadata?.plan;
        if (userId && plan && session.payment_status === "paid") {
          await prisma.user.update({
            where: { id: userId },
            data: { plan },
          });
          console.log(`✓ User ${userId} upgraded to ${plan}`);
        }
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as {
          metadata?: { userId?: string };
          items?: { data?: Array<{ price?: { id?: string } }> };
          status?: string;
        };
        const userId  = sub.metadata?.userId;
        const priceId = sub.items?.data?.[0]?.price?.id;
        if (userId && priceId) {
          const plan = await getPlanFromPriceId(priceId);
          if (plan) {
            await prisma.user.update({ where: { id: userId }, data: { plan } });
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as {
          metadata?: { userId?: string };
        };
        const userId = sub.metadata?.userId;
        if (userId) {
          await prisma.user.update({ where: { id: userId }, data: { plan: "free" } });
          console.log(`✓ User ${userId} downgraded to free`);
        }
        break;
      }
    }
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
