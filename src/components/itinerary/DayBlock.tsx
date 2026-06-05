"use client";

import { useEffect, useRef, useState } from "react";
import { Activity, useTripStore } from "@/store/tripStore";
import { ItineraryPlaceCard } from "@/components/itinerary/ItineraryPlaceCard";

interface Props {
  day: string;
  date?: string;
  theme?: string;
  activities: Activity[];
  dayColorIndex?: number;
}

const DAY_COLORS = ["#E8472A", "#7C4DFF", "#FF4DB1", "#F4A261", "#2A9D8F", "#E76F51"];

export function DayBlock({ day, date, theme, activities, dayColorIndex = 0 }: Props) {
  const destination = useTripStore((s) => s.trip?.destination);
  const totalDays = useTripStore((s) => s.trip?.days.length ?? 0);
  const [travelInfo, setTravelInfo] = useState<Record<string, { time: string; distance: string; directions: string }>>(
    {},
  );
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState(false);
  const defaultedRef = useRef(false);

  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let idleId: number | null = null;

    const loadRoutes = async () => {
      const pairs = activities
        .map((a, idx) => {
          const b = activities[idx + 1];
          if (!b || a.lat == null || a.lng == null || b.lat == null || b.lng == null) return null;
          return { a, b };
        })
        .filter(Boolean) as Array<{ a: Activity; b: Activity }>;

      if (pairs.length === 0 || cancelled) return;

      const resultsEntries = await Promise.all(
        pairs.map(async (pair) => {
          const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${pair.a.lng},${pair.a.lat};${pair.b.lng},${pair.b.lat}?access_token=${token}`;
          try {
            const res = await fetch(url);
            const data = await res.json();
            const route = data?.routes?.[0];
            if (!route) return null;
            const seconds = route.duration ?? 0;
            const meters = route.distance ?? 0;
            return [
              `${pair.a.id}__${pair.b.id}`,
              {
                time: formatDuration(seconds),
                distance: formatMiles(meters),
                directions: `https://www.google.com/maps/dir/?api=1&origin=${pair.a.lat},${pair.a.lng}&destination=${pair.b.lat},${pair.b.lng}`,
              },
            ] as const;
          } catch {
            return null;
          }
        }),
      );

      if (cancelled) return;
      const results: Record<string, { time: string; distance: string; directions: string }> = {};
      for (const entry of resultsEntries) {
        if (!entry) continue;
        results[entry[0]] = entry[1];
      }
      setTravelInfo(results);
    };

    const start = () => {
      loadRoutes();
    };

    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      idleId = (window as any).requestIdleCallback(start, { timeout: 1500 });
    } else {
      timeoutId = setTimeout(start, 600);
    }

    return () => {
      cancelled = true;
      if (idleId && typeof window !== "undefined" && "cancelIdleCallback" in window) {
        (window as any).cancelIdleCallback(idleId);
      }
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [activities, token]);

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 768);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    if (isMobile) {
      setCollapsed(false);
      return;
    }
    if (!defaultedRef.current) {
      setCollapsed(totalDays > 3);
      defaultedRef.current = true;
    }
  }, [totalDays, isMobile]);

  const showContent = isMobile ? true : !collapsed;

  const estimatedCost = activities.reduce((sum, activity) => sum + (activity.estimatedCost ?? 0), 0);

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
      <button
        onClick={() => {
          if (isMobile) return;
          setCollapsed((v) => !v);
        }}
        className="mb-3 flex w-full items-start justify-between gap-3 text-left"
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              aria-hidden="true"
              style={{ background: DAY_COLORS[dayColorIndex % DAY_COLORS.length] }}
              className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
            />
            <h2 className="truncate text-base font-bold text-neutral-950">{day}{theme ? ` · ${theme}` : ""}</h2>
          </div>
          <div className="mt-1 text-xs text-neutral-500">
            {activities.length} places
            {estimatedCost ? ` · ~$${Math.round(estimatedCost)} est.` : ""}
            {date ? ` · ${date}` : ""}
          </div>
        </div>
        {!isMobile && <span className="ml-3 text-xs text-neutral-500">{collapsed ? "▸" : "▾"}</span>}
      </button>
      {showContent && (
        <ul className="space-y-2">
        {activities.map((act, index) => {
          const next = activities[index + 1];
          const key = next ? `${act.id}__${next.id}` : "";
          const info = key ? travelInfo[key] : null;
          const directionsUrl =
            act.lat != null && act.lng != null && next?.lat != null && next?.lng != null
              ? `https://www.google.com/maps/dir/?api=1&origin=${act.lat},${act.lng}&destination=${next.lat},${next.lng}`
              : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(act.name)}`;

          const pinColor = DAY_COLORS[dayColorIndex % DAY_COLORS.length];
          return (
            <li key={act.id} className="space-y-3">
              <ItineraryPlaceCard
                activity={act}
                index={index}
                destination={destination}
                pinColor={pinColor}
              />

              {index < activities.length - 1 && (
                <div className="relative ml-4 pl-6">
                  <div className="absolute left-2 top-0 bottom-0 border-l border-dashed border-neutral-300" />
                  <div className="flex min-h-8 items-center gap-2 text-xs text-neutral-500">
                    <span aria-hidden="true">→</span>
                    <span>{info ? `${info.time} · ${info.distance}` : "Route time pending"}</span>
                    <a
                      href={directionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-[#E8472A] underline"
                    >
                      Directions
                    </a>
                  </div>
                </div>
              )}
            </li>
          );
        })}
        </ul>
      )}
    </section>
  );
}

function formatDuration(seconds: number) {
  const mins = Math.round(seconds / 60);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h > 0) return `${h} hr ${m} min`;
  return `${m} min`;
}

function formatMiles(meters: number) {
  const miles = meters / 1609.34;
  return `${miles.toFixed(1)} mi`;
}
