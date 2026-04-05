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
        <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="min-w-[260px] rounded-2xl bg-[#1A1A1A] p-6 text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="text-4xl leading-none text-white/30">❝</div>
              <div className="mt-2 text-sm italic text-white/80">{t.quote}</div>
              <div className="mt-4 text-sm font-semibold">{t.name}</div>
              <div className="text-xs text-white/60">{t.title}</div>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
