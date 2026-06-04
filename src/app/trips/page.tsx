"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PLACEHOLDER_IMAGE, getDestinationImage } from "@/lib/destination-images";

type TripCard = {
  id: string;
  name?: string;
  title?: string;
  destination: string;
  query?: string;
  tripLengthDays?: number;
  updatedAt?: string;
  createdAt?: string;
};

const templates = [
  { label: "Weekend in Paris", href: "/?q=Weekend%20in%20Paris" },
  { label: "10 days in Japan", href: "/?q=10%20days%20in%20Japan" },
  { label: "NYC city break", href: "/?q=NYC%20city%20break" },
  { label: "5 days in Italy", href: "/?q=5%20days%20in%20Italy" },
];

export default function TripsPage() {
  const [trips, setTrips] = useState<TripCard[]>([]);

  useEffect(() => {
    try {
      const recentRaw = localStorage.getItem("wayfarer_recent_trips");
      const savedRaw = localStorage.getItem("wayfarer_saved_trips");
      const recent = recentRaw ? JSON.parse(recentRaw) : [];
      const saved = savedRaw ? JSON.parse(savedRaw) : [];
      const combined = [...(Array.isArray(saved) ? saved : []), ...(Array.isArray(recent) ? recent : [])];
      const byId = new Map<string, TripCard>();
      combined.forEach((trip) => {
        if (trip?.id && trip?.destination) byId.set(trip.id, trip);
      });
      setTrips(Array.from(byId.values()));
    } catch {
      // Keep empty state if localStorage is unavailable.
    }
  }, []);

  const removeTrip = (id: string) => {
    const next = trips.filter((trip) => trip.id !== id);
    setTrips(next);
    for (const key of ["wayfarer_recent_trips", "wayfarer_saved_trips"]) {
      try {
        const raw = localStorage.getItem(key);
        const list = raw ? JSON.parse(raw) : [];
        if (Array.isArray(list)) {
          localStorage.setItem(key, JSON.stringify(list.filter((trip) => trip?.id !== id)));
        }
      } catch {
        // Ignore storage cleanup errors; the in-memory card still disappears.
      }
    }
  };

  return (
    <div className="min-h-screen bg-background px-6 py-12">
      <div className="mx-auto w-full max-w-5xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-2xl font-semibold">Your trips</div>
            <div className="mt-2 text-sm text-muted">Recent and locally saved Wayfarer itineraries.</div>
          </div>
          <Link
            href="/"
            className="w-fit rounded-full bg-[#E8472A] px-5 py-2 text-sm font-semibold text-white focus:outline-none focus:ring-4 focus:ring-[#E8472A]/25"
          >
            Create your first trip
          </Link>
        </div>

        {trips.length > 0 ? (
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {trips.map((trip) => {
              const image = getDestinationImage(trip.destination) ?? PLACEHOLDER_IMAGE;
              return (
                <div key={trip.id} className="overflow-hidden rounded-2xl border border-panel-border bg-white shadow-sm">
                  <div className="relative h-36 bg-neutral-100">
                    <img src={image.url} alt={image.alt} className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-3 left-3 text-white">
                      <div className="text-lg font-semibold">{trip.title ?? trip.name ?? "Untitled trip"}</div>
                      <div className="text-xs text-white/80">{trip.destination}</div>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="text-xs text-muted">
                      {trip.tripLengthDays ? `${trip.tripLengthDays} days · ` : null}
                      Last updated {formatDate(trip.updatedAt ?? trip.createdAt)}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Link
                        href={`/trip/${trip.id}/chat/main${trip.query ? `?q=${encodeURIComponent(trip.query)}` : ""}`}
                        className="rounded-full bg-foreground px-4 py-2 text-xs font-semibold text-white"
                      >
                        Open trip
                      </Link>
                      <button
                        type="button"
                        onClick={() => removeTrip(trip.id)}
                        className="rounded-full border border-neutral-200 bg-white px-4 py-2 text-xs font-semibold text-neutral-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-8 rounded-3xl border border-panel-border bg-white p-8 shadow-sm">
            <div className="text-xl font-semibold text-neutral-900">No trips yet — create your first AI itinerary.</div>
            <div className="mt-2 text-sm text-muted">
              You can generate anonymously and save locally. Create a free account later when you want cloud sync.
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {templates.map((template) => (
                <Link
                  key={template.label}
                  href={template.href}
                  className="rounded-2xl border border-neutral-200 bg-[#F5F0EB] p-4 text-sm font-semibold text-neutral-800 transition hover:border-[#E8472A] hover:text-[#E8472A]"
                >
                  {template.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function formatDate(value?: string) {
  if (!value) return "recently";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "recently";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}
