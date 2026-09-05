jest.mock("server-only", () => ({}));

import { openSecret, readStoredSecret, sealSecret } from "./secret-box";

describe("secret box", () => {
  beforeEach(() => {
    process.env.NEXTAUTH_SECRET = "test-nextauth-secret";
  });

  afterAll(() => {
    delete process.env.NEXTAUTH_SECRET;
  });

  it("round-trips credentials without storing plaintext", () => {
    const sealed = sealSecret("smtp-password");

    expect(sealed).toMatch(/^enc:v1:/);
    expect(sealed).not.toContain("smtp-password");
    expect(openSecret(sealed)).toBe("smtp-password");
  });

  it("rejects tampering and still reads legacy values", () => {
    const sealed = sealSecret("refresh-token");
    const [iv, tag, ciphertext] = sealed.slice("enc:v1:".length).split(".");
    const changedTag = `${tag?.[0] === "A" ? "B" : "A"}${tag?.slice(1) ?? ""}`;
    expect(openSecret(`enc:v1:${iv}.${changedTag}.${ciphertext}`)).toBeNull();
    expect(readStoredSecret("legacy-token")).toBe("legacy-token");
  });
});
