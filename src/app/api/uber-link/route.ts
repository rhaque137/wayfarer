import { NextResponse } from "next/server";
import { z } from "zod";
import { uberDeepLink } from "@root/lib/transport-provider";

export const runtime = "nodejs";

const bodySchema = z.object({
  pickupLat: z.number(),
  pickupLng: z.number(),
  dropoffLat: z.number(),
  dropoffLng: z.number(),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });

  const link = uberDeepLink({
    pickupLat: parsed.data.pickupLat,
    pickupLon: parsed.data.pickupLng,
    dropoffLat: parsed.data.dropoffLat,
    dropoffLon: parsed.data.dropoffLng,
  });
  return NextResponse.json({ link });
}

