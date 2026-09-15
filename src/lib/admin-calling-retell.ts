import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { getPlatformSetting } from "./platform-secrets";
import { CALL_AGENT_PROMPT, CALL_SECONDS, type CallingSetup } from "./admin-calling-model";

export const RETELL_SECRET_KEY = "admin_calling_retell_key";
export const retellKey = async () => await getPlatformSetting(RETELL_SECRET_KEY) || process.env.RETELL_API_KEY || "";
export const RETELL_GREETING = "Hello, I'm Maya, an AI assistant calling for {{studio_name}} about website services. This call is transcribed and temporarily recorded for processing. We keep written notes, not audio. You can ask me to stop at any time. Is now a good time for one quick question?";
const providerId = z.string().regex(/^[a-zA-Z0-9_-]{5,100}$/);
export async function retellRequest<T>(path: string, init: RequestInit = {}, keyOverride?: string): Promise<T> {
  const key = keyOverride || await retellKey();
  if (!key) throw new Error("Connect Retell before enabling AI calls.");
  const response = await fetch(`https://api.retellai.com${path}`, {
    ...init, headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    signal: AbortSignal.timeout(7000), cache: "no-store", redirect: "error",
  });
  if (!response.ok) throw Object.assign(new Error(`Retell rejected the request (${response.status}). Check the API key, permissions and trial balance.`), { status: response.status });
  return response.json() as Promise<T>;
}

export async function retellVoices(key?: string) {
  const voices = z.array(z.object({ voice_id: providerId, voice_name: z.string().max(200), provider: z.string(), gender: z.string(), accent: z.string().optional() }))
    .parse(await retellRequest("/list-voices", {}, key));
  // Platform and Cartesia voices avoid ElevenLabs' higher per-minute voice fee.
  return voices.filter(v => v.gender === "female" && ["platform", "cartesia"].includes(v.provider))
    .map(v => ({ id: v.voice_id, name: v.voice_name, accent: v.accent || "" }));
}

export function retellLlmConfig(toolUrl: string) {
  return {
    model: "gpt-4.1-mini", model_temperature: 0.2, model_high_priority: false,
    start_speaker: "agent", begin_message: RETELL_GREETING, general_prompt: CALL_AGENT_PROMPT,
    states: null, mcps: null, knowledge_base_ids: [],
    general_tools: [
      { type: "end_call", name: "end_call", description: "End immediately on refusal, voicemail or when the conversation is finished." },
      { type: "custom", name: "record_opt_out", description: "Suppress this caller immediately when they withdraw consent or ask not to be called. Takes no arguments.",
        url: toolUrl, method: "POST", headers: { "x-call-token": "{{secret__call_token}}" },
        parameters: { type: "object", properties: {} },
        speak_during_execution: false, speak_after_execution: true, timeout_ms: 5000, max_retry: 0 },
    ],
  };
}

export function retellAgentConfig(voiceId: string, llmId: string, webhookUrl: string) {
  return {
    agent_name: "iCloseLeads admin pilot - Lofts Studio",
    response_engine: { type: "retell-llm", llm_id: llmId }, voice_id: voiceId,
    voice_speed: 0.95, language: "en-US", responsiveness: 0.8, interruption_sensitivity: 0.9,
    enable_backchannel: false, ambient_sound: null, fallback_voice_ids: [],
    max_call_duration_ms: CALL_SECONDS * 1000, end_call_after_silence_ms: 20000,
    voicemail_option: { action: { type: "hangup" } }, ivr_option: { action: { type: "hangup" } },
    data_storage_setting: "basic_attributes_only", data_storage_retention_days: 30, opt_in_signed_url: true,
    webhook_url: webhookUrl, webhook_events: ["call_ended", "call_analyzed"], webhook_timeout_ms: 10000,
    post_call_analysis_model: "gpt-4.1-mini",
  };
}

export async function provisionRetell(config: CallingSetup, toolUrl: string, webhookUrl: string) {
  const llm = z.object({ llm_id: providerId }).parse(await retellRequest(config.llmId ? `/update-retell-llm/${encodeURIComponent(config.llmId)}` : "/create-retell-llm", {
    method: config.llmId ? "PATCH" : "POST", body: JSON.stringify(retellLlmConfig(toolUrl)),
  }));
  const agent = z.object({ agent_id: providerId }).parse(await retellRequest(config.agentId ? `/update-agent/${encodeURIComponent(config.agentId)}` : "/create-agent", {
    method: config.agentId ? "PATCH" : "POST", body: JSON.stringify(retellAgentConfig(config.voiceId, llm.llm_id, webhookUrl)),
  }));
  return { agentId: agent.agent_id, llmId: llm.llm_id };
}

// Compare our managed fields while allowing harmless provider response metadata.
function matches(actual: unknown, expected: unknown): boolean {
  // Retell omits nullable fields after null clears their configuration.
  if (expected === null) return actual === null || actual === undefined;
  if (Array.isArray(expected)) return Array.isArray(actual) && actual.length === expected.length && expected.every((v, i) => matches(actual[i], v));
  if (expected && typeof expected === "object") return Boolean(actual && typeof actual === "object")
    && Object.entries(expected).every(([key, value]) => matches((actual as Record<string, unknown>)[key], value));
  return actual === expected;
}
export async function verifyRetell(config: CallingSetup, toolUrl: string, webhookUrl: string) {
  if (!config.llmId) throw new Error("Verify the Retell agent setup first.");
  const agent = await retellRequest(`/get-agent/${encodeURIComponent(config.agentId)}`);
  const llm = await retellRequest(`/get-retell-llm/${encodeURIComponent(config.llmId)}`);
  if (!matches(agent, retellAgentConfig(config.voiceId, config.llmId, webhookUrl)) || !matches(llm, retellLlmConfig(toolUrl))) {
    throw new Error("The Retell agent changed. Re-verify setup before calling.");
  }
}

export const retellCallSchema = z.object({
  call_id: providerId, agent_id: providerId, call_type: z.literal("phone_call"), direction: z.literal("outbound"),
  from_number: z.string().max(30), to_number: z.string().max(30),
  metadata: z.object({ attemptId: z.string().uuid() }),
  call_status: z.enum(["registered", "ongoing", "ended", "error", "not_connected"]),
  duration_ms: z.number().nonnegative().max(7200000).optional(),
  disconnection_reason: z.string().max(200).optional(),
  transcript_object: z.array(z.object({ role: z.enum(["agent", "user"]), content: z.string().max(30000) })).max(1000).optional(),
  call_analysis: z.object({ call_summary: z.string().max(30000).optional() }).optional(),
});
export type RetellCall = z.infer<typeof retellCallSchema>;
export async function getRetellCall(id: string) {
  return retellCallSchema.parse(await retellRequest(`/v2/get-call/${encodeURIComponent(providerId.parse(id))}`));
}

export function verifyRetellSignature(raw: string, signature: string, key: string, now = Date.now()) {
  const match = /^v=(\d{13}),d=([a-f0-9]{64})$/i.exec(signature);
  if (!key || !match || Math.abs(now - Number(match[1])) > 300000) return false;
  const digest = createHmac("sha256", key).update(raw + match[1]).digest();
  return timingSafeEqual(digest, Buffer.from(match[2]!, "hex"));
}
