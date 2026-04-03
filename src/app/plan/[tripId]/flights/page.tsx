import { FlightsPanel } from "@/components/flights/FlightsPanel";

export default async function FlightsPage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = await params;
  return (
    <div className="grid gap-4">
      <div className="glass rounded-2xl p-5">
        <div className="text-xs text-foreground/55">Flights</div>
        <div className="mt-1 text-2xl font-semibold">Amadeus flight search</div>
        <div className="mt-2 text-sm text-foreground/70">
          Searches live flight offers (sandbox) and formats results for quick add-to-trip workflows.
        </div>
      </div>
      <FlightsPanel tripId={tripId} />
    </div>
  );
}
