"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Reveal } from "@/components/home/Reveal";
import { PLACEHOLDER_IMAGE, getDestinationImage } from "@/lib/destination-images";
import { CREATE_TRIP_ERROR_MESSAGE } from "@/lib/trip-limits";

const guides = [
  {
    city: "Rome",
    label: "3-day guide",
    prompt: "Plan a 3-day guide to Rome focused on history, food, and iconic landmarks.",
  },
  { city: "Lisbon", label: "4-day guide", prompt: "Plan a 4-day Lisbon guide with neighborhoods, food, and day trips." },
  { city: "Seoul", label: "5-day guide", prompt: "Plan a 5-day Seoul guide with culture, markets, and nightlife." },
  { city: "Vancouver", label: "Weekend guide", prompt: "Plan a weekend guide to Vancouver with nature, food, and city highlights." },
  {
    city: "Buenos Aires",
    label: "3-day guide",
    prompt: "Plan a 3-day Buenos Aires guide with tango, food, and classic neighborhoods.",
  },
  {
    city: "Copenhagen",
    label: "3-day guide",
    prompt: "Plan a 3-day Copenhagen guide with canals, design, and local eats.",
  },
];

export function TravelGuides() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [creatingGuide, setCreatingGuide] = useState<string | null>(null);
  const [createTripError, setCreateTripError] = useState<string | null>(null);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const filteredGuides = guides.filter((g) =>
    g.city.toLowerCase().includes(searchQuery.trim().toLowerCase()),
  );

  const createTrip = async (city: string, prompt?: string) => {
    if (creatingGuide) return;
    const query = prompt ?? `Plan a trip to ${city}`;

    setCreatingGuide(city);
    setCreateTripError(null);

    try {
      const res = await fetch("/api/create-trip", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.id) {
        router.push(`/trip/${data.id}/chat/main?q=${encodeURIComponent(query)}`);
        return;
      }
      setCreateTripError(CREATE_TRIP_ERROR_MESSAGE);
    } catch {
      setCreateTripError(CREATE_TRIP_ERROR_MESSAGE);
    } finally {
      setCreatingGuide(null);
    }
  };

  return (
    <section id="guides" className="mx-auto w-full max-w-6xl px-6 py-16">
      <Reveal>
        <div className="text-2xl font-semibold text-neutral-900">Not sure where to go?</div>
        <div className="mt-2 text-sm text-neutral-500">Browse curated guides and jump in fast.</div>
      </Reveal>

      <Reveal delay={120}>
        {createTripError ? <div className="mt-6 text-sm font-semibold text-[#E8472A]">{createTripError}</div> : null}
        <div
          aria-label="Curated destination guides"
          className="-mx-6 mt-8 flex snap-x gap-4 overflow-x-auto px-6 pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {filteredGuides.map((guide) => {
            const destinationImage = getDestinationImage(guide.city);
            const imageKey = guide.city.toLowerCase();
            const showImage =
              Boolean(destinationImage?.url) &&
              destinationImage?.url !== PLACEHOLDER_IMAGE.url &&
              !failedImages[imageKey];

            return (
              <button
                key={guide.city}
                aria-label={`Open ${guide.city} ${guide.label} guide`}
                onClick={() => void createTrip(guide.city, guide.prompt)}
                disabled={creatingGuide !== null}
                className="group h-full flex-[0_0_84%] snap-start overflow-hidden rounded-2xl border border-neutral-200 bg-white text-left shadow-sm transition-[border-color,box-shadow,background-color] duration-200 ease-out hover:border-neutral-300 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-[#E8472A]/15 disabled:cursor-not-allowed disabled:opacity-70 sm:flex-[0_0_45%] lg:flex-[0_0_31%]"
              >
                <div className="grid aspect-[16/9] w-full overflow-hidden bg-neutral-100">
                  {showImage ? (
                    <img
                      data-destination-image
                      src={destinationImage?.url}
                      alt={destinationImage?.alt ?? `${guide.city} destination image`}
                      className="col-start-1 row-start-1 h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02]"
                      onError={() => {
                        setFailedImages((current) => ({ ...current, [imageKey]: true }));
                      }}
                    />
                  ) : (
                    <div className="col-start-1 row-start-1 flex h-full w-full items-center justify-center bg-gradient-to-br from-orange-100 via-rose-100 to-sky-100 px-6 text-center">
                      <span className="text-sm font-semibold text-neutral-500">
                        {guide.city}
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-4 text-left">
                  <div className="line-clamp-1 text-base font-semibold text-neutral-900">{guide.city}</div>
                  <div className="mt-1 text-xs text-neutral-500">{guide.label}</div>
                  <div className="mt-3 inline-flex rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-600">
                    Curated guide
                  </div>
                  <div className="mt-4 text-sm font-semibold text-[#E8472A] transition-colors group-hover:text-[#c7351f]">
                    {creatingGuide === guide.city ? "Planning..." : "View guide"}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        {filteredGuides.length === 0 && (
          <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-6 text-center text-sm text-neutral-600">
            No guides found. Try another search.
          </div>
        )}
      </Reveal>

      <Reveal delay={200}>
        <div className="mt-8 flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
          <span className="text-lg">🔎</span>
          <input
            type="text"
            placeholder="Search a destination..."
            aria-label="Search a destination"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-sm text-neutral-700 outline-none"
          />
        </div>
      </Reveal>
    </section>
  );
}
