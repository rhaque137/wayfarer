import { NextResponse } from "next/server";
import { z } from "zod";
import { getOpenAIClient, getOpenAIModel } from "@/lib/openai/client";

export const runtime = "nodejs";

const bodySchema = z.object({
  city: z.string().min(1),
  country: z.string().optional(),
  passportCountry: z.string().optional(),
});

const intelSchema = z.object({
  city: z.string(),
  summary: z.string(),
  gettingAround: z.array(z.string()).default([]),
  transportBooking: z.array(z.string()).default([]),
  money: z.array(z.string()).default([]),
  safety: z.array(z.string()).default([]),
  cultureEtiquette: z.array(z.string()).default([]),
  connectivity: z.array(z.string()).default([]),
  languageToolkit: z.array(z.string()).default([]),
  health: z.array(z.string()).default([]),
  bestTimeToVisit: z.array(z.string()).default([]),
  visaInfo: z.array(z.string()).default([]),
});

export async function POST(req: Request) {
  const client = getOpenAIClient();
  if (!client) return NextResponse.json({ error: "OPENAI_API_KEY is not set" }, { status: 501 });

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });

  const { city, country, passportCountry } = parsed.data;
  const model = getOpenAIModel();

  const prompt = [
    "You are Wayfarer AI. Generate a city intelligence dashboard for travelers.",
    "Use web search to ensure accuracy and include practical advice (not generic).",
    "Output ONLY valid JSON with fields: city, summary, gettingAround, transportBooking, money, safety, cultureEtiquette, connectivity, languageToolkit, health, bestTimeToVisit, visaInfo",
    "Keep each array to 5-10 bullets. Be concise and premium.",
    `City: ${city}${country ? `, ${country}` : ""}`,
    passportCountry ? `Traveler passport: ${passportCountry}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const response = await client.chat.completions.create({
      model,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.5,
    });

    const outputText = response.choices[0]?.message?.content ?? "{}";
    const data = JSON.parse(outputText);
    const intel = intelSchema.parse(data);
    return NextResponse.json({ intel });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to generate city intel";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
