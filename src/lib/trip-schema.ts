import { z } from "zod";
import { withActivityPhoto } from "@/lib/activity-media";

export const activitySchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).optional(),
  name: z.string().min(1),
  category: z.string().min(1).default("Activity"),
  description: z.string().min(1).default("Details are being refined."),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  locationName: z.string().optional(),
  address: z.string().optional(),
  rating: z.number().min(0).max(5).optional(),
  photoUrl: z.string().url().optional(),
  imageUrl: z.string().url().optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  startsAt: z.string().optional(),
  durationMinutes: z.number().int().positive().optional(),
  estimatedCost: z.number().min(0).optional(),
  currency: z.string().optional(),
  sourceName: z.string().optional(),
  sourceUrl: z.string().url().optional(),
  confidence: z.number().min(0).max(1).optional(),
  lastCheckedAt: z.string().optional(),
  verificationStatus: z.enum(["verified", "ai_suggestion", "needs_verification"]).default("ai_suggestion"),
  notes: z.string().optional(),
  locked: z.boolean().default(false),
  isLocked: z.boolean().optional(),
});

export const daySchema = z.object({
  id: z.string().min(1),
  dayNumber: z.number().int().positive(),
  title: z.string().min(1).optional(),
  date: z.string().min(1),
  summary: z.string().optional(),
  theme: z.string().optional(),
  activities: z.array(activitySchema).default([]),
});

export const budgetItemSchema = z.object({
  id: z.string().min(1),
  category: z.string().min(1),
  label: z.string().min(1),
  estimatedCost: z.number().min(0),
  actualCost: z.number().min(0).optional(),
  currency: z.string().min(1),
});

export const travelLegSchema = z.object({
  fromActivityId: z.string().min(1),
  toActivityId: z.string().min(1),
  mode: z.string().min(1),
  estimatedDurationMinutes: z.number().int().positive().optional(),
  notes: z.string().optional(),
});

export const tripSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).optional(),
  name: z.string().min(1),
  destination: z.string().min(1),
  summary: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  tripLengthDays: z.number().int().positive().optional(),
  numPeople: z.number().int().positive().optional(),
  travelers: z.number().int().positive().optional(),
  budgetLevel: z.string().optional(),
  budgetCurrency: z.string().optional(),
  days: z.array(daySchema).min(1),
  budgetItems: z.array(budgetItemSchema).default([]),
  travelLegs: z.array(travelLegSchema).default([]),
  notes: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  sourcePrompt: z.string().optional(),
  isPublic: z.boolean().optional(),
  shareId: z.string().optional(),
  promptHash: z.string().optional(),
  status: z.enum(["draft", "generating", "complete", "failed"]).optional(),
  visibility: z.enum(["private", "local", "public_snapshot"]).optional(),
  schemaVersion: z.number().int().positive().optional(),
});

export const aiTripResponseSchema = z.object({
  message: z.string().min(1),
  trip: tripSchema.omit({ id: true }).extend({ id: z.string().optional() }).nullable(),
});

export type Activity = z.infer<typeof activitySchema>;
export type Day = z.infer<typeof daySchema>;
export type BudgetItem = z.infer<typeof budgetItemSchema>;
export type TravelLeg = z.infer<typeof travelLegSchema>;
export type Trip = z.infer<typeof tripSchema>;
export type AITripResponse = z.infer<typeof aiTripResponseSchema>;

const destinationDefaults: Record<string, { lat: number; lng: number; address: string }> = {
  lisbon: { lat: 38.7223, lng: -9.1393, address: "Lisbon, Portugal" },
  kyoto: { lat: 35.0116, lng: 135.7681, address: "Kyoto, Japan" },
  tokyo: { lat: 35.6762, lng: 139.6503, address: "Tokyo, Japan" },
  paris: { lat: 48.8566, lng: 2.3522, address: "Paris, France" },
  rome: { lat: 41.9028, lng: 12.4964, address: "Rome, Italy" },
  bali: { lat: -8.4095, lng: 115.1889, address: "Bali, Indonesia" },
  barcelona: { lat: 41.3874, lng: 2.1686, address: "Barcelona, Spain" },
  "new york": { lat: 40.7128, lng: -74.006, address: "New York, NY" },
};

export function parseDestinationFromPrompt(prompt: string) {
  const lower = prompt.toLowerCase();
  for (const key of Object.keys(destinationDefaults)) {
    if (lower.includes(key)) return titleCase(key);
  }
  const match = prompt.match(/\b(?:in|to|for)\s+([A-Z][A-Za-z\s-]{2,40})(?:\s|,|$)/);
  return match?.[1]?.trim() || "Lisbon";
}

export function parseTripLengthDays(prompt: string) {
  const lower = prompt.toLowerCase();
  const explicit = lower.match(/\b(\d{1,2})\s*(?:day|days)\b/);
  if (explicit) return clampDays(Number(explicit[1]));

  const lengthLine = lower.match(/trip length:\s*(\d{1,2})/);
  if (lengthLine) return clampDays(Number(lengthLine[1]));

  const dateRange = lower.match(/(?:dates|travel dates):\s*[^.]*?(\d{1,2})\s*[–-]\s*(\d{1,2})/);
  if (dateRange) {
    const start = Number(dateRange[1]);
    const end = Number(dateRange[2]);
    if (Number.isFinite(start) && Number.isFinite(end) && end >= start) return clampDays(end - start + 1);
  }

  return undefined;
}

export function buildMockTrip(prompt: string, id = `local-${Date.now()}`): Trip {
  const destination = parseDestinationFromPrompt(prompt);
  const defaults = destinationDefaults[destination.toLowerCase()] ?? destinationDefaults.lisbon;
  const requestedDays = parseTripLengthDays(prompt) ?? 3;

  return {
    id,
    title: `${destination} Starter Plan`,
    name: `${destination} Starter Plan`,
    destination,
    summary: "A practical starter itinerary you can edit, map, save, and refine with AI.",
    numPeople: 2,
    travelers: 2,
    tripLengthDays: requestedDays,
    budgetLevel: "Flexible",
    budgetCurrency: "USD",
    sourcePrompt: prompt,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    notes: "",
    days: buildFallbackDays(destination, requestedDays, defaults),
    budgetItems: [
      { id: "budget-lodging", category: "Lodging", label: "Hotel or apartment", estimatedCost: 320, currency: "USD" },
      { id: "budget-food", category: "Food", label: "Meals and snacks", estimatedCost: 160, currency: "USD" },
      { id: "budget-transit", category: "Transit", label: "Local transit", estimatedCost: 60, currency: "USD" },
      { id: "budget-activities", category: "Activities", label: "Tickets and tours", estimatedCost: 90, currency: "USD" },
      { id: "budget-misc", category: "Misc", label: "Buffer", estimatedCost: 75, currency: "USD" },
    ],
    travelLegs: [],
  };
}

function buildFallbackDays(
  destination: string,
  requestedDays: number,
  defaults: { lat: number; lng: number; address: string },
): Day[] {
  const templates = getDestinationTemplates(destination);

  return Array.from({ length: requestedDays }, (_, idx) => {
    const template = templates[idx % templates.length];
    const dayNumber = idx + 1;
    return {
      id: `day${dayNumber}`,
      dayNumber,
      title: template.title,
      date: `Day ${dayNumber}`,
      summary: template.summary,
      theme: template.theme,
      activities: template.activities.map((activity, actIdx) =>
        withActivityPhoto({
          id: `act-${dayNumber}-${actIdx + 1}`,
          title: activity.title,
          name: activity.title,
          category: activity.category,
          description: activity.description,
          locationName: activity.locationName,
          address: defaults.address,
          lat: defaults.lat + (idx * 0.012) + (actIdx * 0.006),
          lng: defaults.lng + (idx * -0.01) + (actIdx * 0.007),
          estimatedCost: activity.estimatedCost,
          currency: "USD",
          confidence: 0.72,
          verificationStatus: "ai_suggestion" as const,
          notes: "AI suggestion. Verify hours, transit, and booking details before travel.",
          locked: false,
        }, destination),
      ),
    };
  });
}

function getDestinationTemplates(destination: string) {
  if (destination.toLowerCase().includes("tokyo")) {
    return [
      {
        title: "Arrival, Shibuya, and first bites",
        summary: "Ease into Tokyo with a central neighborhood walk and a memorable food stop.",
        theme: "Arrival, orientation, food",
        activities: [
          templateActivity("Shibuya Crossing and Hachiko Square", "Landmark", "Start with Tokyo's most recognizable crossing, then explore nearby side streets.", "Shibuya Crossing", 0),
          templateActivity("Shibuya Sky", "Viewpoint", "Book a timed entry for skyline views, ideally near sunset.", "Shibuya Sky", 25),
          templateActivity("Nonbei Yokocho or Ebisu yokocho dinner", "Food", "Try a compact alley dinner area with izakaya-style small plates.", "Nonbei Yokocho", 45),
        ],
      },
      {
        title: "Markets, gardens, and Ginza",
        summary: "Pair food-focused exploring with a classic garden and polished city evening.",
        theme: "Food, gardens, city lights",
        activities: [
          templateActivity("Tsukiji Outer Market breakfast", "Food", "Sample seafood skewers, tamago, and coffee while the market is lively.", "Tsukiji Outer Market", 30),
          templateActivity("Hamarikyu Gardens", "Nature", "Walk the tidal pond gardens and pause at the teahouse.", "Hamarikyu Gardens", 10),
          templateActivity("Ginza galleries and depachika food halls", "Museum", "Browse design shops, small galleries, and basement food halls for dinner ideas.", "Ginza", 35),
        ],
      },
      {
        title: "Museums and modern Tokyo",
        summary: "A culture-heavy day built around specific museums and neighborhoods.",
        theme: "Museums, design, neighborhoods",
        activities: [
          templateActivity("teamLab Planets Toyosu", "Museum", "Reserve ahead for the immersive digital art experience.", "teamLab Planets Toyosu", 35),
          templateActivity("Kiyosumi Shirakawa coffee walk", "Food", "Explore roasteries and calm streets after the museum.", "Kiyosumi Shirakawa", 18),
          templateActivity("Mori Art Museum or Roppongi Hills", "Museum", "Finish with contemporary art and city views in Roppongi.", "Mori Art Museum", 30),
        ],
      },
      {
        title: "Asakusa, Ueno, and old Tokyo",
        summary: "Historic temples, museum options, and relaxed evening food.",
        theme: "History, museums, street food",
        activities: [
          templateActivity("Senso-ji Temple and Nakamise-dori", "Landmark", "Visit early if possible, then snack along the shopping street.", "Senso-ji Temple", 10),
          templateActivity("Tokyo National Museum in Ueno Park", "Museum", "Focus on the Japanese Gallery if time is limited.", "Tokyo National Museum", 20),
          templateActivity("Ameyoko Market dinner crawl", "Food", "Explore casual stalls and izakaya under the rail tracks.", "Ameyoko Market", 35),
        ],
      },
      {
        title: "Harajuku, Meiji, and final favorites",
        summary: "Mix a peaceful shrine, youth culture, and a final memorable meal.",
        theme: "Culture, shopping, food",
        activities: [
          templateActivity("Meiji Shrine", "Landmark", "Walk through the forested approach and visit the shrine before crowds build.", "Meiji Shrine", 0),
          templateActivity("Harajuku and Omotesando", "Shopping", "Explore design stores, street fashion, and cafes.", "Omotesando", 20),
          templateActivity("Shinjuku ramen or Golden Gai evening", "Food", "Choose a ramen shop or compact bar area for a final night out.", "Shinjuku", 40),
        ],
      },
    ];
  }

  return [
    {
      title: "Arrival and neighborhood orientation",
      summary: `Start in ${destination} with a real landmark, an easy walk, and a local dinner area.`,
      theme: "Arrival, orientation, food",
      activities: [
        templateActivity(`${destination} central landmark`, "Landmark", `Begin at a central, easy-to-find landmark in ${destination}.`, `${destination} central landmark`, 0),
        templateActivity(`${destination} historic quarter walk`, "Walking", "Use this as a flexible orientation route with coffee and photo stops.", `${destination} historic quarter`, 10),
        templateActivity(`${destination} local food district`, "Food", "Pick a well-reviewed restaurant cluster near your base.", `${destination} food district`, 40),
      ],
    },
    {
      title: "Culture, food, and viewpoints",
      summary: "A fuller day with a specific cultural stop, local food, and a scenic finish.",
      theme: "Culture, food, views",
      activities: [
        templateActivity(`${destination} signature museum`, "Museum", "Choose the city's best-fit museum for your interests.", `${destination} signature museum`, 25),
        templateActivity(`${destination} market or cafe district`, "Food", "Build lunch around a market, cafe street, or casual local favorite.", `${destination} market district`, 25),
        templateActivity(`${destination} sunset viewpoint`, "Viewpoint", "End with a viewpoint and keep dinner nearby to reduce transit.", `${destination} viewpoint`, 0),
      ],
    },
    {
      title: "Local neighborhoods and flexible finds",
      summary: "A slower day for neighborhoods, shopping, parks, and an easy evening.",
      theme: "Neighborhoods, parks, flexible time",
      activities: [
        templateActivity(`${destination} creative neighborhood`, "Neighborhood", "Explore boutiques, cafes, and side streets.", `${destination} creative neighborhood`, 15),
        templateActivity(`${destination} park or waterfront`, "Nature", "Add a calmer outdoor break between busier stops.", `${destination} park`, 0),
        templateActivity(`${destination} memorable dinner`, "Food", "Choose a specific restaurant after checking hours and reservations.", `${destination} restaurant area`, 50),
      ],
    },
  ];
}

function templateActivity(
  title: string,
  category: string,
  description: string,
  locationName: string,
  estimatedCost: number,
) {
  return { title, category, description, locationName, estimatedCost };
}

export function normalizeTrip(input: unknown, fallbackPrompt = "Trip plan", fallbackId?: string): Trip {
  const raw = input as {
    id?: unknown;
    title?: unknown;
    name?: unknown;
    destination?: unknown;
    summary?: unknown;
    numDays?: unknown;
    tripLengthDays?: unknown;
    numPeople?: unknown;
    travelers?: unknown;
    budgetLevel?: unknown;
    budgetCurrency?: unknown;
    days?: unknown;
  };
  const fallback = buildMockTrip(fallbackPrompt, fallbackId);
  const rawDays = Array.isArray(raw?.days) ? raw.days : [];
  const requestedDays = parseTripLengthDays(fallbackPrompt);
  const numDays = Math.max(1, Number(requestedDays ?? raw?.tripLengthDays ?? raw?.numDays ?? rawDays.length ?? fallback.days.length));

  const days = Array.from({ length: numDays }, (_, idx) => {
    const rawDay = (rawDays[idx] ?? {}) as { [key: string]: unknown };
    const rawActivities = Array.isArray(rawDay.activities) ? rawDay.activities : [];
    const fallbackDay = fallback.days[idx] ?? fallback.days[fallback.days.length - 1];
    const useFallbackActivities = !rawActivities.length || activitiesLookGeneric(rawActivities);
    return {
      id: stringOr(rawDay.id, `day${idx + 1}`),
      dayNumber: Number(rawDay.dayNumber ?? idx + 1),
      date: stringOr(rawDay.date, `Day ${idx + 1}`),
      theme: optionalString(rawDay.theme),
      activities: useFallbackActivities
        ? fallbackDay.activities
        : rawActivities.map((activity, actIdx) =>
            withActivityPhoto(normalizeActivity(activity, idx, actIdx), fallback.destination),
          ),
    };
  });

  const parsed = tripSchema.safeParse({
    id: stringOr(raw?.id, fallbackId ?? `trip-${Date.now()}`),
    title: stringOr(raw?.title ?? raw?.name, fallback.title ?? fallback.name),
    name: stringOr(raw?.name, fallback.name),
    destination: stringOr(raw?.destination, fallback.destination),
    summary: optionalString(raw?.summary) ?? fallback.summary,
    tripLengthDays: numberOr(raw?.tripLengthDays ?? raw?.numDays, days.length),
    numPeople: numberOr(raw?.numPeople, fallback.numPeople),
    travelers: numberOr(raw?.travelers ?? raw?.numPeople, fallback.travelers),
    budgetLevel: optionalString(raw?.budgetLevel) ?? fallback.budgetLevel,
    budgetCurrency: optionalString(raw?.budgetCurrency) ?? fallback.budgetCurrency,
    days,
    budgetItems: Array.isArray((raw as { budgetItems?: unknown }).budgetItems)
      ? (raw as { budgetItems: unknown[] }).budgetItems
      : fallback.budgetItems,
    travelLegs: Array.isArray((raw as { travelLegs?: unknown }).travelLegs)
      ? (raw as { travelLegs: unknown[] }).travelLegs
      : [],
    notes: optionalString((raw as { notes?: unknown }).notes) ?? fallback.notes,
    createdAt: optionalString((raw as { createdAt?: unknown }).createdAt) ?? fallback.createdAt,
    updatedAt: new Date().toISOString(),
    sourcePrompt: optionalString((raw as { sourcePrompt?: unknown }).sourcePrompt) ?? fallbackPrompt,
    isPublic: Boolean((raw as { isPublic?: unknown }).isPublic),
    shareId: optionalString((raw as { shareId?: unknown }).shareId),
  });

  return parsed.success ? parsed.data : fallback;
}

function activitiesLookGeneric(activities: unknown[]) {
  const genericTerms = [
    "base hotel",
    "neighborhood walk",
    "local dinner reservation",
    "morning market or cafe stop",
    "signature museum or historic site",
    "sunset viewpoint",
    "central market or cafe",
    "restaurant near hotel",
  ];
  const titles = activities.map((activity) => {
    const raw = (activity ?? {}) as { title?: unknown; name?: unknown; locationName?: unknown };
    return `${raw.title ?? ""} ${raw.name ?? ""} ${raw.locationName ?? ""}`.toLowerCase();
  });
  return titles.length > 0 && titles.filter((title) => genericTerms.some((term) => title.includes(term))).length >= Math.ceil(titles.length / 2);
}

function normalizeActivity(input: unknown, dayIdx: number, actIdx: number): Activity {
  const raw = (input ?? {}) as { [key: string]: unknown };
  return activitySchema.parse({
    id: stringOr(raw.id, `act-${dayIdx + 1}-${actIdx + 1}`),
    title: stringOr(raw.title ?? raw.name, `Activity ${actIdx + 1}`),
    name: stringOr(raw.name ?? raw.title, `Activity ${actIdx + 1}`),
    category: stringOr(raw.category, "Activity"),
    description: stringOr(raw.description, "Details are being refined."),
    startTime: optionalString(raw.startTime ?? raw.startsAt),
    endTime: optionalString(raw.endTime),
    locationName: optionalString(raw.locationName ?? raw.name),
    address: optionalString(raw.address),
    rating: numberOr(raw.rating),
    photoUrl: optionalString(raw.photoUrl),
    imageUrl: optionalString(raw.imageUrl),
    lat: numberOr(raw.lat),
    lng: numberOr(raw.lng),
    startsAt: optionalString(raw.startsAt),
    durationMinutes: numberOr(raw.durationMinutes),
    estimatedCost: numberOr(raw.estimatedCost),
    currency: optionalString(raw.currency),
    sourceName: optionalString(raw.sourceName),
    sourceUrl: optionalString(raw.sourceUrl),
    confidence: numberOr(raw.confidence),
    lastCheckedAt: optionalString(raw.lastCheckedAt),
    verificationStatus: optionalString(raw.verificationStatus) ?? "ai_suggestion",
    notes: optionalString(raw.notes),
    locked: Boolean(raw.locked ?? raw.isLocked),
    isLocked: Boolean(raw.locked ?? raw.isLocked),
  });
}

function stringOr(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function optionalString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function numberOr(value: unknown, fallback?: number) {
  const next = typeof value === "string" ? Number(value) : value;
  return typeof next === "number" && Number.isFinite(next) ? next : fallback;
}

function clampDays(value: number) {
  if (!Number.isFinite(value)) return undefined;
  return Math.min(21, Math.max(1, Math.round(value)));
}

function titleCase(value: string) {
  return value.replace(/\b\w/g, (c) => c.toUpperCase());
}
