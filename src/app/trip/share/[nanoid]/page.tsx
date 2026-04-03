import { GlassCard } from "@/components/ui/GlassCard";

export default async function ShareTripPage({ params }: { params: Promise<{ nanoid: string }> }) {
  const { nanoid } = await params;
  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <GlassCard>
        <div className="text-xs text-foreground/55">Public Trip</div>
        <div className="mt-2 text-2xl font-semibold">Wayfarer share view</div>
        <div className="mt-2 text-sm text-foreground/70">Share ID: {nanoid}</div>
      </GlassCard>
    </div>
  );
}

