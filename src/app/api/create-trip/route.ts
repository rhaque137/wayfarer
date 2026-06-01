import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { z } from "zod";
import { MAX_TRIP_PROMPT_LENGTH } from "@/lib/trip-limits";

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

  const id = nanoid(8);
  return NextResponse.json({ id });
}
