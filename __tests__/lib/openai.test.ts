import { generateProposal } from "@/lib/openai";

jest.mock("openai", () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn(),
        },
      },
    })),
  };
});

import OpenAI from "openai";

describe("generateProposal (OpenAI client)", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv, OPENAI_API_KEY: "sk-test-key" };
  });

  afterEach(() => { process.env = originalEnv; });

  it("throws when OPENAI_API_KEY is not set", async () => {
    delete process.env.OPENAI_API_KEY;
    await expect(generateProposal({
      freelancerName: "John",
      niche: "web-development",
      targetCompany: "Stripe",
      targetDomain: "stripe.com",
    })).rejects.toThrow("OPENAI_API_KEY is not configured");
  });

  it("returns a valid proposal with subject and body", async () => {
    const mockCreate = jest.fn().mockResolvedValue({
      choices: [{
        message: {
          content: JSON.stringify({
            subject: "Quick idea for Stripe's developer portal",
            body: "Hi there,\n\nI noticed Stripe has been expanding its developer tools...",
          }),
        },
      }],
    });

    (OpenAI as jest.Mock).mockImplementation(() => ({
      chat: { completions: { create: mockCreate } },
    }));

    const result = await generateProposal({
      freelancerName: "John Doe",
      niche: "web-development",
      bio: "10 years building SaaS products",
      rate: 150,
      portfolio: "https://johndoe.dev",
      targetCompany: "Stripe",
      targetDomain: "stripe.com",
      targetEmail: "cto@stripe.com",
    });

    expect(result.subject).toBeTruthy();
    expect(result.body).toBeTruthy();
    expect(typeof result.subject).toBe("string");
    expect(typeof result.body).toBe("string");
    expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
    }));
  });

  it("throws when OpenAI returns empty content", async () => {
    (OpenAI as jest.Mock).mockImplementation(() => ({
      chat: { completions: { create: jest.fn().mockResolvedValue({ choices: [{ message: { content: null } }] }) } },
    }));

    await expect(generateProposal({
      freelancerName: "John",
      niche: "design",
      targetCompany: "Acme",
      targetDomain: "acme.com",
    })).rejects.toThrow("No response from OpenAI");
  });
});
