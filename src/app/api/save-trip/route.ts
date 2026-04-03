import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { newPublicId } from "@/lib/id";

export const runtime = "nodejs";

const bodySchema = z.object({
  // We store whatever parse-trip returns as JSONB. Keep schema flexible here.
  trip: z.unknown(),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });

  const supabase = getSupabaseServiceClient();
  const tripId = crypto.randomUUID();
  const publicId = newPublicId();

  if (!supabase) {
    return NextResponse.json({
      tripId,
      publicId,
      warning: "Supabase is not configured; trip was not persisted.",
    });
  }

  const { error } = await supabase.from("trips").insert({
    id: tripId,
    public_id: publicId,
    spec: parsed.data.trip,
    status: "draft",
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ tripId, publicId });
}

