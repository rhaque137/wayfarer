import { generateText, type ModelMessage } from "ai";
import { openai } from "@ai-sdk/openai";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return Response.json({ success: false, error: "OPENAI_API_KEY is not set" }, { status: 501 });
  }

  const json = await req.json().catch(() => ({}));
  const messages = Array.isArray(json?.messages) ? json.messages : [];
  if (messages.length === 0) {
    return Response.json({ success: false, error: "No messages provided" }, { status: 400 });
  }

  const modelMessages: ModelMessage[] = messages
    .map((m: any) => {
      if (!m?.role || !m?.content) return null;
      return { role: m.role, content: m.content } as ModelMessage;
    })
    .filter(Boolean) as ModelMessage[];

  if (modelMessages.length === 0) {
    return Response.json({ success: false, error: "Invalid message format" }, { status: 400 });
  }

  const result = await generateText({
    model: openai.chat("gpt-4o"),
    messages: modelMessages,
  });

  return Response.json({ success: true, text: result.text });
}
