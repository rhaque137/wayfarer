"use client";

import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import { Activity, useTripStore } from "@/store/tripStore";
import { getActivityPhotoUrl } from "@/lib/activity-media";

type Props = {
  activity: Activity;
  index: number;
  destination?: string;
  pinColor?: string;
};

const PRICE_LEVELS: Record<string, string> = {
  "$": "$",
  "$$": "$$",
  "$$$": "$$$",
  "$$$$": "$$$$",
};

function costToPrice(cost?: number): string | null {
  if (cost == null) return null;
  if (cost <= 15) return "$";
  if (cost <= 35) return "$$";
  if (cost <= 70) return "$$$";
  return "$$$$";
}

export function ItineraryPlaceCard({ activity, index, destination, pinColor }: Props) {
  const {
    trip,
    activeActivityId,
    setActiveActivityId,
    removeActivity,
    toggleActivityLock,
    moveActivity,
    updateActivity,
  } = useTripStore();
  const [showOverflow, setShowOverflow] = useState(false);
  const [showMoveMenu, setShowMoveMenu] = useState(false);
  const [editingNote, setEditingNote] = useState(false);
  const [noteValue, setNoteValue] = useState(activity.notes ?? "");
  const overflowRef = useRef<HTMLDivElement>(null);
  const isActive = activeActivityId === activity.id;
  const hasCoords = activity.lat != null && activity.lng != null;
  const photoUrl = getActivityPhotoUrl(activity, destination) ?? null;
  const priceLevel = (activity as Activity & { priceLevel?: string }).priceLevel ?? costToPrice(activity.estimatedCost);
  const otherDays = trip?.days.filter((d) => !d.activities.some((a) => a.id === activity.id)) ?? [];

  const mapsUrl = useMemo(() => {
    if (hasCoords) {
      return `https://www.google.com/maps/search/?api=1&query=${activity.lat},${activity.lng}`;
    }
    const q = activity.name + (activity.address ? ` ${activity.address}` : "");
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
  }, [activity.name, activity.address, activity.lat, activity.lng, hasCoords]);

  const area = (activity as Activity & { area?: string }).area ?? activity.locationName ?? activity.address;
  const reason = activity.description || activity.notes || "Details need a quick check before you go.";

  const closeMenus = () => {
    setShowOverflow(false);
    setShowMoveMenu(false);
  };

  return (
    <article
      id={`activity-${activity.id}`}
      className={[
        "group relative rounded-2xl border bg-white shadow-sm transition-[border-color,box-shadow] duration-200 hover:border-neutral-300 hover:shadow-md",
        isActive ? "border-[#E8472A] ring-4 ring-[#E8472A]/10" : "border-neutral-200",
      ].join(" ")}
      onMouseEnter={() => { if (hasCoords) setActiveActivityId(activity.id); }}
      onFocus={() => { if (hasCoords) setActiveActivityId(activity.id); }}
    >
      <div className="flex gap-3 p-3">
        {/* Pin number */}
        <button
          type="button"
          onClick={() => { if (hasCoords) setActiveActivityId(isActive ? null : activity.id); }}
          className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white focus:outline-none focus:ring-4 focus:ring-[#E8472A]/15"
          style={{ backgroundColor: pinColor ?? "#E8472A" }}
          aria-label={`Focus pin ${index + 1}`}
        >
          {index + 1}
        </button>

        {/* Main content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <span className="flex-1 truncate text-sm font-bold text-neutral-950 md:text-base">
              {activity.name}
            </span>
            {activity.locked ? (
              <span className="mt-0.5 flex-shrink-0 rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold text-neutral-600">
                Locked
              </span>
            ) : null}
          </div>

          <p className="mt-1 line-clamp-2 text-xs leading-5 text-neutral-600 md:text-sm">{reason}</p>

          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-neutral-500">
            {area ? <span className="truncate max-w-[140px]">{area}</span> : null}
            {activity.durationMinutes ? (
              <>
                {area ? <span aria-hidden>·</span> : null}
                <span>{activity.durationMinutes} min</span>
              </>
            ) : null}
            {priceLevel ? (
              <>
                <span aria-hidden>·</span>
                <span className="font-medium text-neutral-600">{PRICE_LEVELS[priceLevel] ?? priceLevel}</span>
              </>
            ) : null}
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <VerificationChip activity={activity} />
            <CategoryChip category={activity.category} />
            {!hasCoords ? (
              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                Missing location
              </span>
            ) : null}
          </div>
        </div>

        {/* Right column: thumbnail + directions */}
        <div ref={overflowRef} className="relative flex w-[72px] flex-shrink-0 flex-col items-stretch gap-2 md:w-24">
          <ActivityThumbnail name={activity.name} photoUrl={photoUrl} />
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full rounded-full bg-[#F5EAE6] px-2 py-1 text-center text-[10px] font-bold text-[#E8472A] transition-colors hover:bg-[#E8472A] hover:text-white focus:outline-none focus:ring-4 focus:ring-[#E8472A]/15 md:text-[11px]"
            onClick={(e) => e.stopPropagation()}
          >
            Directions
          </a>
          <button
            type="button"
            onClick={() => { setShowOverflow((v) => !v); setShowMoveMenu(false); }}
            className="flex h-8 w-full items-center justify-center rounded-full border border-neutral-200 bg-white text-sm font-bold text-neutral-500 shadow-sm transition-colors hover:border-[#E8472A] hover:text-[#E8472A] focus:outline-none focus:ring-4 focus:ring-[#E8472A]/15"
            aria-label={`More actions for ${activity.name}`}
            aria-expanded={showOverflow}
          >
            •••
          </button>

          {showOverflow && (
            <div className="absolute right-0 top-full z-50 mt-2 min-w-[180px] rounded-2xl border border-neutral-200 bg-white p-1.5 shadow-xl">
              {!editingNote && (
                <OverflowItem
                  label="Edit note"
                  onClick={() => { setEditingNote(true); setNoteValue(activity.notes ?? activity.description ?? ""); closeMenus(); }}
                />
              )}
              {otherDays.length > 0 && (
                <div className="relative">
                  <OverflowItem
                    label="Move to day…"
                    onClick={() => setShowMoveMenu((v) => !v)}
                    trailing="›"
                  />
                  {showMoveMenu && (
                    <div className="absolute bottom-0 right-[calc(100%+4px)] z-50 min-w-[140px] rounded-2xl border border-neutral-200 bg-white p-1.5 shadow-xl">
                      {otherDays.map((d) => (
                        <OverflowItem
                          key={d.id}
                          label={`Day ${d.dayNumber}`}
                          onClick={() => { moveActivity(activity.id, d.id); closeMenus(); }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
              <OverflowItem
                label={activity.locked ? "Unlock" : "Lock"}
                onClick={() => { toggleActivityLock(activity.id); closeMenus(); }}
              />
              <div className="my-1 border-t border-neutral-100" />
              <OverflowItem
                label="Delete"
                danger
                disabled={activity.locked}
                onClick={() => { removeActivity(activity.id); closeMenus(); }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Inline note editor */}
      {editingNote && (
        <div className="border-t border-neutral-100 p-3">
          <textarea
            value={noteValue}
            onChange={(e) => setNoteValue(e.target.value)}
            rows={3}
            autoFocus
            className="w-full resize-none rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-800 outline-none focus:border-[#E8472A] focus:ring-2 focus:ring-[#E8472A]/15"
            placeholder="Add a personal note..."
          />
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={() => { updateActivity(activity.id, { notes: noteValue }); setEditingNote(false); }}
              className="rounded-full bg-[#E8472A] px-3 py-1.5 text-xs font-bold text-white hover:opacity-90"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setEditingNote(false)}
              className="rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:border-neutral-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </article>
  );
}

function OverflowItem({
  label,
  onClick,
  danger = false,
  disabled = false,
  trailing,
}: {
  label: string;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
  trailing?: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={[
        "flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-semibold transition-colors",
        danger ? "text-red-600 hover:bg-red-50 disabled:opacity-40" : "text-neutral-700 hover:bg-neutral-50 disabled:opacity-40",
      ].join(" ")}
    >
      {label}
      {trailing ? <span className="text-neutral-400">{trailing}</span> : null}
    </button>
  );
}

function ActivityThumbnail({ name, photoUrl }: { name: string; photoUrl: string | null }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="relative h-[72px] w-full overflow-hidden rounded-xl bg-neutral-100 md:h-[76px]">
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
    status === "verified" ? "Likely accurate"
    : status === "needs_verification" ? "Needs verification"
    : "AI suggestion";
  const cls =
    status === "needs_verification" ? "bg-amber-50 text-amber-700"
    : status === "verified" ? "bg-emerald-50 text-emerald-700"
    : "bg-neutral-100 text-neutral-600";
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${cls}`}>{label}</span>;
}

function CategoryChip({ category }: { category?: string }) {
  if (!category || category.toLowerCase() === "activity" || category.toLowerCase() === "other") return null;
  return (
    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
      {category}
    </span>
  );
}
