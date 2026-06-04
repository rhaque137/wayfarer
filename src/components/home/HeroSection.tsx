"use client";

import type React from "react";
import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { PLACEHOLDER_IMAGE, getDestinationImage } from "@/lib/destination-images";
import { useImageFallback } from "@/lib/use-image-fallback";

export type TripIntake = {
  destination: string;
  dates: string;
  tripLength: string;
  travelers: string;
  budget: string;
  interests: string[];
  notes: string;
};

type ExampleTrip = {
  label: string;
  intake: TripIntake;
};

const interests = [
  "Food",
  "Museums",
  "Nightlife",
  "Nature",
  "Luxury",
  "Budget",
  "Family-friendly",
  "Romantic",
  "Adventure",
  "Relaxing",
];

const examples: ExampleTrip[] = [
  {
    label: "Weekend in Paris",
    intake: {
      destination: "Paris",
      dates: "",
      tripLength: "3 days",
      travelers: "2",
      budget: "Mid-range",
      interests: ["Food", "Museums", "Romantic"],
      notes: "Walkable neighborhoods, one iconic dinner, and time for cafes.",
    },
  },
  {
    label: "10 days in Japan",
    intake: {
      destination: "Tokyo and Kyoto",
      dates: "",
      tripLength: "10 days",
      travelers: "2",
      budget: "Flexible",
      interests: ["Food", "Museums", "Nature", "Adventure"],
      notes: "Balance first-time highlights with local food and easy train days.",
    },
  },
  {
    label: "NYC city break",
    intake: {
      destination: "New York City",
      dates: "",
      tripLength: "4 days",
      travelers: "2",
      budget: "Mid-range",
      interests: ["Food", "Nightlife", "Museums"],
      notes: "Great restaurants, neighborhoods, and one Broadway night.",
    },
  },
];

const heroCities = ["Santorini", "Tokyo", "Patagonia", "Marrakech", "New York City"];

export function buildTripQuery(intake: TripIntake) {
  const parts = [
    `Plan a structured itinerary for ${intake.destination.trim()}.`,
    intake.dates.trim() ? `Travel dates: ${intake.dates.trim()}.` : null,
    intake.tripLength.trim() ? `Trip length: ${intake.tripLength.trim()}.` : null,
    intake.travelers.trim() ? `Travelers: ${intake.travelers.trim()}.` : null,
    intake.budget.trim() ? `Budget: ${intake.budget.trim()}.` : null,
    intake.interests.length ? `Interests and vibe: ${intake.interests.join(", ")}.` : null,
    intake.notes.trim() ? `Additional notes: ${intake.notes.trim()}.` : null,
    "Return a day-by-day plan with editable activities, map-friendly locations, budget estimates, and verification notes.",
  ];
  return parts.filter(Boolean).join(" ");
}

export function HeroSection({
  intake,
  onChange,
  onSubmit,
  onUseExample,
  isSubmitting = false,
  error,
  maxLength,
}: {
  intake: TripIntake;
  onChange: (next: TripIntake) => void;
  onSubmit: () => void;
  onUseExample?: (next: TripIntake) => void;
  isSubmitting?: boolean;
  error?: string | null;
  maxLength?: number;
}) {
  useImageFallback();
  const heroImages = useMemo(
    () => heroCities.map((city) => getDestinationImage(city) ?? PLACEHOLDER_IMAGE),
    [],
  );
  const queryPreview = buildTripQuery(intake);

  const update = <K extends keyof TripIntake>(key: K, value: TripIntake[K]) => {
    onChange({ ...intake, [key]: value });
  };

  const toggleInterest = (interest: string) => {
    update(
      "interests",
      intake.interests.includes(interest)
        ? intake.interests.filter((item) => item !== interest)
        : [...intake.interests, interest],
    );
  };

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
                className="h-full w-full object-cover opacity-90"
                onError={(e) => {
                  e.currentTarget.src = PLACEHOLDER_IMAGE.url;
                }}
              />
            </div>
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/40 to-black/80" />
      </div>

      <div className="relative mx-auto grid max-w-6xl gap-8 px-5 py-10 text-white lg:grid-cols-[minmax(0,1.05fr)_420px] lg:px-8 lg:py-14">
        <div className="flex flex-col justify-center">
          <div className="w-fit rounded-full border border-white/30 bg-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-wide backdrop-blur">
            AI-first trip workspace
          </div>
          <h1 className="mt-5 max-w-2xl text-4xl font-extrabold drop-shadow-lg md:text-5xl lg:text-6xl">
            Generate an editable travel plan in minutes.
          </h1>
          <p className="mt-4 max-w-xl text-base text-white/82 md:text-lg">
            Tell Wayfarer where you are going, what you care about, and your budget. Get a structured itinerary you can edit, map, save, and share.
          </p>

          <div className="mt-7 grid gap-3 rounded-2xl border border-white/20 bg-white/15 p-4 backdrop-blur md:grid-cols-3">
            <PreviewCard title="Day 1" body="Hotel check-in, neighborhood walk, local dinner" />
            <PreviewCard title="Map-aware" body="Pins by day, route context, missing-location badges" />
            <PreviewCard title="Budget" body="Estimated total, per-person costs, editable categories" />
          </div>
        </div>

        <div className="rounded-3xl bg-white/95 p-5 text-neutral-900 shadow-xl backdrop-blur md:p-6">
          <div className="text-sm font-semibold text-neutral-900">Plan your trip</div>
          <div className="mt-1 text-xs text-neutral-500">Free to use — no credit card required.</div>

          <div className="mt-5 grid gap-3">
            <Field label="Destination" htmlFor="trip-destination" required>
              <input
                id="trip-destination"
                value={intake.destination}
                onChange={(e) => update("destination", e.target.value)}
                placeholder="Lisbon, Kyoto, Patagonia..."
                className="h-11 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm outline-none focus:border-[#E8472A] focus:ring-4 focus:ring-[#E8472A]/15"
              />
            </Field>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Dates" htmlFor="trip-dates">
                <input
                  id="trip-dates"
                  value={intake.dates}
                  onChange={(e) => update("dates", e.target.value)}
                  placeholder="Jun 12-18"
                  className="h-11 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm outline-none focus:border-[#E8472A] focus:ring-4 focus:ring-[#E8472A]/15"
                />
              </Field>
              <Field label="Or trip length" htmlFor="trip-length" required>
                <input
                  id="trip-length"
                  value={intake.tripLength}
                  onChange={(e) => update("tripLength", e.target.value)}
                  placeholder="5 days"
                  className="h-11 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm outline-none focus:border-[#E8472A] focus:ring-4 focus:ring-[#E8472A]/15"
                />
              </Field>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Travelers" htmlFor="trip-travelers">
                <input
                  id="trip-travelers"
                  value={intake.travelers}
                  onChange={(e) => update("travelers", e.target.value)}
                  inputMode="numeric"
                  placeholder="2"
                  className="h-11 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm outline-none focus:border-[#E8472A] focus:ring-4 focus:ring-[#E8472A]/15"
                />
              </Field>
              <Field label="Budget" htmlFor="trip-budget">
                <input
                  id="trip-budget"
                  value={intake.budget}
                  onChange={(e) => update("budget", e.target.value)}
                  placeholder="Budget, mid-range, $2,500..."
                  className="h-11 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm outline-none focus:border-[#E8472A] focus:ring-4 focus:ring-[#E8472A]/15"
                />
              </Field>
            </div>

            <div>
              <div className="text-xs font-semibold text-neutral-700">Interests and vibe</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {interests.map((interest) => {
                  const selected = intake.interests.includes(interest);
                  return (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      aria-pressed={selected}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-[#E8472A]/25",
                        selected
                          ? "border-[#E8472A] bg-[#E8472A] text-white"
                          : "border-neutral-200 bg-white text-neutral-700 hover:border-[#E8472A]",
                      )}
                    >
                      {interest}
                    </button>
                  );
                })}
              </div>
            </div>

            <Field label="Notes" htmlFor="trip-notes">
              <textarea
                id="trip-notes"
                value={intake.notes}
                onChange={(e) => update("notes", e.target.value)}
                maxLength={maxLength}
                rows={3}
                placeholder="Must-see places, accessibility needs, pace, hotel preferences..."
                className="w-full resize-none rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#E8472A] focus:ring-4 focus:ring-[#E8472A]/15"
              />
            </Field>

            {error ? (
              <div id="hero-search-error" role="alert" className="rounded-xl border border-[#E8472A]/20 bg-[#F5EAE6] px-3 py-2 text-xs font-semibold text-[#B8321C]">
                {error} Edit the highlighted fields and retry.
              </div>
            ) : null}

            <button
              onClick={onSubmit}
              disabled={isSubmitting || !intake.destination.trim() || (!intake.dates.trim() && !intake.tripLength.trim())}
              aria-describedby={error ? "hero-search-error" : undefined}
              className="h-12 w-full rounded-xl bg-foreground text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-[#E8472A]/25 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Generating itinerary..." : "Generate my itinerary"}
            </button>
            {isSubmitting ? (
              <div role="status" aria-live="polite" className="text-center text-xs font-medium text-neutral-500">
                Understanding your trip → building itinerary → adding map details
              </div>
            ) : null}
          </div>

          <div className="mt-5 border-t border-neutral-200 pt-4">
            <div className="text-xs font-semibold text-neutral-500">Try a template</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {examples.map((example) => (
                <button
                  key={example.label}
                  type="button"
                  onClick={() => (onUseExample ?? onChange)(example.intake)}
                  className="rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 transition-all hover:border-[#E8472A] hover:text-[#E8472A] focus:outline-none focus:ring-2 focus:ring-[#E8472A]/25"
                >
                  {example.label}
                </button>
              ))}
            </div>
            <div className="mt-3 line-clamp-2 rounded-xl bg-neutral-50 p-3 text-[11px] text-neutral-500">
              Prompt preview: {queryPreview}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  htmlFor,
  required = false,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block" htmlFor={htmlFor}>
      <span className="mb-1 block text-xs font-semibold text-neutral-700">
        {label}
        {required ? <span className="text-[#E8472A]"> *</span> : null}
      </span>
      {children}
    </label>
  );
}

function PreviewCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-white/20 bg-white/15 p-3 text-left">
      <div className="text-xs font-semibold text-white">{title}</div>
      <div className="mt-1 text-xs leading-relaxed text-white/75">{body}</div>
    </div>
  );
}
