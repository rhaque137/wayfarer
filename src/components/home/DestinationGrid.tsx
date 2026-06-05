"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Reveal } from "@/components/home/Reveal";
import { cn } from "@/lib/utils";
import { Tilt3D } from "@/components/ui/3d-card";
import { PLACEHOLDER_IMAGE, getDestinationImage } from "@/lib/destination-images";
import { CREATE_TRIP_ERROR_MESSAGE } from "@/lib/trip-limits";
import { useImageFallback } from "@/lib/use-image-fallback";

const destinations = [
  {
    name: "Bali",
    slug: "bali",
    photoQuery: "Bali",
    days: 4,
    price: "$1,050/wk",
    categories: ["beaches", "nature", "culture"],
  },
  {
    name: "Barcelona",
    slug: "barcelona",
    photoQuery: "Barcelona",
    price: "$1,320/wk",
    categories: ["city-breaks", "culture", "food-trips"],
  },
  { name: "Kyoto", slug: "kyoto", photoQuery: "Kyoto", price: "$1,480/wk", categories: ["culture", "nature"] },
  {
    name: "Cape Town",
    slug: "cape-town",
    photoQuery: "Cape Town",
    days: 4,
    price: "$980/wk",
    categories: ["beaches", "mountains", "nature"],
  },
  {
    name: "Mexico City",
    slug: "mexico-city",
    photoQuery: "Mexico City",
    days: 3,
    price: "$880/wk",
    categories: ["city-breaks", "culture", "food-trips"],
  },
  {
    name: "New York",
    slug: "new-york",
    photoQuery: "New York City",
    days: 4,
    price: "$1,900/wk",
    categories: ["city-breaks", "culture", "food-trips"],
  },
  {
    name: "Iceland",
    slug: "iceland",
    photoQuery: "Iceland landscape",
    days: 5,
    price: "$1,620/wk",
    categories: ["nature", "mountains"],
  },
  {
    name: "Dubai",
    slug: "dubai",
    photoQuery: "Dubai",
    days: 3,
    price: "$1,520/wk",
    categories: ["city-breaks", "beaches"],
  },
];

const chips = [
  { key: "beaches", label: "🏖 Beaches" },
  { key: "mountains", label: "🏔 Mountains" },
  { key: "city-breaks", label: "🏙 City breaks" },
  { key: "nature", label: "🌿 Nature" },
  { key: "culture", label: "🎭 Culture" },
  { key: "food-trips", label: "🍜 Food trips" },
];

export function DestinationGrid() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [creatingDestination, setCreatingDestination] = useState<string | null>(null);
  const [createTripError, setCreateTripError] = useState<string | null>(null);
  useImageFallback();

  const filtered = useMemo(() => {
    if (!selectedCategory) return destinations;
    return destinations.filter((d) => d.categories.includes(selectedCategory));
  }, [selectedCategory]);

  const createTrip = async (destinationName: string) => {
    if (creatingDestination) return;
    const query = `I want to plan a trip to ${destinationName}. Ask me for my travel dates, how many people are going, and the vibe/interests before you build the itinerary.`;

    setCreatingDestination(destinationName);
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
      setCreatingDestination(null);
    }
  };

  return (
    <section id="explore" className="mx-auto w-full max-w-6xl px-6 py-16">
      <Reveal>
        <div className="text-2xl font-semibold text-neutral-900">Explore the World</div>
        <div className="mt-2 text-sm text-neutral-500">Destinations that spark curiosity</div>
      </Reveal>

      <Reveal delay={120}>
        <div className="mt-6 flex flex-wrap gap-2">
          {chips.map((chip) => (
            <button
              key={chip.key}
              onClick={() =>
                setSelectedCategory((prev) => (prev === chip.key ? null : chip.key))
              }
              className={cn(
                "rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm transition-all duration-200",
                "cursor-pointer",
                selectedCategory === chip.key
                  ? "border-[#E8472A] bg-[#E8472A] text-white"
                  : "text-neutral-700 hover:border-[#E8472A] hover:bg-[#E8472A] hover:text-white",
              )}
              aria-pressed={selectedCategory === chip.key}
            >
              {chip.label}
            </button>
          ))}
        </div>
        {createTripError ? <div className="mt-4 text-sm font-semibold text-[#E8472A]">{createTripError}</div> : null}

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((dest) => (
            <Tilt3D key={dest.name} intensity={14} hoverScale={1.02}>
              <button
                aria-label={`Explore ${dest.name} – ${dest.price ?? "$1,200/wk"}`}
                onClick={() => void createTrip(dest.name)}
                disabled={creatingDestination !== null}
                className="group h-full w-full overflow-hidden rounded-2xl border border-neutral-200 bg-white text-left shadow-sm transition-[box-shadow,border-color,background-color] duration-200 ease-out hover:border-neutral-300 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-70"
              >
                {(() => {
                  const destinationImage = getDestinationImage(dest.photoQuery) ?? PLACEHOLDER_IMAGE;
                  return (
                    <div className="relative aspect-[16/9] w-full overflow-hidden bg-neutral-100">
                      <img
                        data-destination-image
                        src={destinationImage.url}
                        alt={destinationImage.alt}
                        className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02]"
                        onError={(e) => {
                          e.currentTarget.src = PLACEHOLDER_IMAGE.url;
                        }}
                      />
                      <div className="absolute right-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-neutral-800 shadow-sm">
                        {dest.price ?? "$1,200/wk"}
                      </div>
                    </div>
                  );
                })()}
                <div className="p-4">
                  <div className="line-clamp-1 text-base font-semibold text-neutral-900">{dest.name}</div>
                  <div className="mt-1 text-xs text-neutral-500">{dest.days ? `${dest.days} day starter plan` : "Flexible itinerary"}</div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {dest.categories.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-neutral-600"
                      >
                        {tag.replace("-", " ")}
                      </span>
                    ))}
                  </div>
                  <div className="mt-4 text-sm font-semibold text-[#E8472A]">
                    {creatingDestination === dest.name ? "Planning..." : "Plan a trip →"}
                  </div>
                </div>
              </button>
            </Tilt3D>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full rounded-2xl border border-neutral-200 bg-white p-6 text-center text-sm text-neutral-600">
              No destinations found for this category. Try another filter.
              <button
                onClick={() => setSelectedCategory(null)}
                className="ml-2 text-[#E8472A] underline"
              >
                Reset
              </button>
            </div>
          )}
        </div>
      </Reveal>
    </section>
  );
}
