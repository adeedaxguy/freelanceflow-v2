import { NextResponse } from "next/server";

// Only fixed copy and validated hexadecimal / base64url tokens are rendered here.
export function newsletterPage(title: string, message: string, status = 200, action?: string) {
  return new NextResponse(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} | iCloseLeads</title></head><body style="margin:0;background:#f4f5f8;font-family:Arial,sans-serif;color:#20212a"><main style="max-width:560px;margin:10vh auto;padding:24px"><h1>${title}</h1><p style="line-height:1.6">${message}</p>${action ? `<form method="post" action="${action}"><button style="padding:12px 20px;background:#5b3de1;color:white;border:0;border-radius:8px;font:inherit;cursor:pointer" type="submit">${title}</button></form>` : ""}<p><a href="https://icloseleads.com">Return to iCloseLeads</a></p></main></body></html>`, {
    status, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "Referrer-Policy": "no-referrer", "X-Robots-Tag": "noindex, nofollow" },
  });
}
