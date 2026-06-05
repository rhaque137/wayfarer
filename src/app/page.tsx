"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { HeroSection, TripIntake, buildTripQuery } from "@/components/home/HeroSection";
import { FooterCTA } from "@/components/home/FooterCTA";
import { HelpWidget } from "@/components/home/HelpWidget";
import { SiteFooter } from "@/components/home/SiteFooter";
import { PLACEHOLDER_IMAGE, getDestinationImage } from "@/lib/destination-images";
import { CREATE_TRIP_ERROR_MESSAGE, MAX_TRIP_PROMPT_LENGTH } from "@/lib/trip-limits";

const AuthBar = dynamic(() => import("@/components/home/AuthBar").then((mod) => mod.AuthBar), {
  ssr: false,
  loading: () => (
    <a
      href="/login"
      className="rounded-full border border-neutral-200 bg-white px-4 py-2 text-xs font-semibold text-neutral-600 shadow-sm"
    >
      Sign in
    </a>
  ),
});
const UpcomingTrips = dynamic(() => import("@/components/home/UpcomingTrips").then((mod) => mod.UpcomingTrips), {
  ssr: false,
});
const DestinationGrid = dynamic(() => import("@/components/home/DestinationGrid").then((mod) => mod.DestinationGrid), {
  ssr: false,
});
const ProductProof = dynamic(() => import("@/components/home/ProductProof").then((mod) => mod.ProductProof), {
  ssr: false,
});
const HowItWorks = dynamic(() => import("@/components/home/HowItWorks").then((mod) => mod.HowItWorks), {
  ssr: false,
});
const Testimonials = dynamic(() => import("@/components/home/Testimonials").then((mod) => mod.Testimonials), {
  ssr: false,
});
const TravelGuides = dynamic(() => import("@/components/home/TravelGuides").then((mod) => mod.TravelGuides), {
  ssr: false,
});

type RecentTrip = { id: string; name: string; destination: string; coverImage?: string; query?: string };
const RECENT_IMAGE_OVERRIDES: Record<string, string> = {
  paris: getDestinationImage("Paris")?.url ?? PLACEHOLDER_IMAGE.url,
};
const DEFAULT_INTAKE: TripIntake = {
  destination: "",
  dates: "",
  tripLength: "",
  travelers: "2",
  budget: "Mid-range",
  interests: [],
  notes: "",
};

export default function Home() {
  const [intake, setIntake] = useState<TripIntake>(DEFAULT_INTAKE);
  const [recentTrips, setRecentTrips] = useState<RecentTrip[]>([]);
  const [recentImages, setRecentImages] = useState<Record<string, string>>({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCreatingTrip, setIsCreatingTrip] = useState(false);
  const [createTripError, setCreateTripError] = useState<string | null>(null);
  const router = useRouter();

  const submit = async () => {
    const trimmedQuery = buildTripQuery(intake).trim();
    if (!intake.destination.trim()) {
      setCreateTripError("Add a destination before generating your itinerary.");
      return;
    }
    if (!intake.dates.trim() && !intake.tripLength.trim()) {
      setCreateTripError("Add travel dates or a trip length.");
      return;
    }
    if (!trimmedQuery || isCreatingTrip) return;
    if (trimmedQuery.length > MAX_TRIP_PROMPT_LENGTH) {
      setCreateTripError(`Keep your trip prompt under ${MAX_TRIP_PROMPT_LENGTH} characters.`);
      return;
    }

    setIsCreatingTrip(true);
    setCreateTripError(null);

    try {
      const res = await fetch("/api/create-trip", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ query: trimmedQuery }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.id) {
        router.push(`/trip/${data.id}/chat/main?q=${encodeURIComponent(trimmedQuery)}`);
        return;
      }
      setCreateTripError(CREATE_TRIP_ERROR_MESSAGE);
    } catch {
      setCreateTripError(CREATE_TRIP_ERROR_MESSAGE);
    } finally {
      setIsCreatingTrip(false);
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
    if (q) {
      setIntake((current) => ({
        ...current,
        destination: q,
        notes: q,
      }));
    }
  }, []);

  const focusHeroSearch = () => {
    const el = document.getElementById("trip-destination") as HTMLInputElement | null;
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    el?.focus();
  };

  const handlePlanNew = () => {
    if (intake.destination.trim() && (intake.dates.trim() || intake.tripLength.trim())) {
      void submit();
      return;
    }
    focusHeroSearch();
  };

  const upcomingTrips = useMemo(
    () =>
      recentTrips.map((trip, idx) => {
        const cityOnly = trip.destination.split(",")[0]?.trim() || trip.destination;
        const curatedImage =
          getDestinationImage(trip.name) ??
          getDestinationImage(cityOnly) ??
          getDestinationImage(trip.destination);
        return {
          ...trip,
          coverImage:
            RECENT_IMAGE_OVERRIDES[(trip.destination.split(",")[0]?.trim() || trip.destination).toLowerCase()] ??
            curatedImage?.url ??
            recentImages[trip.id] ??
            PLACEHOLDER_IMAGE.url,
          dates: ["May 12–17", "Jun 3–8", "Jul 22–29", "Sep 5–10"][idx % 4],
          savedCount: [12, 8, 15, 6][idx % 4],
          countdown: ["Next week", "In 3 months", "In 5 months", "Soon"][idx % 4],
        };
      }),
    [recentTrips, recentImages],
  );

  return (
    <div id="top" className="min-h-screen bg-background">
      <div className="sticky top-0 z-40 border-b border-neutral-200 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between px-6 py-4">
          <div className="flex items-center gap-6">
            <div className="text-lg font-bold text-[#E8472A]">Wayfarer</div>
            <nav className="hidden items-center gap-4 md:flex">
              {[
                { label: "Home", href: "#top", active: true },
                { label: "Explore", href: "#explore" },
                { label: "Trips", href: "/trips" },
                { label: "Pricing", href: "/pricing" },
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className={`text-sm font-medium text-neutral-600 transition-colors duration-200 hover:text-[#E8472A] ${
                    item.active ? "border-b-2 border-[#E8472A] pb-1 text-[#E8472A]" : "border-b-2 border-transparent pb-1"
                  }`}
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 text-neutral-700 transition-all duration-200 hover:border-[#E8472A] hover:text-[#E8472A] md:hidden"
              aria-label="Open navigation menu"
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
            >
              ☰
            </button>
            <div suppressHydrationWarning>
              <AuthBar />
            </div>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="border-t border-neutral-200 bg-white px-6 py-3 md:hidden">
            <div className="flex flex-col gap-2 text-sm font-medium text-neutral-700">
              {[
                { label: "Home", href: "#top" },
                { label: "Explore", href: "#explore" },
                { label: "Trips", href: "/trips" },
                { label: "Pricing", href: "/pricing" },
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="rounded-xl px-3 py-2 transition-colors duration-200 hover:bg-[#F5EAE6] hover:text-[#E8472A]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="mx-auto w-full max-w-[1280px] px-6 py-6">
        <HeroSection
          intake={intake}
          onChange={(next) => {
            setCreateTripError(null);
            setIntake(next);
          }}
          onUseExample={(next) => {
            setCreateTripError(null);
            setIntake(next);
          }}
          onSubmit={submit}
          isSubmitting={isCreatingTrip}
          error={createTripError}
          maxLength={MAX_TRIP_PROMPT_LENGTH}
        />
      </div>

      <UpcomingTrips trips={upcomingTrips} onPlanNew={handlePlanNew} onSeeAll={() => router.push("/trips")} />
      <ProductProof />
      <DestinationGrid />
      <HowItWorks />
      <Testimonials />
      <TravelGuides />
      <FooterCTA onStart={focusHeroSearch} />
      <SiteFooter />
      <HelpWidget />
    </div>
  );
}
