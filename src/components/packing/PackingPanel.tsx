"use client";

import { useState } from "react";
import { CheckSquare2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { Input } from "@/components/ui/Input";

export function PackingPanel({ tripId }: { tripId: string }) {
  const [destination, setDestination] = useState("Lisbon");
  const [durationDays, setDurationDays] = useState(10);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Record<string, string[]> | null>(null);

  const generate = async () => {
    setBusy(true);
    setError(null);
    setData(null);
    try {
      const res = await fetch("/api/packing", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ destination, durationDays, activities: ["walking tours", "food markets"] }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Packing generation failed");
      setData(json.packing as Record<string, string[]>);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Packing generation failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <GlassCard className="grid gap-4">
      <div className="grid gap-3 md:grid-cols-3">
        <Input value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Destination" />
        <Input
          value={String(durationDays)}
          onChange={(e) => setDurationDays(Number(e.target.value || 1))}
          placeholder="Duration (days)"
          inputMode="numeric"
        />
        <Button onClick={generate} disabled={busy}>
          <CheckSquare2 className="h-4 w-4" />
          Generate
        </Button>
      </div>
      {error ? <div className="text-sm text-pink">{error}</div> : null}
      {data ? (
        <div className="grid gap-3 md:grid-cols-2">
          {Object.entries(data as Record<string, string[]>).map(([k, v]) => (
            <div key={k} className="glass rounded-2xl p-4">
              <div className="text-xs text-foreground/55">{k}</div>
              <ul className="mt-2 space-y-1 text-sm text-foreground/80">
                {v.map((it) => (
                  <li key={it} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan" />
                    {it}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-sm text-foreground/60">Trip: {tripId.slice(0, 8)}</div>
      )}
    </GlassCard>
  );
}
