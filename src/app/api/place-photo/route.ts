import { NextRequest, NextResponse } from "next/server";
import { getDestinationImage } from "@/lib/destination-images";

type PhotoResult = { success: boolean; photoUrl: string | null; source?: string };

const USER_AGENT = "MyTravelItineraryApp/1.0 (https://yourdomain.com; contact@yourdomain.com)";
const CACHE_TTL_MS = 1000 * 60 * 60 * 6;
const cache = new Map<string, { value: PhotoResult; expires: number }>();
const REJECT_TERMS = [
  "flag",
  "map",
  "locator",
  "emblem",
  "seal",
  "logo",
  "coat_of_arms",
  "coat of arms",
  "portrait",
  "person",
  "render",
  "diagram",
  ".svg",
  "mayor",
  "government",
  "symbol",
  "icon",
  "stamp",
  "currency",
  "banknote",
];
const PREFERRED_TERMS = [
  "skyline",
  "panorama",
  "landscape",
  "landmark",
  "city",
  "view",
  "aerial",
  "downtown",
  "beach",
  "temple",
  "cathedral",
  "mountain",
  "harbor",
  "harbour",
  "street",
  "architecture",
];

function isRejected(value: string) {
  const lower = value.toLowerCase();
  return REJECT_TERMS.some((term) => lower.includes(term));
}

function scoreTitle(title: string) {
  const lower = title.toLowerCase();
  return PREFERRED_TERMS.reduce((score, term) => score + (lower.includes(term) ? 1 : 0), 0);
}

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
  const registryImage = getDestinationImage(String(city || placeName));
  if (registryImage) {
    return NextResponse.json<PhotoResult>({ success: true, photoUrl: registryImage.url, source: "registry" });
  }

  const cached = cache.get(cacheKey);
  if (cached && cached.expires > Date.now()) {
    return NextResponse.json<PhotoResult>(cached.value);
  }

  try {
    const searchUrl = new URL("https://en.wikipedia.org/w/api.php");
    searchUrl.searchParams.set("action", "query");
    searchUrl.searchParams.set("list", "search");
    searchUrl.searchParams.set("srsearch", query);
    searchUrl.searchParams.set("srlimit", "8");
    searchUrl.searchParams.set("format", "json");
    searchUrl.searchParams.set("origin", "*");

    const searchRes = await fetch(searchUrl, {
      cache: "no-store",
      headers: { "User-Agent": USER_AGENT },
    });
    const searchData = await searchRes.json().catch(() => ({}));
    const searchResults = Array.isArray(searchData?.query?.search) ? searchData.query.search : [];
    const pageTitle = searchResults
      .map((result: { title?: string }) => result.title)
      .filter((title: string | undefined): title is string => Boolean(title))
      .filter((title: string) => !isRejected(title))
      .sort((a: string, b: string) => scoreTitle(b) - scoreTitle(a))[0];

    if (pageTitle) {
      const thumbUrl = new URL("https://en.wikipedia.org/w/api.php");
      thumbUrl.searchParams.set("action", "query");
      thumbUrl.searchParams.set("titles", pageTitle);
      thumbUrl.searchParams.set("prop", "pageimages");
      thumbUrl.searchParams.set("pithumbsize", "640");
      thumbUrl.searchParams.set("format", "json");
      thumbUrl.searchParams.set("origin", "*");

      const thumbRes = await fetch(thumbUrl, {
        cache: "no-store",
        headers: { "User-Agent": USER_AGENT },
      });
      const thumbData = await thumbRes.json().catch(() => ({}));
      const tpages = thumbData?.query?.pages ?? {};
      const tpage = tpages[Object.keys(tpages)[0]] as { thumbnail?: { source?: string } } | undefined;
      const thumb = tpage?.thumbnail?.source as string | undefined;
      if (thumb && !isRejected(`${pageTitle} ${thumb}`)) {
        const value = { success: true, photoUrl: thumb, source: "wikipedia" };
        cache.set(cacheKey, { value, expires: Date.now() + CACHE_TTL_MS });
        return NextResponse.json<PhotoResult>(value);
      }
    }
  } catch (err) {
    console.error("[place-photo] wikipedia error", placeName, err);
  }

  const value = { success: false, photoUrl: null, source: "wikipedia" };
  cache.set(cacheKey, { value, expires: Date.now() + CACHE_TTL_MS });
  return NextResponse.json<PhotoResult>(value);
}
