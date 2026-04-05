"use client";

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
        <div className="flex flex-1 items-center justify-center text-sm text-muted p-8 text-center">
          Describe a trip in the chat to generate your itinerary
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <PanelHeader icon="⭐" label="Itinerary" isCollapsed={false} onToggle={onToggle} />

      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
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
