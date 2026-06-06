"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Activity, useTripStore } from "@/store/tripStore";
import { getActivityPhotoUrl } from "@/lib/activity-media";

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
    removeActivity,
    toggleActivityLock,
    saveActivity,
    savedActivities,
  } = useTripStore();
  const [expanded, setExpanded] = useState(false);
  const isActive = activeActivityId === activity.id;
  const isExpanded = expanded || isActive;
  const isSaved = savedActivities.some((saved) => saved.id === activity.id);
  const hasCoords = activity.lat != null && activity.lng != null;
  const photoUrl = getActivityPhotoUrl(activity, destination);

  const mapsUrl = useMemo(() => {
    if (hasCoords) {
      return `https://www.google.com/maps/search/?api=1&query=${activity.lat},${activity.lng}`;
    }
    const q = activity.name + (activity.address ? ` ${activity.address}` : "");
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
  }, [activity.name, activity.address, activity.lat, activity.lng, hasCoords]);

  const oneLine = activity.description || activity.notes || "Details need a quick check before you go.";
  const area = (activity as Activity & { area?: string }).area ?? activity.locationName ?? activity.address;

  return (
    <article
      id={`activity-${activity.id}`}
      className={[
        "group rounded-2xl border bg-white p-3 shadow-sm transition-[border-color,box-shadow] duration-200 hover:border-neutral-300 hover:shadow-md",
        isActive ? "border-[#E8472A] ring-4 ring-[#E8472A]/10" : "border-neutral-200",
      ].join(" ")}
      onMouseEnter={() => {
        if (hasCoords) setActiveActivityId(activity.id);
      }}
      onFocus={() => {
        if (hasCoords) setActiveActivityId(activity.id);
      }}
    >
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => {
            setExpanded((value) => !value);
            if (hasCoords) setActiveActivityId(isActive ? null : activity.id);
          }}
          className="flex min-w-0 flex-1 gap-3 text-left focus:outline-none focus:ring-4 focus:ring-[#E8472A]/15"
          aria-expanded={isExpanded}
        >
          <span
            className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
            style={{ backgroundColor: pinColor ?? "#E8472A" }}
          >
            {index + 1}
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-2">
              <span className="truncate text-sm font-bold text-neutral-950 md:text-base">{activity.name}</span>
              {activity.locked ? (
                <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold text-neutral-600">
                  Locked
                </span>
              ) : null}
            </span>
            <span className="mt-1 line-clamp-2 block text-xs leading-5 text-neutral-600 md:text-sm">
              {oneLine}
            </span>
            <span className="mt-2 flex flex-wrap items-center gap-2 text-xs text-neutral-500">
              {activity.durationMinutes ? <span>{activity.durationMinutes} min</span> : null}
              {area ? <span className="truncate">{area}</span> : <span>Location needs check</span>}
              <VerificationChip activity={activity} />
              {!hasCoords ? (
                <span className="rounded-full bg-amber-50 px-2 py-0.5 font-semibold text-amber-700">
                  Needs location
                </span>
              ) : null}
              {activity.estimatedCost != null ? (
                <span>${Math.round(activity.estimatedCost)} est.</span>
              ) : null}
            </span>
          </span>
        </button>

        <div className="flex flex-shrink-0 flex-col items-end gap-2">
          <ActivityThumbnail name={activity.name} photoUrl={photoUrl} />
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-[#F5EAE6] px-3 py-1.5 text-xs font-bold text-[#E8472A] transition-colors hover:bg-[#E8472A] hover:text-white focus:outline-none focus:ring-4 focus:ring-[#E8472A]/15"
            onClick={(event) => event.stopPropagation()}
          >
            Directions
          </a>
        </div>
      </div>

      {isExpanded ? (
        <div className="mt-3 border-t border-neutral-100 pt-3">
          <div className="grid gap-3 text-xs text-neutral-600 sm:grid-cols-2">
            <div>
              <div className="font-semibold text-neutral-900">Details</div>
              <p className="mt-1 leading-5">{activity.description}</p>
              {activity.address ? <p className="mt-2 text-neutral-500">{activity.address}</p> : null}
            </div>
            <div>
              <div className="font-semibold text-neutral-900">Trust</div>
              <p className="mt-1 leading-5">
                {trustDetails(activity)}
              </p>
              {activity.sourceUrl ? (
                <a
                  href={activity.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex font-semibold text-[#E8472A] underline"
                >
                  View source
                </a>
              ) : null}
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => toggleActivityLock(activity.id)}
              className="rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:border-[#E8472A] hover:text-[#E8472A]"
            >
              {activity.locked ? "Unlock" : "Lock"}
            </button>
            <button
              type="button"
              onClick={() => saveActivity(activity)}
              disabled={isSaved}
              className="rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:border-[#E8472A] hover:text-[#E8472A] disabled:opacity-50"
            >
              {isSaved ? "Saved" : "Save place"}
            </button>
            <button
              type="button"
              onClick={() => removeActivity(activity.id)}
              disabled={activity.locked}
              className="rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:border-red-300 hover:text-red-600 disabled:opacity-50"
            >
              Delete
            </button>
          </div>
          <p className="mt-3 text-[11px] leading-4 text-neutral-400">
            Verify hours, prices, transit, and booking details before travel.
          </p>
        </div>
      ) : null}
    </article>
  );
}

function ActivityThumbnail({ name, photoUrl }: { name: string; photoUrl: string | null }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="relative h-[72px] w-[72px] overflow-hidden rounded-xl bg-neutral-100 md:h-[76px] md:w-24">
      {photoUrl && !failed ? (
        <Image
          src={photoUrl}
          alt={name}
          fill
          sizes="(max-width: 768px) 72px, 96px"
          className="object-cover"
          loading="lazy"
          unoptimized
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-orange-100 via-rose-100 to-sky-100 px-2 text-center text-[10px] font-semibold text-neutral-500">
          {name.split(" ").slice(0, 2).join(" ")}
        </div>
      )}
    </div>
  );
}

function VerificationChip({ activity }: { activity: Activity }) {
  const status = activity.verificationStatus ?? "ai_suggestion";
  const label =
    status === "verified"
      ? "Likely accurate"
      : status === "needs_verification"
        ? "Needs verification"
        : "AI suggestion";
  const className =
    status === "needs_verification"
      ? "bg-amber-50 text-amber-700"
      : status === "verified"
        ? "bg-emerald-50 text-emerald-700"
        : "bg-neutral-100 text-neutral-600";
  return <span className={`rounded-full px-2 py-0.5 font-semibold ${className}`}>{label}</span>;
}

function trustDetails(activity: Activity) {
  if (activity.verificationStatus === "verified") {
    return "Likely accurate, but Wayfarer still recommends checking hours and booking details before travel.";
  }
  if (activity.verificationStatus === "needs_verification") {
    return "Needs verification. Check hours, ticket availability, and transit before relying on this stop.";
  }
  return "AI suggestion. Treat this as a planning idea until you confirm details from an official source.";
}
