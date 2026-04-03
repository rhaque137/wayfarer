"use client";

import { useState } from "react";
import { DollarSign } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { Input } from "@/components/ui/Input";

export function BudgetPanel({ tripId }: { tripId: string }) {
  const [city, setCity] = useState("Lisbon");
  const [baseCurrency, setBaseCurrency] = useState("CAD");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<unknown | null>(null);

  const load = async () => {
    setBusy(true);
    setError(null);
    setData(null);
    try {
      const res = await fetch("/api/budget", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ city, baseCurrency }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Budget load failed");
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Budget load failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <GlassCard className="grid gap-4">
      <div className="grid gap-3 md:grid-cols-3">
        <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" />
        <Input value={baseCurrency} onChange={(e) => setBaseCurrency(e.target.value.toUpperCase())} placeholder="Base currency" />
        <Button onClick={load} disabled={busy}>
          <DollarSign className="h-4 w-4" />
          Load intel
        </Button>
      </div>
      {error ? <div className="text-sm text-pink">{error}</div> : null}
      {data ? (
        <pre className="glass overflow-auto rounded-2xl p-4 text-xs text-foreground/70">
          {JSON.stringify({ tripId, data }, null, 2)}
        </pre>
      ) : (
        <div className="text-sm text-foreground/60">
          Configure `NUMBEO_API_KEY` + `EXCHANGERATE_API_KEY` for live budget data.
        </div>
      )}
    </GlassCard>
  );
}
