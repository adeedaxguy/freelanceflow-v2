import { guessEmails } from "./local-leads-engine";

describe("local lead email guesses", () => {
  it("uses the registrable host without a www prefix", () => {
    expect(guessEmails("www.example.com")).toContain("info@example.com");
    expect(guessEmails("https://www.example.com/contact")).toContain("hello@example.com");
  });
});
