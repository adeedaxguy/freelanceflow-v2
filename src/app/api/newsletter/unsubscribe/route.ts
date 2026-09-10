import { NextRequest } from "next/server";
import { unsubscribeNewsletter } from "@/lib/newsletter";
import { newsletterPage } from "@/lib/newsletter-page";

export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token") || "";
  if (!/^[a-zA-Z0-9_-]{1,80}\.[a-zA-Z0-9_-]{43}$/.test(token)) return newsletterPage("Invalid link", "Use the unsubscribe link from your latest email.", 400);
  return newsletterPage("Unsubscribe", "Stop receiving this email topic. Your account and other email preferences will not change.", 200, `/api/newsletter/unsubscribe?token=${token}`);
}
export async function POST(req: NextRequest) {
  try {
    if (await unsubscribeNewsletter(req.nextUrl.searchParams.get("token") || "")) return newsletterPage("You are unsubscribed", "You will no longer receive this email topic. Your other email preferences have not changed.");
    return newsletterPage("Invalid link", "Use the unsubscribe link from your latest email.", 400);
  } catch {
    return newsletterPage("Unsubscribe unavailable", "Please try again later or contact support.", 503);
  }
}
