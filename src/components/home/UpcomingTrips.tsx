"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/home/Reveal";

type Trip = {
  id: string;
  name: string;
  destination: string;
  query?: string;
  coverImage?: string;
  dates?: string;
  savedCount?: number;
  countdown?: string;
};

export function UpcomingTrips({
  trips,
  onPlanNew,
  onSeeAll,
}: {
  trips: Trip[];
  onPlanNew: () => void;
  onSeeAll: () => void;
}) {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-16">
      <Reveal>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-2xl font-semibold">Your Upcoming Adventures</div>
            <div className="text-sm text-muted">Pick up where you left off</div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onSeeAll}
              className="text-sm text-foreground/70 hover:text-foreground"
            >
              See all
            </button>
            <button
              onClick={onPlanNew}
              className="rounded-full bg-foreground px-4 py-2 text-xs font-semibold text-white"
            >
              + Plan new trip
            </button>
          </div>
        </div>
      </Reveal>

      <Reveal delay={120}>
        {trips.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-panel-border bg-white p-8 text-center shadow-sm">
            <div className="text-3xl">🧭</div>
            <div className="mt-2 text-base font-semibold">No trips yet — let’s plan your first one!</div>
            <div className="mt-1 text-sm text-muted">Wayfarer can build a full itinerary in minutes.</div>
            <button
              onClick={onPlanNew}
              className="mt-4 rounded-full bg-foreground px-5 py-2 text-xs font-semibold text-white"
            >
              Start Planning →
            </button>
          </div>
        ) : (
          <div className="mt-8 flex gap-4 overflow-x-auto pb-2">
            {trips.map((trip) => (
              <Link
                key={trip.id}
                href={`/trip/${trip.id}/chat/main${trip.query ? `?q=${encodeURIComponent(trip.query)}` : ""}`}
                className="group relative h-[320px] min-w-[280px] max-w-[280px] overflow-hidden rounded-2xl border border-panel-border bg-slate-100 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="absolute left-3 top-3 rounded-full bg-foreground/80 px-3 py-1 text-xs text-white">
                  {trip.countdown ?? "Soon"}
                </div>
                <div className="absolute right-3 top-3 flex items-center gap-2 text-white/80">
                  <span className="text-xs">⤴︎</span>
                  <span className="text-lg">⋯</span>
                </div>
                <div className="h-[190px] w-full overflow-hidden">
                  <img
                    src={trip.coverImage}
                    alt={trip.destination}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.src = `https://picsum.photos/seed/${encodeURIComponent(trip.destination)}/800/600`;
                    }}
                  />
                  <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 to-transparent" />
                </div>
                <div className="relative bg-white/95 p-4 text-foreground backdrop-blur">
                  <div className="text-sm font-semibold text-foreground">{trip.name}</div>
                  <div className="text-xs text-foreground/70">{trip.dates ?? trip.destination}</div>
                  <div className="mt-2 text-xs text-foreground/60">{trip.savedCount ?? 8} saved places</div>
                </div>
                <div
                  className={cn(
                    "absolute inset-x-0 bottom-4 flex justify-center opacity-0 transition",
                    "group-hover:opacity-100",
                  )}
                >
                  <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-foreground">
                    View Trip
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Reveal>
    </section>
  );
}
