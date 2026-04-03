import { convertToModelMessages, streamText, UIMessage } from "ai";
import { openai } from "@ai-sdk/openai";
import { systemPrompt } from "@/lib/ai";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return new Response("OPENAI_API_KEY is not set", { status: 501 });
  }

  const json = await req.json().catch(() => ({}));
  const messages: UIMessage[] = Array.isArray(json?.messages) ? json.messages : [];

  if (messages.length === 0) {
    return new Response("No messages provided", { status: 400 });
  }

  const modelMessages = await convertToModelMessages(messages);

  const result = await streamText({
    model: openai.chat("gpt-4o"),
    system: systemPrompt,
    messages: modelMessages,
    // No tools — GPT-4o returns structured JSON via the prompt
  });

  return result.toUIMessageStreamResponse();
}
