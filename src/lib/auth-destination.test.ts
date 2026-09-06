import { getAuthDestination } from "./auth-destination";

it("preserves checkout selection and search intent through authentication", () => {
  expect(getAuthDestination("/dashboard/upgrade?plan=agency", "", "/dashboard")).toBe("/dashboard/upgrade?plan=agency");
  expect(getAuthDestination(null, "pro", "/dashboard")).toBe("/dashboard/upgrade?plan=pro");
  expect(getAuthDestination(null, "", "/dashboard/local-leads")).toBe("/dashboard/local-leads");
});
it.each(["https://attacker.example/dashboard", "//attacker.example/dashboard", "/auth", "javascript:alert(1)", "/dashboard-evil"])("rejects unsafe return paths: %s", value => {
  expect(getAuthDestination(value, "", "/dashboard")).toBe("/dashboard");
});
