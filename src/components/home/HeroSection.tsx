"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

const prompts = [
  "Plan a 7-day adventure in Japan on a budget...",
  "Weekend trip to Nashville with my partner...",
  "Best beaches in Southeast Asia for December...",
  "4 days in Kyoto for 2 people, love temples and food...",
];

const heroCities = ["Santorini", "Tokyo", "Patagonia", "Marrakech", "New York City"];

export function HeroSection({
  query,
  onChange,
  onSubmit,
}: {
  query: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
}) {
  const [promptIndex, setPromptIndex] = useState(0);
  const [heroImages, setHeroImages] = useState<string[]>([]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setPromptIndex((p) => (p + 1) % prompts.length);
    }, 3500);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const next: string[] = [];
      await Promise.all(
        heroCities.map(async (city, idx) => {
          try {
            const res = await fetch("/api/place-photo", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ placeName: city, city }),
            });
            const data = await res.json();
            const url = typeof data?.photoUrl === "string" ? data.photoUrl : null;
            next[idx] = url ?? `https://picsum.photos/seed/hero-${encodeURIComponent(city)}/800/600`;
          } catch {
            next[idx] = `https://picsum.photos/seed/hero-${encodeURIComponent(city)}/800/600`;
          }
        }),
      );
      if (!cancelled) setHeroImages(next);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const placeholder = useMemo(() => prompts[promptIndex], [promptIndex]);

  return (
    <section className="relative overflow-hidden rounded-3xl border border-panel-border bg-black/5">
      <div className="absolute inset-0">
        <div className="grid h-full w-full grid-cols-2 md:grid-cols-3">
          {(heroImages.length ? heroImages : heroCities.map((city) => `https://picsum.photos/seed/hero-${encodeURIComponent(city)}/800/600`)).map((src, idx) => (
            <div key={src} className={cn("relative overflow-hidden", idx >= 4 && "hidden md:block")}>
              <img
                src={src}
                alt=""
                className={cn(
                  "h-full w-full object-cover opacity-90",
                  "animate-kenburns",
                )}
                style={{ animationDelay: `${idx * 1.2}s` }}
                onError={(e) => {
                  e.currentTarget.src = `https://picsum.photos/seed/hero-${idx}/800/600`;
                }}
              />
            </div>
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/70" />
      </div>

      <div className="relative mx-auto flex max-w-5xl flex-col items-center px-6 py-20 text-center text-white">
        <div className="text-xs uppercase tracking-[0.3em] text-white/70">Wayfarer</div>
        <h1 className="mt-4 text-4xl font-semibold md:text-6xl">Where to next?</h1>
        <p className="mt-4 max-w-2xl text-base text-white/80 md:text-lg">
          Tell Wayfarer where you want to go — and let AI handle the rest.
        </p>

        <div className="mt-8 w-full max-w-3xl rounded-3xl bg-white/95 p-5 shadow-xl backdrop-blur md:p-4">
          <div className="flex flex-col gap-3">
            <input
              value={query}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="h-[84px] w-full rounded-3xl border border-black/10 bg-white px-6 text-lg leading-7 text-foreground outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-400/20 md:h-[64px] md:text-base"
            />
            <button
              onClick={onSubmit}
              className="h-[64px] w-full rounded-2xl bg-foreground text-base font-semibold text-white transition hover:opacity-90 md:h-[54px] md:text-sm"
            >
              Plan My Trip →
            </button>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-2 text-sm text-white/80">
          {["Weekend in Paris 🗼", "10 days Japan 🏯", "NYC city break 🗽"].map((chip) => (
            <button
              key={chip}
              onClick={() => onChange(chip)}
              className="rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs font-medium text-white/90 transition hover:bg-white/20"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
