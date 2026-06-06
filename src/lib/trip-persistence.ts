"use client";

import {
  buildMockTrip,
  parseDestinationFromPrompt,
  parseTripLengthDays,
  type Trip,
} from "@/lib/trip-schema";

export const TRIP_RECORDS_KEY = "wayfarer_trip_records";
export const RECENT_TRIPS_KEY = "wayfarer_recent_trips";
export const SAVED_TRIPS_KEY = "wayfarer_saved_trips";
export const TRIP_SCHEMA_VERSION = 2;

export type TripStatus = "draft" | "generating" | "complete" | "failed";

export type LocalTripRecord = Trip & {
  sourcePrompt: string;
  promptHash: string;
  status: TripStatus;
  visibility: "local" | "private" | "public_snapshot";
  schemaVersion: number;
  createdAt: string;
  updatedAt: string;
};

type TripCardRecord = {
  id: string;
  name: string;
  title?: string;
  destination: string;
  query?: string;
  sourcePrompt?: string;
  promptHash?: string;
  status?: TripStatus;
  visibility?: "local" | "private" | "public_snapshot";
  schemaVersion?: number;
  tripLengthDays?: number;
  createdAt?: string;
  updatedAt?: string;
};

export function createLocalTripShell(id: string, prompt: string): LocalTripRecord {
  const now = new Date().toISOString();
  const destination = parseDestinationFromPrompt(prompt);
  const durationDays = parseTripLengthDays(prompt);

  return {
    id,
    title: `${destination} itinerary`,
    name: `${destination} itinerary`,
    destination,
    summary: "Wayfarer is generating this itinerary.",
    sourcePrompt: prompt,
    promptHash: hashPrompt(prompt),
    status: "generating",
    visibility: "local",
    schemaVersion: TRIP_SCHEMA_VERSION,
    tripLengthDays: durationDays,
    travelers: parseTravelers(prompt) ?? 2,
    numPeople: parseTravelers(prompt) ?? 2,
    budgetLevel: parseBudget(prompt),
    budgetCurrency: "USD",
    days: [],
    budgetItems: [],
    travelLegs: [],
    notes: "",
    createdAt: now,
    updatedAt: now,
  };
}

export function completeLocalTripFromPrompt(record: LocalTripRecord): LocalTripRecord {
  const generated = buildMockTrip(record.sourcePrompt, record.id);
  const now = new Date().toISOString();
  return {
    ...generated,
    title: generated.title ?? record.title,
    name: generated.name ?? record.name,
    sourcePrompt: record.sourcePrompt,
    promptHash: record.promptHash,
    status: "complete",
    visibility: record.visibility,
    schemaVersion: TRIP_SCHEMA_VERSION,
    createdAt: record.createdAt,
    updatedAt: now,
  };
}

export function saveLocalTripRecord(record: LocalTripRecord) {
  if (typeof window === "undefined") return;
  upsertList(TRIP_RECORDS_KEY, record);
  upsertList(RECENT_TRIPS_KEY, toTripCardRecord(record));
  if (record.status === "complete") {
    upsertList(SAVED_TRIPS_KEY, record);
  }
}

export function loadLocalTripRecord(id: string): LocalTripRecord | null {
  if (typeof window === "undefined") return null;
  const candidates = [
    ...readList<LocalTripRecord>(TRIP_RECORDS_KEY),
    ...readList<LocalTripRecord>(SAVED_TRIPS_KEY),
  ];
  const found = candidates.find((record) => record?.id === id);
  if (!found) return null;
  return normalizeStoredRecord(found);
}

export function hashPrompt(prompt: string) {
  let hash = 5381;
  for (let idx = 0; idx < prompt.length; idx += 1) {
    hash = (hash * 33) ^ prompt.charCodeAt(idx);
  }
  return (hash >>> 0).toString(36);
}

function normalizeStoredRecord(record: LocalTripRecord): LocalTripRecord {
  return {
    ...record,
    promptHash: record.promptHash ?? hashPrompt(record.sourcePrompt ?? ""),
    sourcePrompt: record.sourcePrompt ?? "",
    status: record.status ?? (record.days?.length ? "complete" : "draft"),
    visibility: record.visibility ?? "local",
    schemaVersion: record.schemaVersion ?? 1,
    createdAt: record.createdAt ?? new Date().toISOString(),
    updatedAt: record.updatedAt ?? record.createdAt ?? new Date().toISOString(),
  };
}

function toTripCardRecord(record: LocalTripRecord): TripCardRecord {
  return {
    id: record.id,
    name: record.name,
    title: record.title,
    destination: record.destination,
    query: record.sourcePrompt,
    sourcePrompt: record.sourcePrompt,
    promptHash: record.promptHash,
    status: record.status,
    visibility: record.visibility,
    schemaVersion: record.schemaVersion,
    tripLengthDays: record.tripLengthDays,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

function upsertList<T extends { id: string; updatedAt?: string }>(key: string, item: T) {
  const list = readList<T>(key).filter((existing) => existing?.id !== item.id);
  localStorage.setItem(key, JSON.stringify([item, ...list].slice(0, 30)));
}

function readList<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function parseTravelers(prompt: string) {
  const match = prompt.toLowerCase().match(/(?:travelers|people|guests):?\s*(\d{1,2})/);
  if (!match) return undefined;
  const value = Number(match[1]);
  return Number.isFinite(value) && value > 0 ? value : undefined;
}

function parseBudget(prompt: string) {
  const match = prompt.match(/budget:\s*([^.\n]+)/i);
  return match?.[1]?.trim() || "Flexible";
}
