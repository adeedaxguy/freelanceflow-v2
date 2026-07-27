import { NextRequest, NextResponse } from "next/server";
import type { SitePreviewSearchParams } from "@/components/SitePreviewPageContent";
import { encodeSiteShare } from "@/lib/site-share";

const ALLOWED_KEYS = [
  "company",
  "category",
  "location",
  "address",
  "phone",
  "website",
  "maps",
  "pitch",
  "status",
  "style",
  "theme",
  "sections",
  "images",
  "contentDepth",
  "conversionGoal",
  "layout",
  "prompt",
  "variation",
  "headline",
  "subheadline",
  "cta",
  "accent",
] as const;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { search?: string };
    const source = new URLSearchParams(body.search ?? "");
    const params: SitePreviewSearchParams = { client: "1" };

    for (const key of ALLOWED_KEYS) {
      const value = source.get(key)?.trim();
      if (value) params[key] = value.slice(0, key === "prompt" ? 720 : 300);
    }

    if (!params.company) {
      return NextResponse.json({ error: "Business name is required" }, { status: 400 });
    }

    const token = encodeSiteShare(params);
    const configuredOrigin = process.env.SITE_SHARE_ORIGIN || process.env.NEXT_PUBLIC_SITE_SHARE_ORIGIN;
    const origin = (configuredOrigin || request.nextUrl.origin).replace(/\/+$/, "");
    return NextResponse.json({ url: `${origin}/s/${token}` });
  } catch {
    return NextResponse.json({ error: "Could not create a share link" }, { status: 500 });
  }
}
