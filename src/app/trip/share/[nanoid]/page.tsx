import { GlassCard } from "@/components/ui/GlassCard";
import { buildMockTrip } from "@/lib/trip-schema";

export default async function ShareTripPage({ params }: { params: Promise<{ nanoid: string }> }) {
  const { nanoid } = await params;
  const trip = buildMockTrip("shared Lisbon trip", nanoid);
  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <GlassCard>
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground/55">Public Trip</div>
        <div className="mt-2 text-2xl font-semibold">{trip.name}</div>
        <div className="mt-2 text-sm text-foreground/70">
          Read-only shared itinerary for {trip.destination}. Share ID: {nanoid}
        </div>
        <div className="mt-6 grid gap-4">
          {trip.days.map((day) => (
            <div key={day.id} className="rounded-2xl border border-panel-border bg-white/70 p-4">
              <div className="text-sm font-semibold text-foreground">Day {day.dayNumber}: {day.theme}</div>
              <ul className="mt-3 space-y-2 text-sm text-foreground/70">
                {day.activities.map((activity) => (
                  <li key={activity.id}>
                    <span className="font-semibold text-foreground">{activity.name}</span> · {activity.description}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
