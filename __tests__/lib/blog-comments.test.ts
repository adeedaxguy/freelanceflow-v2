import { assessBlogComment, stripCommentHtml } from "@/lib/blog-comments";

jest.mock("@/lib/prisma", () => ({ prisma: {} }));

describe("blog comment spam checks", () => {
  it("strips html and control noise from comments", () => {
    expect(stripCommentHtml("<b>Hello</b>\n\nworld")).toBe("Hello world");
  });

  it("allows normal thoughtful comments", () => {
    const result = assessBlogComment({
      name: "Sarah Khan",
      email: "sarah@example.com",
      content: "This is useful. I liked the section about qualifying prospects before outreach.",
      startedAt: Date.now() - 10_000,
      now: Date.now(),
      userAgent: "Mozilla/5.0",
    });

    expect(result.blocked).toBe(false);
  });

  it("blocks common spam patterns", () => {
    const result = assessBlogComment({
      name: "Best Casino Deals",
      email: "bot@mailinator.com",
      content: "Buy cheap backlinks now at https://example.com and https://example.net",
      honeypot: "https://spam.example",
      startedAt: Date.now(),
      now: Date.now(),
      userAgent: "",
    });

    expect(result.blocked).toBe(true);
    expect(result.reasons).toEqual(expect.arrayContaining(["honeypot", "submitted_too_fast", "spam_keyword"]));
  });
});
