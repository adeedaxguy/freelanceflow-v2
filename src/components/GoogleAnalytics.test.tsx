import { render, waitFor } from "@testing-library/react";
import GoogleAnalytics from "./GoogleAnalytics";

jest.mock("next/navigation", () => ({
  usePathname: () => "/",
  useSearchParams: () => null,
}));

it("queues Google tag commands in the arguments format", async () => {
  delete window.gtag;
  delete window.dataLayer;

  render(<GoogleAnalytics />);

  await waitFor(() => expect(window.dataLayer).toHaveLength(2));
  expect(Object.prototype.toString.call(window.dataLayer?.[0])).toBe("[object Arguments]");
  expect(Array.from(window.dataLayer![1] as IArguments)).toEqual([
    "config",
    "G-WRSW1WG2DY",
    { send_page_view: true },
  ]);
  expect(document.querySelector('script[src="https://www.googletagmanager.com/gtag/js?id=G-WRSW1WG2DY"]')).not.toBeNull();
});
