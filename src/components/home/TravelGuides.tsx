"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Reveal } from "@/components/home/Reveal";
import { Tilt3D } from "@/components/ui/3d-card";
import { PLACEHOLDER_IMAGE, getDestinationImage } from "@/lib/destination-images";
import { CREATE_TRIP_ERROR_MESSAGE } from "@/lib/trip-limits";
import { useImageFallback } from "@/lib/use-image-fallback";

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
  useImageFallback();

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
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredGuides.map((guide) => (
            <Tilt3D key={guide.city} intensity={12} hoverScale={1.02}>
              <button
                aria-label={`Open ${guide.city} ${guide.label} guide`}
                onClick={() => void createTrip(guide.city, guide.prompt)}
                disabled={creatingGuide !== null}
                className="group relative w-full overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                {(() => {
                  const destinationImage = getDestinationImage(guide.city) ?? PLACEHOLDER_IMAGE;
                  return (
                <img
                  data-destination-image
                  src={destinationImage.url}
                  alt={destinationImage.alt}
                  className="h-44 w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = PLACEHOLDER_IMAGE.url;
                  }}
                />
                  );
                })()}
                <div className="p-4 text-left">
                  <div className="text-sm font-semibold text-neutral-900">{guide.city}</div>
                  <div className="text-xs text-neutral-500">{guide.label}</div>
                  <div className="mt-3 text-sm font-semibold text-[#E8472A] transition-all duration-200 group-hover:translate-x-1">
                    {creatingGuide === guide.city ? "Planning..." : "→"}
                  </div>
                </div>
              </button>
            </Tilt3D>
          ))}
        </div>
        {filteredGuides.length === 0 && (
          <Tilt3D className="mt-6">
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 text-center text-sm text-neutral-600">
              No guides found. Try another search.
            </div>
          </Tilt3D>
        )}
      </Reveal>

      <Reveal delay={200}>
        <Tilt3D className="mt-8">
          <div className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
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
        </Tilt3D>
      </Reveal>
    </section>
  );
}
