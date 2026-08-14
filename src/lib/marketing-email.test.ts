import {
  createUnsubscribeToken,
  renderMarketingEmail,
  verifyUnsubscribeToken,
} from "@/lib/marketing-email";

describe("marketing email", () => {
  beforeAll(() => {
    process.env.NEXTAUTH_SECRET = "test-secret-that-is-not-used-in-production";
  });

  it("creates a recipient-bound unsubscribe token", () => {
    const token = createUnsubscribeToken("user-1", "person@example.com");

    expect(verifyUnsubscribeToken(token, "person@example.com")).toBe("user-1");
    expect(verifyUnsubscribeToken(token, "someone-else@example.com")).toBeNull();
  });

  it("personalizes and escapes campaign content", () => {
    const rendered = renderMarketingEmail({
      userId: "user-1",
      name: "Alex Rivera",
      email: "alex@example.com",
      subject: "Welcome <script>alert(1)</script>",
      message: "Hi {name},\n\n<script>alert(1)</script>\n\n• Pick one city\n• Save a useful lead",
    });

    expect(rendered.html).toContain("Hi Alex");
    expect(rendered.html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
    expect(rendered.html).not.toContain("<script>alert(1)</script>");
    expect(rendered.html).toContain("Unsubscribe");
    expect(rendered.text).toContain("dashboard/local-leads");
  });
});
