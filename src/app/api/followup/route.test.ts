/** @jest-environment node */
jest.mock("next-auth", () => ({ getServerSession: jest.fn() }));
jest.mock("@/lib/auth", () => ({ authOptions: {} }));
jest.mock("@/lib/trial-access", () => ({ getTrialAccessError: jest.fn() }));
jest.mock("@/lib/mailer", () => ({ sendMail: jest.fn() }));
jest.mock("@/lib/prisma", () => ({ prisma: { followUp: { findMany: jest.fn() } } }));
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { GET } from "./route";
it("reports a storage outage as an error rather than an empty account", async () => {
  (getServerSession as jest.Mock).mockResolvedValue({ user: { id: "user-1" } });
  (prisma.followUp.findMany as jest.Mock).mockRejectedValue(new Error("Database unavailable"));
  const response = await GET(new NextRequest("https://icloseleads.com/api/followup"));
  expect(response.status).toBe(503);
  expect(await response.json()).toHaveProperty("error");
  expect(prisma.followUp.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { userId: "user-1" } }));
});
