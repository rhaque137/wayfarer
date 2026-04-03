"use client";

import { Reveal } from "@/components/home/Reveal";

const testimonials = [
  {
    quote: "Wayfarer turned my messy notes into a gorgeous itinerary in minutes.",
    name: "Sophie L.",
    title: "Founder, Lune Studio",
  },
  {
    quote: "The day-by-day plan felt like a boutique travel concierge — loved it.",
    name: "Marcus P.",
    title: "Product Lead",
  },
  {
    quote: "I booked a whole weekend trip during my lunch break.",
    name: "Anita R.",
    title: "Marketing Manager",
  },
];

export function Testimonials() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-16">
      <Reveal>
        <div className="mt-8 flex gap-4 overflow-x-auto pb-2">
          {testimonials.map((t) => (
            <div key={t.name} className="min-w-[260px] rounded-2xl border border-panel-border bg-white p-6 shadow-sm">
              <div className="text-2xl">“</div>
              <div className="mt-2 text-sm italic text-foreground/80">{t.quote}</div>
              <div className="mt-4 text-sm font-semibold">{t.name}</div>
              <div className="text-xs text-muted">{t.title}</div>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
