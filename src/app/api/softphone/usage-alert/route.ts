import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { sendAdminNotification } from "@/lib/admin-notifications";
import { prisma } from "@/lib/prisma";
import { usageAlertSettingKey, validateTwilioWebhook } from "@/lib/telephony";

export const dynamic = "force-dynamic";
const USAGE_ALERT_PREFIX = "twilio_usage_alert:";

function formValues(form: FormData) {
  return Object.fromEntries(
    [...form.entries()].filter((entry): entry is [string, string] => typeof entry[1] === "string"),
  );
}

export async function POST(req: NextRequest) {
  const params = formValues(await req.formData());
  const workspace = await validateTwilioWebhook(req, params);
  if (!workspace) return new NextResponse("Invalid signature", { status: 403 });

  const idempotencyToken = params.IdempotencyToken?.trim();
  if (!idempotencyToken) return new NextResponse("Missing idempotency token", { status: 400 });
  const alertKey = usageAlertSettingKey(idempotencyToken);

  try {
    await prisma.platformSetting.create({
      data: {
        key: alertKey,
        value: new Date().toISOString(),
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return new NextResponse(null, { status: 204 });
    }
    throw error;
  }

  try {
    const result = await sendAdminNotification({
      subject: "Twilio call usage guard reached",
      title: "Softphone usage needs review",
      lines: [
        `<strong>Workspace:</strong> ${workspace.id}`,
        `<strong>User ID:</strong> ${workspace.userId}`,
        `<strong>Usage category:</strong> ${params.UsageCategory || "calls"}`,
        `<strong>Current value:</strong> ${params.CurrentValue || params.Count || "Threshold reached"}`,
        "Review the workspace in iCloseLeads and Twilio before increasing any limits.",
      ],
    });
    if (!result.success) throw new Error("Admin email delivery is not configured");

    await prisma.platformSetting.deleteMany({
      where: {
        key: { startsWith: USAGE_ALERT_PREFIX },
        updatedAt: { lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1_000) },
      },
    }).catch(error => console.error("[softphone/usage-alert] Marker cleanup failed", error));

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    await prisma.platformSetting.delete({ where: { key: alertKey } }).catch(() => undefined);
    console.error("[softphone/usage-alert] Admin notification failed", error);
    return new NextResponse("Notification delivery failed", { status: 500 });
  }
}
