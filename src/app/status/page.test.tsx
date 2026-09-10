import { render, screen } from "@testing-library/react";
jest.mock("@/components/Navbar", () => ({ __esModule: true, default: () => null }));
jest.mock("@/components/Footer", () => ({ __esModule: true, default: () => null }));
jest.mock("@/lib/prisma", () => ({ prisma: { platformSetting: { findUnique: jest.fn() } } }));
import { prisma } from "@/lib/prisma";
import StatusPage from "./page";
it("does not invent service health, latency, or incident history", async () => {
  (prisma.platformSetting.findUnique as jest.Mock).mockResolvedValue(null);
  render(await StatusPage());
  expect(screen.getByText(/Automated uptime monitoring is not connected/)).toBeInTheDocument();
  expect(screen.queryByText("All Systems Operational")).not.toBeInTheDocument();
  expect(screen.queryByText("99.97%")).not.toBeInTheDocument();
  expect(screen.getByText(/No team notices have been published/)).toBeInTheDocument();
});
it("shows an actual published notice with its timestamp", async () => {
  (prisma.platformSetting.findUnique as jest.Mock).mockResolvedValue({ value: JSON.stringify({ subject: "Planned maintenance", message: "The actual published notice.", publishedAt: "2026-09-11T10:00:00.000Z" }) });
  render(await StatusPage());
  expect(screen.getByText("Planned maintenance")).toBeInTheDocument();
  expect(screen.getByText("The actual published notice.")).toBeInTheDocument();
  expect(document.querySelector("time")).toHaveAttribute("dateTime", "2026-09-11T10:00:00.000Z");
});
it("shows unavailable rather than healthy when notice storage fails", async () => {
  (prisma.platformSetting.findUnique as jest.Mock).mockRejectedValue(new Error("Unavailable"));
  render(await StatusPage());
  expect(screen.getByText(/Service notices are temporarily unavailable/)).toBeInTheDocument();
});
