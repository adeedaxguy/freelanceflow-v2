/** @jest-environment node */
import { groqCompletionOptions, GROQ_MODEL } from "./groq-model";
import { generateProposal, supportChat } from "./groq";
import { createVoiceAgentState, generateVoiceAgentTurn } from "./ai-voice-agent";
const originalFetch = global.fetch;
const originalKey = process.env.GROQ_API_KEY;
beforeEach(() => { process.env.GROQ_API_KEY = "test-only"; global.fetch = jest.fn(); });
afterEach(() => { global.fetch = originalFetch; if (originalKey) process.env.GROQ_API_KEY = originalKey; else delete process.env.GROQ_API_KEY; });
it("uses a supported model with reasoning excluded and bounded completion space", () => {
  expect(groqCompletionOptions(400)).toEqual({ model: "openai/gpt-oss-120b", reasoning_effort: "low", include_reasoning: false, max_completion_tokens: 1424 });
});
it("keeps the legacy proposal response contract after migration", async () => {
  (fetch as jest.Mock).mockResolvedValue(new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify({ subject: "Example proposal", body: "A concise proposal using provided context." }) } }] })));
  const result = await generateProposal({ jobTitle: "React developer", company: "Example", description: "An accessible form", expertise: ["React"], userBio: "", userName: "Alex", niche: "web-development" });
  expect(result.source).toBe("groq");
  expect(JSON.parse((fetch as jest.Mock).mock.calls[0][1].body).model).toBe(GROQ_MODEL);
});
it("keeps support escalation behavior after migration", async () => {
  (fetch as jest.Mock).mockResolvedValue(new Response(JSON.stringify({ choices: [{ message: { content: "ESCALATE: Account help is needed.", reasoning: "Not for display" } }] })));
  const result = await supportChat([{ role: "user", content: "I need human help with my account" }]);
  expect(result).toMatchObject({ reply: "Account help is needed.", shouldCreateTicket: true });
  expect(JSON.parse((fetch as jest.Mock).mock.calls[0][1].body).include_reasoning).toBe(false);
});
it("keeps structured voice-agent results without exposing reasoning", async () => {
  const state = createVoiceAgentState({ companyName: "Example", contactName: "Alex", campaignContext: "Requested callback", consentBasis: "Explicit request" });
  (fetch as jest.Mock).mockResolvedValue(new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify({ reply: "Thank you. What time would suit you?", stage: "CALLBACK", outcome: "ACTIVE", endCall: false }), reasoning: "Not for display" } }] })));
  const result = await generateVoiceAgentTurn(state, "Please call later", "test-only");
  expect(result.reply).toBe("Thank you. What time would suit you?");
  expect(JSON.parse((fetch as jest.Mock).mock.calls[0][1].body).model).toBe(GROQ_MODEL);
});
