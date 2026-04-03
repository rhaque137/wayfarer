"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { TripMap, type TripPin } from "@/components/map/TripMap";
import { InlinePhoto } from "@/components/unsplash/InlinePhoto";
import { ItineraryBoard } from "@/components/itinerary/ItineraryBoard";
import { cn } from "@/lib/utils";

type Idea = TripPin & {
  rating?: number;
  blurb: string;
  typeLabel: string;
};

function sampleIdeas(destination: string): Idea[] {
  const d = destination.toLowerCase();
  if (d.includes("dublin")) {
    return [
      {
        id: "temple-bar",
        name: "The Temple Bar Pub",
        typeLabel: "Attraction",
        kind: "attraction",
        rating: 4.6,
        lat: 53.3455,
        lon: -6.2642,
        blurb: "An iconic, lively pub district—perfect for music, people-watching, and a classic Dublin night.",
      },
      {
        id: "trinity",
        name: "Trinity College & Book of Kells",
        typeLabel: "Culture",
        kind: "attraction",
        rating: 4.7,
        lat: 53.3438,
        lon: -6.2546,
        blurb: "A must for history lovers: medieval manuscript magic, grand library vibes, and a great central stroll.",
      },
      {
        id: "st-patricks",
        name: "St Patrick’s Cathedral",
        typeLabel: "Landmark",
        kind: "attraction",
        rating: 4.6,
        lat: 53.3394,
        lon: -6.2712,
        blurb: "Gothic architecture, serene interiors, and an easy fit for a compact 2‑day city plan.",
      },
      {
        id: "guinness",
        name: "Guinness Storehouse",
        typeLabel: "Experience",
        kind: "activity",
        rating: 4.5,
        lat: 53.3419,
        lon: -6.2865,
        blurb: "Interactive brewery museum with skyline views—time it for golden hour if you can.",
      },
    ];
  }

  return [
    {
      id: "old-town",
      name: `${destination} Old Town Walk`,
      typeLabel: "Culture",
      kind: "activity",
      rating: 4.7,
      lat: 48.8566,
      lon: 2.3522,
      blurb: "A high-signal walking loop through the city’s most iconic neighborhoods and viewpoints.",
    },
    {
      id: "food-market",
      name: `${destination} Food Market`,
      typeLabel: "Food",
      kind: "food",
      rating: 4.6,
      lat: 48.8584,
      lon: 2.2945,
      blurb: "Try local specialties, grab a quick lunch, and let the AI pin the best stalls based on your tastes.",
    },
  ];
}

export function TripDashboard({
  tripId,
  destination,
  initialSpec,
}: {
  tripId: string;
  destination: string;
  initialSpec: unknown;
}) {
  const [tab, setTab] = useState<"ideas" | "itinerary">("ideas");
  const [active, setActive] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");

  const ideas = useMemo(() => sampleIdeas(destination), [destination]);
  const pins = useMemo(() => ideas.map(({ id, name, lat, lon, kind }) => ({ id, name, lat, lon, kind })), [ideas]);

  return (
    <div className="grid gap-4">
      <div className="grid gap-3 md:grid-cols-3">
        <GlassCard className="md:col-span-2">
          <div className="flex flex-wrap items-center gap-2">
            <button
              className={cn(
                "focus-ring glass rounded-xl px-4 py-2 text-sm text-foreground/70 hover:bg-cyan/5",
                tab === "ideas" && "bg-cyan/10 text-foreground",
              )}
              onClick={() => setTab("ideas")}
            >
              Ideas
            </button>
            <button
              className={cn(
                "focus-ring glass rounded-xl px-4 py-2 text-sm text-foreground/70 hover:bg-cyan/5",
                tab === "itinerary" && "bg-cyan/10 text-foreground",
              )}
              onClick={() => setTab("itinerary")}
            >
              Itinerary
            </button>
            <div className="ml-auto text-xs text-foreground/50">Trip: {tripId.slice(0, 8)}</div>
          </div>
        </GlassCard>
        <GlassCard className="md:col-span-1">
          <div className="text-xs text-foreground/55">Quick actions</div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="glass rounded-xl p-3 text-xs text-foreground/70">Bookings</div>
            <div className="glass rounded-xl p-3 text-xs text-foreground/70">Media</div>
            <div className="glass rounded-xl p-3 text-xs text-foreground/70">Preferences</div>
            <div className="glass rounded-xl p-3 text-xs text-foreground/70">Calendar</div>
          </div>
        </GlassCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="grid gap-4">
          {tab === "ideas" ? (
            <>
              <GlassCard>
                <div className="text-xs text-foreground/55">Chat</div>
                <div className="mt-2 text-sm text-foreground/70">
                  Ask for ideas like “2 days in {destination} — food, history, nightlife”. (AI chat wiring next.)
                </div>
                <div className="mt-4 flex gap-2">
                  <Input value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Ask anything…" />
                  <Button variant="primary" onClick={() => setPrompt("")} disabled={!prompt.trim()}>
                    Send
                  </Button>
                </div>
              </GlassCard>

              <div className="grid gap-3">
                {ideas.map((it) => (
                  <motion.button
                    key={it.id}
                    whileHover={{ y: -2 }}
                    onClick={() => setActive(it.id)}
                    className={cn(
                      "glass hover-lift w-full rounded-2xl p-4 text-left",
                      active === it.id && "border-cyan/35 bg-cyan/10",
                    )}
                  >
                    <div className="grid gap-4 md:grid-cols-[1fr_240px] md:items-center">
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <div className="text-lg font-semibold">{it.name}</div>
                          <div className="text-sm text-foreground/70">{it.rating ? `★ ${it.rating}` : ""}</div>
                        </div>
                        <div className="mt-1 text-xs text-foreground/55">{it.typeLabel}</div>
                        <div className="mt-3 text-sm text-foreground/75">{it.blurb}</div>
                      </div>
                      <div className="relative aspect-[16/11] overflow-hidden rounded-2xl">
                        <InlinePhoto query={`${it.name} ${destination}`} alt={it.name} />
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </>
          ) : (
            <ItineraryBoard tripId={tripId} initialSpec={initialSpec} />
          )}
        </div>

        <div className="glass overflow-hidden rounded-2xl">
          <TripMap pins={pins} activeId={active} />
        </div>
      </div>
    </div>
  );
}

