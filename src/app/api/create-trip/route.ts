import { NextResponse } from "next/server";
import { z } from "zod";
import { MAX_TRIP_PROMPT_LENGTH } from "@/lib/trip-limits";
import { buildMockTrip } from "@/lib/trip-schema";
import { saveServerTrip } from "@/lib/server-trip-store";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { createPromptTripId } from "@/lib/trip-route-id";

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 5;
const requestCounts = new Map<string, { count: number; resetAt: number }>();

const bodySchema = z.object({
  query: z.string().trim().min(1).max(MAX_TRIP_PROMPT_LENGTH),
});

export async function POST(req: Request) {
  const forwardedFor = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwardedFor || req.headers.get("x-real-ip") || "unknown";
  const now = Date.now();
  const current = requestCounts.get(ip);

  if (current && current.resetAt > now && current.count >= RATE_LIMIT_MAX_REQUESTS) {
    return NextResponse.json(
      { error: "Too many trip creation requests. Please try again later." },
      { status: 429 },
    );
  }

  if (!current || current.resetAt <= now) {
    requestCounts.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
  } else {
    current.count += 1;
    requestCounts.set(ip, current);
  }

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const id = createPromptTripId(parsed.data.query);
  const trip = buildMockTrip(parsed.data.query, id);
  saveServerTrip(trip);
  const supabase = getSupabaseServiceClient();
  if (supabase) {
    const { error } = await supabase.from("trips").insert({
      id: crypto.randomUUID(),
      public_id: id,
      spec: trip,
      status: "draft",
    });
    if (error) {
      console.warn("create_trip_persist_failed", error.message);
    }
  }
  return NextResponse.json({ id, trip });
}
