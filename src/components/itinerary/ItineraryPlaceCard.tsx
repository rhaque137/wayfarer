"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { Activity, useTripStore } from "@/store/tripStore";

type Props = {
  activity: Activity;
  index: number;
  destination?: string;
  pinColor?: string;
};

export function ItineraryPlaceCard({ activity, index, destination, pinColor }: Props) {
  const { activeActivityId, setActiveActivityId, setActivityPhoto } = useTripStore();
  const isActive = activeActivityId === activity.id;
  const hasCoords = activity.lat != null && activity.lng != null;
  const [photoUrl, setPhotoUrl] = useState<string | null>(activity.photoUrl ?? null);
  const [photoLoading, setPhotoLoading] = useState<boolean>(true);
  const [expanded, setExpanded] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const mapsUrl = useMemo(() => {
    const q = activity.name + (activity.address ? ` ${activity.address}` : "");
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
  }, [activity.name, activity.address]);

  useEffect(() => {
    if (!cardRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!shouldLoad || photoUrl) return;
    let isMounted = true;
    async function load() {
      try {
        setPhotoLoading(true);
        const res = await fetch("/api/place-photo", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            placeName: activity.name,
            address: activity.address,
            city: destination,
            lat: activity.lat,
            lng: activity.lng,
          }),
        });
        const data = await res.json();
        const url = data?.photoUrl as string | undefined;
        if (isMounted) {
          if (url) {
            setPhotoUrl(url);
            setActivityPhoto(activity.id, url);
          }
        }
      } catch {
        if (isMounted) {
          // leave photo null on failure to avoid mismatched images
        }
      } finally {
        if (isMounted) setPhotoLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, [activity.name, destination, photoUrl, shouldLoad]);

  useEffect(() => {
    setPhotoUrl(activity.photoUrl ?? null);
    setPhotoLoading(true);
  }, [activity.id, activity.name, destination]);

  return (
    <div
      ref={cardRef}
      onClick={() => {
        setExpanded((v) => !v);
        if (hasCoords) setActiveActivityId(isActive ? null : activity.id);
      }}
      className={[
        "flex items-center justify-between gap-4 rounded-2xl bg-white p-4 shadow-sm border border-panel-border",
        "hover-lift",
        hasCoords ? "cursor-pointer" : "",
        isActive ? "ring-2 ring-cyan-300" : "",
      ].join(" ")}
    >
      <div className="flex items-start gap-3 min-w-0">
        <TeardropPin number={index + 1} color={pinColor ?? "#00E5FF"} />
        <div className="min-w-0">
          <div className="font-semibold text-foreground truncate">{activity.name}</div>
          <div className={["mt-1 text-xs text-muted", expanded ? "" : "line-clamp-2"].join(" ")}>
            <span className="italic">From the web:</span>{" "}
            {activity.description ?? "No description available yet."}
          </div>
          {expanded && activity.address && (
            <div className="mt-1 text-xs text-muted/70">{activity.address}</div>
          )}
          <div className="mt-2 text-xs text-teal-600">
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
              Open in Google Maps
            </a>
          </div>
        </div>
      </div>

      <div className="relative h-[120px] w-[160px] flex-shrink-0 overflow-hidden rounded-xl border border-panel-border bg-slate-100">
        {photoLoading && <div className="absolute inset-0 animate-pulse bg-slate-200" />}
        {photoUrl ? (
          <Image
            src={photoUrl}
            alt={activity.name}
            fill
            className="object-cover"
            unoptimized
            onLoadingComplete={() => setPhotoLoading(false)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[10px] text-muted">
            Photo unavailable
          </div>
        )}
      </div>
    </div>
  );
}

function TeardropPin({ number, color }: { number: number; color: string }) {
  return (
    <div className="relative h-10 w-8 flex-shrink-0">
      <svg viewBox="0 0 64 90" className="h-10 w-8">
        <path
          d="M32 0C18 0 6.5 11.5 6.5 25.5c0 17.6 19.2 36.9 23.6 50.2.5 1.5 2.8 1.5 3.3 0 4.5-13.3 23.6-32.6 23.6-50.2C57.1 11.5 45.6 0 32 0z"
          fill={color}
        />
        <circle cx="32" cy="27" r="16" fill="#0B1220" opacity="0.25" />
      </svg>
      <div className="absolute inset-0 flex items-start justify-center pt-[9px] text-xs font-semibold text-white">
        {number}
      </div>
    </div>
  );
}
