import { withActivityPhoto } from "@/lib/activity-media";
import type { Activity, Trip } from "@/lib/trip-schema";

export type ItineraryPatchOperation = {
  op: "add" | "remove" | "replace" | "move" | "update";
  path: string;
  before?: unknown;
  after?: unknown;
};

export type ItineraryPatch = {
  id: string;
  tripId: string;
  summary: string;
  operations: ItineraryPatchOperation[];
  warnings?: string[];
};

export type PendingItineraryPatch = {
  patch: ItineraryPatch;
  previewTrip: Trip;
};

type CoffeeCandidate = {
  name: string;
  address: string;
  neighborhood: string;
  lat: number;
  lng: number;
  cost: number;
  note: string;
};

const COFFEE_SEEDS: Record<string, CoffeeCandidate[]> = {
  toronto: [
    {
      name: "Fahrenheit Coffee Richmond",
      address: "120 Lombard St, Toronto, ON M5C 3H5",
      neighborhood: "St. Lawrence",
      lat: 43.6519,
      lng: -79.3728,
      cost: 7,
      note: "Independent espresso bar near the downtown route.",
    },
    {
      name: "FIKA Cafe Kensington",
      address: "28 Kensington Ave, Toronto, ON M5T 2J9",
      neighborhood: "Kensington Market",
      lat: 43.6548,
      lng: -79.4005,
      cost: 8,
      note: "Local cafe that fits naturally into a Kensington or university-area day.",
    },
    {
      name: "Boxcar Social Harbourfront",
      address: "235 Queens Quay W, Toronto, ON M5J 2G8",
      neighborhood: "Harbourfront",
      lat: 43.6391,
      lng: -79.3836,
      cost: 8,
      note: "Coffee stop near the waterfront path and downtown attractions.",
    },
    {
      name: "Pilot Coffee Roasters Ossington",
      address: "117 Ossington Ave, Toronto, ON M6J 2Z2",
      neighborhood: "Ossington",
      lat: 43.6468,
      lng: -79.4198,
      cost: 8,
      note: "Specialty roaster on a strong dinner and shopping corridor.",
    },
  ],
  "new york": [
    {
      name: "Devocion Williamsburg",
      address: "69 Grand St, Brooklyn, NY 11249",
      neighborhood: "Williamsburg",
      lat: 40.7168,
      lng: -73.9655,
      cost: 8,
      note: "Independent Colombian coffee stop near Brooklyn routes.",
    },
    {
      name: "Everyman Espresso",
      address: "301 W Broadway, New York, NY 10013",
      neighborhood: "SoHo",
      lat: 40.7217,
      lng: -74.0047,
      cost: 8,
      note: "Small espresso bar that works with downtown Manhattan days.",
    },
    {
      name: "Stumptown Coffee Roasters Greenwich Village",
      address: "30 W 8th St, New York, NY 10011",
      neighborhood: "Greenwich Village",
      lat: 40.7328,
      lng: -73.9977,
      cost: 8,
      note: "Reliable specialty coffee near village and park routes.",
    },
    {
      name: "Birch Coffee Upper West Side",
      address: "750 Columbus Ave, New York, NY 10025",
      neighborhood: "Upper West Side",
      lat: 40.7937,
      lng: -73.9671,
      cost: 8,
      note: "Neighborhood coffee stop close to Central Park and museum days.",
    },
  ],
  paris: [
    {
      name: "Ten Belles",
      address: "10 Rue de la Grange aux Belles, 75010 Paris, France",
      neighborhood: "Canal Saint-Martin",
      lat: 48.8717,
      lng: 2.3634,
      cost: 8,
      note: "Specialty coffee near the canal and east-side routes.",
    },
    {
      name: "Coutume Cafe",
      address: "47 Rue de Babylone, 75007 Paris, France",
      neighborhood: "7th arrondissement",
      lat: 48.8509,
      lng: 2.319,
      cost: 8,
      note: "Coffee stop that pairs with Left Bank museums.",
    },
    {
      name: "KB CafeShop",
      address: "53 Av. Trudaine, 75009 Paris, France",
      neighborhood: "South Pigalle",
      lat: 48.8822,
      lng: 2.3436,
      cost: 8,
      note: "Independent cafe near Montmartre and Pigalle.",
    },
  ],
};

export function isCoffeeShopEditRequest(message: string) {
  return /coffee|cafe|café/i.test(message) && /\b(each|every|per)\s+day\b|days?/i.test(message);
}

export function buildCoffeeShopPatch(trip: Trip): PendingItineraryPatch {
  const previewTrip = cloneTrip(trip);
  const operations: ItineraryPatchOperation[] = [];
  const usedNames = new Set(
    previewTrip.days.flatMap((day) => day.activities.map((activity) => activity.name.toLowerCase())),
  );

  previewTrip.days = previewTrip.days.map((day, dayIndex) => {
    const candidate = chooseCoffeeCandidate(previewTrip.destination, day.activities, usedNames, dayIndex);
    usedNames.add(candidate.name.toLowerCase());
    const insertIndex = chooseCoffeeInsertIndex(day.activities);
    const activity = withActivityPhoto(
      {
        id: `coffee-${day.id}-${Date.now()}-${dayIndex}`,
        title: candidate.name,
        name: candidate.name,
        category: "Cafe",
        description: candidate.note,
        locationName: candidate.name,
        address: candidate.address,
        lat: candidate.lat,
        lng: candidate.lng,
        startTime: day.activities[insertIndex]?.startTime,
        durationMinutes: 35,
        estimatedCost: candidate.cost,
        currency: previewTrip.budgetCurrency ?? "USD",
        sourceName: "Wayfarer curated local seed",
        confidence: 0.72,
        verificationStatus: "needs_verification",
        notes: `${candidate.neighborhood}. Verify hours before visiting.`,
        locked: false,
      },
      previewTrip.destination,
    );
    const nextActivities = [...day.activities];
    nextActivities.splice(insertIndex, 0, activity);
    operations.push({
      op: "add",
      path: `/days/${dayIndex}/activities/${insertIndex}`,
      after: activity,
    });
    return {
      ...day,
      activities: nextActivities.map((activityItem, index) => ({
        ...activityItem,
        id: activityItem.id || `act-${dayIndex + 1}-${index + 1}`,
      })),
    };
  });

  previewTrip.updatedAt = new Date().toISOString();

  return {
    patch: {
      id: `patch-${Date.now()}`,
      tripId: trip.id,
      summary: `Add ${operations.length} independent coffee stops near each day's route.`,
      operations,
    },
    previewTrip,
  };
}

export function summarizePatch(pendingPatch: PendingItineraryPatch) {
  const added = pendingPatch.patch.operations.filter((operation) => operation.op === "add").length;
  const cost = pendingPatch.patch.operations.reduce((sum, operation) => {
    const activity = operation.after as Partial<Activity> | undefined;
    return sum + (typeof activity?.estimatedCost === "number" ? activity.estimatedCost : 0);
  }, 0);
  return `+${added} activities · +${added} map pins · about $${cost} estimated`;
}

function chooseCoffeeCandidate(
  destination: string,
  activities: Activity[],
  usedNames: Set<string>,
  dayIndex: number,
) {
  const destinationKey = normalizeDestinationKey(destination);
  const candidates = COFFEE_SEEDS[destinationKey] ?? createGenericCandidates(destination, activities);
  const available = candidates.filter((candidate) => !usedNames.has(candidate.name.toLowerCase()));
  const pool = available.length ? available : candidates;
  const anchors = activities.filter((activity) => activity.lat != null && activity.lng != null);
  if (!anchors.length) return pool[dayIndex % pool.length];
  return [...pool].sort((a, b) => distanceToDay(a, anchors) - distanceToDay(b, anchors))[0];
}

function chooseCoffeeInsertIndex(activities: Activity[]) {
  const lunchIndex = activities.findIndex((activity) => /lunch|food|restaurant|dinner/i.test(`${activity.name} ${activity.category}`));
  if (lunchIndex > 0) return lunchIndex;
  return Math.min(1, activities.length);
}

function createGenericCandidates(destination: string, activities: Activity[]): CoffeeCandidate[] {
  const anchor = activities.find((activity) => activity.lat != null && activity.lng != null);
  return [
    {
      name: `${destination} independent coffee stop`,
      address: anchor?.address ?? destination,
      neighborhood: anchor?.locationName ?? destination,
      lat: anchor?.lat ?? 0,
      lng: anchor?.lng ?? 0,
      cost: 8,
      note: "A locally reviewed cafe candidate. Coordinates should be verified before travel.",
    },
  ];
}

function distanceToDay(candidate: CoffeeCandidate, anchors: Activity[]) {
  return Math.min(
    ...anchors.map((activity) => distance(candidate.lat, candidate.lng, activity.lat ?? candidate.lat, activity.lng ?? candidate.lng)),
  );
}

function distance(lat1: number, lng1: number, lat2: number, lng2: number) {
  return Math.hypot(lat1 - lat2, lng1 - lng2);
}

function normalizeDestinationKey(destination: string) {
  const lower = destination.toLowerCase();
  if (/new york|nyc/.test(lower)) return "new york";
  if (/toronto/.test(lower)) return "toronto";
  if (/paris/.test(lower)) return "paris";
  return lower.replace(/[^a-z0-9]+/g, " ").trim();
}

function cloneTrip(trip: Trip): Trip {
  return JSON.parse(JSON.stringify(trip)) as Trip;
}
