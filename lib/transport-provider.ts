export type RideEstimateRequest = {
  pickupLat: number;
  pickupLon: number;
  dropoffLat: number;
  dropoffLon: number;
};

export type RideEstimate = {
  provider: string;
  currency?: string;
  estimateLow?: number;
  estimateHigh?: number;
  durationSeconds?: number;
  distanceMeters?: number;
  deepLink?: string;
};

export interface TransportProvider {
  name: string;
  estimateRide(req: RideEstimateRequest): Promise<RideEstimate>;
}

export function uberDeepLink({
  pickupLat,
  pickupLon,
  dropoffLat,
  dropoffLon,
}: RideEstimateRequest) {
  const url = new URL("https://m.uber.com/ul/");
  url.searchParams.set("action", "setPickup");
  url.searchParams.set("pickup[latitude]", String(pickupLat));
  url.searchParams.set("pickup[longitude]", String(pickupLon));
  url.searchParams.set("dropoff[latitude]", String(dropoffLat));
  url.searchParams.set("dropoff[longitude]", String(dropoffLon));
  return url.toString();
}

