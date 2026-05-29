"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { HeroSection } from "@/components/home/HeroSection";
import { FooterCTA } from "@/components/home/FooterCTA";
import { HelpWidget } from "@/components/home/HelpWidget";
import { SiteFooter } from "@/components/home/SiteFooter";

const AuthBar = dynamic(() => import("@/components/home/AuthBar").then((mod) => mod.AuthBar), {
  ssr: false,
  loading: () => <div className="h-9 w-[120px]" />,
});
const UpcomingTrips = dynamic(() => import("@/components/home/UpcomingTrips").then((mod) => mod.UpcomingTrips), {
  ssr: false,
});
const DestinationGrid = dynamic(() => import("@/components/home/DestinationGrid").then((mod) => mod.DestinationGrid), {
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
  paris:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/La_Tour_Eiffel_vue_de_la_Tour_Saint-Jacques%2C_Paris_ao%C3%BBt_2014_%282%29.jpg/330px-La_Tour_Eiffel_vue_de_la_Tour_Saint-Jacques%2C_Paris_ao%C3%BBt_2014_%282%29.jpg",
};

export default function Home() {
  const [query, setQuery] = useState("");
  const [recentTrips, setRecentTrips] = useState<RecentTrip[]>([]);
  const [recentImages, setRecentImages] = useState<Record<string, string>>({});
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  useEffect(() => {
    setMounted(true);
  }, []);

  const focusHeroSearch = () => {
    const el = document.getElementById("hero-search") as HTMLInputElement | null;
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    el?.focus();
  };

  const handlePlanNew = () => {
    if (query.trim()) {
      void submit();
      return;
    }
    focusHeroSearch();
  };

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
    <div id="top" className="min-h-screen bg-background">
      <div className="sticky top-0 z-40 border-b border-neutral-200 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between px-6 py-4">
          <div className="flex items-center gap-6">
            <div className="text-lg font-bold text-[#E8472A]">Wayfarer</div>
            <nav className="hidden items-center gap-4 md:flex">
              {[
                { label: "Home", href: "#top", active: true },
                { label: "Upcoming", href: "#upcoming" },
                { label: "Explore", href: "#explore" },
                { label: "Guides", href: "#guides" },
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className={`text-sm font-medium text-neutral-600 transition-all duration-200 hover:text-[#E8472A] ${
                    item.active ? "border-b-2 border-[#E8472A] pb-1 text-[#E8472A]" : "border-b-2 border-transparent pb-1"
                  }`}
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 md:flex">
              <button
                className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 text-neutral-500 transition-all duration-200 hover:border-[#E8472A] hover:text-[#E8472A]"
                aria-label="Refresh"
                type="button"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M21 12a9 9 0 1 1-2.64-6.36" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M21 3v6h-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 text-neutral-500 transition-all duration-200 hover:border-[#E8472A] hover:text-[#E8472A]"
                aria-label="Share"
                type="button"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 3v12" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M8 7l4-4 4 4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                aria-label="Open user menu"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-200 text-xs font-semibold text-neutral-700"
                type="button"
              >
                U
              </button>
            </div>
            <button
              className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 text-neutral-700 transition-all duration-200 hover:border-[#E8472A] hover:text-[#E8472A] md:hidden"
              aria-label="Open navigation menu"
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
            >
              ☰
            </button>
            <div suppressHydrationWarning>
              {mounted ? <AuthBar /> : <div className="h-9 w-[120px]" />}
            </div>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="border-t border-neutral-200 bg-white px-6 py-3 md:hidden">
            <div className="flex flex-col gap-2 text-sm font-medium text-neutral-700">
              {[
                { label: "Home", href: "#top" },
                { label: "Upcoming", href: "#upcoming" },
                { label: "Explore", href: "#explore" },
                { label: "Guides", href: "#guides" },
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="rounded-xl px-3 py-2 transition-all duration-200 hover:bg-[#F5EAE6] hover:text-[#E8472A]"
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
        <HeroSection query={query} onChange={setQuery} onSubmit={submit} />
      </div>

      <UpcomingTrips trips={upcomingTrips} onPlanNew={handlePlanNew} onSeeAll={() => router.push("/trips")} />
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
