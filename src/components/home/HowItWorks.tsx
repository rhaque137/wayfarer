"use client";

import { Reveal } from "@/components/home/Reveal";

const steps = [
  {
    icon: "✨",
    title: "Tell us your vibe",
    description: "Share dates, budget, and interests — we’ll do the heavy lifting.",
  },
  {
    icon: "🧠",
    title: "We build your itinerary",
    description: "Wayfarer assembles a day‑by‑day plan with stays, meals, and activities.",
  },
  {
    icon: "🧳",
    title: "Book & go",
    description: "Tweak anything, save favorites, and take your trip with you.",
  },
];

export function HowItWorks() {
  return (
    <section className="py-16">
      <div className="mx-auto w-full max-w-6xl px-6">
        <Reveal>
          <div className="text-2xl font-semibold text-neutral-900">How it works</div>
          <div className="mt-2 text-sm text-neutral-500">Three steps to a ready‑to‑go itinerary.</div>
          <div className="mt-2 text-xs text-neutral-500">
            Itineraries are AI-generated suggestions. Always verify details before booking.
          </div>
        </Reveal>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {steps.map((step, idx) => (
            <Reveal key={step.title} delay={idx * 120}>
              <div className="rounded-2xl bg-[#F5F0EB] p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                <div className="text-3xl">{step.icon}</div>
                <div className="mt-3 text-base font-semibold text-neutral-900">{step.title}</div>
                <div className="mt-2 text-sm text-neutral-600">{step.description}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
