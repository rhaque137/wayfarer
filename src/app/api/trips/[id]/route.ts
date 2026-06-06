import { NextResponse } from "next/server";
import { getServerTrip } from "@/lib/server-trip-store";

export async function GET(_req: Request, context: { params: Promise<unknown> }) {
  const params = await context.params;
  const id = typeof params === "object" && params && "id" in params ? String((params as { id: unknown }).id) : "";
  if (!id) return NextResponse.json({ error: "Missing trip id" }, { status: 400 });
  const trip = getServerTrip(id);
  if (!trip) return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  return NextResponse.json({ trip });
}
