"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Trip = { id: string; name: string; destination: string };

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("wayfarer_recent_trips");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setTrips(parsed);
      }
    } catch {
      // ignore
    }
  }, []);

  return (
    <div className="min-h-screen bg-background px-6 py-12">
      <div className="mx-auto w-full max-w-4xl">
        <div className="text-2xl font-semibold">All trips</div>
        <div className="mt-2 text-sm text-muted">Your recent Wayfarer journeys.</div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {trips.map((trip) => (
            <Link
              key={trip.id}
              href={`/trip/${trip.id}/chat/main`}
              className="rounded-2xl border border-panel-border bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="text-sm font-semibold">{trip.name}</div>
              <div className="text-xs text-muted">{trip.destination}</div>
            </Link>
          ))}
          {trips.length === 0 && (
            <div className="rounded-2xl border border-panel-border bg-white p-6 text-sm text-muted">
              <div>No trips yet. Start with a prompt and Wayfarer will save recent trips locally on this device.</div>
              <Link
                href="/"
                className="mt-4 inline-flex rounded-full bg-[#E8472A] px-4 py-2 text-xs font-semibold text-white focus:outline-none focus:ring-4 focus:ring-[#E8472A]/25"
              >
                Back home to plan a trip
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
