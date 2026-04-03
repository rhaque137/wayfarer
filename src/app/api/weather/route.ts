import { NextResponse } from "next/server";
import { z } from "zod";
import { getWeather } from "@/lib/integrations/accuweather";

export const runtime = "nodejs";

const bodySchema = z.object({
  city: z.string().min(1),
  countryCode: z.string().optional(),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const data = await getWeather(parsed.data);
  return NextResponse.json(data);
}

