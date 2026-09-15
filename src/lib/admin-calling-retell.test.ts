/** @jest-environment node */
jest.mock("server-only", () => ({}));
jest.mock("./platform-secrets", () => ({ getPlatformSetting: jest.fn().mockResolvedValue("test-key") }));
import { createHmac } from "node:crypto";
import { retellVoices, retellRequest, retellAgentConfig, retellLlmConfig, verifyRetell, verifyRetellSignature } from "./admin-calling-retell";
import { LOFTS_PROFILE, type CallingSetup } from "./admin-calling-model";
const config: CallingSetup = { provider: "retell", profile: LOFTS_PROFILE, voiceId: "cartesia-test", phoneId: "workspace:test", agentId: "agent-test", llmId: "llm-test", connected: true, ready: true };
const tool = "https://example.test/opt-out", webhook = "https://example.test/retell";
beforeEach(() => { global.fetch = jest.fn(); });
it("checks signed raw bodies, timestamp age, future signatures and constant-length hashes", () => {
  const raw = '{"event":"call_ended"}', now = 1789500000000, key = "test-key";
  const sign = (time: number) => `v=${time},d=${createHmac("sha256", key).update(raw + time).digest("hex")}`;
  expect(verifyRetellSignature(raw, sign(now), key, now)).toBe(true);
  expect(verifyRetellSignature(raw + " ", sign(now), key, now)).toBe(false);
  expect(verifyRetellSignature(raw, sign(now - 300001), key, now)).toBe(false);
  expect(verifyRetellSignature(raw, sign(now + 300001), key, now)).toBe(false);
  expect(verifyRetellSignature(raw, `v=${now},d=bad`, key, now)).toBe(false);
  expect(verifyRetellSignature(raw, sign(now), "", now)).toBe(false);
});
it("lists only female platform or Cartesia voices without requiring ElevenLabs", async () => {
  (fetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => [
    { voice_id: "cartesia-f", voice_name: "Calm", provider: "cartesia", gender: "female", accent: "Australian" },
    { voice_id: "platform-f", voice_name: "Warm", provider: "platform", gender: "female" },
    { voice_id: "11labs-f", voice_name: "Other", provider: "elevenlabs", gender: "female" },
    { voice_id: "cartesia-m", voice_name: "Male", provider: "cartesia", gender: "male" },
  ] });
  expect((await retellVoices()).map(v => v.id)).toEqual(["cartesia-f", "platform-f"]);
});
it("redacts provider rejection bodies and never retries", async () => {
  (fetch as jest.Mock).mockResolvedValue({ ok: false, status: 402, text: async () => "secret-provider-detail" });
  await expect(retellRequest("/list-voices")).rejects.toThrow("trial balance");
  expect(fetch).toHaveBeenCalledTimes(1);
  expect(fetch).toHaveBeenCalledWith("https://api.retellai.com/list-voices", expect.objectContaining({ redirect: "error", cache: "no-store" }));
});
it.each(["valid", "omitted-null-fields", "duration", "privacy", "prompt", "tool", "extra-tool", "webhook", "model", "states", "mcps", "ambient", "missing-privacy", "missing-recording-url-setting", "missing-tools"])("verifies the managed Retell configuration: %s", async mode => {
  const agent = retellAgentConfig(config.voiceId, config.llmId!, webhook);
  const llm = retellLlmConfig(tool);
  const changed = JSON.parse(JSON.stringify({ agent, llm }));
  if (mode === "duration") changed.agent.max_call_duration_ms = 3600000;
  if (mode === "privacy") changed.agent.data_storage_setting = "everything";
  if (mode === "prompt") changed.llm.general_prompt = "Pretend to be human";
  if (mode === "tool") changed.llm.general_tools[1].url = "https://attacker.test";
  if (mode === "extra-tool") changed.llm.general_tools.push({ type: "send_sms" });
  if (mode === "webhook") changed.agent.webhook_url = "https://attacker.test";
  if (mode === "model") changed.llm.model = "expensive-model";
  if (mode === "states") changed.llm.states = [{ name: "unsafe" }];
  if (mode === "mcps") changed.llm.mcps = [{ url: "https://attacker.test" }];
  if (mode === "ambient") changed.agent.ambient_sound = "call-center";
  if (mode === "missing-privacy") delete changed.agent.data_storage_setting;
  if (mode === "missing-recording-url-setting") delete changed.agent.opt_in_signed_url;
  if (mode === "missing-tools") delete changed.llm.general_tools;
  if (mode === "omitted-null-fields") {
    delete changed.agent.ambient_sound;
    delete changed.llm.states;
    delete changed.llm.mcps;
    expect(changed.llm.general_tools[1].parameters).toEqual({ type: "object", properties: {} });
  }
  (fetch as jest.Mock).mockImplementation(async (url: string) => ({ ok: true, json: async () => url.includes("get-agent/") ? changed.agent : changed.llm }));
  if (["valid", "omitted-null-fields"].includes(mode)) await expect(verifyRetell(config, tool, webhook)).resolves.toBeUndefined();
  else await expect(verifyRetell(config, tool, webhook)).rejects.toThrow("changed");
});
