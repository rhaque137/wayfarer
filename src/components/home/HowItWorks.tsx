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
    <section className="bg-[#FAFAF7] py-16">
      <div className="mx-auto w-full max-w-6xl px-6">
        <Reveal>
          <div className="text-2xl font-semibold">How it works</div>
          <div className="mt-2 text-sm text-muted">Three steps to a ready‑to‑go itinerary.</div>
        </Reveal>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {steps.map((step, idx) => (
            <Reveal key={step.title} delay={idx * 120}>
              <div className="rounded-2xl border border-panel-border bg-white p-6 shadow-sm">
                <div className="text-3xl">{step.icon}</div>
                <div className="mt-3 text-base font-semibold">{step.title}</div>
                <div className="mt-2 text-sm text-muted">{step.description}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
