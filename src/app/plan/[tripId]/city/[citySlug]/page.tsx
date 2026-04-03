import { CityHub } from "@/components/city/CityHub";

export default async function CityHubPage({
  params,
}: {
  params: Promise<{ tripId: string; citySlug: string }>;
}) {
  const { citySlug } = await params;
  return (
    <div className="grid gap-4">
      <div className="glass rounded-2xl p-5">
        <div className="text-xs text-foreground/55">City How‑To Hub</div>
        <div className="mt-1 text-2xl font-semibold">Destination intelligence dashboard</div>
        <div className="mt-2 text-sm text-foreground/70">
          Getting around, money, safety, etiquette, connectivity, language, health, climate, and visa prompts — powered
          by web‑search‑augmented AI.
        </div>
      </div>
      <CityHub key={citySlug} citySlug={citySlug} />
    </div>
  );
}
