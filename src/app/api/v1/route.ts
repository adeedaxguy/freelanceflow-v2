import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    name: "iCloseLeads API",
    version: "v1",
    status: "operational",
    documentation: "https://icloseleads.com/developers",
    openapi: "https://icloseleads.com/api/v1/openapi",
    endpoints: [
      "/api/v1/local-businesses",
      "/api/v1/remote-jobs",
      "/api/v1/live-jobs",
    ],
  }, { headers: { "Cache-Control": "public, max-age=300" } });
}
