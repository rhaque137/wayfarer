import { NextResponse } from "next/server";
import { z } from "zod";
import { env } from "@/lib/env";

export const runtime = "nodejs";

const bodySchema = z.object({
  query: z.string().min(1),
  near: z.string().optional(),
  lat: z.number().optional(),
  lon: z.number().optional(),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });

  const { query, near, lat, lon } = parsed.data;

  const googleKey = env.server.GOOGLE_PLACES_API_KEY;
  const fsqKey = env.server.FOURSQUARE_API_KEY;

  const out: Record<string, unknown> = {};

  if (googleKey) {
    const u = new URL("https://maps.googleapis.com/maps/api/place/textsearch/json");
    u.searchParams.set("key", googleKey);
    u.searchParams.set("query", query);
    if (lat != null && lon != null) u.searchParams.set("location", `${lat},${lon}`);
    if (near) u.searchParams.set("region", near);
    const res = await fetch(u, { cache: "no-store" });
    out.google = await res.json().catch(() => ({}));
  } else {
    out.google = { warning: "GOOGLE_PLACES_API_KEY not set" };
  }

  if (fsqKey) {
    const u = new URL("https://api.foursquare.com/v3/places/search");
    u.searchParams.set("query", query);
    if (near) u.searchParams.set("near", near);
    if (lat != null && lon != null) u.searchParams.set("ll", `${lat},${lon}`);
    const res = await fetch(u, { headers: { Authorization: fsqKey }, cache: "no-store" });
    out.foursquare = await res.json().catch(() => ({}));
  } else {
    out.foursquare = { warning: "FOURSQUARE_API_KEY not set" };
  }

  return NextResponse.json(out);
}

