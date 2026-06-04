"use client";

import Link from "next/link";
import { PanelHeader } from "@/components/ui/PanelHeader";
import { AIChangesBanner } from "@/components/itinerary/AIChangesBanner";
import { DayBlock } from "@/components/itinerary/DayBlock";
import { SavedActivitiesGrid } from "@/components/itinerary/SavedActivitiesGrid";
import { useTripStore } from "@/store/tripStore";

export function ItineraryPanel({
  isCollapsed = false,
  onToggle,
}: {
  isCollapsed?: boolean;
  onToggle?: () => void;
}) {
  const { trip, pendingAIChanges, savedActivities, acceptChanges, rejectChanges } = useTripStore();

  if (isCollapsed) {
    return <PanelHeader icon="⭐" label="Itinerary" isCollapsed onToggle={onToggle} />;
  }

  if (!trip) {
    return (
      <div className="flex h-full flex-col">
        <PanelHeader icon="⭐" label="Itinerary" isCollapsed={false} onToggle={onToggle} />
        <div className="flex flex-1 items-center justify-center p-8 text-center">
          <div className="max-w-xs">
            <div className="text-sm font-semibold text-neutral-900">No itinerary loaded yet</div>
            <div className="mt-2 text-sm text-neutral-500">
              Describe a trip in chat, edit your prompt, or return home to start over.
            </div>
            <Link
              href="/"
              className="mt-4 inline-flex rounded-full bg-[#E8472A] px-4 py-2 text-xs font-semibold text-white focus:outline-none focus:ring-4 focus:ring-[#E8472A]/25"
            >
              Back home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="border-b border-neutral-200 bg-white/80 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-semibold text-neutral-700 transition-all duration-200 hover:border-[#E8472A] hover:text-[#E8472A]"
            aria-label="Back to home"
          >
            Home
          </Link>
          <div className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
            <span className="text-neutral-500">⭐</span>
            Itinerary
          </div>
          {onToggle ? (
            <button
              onClick={onToggle}
              className="ml-auto rounded-full border border-neutral-200 p-1 text-neutral-500 transition-all duration-200 hover:border-[#E8472A] hover:text-[#E8472A]"
              aria-label={isCollapsed ? "Expand panel" : "Collapse panel"}
            >
              ‹
            </button>
          ) : null}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
        <div className="md:hidden">
          <div className="text-xs font-semibold tracking-[0.2em] text-[#E8472A]">CURRENT JOURNEY</div>
          <div className="mt-2 text-2xl font-bold text-neutral-900">{trip.destination}</div>
          <div className="text-sm text-neutral-600">{trip.name}</div>
          <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
            {trip.days.map((day, idx) => (
              <div
                key={day.id}
                className={[
                  "min-w-[64px] rounded-2xl px-3 py-2 text-center text-xs font-semibold",
                  idx === 0
                    ? "bg-[#E8472A] text-white shadow-sm"
                    : "bg-white text-neutral-600 border border-neutral-200",
                ].join(" ")}
              >
                DAY {day.dayNumber}
              </div>
            ))}
          </div>
        </div>

        {pendingAIChanges && (
          <AIChangesBanner onAccept={acceptChanges} onReject={rejectChanges} />
        )}

        {trip.days.map((day, dayIdx) => (
          <DayBlock
            key={day.id}
            day={`DAY ${day.dayNumber}`}
            date={day.date}
            activities={day.activities}
            dayColorIndex={dayIdx}
          />
        ))}

        {savedActivities.length > 0 && <SavedActivitiesGrid activities={savedActivities} />}
      </div>
    </div>
  );
}
