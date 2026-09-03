import {
  createUnsubscribeToken,
  renderMarketingEmail,
  renderWelcomeEmail,
  verifyUnsubscribeToken,
  WELCOME_EMAIL_SUBJECT,
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
    expect(rendered.html).toContain("Log in to your workspace");
    expect(rendered.html).toContain("https://icloseleads.com/auth");
    expect(rendered.html).toContain("icloseleads-email-logo.png");
    expect(rendered.html).toContain("client-acquisition-workflow.png");
    expect(rendered.text).toContain("dashboard/local-leads");
    expect(rendered.text).toContain("Log in to your workspace: https://icloseleads.com/auth");
  });

  it("renders numbered steps and first-party guide links", () => {
    const rendered = renderMarketingEmail({
      userId: "user-1",
      name: "Alex Rivera",
      email: "alex@example.com",
      subject: "A useful update",
      message: "1. Search one city\n2. Save three leads\n\nhttps://icloseleads.com/blog/600-free-leads-per-week-for-freelancers",
    });

    expect(rendered.html).toContain("<ol");
    expect(rendered.html).toContain("Read the 600-lead weekly playbook");
    expect(rendered.html).toContain("https://icloseleads.com/blog/600-free-leads-per-week-for-freelancers");
  });

  it("renders a focused, personalized welcome workflow", () => {
    const rendered = renderWelcomeEmail({ name: "Alex<script>alert(1)</script>" });

    expect(rendered.subject).toBe(WELCOME_EMAIL_SUBJECT);
    expect(rendered.html).toContain("Hi Alex");
    expect(rendered.html).toContain("Alex&lt;script&gt;alert(1)&lt;/script&gt;");
    expect(rendered.html).not.toContain("<script>alert(1)</script>");
    expect(rendered.html).toContain("Your first client-winning loop");
    expect(rendered.html).toContain("up to 600 lead results");
    expect(rendered.html).toContain("Find your first lead");
    expect(rendered.html).toContain("dashboard/local-leads");
    expect(rendered.html).toContain("dashboard/softphone");
    expect(rendered.text).toContain("This one-time onboarding email");
  });
});
