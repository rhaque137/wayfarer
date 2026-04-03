import { NextResponse } from "next/server";
import { z } from "zod";
import { getOpenAIClient, getOpenAIModel } from "@/lib/openai/client";

export const runtime = "nodejs";

const bodySchema = z.object({
  input: z.string().min(1),
});

const tripSchema = z.object({
  title: z.string().min(1),
  origin: z.string().optional(),
  destinations: z.array(z.string().min(1)).min(1),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  month: z.string().optional(),
  travelers: z.number().int().positive().optional(),
  budget: z.number().positive().optional(),
  currency: z.string().optional(),
  interests: z.array(z.string()).default([]),
  travelStyle: z.string().optional(),
  clarifyingQuestions: z.array(z.string()).min(2).max(4),
  skeleton: z.object({
    days: z
      .array(
        z.object({
          day: z.number().int().positive(),
          base: z.string().min(1),
          headline: z.string().min(1),
          morning: z.array(z.string()).default([]),
          afternoon: z.array(z.string()).default([]),
          evening: z.array(z.string()).default([]),
        }),
      )
      .min(1)
      .max(21),
  }),
});

export async function POST(req: Request) {
  const client = getOpenAIClient();
  if (!client) {
    return NextResponse.json({ error: "OPENAI_API_KEY is not set" }, { status: 501 });
  }

  const json = await req.json().catch(() => null);
  const parsedBody = bodySchema.safeParse(json);
  if (!parsedBody.success) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const input = parsedBody.data.input;
  const model = getOpenAIModel();

  const prompt = [
    "You are Wayfarer AI, a premium futuristic travel concierge.",
    "Extract trip intent from the user prompt and return ONLY a flat JSON object matching EXACTLY this schema (no wrapper keys):",
    "",
    "{",
    '  "title": "string (trip name, e.g. \\"Tokyo Adventure\\")",',
    '  "origin": "string (optional, departure city)",',
    '  "destinations": ["array of destination city strings, minimum 1"],',
    '  "startDate": "YYYY-MM-DD or omit if unknown",',
    '  "endDate": "YYYY-MM-DD or omit if unknown",',
    '  "month": "e.g. September, if dates are vague",',
    '  "travelers": 2,',
    '  "budget": 5000,',
    '  "currency": "USD",',
    '  "interests": ["array of interest strings"],',
    '  "travelStyle": "string (e.g. budget, luxury, adventure)",',
    '  "clarifyingQuestions": ["exactly 2 smart follow-up questions"],',
    '  "skeleton": {',
    '    "days": [',
    '      { "day": 1, "base": "City Name", "headline": "Short day theme", "morning": ["activity 1"], "afternoon": ["activity 2"], "evening": ["activity 3"] }',
    "    ]",
    "  }",
    "}",
    "",
    "Rules:",
    "- Return ONLY the JSON object above. No markdown, no wrapper keys like 'tripIntent' or 'trip'.",
    "- clarifyingQuestions must be exactly 2 items.",
    "- skeleton.days must be an array of day objects with the exact shape shown above.",
    "- Skeleton should be plausible, not overly detailed, under 5 bullets per time of day.",
    "",
    `User: ${input}`,
  ].join("\n");

  try {
    const response = await client.chat.completions.create({
      model,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.4,
    });

    const outputText = response.choices[0]?.message?.content ?? "{}";
    const data = JSON.parse(outputText);
    const trip = tripSchema.parse(data);
    return NextResponse.json({ trip });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to parse trip";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
