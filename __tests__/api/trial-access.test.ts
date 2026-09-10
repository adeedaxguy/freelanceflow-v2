/** @jest-environment node */

jest.mock("next-auth", () => ({ getServerSession: jest.fn() }));
jest.mock("@/lib/auth", () => ({ authOptions: {} }));
jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: jest.fn(), updateMany: jest.fn() },
    lead: { findMany: jest.fn(async () => []) },
    campaign: { findMany: jest.fn(async () => []) },
    template: { findMany: jest.fn(async () => []) },
  },
}));
jest.mock("@/lib/leads-aggregator", () => ({ aggregateLeadsWithDiagnostics: jest.fn() }));
jest.mock("@/lib/local-leads-engine", () => ({ searchLocalBusinesses: jest.fn(), checkRateLimit: jest.fn(() => true) }));
jest.mock("@/lib/audit-log", () => ({ recordAuditLog: jest.fn() }));

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { aggregateLeadsWithDiagnostics } from "@/lib/leads-aggregator";
import { searchLocalBusinesses } from "@/lib/local-leads-engine";

const expiredUser = { email: "trial@example.com", role: "USER", plan: "free", createdAt: new Date("2026-09-01T00:00:00Z"), weeklyLeadReset: new Date("2026-09-01T00:00:00Z"), weeklyLeads: 10, bonusLeads: 300 };
const routes = [
  "ai-proposal", "proposal/generate", "reply/generate", "email/send", "email/prepare",
  "site-preview/share", "leads/claim-bonus", "leads/request-more", "campaigns", "templates", "followup",
];
beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers().setSystemTime(new Date("2026-09-11T12:00:00Z"));
  (getServerSession as jest.Mock).mockResolvedValue({ user: { id: "trial-user", email: expiredUser.email, plan: "agency", role: "USER" } });
  (prisma.user.findUnique as jest.Mock).mockResolvedValue(expiredUser);
});
afterEach(() => jest.useRealTimers());

it.each(routes)("%s blocks expired trials even with a stale paid session", async route => {
  const { POST } = await import(`@/app/api/${route}/route`);
  const res = await POST(new NextRequest(`https://icloseleads.com/api/${route}`, { method: "POST", body: "{}" }));
  expect(res.status).toBe(403);
  expect(await res.json()).toMatchObject({ code: "TRIAL_EXPIRED", upgrade: true });
  expect(prisma.user.updateMany).not.toHaveBeenCalled();
});

it.each(routes)("%s fails closed during a database outage", async route => {
  (prisma.user.findUnique as jest.Mock).mockRejectedValue(new Error("database down"));
  const { POST } = await import(`@/app/api/${route}/route`);
  const res = await POST(new NextRequest(`https://icloseleads.com/api/${route}`, { method: "POST", body: "{}" }));
  expect(res.status).toBe(503);
});

it.each([
  ["leads/search", { niche: "web-design" }],
  ["local-leads/search", { keyword: "dentist", location: "London" }],
])("%s rejects expired trials before contacting lead providers", async (route, body) => {
  const { POST } = await import(`@/app/api/${route}/route`);
  const res = await POST(new NextRequest(`https://icloseleads.com/api/${route}`, { method: "POST", body: JSON.stringify(body) }));
  expect(res.status).toBe(429);
  expect(await res.json()).toMatchObject({ trialExpired: true, bonusAvailable: false });
  expect(aggregateLeadsWithDiagnostics).not.toHaveBeenCalled();
  expect(searchLocalBusinesses).not.toHaveBeenCalled();
});

it.each(["campaigns", "templates"])("keeps existing %s readable after expiry", async route => {
  const { GET } = await import(`@/app/api/${route}/route`);
  expect((await GET()).status).toBe(200);
});
