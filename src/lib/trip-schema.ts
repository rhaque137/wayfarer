import { z } from "zod";

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

export function buildMockTrip(prompt: string, id = `local-${Date.now()}`): Trip {
  const destination = parseDestinationFromPrompt(prompt);
  const defaults = destinationDefaults[destination.toLowerCase()] ?? destinationDefaults.lisbon;
  const base = { lat: defaults.lat, lng: defaults.lng };

  return {
    id,
    title: `${destination} Starter Plan`,
    name: `${destination} Starter Plan`,
    destination,
    summary: "A practical starter itinerary you can edit, map, save, and refine with AI.",
    numPeople: 2,
    travelers: 2,
    tripLengthDays: 2,
    budgetLevel: "Flexible",
    budgetCurrency: "USD",
    sourcePrompt: prompt,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    notes: "",
    days: [
      {
        id: "day1",
        dayNumber: 1,
        title: "Arrival and orientation",
        date: "Day 1",
        summary: "Ease into the destination with a hotel anchor, neighborhood walk, and relaxed dinner.",
        theme: "Arrival, orientation, and local flavor",
        activities: [
          {
            id: "act-1-hotel",
            title: `${destination} base hotel`,
            name: `${destination} base hotel`,
            category: "Hotel",
            description: "Check in, drop bags, and use this as the anchor point for your first day.",
            locationName: `${destination} base hotel`,
            address: defaults.address,
            lat: base.lat,
            lng: base.lng,
            confidence: 0.55,
            verificationStatus: "needs_verification",
            locked: false,
          },
          {
            id: "act-1-walk",
            title: `${destination} neighborhood walk`,
            name: `${destination} neighborhood walk`,
            category: "Landmark",
            description: "Start with a low-pressure walk through a central neighborhood to get oriented.",
            locationName: `${destination} central neighborhood`,
            address: defaults.address,
            lat: base.lat + 0.01,
            lng: base.lng + 0.01,
            confidence: 0.62,
            verificationStatus: "ai_suggestion",
            locked: false,
          },
          {
            id: "act-1-dinner",
            title: "Local dinner reservation",
            name: "Local dinner reservation",
            category: "Restaurant",
            description: "Choose a well-reviewed local spot near your hotel and keep the first night easy.",
            locationName: "Restaurant near hotel",
            address: defaults.address,
            lat: base.lat - 0.008,
            lng: base.lng - 0.006,
            estimatedCost: 45,
            currency: "USD",
            confidence: 0.5,
            verificationStatus: "needs_verification",
            locked: false,
          },
        ],
      },
      {
        id: "day2",
        dayNumber: 2,
        title: "Culture and local flavor",
        date: "Day 2",
        summary: "A fuller day with food, culture, and a scenic finish.",
        theme: "Culture, food, and a flexible afternoon",
        activities: [
          {
            id: "act-2-market",
            title: "Morning market or cafe stop",
            name: "Morning market or cafe stop",
            category: "Food",
            description: "Start the day somewhere casual with local food, coffee, and people-watching.",
            locationName: "Central market or cafe",
            address: defaults.address,
            lat: base.lat + 0.018,
            lng: base.lng - 0.012,
            estimatedCost: 20,
            currency: "USD",
            confidence: 0.58,
            verificationStatus: "ai_suggestion",
            locked: false,
          },
          {
            id: "act-2-museum",
            title: "Signature museum or historic site",
            name: "Signature museum or historic site",
            category: "Museum",
            description: "Add one substantial cultural stop, then leave space to wander nearby streets.",
            locationName: "Museum or historic site",
            address: defaults.address,
            lat: base.lat - 0.016,
            lng: base.lng + 0.014,
            estimatedCost: 25,
            currency: "USD",
            confidence: 0.6,
            verificationStatus: "needs_verification",
            locked: false,
          },
          {
            id: "act-2-view",
            title: "Sunset viewpoint",
            name: "Sunset viewpoint",
            category: "Viewpoint",
            description: "Close with a scenic view and keep dinner nearby to avoid extra transit.",
            locationName: "Scenic viewpoint",
            address: defaults.address,
            lat: base.lat + 0.024,
            lng: base.lng + 0.02,
            confidence: 0.65,
            verificationStatus: "ai_suggestion",
            locked: false,
          },
        ],
      },
    ],
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
  const numDays = Math.max(1, Number(raw?.numDays ?? rawDays.length ?? fallback.days.length));

  const days = Array.from({ length: numDays }, (_, idx) => {
    const rawDay = (rawDays[idx] ?? {}) as { [key: string]: unknown };
    const rawActivities = Array.isArray(rawDay.activities) ? rawDay.activities : [];
    const fallbackDay = fallback.days[idx] ?? fallback.days[fallback.days.length - 1];
    return {
      id: stringOr(rawDay.id, `day${idx + 1}`),
      dayNumber: Number(rawDay.dayNumber ?? idx + 1),
      date: stringOr(rawDay.date, `Day ${idx + 1}`),
      theme: optionalString(rawDay.theme),
      activities: rawActivities.length
        ? rawActivities.map((activity, actIdx) => normalizeActivity(activity, idx, actIdx))
        : fallbackDay.activities,
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

function titleCase(value: string) {
  return value.replace(/\b\w/g, (c) => c.toUpperCase());
}
