jest.mock("@/lib/prisma", () => ({ prisma: {} }));

import {
  createGmailOAuthState,
  verifyGmailOAuthState,
} from "./gmail-oauth";

describe("Gmail OAuth state", () => {
  beforeEach(() => {
    process.env.NEXTAUTH_SECRET = "test-nextauth-secret";
  });

  afterAll(() => {
    delete process.env.NEXTAUTH_SECRET;
  });

  it("binds a callback to the originating user", () => {
    const state = createGmailOAuthState("user-123");

    expect(verifyGmailOAuthState(state)).toBe("user-123");
    expect(verifyGmailOAuthState(`${state}x`)).toBeNull();
    expect(verifyGmailOAuthState(state.replace(/.$/, "x"))).toBeNull();
  });

  it("rejects expired state values", () => {
    jest.useFakeTimers();
    try {
      const state = createGmailOAuthState("user-123");
      jest.advanceTimersByTime(10 * 60 * 1000 + 1);
      expect(verifyGmailOAuthState(state)).toBeNull();
    } finally {
      jest.useRealTimers();
    }
  });

  it("fails closed when the signing secret is unavailable", () => {
    const state = createGmailOAuthState("user-123");
    delete process.env.NEXTAUTH_SECRET;

    expect(verifyGmailOAuthState(state)).toBeNull();
  });
});
