import { env } from "@/lib/env";

type TokenCache = { accessToken: string; expiresAt: number };

let cache: TokenCache | null = null;

export async function getAmadeusAccessToken() {
  const clientId = env.server.AMADEUS_CLIENT_ID;
  const clientSecret = env.server.AMADEUS_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  const now = Date.now();
  if (cache && cache.expiresAt > now + 30_000) return cache.accessToken;

  const body = new URLSearchParams();
  body.set("grant_type", "client_credentials");
  body.set("client_id", clientId);
  body.set("client_secret", clientSecret);

  const res = await fetch("https://test.api.amadeus.com/v1/security/oauth2/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });

  if (!res.ok) return null;
  const json = (await res.json()) as { access_token: string; expires_in: number };
  cache = { accessToken: json.access_token, expiresAt: now + json.expires_in * 1000 };
  return cache.accessToken;
}

export async function amadeusGet(path: string, params?: Record<string, string>) {
  const token = await getAmadeusAccessToken();
  if (!token) return { ok: false as const, status: 501, json: { error: "Amadeus is not configured" } };

  const url = new URL(`https://test.api.amadeus.com${path}`);
  Object.entries(params ?? {}).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url, {
    headers: { authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  const json = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, json };
}

export async function amadeusPost(path: string, body: unknown) {
  const token = await getAmadeusAccessToken();
  if (!token) return { ok: false as const, status: 501, json: { error: "Amadeus is not configured" } };

  const res = await fetch(`https://test.api.amadeus.com${path}`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const json = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, json };
}

export async function searchFlights(args: Record<string, unknown>) {
  const origin = String(args.origin ?? "");
  const destination = String(args.destination ?? "");
  const departureDate = String(args.departureDate ?? "");
  const returnDate = args.returnDate ? String(args.returnDate) : undefined;
  const adults = Number(args.adults ?? 1);

  if (!origin || !destination || !departureDate) {
    return { ok: false, error: "Missing required parameters" };
  }

  const payload = {
    currencyCode: "USD",
    originDestinations: [
      {
        id: "1",
        originLocationCode: origin,
        destinationLocationCode: destination,
        departureDateTimeRange: { date: departureDate },
      },
      ...(returnDate
        ? [
            {
              id: "2",
              originLocationCode: destination,
              destinationLocationCode: origin,
              departureDateTimeRange: { date: returnDate },
            },
          ]
        : []),
    ],
    travelers: Array.from({ length: adults }, (_, i) => ({ id: String(i + 1), travelerType: "ADULT" })),
    sources: ["GDS"],
    searchCriteria: { maxFlightOffers: 5 },
  };

  const res = await amadeusPost("/v2/shopping/flight-offers", payload);
  return res.ok ? res.json : { ok: false, error: res.json?.error ?? "Failed to fetch flights" };
}

export async function searchHotels(args: Record<string, unknown>) {
  const cityCode = String(args.cityCode ?? "");
  const checkIn = String(args.checkIn ?? "");
  const checkOut = String(args.checkOut ?? "");
  const adults = Number(args.adults ?? 1);

  if (!cityCode || !checkIn || !checkOut) {
    return { ok: false, error: "Missing required parameters" };
  }

  const hotelsByCity = await amadeusGet("/v1/reference-data/locations/hotels/by-city", {
    cityCode,
  });
  if (!hotelsByCity.ok) return hotelsByCity.json;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ids = (((hotelsByCity.json as any).data ?? []) as any[])
    .slice(0, 20)
    .map((h) => h.hotelId)
    .filter(Boolean);

  if (!ids.length) return { data: [] };

  const offers = await amadeusGet("/v3/shopping/hotel-offers", {
    hotelIds: ids.join(","),
    checkInDate: checkIn,
    checkOutDate: checkOut,
    adults: String(adults),
  });

  return offers.ok ? offers.json : { ok: false, error: offers.json?.error ?? "Failed to fetch hotels" };
}
