export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyUnsubscribeToken } from "@/lib/marketing-email";

function page(title: string, message: string, status = 200) {
  return new NextResponse(`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head><body style="margin:0;background:#f4f3f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#171522"><main style="max-width:560px;margin:12vh auto;padding:32px;background:#fff;border:1px solid #dedbe8;border-radius:14px"><h1 style="margin-top:0">${title}</h1><p style="line-height:1.6;color:#625d70">${message}</p><a href="https://icloseleads.com/dashboard/settings" style="color:#5b3bc4">Open email preferences</a></main></body></html>`, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
  });
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token") || "";
  const userId = token.slice(0, token.lastIndexOf("."));
  if (!userId) return page("Invalid unsubscribe link", "This link is incomplete or no longer valid.", 400);

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, email: true } });
  if (!user || verifyUnsubscribeToken(token, user.email) !== user.id) {
    return page("Invalid unsubscribe link", "This link is incomplete or no longer valid.", 400);
  }

  await prisma.user.update({ where: { id: user.id }, data: { marketingConsent: false } });
  return page("You are unsubscribed", "You will no longer receive optional iCloseLeads product and marketing emails. Account and security messages may still be sent when required.");
}
