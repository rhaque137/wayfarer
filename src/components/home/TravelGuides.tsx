"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Reveal } from "@/components/home/Reveal";

const guides = [
  {
    city: "Rome",
    label: "3-day guide",
    imageOverride:
      "https://upload.wikimedia.org/wikipedia/commons/7/7e/Trevi_Fountain%2C_Rome%2C_Italy_2_-_May_2007.jpg",
    prompt: "Plan a 3-day guide to Rome focused on history, food, and iconic landmarks.",
  },
  { city: "Lisbon", label: "4-day guide", prompt: "Plan a 4-day Lisbon guide with neighborhoods, food, and day trips." },
  { city: "Seoul", label: "5-day guide", prompt: "Plan a 5-day Seoul guide with culture, markets, and nightlife." },
  { city: "Vancouver", label: "Weekend guide", prompt: "Plan a weekend guide to Vancouver with nature, food, and city highlights." },
  {
    city: "Buenos Aires",
    label: "3-day guide",
    imageOverride:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Avenida_9_de_Julio%2C_Buenos_Aires_%2840089810910%29.jpg/330px-Avenida_9_de_Julio%2C_Buenos_Aires_%2840089810910%29.jpg",
    prompt: "Plan a 3-day Buenos Aires guide with tango, food, and classic neighborhoods.",
  },
  {
    city: "Copenhagen",
    label: "3-day guide",
    imageOverride: "https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?w=800",
    prompt: "Plan a 3-day Copenhagen guide with canals, design, and local eats.",
  },
];

export function TravelGuides() {
  const router = useRouter();
  const [images, setImages] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState("");

  const filteredGuides = guides.filter((g) =>
    g.city.toLowerCase().includes(searchQuery.trim().toLowerCase()),
  );

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const next: Record<string, string> = {};
      await Promise.all(
        guides.map(async (guide) => {
          try {
            if (guide.imageOverride) {
              next[guide.city] = guide.imageOverride;
              return;
            }
            const res = await fetch("/api/place-photo", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ placeName: guide.city, city: guide.city }),
            });
            const data = await res.json();
            const url = typeof data?.photoUrl === "string" ? data.photoUrl : null;
            if (url) next[guide.city] = url;
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
    <section id="guides" className="mx-auto w-full max-w-6xl px-6 py-16">
      <Reveal>
        <div className="text-2xl font-semibold text-neutral-900">Not sure where to go?</div>
        <div className="mt-2 text-sm text-neutral-500">Browse curated guides and jump in fast.</div>
      </Reveal>

      <Reveal delay={120}>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredGuides.map((guide) => (
            <button
              key={guide.city}
              aria-label={`Open ${guide.city} ${guide.label} guide`}
              onClick={async () => {
                const query = guide.prompt ?? `Plan a trip to ${guide.city}`;
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
                  images[guide.city] ??
                  guide.imageOverride ??
                  `https://picsum.photos/seed/${encodeURIComponent(guide.city)}/800/600`
                }
                alt={guide.city}
                className="h-44 w-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = `https://picsum.photos/seed/${encodeURIComponent(guide.city)}/800/600`;
                }}
              />
              <div className="p-4 text-left">
                <div className="text-sm font-semibold text-neutral-900">{guide.city}</div>
                <div className="text-xs text-neutral-500">{guide.label}</div>
                <div className="mt-3 text-sm font-semibold text-[#E8472A] transition-all duration-200 group-hover:translate-x-1">
                  →
                </div>
              </div>
            </button>
          ))}
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
