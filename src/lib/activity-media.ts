import type { Activity } from "@/lib/trip-schema";

const UNSPLASH_PARAMS = "auto=format&fit=crop&w=640&q=75";

const CATEGORY_PHOTOS: Record<string, string> = {
  landmark: `https://images.unsplash.com/photo-1502602898657-3e91760cbb34?${UNSPLASH_PARAMS}`,
  viewpoint: `https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?${UNSPLASH_PARAMS}`,
  museum: `https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?${UNSPLASH_PARAMS}`,
  walking: `https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?${UNSPLASH_PARAMS}`,
  neighborhood: `https://images.unsplash.com/photo-1518005020951-eccb494ad742?${UNSPLASH_PARAMS}`,
  food: `https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?${UNSPLASH_PARAMS}`,
  restaurant: `https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?${UNSPLASH_PARAMS}`,
  cafe: `https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?${UNSPLASH_PARAMS}`,
  nature: `https://images.unsplash.com/photo-1441974231531-c6227db76b6e?${UNSPLASH_PARAMS}`,
  park: `https://images.unsplash.com/photo-1441974231531-c6227db76b6e?${UNSPLASH_PARAMS}`,
  shopping: `https://images.unsplash.com/photo-1441986300917-64674bd600d8?${UNSPLASH_PARAMS}`,
  nightlife: `https://images.unsplash.com/photo-1470337458703-46ad1756a187?${UNSPLASH_PARAMS}`,
  hotel: `https://images.unsplash.com/photo-1566073771259-6a8506099945?${UNSPLASH_PARAMS}`,
  transport: `https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?${UNSPLASH_PARAMS}`,
  tour: `https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?${UNSPLASH_PARAMS}`,
  other: `https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?${UNSPLASH_PARAMS}`,
};

const PLACE_PHOTOS: Array<{ match: RegExp; url: string }> = [
  { match: /eiffel|tower/i, url: `https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?${UNSPLASH_PARAMS}` },
  { match: /louvre/i, url: `https://images.unsplash.com/photo-1565099824688-e93eb20fe622?${UNSPLASH_PARAMS}` },
  { match: /montmartre|sacr[eé]-?c[oe]ur/i, url: `https://images.unsplash.com/photo-1549144511-f099e773c147?${UNSPLASH_PARAMS}` },
  { match: /shibuya|tokyo/i, url: `https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?${UNSPLASH_PARAMS}` },
  { match: /teamlab/i, url: `https://images.unsplash.com/photo-1545987796-200677ee1011?${UNSPLASH_PARAMS}` },
];

export function getActivityPhotoUrl(activity: Pick<Activity, "name" | "category" | "locationName" | "photoUrl" | "imageUrl">, destination?: string) {
  if (activity.photoUrl) return activity.photoUrl;
  if (activity.imageUrl) return activity.imageUrl;

  const searchText = `${activity.name} ${activity.locationName ?? ""} ${destination ?? ""}`;
  const placeMatch = PLACE_PHOTOS.find((entry) => entry.match.test(searchText));
  if (placeMatch) return placeMatch.url;

  const category = normalizeCategory(activity.category);
  return CATEGORY_PHOTOS[category] ?? CATEGORY_PHOTOS.other;
}

export function withActivityPhoto<T extends Activity>(activity: T, destination?: string): T {
  const photoUrl = getActivityPhotoUrl(activity, destination);
  return activity.photoUrl === photoUrl ? activity : { ...activity, photoUrl };
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
