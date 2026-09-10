import { NextRequest } from "next/server";
import { confirmNewsletter } from "@/lib/newsletter";
import { newsletterPage } from "@/lib/newsletter-page";

export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token") || "";
  if (!/^[a-f0-9]{64}$/.test(token)) return newsletterPage("Invalid link", "Request a new confirmation from the status or changelog page.", 400);
  return newsletterPage("Confirm subscription", "Confirm that you want the email updates you requested. You can unsubscribe at any time.", 200, `/api/newsletter/confirm?token=${token}`);
}
export async function POST(req: NextRequest) {
  try {
    if (await confirmNewsletter(req.nextUrl.searchParams.get("token") || "")) return newsletterPage("Subscription confirmed", "You will receive the updates you selected. Every update includes an unsubscribe link.");
    return newsletterPage("Link expired or already used", "If you already confirmed, no action is needed. Otherwise, request a new confirmation from the status or changelog page.", 400);
  } catch {
    return newsletterPage("Confirmation unavailable", "Please try this link again later.", 503);
  }
}
