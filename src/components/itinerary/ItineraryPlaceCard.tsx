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
  const {
    activeActivityId,
    setActiveActivityId,
    setActivityPhoto,
    updateActivity,
    toggleActivityLock,
    saveActivity,
    savedActivities,
  } = useTripStore();
  const isActive = activeActivityId === activity.id;
  const isSaved = savedActivities.some((saved) => saved.id === activity.id);
  const hasCoords = activity.lat != null && activity.lng != null;
  const [photoUrl, setPhotoUrl] = useState<string | null>(activity.photoUrl ?? null);
  const [photoLoading, setPhotoLoading] = useState<boolean>(true);
  const [expanded, setExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [draftName, setDraftName] = useState(activity.name);
  const [draftDescription, setDraftDescription] = useState(activity.description);
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
    setDraftName(activity.name);
    setDraftDescription(activity.description);
  }, [activity.id, activity.name, destination]);

  const saveEdit = () => {
    const name = draftName.trim();
    const description = draftDescription.trim();
    if (!name || !description) return;
    updateActivity(activity.id, { name, description });
    setIsEditing(false);
  };

  return (
    <div
      ref={cardRef}
      onClick={() => {
        setExpanded((v) => !v);
        if (hasCoords) setActiveActivityId(isActive ? null : activity.id);
      }}
      className={[
        "flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-white p-5 shadow-sm border border-neutral-200 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
        hasCoords ? "cursor-pointer" : "",
        isActive ? "ring-2 ring-[#E8472A]/40" : "",
      ].join(" ")}
    >
      <div className="flex items-start gap-3 min-w-0 w-full">
        <TeardropPin number={index + 1} color={pinColor ?? "#00E5FF"} />
        <div className="min-w-0">
          {isEditing ? (
            <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
              <label className="block text-xs font-semibold text-neutral-600" htmlFor={`activity-name-${activity.id}`}>
                Activity name
              </label>
              <input
                id={`activity-name-${activity.id}`}
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-[#E8472A] focus:ring-2 focus:ring-[#E8472A]/20"
              />
              <label className="block text-xs font-semibold text-neutral-600" htmlFor={`activity-description-${activity.id}`}>
                Notes
              </label>
              <textarea
                id={`activity-description-${activity.id}`}
                value={draftDescription}
                onChange={(e) => setDraftDescription(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-[#E8472A] focus:ring-2 focus:ring-[#E8472A]/20"
              />
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={saveEdit}
                  className="rounded-full bg-[#E8472A] px-3 py-1 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-[#E8472A]/30"
                >
                  Save locally
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDraftName(activity.name);
                    setDraftDescription(activity.description);
                    setIsEditing(false);
                  }}
                  className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-semibold text-neutral-700 focus:outline-none focus:ring-2 focus:ring-[#E8472A]/20"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <div className="text-base font-semibold text-neutral-900 truncate">{activity.name}</div>
                {activity.locked ? (
                  <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold text-neutral-600">
                    Locked
                  </span>
                ) : null}
              </div>
              <div className={["mt-2 text-sm leading-relaxed text-neutral-600", expanded ? "" : "line-clamp-3"].join(" ")}>
                <span className="italic">From the web:</span>{" "}
                {activity.description ?? "No description available yet."}
              </div>
            </>
          )}
          {expanded && activity.address && (
            <div className="mt-2 text-xs text-neutral-500">{activity.address}</div>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs font-semibold text-[#E8472A]" onClick={(e) => e.stopPropagation()}>
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
              Open in Google Maps
            </a>
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              disabled={activity.locked}
              className="underline disabled:text-neutral-400 disabled:no-underline"
            >
              Edit
            </button>
            <button type="button" onClick={() => toggleActivityLock(activity.id)} className="underline">
              {activity.locked ? "Unlock" : "Lock"}
            </button>
            <button
              type="button"
              onClick={() => saveActivity(activity)}
              className="underline disabled:text-neutral-400 disabled:no-underline"
              disabled={isSaved}
            >
              {isSaved ? "Saved" : "Save locally"}
            </button>
          </div>
        </div>
      </div>

      <div className="relative h-40 w-full flex-shrink-0 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100 sm:h-[120px] sm:w-[160px]">
        {photoLoading && <div className="absolute inset-0 animate-pulse bg-neutral-200" />}
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
          <div className="flex h-full w-full items-center justify-center text-[10px] text-neutral-500">
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
