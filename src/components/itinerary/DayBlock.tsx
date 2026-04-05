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

const DAY_COLORS = [
  "#00E5FF",
  "#FF6B6B",
  "#51CF66",
  "#FFD43B",
  "#CC5DE8",
  "#FF922B",
  "#74C0FC",
  "#F06595",
];

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
    async function loadRoutes() {
      if (!token) return;
      const pairs = activities
        .map((a, idx) => {
          const b = activities[idx + 1];
          if (!b || a.lat == null || a.lng == null || b.lat == null || b.lng == null) return null;
          return { a, b };
        })
        .filter(Boolean) as Array<{ a: Activity; b: Activity }>;

      const results: Record<string, { time: string; distance: string; directions: string }> = {};
      for (const pair of pairs) {
        const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${pair.a.lng},${pair.a.lat};${pair.b.lng},${pair.b.lat}?access_token=${token}`;
        try {
          const res = await fetch(url);
          const data = await res.json();
          const route = data?.routes?.[0];
          if (route) {
            const seconds = route.duration ?? 0;
            const meters = route.distance ?? 0;
            results[`${pair.a.id}__${pair.b.id}`] = {
              time: formatDuration(seconds),
              distance: formatMiles(meters),
              directions: `https://www.google.com/maps/dir/?api=1&origin=${pair.a.lat},${pair.a.lng}&destination=${pair.b.lat},${pair.b.lng}`,
            };
          }
        } catch {
          // ignore
        }
      }
      setTravelInfo(results);
    }
    loadRoutes();
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

  return (
    <div className="rounded-lg border border-green-200 bg-green-50 p-3">
      <button
        onClick={() => setCollapsed((v) => !v)}
        className="mb-2 flex w-full items-center justify-between text-left"
      >
        <span className="flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
          <span
            style={{
              display: "inline-block",
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: DAY_COLORS[dayColorIndex % DAY_COLORS.length],
              marginRight: 6,
              flexShrink: 0,
            }}
          />
          {day}
        </span>
        <div className="text-right">
          {date && <span className="text-xs text-muted">{date}</span>}
          {theme && <div className="text-xs text-teal-600 font-medium">{theme}</div>}
        </div>
        <span className="ml-3 text-xs text-muted">{collapsed ? "▸" : "▾"}</span>
      </button>
      {!collapsed && (
        <ul className="space-y-4">
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
                <div className="relative ml-6 pl-6">
                  <div className="absolute left-3 top-0 bottom-0 border-l border-dashed border-slate-300" />
                  <div className="flex items-center gap-2 text-xs text-muted">
                    <span>🚗</span>
                    <span>{info ? `${info.time} · ${info.distance}` : "Calculating route..."}</span>
                    <a
                      href={directionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-teal-600 underline"
                    >
                      Directions ▾
                    </a>
                  </div>
                </div>
              )}
            </li>
          );
        })}
        </ul>
      )}
    </div>
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
