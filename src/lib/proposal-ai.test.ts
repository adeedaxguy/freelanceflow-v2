/** @jest-environment node */
jest.mock("./platform-secrets", () => ({ getPlatformSetting: jest.fn() }));
import { getPlatformSetting } from "./platform-secrets";
import { generateProposalAI } from "./proposal-ai";

const input = { jobTitle: "React Developer", company: "Example", description: "Build an accessible booking form.", expertise: "React", userName: "Alex", portfolioLinks: [] };
const proposal = { subject: "React booking form", body: "I would like to help with your accessible React booking form. [Add a relevant work example.]\nAlex" };
const originalFetch = global.fetch;
const env = { ...process.env };
const fetchMock = jest.fn();
beforeEach(() => {
  jest.clearAllMocks(); global.fetch = fetchMock;
  delete process.env.GROQ_API_KEY; delete process.env.OPENAI_API_KEY;
  (getPlatformSetting as jest.Mock).mockResolvedValue("");
});
afterEach(() => { global.fetch = originalFetch; process.env = { ...env }; });

it("does not invent AI success when no provider is configured", async () => {
  expect(await generateProposalAI(input)).toMatchObject({ proposal: null, source: "template", failures: [{ provider: "groq", reason: "not_configured" }, { provider: "openai", reason: "not_configured" }] });
  expect(fetchMock).not.toHaveBeenCalled();
});
it("passes the actual brief and truthful-claims instructions to the provider", async () => {
  process.env.GROQ_API_KEY = "test-only";
  fetchMock.mockResolvedValue(new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify(proposal) } }] })));
  expect(await generateProposalAI(input)).toMatchObject({ proposal, source: "groq" });
  const body = JSON.parse(fetchMock.mock.calls[0][1].body);
  expect(body.model).toBe("openai/gpt-oss-120b");
  expect(body.include_reasoning).toBe(false);
  expect(body.max_completion_tokens).toBeGreaterThan(900);
  expect(body.max_tokens).toBeUndefined();
  expect(body.messages[1].content).toContain(input.description);
  expect(body.messages[0].content).toContain("Do not invent experience");
  expect(body.messages[0].content).toContain("NOT the applicant's history");
  expect(body.messages[0].content).toContain("[Add one truthful example of your relevant work.]");
});
it.each([[401, "authentication"], [429, "rate_limit"], [500, "provider_error"]])("diagnoses HTTP %s without leaking provider response or credentials", async (status, reason) => {
  process.env.GROQ_API_KEY = "secret-value";
  fetchMock.mockResolvedValue(new Response("secret-value sensitive details", { status: status as number }));
  const result = await generateProposalAI(input);
  expect(result.failures[0]).toEqual({ provider: "groq", status, reason });
  expect(JSON.stringify(result)).not.toContain("secret-value");
});
it("uses the existing OpenAI provider when Groq fails", async () => {
  process.env.GROQ_API_KEY = "test-groq"; process.env.OPENAI_API_KEY = "test-openai";
  fetchMock.mockResolvedValueOnce(new Response("", { status: 429 })).mockResolvedValueOnce(new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify(proposal) } }] })));
  expect(await generateProposalAI(input)).toMatchObject({ proposal, source: "openai" });
});
it("rejects invalid or empty model output", async () => {
  process.env.GROQ_API_KEY = "test-only";
  fetchMock.mockResolvedValue(new Response(JSON.stringify({ choices: [{ message: { content: '{"body":""}' } }] })));
  expect(await generateProposalAI(input)).toMatchObject({ proposal: null, failures: [{ provider: "groq", reason: "invalid_response" }, { provider: "openai", reason: "not_configured" }] });
});
it("handles connection failures", async () => {
  process.env.GROQ_API_KEY = "test-only";
  fetchMock.mockRejectedValue(new Error("timeout"));
  expect((await generateProposalAI(input)).failures[0]?.reason).toBe("timeout_or_network");
});
