import { CALL_AGENT_PROMPT, CALL_SECONDS, LOFTS_PROFILE, callWindowOpen, campaignInputSchema, leadCallBlocker, localCallDate, managedAgentConfig, normalizeCallingNumber, type CallingCampaign } from "./admin-calling-model";

const now = new Date("2026-09-15T02:00:00Z");
const campaign: CallingCampaign = {
  id: "c", userId: "admin", category: "Dentists", city: "Sydney", country: "AU", timezone: "Australia/Sydney", status: "running", sources: [], createdAt: now.toISOString(), approvedDate: "2026-09-15",
  leads: [{ id: "l", name: "Consenting test", phone: "+61280001234", address: "Sydney", website: "", source: "", countryVerified: true,
    brief: { facts: "Test business", offer: "Website review", question: "What do you need?", checkedAt: now.toISOString(), status: "unavailable", sources: [] },
    consent: { evidence: "Owner agreed to an AI test call from Lofts Studio to this number.", obtainedAt: "2026-09-14T01:00:00Z", approvedAt: now.toISOString(), approvedBy: "admin" } }],
};
it.each([
  ["(02) 8000 1234", "AU", "+61280001234"], ["0412 345 678", "AU", "+61412345678"],
  ["+61 3 9000 1234", "AU", "+61390001234"], ["0061280001234", "AU", "+61280001234"],
  ["416-555-0123", "CA", "+14165550123"], ["1 (604) 555-0123", "CA", "+16045550123"],
  ["911", "CA", ""], ["000", "AU", ""], ["+19001234567", "AU", ""],
  ["1800 123 456", "AU", ""], ["4165550123 ext 9", "CA", ""], ["+14165550123,,9", "CA", ""],
])("normalizes direct numbers without extensions or service numbers: %s", (raw, country, expected) => expect(normalizeCallingNumber(raw, country as "AU" | "CA")).toBe(expected));
it("requires a timezone in the selected country", () => {
  expect(campaignInputSchema.safeParse({ category: "Dental", city: "Toronto", country: "CA", timezone: "Australia/Sydney" }).success).toBe(false);
  expect(campaignInputSchema.safeParse({ category: "Dental", city: "Toronto", country: "CA", timezone: "America/Toronto" }).success).toBe(true);
});
it("uses recipient time, including Canadian half-hour timezones", () => {
  expect(callWindowOpen("Australia/Sydney", now)).toBe(true);
  expect(callWindowOpen("America/Toronto", now)).toBe(false);
  expect(callWindowOpen("Australia/Sydney", new Date("2026-09-19T02:00:00Z"))).toBe(false);
  expect(callWindowOpen("America/St_Johns", new Date("2026-09-15T12:29:00Z"))).toBe(false);
  expect(callWindowOpen("America/St_Johns", new Date("2026-09-15T12:30:00Z"))).toBe(true);
  expect(localCallDate("Australia/Sydney", new Date("2026-09-14T15:00:00Z"))).toBe("2026-09-15");
});
it("fails closed for missing consent, country, opt-outs, stale research and daily approval", () => {
  const lead = campaign.leads[0]!;
  expect(leadCallBlocker(campaign, lead, now)).toBeNull();
  expect(leadCallBlocker(campaign, { ...lead, consent: undefined }, now)).toMatch(/consent/);
  expect(leadCallBlocker(campaign, { ...lead, suppressed: true }, now)).toMatch(/do-not-call/);
  expect(leadCallBlocker(campaign, { ...lead, countryVerified: false }, now)).toMatch(/country/);
  expect(leadCallBlocker(campaign, { ...lead, brief: { ...lead.brief!, checkedAt: "2025-01-01" } }, now)).toMatch(/Refresh/);
  expect(leadCallBlocker({ ...campaign, approvedDate: "2026-09-14" }, lead, now)).toMatch(/today/);
  expect(leadCallBlocker(campaign, { ...lead, consent: { ...lead.consent!, obtainedAt: "2025-01-01" } }, now)).toMatch(/Renew/);
});
it("creates a disclosed, bounded agent without fake booking or audio recording", () => {
  const config = managedAgentConfig("female-voice", "https://icloseleads.com/api/admin-calling/opt-out");
  expect(config.conversation_config.conversation.max_duration_seconds).toBe(CALL_SECONDS);
  expect(config.platform_settings.call_limits).toEqual({ agent_concurrency_limit: 1, daily_limit: 10, bursting_enabled: false });
  expect(config.platform_settings.auth.enable_auth).toBe(true);
  expect(config.platform_settings.privacy.record_voice).toBe(false);
  expect(config.conversation_config.agent.first_message).toContain("AI assistant");
  expect(config.conversation_config.agent.prompt.tools[0]!.api_schema.request_headers["x-call-token"]).toEqual({ variable_name: "secret__call_token" });
  expect(CALL_AGENT_PROMPT).toMatch(/Booking and SMS are NOT connected/);
  expect(CALL_AGENT_PROMPT).toMatch(/untrusted source material/);
  expect(LOFTS_PROFILE.approved).toBe(false);
});
