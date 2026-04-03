import { NextResponse } from "next/server";
import { z } from "zod";
import { getOpenAIClient, getOpenAIModel } from "@/lib/openai/client";

export const runtime = "nodejs";

const bodySchema = z.object({
  destination: z.string().min(1),
  durationDays: z.number().int().min(1).max(60),
  activities: z.array(z.string()).default([]),
});

const packingSchema = z.object({
  documents: z.array(z.string()).default([]),
  clothing: z.array(z.string()).default([]),
  toiletries: z.array(z.string()).default([]),
  tech: z.array(z.string()).default([]),
  medications: z.array(z.string()).default([]),
  activityGear: z.array(z.string()).default([]),
  dontForget: z.array(z.string()).default([]),
});

export async function POST(req: Request) {
  const client = getOpenAIClient();
  if (!client) return NextResponse.json({ error: "OPENAI_API_KEY is not set" }, { status: 501 });

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });

  const { destination, durationDays, activities } = parsed.data;
  const model = getOpenAIModel();

  const prompt = [
    "You are Wayfarer AI. Create a packing list.",
    "Output ONLY valid JSON with keys: documents, clothing, toiletries, tech, medications, activityGear, dontForget.",
    "Keep each list concise (5-12 items). Optimize for carry-on where possible.",
    `Destination: ${destination}`,
    `Duration days: ${durationDays}`,
    activities.length ? `Planned activities: ${activities.join(", ")}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const response = await client.chat.completions.create({
      model,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.4,
    });

    const outputText = response.choices[0]?.message?.content ?? "{}";
    const data = JSON.parse(outputText);
    const packing = packingSchema.parse(data);
    return NextResponse.json({ packing });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to generate packing list";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
