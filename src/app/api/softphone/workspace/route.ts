import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import {
  attachExistingParentNumberForAdmin,
  createPhonePurchaseIntent,
  createVoiceToken,
  isSoftphoneAllowed,
  isTelephonyConfigured,
  latestPhonePurchase,
  listWorkspacePhoneNumbers,
  provisionWorkspace,
  publicWorkspace,
  searchPhoneNumbers,
  verifyNumberQuote,
} from "@/lib/telephony";
import {
  getLemonSqueezyConfig,
  lemonSqueezyRequest,
} from "@/lib/lemonsqueezy";

export const dynamic = "force-dynamic";

const requestSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("provision") }),
  z.object({ action: z.literal("attach-existing-admin-number") }),
  z.object({
    action: z.literal("search-numbers"),
    country: z.enum(["US", "GB", "CA"]),
    area: z.string().trim().max(40).default(""),
  }),
  z.object({
    action: z.literal("checkout-number"),
    quote: z.string().min(20).max(3000),
    confirmation: z.literal("PURCHASE"),
    complianceAccepted: z.literal(true),
  }),
  z.object({ action: z.literal("token") }),
]);

async function context() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  if (!isSoftphoneAllowed(session.user.role, session.user.plan)) {
    return { error: NextResponse.json({ error: "Softphone is not released for this account yet" }, { status: 403 }) };
  }
  return { session };
}

export async function GET() {
  const auth = await context();
  if ("error" in auth) return auth.error;

  const [workspace, purchase, numbers, calls] = await Promise.all([
    prisma.telephonyWorkspace.findUnique({ where: { userId: auth.session.user.id } }),
    latestPhonePurchase(auth.session.user.id),
    listWorkspacePhoneNumbers(auth.session.user.id),
    prisma.voiceCall.findMany({
      where: { userId: auth.session.user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        direction: true,
        from: true,
        to: true,
        status: true,
        durationSeconds: true,
        createdAt: true,
        outcome: true,
      },
    }),
  ]);

  return NextResponse.json({
    configured: isTelephonyConfigured(),
    workspace: publicWorkspace(workspace),
    purchase,
    numbers,
    calls,
  });
}

interface CheckoutResponse {
  data: { attributes: { url: string } };
}

export async function POST(req: NextRequest) {
  const auth = await context();
  if ("error" in auth) return auth.error;
  if (!isTelephonyConfigured()) {
    return NextResponse.json({ error: "Twilio is not configured yet" }, { status: 503 });
  }

  const parsed = requestSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const limit = rateLimit(`softphone:${parsed.data.action}:${auth.session.user.id}`, parsed.data.action === "token" ? 60 : 12, 60 * 60_000);
  if (!limit.allowed) {
    return NextResponse.json({ error: `Too many requests. Try again in ${limit.resetInSeconds}s.` }, { status: 429 });
  }

  try {
    if (parsed.data.action === "provision") {
      const workspace = await provisionWorkspace(auth.session.user.id);
      return NextResponse.json({ workspace: publicWorkspace(workspace) });
    }

    if (parsed.data.action === "attach-existing-admin-number") {
      if (auth.session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Admin access required" }, { status: 403 });
      }
      const workspace = await attachExistingParentNumberForAdmin(auth.session.user.id);
      return NextResponse.json({ workspace: publicWorkspace(workspace) });
    }

    if (parsed.data.action === "search-numbers") {
      const numbers = await searchPhoneNumbers(auth.session.user.id, parsed.data.country, parsed.data.area);
      return NextResponse.json({ numbers });
    }

    if (parsed.data.action === "checkout-number") {
      const [config, user] = await Promise.all([
        getLemonSqueezyConfig(),
        prisma.user.findUnique({
          where: { id: auth.session.user.id },
          select: { email: true, name: true, role: true },
        }),
      ]);
      const variantId = config.softphoneVariantId;
      if (!config.apiKey || !/^\d+$/.test(config.storeId) || !/^\d+$/.test(variantId)) {
        return NextResponse.json({ error: "Secure number checkout is not configured yet" }, { status: 503 });
      }
      if (config.testMode && user?.role !== "ADMIN") {
        return NextResponse.json({ error: "Number checkout is still in private testing" }, { status: 503 });
      }

      const quote = verifyNumberQuote(parsed.data.quote);
      const purchase = await createPhonePurchaseIntent(
        auth.session.user.id,
        parsed.data.quote,
        variantId,
      );
      const appUrl = (
        process.env.NEXT_PUBLIC_APP_URL
        || process.env.NEXTAUTH_URL
        || req.nextUrl.origin
      ).replace(/\/$/, "");

      try {
        const checkout = await lemonSqueezyRequest<CheckoutResponse>(config, "/checkouts", {
          method: "POST",
          body: JSON.stringify({
            data: {
              type: "checkouts",
              attributes: {
                custom_price: quote.monthlyPriceCents,
                product_options: {
                  redirect_url: `${appUrl}/dashboard/softphone?checkout=success&purchase=${purchase.id}`,
                  enabled_variants: [Number(variantId)],
                },
                checkout_options: {
                  embed: false,
                  media: true,
                  logo: true,
                  desc: true,
                  discount: false,
                  subscription_preview: true,
                  button_color: "#7c3aed",
                },
                checkout_data: {
                  email: user?.email || undefined,
                  name: user?.name || undefined,
                  custom: {
                    purchase_type: "softphone_number",
                    telephony_purchase_id: purchase.id,
                    user_id: auth.session.user.id,
                  },
                },
                test_mode: config.testMode,
              },
              relationships: {
                store: { data: { type: "stores", id: config.storeId } },
                variant: { data: { type: "variants", id: variantId } },
              },
            },
          }),
        });
        return NextResponse.json({ url: checkout.data.attributes.url, purchaseId: purchase.id });
      } catch (error) {
        await prisma.telephonyPurchase.update({
          where: { id: purchase.id },
          data: {
            status: "CHECKOUT_FAILED",
            lastError: error instanceof Error ? error.message.slice(0, 500) : "Checkout failed",
          },
        });
        throw error;
      }
    }

    const workspace = await prisma.telephonyWorkspace.findUnique({ where: { userId: auth.session.user.id } });
    if (!workspace?.phoneNumber) return NextResponse.json({ error: "Choose a calling number first" }, { status: 409 });
    const callableNumbers = (await listWorkspacePhoneNumbers(auth.session.user.id)).filter(number => number.callable);
    if (callableNumbers.length === 0) {
      return NextResponse.json({ error: "Your phone number subscription is not active" }, { status: 402 });
    }
    return NextResponse.json({ token: createVoiceToken(workspace), identity: `icl_user_${auth.session.user.id}` });
  } catch (error) {
    console.error(`[softphone/${parsed.data.action}]`, error);
    const message = error instanceof Error ? error.message : "Softphone request failed";
    const status = /not ready|up to \d+ phone numbers|in progress|no longer available|expired|invalid|unsupported|does not belong/i.test(message) ? 409 : 502;
    return NextResponse.json({ error: message }, { status });
  }
}
