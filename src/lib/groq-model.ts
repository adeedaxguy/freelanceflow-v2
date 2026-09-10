// Groq retired Llama 3.3 for free/developer accounts on 2026-08-16.
export const GROQ_MODEL = "openai/gpt-oss-120b";

export function groqCompletionOptions(outputTokens: number) {
  return {
    model: GROQ_MODEL,
    reasoning_effort: "low",
    include_reasoning: false,
    // GPT-OSS counts reasoning tokens within the completion budget.
    max_completion_tokens: Math.max(1024, outputTokens + 1024),
  };
}
