import { NextResponse } from "next/server";
import { z } from "zod";
import { amadeusPost } from "@/lib/integrations/amadeus";

export const runtime = "nodejs";

const bodySchema = z.object({
  originLocationCode: z.string().min(3).max(3),
  destinationLocationCode: z.string().min(3).max(3),
  departureDate: z.string().min(8),
  returnDate: z.string().min(8).optional(),
  adults: z.number().int().min(1).max(9).default(1),
  currencyCode: z.string().min(3).max(3).optional(),
  max: z.number().int().min(1).max(50).default(20),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });

  const b = parsed.data;
  const payload = {
    currencyCode: b.currencyCode,
    originDestinations: [
      {
        id: "1",
        originLocationCode: b.originLocationCode,
        destinationLocationCode: b.destinationLocationCode,
        departureDateTimeRange: { date: b.departureDate },
      },
      ...(b.returnDate
        ? [
            {
              id: "2",
              originLocationCode: b.destinationLocationCode,
              destinationLocationCode: b.originLocationCode,
              departureDateTimeRange: { date: b.returnDate },
            },
          ]
        : []),
    ],
    travelers: Array.from({ length: b.adults }, (_, i) => ({ id: String(i + 1), travelerType: "ADULT" })),
    sources: ["GDS"],
    searchCriteria: {
      maxFlightOffers: b.max,
      flightFilters: {},
    },
  };

  const res = await amadeusPost("/v2/shopping/flight-offers", payload);
  return NextResponse.json(res.json, { status: res.status });
}
