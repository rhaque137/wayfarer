import { NextResponse } from "next/server";
import { z } from "zod";
import { amadeusGet } from "@/lib/integrations/amadeus";

export const runtime = "nodejs";

const bodySchema = z.object({
  cityCode: z.string().min(3).max(3),
  checkInDate: z.string().min(8),
  checkOutDate: z.string().min(8),
  adults: z.number().int().min(1).max(9).default(2),
  radius: z.number().int().min(1).max(50).default(10),
  radiusUnit: z.enum(["KM", "MILE"]).default("KM"),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });

  const b = parsed.data;

  const hotelsByCity = await amadeusGet("/v1/reference-data/locations/hotels/by-city", {
    cityCode: b.cityCode,
    radius: String(b.radius),
    radiusUnit: b.radiusUnit,
  });
  if (!hotelsByCity.ok) return NextResponse.json(hotelsByCity.json, { status: hotelsByCity.status });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ids = (((hotelsByCity.json as any).data ?? []) as any[])
    .slice(0, 20)
    .map((h) => h.hotelId)
    .filter(Boolean);

  if (!ids.length) return NextResponse.json({ data: [] });

  const offers = await amadeusGet("/v3/shopping/hotel-offers", {
    hotelIds: ids.join(","),
    checkInDate: b.checkInDate,
    checkOutDate: b.checkOutDate,
    adults: String(b.adults),
  });

  return NextResponse.json(offers.json, { status: offers.status });
}

