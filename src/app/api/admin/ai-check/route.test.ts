/** @jest-environment node */
jest.mock("next-auth", () => ({ getServerSession: jest.fn() }));
jest.mock("@/lib/auth", () => ({ authOptions: {} }));
jest.mock("@/lib/proposal-ai", () => ({ generateProposalAI: jest.fn() }));
jest.mock("@/lib/security-rate-limit", () => ({ securityRateLimit: jest.fn() }));
import { getServerSession } from "next-auth";
import { generateProposalAI } from "@/lib/proposal-ai";
import { securityRateLimit } from "@/lib/security-rate-limit";
import { POST } from "./route";
beforeEach(() => { jest.clearAllMocks(); (securityRateLimit as jest.Mock).mockResolvedValue({ allowed: true }); });
it("does not allow a visitor or regular user to run paid provider checks", async () => {
  for (const session of [null, { user: { id: "user", role: "USER" } }]) {
    (getServerSession as jest.Mock).mockResolvedValue(session);
    expect((await POST()).status).toBe(403);
  }
  expect(generateProposalAI).not.toHaveBeenCalled();
});
it("returns only diagnostic fields, not generated content", async () => {
  (getServerSession as jest.Mock).mockResolvedValue({ user: { id: "admin", role: "ADMIN" } });
  (generateProposalAI as jest.Mock).mockResolvedValue({ proposal: { subject: "Private result", body: "Private result" }, source: "groq", failures: [] });
  expect(await (await POST()).json()).toEqual({ connected: true, provider: "groq", failures: [] });
  (securityRateLimit as jest.Mock).mockResolvedValue({ allowed: false });
  expect((await POST()).status).toBe(429);
});
