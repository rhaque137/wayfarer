import { convertToModelMessages, streamText, UIMessage } from "ai";
import { openai } from "@ai-sdk/openai";

export const runtime = "nodejs";

const helpPrompt = `You are Wayfarer Help, a concise assistant that answers questions about using the Wayfarer app.
Focus on: how to plan trips, how to use the chat, how to edit itineraries, how maps/pins work, and troubleshooting.
If the user asks for a full trip plan, direct them to use the main Trip Chat and describe the steps.
Be friendly, short, and actionable.`;

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
    system: helpPrompt,
    messages: modelMessages,
  });

  return result.toUIMessageStreamResponse();
}
