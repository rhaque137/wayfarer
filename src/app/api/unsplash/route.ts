import { NextResponse } from "next/server";
import { z } from "zod";
import { env } from "@/lib/env";

export const runtime = "nodejs";

const bodySchema = z.object({
  query: z.string().min(1),
});

export async function POST(req: Request) {
  const key = env.server.UNSPLASH_ACCESS_KEY;
  if (!key) return NextResponse.json({ error: "UNSPLASH_ACCESS_KEY is not set" }, { status: 501 });

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });

  const u = new URL("https://api.unsplash.com/search/photos");
  u.searchParams.set("query", parsed.data.query);
  u.searchParams.set("per_page", "12");
  u.searchParams.set("orientation", "landscape");

  const res = await fetch(u, { headers: { Authorization: `Client-ID ${key}` }, cache: "no-store" });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}

