import { NextRequest, NextResponse } from "next/server";
import { sendAdminNotification } from "@/lib/admin-notifications";
import { validateTwilioWebhook } from "@/lib/telephony";

export const dynamic = "force-dynamic";

function formValues(form: FormData) {
  return Object.fromEntries(
    [...form.entries()].filter((entry): entry is [string, string] => typeof entry[1] === "string"),
  );
}

export async function POST(req: NextRequest) {
  const params = formValues(await req.formData());
  const workspace = await validateTwilioWebhook(req, params);
  if (!workspace) return new NextResponse("Invalid signature", { status: 403 });

  await sendAdminNotification({
    subject: "Twilio call usage guard reached",
    title: "Softphone usage needs review",
    lines: [
      `<strong>Workspace:</strong> ${workspace.id}`,
      `<strong>User ID:</strong> ${workspace.userId}`,
      `<strong>Usage category:</strong> ${params.UsageCategory || "calls"}`,
      `<strong>Current value:</strong> ${params.CurrentValue || params.Count || "Threshold reached"}`,
      "Review the workspace in iCloseLeads and Twilio before increasing any limits.",
    ],
  }).catch(error => console.error("[softphone/usage-alert] Admin notification failed", error));

  return new NextResponse(null, { status: 204 });
}
