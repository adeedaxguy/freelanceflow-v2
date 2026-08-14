import { extractEmailAddress, plainTextFromEmail } from "@/lib/admin-mailbox";

describe("admin mailbox helpers", () => {
  it("normalizes senders and converts untrusted HTML into readable plain text", () => {
    expect(extractEmailAddress("Alex Example <alex@example.com>")).toBe("alex@example.com");
    expect(plainTextFromEmail(null, "<style>bad{}</style><p>Hello &amp; welcome</p><script>alert(1)</script>"))
      .toBe("Hello & welcome");
  });
});
