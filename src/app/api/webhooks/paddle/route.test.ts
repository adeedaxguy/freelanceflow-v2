import type { NextRequest } from "next/server";

jest.mock("next/server", () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      json: async () => body,
    }),
  },
}));

import { POST } from "./route";

function request(body: string, signature = "") {
  return {
    text: async () => body,
    headers: {
      get: (name: string) => name.toLowerCase() === "paddle-signature" ? signature : null,
    },
  } as unknown as NextRequest;
}

describe("Paddle webhook", () => {
  const originalSecret = process.env.PADDLE_WEBHOOK_SECRET;

  afterEach(() => {
    process.env.PADDLE_WEBHOOK_SECRET = originalSecret;
  });

  it("refuses unsigned events before touching billing data", async () => {
    process.env.PADDLE_WEBHOOK_SECRET = "pdl_ntfset_test";

    const response = await POST(request(JSON.stringify({
      event_type: "subscription.created",
    })));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "Invalid signature." });
  });
});
