import { NextRequest, NextResponse } from "next/server";

type PhotoResult = { success: boolean; photoUrl: string | null; source?: string };

const USER_AGENT = "MyTravelItineraryApp/1.0 (https://yourdomain.com; contact@yourdomain.com)";
const CACHE_TTL_MS = 1000 * 60 * 60 * 6;
const cache = new Map<string, { value: PhotoResult; expires: number }>();

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json<PhotoResult>({ success: false, photoUrl: null }, { status: 400 });
  }

  const { placeName, city } = body ?? {};
  if (!placeName || typeof placeName !== "string") {
    return NextResponse.json<PhotoResult>({ success: false, photoUrl: null }, { status: 400 });
  }

  const query = [placeName, city].filter(Boolean).join(" ");
  const cacheKey = query.toLowerCase();
  const cached = cache.get(cacheKey);
  if (cached && cached.expires > Date.now()) {
    return NextResponse.json<PhotoResult>(cached.value);
  }

  try {
    const searchUrl = new URL("https://en.wikipedia.org/w/api.php");
    searchUrl.searchParams.set("action", "query");
    searchUrl.searchParams.set("list", "search");
    searchUrl.searchParams.set("srsearch", query);
    searchUrl.searchParams.set("srlimit", "3");
    searchUrl.searchParams.set("format", "json");
    searchUrl.searchParams.set("origin", "*");

    const searchRes = await fetch(searchUrl, {
      cache: "no-store",
      headers: { "User-Agent": USER_AGENT },
    });
    const searchData = await searchRes.json().catch(() => ({}));
    const pageTitle =
      (searchData?.query?.search?.[0]?.title as string | undefined) ?? (placeName as string);

    if (pageTitle) {
      const originalUrl = new URL("https://en.wikipedia.org/w/api.php");
      originalUrl.searchParams.set("action", "query");
      originalUrl.searchParams.set("titles", pageTitle);
      originalUrl.searchParams.set("prop", "pageimages");
      originalUrl.searchParams.set("piprop", "original");
      originalUrl.searchParams.set("format", "json");
      originalUrl.searchParams.set("origin", "*");

      const originalRes = await fetch(originalUrl, {
        cache: "no-store",
        headers: { "User-Agent": USER_AGENT },
      });
      const originalData = await originalRes.json().catch(() => ({}));
      const pages = originalData?.query?.pages ?? {};
      const firstPage = pages[Object.keys(pages)[0]] as any;
      const original = firstPage?.original?.source as string | undefined;
      if (original) {
        const value = { success: true, photoUrl: original, source: "wikipedia" };
        cache.set(cacheKey, { value, expires: Date.now() + CACHE_TTL_MS });
        return NextResponse.json<PhotoResult>(value);
      }

      const thumbUrl = new URL("https://en.wikipedia.org/w/api.php");
      thumbUrl.searchParams.set("action", "query");
      thumbUrl.searchParams.set("titles", pageTitle);
      thumbUrl.searchParams.set("prop", "pageimages");
      thumbUrl.searchParams.set("pithumbsize", "800");
      thumbUrl.searchParams.set("format", "json");
      thumbUrl.searchParams.set("origin", "*");

      const thumbRes = await fetch(thumbUrl, {
        cache: "no-store",
        headers: { "User-Agent": USER_AGENT },
      });
      const thumbData = await thumbRes.json().catch(() => ({}));
      const tpages = thumbData?.query?.pages ?? {};
      const tpage = tpages[Object.keys(tpages)[0]] as any;
      const thumb = tpage?.thumbnail?.source as string | undefined;
      if (thumb) {
        const value = { success: true, photoUrl: thumb, source: "wikipedia" };
        cache.set(cacheKey, { value, expires: Date.now() + CACHE_TTL_MS });
        return NextResponse.json<PhotoResult>(value);
      }
    }
  } catch (err) {
    console.error("[place-photo] wikipedia error", placeName, err);
  }

  const fallbackUrl =
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/World_map_-_low_resolution.svg/800px-World_map_-_low_resolution.svg.png";
  const value = { success: true, photoUrl: fallbackUrl, source: "wikipedia-fallback" };
  cache.set(cacheKey, { value, expires: Date.now() + CACHE_TTL_MS });
  return NextResponse.json<PhotoResult>(value);
}
