import { NextResponse } from "next/server";
import { z } from "zod";
import { env } from "@/lib/env";

export const runtime = "nodejs";

const bodySchema = z.object({
  origin: z.string().min(1),
  destination: z.string().min(1),
});

export async function POST(req: Request) {
  const key = env.server.ROME2RIO_API_KEY;
  if (!key) return NextResponse.json({ error: "ROME2RIO_API_KEY is not set" }, { status: 501 });

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });

  const url = new URL("https://api.rome2rio.com/api/1.5/json/Search");
  url.searchParams.set("key", key);
  url.searchParams.set("oName", parsed.data.origin);
  url.searchParams.set("dName", parsed.data.destination);

  const res = await fetch(url, { cache: "no-store" });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}

