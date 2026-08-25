import crypto from "crypto";
import twilio from "twilio";
import type { TelephonyWorkspace } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const COUNTRIES = new Set(["US", "GB", "CA"]);
const E164 = /^\+[1-9]\d{7,14}$/;
const EMERGENCY_DESTINATIONS = new Set(["911", "112", "999", "1911", "44999", "44112"]);
const DEFAULT_NUMBER_MARKUP_PERCENT = 50;
const DEFAULT_NUMBER_MIN_MARGIN_CENTS = 100;
export const MAX_PHONE_NUMBERS = 3;

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

export function isSoftphoneAllowed(role: string | undefined, _plan: string | undefined) {
  return role === "ADMIN" || (role === "USER" && process.env.TWILIO_SOFTPHONE_ENABLED === "true");
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

export async function startAiVoiceCall(
  workspace: { twilioAccountSid: string | null; twilioAuthTokenEncrypted: string | null },
  recordId: string,
  to: string,
  from: string,
) {
  return subaccountClient(workspace).calls.create({
    to,
    from,
    url: appUrl(`/api/softphone/ai-agent/voice?recordId=${encodeURIComponent(recordId)}`),
    method: "POST",
    statusCallback: appUrl(`/api/softphone/ai-agent/voice?mode=status&recordId=${encodeURIComponent(recordId)}`),
    statusCallbackMethod: "POST",
    statusCallbackEvent: ["initiated", "ringing", "answered", "completed"],
    timeout: 30,
    record: false,
  });
}

export async function stopVoiceCall(
  workspace: { twilioAccountSid: string | null; twilioAuthTokenEncrypted: string | null },
  callSid: string,
) {
  return subaccountClient(workspace).calls(callSid).update({ status: "completed" });
}

export function appUrl(path: string) {
  return new URL(path, process.env.NEXT_PUBLIC_APP_URL || "https://icloseleads.com").toString();
}

export function usageAlertSettingKey(idempotencyToken: string) {
  const token = idempotencyToken.trim();
  if (!token) throw new Error("Twilio usage alert is missing its idempotency token");
  return `twilio_usage_alert:${crypto.createHash("sha256").update(token).digest("hex")}`;
}

function voiceApplicationConfig() {
  return {
    voiceUrl: appUrl("/api/softphone/voice"),
    voiceMethod: "POST" as const,
    voiceFallbackUrl: appUrl("/api/softphone/fallback"),
    voiceFallbackMethod: "POST" as const,
    statusCallback: appUrl("/api/softphone/voice?mode=app-status"),
    statusCallbackMethod: "POST" as const,
  };
}

function phoneNumberVoiceConfig() {
  return {
    voiceUrl: appUrl("/api/softphone/voice?mode=incoming"),
    voiceMethod: "POST" as const,
    voiceFallbackUrl: appUrl("/api/softphone/fallback"),
    voiceFallbackMethod: "POST" as const,
    voiceApplicationSid: "",
    statusCallback: appUrl("/api/softphone/voice?mode=number-status"),
    statusCallbackMethod: "POST" as const,
  };
}

function isTwilioNotFound(error: unknown) {
  const candidate = error as { status?: number; code?: number };
  return candidate?.status === 404 || candidate?.code === 20404;
}

async function ensureVoiceApplication(
  workspace: TelephonyWorkspace,
  client: ReturnType<typeof subaccountClient>,
) {
  const accountSid = workspace.twilioAccountSid;
  if (!accountSid) throw new Error("Calling workspace is not ready");
  const accountApi = client.api.v2010.accounts(accountSid);
  const friendlyName = `iCloseLeads Voice ${workspace.id}`;

  if (workspace.twimlAppSid) {
    try {
      const app = await accountApi.applications(workspace.twimlAppSid).update(voiceApplicationConfig());
      return app.sid;
    } catch (error) {
      if (!isTwilioNotFound(error)) throw error;
    }
  }

  const existing = await accountApi.applications.list({ friendlyName, limit: 1 });
  const app = existing[0]
    ? await accountApi.applications(existing[0].sid).update(voiceApplicationConfig())
    : await accountApi.applications.create({
        friendlyName,
        ...voiceApplicationConfig(),
      });
  return app.sid;
}

async function reconcileOwnedNumbers(
  workspace: TelephonyWorkspace,
  client: ReturnType<typeof subaccountClient>,
) {
  const accountSid = workspace.twilioAccountSid;
  if (!accountSid) return;
  const purchases = await prisma.telephonyPurchase.findMany({
    where: { workspaceId: workspace.id, status: "ACTIVE", phoneNumberSid: { not: null } },
    select: { phoneNumberSid: true },
  });
  const sids = new Set([
    workspace.phoneNumberSid,
    ...purchases.map(purchase => purchase.phoneNumberSid),
  ].filter((sid): sid is string => Boolean(sid)));
  const accountApi = client.api.v2010.accounts(accountSid);

  await Promise.all([...sids].map(async sid => {
    try {
      await accountApi.incomingPhoneNumbers(sid).update(phoneNumberVoiceConfig());
    } catch (error) {
      if (!isTwilioNotFound(error)) throw error;
    }
  }));
}

async function enforceCustomerDialingPermissions(
  workspace: TelephonyWorkspace,
  client: ReturnType<typeof subaccountClient>,
) {
  const accountSid = workspace.twilioAccountSid;
  if (!accountSid || accountSid === required("TWILIO_ACCOUNT_SID")) return;

  const permissions = client.voice.v1.dialingPermissions;
  const settings = await permissions.settings().fetch();
  if (settings.dialingPermissionsInheritance) {
    await permissions.settings().update({ dialingPermissionsInheritance: false });
  }
  const countries = await permissions.countries.list({ limit: 1_000 });
  const updates = countries.flatMap(country => {
    const allowed = COUNTRIES.has(country.isoCode);
    if (
      country.lowRiskNumbersEnabled === allowed
      && !country.highRiskSpecialNumbersEnabled
      && !country.highRiskTollfraudNumbersEnabled
    ) return [];
    return [{
      iso_code: country.isoCode,
      low_risk_numbers_enabled: allowed,
      high_risk_special_numbers_enabled: false,
      high_risk_tollfraud_numbers_enabled: false,
    }];
  });
  if (updates.length > 0) {
    await permissions.bulkCountryUpdates.create({
      updateRequest: JSON.stringify(updates),
    });
  }
}

async function ensureCustomerUsageMonitoring(
  workspace: TelephonyWorkspace,
  client: ReturnType<typeof subaccountClient>,
) {
  const accountSid = workspace.twilioAccountSid;
  if (!accountSid || accountSid === required("TWILIO_ACCOUNT_SID")) return;

  const triggers = client.api.v2010.accounts(accountSid).usage.triggers;
  const friendlyName = `iCloseLeads daily call guard ${workspace.id}`.slice(0, 64);
  const callbackUrl = appUrl("/api/softphone/usage-alert");
  const existing = (await triggers.list({
    recurring: "daily",
    usageCategory: "calls",
    limit: 50,
  })).find(trigger => trigger.friendlyName === friendlyName);

  if (existing) {
    if (existing.callbackUrl !== callbackUrl || existing.callbackMethod !== "POST") {
      await triggers(existing.sid).update({ callbackUrl, callbackMethod: "POST", friendlyName });
    }
    return;
  }

  await triggers.create({
    callbackUrl,
    callbackMethod: "POST",
    friendlyName,
    recurring: "daily",
    triggerBy: "count",
    triggerValue: "60",
    usageCategory: "calls",
  });
}

export async function provisionWorkspace(userId: string) {
  let workspace = await prisma.telephonyWorkspace.findUnique({ where: { userId } });
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

    const workspaceClient = subaccountClient(workspace);
    const accountApi = workspaceClient.api.v2010.accounts(accountSid);
    const appSid = await ensureVoiceApplication(workspace, workspaceClient);
    if (appSid !== workspace.twimlAppSid) {
      workspace = await prisma.telephonyWorkspace.update({
        where: { id: workspace.id },
        data: { twimlAppSid: appSid },
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

    await Promise.all([
      reconcileOwnedNumbers(workspace, workspaceClient),
      enforceCustomerDialingPermissions(workspace, workspaceClient),
      ensureCustomerUsageMonitoring(workspace, workspaceClient),
    ]);

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

export async function attachExistingParentNumberForAdmin(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  if (user?.role !== "ADMIN") throw new Error("Admin access required");

  const workspace = await provisionWorkspace(userId);
  if (workspace.phoneNumber) return workspace;

  const parentAccountSid = required("TWILIO_ACCOUNT_SID");
  const master = parentMasterClient();
  const accountApi = master.api.v2010.accounts(parentAccountSid);
  const numbers = await accountApi.incomingPhoneNumbers.list({ limit: 20 });
  const voiceNumbers = numbers.filter(number => number.capabilities.voice);
  if (voiceNumbers.length === 0) throw new Error("No voice-enabled number exists in the Twilio master account");
  if (voiceNumbers.length > 1) {
    throw new Error("More than one master number exists. Choose the admin number in Twilio before attaching it");
  }

  const number = voiceNumbers[0]!;
  const appName = `iCloseLeads Admin Voice ${workspace.id}`;
  const existingApps = await accountApi.applications.list({ friendlyName: appName, limit: 1 });
  const app = existingApps[0]
    ? await accountApi.applications(existingApps[0].sid).update(voiceApplicationConfig())
    : await accountApi.applications.create({
        friendlyName: appName,
        ...voiceApplicationConfig(),
      });

  const originalVoiceConfig = {
    voiceUrl: number.voiceUrl || "",
    voiceMethod: number.voiceMethod || "POST",
    voiceFallbackUrl: number.voiceFallbackUrl || "",
    voiceFallbackMethod: number.voiceFallbackMethod || "POST",
    voiceApplicationSid: number.voiceApplicationSid || "",
    statusCallback: number.statusCallback || "",
    statusCallbackMethod: number.statusCallbackMethod || "POST",
  };

  await accountApi.incomingPhoneNumbers(number.sid).update(phoneNumberVoiceConfig());

  try {
    return await prisma.telephonyWorkspace.update({
      where: { id: workspace.id },
      data: {
        status: "READY",
        twilioAccountSid: parentAccountSid,
        twilioAuthTokenEncrypted: encryptTelephonySecret(required("TWILIO_AUTH_TOKEN")),
        twilioApiKeySid: required("TWILIO_API_KEY_SID"),
        twilioApiKeySecretEncrypted: encryptTelephonySecret(required("TWILIO_API_KEY_SECRET")),
        twimlAppSid: app.sid,
        phoneNumberSid: number.sid,
        phoneNumber: number.phoneNumber,
        phoneCountry: number.phoneNumber.startsWith("+44") ? "GB" : "US",
        consentAcceptedAt: new Date(),
        lastError: null,
      },
    });
  } catch (error) {
    await accountApi.incomingPhoneNumbers(number.sid).update(originalVoiceConfig).catch(() => undefined);
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
  if (["active", "trialing", "on_trial", "past_due"].includes(normalized)) return true;
  if (normalized !== "cancelled" || !endsAt) return false;
  return new Date(endsAt).getTime() > Date.now();
}

export type WorkspacePhoneNumber = {
  id: string;
  phoneNumber: string;
  country: string | null;
  monthlyPriceCents: number | null;
  currency: string | null;
  primary: boolean;
  callable: boolean;
};

export async function listWorkspacePhoneNumbers(userId: string): Promise<WorkspacePhoneNumber[]> {
  const [user, workspace, purchases] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { role: true } }),
    prisma.telephonyWorkspace.findUnique({ where: { userId } }),
    prisma.telephonyPurchase.findMany({
      where: { userId, status: "ACTIVE" },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        phoneNumber: true,
        country: true,
        monthlyPriceCents: true,
        currency: true,
        subscriptionStatus: true,
        endsAt: true,
      },
    }),
  ]);

  const admin = user?.role === "ADMIN";
  const byNumber = new Map<string, WorkspacePhoneNumber>();
  for (const purchase of purchases) {
    byNumber.set(purchase.phoneNumber, {
      id: purchase.id,
      phoneNumber: purchase.phoneNumber,
      country: purchase.country,
      monthlyPriceCents: purchase.monthlyPriceCents,
      currency: purchase.currency,
      primary: purchase.phoneNumber === workspace?.phoneNumber,
      callable: admin || hasPhoneSubscriptionAccess(purchase.subscriptionStatus, purchase.endsAt),
    });
  }
  if (workspace?.phoneNumber) {
    const purchased = byNumber.get(workspace.phoneNumber);
    byNumber.set(workspace.phoneNumber, {
      id: purchased?.id || `workspace:${workspace.id}`,
      phoneNumber: workspace.phoneNumber,
      country: workspace.phoneCountry,
      monthlyPriceCents: workspace.monthlyPriceCents,
      currency: workspace.priceCurrency,
      primary: true,
      callable: admin || Boolean(purchased?.callable),
    });
  }
  return [...byNumber.values()];
}

async function assertPhoneNumberCapacity(userId: string, workspaceId: string) {
  const [owned, pending] = await Promise.all([
    listWorkspacePhoneNumbers(userId),
    prisma.telephonyPurchase.findMany({
      where: {
        userId,
        workspaceId,
        status: { in: ["CHECKOUT_PENDING", "PAYMENT_CONFIRMED", "PROVISIONING"] },
        expiresAt: { gt: new Date() },
      },
      select: { phoneNumber: true },
    }),
  ]);
  const reserved = new Set([...owned.map(item => item.phoneNumber), ...pending.map(item => item.phoneNumber)]);
  if (reserved.size >= MAX_PHONE_NUMBERS) {
    throw new Error(`Each workspace can have up to ${MAX_PHONE_NUMBERS} phone numbers`);
  }
}

export function selectAuthorizedCallerId(requested: string | undefined, allowed: string[]) {
  const callerId = requested || allowed[0];
  if (!callerId || !allowed.includes(callerId)) throw new Error("Choose an active calling number");
  return callerId;
}

export async function searchPhoneNumbers(userId: string, country: string, area: string) {
  const normalizedCountry = country.toUpperCase();
  if (!COUNTRIES.has(normalizedCountry)) throw new Error("Unsupported country");
  const workspace = await prisma.telephonyWorkspace.findUnique({ where: { userId } });
  if (!workspace?.twilioAccountSid || workspace.status !== "READY") throw new Error("Calling workspace is not ready");
  await assertPhoneNumberCapacity(userId, workspace.id);

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
  await assertPhoneNumberCapacity(userId, workspace.id);

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
  if (purchase.status === "ACTIVE" && purchase.phoneNumberSid) return purchase.workspace;
  if (!["PAYMENT_CONFIRMED", "PROVISION_FAILED"].includes(purchase.status)) {
    throw new Error("Phone payment has not been confirmed");
  }
  if (
    !purchase.workspace.twilioAccountSid
    || purchase.workspace.status !== "READY"
  ) {
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
    if (purchase?.status === "ACTIVE" && purchase.phoneNumberSid) return purchase.workspace;
    throw new Error("Number provisioning is already in progress");
  }

  const workspace = purchase.workspace;
  const accountSid = workspace.twilioAccountSid;
  if (!accountSid) throw new Error("Calling workspace is not ready");

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
        ...phoneNumberVoiceConfig(),
      });
    } else {
      purchased = await accountApi.incomingPhoneNumbers(purchased.sid).update(phoneNumberVoiceConfig());
    }

    const workspaceData = workspace.phoneNumber ? {
      status: "READY",
      lastError: null,
    } : {
      status: "READY",
      phoneNumberSid: purchased.sid,
      phoneNumber: purchased.phoneNumber,
      phoneCountry: purchase.country,
      monthlyPriceCents: purchase.monthlyPriceCents,
      priceCurrency: purchase.currency,
      consentAcceptedAt: purchase.consentAcceptedAt,
      lastError: null,
    };
    const [, updatedWorkspace] = await prisma.$transaction([
      prisma.telephonyPurchase.update({
        where: { id: purchase.id },
        data: { status: "ACTIVE", phoneNumberSid: purchased.sid, lastError: null },
      }),
      prisma.telephonyWorkspace.update({
        where: { id: workspace.id },
        data: workspaceData,
      }),
    ]);
    return updatedWorkspace;
  } catch (error) {
    const message = error instanceof Error ? error.message.slice(0, 500) : "Number provisioning failed";
    await prisma.$transaction([
      prisma.telephonyWorkspace.updateMany({
        where: { id: workspace.id },
        data: { lastError: message },
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
  if (EMERGENCY_DESTINATIONS.has(normalized.replace(/^\+/, ""))) {
    throw new Error("Emergency services cannot be called from iCloseLeads");
  }
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
