import { NextRequest, NextResponse } from "next/server";

type PhotoResult = { success: boolean; photoUrl: string | null };

const PLACES_VERSION = process.env.FOURSQUARE_PLACES_VERSION ?? "2025-06-17";

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json<PhotoResult>({ success: false, photoUrl: null }, { status: 400 });
  }

  const { city } = body ?? {};
  if (!city || typeof city !== "string") {
    return NextResponse.json<PhotoResult>({ success: false, photoUrl: null }, { status: 400 });
  }

  const key = process.env.FOURSQUARE_API_KEY;
  if (!key) {
    return NextResponse.json<PhotoResult>({ success: false, photoUrl: null });
  }

  const query = `${city} skyline`;
  const params = new URLSearchParams({ query, limit: "5", near: city });

  const tryFetch = async (baseUrl: string, headers: Record<string, string>) => {
    const searchUrl = `${baseUrl}?${params.toString()}`;
    const searchRes = await fetch(searchUrl, { headers });
    if (!searchRes.ok) return null;
    const searchData = await searchRes.json().catch(() => ({}));
    const results = Array.isArray(searchData?.results) ? searchData.results : [];
    for (const candidate of results) {
      const fsqId = (candidate?.fsq_place_id ?? candidate?.fsq_id) as string | undefined;
      if (!fsqId) continue;
      const photoRes = await fetch(
        `${baseUrl.replace("/places/search", `/places/${fsqId}/photos`)}?limit=1`,
        { headers },
      );
      if (!photoRes.ok) continue;
      const photos = await photoRes.json().catch(() => []);
      const photo = Array.isArray(photos) ? photos[0] : null;
      if (photo?.prefix && photo?.suffix) {
        return `${photo.prefix}600x600${photo.suffix}`;
      }
    }
    return null;
  };

  // Try new Places API (Bearer + version header)
  const newHeaders = {
    Accept: "application/json",
    Authorization: `Bearer ${key}`,
    "X-Places-Api-Version": PLACES_VERSION,
  };
  const newUrl = "https://places-api.foursquare.com/places/search";
  const newPhoto = await tryFetch(newUrl, newHeaders);
  if (newPhoto) return NextResponse.json<PhotoResult>({ success: true, photoUrl: newPhoto });

  // Fallback to legacy v3 if needed
  const legacyHeaders = { Accept: "application/json", Authorization: key };
  const legacyUrl = "https://api.foursquare.com/v3/places/search";
  const legacyPhoto = await tryFetch(legacyUrl, legacyHeaders);
  if (legacyPhoto) return NextResponse.json<PhotoResult>({ success: true, photoUrl: legacyPhoto });

  return NextResponse.json<PhotoResult>({ success: false, photoUrl: null });
}
