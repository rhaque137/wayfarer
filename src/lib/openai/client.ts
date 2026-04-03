import OpenAI from "openai";
import { env } from "@/lib/env";

export function getOpenAIClient() {
  const apiKey = env.server.OPENAI_API_KEY;
  if (!apiKey) return null;
  return new OpenAI({ apiKey });
}

export function getOpenAIModel() {
  return env.server.OPENAI_MODEL ?? "gpt-4o";
}

