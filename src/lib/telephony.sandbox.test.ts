/** @jest-environment node */

// Opt in with TWILIO_SANDBOX_ACCOUNT_SID and TWILIO_SANDBOX_AUTH_TOKEN.
// These must be the Console's TEST credentials, never the live account token.
import twilio from "twilio";

const sid = process.env.TWILIO_SANDBOX_ACCOUNT_SID;
const token = process.env.TWILIO_SANDBOX_AUTH_TOKEN;
const client = sid && token ? twilio(sid, token, { timeout: 15_000 }) : null;

(sid && token ? describe : describe.skip)("Twilio provider test credentials (explicit opt-in)", () => {
  beforeAll(async () => {
    // Live SID/auth-token credentials can read their account; test credentials cannot.
    // Fail closed before any POST if ordinary account access unexpectedly succeeds.
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}.json`, {
      headers: { Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}` },
      signal: AbortSignal.timeout(15_000),
    });
    expect(response.status).toBe(403);
  }, 20_000);

  it("simulates buying a number without provisioning a real number", async () => {
    const number = await client!.incomingPhoneNumbers.create({ phoneNumber: "+15005550006" });
    expect(number.phoneNumber).toBe("+15005550006");
    expect(number.sid).toMatch(/^PN/);
  }, 20_000);

  it.each([
    ["+15005550000", 21422],
    ["+15005550001", 21421],
  ])("rejects unavailable/invalid number %s", async (phoneNumber, code) => {
    await expect(client!.incomingPhoneNumbers.create({ phoneNumber: String(phoneNumber) })).rejects.toMatchObject({ code });
  }, 20_000);

  it("simulates an outbound call without dialing or executing TwiML", async () => {
    const call = await client!.calls.create({
      from: "+15005550006", to: "+14155550123", url: "https://demo.twilio.com/docs/voice.xml",
    });
    expect(call.sid).toMatch(/^CA/);
  }, 20_000);

  it.each([
    ["+15005550001", 21217],
    ["+15005550002", 21214],
    ["+15005550003", 21215],
    ["+15005550004", 21216],
  ])("rejects unsupported destination %s", async (to, code) => {
    await expect(client!.calls.create({
      from: "+15005550006", to: String(to), url: "https://demo.twilio.com/docs/voice.xml",
    })).rejects.toMatchObject({ code });
  }, 20_000);
});
