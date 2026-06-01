"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { PLACEHOLDER_IMAGE, getDestinationImage } from "@/lib/destination-images";
import { useImageFallback } from "@/lib/use-image-fallback";

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
  isSubmitting = false,
  error,
  maxLength,
}: {
  query: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
  error?: string | null;
  maxLength?: number;
}) {
  const [promptIndex, setPromptIndex] = useState(0);
  useImageFallback();

  useEffect(() => {
    const id = window.setInterval(() => {
      setPromptIndex((p) => (p + 1) % prompts.length);
    }, 3500);
    return () => window.clearInterval(id);
  }, []);

  const placeholder = useMemo(() => prompts[promptIndex], [promptIndex]);
  const heroImages = useMemo(
    () => heroCities.map((city) => getDestinationImage(city) ?? PLACEHOLDER_IMAGE),
    [],
  );

  return (
    <section className="relative overflow-hidden rounded-3xl border border-neutral-200 bg-black/5 shadow-sm">
      <div className="absolute inset-0">
        <div className="grid h-full w-full grid-cols-2 md:grid-cols-3">
          {heroImages.map((image, idx) => (
            <div key={image.url} className={cn("relative overflow-hidden", idx >= 4 && "hidden md:block")}>
              <img
                data-destination-image
                src={image.url}
                alt={image.alt}
                className={cn(
                  "h-full w-full object-cover opacity-90",
                  "animate-kenburns",
                )}
                style={{ animationDelay: `${idx * 1.2}s` }}
                onError={(e) => {
                  e.currentTarget.src = PLACEHOLDER_IMAGE.url;
                }}
              />
            </div>
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/35 to-black/75" />
      </div>

      <div className="relative mx-auto flex max-w-5xl flex-col items-center px-6 py-24 text-center text-white">
        <div className="rounded-full border border-white/30 bg-white/20 px-5 py-2 text-xs font-semibold uppercase tracking-wide text-white backdrop-blur">
          ✦ NOW POWERED BY GPT-4o
        </div>
        <h1 className="mt-5 text-4xl font-extrabold md:text-5xl lg:text-6xl drop-shadow-lg">
          Your World, Curated by AI
        </h1>
        <p className="mt-4 max-w-lg text-balance text-base text-white/80 md:text-lg">
          Share your dates, vibe, and budget. We’ll craft a premium itinerary in minutes.
        </p>

        <div className="mt-8 w-full max-w-3xl rounded-3xl bg-white/95 p-5 shadow-xl backdrop-blur md:p-6">
          <div className="flex flex-col gap-3">
            <input
              id="hero-search"
              value={query}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              aria-label="Trip search"
              maxLength={maxLength}
              className="h-[76px] w-full rounded-2xl border border-neutral-200 bg-white px-5 text-base text-foreground outline-none transition-all duration-200 placeholder:text-neutral-400 focus:border-[#E8472A] focus:ring-4 focus:ring-[#E8472A]/15 md:h-[64px]"
            />
            <button
              onClick={onSubmit}
              disabled={isSubmitting || !query.trim()}
              className="h-[60px] w-full rounded-xl bg-foreground text-base font-semibold text-white transition-all duration-200 hover:opacity-90 md:h-[54px]"
            >
              {isSubmitting ? "Planning..." : "Plan My Trip →"}
            </button>
            {error ? <div className="text-center text-xs font-semibold text-[#E8472A]">{error}</div> : null}
            <div className="text-center text-xs font-medium text-neutral-500">
              Free to use — no credit card required.
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-2 text-sm text-white/80">
          {["Weekend in Paris 🗼", "10 days Japan 🏯", "NYC city break 🗽"].map((chip) => (
            <button
              key={chip}
              onClick={() => onChange(chip.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, "").trim())}
              className="rounded-full border border-white/30 bg-white/20 px-4 py-2 text-xs font-medium text-white/90 backdrop-blur transition-all duration-200 hover:bg-white/30"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
