"use client";

import Link from "next/link";
import { useState } from "react";
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
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);

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
      <div className="border-b border-neutral-200 bg-white/90 px-4 py-3 backdrop-blur">
        <div className="flex items-start gap-3">
          <div className="min-w-0">
            <div className="truncate text-base font-bold text-neutral-900">
              {trip.title ?? trip.name}
            </div>
            <div className="mt-0.5 text-xs text-neutral-500">
              {trip.days.length} days · {trip.days.reduce((sum, day) => sum + day.activities.length, 0)} places
            </div>
          </div>
          {onToggle ? (
            <button
              onClick={onToggle}
              className="ml-auto hidden rounded-full border border-neutral-200 p-1 text-neutral-500 transition-colors duration-200 hover:border-[#E8472A] hover:text-[#E8472A] md:block"
              aria-label={isCollapsed ? "Expand panel" : "Collapse panel"}
            >
              ‹
            </button>
          ) : null}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-4 pb-28 md:pb-4">
        <div className="sticky top-0 z-20 -mx-4 mb-4 border-b border-neutral-200 bg-[#FAF7F3]/95 px-4 py-2 backdrop-blur">
          <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {trip.days.map((day) => {
              const selected = (selectedDayId ?? trip.days[0]?.id) === day.id;
              return (
                <button
                  key={day.id}
                  type="button"
                  onClick={() => setSelectedDayId(day.id)}
                  className={[
                    "shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-4 focus:ring-[#E8472A]/15",
                    selected
                      ? "bg-[#E8472A] text-white shadow-sm"
                      : "border border-neutral-200 bg-white text-neutral-600 hover:border-[#E8472A] hover:text-[#E8472A]",
                  ].join(" ")}
                  aria-pressed={selected}
                >
                  Day {day.dayNumber}
                </button>
              );
            })}
          </div>
        </div>

        {pendingAIChanges && (
          <AIChangesBanner onAccept={acceptChanges} onReject={rejectChanges} />
        )}

        <div className="space-y-4">
          {trip.days
            .filter((day) => day.id === (selectedDayId ?? trip.days[0]?.id))
            .map((day) => (
              <DayBlock
                key={day.id}
                day={`Day ${day.dayNumber}`}
                date={day.date}
                theme={day.title ?? day.summary}
                activities={day.activities}
                dayColorIndex={trip.days.findIndex((item) => item.id === day.id)}
              />
            ))}
        </div>

        {savedActivities.length > 0 && <SavedActivitiesGrid activities={savedActivities} />}
      </div>
    </div>
  );
}
