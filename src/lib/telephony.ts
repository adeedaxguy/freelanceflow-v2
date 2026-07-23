import crypto from "crypto";
import twilio from "twilio";
import { prisma } from "@/lib/prisma";

const COUNTRIES = new Set(["US", "GB", "CA"]);
const E164 = /^\+[1-9]\d{7,14}$/;
const DEFAULT_NUMBER_MARKUP_PERCENT = 50;
const DEFAULT_NUMBER_MIN_MARGIN_CENTS = 100;

function required(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not configured`);
  return value;
}

function boundedNumber(name: string, fallback: number, maximum: number) {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value >= 0 && value <= maximum ? value : fallback;
}

export function customerNumberPriceCents(providerPriceCents: number) {
  if (!Number.isInteger(providerPriceCents) || providerPriceCents <= 0) {
    throw new Error("Number pricing is temporarily unavailable");
  }
  const markupPercent = boundedNumber("TWILIO_NUMBER_MARKUP_PERCENT", DEFAULT_NUMBER_MARKUP_PERCENT, 500);
  const minimumMargin = Math.round(
    boundedNumber("TWILIO_NUMBER_MIN_MARGIN_CENTS", DEFAULT_NUMBER_MIN_MARGIN_CENTS, 5_000),
  );
  return providerPriceCents + Math.max(Math.ceil(providerPriceCents * markupPercent / 100), minimumMargin);
}

function encryptionKey() {
  return crypto.createHash("sha256").update(required("TWILIO_ENCRYPTION_KEY")).digest();
}

export function encryptTelephonySecret(value: string) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  return `v1:${iv.toString("base64url")}:${cipher.getAuthTag().toString("base64url")}:${encrypted.toString("base64url")}`;
}

export function decryptTelephonySecret(value: string) {
  const [version, iv, tag, encrypted] = value.split(":");
  if (version !== "v1" || !iv || !tag || !encrypted) throw new Error("Invalid encrypted secret");
  const decipher = crypto.createDecipheriv("aes-256-gcm", encryptionKey(), Buffer.from(iv, "base64url"));
  decipher.setAuthTag(Buffer.from(tag, "base64url"));
  return Buffer.concat([decipher.update(Buffer.from(encrypted, "base64url")), decipher.final()]).toString("utf8");
}

export function isTelephonyConfigured() {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_API_KEY_SID &&
    process.env.TWILIO_API_KEY_SECRET &&
    process.env.TWILIO_ENCRYPTION_KEY,
  );
}

export function isSoftphoneAllowed(role: string | undefined, plan: string | undefined) {
  return role === "ADMIN" || (
    process.env.TWILIO_SOFTPHONE_ENABLED === "true" &&
    ["pro", "agency"].includes((plan || "").toLowerCase())
  );
}

function parentClient() {
  return twilio(required("TWILIO_API_KEY_SID"), required("TWILIO_API_KEY_SECRET"), {
    accountSid: required("TWILIO_ACCOUNT_SID"),
  });
}

function parentMasterClient() {
  return twilio(required("TWILIO_ACCOUNT_SID"), required("TWILIO_AUTH_TOKEN"));
}

function subaccountClient(workspace: {
  twilioAccountSid: string | null;
  twilioAuthTokenEncrypted: string | null;
}) {
  if (!workspace.twilioAccountSid || !workspace.twilioAuthTokenEncrypted) {
    throw new Error("Calling workspace credentials are incomplete");
  }
  return twilio(
    workspace.twilioAccountSid,
    decryptTelephonySecret(workspace.twilioAuthTokenEncrypted),
    { accountSid: workspace.twilioAccountSid },
  );
}

export function appUrl(path: string) {
  return new URL(path, process.env.NEXT_PUBLIC_APP_URL || "https://icloseleads.com").toString();
}

export async function provisionWorkspace(userId: string) {
  let workspace = await prisma.telephonyWorkspace.findUnique({ where: { userId } });
  if (workspace?.status === "READY") return workspace;

  workspace ??= await prisma.telephonyWorkspace.create({ data: { userId } });
  const client = parentClient();
  const friendlyName = `iCloseLeads ${workspace.id}`;

  try {
    let accountSid = workspace.twilioAccountSid;
    if (!accountSid) {
      const existing = await client.api.v2010.accounts.list({ friendlyName, status: "active", limit: 1 });
      const account = existing[0] ?? await client.api.v2010.accounts.create({ friendlyName });
      accountSid = account.sid;
      workspace = await prisma.telephonyWorkspace.update({
        where: { id: workspace.id },
        data: {
          twilioAccountSid: account.sid,
          lastError: null,
        },
      });
    }

    let hasSubaccountToken = false;
    try {
      hasSubaccountToken = Boolean(
        workspace.twilioAuthTokenEncrypted &&
        decryptTelephonySecret(workspace.twilioAuthTokenEncrypted),
      );
    } catch {
      hasSubaccountToken = false;
    }
    if (!hasSubaccountToken) {
      const account = await parentMasterClient().api.v2010.accounts(accountSid).fetch();
      if (!account.authToken) throw new Error("Twilio did not return the calling workspace token");
      workspace = await prisma.telephonyWorkspace.update({
        where: { id: workspace.id },
        data: { twilioAuthTokenEncrypted: encryptTelephonySecret(account.authToken) },
      });
    }

    const accountApi = subaccountClient(workspace).api.v2010.accounts(accountSid);
    let appSid = workspace.twimlAppSid;
    if (!appSid) {
      const appName = `iCloseLeads Voice ${workspace.id}`;
      const existingApps = await accountApi.applications.list({ friendlyName: appName, limit: 1 });
      const app = existingApps[0] ?? await accountApi.applications.create({
        friendlyName: appName,
        voiceUrl: appUrl("/api/softphone/voice"),
        voiceMethod: "POST",
        statusCallback: appUrl("/api/softphone/voice?mode=app-status"),
        statusCallbackMethod: "POST",
      });
      appSid = app.sid;
      workspace = await prisma.telephonyWorkspace.update({
        where: { id: workspace.id },
        data: { twimlAppSid: app.sid },
      });
    }

    if (!workspace.twilioApiKeySid || !workspace.twilioApiKeySecretEncrypted) {
      const key = await accountApi.newKeys.create({ friendlyName: `iCloseLeads browser ${workspace.id}` });
      workspace = await prisma.telephonyWorkspace.update({
        where: { id: workspace.id },
        data: {
          twilioApiKeySid: key.sid,
          twilioApiKeySecretEncrypted: encryptTelephonySecret(key.secret),
        },
      });
    }

    return prisma.telephonyWorkspace.update({
      where: { id: workspace.id },
      data: { status: "READY", lastError: null },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message.slice(0, 500) : "Twilio setup failed";
    await prisma.telephonyWorkspace.update({
      where: { id: workspace.id },
      data: { status: "ERROR", lastError: message },
    });
    throw error;
  }
}

export type NumberQuote = {
  userId: string;
  workspaceId: string;
  phoneNumber: string;
  country: string;
  monthlyPriceCents: number;
  currency: string;
  expiresAt: number;
};

function sign(payload: string) {
  return crypto.createHmac("sha256", required("NEXTAUTH_SECRET")).update(payload).digest("base64url");
}

export function createNumberQuote(input: Omit<NumberQuote, "expiresAt">) {
  const payload = Buffer.from(JSON.stringify({ ...input, expiresAt: Date.now() + 10 * 60_000 })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifyNumberQuote(token: string): NumberQuote {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) throw new Error("Invalid purchase quote");
  const expected = sign(payload);
  if (signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    throw new Error("Invalid purchase quote");
  }
  const quote = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as NumberQuote;
  if (quote.expiresAt < Date.now()) throw new Error("Purchase quote expired");
  if (!COUNTRIES.has(quote.country) || !E164.test(quote.phoneNumber)) throw new Error("Invalid purchase quote");
  return quote;
}

export function hasPhoneSubscriptionAccess(status: string | null | undefined, endsAt?: Date | string | null) {
  if (!status) return false;
  const normalized = status.toLowerCase();
  if (["active", "on_trial", "past_due"].includes(normalized)) return true;
  if (normalized !== "cancelled" || !endsAt) return false;
  return new Date(endsAt).getTime() > Date.now();
}

export async function searchPhoneNumbers(userId: string, country: string, area: string) {
  const normalizedCountry = country.toUpperCase();
  if (!COUNTRIES.has(normalizedCountry)) throw new Error("Unsupported country");
  const workspace = await prisma.telephonyWorkspace.findUnique({ where: { userId } });
  if (!workspace?.twilioAccountSid || workspace.status !== "READY") throw new Error("Calling workspace is not ready");
  if (workspace.phoneNumber) throw new Error("This workspace already has a number");

  const client = subaccountClient(workspace);
  const local = client.api.v2010.accounts(workspace.twilioAccountSid)
    .availablePhoneNumbers(normalizedCountry).local;
  const trimmedArea = area.trim();
  const filters: { limit: number; voiceEnabled: boolean; excludeAllAddressRequired: boolean; areaCode?: number; inLocality?: string } = {
    limit: 8,
    voiceEnabled: true,
    excludeAllAddressRequired: true,
  };
  if (/^\d{3}$/.test(trimmedArea) && ["US", "CA"].includes(normalizedCountry)) filters.areaCode = Number(trimmedArea);
  else if (trimmedArea) filters.inLocality = trimmedArea.slice(0, 40);

  const [numbers, pricing] = await Promise.all([
    local.list(filters),
    parentClient().pricing.v1.phoneNumbers.countries(normalizedCountry).fetch(),
  ]);
  const localPrice = pricing.phoneNumberPrices.find(item => item.numberType === "local")?.currentPrice;
  const monthlyPriceCents = customerNumberPriceCents(Math.round(Number(localPrice) * 100));
  const currency = pricing.priceUnit.toUpperCase();

  return numbers.map(number => ({
    phoneNumber: number.phoneNumber,
    friendlyName: number.friendlyName,
    locality: number.locality,
    region: number.region,
    country: number.isoCountry,
    capabilities: number.capabilities,
    monthlyPriceCents,
    currency,
    quote: createNumberQuote({
      userId,
      workspaceId: workspace.id,
      phoneNumber: number.phoneNumber,
      country: normalizedCountry,
      monthlyPriceCents,
      currency,
    }),
  }));
}

export async function createPhonePurchaseIntent(
  userId: string,
  token: string,
  variantId: string,
) {
  const quote = verifyNumberQuote(token);
  if (quote.userId !== userId) throw new Error("Purchase quote does not belong to this user");
  const workspace = await prisma.telephonyWorkspace.findUnique({ where: { userId } });
  if (!workspace?.twilioAccountSid || workspace.id !== quote.workspaceId || workspace.status !== "READY") {
    throw new Error("Calling workspace is not ready");
  }
  if (workspace.phoneNumber) throw new Error("This workspace already has a number");

  const reusable = await prisma.telephonyPurchase.findFirst({
    where: {
      userId,
      workspaceId: workspace.id,
      phoneNumber: quote.phoneNumber,
      variantId,
      status: "CHECKOUT_PENDING",
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });
  if (reusable) return reusable;

  return prisma.telephonyPurchase.create({
    data: {
      userId,
      workspaceId: workspace.id,
      phoneNumber: quote.phoneNumber,
      country: quote.country,
      monthlyPriceCents: quote.monthlyPriceCents,
      currency: quote.currency,
      variantId,
      consentAcceptedAt: new Date(),
      expiresAt: new Date(Date.now() + 60 * 60_000),
    },
  });
}

export async function provisionPhoneNumber(purchaseId: string) {
  let purchase = await prisma.telephonyPurchase.findUnique({
    where: { id: purchaseId },
    include: { workspace: true },
  });
  if (!purchase) throw new Error("Phone purchase was not found");
  if (purchase.testMode) throw new Error("Test payments cannot provision real phone numbers");
  if (purchase.status === "ACTIVE" && purchase.workspace.phoneNumber) return purchase.workspace;
  if (!["PAYMENT_CONFIRMED", "PROVISION_FAILED"].includes(purchase.status)) {
    throw new Error("Phone payment has not been confirmed");
  }
  if (
    !purchase.workspace.twilioAccountSid
    || purchase.workspace.status !== "READY"
    || purchase.workspace.phoneNumber
  ) {
    if (purchase.workspace.phoneNumber) return purchase.workspace;
    throw new Error("Calling workspace is not ready");
  }

  const purchaseLock = await prisma.telephonyPurchase.updateMany({
    where: {
      id: purchase.id,
      status: { in: ["PAYMENT_CONFIRMED", "PROVISION_FAILED"] },
    },
    data: {
      status: "PROVISIONING",
      attempts: { increment: 1 },
      lastError: null,
    },
  });
  if (purchaseLock.count !== 1) {
    purchase = await prisma.telephonyPurchase.findUnique({
      where: { id: purchaseId },
      include: { workspace: true },
    });
    if (purchase?.status === "ACTIVE" && purchase.workspace.phoneNumber) return purchase.workspace;
    throw new Error("Number provisioning is already in progress");
  }

  const workspace = purchase.workspace;
  const accountSid = workspace.twilioAccountSid;
  if (!accountSid) throw new Error("Calling workspace is not ready");
  const workspaceLock = await prisma.telephonyWorkspace.updateMany({
    where: { id: workspace.id, status: "READY", phoneNumber: null },
    data: { status: "PURCHASING", lastError: null },
  });
  if (workspaceLock.count !== 1) {
    const latest = await prisma.telephonyWorkspace.findUnique({ where: { id: workspace.id } });
    if (latest?.phoneNumber) return latest;
    await prisma.telephonyPurchase.update({
      where: { id: purchase.id },
      data: { status: "PAYMENT_CONFIRMED" },
    });
    throw new Error("Number provisioning is already in progress");
  }

  const accountApi = subaccountClient(workspace).api.v2010.accounts(accountSid);
  try {
    const existing = await accountApi.incomingPhoneNumbers.list({
      phoneNumber: purchase.phoneNumber,
      limit: 1,
    });
    let purchased = existing[0];
    if (!purchased) {
      const available = await accountApi.availablePhoneNumbers(purchase.country).local.list({
        contains: purchase.phoneNumber,
        voiceEnabled: true,
        limit: 1,
      });
      if (!available.some(number => number.phoneNumber === purchase.phoneNumber)) {
        throw new Error("That number is no longer available");
      }

      purchased = await accountApi.incomingPhoneNumbers.create({
        phoneNumber: purchase.phoneNumber,
        friendlyName: `iCloseLeads ${workspace.id}`,
        voiceUrl: appUrl("/api/softphone/voice?mode=incoming"),
        voiceMethod: "POST",
        statusCallback: appUrl("/api/softphone/voice?mode=number-status"),
        statusCallbackMethod: "POST",
      });
    }

    const [, updatedWorkspace] = await prisma.$transaction([
      prisma.telephonyPurchase.update({
        where: { id: purchase.id },
        data: { status: "ACTIVE", lastError: null },
      }),
      prisma.telephonyWorkspace.update({
        where: { id: workspace.id },
        data: {
          status: "READY",
          phoneNumberSid: purchased.sid,
          phoneNumber: purchased.phoneNumber,
          phoneCountry: purchase.country,
          monthlyPriceCents: purchase.monthlyPriceCents,
          priceCurrency: purchase.currency,
          consentAcceptedAt: purchase.consentAcceptedAt,
          lastError: null,
        },
      }),
    ]);
    return updatedWorkspace;
  } catch (error) {
    const message = error instanceof Error ? error.message.slice(0, 500) : "Number provisioning failed";
    await prisma.$transaction([
      prisma.telephonyWorkspace.updateMany({
        where: { id: workspace.id, status: "PURCHASING", phoneNumber: null },
        data: { status: "READY", lastError: message },
      }),
      prisma.telephonyPurchase.update({
        where: { id: purchase.id },
        data: { status: "PROVISION_FAILED", lastError: message },
      }),
    ]);
    throw error;
  }
}

export async function latestPhonePurchase(userId: string) {
  return prisma.telephonyPurchase.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      phoneNumber: true,
      monthlyPriceCents: true,
      currency: true,
      status: true,
      subscriptionStatus: true,
      testMode: true,
      renewsAt: true,
      endsAt: true,
      lastError: true,
      createdAt: true,
    },
  });
}

export function createVoiceToken(workspace: {
  userId: string;
  twilioAccountSid: string | null;
  twilioApiKeySid: string | null;
  twilioApiKeySecretEncrypted: string | null;
  twimlAppSid: string | null;
}) {
  if (!workspace.twilioAccountSid || !workspace.twilioApiKeySid || !workspace.twilioApiKeySecretEncrypted || !workspace.twimlAppSid) {
    throw new Error("Calling workspace is not ready");
  }
  const AccessToken = twilio.jwt.AccessToken;
  const token = new AccessToken(
    workspace.twilioAccountSid,
    workspace.twilioApiKeySid,
    decryptTelephonySecret(workspace.twilioApiKeySecretEncrypted),
    { identity: `icl_user_${workspace.userId}`, ttl: 3600 },
  );
  token.addGrant(new AccessToken.VoiceGrant({
    incomingAllow: true,
    outgoingApplicationSid: workspace.twimlAppSid,
  }));
  return token.toJwt();
}

export function normalizeDestination(value: string) {
  const normalized = value.replace(/[\s().-]/g, "");
  if (!E164.test(normalized) || !(normalized.startsWith("+1") || normalized.startsWith("+44"))) {
    throw new Error("Use a valid US, Canada, or UK number in international format");
  }
  if (normalized.startsWith("+1900") || (normalized.startsWith("+44") && !/^\+44[1237]/.test(normalized))) {
    throw new Error("Premium-rate and unsupported service numbers cannot be called");
  }
  return normalized;
}

export function publicWorkspace(workspace: Awaited<ReturnType<typeof prisma.telephonyWorkspace.findUnique>>) {
  if (!workspace) return null;
  return {
    id: workspace.id,
    status: workspace.status,
    phoneNumber: workspace.phoneNumber,
    phoneCountry: workspace.phoneCountry,
    monthlyPriceCents: workspace.monthlyPriceCents,
    priceCurrency: workspace.priceCurrency,
    consentAcceptedAt: workspace.consentAcceptedAt,
    lastError: workspace.lastError,
  };
}

export async function validateTwilioWebhook(req: Request, params: Record<string, string>) {
  const accountSid = params.AccountSid;
  const signature = req.headers.get("x-twilio-signature");
  if (!accountSid || !signature) return null;
  const workspace = await prisma.telephonyWorkspace.findUnique({ where: { twilioAccountSid: accountSid } });
  if (!workspace?.twilioAuthTokenEncrypted) return null;
  const url = appUrl(new URL(req.url).pathname + new URL(req.url).search);
  return twilio.validateRequest(decryptTelephonySecret(workspace.twilioAuthTokenEncrypted), signature, url, params)
    ? workspace
    : null;
}

export { twilio };
