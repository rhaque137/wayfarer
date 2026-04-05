"use client";

import { Reveal } from "@/components/home/Reveal";

export function FooterCTA({ onStart }: { onStart: () => void }) {
  return (
    <section className="px-6 py-16">
      <Reveal>
        <div className="mx-auto max-w-4xl rounded-3xl bg-[#E8472A] px-8 py-12 text-center text-white md:px-12 md:py-16">
          <div className="text-3xl font-extrabold md:text-4xl">
            Your next adventure is one prompt away.
          </div>
          <div className="mt-3 text-sm text-white/80">
            Tell us where you want to go and we’ll curate the rest.
          </div>
          <button
            onClick={onStart}
            className="mt-6 rounded-full bg-white px-8 py-4 text-sm font-semibold text-[#1A1A1A] transition-all duration-200 hover:bg-neutral-100"
          >
            Start Planning Free →
          </button>
          <div className="mt-4 text-xs text-white/60">
            No credit card required. AI planning in under 60 seconds.
          </div>
        </div>
      </Reveal>
    </section>
  );
}
