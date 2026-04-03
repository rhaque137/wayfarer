import { env } from "@/lib/env";

export async function searchAttractions(args: Record<string, unknown>) {
  const city = String(args.city ?? "");
  if (!city) return { ok: false, error: "Missing city" };
  const apiKey = env.server.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return {
      ok: true,
      results: [
        { name: "Dublin Castle", lat: 53.3430, lng: -6.2675, type: "attraction" },
        { name: "Guinness Storehouse", lat: 53.3419, lng: -6.2865, type: "attraction" },
      ],
    };
  }

  const query = `${city} attractions`;
  const url = new URL("https://maps.googleapis.com/maps/api/place/textsearch/json");
  url.searchParams.set("query", query);
  url.searchParams.set("key", apiKey);
  const res = await fetch(url, { cache: "no-store" });
  const data = await res.json().catch(() => ({}));
  return { ok: true, results: data.results ?? [] };
}

