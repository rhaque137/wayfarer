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
  { label: "Weekend in Paris", destination: "Paris", href: "/try?q=Weekend%20in%20Paris" },
  { label: "10 days in Japan", destination: "Japan", href: "/try?q=10%20days%20in%20Japan" },
  { label: "NYC city break", destination: "New York City", href: "/try?q=NYC%20city%20break" },
  { label: "5 days in Italy", destination: "Italy", href: "/try?q=5%20days%20in%20Italy" },
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
            <div className="mt-2 text-sm text-muted">Local trips saved on this device.</div>
          </div>
          <Link
            href="/try"
            className="w-fit rounded-full bg-[#E8472A] px-5 py-2 text-sm font-semibold text-white focus:outline-none focus:ring-4 focus:ring-[#E8472A]/25"
          >
            {trips.length > 0 ? "Create new trip" : "Create your first trip"}
          </Link>
        </div>

        {trips.length > 0 ? (
          <section className="mt-8">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-neutral-900">Recently updated</h2>
                <p className="mt-1 text-sm text-muted">Saved locally · not synced to an account</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
              {trips.map((trip) => {
                const image = getDestinationImage(trip.destination) ?? PLACEHOLDER_IMAGE;
                const isDraft = !trip.tripLengthDays && !(trip as TripCard & { days?: unknown[] }).days?.length;
                return (
                  <article
                    key={trip.id}
                    className="group overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition-[box-shadow,border-color,background-color] duration-200 ease-out hover:border-neutral-300 hover:shadow-md"
                  >
                    <div className="aspect-[16/9] w-full overflow-hidden bg-neutral-100">
                      <img
                        src={image.url}
                        alt={image.alt}
                        className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02]"
                        onError={(e) => {
                          e.currentTarget.src = PLACEHOLDER_IMAGE.url;
                        }}
                      />
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="line-clamp-1 text-base font-semibold text-neutral-900">
                            {trip.title ?? trip.name ?? "Untitled trip"}
                          </h3>
                          <p className="mt-1 line-clamp-1 text-xs text-neutral-500">{trip.destination}</p>
                        </div>
                        <details className="relative flex-shrink-0">
                          <summary className="flex h-8 w-8 cursor-pointer list-none items-center justify-center rounded-full border border-neutral-200 text-neutral-500 [&::-webkit-details-marker]:hidden">
                            ⋯
                          </summary>
                          <div className="absolute right-0 top-9 z-20 w-36 rounded-xl border border-neutral-200 bg-white p-2 shadow-lg">
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`Delete ${trip.title ?? trip.name ?? trip.destination}? This removes the locally saved trip from this device.`)) {
                                  removeTrip(trip.id);
                                }
                              }}
                              className="block w-full rounded-lg px-3 py-2 text-left text-xs font-semibold text-red-600 hover:bg-red-50"
                            >
                              Delete trip
                            </button>
                          </div>
                        </details>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="inline-flex rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-600">
                          Saved locally
                        </span>
                        <span className="inline-flex rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-600">
                          {isDraft ? "Draft" : "Generated from prompt"}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-neutral-500">
                        Last updated {formatDate(trip.updatedAt ?? trip.createdAt)}
                      </p>
                      <Link
                        href={`/trip/${trip.id}/chat/main${trip.query ? `?q=${encodeURIComponent(trip.query)}&from=trips` : "?from=trips"}`}
                        className="mt-4 inline-flex text-sm font-semibold text-[#E8472A] transition-colors hover:text-[#c83a22]"
                      >
                        View trip
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ) : (
          <div className="mt-8 rounded-3xl border border-panel-border bg-white p-8 shadow-sm">
            <div className="text-xl font-semibold text-neutral-900">No trips yet — create your first AI itinerary.</div>
            <div className="mt-2 text-sm text-muted">
              You can generate anonymously and save locally. Create a free account later when you want cloud sync.
            </div>
          </div>
        )}

        <section className="mt-8">
          <h2 className="text-lg font-semibold text-neutral-900">Start from a template</h2>
          <p className="mt-1 text-sm text-muted">Templates are examples, not saved trips.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {templates.map((template) => (
              <Link
                key={template.label}
                href={template.href}
                className="rounded-2xl border border-neutral-200 bg-white p-4 text-sm font-semibold text-neutral-800 shadow-sm transition hover:border-[#E8472A] hover:text-[#E8472A]"
              >
                <span className="block">{template.label}</span>
                <span className="mt-2 inline-flex rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-600">
                  Template
                </span>
              </Link>
            ))}
          </div>
        </section>
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
