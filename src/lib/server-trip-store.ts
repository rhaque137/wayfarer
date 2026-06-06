import type { Trip } from "@/lib/trip-schema";

const globalTrips = globalThis as typeof globalThis & {
  __wayfarerTripStore?: Map<string, Trip>;
};

const tripStore = globalTrips.__wayfarerTripStore ?? new Map<string, Trip>();
globalTrips.__wayfarerTripStore = tripStore;

export function saveServerTrip(trip: Trip) {
  tripStore.set(trip.id, trip);
}

export function getServerTrip(id: string) {
  return tripStore.get(id) ?? null;
}
