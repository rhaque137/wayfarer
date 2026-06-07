import { parseDestinationFromPrompt, parseTripLengthDays } from "@/lib/trip-schema";

const CACHE_SCHEMA_VERSION = 2;
const PROMPT_VERSION = "curated-seed-v3";

export type TripCacheStatus = "fresh" | "cached" | "regenerated";
export type TripCacheSource = "ai" | "curated_seed" | "fallback_repair";

export function createTripCacheKey(prompt: string) {
  const destination = slug(parseDestinationFromPrompt(prompt));
  const days = parseTripLengthDays(prompt) ?? "unspecified";
  const lower = prompt.toLowerCase();
  const interests = [
    "food",
    "museums",
    "coffee",
    "jazz",
    "nightlife",
    "family",
    "budget",
    "luxury",
    "nature",
  ].filter((interest) => lower.includes(interest));
  const notesHash = hashText(
    lower
      .replace(/\bplan\b|\bitinerary\b|\btrip\b|\bday(s)?\b|\btraveler(s)?\b/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  );

  return [
    `dest:${destination}`,
    `days:${days}`,
    `interests:${interests.sort().join(",") || "none"}`,
    `notes:${notesHash}`,
    `schema:${CACHE_SCHEMA_VERSION}`,
    `prompt:${PROMPT_VERSION}`,
  ].join("|");
}

function hashText(value: string) {
  let hash = 5381;
  for (let idx = 0; idx < value.length; idx += 1) {
    hash = (hash * 33) ^ value.charCodeAt(idx);
  }
  return (hash >>> 0).toString(36);
}

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "unknown";
}
