import OpenAI from "openai";

let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY is not configured");
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
}

export interface ProposalGenerationParams {
  freelancerName: string;
  niche: string;
  bio?: string;
  rate?: number;
  portfolio?: string;
  targetCompany: string;
  targetDomain: string;
  targetEmail?: string;
  targetPosition?: string;
  templateHint?: string;
}

export interface GeneratedProposal {
  subject: string;
  body: string;
}

export async function generateProposal(
  params: ProposalGenerationParams
): Promise<GeneratedProposal> {
  const client = getOpenAIClient();

  const systemPrompt = `You are an expert freelance business development coach. 
Generate highly personalized, professional cold email proposals for freelancers.
The emails should be:
- Concise (150-250 words max for body)
- Personalized to the company
- Value-focused, not feature-focused
- Include a clear call to action
- Professional but warm in tone
- Never use generic templates that look copy-pasted
Format response as JSON: { "subject": "...", "body": "..." }`;

  const userPrompt = `Generate a cold email proposal for:
Freelancer: ${params.freelancerName}
Niche: ${params.niche}
${params.bio ? `Bio: ${params.bio}` : ""}
${params.rate ? `Rate: $${params.rate}/hour` : ""}
${params.portfolio ? `Portfolio: ${params.portfolio}` : ""}

Target Company: ${params.targetCompany}
Domain: ${params.targetDomain}
${params.targetEmail ? `Contact Email: ${params.targetEmail}` : ""}
${params.targetPosition ? `Contact Position: ${params.targetPosition}` : ""}
${params.templateHint ? `Style hint: ${params.templateHint}` : ""}

Make it compelling, specific to their industry, and end with a soft CTA like booking a 15-min call.`;

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_object" },
    max_tokens: 600,
    temperature: 0.8,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("No response from OpenAI");

  const parsed = JSON.parse(content) as { subject?: string; body?: string };
  if (!parsed.subject || !parsed.body) {
    throw new Error("Invalid response format from OpenAI");
  }

  return { subject: parsed.subject, body: parsed.body };
}

export async function generateProposalStream(
  params: ProposalGenerationParams,
  onChunk: (chunk: string) => void
): Promise<void> {
  const client = getOpenAIClient();

  const stream = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You are an expert freelance proposal writer. Write compelling, personalized cold email proposals. Start directly with the email body - no preamble.",
      },
      {
        role: "user",
        content: `Write a cold email proposal from ${params.freelancerName} (${params.niche} freelancer) to ${params.targetCompany} (${params.targetDomain}). ${params.bio ? `Background: ${params.bio}` : ""} Keep it under 200 words, professional, and end with a CTA.`,
      },
    ],
    stream: true,
    max_tokens: 400,
  });

  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content;
    if (delta) onChunk(delta);
  }
}
