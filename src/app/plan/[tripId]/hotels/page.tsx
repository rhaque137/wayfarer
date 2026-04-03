import { HotelsPanel } from "@/components/hotels/HotelsPanel";

export default async function HotelsPage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = await params;
  return (
    <div className="grid gap-4">
      <div className="glass rounded-2xl p-5">
        <div className="text-xs text-foreground/55">Hotels</div>
        <div className="mt-1 text-2xl font-semibold">Amadeus hotel intelligence</div>
        <div className="mt-2 text-sm text-foreground/70">
          Searches hotels (sandbox), ranks for your itinerary, and plots results on Mapbox dark map.
        </div>
      </div>
      <HotelsPanel tripId={tripId} />
    </div>
  );
}
