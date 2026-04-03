import { NextResponse } from "next/server";
import { z } from "zod";
import { uberDeepLink } from "@root/lib/transport-provider";

export const runtime = "nodejs";

const bodySchema = z.object({
  pickupLat: z.number(),
  pickupLon: z.number(),
  dropoffLat: z.number(),
  dropoffLon: z.number(),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });

  const deepLink = uberDeepLink(parsed.data);
  return NextResponse.json({
    provider: "uber",
    deepLink,
    note: "Price estimates API wiring is destination- and account-dependent; deep-link is always available.",
  });
}
