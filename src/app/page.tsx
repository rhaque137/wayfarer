"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { HeroSection } from "@/components/home/HeroSection";
import { UpcomingTrips } from "@/components/home/UpcomingTrips";
import { DestinationGrid } from "@/components/home/DestinationGrid";
import { HowItWorks } from "@/components/home/HowItWorks";
import { Testimonials } from "@/components/home/Testimonials";
import { TravelGuides } from "@/components/home/TravelGuides";
import { FooterCTA } from "@/components/home/FooterCTA";
import { HelpWidget } from "@/components/home/HelpWidget";
import { AuthBar } from "@/components/home/AuthBar";

type RecentTrip = { id: string; name: string; destination: string; coverImage?: string; query?: string };
const RECENT_IMAGE_OVERRIDES: Record<string, string> = {
  paris:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/La_Tour_Eiffel_vue_de_la_Tour_Saint-Jacques%2C_Paris_ao%C3%BBt_2014_%282%29.jpg/330px-La_Tour_Eiffel_vue_de_la_Tour_Saint-Jacques%2C_Paris_ao%C3%BBt_2014_%282%29.jpg",
};

export default function Home() {
  const [query, setQuery] = useState("");
  const [recentTrips, setRecentTrips] = useState<RecentTrip[]>([]);
  const [recentImages, setRecentImages] = useState<Record<string, string>>({});
  const router = useRouter();

  const submit = async () => {
    if (!query.trim()) return;
    const res = await fetch("/api/create-trip", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ query }),
    });
    const data = await res.json();
    if (res.ok && data?.id) {
      router.push(`/trip/${data.id}/chat/main?q=${encodeURIComponent(query)}`);
    }
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem("wayfarer_recent_trips");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setRecentTrips(parsed.slice(0, 4));
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadImages() {
      const next: Record<string, string> = {};
      await Promise.all(
        recentTrips.map(async (trip) => {
          try {
            const cityOnly = trip.destination.split(",")[0]?.trim() || trip.destination;
            const override = RECENT_IMAGE_OVERRIDES[cityOnly.toLowerCase()];
            if (override) {
              next[trip.id] = override;
              return;
            }
            const res = await fetch("/api/place-photo", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ placeName: `${cityOnly} skyline`, city: cityOnly }),
            });
            const data = await res.json();
            const url = data?.photoUrl as string | undefined;
            if (url) next[trip.id] = url;
          } catch {
            // ignore
          }
        }),
      );
      if (!cancelled) setRecentImages(next);
    }
    if (recentTrips.length) loadImages();
    return () => {
      cancelled = true;
    };
  }, [recentTrips]);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("q");
    if (q) setQuery(q);
  }, []);

  const upcomingTrips = useMemo(
    () =>
      recentTrips.map((trip, idx) => {
        const cityOnly = trip.destination.split(",")[0]?.trim() || trip.destination;
        return {
        ...trip,
        coverImage:
          recentImages[trip.id] ??
          RECENT_IMAGE_OVERRIDES[(trip.destination.split(",")[0]?.trim() || trip.destination).toLowerCase()] ??
          `https://picsum.photos/seed/${encodeURIComponent(cityOnly)}/800/600`,
        dates: ["May 12–17", "Jun 3–8", "Jul 22–29", "Sep 5–10"][idx % 4],
        savedCount: [12, 8, 15, 6][idx % 4],
        countdown: ["Next week", "In 3 months", "In 5 months", "Soon"][idx % 4],
        };
      }),
    [recentTrips, recentImages],
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between px-6 py-6">
        <div className="text-sm font-semibold text-foreground">Wayfarer</div>
        <AuthBar />
      </div>
      <div className="mx-auto w-full max-w-[1280px] px-6 py-4">
        <HeroSection query={query} onChange={setQuery} onSubmit={submit} />
      </div>

      <UpcomingTrips trips={upcomingTrips} onPlanNew={submit} onSeeAll={() => router.push("/trips")} />
      <DestinationGrid />
      <HowItWorks />
      <Testimonials />
      <TravelGuides />
      <FooterCTA onStart={submit} />
      <HelpWidget />
    </div>
  );
}
