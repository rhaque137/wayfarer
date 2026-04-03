import { PackingPanel } from "@/components/packing/PackingPanel";

export default async function PackingPage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = await params;
  return (
    <div className="grid gap-4">
      <div className="glass rounded-2xl p-5">
        <div className="text-xs text-foreground/55">Packing</div>
        <div className="mt-1 text-2xl font-semibold">Packing intelligence</div>
        <div className="mt-2 text-sm text-foreground/70">
          AI packing lists tuned to destination, duration, and planned activities (weather-aware hooks next).
        </div>
      </div>
      <PackingPanel tripId={tripId} />
    </div>
  );
}
