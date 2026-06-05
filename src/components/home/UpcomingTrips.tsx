"use client";

import { useState } from "react";
import Link from "next/link";
import { PLACEHOLDER_IMAGE, getDestinationImage } from "@/lib/destination-images";

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
}: {
  trips: Trip[];
  onPlanNew: () => void;
  onSeeAll: () => void;
}) {
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  return (
    <section id="upcoming" className="mx-auto w-full max-w-6xl px-6 py-12">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-neutral-950">Your Upcoming Adventures</h2>
          <p className="mt-1 text-sm text-neutral-500">Pick up where you left off</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/trips"
            className="text-sm font-semibold text-[#E8472A] transition-colors duration-200 hover:text-[#c7351f]"
          >
            See all
          </Link>
          <Link
            href="/#top"
            className="rounded-full bg-neutral-950 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-neutral-800"
          >
            + Plan new trip
          </Link>
        </div>
      </div>

      {trips.length === 0 ? (
        <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
          <div className="text-3xl">🧭</div>
          <div className="mt-2 text-base font-semibold text-neutral-950">No trips yet — let’s plan your first one!</div>
          <div className="mt-1 text-sm text-neutral-500">Wayfarer can build a full itinerary in minutes.</div>
          <Link
            href="/#top"
            className="mt-4 inline-flex rounded-full bg-neutral-950 px-5 py-2 text-xs font-semibold text-white transition-colors duration-200 hover:bg-neutral-800"
          >
            Start Planning →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {trips.map((trip) => (
            <UpcomingAdventureCard
              key={trip.id}
              trip={trip}
              imageFailed={Boolean(failedImages[trip.id])}
              onImageError={() => {
                setFailedImages((current) => ({ ...current, [trip.id]: true }));
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function UpcomingAdventureCard({
  trip,
  imageFailed,
  onImageError,
}: {
  trip: Trip;
  imageFailed: boolean;
  onImageError: () => void;
}) {
  const destinationImage =
    getDestinationImage(trip.name) ??
    getDestinationImage(trip.destination);
  const coverImage =
    destinationImage?.url ??
    (trip.coverImage && trip.coverImage !== PLACEHOLDER_IMAGE.url ? trip.coverImage : null);
  const imageAlt = destinationImage?.alt ?? `${trip.name} destination image`;
  const showImage = Boolean(coverImage) && !imageFailed;

  return (
    <Link
      href={`/trip/${trip.id}/chat/main${trip.query ? `?q=${encodeURIComponent(trip.query)}` : ""}`}
      aria-label={`View trip: ${trip.name}${trip.dates ? `, ${trip.dates}` : ""}`}
      className="group block h-full overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition-[border-color,box-shadow] duration-200 hover:border-neutral-300 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-[#E8472A]/15"
    >
      <div className="grid aspect-[16/9] w-full overflow-hidden bg-neutral-100">
        {showImage ? (
          <img
            data-destination-image
            src={coverImage ?? undefined}
            alt={imageAlt}
            className="col-start-1 row-start-1 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            onError={onImageError}
          />
        ) : (
          <div className="col-start-1 row-start-1 flex h-full w-full items-center justify-center bg-gradient-to-br from-orange-100 via-rose-100 to-sky-100 px-6 text-center">
            <span className="text-sm font-semibold text-neutral-500">
              {trip.destination}
            </span>
          </div>
        )}

        {trip.countdown ? (
          <div className="col-start-1 row-start-1 m-3 self-start justify-self-start rounded-full bg-neutral-950/80 px-3 py-1 text-xs font-semibold text-white shadow-sm backdrop-blur">
            {trip.countdown}
          </div>
        ) : null}
      </div>

      <div className="p-4">
        <h3 className="line-clamp-1 text-base font-semibold text-neutral-950">{trip.name}</h3>
        <p className="mt-1 text-sm text-neutral-500">{trip.dates ?? trip.destination}</p>
        <div className="mt-3 inline-flex rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-600">
          {trip.savedCount ?? 8} saved places
        </div>
        <div className="mt-4 text-sm font-semibold text-[#E8472A] transition-colors group-hover:text-[#c7351f]">
          View trip
        </div>
      </div>
    </Link>
  );
}
