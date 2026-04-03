import { BudgetPanel } from "@/components/budget/BudgetPanel";

export default async function BudgetPage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = await params;
  return (
    <div className="grid gap-4">
      <div className="glass rounded-2xl p-5">
        <div className="text-xs text-foreground/55">Budget</div>
        <div className="mt-1 text-2xl font-semibold">Cost intelligence</div>
        <div className="mt-2 text-sm text-foreground/70">
          Numbeo‑based daily estimates + currency conversion. Trips roll up into a live budget dashboard.
        </div>
      </div>
      <BudgetPanel tripId={tripId} />
    </div>
  );
}
