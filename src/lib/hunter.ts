import type { HunterResponse } from "@/types";

const HUNTER_API_URL = "https://api.hunter.io/v2";

export interface HunterDomainSearchParams {
  domain?: string;
  company?: string;
  limit?: number;
  offset?: number;
}

export interface HunterDomainResult {
  domain: string;
  organization: string;
  emails: {
    value: string;
    type: string;
    confidence: number;
    firstName?: string;
    lastName?: string;
    position?: string;
    phoneNumber?: string;
  }[];
  total: number;
}

export async function searchDomain(
  params: HunterDomainSearchParams
): Promise<HunterDomainResult> {
  const apiKey = process.env.HUNTER_API_KEY;
  if (!apiKey) {
    throw new Error("HUNTER_API_KEY is not configured");
  }

  const searchParams = new URLSearchParams({
    api_key: apiKey,
    limit: String(params.limit ?? 10),
    offset: String(params.offset ?? 0),
  });

  if (params.domain) searchParams.set("domain", params.domain);
  if (params.company) searchParams.set("company", params.company);

  const response = await fetch(
    `${HUNTER_API_URL}/domain-search?${searchParams.toString()}`,
    { next: { revalidate: 0 } }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Unknown error" }));
    throw new Error(
      `Hunter.io API error: ${response.status} - ${
        (error as { message?: string }).message ?? "Unknown error"
      }`
    );
  }

  const data = (await response.json()) as HunterResponse;

  return {
    domain: data.data.domain,
    organization: data.data.organization,
    total: data.meta.results,
    emails: data.data.emails.map((e) => ({
      value: e.value,
      type: e.type,
      confidence: e.confidence,
      firstName: e.first_name,
      lastName: e.last_name,
      position: e.position,
      phoneNumber: e.phone_number,
    })),
  };
}

export async function verifyEmail(email: string): Promise<{
  result: string;
  score: number;
  email: string;
}> {
  const apiKey = process.env.HUNTER_API_KEY;
  if (!apiKey) throw new Error("HUNTER_API_KEY is not configured");

  const params = new URLSearchParams({ email, api_key: apiKey });
  const response = await fetch(
    `${HUNTER_API_URL}/email-verifier?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error(`Hunter.io verification error: ${response.status}`);
  }

  const data = (await response.json()) as {
    data: { result: string; score: number; email: string };
  };
  return data.data;
}
