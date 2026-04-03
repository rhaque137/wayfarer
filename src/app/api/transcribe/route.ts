import { NextResponse } from "next/server";
import { toFile } from "openai";
import { getOpenAIClient } from "@/lib/openai/client";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const client = getOpenAIClient();
  if (!client) return NextResponse.json({ error: "OPENAI_API_KEY is not set" }, { status: 501 });

  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "Expected multipart form-data" }, { status: 400 });

  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Missing audio file" }, { status: 400 });

  try {
    const transcript = await client.audio.transcriptions.create({
      model: "whisper-1",
      file: await toFile(file, file.name, { type: file.type || "audio/webm" }),
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const text = (transcript as any).text ?? "";
    return NextResponse.json({ text });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to transcribe audio";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
