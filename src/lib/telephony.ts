import crypto from "crypto";
import twilio from "twilio";
import { prisma } from "@/lib/prisma";

const COUNTRIES = new Set(["US", "GB", "CA"]);
const E164 = /^\+[1-9]\d{7,14}$/;

function required(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not configured`);
  return value;
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
          twilioAuthTokenEncrypted: encryptTelephonySecret(account.authToken),
          lastError: null,
        },
      });
    }

    const accountApi = client.api.v2010.accounts(accountSid);
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

type NumberQuote = {
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

export async function searchPhoneNumbers(userId: string, country: string, area: string) {
  const normalizedCountry = country.toUpperCase();
  if (!COUNTRIES.has(normalizedCountry)) throw new Error("Unsupported country");
  const workspace = await prisma.telephonyWorkspace.findUnique({ where: { userId } });
  if (!workspace?.twilioAccountSid || workspace.status !== "READY") throw new Error("Calling workspace is not ready");
  if (workspace.phoneNumber) throw new Error("This workspace already has a number");

  const client = parentClient();
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
    client.pricing.v1.phoneNumbers.countries(normalizedCountry).fetch(),
  ]);
  const localPrice = pricing.phoneNumberPrices.find(item => item.numberType === "local")?.currentPrice ?? 0;
  const monthlyPriceCents = Math.round(localPrice * 100);
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

export async function purchasePhoneNumber(userId: string, token: string) {
  const quote = verifyNumberQuote(token);
  if (quote.userId !== userId) throw new Error("Purchase quote does not belong to this user");
  const workspace = await prisma.telephonyWorkspace.findUnique({ where: { userId } });
  if (!workspace?.twilioAccountSid || workspace.id !== quote.workspaceId || workspace.status !== "READY") {
    throw new Error("Calling workspace is not ready");
  }
  if (workspace.phoneNumber) return workspace;

  const lock = await prisma.telephonyWorkspace.updateMany({
    where: { id: workspace.id, status: "READY", phoneNumber: null },
    data: { status: "PURCHASING", lastError: null },
  });
  if (lock.count !== 1) {
    const latest = await prisma.telephonyWorkspace.findUnique({ where: { id: workspace.id } });
    if (latest?.phoneNumber) return latest;
    throw new Error("A number purchase is already in progress");
  }

  const accountApi = parentClient().api.v2010.accounts(workspace.twilioAccountSid);
  try {
    const available = await accountApi.availablePhoneNumbers(quote.country).local.list({
      contains: quote.phoneNumber,
      voiceEnabled: true,
      limit: 1,
    });
    if (!available.some(number => number.phoneNumber === quote.phoneNumber)) {
      throw new Error("That number is no longer available");
    }

    const purchased = await accountApi.incomingPhoneNumbers.create({
      phoneNumber: quote.phoneNumber,
      friendlyName: `iCloseLeads ${workspace.id}`,
      voiceUrl: appUrl("/api/softphone/voice?mode=incoming"),
      voiceMethod: "POST",
      statusCallback: appUrl("/api/softphone/voice?mode=number-status"),
      statusCallbackMethod: "POST",
    });

    return prisma.telephonyWorkspace.update({
      where: { id: workspace.id },
      data: {
        status: "READY",
        phoneNumberSid: purchased.sid,
        phoneNumber: purchased.phoneNumber,
        phoneCountry: quote.country,
        monthlyPriceCents: quote.monthlyPriceCents,
        priceCurrency: quote.currency,
        consentAcceptedAt: new Date(),
        lastError: null,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message.slice(0, 500) : "Number purchase failed";
    await prisma.telephonyWorkspace.updateMany({
      where: { id: workspace.id, status: "PURCHASING", phoneNumber: null },
      data: { status: "READY", lastError: message },
    });
    throw error;
  }
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
