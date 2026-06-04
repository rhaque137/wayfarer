"use client";

import { Reveal } from "@/components/home/Reveal";

const cards = [
  {
    title: "Generated itinerary",
    body: "Day 2: Tsukiji breakfast, teamLab Borderless, Daikanyama cafes, Shibuya dinner.",
    meta: "Editable cards",
  },
  {
    title: "Map with pins",
    body: "Activities are grouped by day with map pins and missing-location badges when coordinates need review.",
    meta: "Map-aware",
  },
  {
    title: "Budget summary",
    body: "$1,860 estimated total · $930 per person · lodging, food, transit, activities, flights, misc.",
    meta: "Editable costs",
  },
  {
    title: "AI assistant",
    body: "Make this cheaper, add food spots, reduce travel time, or make the plan more family-friendly.",
    meta: "Refine with context",
  },
];

export function ProductProof() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-16">
      <Reveal>
        <div className="text-2xl font-semibold text-neutral-900">See Wayfarer in action</div>
        <div className="mt-2 max-w-2xl text-sm text-neutral-500">
          Wayfarer turns a loose idea into a structured workspace: itinerary, map, budget, notes, share, and export.
        </div>
      </Reveal>

      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, idx) => (
          <Reveal key={card.title} delay={idx * 80}>
            <div className="h-full rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#E8472A]">{card.meta}</div>
              <div className="mt-3 text-base font-semibold text-neutral-900">{card.title}</div>
              <div className="mt-2 text-sm leading-relaxed text-neutral-600">{card.body}</div>
            </div>
          </Reveal>
        ))}
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Reveal>
          <div className="rounded-2xl bg-[#F5F0EB] p-6">
            <div className="text-sm font-semibold text-neutral-900">How it works</div>
            <ol className="mt-3 space-y-2 text-sm text-neutral-600">
              <li>1. Tell Wayfarer where you are going.</li>
              <li>2. Get a structured itinerary with places, budget, and map details.</li>
              <li>3. Edit, lock, map, save, share, and export your plan.</li>
            </ol>
          </div>
        </Reveal>
        <Reveal delay={100}>
          <div className="rounded-2xl bg-[#1A1A1A] p-6 text-white">
            <div className="text-sm font-semibold">Why Wayfarer</div>
            <div className="mt-3 grid gap-2 text-sm text-white/75">
              <div>AI-first planning without losing control.</div>
              <div>Editable itineraries instead of raw chat transcripts.</div>
              <div>Map-aware suggestions and budget-conscious planning.</div>
              <div>Shareable plans with trust and verification cues.</div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
