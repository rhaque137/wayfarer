import { NextResponse } from "next/server";
import { z } from "zod";
import { env } from "@/lib/env";

export const runtime = "nodejs";

const bodySchema = z.object({
  destination: z.string().min(1),
  start: z.string().optional(),
  end: z.string().optional(),
});

export async function POST(req: Request) {
  const key = env.server.VIATOR_API_KEY;
  if (!key) return NextResponse.json({ error: "VIATOR_API_KEY is not set" }, { status: 501 });

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });

  // Viator Partner API endpoints vary by account + version; this is a thin proxy.
  // Configure VIATOR_API_BASE_URL if your key uses a non-default host.
  const base = process.env.VIATOR_API_BASE_URL ?? "https://api.viator.com/partner";
  const u = new URL(`${base}/products/search`);
  const res = await fetch(u, {
    method: "POST",
    headers: { "content-type": "application/json", "exp-api-key": key },
    body: JSON.stringify({ searchTerm: parsed.data.destination }),
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}

