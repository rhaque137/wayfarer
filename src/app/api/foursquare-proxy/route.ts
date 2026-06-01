export const runtime = "nodejs";

const BASE_URL = "https://places-api.foursquare.com";
const DEFAULT_VERSION = "2025-06-17";

export async function GET(req: Request) {
  const key = process.env.FOURSQUARE_API_KEY;
  if (!key) {
    return Response.json({ success: false, error: "FOURSQUARE_API_KEY is not set" }, { status: 501 });
  }

  const url = new URL(req.url);
  const type = url.searchParams.get("type");

  if (!type) {
    return Response.json({ success: false, error: "Missing type" }, { status: 400 });
  }

  const version = process.env.FOURSQUARE_API_VERSION ?? DEFAULT_VERSION;
  const headers = {
    Accept: "application/json",
    Authorization: `Bearer ${key}`,
    "X-Places-Api-Version": version,
  };

  try {
    if (type === "search") {
      const params = new URLSearchParams();
      const query = url.searchParams.get("query");
      if (query) params.set("query", query);
      const ll = url.searchParams.get("ll");
      const near = url.searchParams.get("near");
      const radius = url.searchParams.get("radius");
      const limit = url.searchParams.get("limit") ?? "5";
      const fields =
        url.searchParams.get("fields") ??
        "fsq_place_id,name,location,latitude,longitude,categories,photos";
      if (ll) params.set("ll", ll);
      if (near) params.set("near", near);
      if (radius) params.set("radius", radius);
      params.set("limit", limit);
      params.set("fields", fields);

      const res = await fetch(`${BASE_URL}/places/search?${params.toString()}`, { headers });
      const data = await res.json();
      return Response.json({ success: res.ok, status: res.status, data }, { status: res.ok ? 200 : 400 });
    }

    if (type === "photos") {
      const placeId = url.searchParams.get("placeId");
      if (!placeId) {
        return Response.json({ success: false, error: "Missing placeId" }, { status: 400 });
      }
      const limit = url.searchParams.get("limit") ?? "1";
      const res = await fetch(`${BASE_URL}/places/${placeId}/photos?limit=${limit}`, { headers });
      const data = await res.json();
      return Response.json({ success: res.ok, status: res.status, data }, { status: res.ok ? 200 : 400 });
    }

    return Response.json({ success: false, error: "Unsupported type" }, { status: 400 });
  } catch {
    return Response.json({ success: false, error: "Proxy error" }, { status: 500 });
  }
}
