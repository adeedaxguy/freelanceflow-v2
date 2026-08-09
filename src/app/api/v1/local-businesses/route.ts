import { NextRequest } from "next/server";
import { authorizePublicApi } from "@/lib/public-api";
import { apiError, apiResponse } from "@/lib/public-api-response";
import { findPublicLocalBusinesses, publicLocalSearchSchema } from "@/lib/public-api-search";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await authorizePublicApi(request, "local-businesses:read");
  if (!auth.ok) return apiError(auth);

  const parsed = publicLocalSearchSchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!parsed.success) {
    return apiResponse({
      error: {
        code: "invalid_request",
        message: "Check the query parameters and try again.",
        details: parsed.error.flatten().fieldErrors,
      },
    }, auth, 400);
  }

  try {
    const result = await findPublicLocalBusinesses(parsed.data, auth.userId);
    return apiResponse({ object: "list", ...result }, auth);
  } catch (error) {
    console.error("[public-api/local-businesses]", error);
    return apiResponse({
      error: { code: "search_unavailable", message: "Local business search is temporarily unavailable." },
    }, auth, 503);
  }
}
