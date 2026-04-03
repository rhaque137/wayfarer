"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";

const itineraries: Record<
  string,
  { name: string; days: { day: string; items: string[] }[] }
> = {
  bali: {
    name: "Bali",
    days: [
      { day: "Day 1", items: ["Ubud Market stroll", "Tegallalang rice terraces", "Sunset at Campuhan Ridge Walk"] },
      { day: "Day 2", items: ["Uluwatu Temple", "Beach time in Padang Padang", "Seafood dinner in Jimbaran"] },
      { day: "Day 3", items: ["Waterfall tour", "Coffee tasting", "Spa and night market"] },
    ],
  },
  barcelona: {
    name: "Barcelona",
    days: [
      { day: "Day 1", items: ["La Rambla walk", "Boqueria Market", "Gothic Quarter tapas"] },
      { day: "Day 2", items: ["Sagrada Família", "Park Güell", "Sunset at Barceloneta"] },
      { day: "Day 3", items: ["Montjuïc cable car", "Picasso Museum", "Rooftop dinner"] },
    ],
  },
  kyoto: {
    name: "Kyoto",
    days: [
      { day: "Day 1", items: ["Fushimi Inari shrine", "Nishiki Market", "Gion evening walk"] },
      { day: "Day 2", items: ["Arashiyama Bamboo Grove", "Tenryu-ji", "River cruise"] },
      { day: "Day 3", items: ["Kiyomizu-dera", "Tea ceremony", "Philosopher’s Path"] },
    ],
  },
  "cape-town": {
    name: "Cape Town",
    days: [
      { day: "Day 1", items: ["Table Mountain cable car", "V&A Waterfront", "Seafood dinner"] },
      { day: "Day 2", items: ["Cape Point drive", "Boulders Beach penguins", "Chapman’s Peak"] },
      { day: "Day 3", items: ["Bo-Kaap walk", "Winelands tasting", "Sunset at Camps Bay"] },
    ],
  },
  "mexico-city": {
    name: "Mexico City",
    days: [
      { day: "Day 1", items: ["Historic Center", "Templo Mayor", "Street food crawl"] },
      { day: "Day 2", items: ["Chapultepec Park", "National Museum of Anthropology", "Polanco dinner"] },
      { day: "Day 3", items: ["Coyoacán", "Frida Kahlo Museum", "Xochimilco boats"] },
    ],
  },
  "new-york": {
    name: "New York",
    days: [
      { day: "Day 1", items: ["Central Park", "Fifth Avenue", "Broadway night"] },
      { day: "Day 2", items: ["Brooklyn Bridge", "DUMBO", "Dinner in SoHo"] },
      { day: "Day 3", items: ["Statue of Liberty", "Wall Street", "West Village"] },
    ],
  },
  iceland: {
    name: "Iceland",
    days: [
      { day: "Day 1", items: ["Blue Lagoon", "Reykjavik stroll", "Harpa Concert Hall"] },
      { day: "Day 2", items: ["Golden Circle tour", "Gullfoss waterfall", "Geysir"] },
      { day: "Day 3", items: ["South Coast drive", "Black sand beach", "Skógafoss"] },
    ],
  },
  dubai: {
    name: "Dubai",
    days: [
      { day: "Day 1", items: ["Downtown Dubai", "Burj Khalifa", "Dubai Mall fountain show"] },
      { day: "Day 2", items: ["Old Dubai souks", "Abra ride", "Desert safari"] },
      { day: "Day 3", items: ["Palm Jumeirah", "Beach day", "Marina dinner"] },
    ],
  },
  rome: {
    name: "Rome",
    days: [
      { day: "Day 1", items: ["Colosseum", "Roman Forum", "Trastevere dinner"] },
      { day: "Day 2", items: ["Vatican Museums", "St. Peter’s Basilica", "Gelato crawl"] },
      { day: "Day 3", items: ["Trevi Fountain", "Pantheon", "Spanish Steps"] },
    ],
  },
  lisbon: {
    name: "Lisbon",
    days: [
      { day: "Day 1", items: ["Belém Tower", "Pastéis de Belém", "LX Factory"] },
      { day: "Day 2", items: ["Alfama walk", "Tram 28 ride", "Fado night"] },
      { day: "Day 3", items: ["Sintra day trip", "Pena Palace", "Coastal sunset"] },
    ],
  },
  seoul: {
    name: "Seoul",
    days: [
      { day: "Day 1", items: ["Gyeongbokgung", "Bukchon Hanok Village", "Insadong"] },
      { day: "Day 2", items: ["Myeongdong food", "N Seoul Tower", "Hongdae nightlife"] },
      { day: "Day 3", items: ["DMZ tour", "Itaewon dinner", "Han River stroll"] },
    ],
  },
  vancouver: {
    name: "Vancouver",
    days: [
      { day: "Day 1", items: ["Stanley Park bike ride", "Granville Island", "Gastown"] },
      { day: "Day 2", items: ["Capilano Suspension Bridge", "Grouse Mountain", "Seawall sunset"] },
      { day: "Day 3", items: ["Kitsilano Beach", "Museum of Anthropology", "Food trucks"] },
    ],
  },
  "buenos-aires": {
    name: "Buenos Aires",
    days: [
      { day: "Day 1", items: ["Plaza de Mayo", "San Telmo", "Parrilla dinner"] },
      { day: "Day 2", items: ["Recoleta Cemetery", "Floralis Genérica", "Palermo cafes"] },
      { day: "Day 3", items: ["La Boca", "Tango show", "Puerto Madero"] },
    ],
  },
  copenhagen: {
    name: "Copenhagen",
    days: [
      { day: "Day 1", items: ["Nyhavn", "Rosenborg Castle", "Torvehallerne"] },
      { day: "Day 2", items: ["Tivoli Gardens", "Christianshavn", "Canal cruise"] },
      { day: "Day 3", items: ["Little Mermaid", "Amalienborg Palace", "Bicycle tour"] },
    ],
  },
};

export default function DestinationPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const slug = params.slug;
  const data = useMemo(() => itineraries[slug] ?? { name: slug, days: [] }, [slug]);

  return (
    <div className="min-h-screen bg-background px-6 py-12">
      <div className="mx-auto w-full max-w-5xl">
        <button onClick={() => router.push("/")} className="text-sm text-muted hover:text-foreground">
          ← Back to home
        </button>
        <div className="mt-4 overflow-hidden rounded-3xl border border-panel-border bg-white shadow-sm">
          <img
            src={`https://source.unsplash.com/1200x600/?${encodeURIComponent(data.name)},travel`}
            alt={data.name}
            className="h-72 w-full object-cover"
            onError={(e) => {
              e.currentTarget.src = `https://picsum.photos/seed/${encodeURIComponent(data.name)}/1200/600`;
            }}
          />
          <div className="p-6">
            <div className="text-3xl font-semibold">{data.name} itinerary</div>
            <div className="mt-2 text-sm text-muted">
              A sample 3–5 day plan you can customize with Wayfarer.
            </div>
            <div className="mt-6 space-y-4">
              {data.days.map((day) => (
                <div key={day.day} className="rounded-2xl border border-panel-border bg-[#FAFAF7] p-4">
                  <div className="text-sm font-semibold">{day.day}</div>
                  <ul className="mt-2 space-y-1 text-sm text-muted">
                    {day.items.map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <button
              onClick={async () => {
                const query = `Trip to ${data.name}`;
                const res = await fetch("/api/create-trip", {
                  method: "POST",
                  headers: { "content-type": "application/json" },
                  body: JSON.stringify({ query }),
                });
                const dataRes = await res.json();
                if (res.ok && dataRes?.id) {
                  router.push(`/trip/${dataRes.id}/chat/main?q=${encodeURIComponent(query)}`);
                }
              }}
              className="mt-6 rounded-full bg-foreground px-5 py-2 text-sm font-semibold text-white"
            >
              Start Planning This Trip →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
