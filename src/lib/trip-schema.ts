import { z } from "zod";

export const activitySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  category: z.string().min(1).default("Activity"),
  description: z.string().min(1).default("Details are being refined."),
  address: z.string().optional(),
  rating: z.number().min(0).max(5).optional(),
  photoUrl: z.string().url().optional(),
  imageUrl: z.string().url().optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  startsAt: z.string().optional(),
  durationMinutes: z.number().int().positive().optional(),
  estimatedCost: z.number().min(0).optional(),
  notes: z.string().optional(),
  locked: z.boolean().default(false),
});

export const daySchema = z.object({
  id: z.string().min(1),
  dayNumber: z.number().int().positive(),
  date: z.string().min(1),
  theme: z.string().optional(),
  activities: z.array(activitySchema).default([]),
});

export const tripSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  destination: z.string().min(1),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  numPeople: z.number().int().positive().optional(),
  days: z.array(daySchema).min(1),
});

export const aiTripResponseSchema = z.object({
  message: z.string().min(1),
  trip: tripSchema.omit({ id: true }).extend({ id: z.string().optional() }).nullable(),
});

export type Activity = z.infer<typeof activitySchema>;
export type Day = z.infer<typeof daySchema>;
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
    name: `${destination} Starter Plan`,
    destination,
    numPeople: 2,
    days: [
      {
        id: "day1",
        dayNumber: 1,
        date: "Day 1",
        theme: "Arrival, orientation, and local flavor",
        activities: [
          {
            id: "act-1-hotel",
            name: `${destination} base hotel`,
            category: "Hotel",
            description: "Check in, drop bags, and use this as the anchor point for your first day.",
            address: defaults.address,
            lat: base.lat,
            lng: base.lng,
            locked: false,
          },
          {
            id: "act-1-walk",
            name: `${destination} neighborhood walk`,
            category: "Landmark",
            description: "Start with a low-pressure walk through a central neighborhood to get oriented.",
            address: defaults.address,
            lat: base.lat + 0.01,
            lng: base.lng + 0.01,
            locked: false,
          },
          {
            id: "act-1-dinner",
            name: "Local dinner reservation",
            category: "Restaurant",
            description: "Choose a well-reviewed local spot near your hotel and keep the first night easy.",
            address: defaults.address,
            lat: base.lat - 0.008,
            lng: base.lng - 0.006,
            locked: false,
          },
        ],
      },
      {
        id: "day2",
        dayNumber: 2,
        date: "Day 2",
        theme: "Culture, food, and a flexible afternoon",
        activities: [
          {
            id: "act-2-market",
            name: "Morning market or cafe stop",
            category: "Food",
            description: "Start the day somewhere casual with local food, coffee, and people-watching.",
            address: defaults.address,
            lat: base.lat + 0.018,
            lng: base.lng - 0.012,
            locked: false,
          },
          {
            id: "act-2-museum",
            name: "Signature museum or historic site",
            category: "Museum",
            description: "Add one substantial cultural stop, then leave space to wander nearby streets.",
            address: defaults.address,
            lat: base.lat - 0.016,
            lng: base.lng + 0.014,
            locked: false,
          },
          {
            id: "act-2-view",
            name: "Sunset viewpoint",
            category: "Viewpoint",
            description: "Close with a scenic view and keep dinner nearby to avoid extra transit.",
            address: defaults.address,
            lat: base.lat + 0.024,
            lng: base.lng + 0.02,
            locked: false,
          },
        ],
      },
    ],
  };
}

export function normalizeTrip(input: unknown, fallbackPrompt = "Trip plan", fallbackId?: string): Trip {
  const raw = input as {
    id?: unknown;
    name?: unknown;
    destination?: unknown;
    numDays?: unknown;
    numPeople?: unknown;
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
    name: stringOr(raw?.name, fallback.name),
    destination: stringOr(raw?.destination, fallback.destination),
    numPeople: numberOr(raw?.numPeople, fallback.numPeople),
    days,
  });

  return parsed.success ? parsed.data : fallback;
}

function normalizeActivity(input: unknown, dayIdx: number, actIdx: number): Activity {
  const raw = (input ?? {}) as { [key: string]: unknown };
  return activitySchema.parse({
    id: stringOr(raw.id, `act-${dayIdx + 1}-${actIdx + 1}`),
    name: stringOr(raw.name, `Activity ${actIdx + 1}`),
    category: stringOr(raw.category, "Activity"),
    description: stringOr(raw.description, "Details are being refined."),
    address: optionalString(raw.address),
    rating: numberOr(raw.rating),
    photoUrl: optionalString(raw.photoUrl),
    imageUrl: optionalString(raw.imageUrl),
    lat: numberOr(raw.lat),
    lng: numberOr(raw.lng),
    startsAt: optionalString(raw.startsAt),
    durationMinutes: numberOr(raw.durationMinutes),
    estimatedCost: numberOr(raw.estimatedCost),
    notes: optionalString(raw.notes),
    locked: Boolean(raw.locked),
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
