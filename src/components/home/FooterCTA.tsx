"use client";

import { Reveal } from "@/components/home/Reveal";

export function FooterCTA({ onStart }: { onStart: () => void }) {
  return (
    <section className="px-6 pb-20">
      <Reveal>
        <div className="mx-auto max-w-6xl rounded-3xl bg-gradient-to-r from-foreground to-foreground/80 px-8 py-12 text-center text-white">
          <div className="text-2xl font-semibold md:text-3xl">
            Your next adventure is one prompt away.
          </div>
          <button
            onClick={onStart}
            className="mt-6 rounded-full bg-white px-6 py-2 text-sm font-semibold text-foreground"
          >
            Start Planning Free →
          </button>
        </div>
      </Reveal>
    </section>
  );
}
