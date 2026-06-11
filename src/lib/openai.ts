import OpenAI from "openai";

let _client: OpenAI | null = null;

function getOpenAI() {
  if (!_client) {
    _client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || "placeholder-key",
    });
  }
  return _client;
}

export default { get openai() { return getOpenAI(); } };

export const AI_MODELS = {
  primary: "gpt-4o",
  fast: "gpt-4o-mini",
  embeddings: "text-embedding-3-small",
} as const;

export function getOpenAIClient() {
  return getOpenAI();
}
