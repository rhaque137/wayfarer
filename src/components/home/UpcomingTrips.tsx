"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/home/Reveal";
import { Tilt3D } from "@/components/ui/3d-card";
import { PLACEHOLDER_IMAGE } from "@/lib/destination-images";
import { useImageFallback } from "@/lib/use-image-fallback";

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
  useImageFallback();

  return (
    <section id="upcoming" className="mx-auto w-full max-w-6xl px-6 py-16">
      <Reveal>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-2xl font-semibold text-neutral-900">Your Upcoming Adventures</div>
            <div className="text-sm text-neutral-500">Pick up where you left off</div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onSeeAll}
              className="text-sm font-medium text-[#E8472A] transition-all duration-200 hover:opacity-80"
            >
              See all
            </button>
            <button
              onClick={onPlanNew}
              className="rounded-full bg-foreground px-4 py-2 text-xs font-semibold text-white transition-all duration-200 hover:opacity-90"
            >
              + Plan new trip
            </button>
          </div>
        </div>
      </Reveal>

      <Reveal delay={120}>
        {trips.length === 0 ? (
          <Tilt3D className="mt-8">
            <div className="rounded-2xl border border-neutral-100 bg-white p-8 text-center shadow-sm">
              <div className="text-3xl">🧭</div>
              <div className="mt-2 text-base font-semibold">No trips yet — let’s plan your first one!</div>
              <div className="mt-1 text-sm text-neutral-500">Wayfarer can build a full itinerary in minutes.</div>
              <button
                onClick={onPlanNew}
                className="mt-4 rounded-full bg-foreground px-5 py-2 text-xs font-semibold text-white transition-all duration-200 hover:opacity-90"
              >
                Start Planning →
              </button>
            </div>
          </Tilt3D>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {trips.map((trip) => (
              <Tilt3D key={trip.id}>
                <Link
                  href={`/trip/${trip.id}/chat/main${trip.query ? `?q=${encodeURIComponent(trip.query)}` : ""}`}
                  aria-label={`View trip: ${trip.name}${trip.dates ? `, ${trip.dates}` : ""}`}
                  className="group relative block overflow-hidden rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div
                    className={cn(
                      "absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-semibold text-white",
                      trip.countdown === "Next week" && "bg-amber-500",
                      trip.countdown === "In 3 months" && "bg-[#7C4DFF]",
                      trip.countdown !== "Next week" && trip.countdown !== "In 3 months" && "bg-neutral-700",
                    )}
                  >
                    {trip.countdown ?? "Soon"}
                  </div>
                  <div className="h-[170px] w-full overflow-hidden rounded-2xl">
                    <img
                      data-destination-image
                      src={trip.coverImage}
                      alt={trip.destination}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.src = PLACEHOLDER_IMAGE.url;
                      }}
                    />
                  </div>
                  <div className="mt-4">
                    <div className="text-sm font-semibold text-neutral-900">{trip.name}</div>
                    <div className="text-xs text-neutral-500">{trip.dates ?? trip.destination}</div>
                    <div className="mt-2 inline-flex items-center rounded-full bg-neutral-100 px-2 py-1 text-xs text-neutral-600">
                      {trip.savedCount ?? 8} saved places
                    </div>
                  </div>
                  <div className="mt-4 text-sm font-medium text-[#E8472A] transition-all duration-200 hover:underline">
                    View Trip
                  </div>
                </Link>
              </Tilt3D>
            ))}
          </div>
        )}
      </Reveal>
    </section>
  );
}
