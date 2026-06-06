import type { Activity } from "@/lib/trip-schema";

const UNSPLASH_PARAMS = "auto=format&fit=crop&w=640&q=75";

const CATEGORY_PHOTOS: Record<string, string> = {
  landmark: `https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?${UNSPLASH_PARAMS}`,
  viewpoint: `https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?${UNSPLASH_PARAMS}`,
  museum: `https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?${UNSPLASH_PARAMS}`,
  walking: `https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?${UNSPLASH_PARAMS}`,
  neighborhood: `https://images.unsplash.com/photo-1518005020951-eccb494ad742?${UNSPLASH_PARAMS}`,
  food: `https://images.unsplash.com/photo-1555396273-367ea4eb4db5?${UNSPLASH_PARAMS}`,
  restaurant: `https://images.unsplash.com/photo-1555396273-367ea4eb4db5?${UNSPLASH_PARAMS}`,
  cafe: `https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?${UNSPLASH_PARAMS}`,
  nature: `https://images.unsplash.com/photo-1441974231531-c6227db76b6e?${UNSPLASH_PARAMS}`,
  park: `https://images.unsplash.com/photo-1534270804882-6b5048b1c1fc?${UNSPLASH_PARAMS}`,
  shopping: `https://images.unsplash.com/photo-1441986300917-64674bd600d8?${UNSPLASH_PARAMS}`,
  nightlife: `https://images.unsplash.com/photo-1470337458703-46ad1756a187?${UNSPLASH_PARAMS}`,
  hotel: `https://images.unsplash.com/photo-1566073771259-6a8506099945?${UNSPLASH_PARAMS}`,
  transport: `https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?${UNSPLASH_PARAMS}`,
  tour: `https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?${UNSPLASH_PARAMS}`,
  other: `https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?${UNSPLASH_PARAMS}`,
};

const NYC_CATEGORY_PHOTOS: Record<string, string> = {
  landmark: `https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?${UNSPLASH_PARAMS}`,
  viewpoint: `https://images.unsplash.com/photo-1496588152823-86ff7695e68f?${UNSPLASH_PARAMS}`,
  museum: `https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?${UNSPLASH_PARAMS}`,
  walking: `https://images.unsplash.com/photo-1518391846015-55a9cc003b25?${UNSPLASH_PARAMS}`,
  neighborhood: `https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?${UNSPLASH_PARAMS}`,
  food: `https://images.unsplash.com/photo-1555396273-367ea4eb4db5?${UNSPLASH_PARAMS}`,
  restaurant: `https://images.unsplash.com/photo-1555396273-367ea4eb4db5?${UNSPLASH_PARAMS}`,
  cafe: `https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?${UNSPLASH_PARAMS}`,
  park: `https://images.unsplash.com/photo-1534270804882-6b5048b1c1fc?${UNSPLASH_PARAMS}`,
  nightlife: `https://images.unsplash.com/photo-1470337458703-46ad1756a187?${UNSPLASH_PARAMS}`,
};

const PLACE_PHOTOS: Array<{ match: RegExp; url: string }> = [
  { match: /central park|bethesda/i, url: `https://images.unsplash.com/photo-1534270804882-6b5048b1c1fc?${UNSPLASH_PARAMS}` },
  { match: /brooklyn bridge|dumbo/i, url: `https://images.unsplash.com/photo-1496588152823-86ff7695e68f?${UNSPLASH_PARAMS}` },
  { match: /high line|chelsea/i, url: `https://images.unsplash.com/photo-1518391846015-55a9cc003b25?${UNSPLASH_PARAMS}` },
  { match: /restaurant|dinner|buvette|rubirosa|katz/i, url: `https://images.unsplash.com/photo-1555396273-367ea4eb4db5?${UNSPLASH_PARAMS}` },
  { match: /new york|nyc|manhattan|brooklyn|metropolitan museum|the met|tenement museum|comedy cellar|grand central|moma|bryant park|public library/i, url: `https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?${UNSPLASH_PARAMS}` },
  { match: /eiffel tower|tour eiffel/i, url: `https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?${UNSPLASH_PARAMS}` },
  { match: /louvre/i, url: `https://images.unsplash.com/photo-1565099824688-e93eb20fe622?${UNSPLASH_PARAMS}` },
  { match: /montmartre|sacr[eé]-?c[oe]ur/i, url: `https://images.unsplash.com/photo-1549144511-f099e773c147?${UNSPLASH_PARAMS}` },
  { match: /shibuya|tokyo/i, url: `https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?${UNSPLASH_PARAMS}` },
  { match: /teamlab/i, url: `https://images.unsplash.com/photo-1545987796-200677ee1011?${UNSPLASH_PARAMS}` },
];

export function getActivityPhotoUrl(activity: Pick<Activity, "name" | "category" | "locationName" | "photoUrl" | "imageUrl">, destination?: string) {
  if (isPhotoSafeForDestination(activity.photoUrl, destination)) return activity.photoUrl;
  if (isPhotoSafeForDestination(activity.imageUrl, destination)) return activity.imageUrl;

  const searchText = `${activity.name} ${activity.locationName ?? ""} ${destination ?? ""}`;
  const isNyc = Boolean(destination && /new york|nyc/i.test(destination));

  if (isNyc) {
    const nycMatch = PLACE_PHOTOS.find((entry) => /new york|nyc|manhattan|brooklyn|central park|metropolitan museum|the met|high line|chelsea market|tenement museum|katz|dumbo|brooklyn bridge|buvette|rubirosa|comedy cellar|restaurant|dinner/i.test(entry.match.source) && entry.match.test(searchText));
    if (nycMatch) return nycMatch.url;
  }
  const placeMatch = PLACE_PHOTOS.find((entry) => entry.match.test(searchText));
  if (placeMatch) return placeMatch.url;

  const category = normalizeCategory(activity.category);
  if (isNyc) return NYC_CATEGORY_PHOTOS[category] ?? CATEGORY_PHOTOS[category] ?? CATEGORY_PHOTOS.other;
  return CATEGORY_PHOTOS[category] ?? CATEGORY_PHOTOS.other;
}

export function withActivityPhoto<T extends Activity>(activity: T, destination?: string): T {
  const photoUrl = getActivityPhotoUrl(activity, destination);
  return activity.photoUrl === photoUrl ? activity : { ...activity, photoUrl };
}

export function getActivityPhotoCacheKey(destination: string, activity: Pick<Activity, "name" | "category" | "placeId">) {
  return [
    slug(destination),
    slug((activity as { placeId?: string }).placeId ?? activity.name),
    normalizeCategory(activity.category),
  ].join(":");
}

// Paris-linked Unsplash photo IDs that must not appear in non-Paris destinations
const PARIS_PHOTO_IDS = /1511739001486|1502602898657|1565099824688|1549144511/;

export function isPhotoSafeForDestination(url?: string, destination?: string) {
  if (!url) return false;
  if (!destination) return true;
  const isNyc = /new york|nyc/i.test(destination);
  if (isNyc && (PARIS_PHOTO_IDS.test(url) || /eiffel|paris|louvre|montmartre/i.test(url))) return false;
  return true;
}

function normalizeCategory(category?: string) {
  const lower = (category ?? "other").toLowerCase();
  if (lower.includes("museum") || lower.includes("gallery")) return "museum";
  if (lower.includes("food") || lower.includes("dinner") || lower.includes("restaurant")) return "food";
  if (lower.includes("cafe") || lower.includes("coffee")) return "cafe";
  if (lower.includes("park") || lower.includes("nature") || lower.includes("waterfront")) return "park";
  if (lower.includes("hotel") || lower.includes("lodging")) return "hotel";
  if (lower.includes("transport") || lower.includes("train") || lower.includes("flight")) return "transport";
  if (lower.includes("shopping") || lower.includes("market")) return "shopping";
  if (lower.includes("nightlife") || lower.includes("bar")) return "nightlife";
  if (lower.includes("view")) return "viewpoint";
  if (lower.includes("walk") || lower.includes("neighborhood")) return "walking";
  if (lower.includes("landmark") || lower.includes("temple") || lower.includes("cathedral")) return "landmark";
  return lower in CATEGORY_PHOTOS ? lower : "other";
}

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "unknown";
}
