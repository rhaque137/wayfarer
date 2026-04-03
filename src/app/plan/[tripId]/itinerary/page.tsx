import { ItineraryBoard } from "@/components/itinerary/ItineraryBoard";
import { GlassCard } from "@/components/ui/GlassCard";

export default async function ItineraryPage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = await params;
  return (
    <div className="grid gap-4">
      <GlassCard>
        <div className="text-xs text-foreground/55">Itinerary</div>
        <div className="mt-1 text-2xl font-semibold">Drag-and-drop day planner</div>
        <div className="mt-2 text-sm text-foreground/70">
          Drag cards from chat into morning/afternoon/evening. AI optimization hooks are ready.
        </div>
      </GlassCard>
      <ItineraryBoard tripId={tripId} initialSpec={null} />
    </div>
  );
}

