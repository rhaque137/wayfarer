import { NextResponse } from "next/server";
import { buildMockTrip, normalizeTrip } from "@/lib/trip-schema";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ trip: buildMockTrip("Lisbon starter trip", "mock-trip") });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const prompt = typeof body?.prompt === "string" ? body.prompt : "Trip plan";
  const trip = body?.trip ? normalizeTrip(body.trip, prompt) : buildMockTrip(prompt, body?.id);
  return NextResponse.json({ trip });
}
