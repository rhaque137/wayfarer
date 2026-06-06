import { NextResponse } from "next/server";
import { getServerTrip } from "@/lib/server-trip-store";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { normalizeTrip } from "@/lib/trip-schema";

export async function GET(_req: Request, context: { params: Promise<unknown> }) {
  const params = await context.params;
  const id = typeof params === "object" && params && "id" in params ? String((params as { id: unknown }).id) : "";
  if (!id) return NextResponse.json({ error: "Missing trip id" }, { status: 400 });
  const trip = getServerTrip(id);
  if (trip) return NextResponse.json({ trip });

  const supabase = getSupabaseServiceClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("trips")
      .select("id, public_id, spec")
      .eq("public_id", id)
      .maybeSingle();
    if (!error && data?.spec) {
      const normalized = normalizeTrip(data.spec, "Saved trip", id);
      return NextResponse.json({ trip: { ...normalized, id } });
    }
    if (error) console.warn("trip_lookup_failed", error.message);
  }

  return NextResponse.json({ error: "Trip not found" }, { status: 404 });
}
