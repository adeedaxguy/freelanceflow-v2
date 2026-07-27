/** @jest-environment node */

jest.mock("next-auth", () => ({ getServerSession: jest.fn() }));
jest.mock("@/lib/auth", () => ({ authOptions: {} }));
jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      updateMany: jest.fn(),
    },
  },
}));

import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

let NextRequest: typeof import("next/server").NextRequest;

const validClaim = {
  action: "share",
  source: "local-leads",
  openedPlatforms: ["linkedin", "facebook"],
  linkedinPostUrl: "https://www.linkedin.com/posts/example_activity-1234567890123456789",
  facebookPostUrl: "https://www.facebook.com/example.user/posts/1234567890",
};

describe("/api/leads/claim-bonus", () => {
  beforeAll(async () => {
    ({ NextRequest } = await import("next/server"));
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { id: "user-free-1", email: "free@example.com" },
    });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      bonusClaimed: "[]",
      bonusLeads: 0,
      referralCode: "REFCODE1",
      email: "free@example.com",
    });
    (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.user.updateMany as jest.Mock).mockResolvedValue({ count: 1 });
  });

  it("rejects the legacy unverified subscribe claim", async () => {
    const { POST } = await import("@/app/api/leads/claim-bonus/route");
    const request = new NextRequest("http://localhost/api/leads/claim-bonus", {
      method: "POST",
      body: JSON.stringify({ action: "subscribe", source: "local-leads" }),
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    expect(prisma.user.updateMany).not.toHaveBeenCalled();
  });

  it("rejects social profile URLs that do not prove a published post", async () => {
    const { POST } = await import("@/app/api/leads/claim-bonus/route");
    const request = new NextRequest("http://localhost/api/leads/claim-bonus", {
      method: "POST",
      body: JSON.stringify({
        ...validClaim,
        linkedinPostUrl: "https://www.linkedin.com/in/example",
        facebookPostUrl: "https://www.facebook.com/example.user",
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    expect(prisma.user.updateMany).not.toHaveBeenCalled();
  });

  it("grants one account-wide 300 lead bonus for valid post proof", async () => {
    const { POST } = await import("@/app/api/leads/claim-bonus/route");
    const request = new NextRequest("http://localhost/api/leads/claim-bonus", {
      method: "POST",
      body: JSON.stringify(validClaim),
    });

    const response = await POST(request);
    const data = await response.json() as {
      success: boolean;
      bonusAdded: number;
      bonusLeads: number;
      newLimit: number;
    };

    expect(response.status).toBe(200);
    expect(data).toMatchObject({
      success: true,
      bonusAdded: 300,
      bonusLeads: 300,
      newLimit: 400,
    });
    expect(prisma.user.updateMany).toHaveBeenCalledWith({
      where: expect.objectContaining({ id: "user-free-1" }),
      data: expect.objectContaining({
        bonusLeads: { increment: 300 },
        bonusClaimed: expect.stringContaining('"share"'),
      }),
    });
  });

  it("does not grant another bonus from a different lead tool", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      bonusClaimed: JSON.stringify(["share:local-leads"]),
      bonusLeads: 300,
      referralCode: "REFCODE1",
      email: "free@example.com",
    });

    const { POST } = await import("@/app/api/leads/claim-bonus/route");
    const request = new NextRequest("http://localhost/api/leads/claim-bonus", {
      method: "POST",
      body: JSON.stringify({ ...validClaim, source: "remote-leads" }),
    });

    const response = await POST(request);
    const data = await response.json() as { alreadyClaimed: boolean; bonusAdded: number };

    expect(response.status).toBe(200);
    expect(data).toMatchObject({ alreadyClaimed: true, bonusAdded: 0 });
    expect(prisma.user.updateMany).not.toHaveBeenCalled();
  });

  it("blocks proof links that another account already used", async () => {
    (prisma.user.findFirst as jest.Mock).mockResolvedValue({ id: "another-user" });

    const { POST } = await import("@/app/api/leads/claim-bonus/route");
    const request = new NextRequest("http://localhost/api/leads/claim-bonus", {
      method: "POST",
      body: JSON.stringify(validClaim),
    });

    const response = await POST(request);

    expect(response.status).toBe(409);
    expect(prisma.user.updateMany).not.toHaveBeenCalled();
  });

  it("awards nothing when a concurrent request already claimed the bonus", async () => {
    (prisma.user.updateMany as jest.Mock).mockResolvedValue({ count: 0 });

    const { POST } = await import("@/app/api/leads/claim-bonus/route");
    const request = new NextRequest("http://localhost/api/leads/claim-bonus", {
      method: "POST",
      body: JSON.stringify(validClaim),
    });

    const response = await POST(request);
    const data = await response.json() as { alreadyClaimed: boolean; bonusAdded: number };

    expect(response.status).toBe(200);
    expect(data).toMatchObject({ alreadyClaimed: true, bonusAdded: 0 });
  });
});
