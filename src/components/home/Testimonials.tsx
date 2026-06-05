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
        <div>
          <div className="text-2xl font-semibold text-neutral-900">What travelers are saying</div>
          <div className="mt-2 text-sm text-neutral-500">Real planning moments from early Wayfarer users.</div>
        </div>
      </Reveal>

      <Reveal delay={120}>
        <div
          aria-label="Traveler reviews"
          className="-mx-6 mt-8 flex snap-x gap-4 overflow-x-auto px-6 pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {testimonials.map((t) => (
            <article
              key={t.name}
              className="flex min-h-[220px] flex-[0_0_82%] snap-start flex-col justify-between rounded-2xl bg-[#1A1A1A] p-6 text-white shadow-sm transition-shadow duration-200 hover:shadow-md sm:flex-[0_0_45%] lg:flex-[0_0_31%]"
            >
              <div>
                <div aria-hidden="true" className="text-4xl leading-none text-white/30">
                  ❝
                </div>
                <blockquote className="mt-3 text-sm italic leading-6 text-white/80">
                  {t.quote}
                </blockquote>
              </div>
              <footer className="mt-6">
                <div className="text-sm font-semibold">{t.name}</div>
                <div className="text-xs text-white/60">{t.title}</div>
              </footer>
            </article>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
