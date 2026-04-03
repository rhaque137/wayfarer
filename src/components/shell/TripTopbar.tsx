import { GlassCard } from "@/components/ui/GlassCard";

export type TripMeta = {
  title: string;
  chips: string[];
};

export function TripTopbar({ meta }: { meta: TripMeta }) {
  return (
    <GlassCard className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <div className="text-xs text-foreground/55">Trip</div>
        <div className="mt-1 text-2xl font-semibold">{meta.title}</div>
        <div className="mt-3 flex flex-wrap gap-2">
          {meta.chips.map((c) => (
            <span key={c} className="glass rounded-full px-3 py-1 text-xs text-foreground/70">
              {c}
            </span>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="glass rounded-xl px-3 py-2 text-xs text-foreground/70">Invite</span>
        <span className="glass rounded-xl px-3 py-2 text-xs text-foreground/70">Share</span>
      </div>
    </GlassCard>
  );
}

