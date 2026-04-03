import { NextResponse } from "next/server";
import { z } from "zod";
import { env } from "@/lib/env";

export const runtime = "nodejs";

const bodySchema = z.object({
  city: z.string().min(1),
  country: z.string().optional(),
  baseCurrency: z.string().default("USD"),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });

  const { city, country, baseCurrency } = parsed.data;

  const numbeoKey = env.server.NUMBEO_API_KEY;
  const exchangeKey = env.server.EXCHANGERATE_API_KEY;

  const results: Record<string, unknown> = {};

  if (numbeoKey) {
    const u = new URL("https://www.numbeo.com/api/city_prices");
    u.searchParams.set("api_key", numbeoKey);
    u.searchParams.set("query", country ? `${city}, ${country}` : city);
    const res = await fetch(u, { cache: "no-store" });
    results.numbeo = await res.json().catch(() => ({}));
  } else {
    results.numbeo = { warning: "NUMBEO_API_KEY not set" };
  }

  if (exchangeKey) {
    const res = await fetch(`https://v6.exchangerate-api.com/v6/${exchangeKey}/latest/${baseCurrency}`, {
      cache: "no-store",
    });
    results.exchangeRates = await res.json().catch(() => ({}));
  } else {
    results.exchangeRates = { warning: "EXCHANGERATE_API_KEY not set" };
  }

  return NextResponse.json(results);
}

