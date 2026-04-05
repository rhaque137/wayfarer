"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Reveal } from "@/components/home/Reveal";
import { cn } from "@/lib/utils";

const destinations = [
  {
    name: "Bali",
    slug: "bali",
    photoQuery: "Bali",
    imageOverride:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Pura_Bratan_Bali.jpg/250px-Pura_Bratan_Bali.jpg",
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
    imageOverride:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Camps_bay_%2853460319478%29_%28cropped%29.jpg/250px-Camps_bay_%2853460319478%29_%28cropped%29.jpg",
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
    imageOverride:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/%D0%90%D0%BA%D1%83%D1%80%D0%B5%D0%B9%D1%80%D1%96_%D0%B2%D0%BB%D1%96%D1%82%D0%BA%D1%83%2C_%D0%86%D1%81%D0%BB%D0%B0%D0%BD%D0%B4%D1%96%D1%8F.jpg/250px-%D0%90%D0%BA%D1%83%D1%80%D0%B5%D0%B9%D1%80%D1%96_%D0%B2%D0%BB%D1%96%D1%82%D0%BA%D1%83%2C_%D0%86%D1%81%D0%BB%D0%B0%D0%BD%D0%B4%D1%96%D1%8F.jpg",
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
  const [images, setImages] = useState<Record<string, string>>({});

  const filtered = useMemo(() => {
    if (!selectedCategory) return destinations;
    return destinations.filter((d) => d.categories.includes(selectedCategory));
  }, [selectedCategory]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const next: Record<string, string> = {};
      await Promise.all(
        destinations.map(async (dest) => {
          try {
            if (dest.imageOverride) {
              next[dest.slug] = dest.imageOverride;
              return;
            }
            const res = await fetch("/api/place-photo", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ placeName: dest.photoQuery, city: dest.name }),
            });
            const data = await res.json();
            const url = typeof data?.photoUrl === "string" ? data.photoUrl : null;
            if (url) next[dest.slug] = url;
          } catch {
            // ignore
          }
        }),
      );
      if (!cancelled) setImages(next);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);
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

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 transition-all duration-300">
          {filtered.map((dest) => (
            <button
              key={dest.name}
              aria-label={`Explore ${dest.name} – ${dest.price ?? "$1,200/wk"}`}
              onClick={async () => {
                const query = `I want to plan a trip to ${dest.name}. Ask me for my travel dates, how many people are going, and the vibe/interests before you build the itinerary.`;
                const res = await fetch("/api/create-trip", {
                  method: "POST",
                  headers: { "content-type": "application/json" },
                  body: JSON.stringify({ query }),
                });
                const data = await res.json();
                if (res.ok && data?.id) {
                  router.push(`/trip/${data.id}/chat/main?q=${encodeURIComponent(query)}`);
                }
              }}
              className="group relative overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              <img
                src={
                  images[dest.slug] ??
                  dest.imageOverride ??
                  `https://picsum.photos/seed/${encodeURIComponent(dest.slug)}/800/600`
                }
                alt={dest.name}
                className="h-52 w-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = `https://picsum.photos/seed/${encodeURIComponent(dest.slug)}/800/600`;
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-all duration-200 group-hover:from-black/85 group-hover:via-black/45" />
              <div className="absolute right-3 top-3 rounded-full bg-[#E8472A] px-2 py-1 text-xs font-semibold text-white shadow-sm">
                {dest.price ?? "$1,200/wk"}
              </div>
              <div className="absolute bottom-3 left-3 text-left text-white">
                <div className="text-sm font-semibold">{dest.name}</div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {dest.categories.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-white/30 bg-white/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur"
                    >
                      {tag.replace("-", " ")}
                    </span>
                  ))}
                </div>
              </div>
              <div className="absolute bottom-12 right-3 opacity-0 transition-all duration-200 group-hover:opacity-100">
                <span className="rounded-full bg-[#E8472A] px-3 py-1 text-xs font-semibold text-white shadow-md">
                  Plan a trip →
                </span>
              </div>
            </button>
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
