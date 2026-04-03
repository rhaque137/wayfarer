"use client";

import { useMemo, useState } from "react";
import { PlaneTakeoff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { Input } from "@/components/ui/Input";
import { isRecord } from "@/lib/guards";

type FlightOffer = {
  id: string;
  price?: { total?: string; currency?: string };
  itineraries?: Array<{ duration?: string; segments?: Array<{ carrierCode?: string; number?: string }> }>;
};

export function FlightsPanel({ tripId }: { tripId: string }) {
  const [origin, setOrigin] = useState("YYZ");
  const [dest, setDest] = useState("LIS");
  const [depart, setDepart] = useState("2026-09-10");
  const [ret, setRet] = useState("2026-09-20");
  const [adults, setAdults] = useState(2);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<unknown | null>(null);

  const offersSafe: FlightOffer[] = useMemo(() => {
    if (!isRecord(data)) return [];
    const d = data["data"];
    if (!Array.isArray(d)) return [];
    return d as unknown as FlightOffer[];
  }, [data]);

  const search = async () => {
    setBusy(true);
    setError(null);
    setData(null);
    try {
      const res = await fetch("/api/flights", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          originLocationCode: origin,
          destinationLocationCode: dest,
          departureDate: depart,
          returnDate: ret,
          adults,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Flight search failed");
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Flight search failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <GlassCard className="grid gap-4">
      <div className="grid gap-3 md:grid-cols-5">
        <Input value={origin} onChange={(e) => setOrigin(e.target.value.toUpperCase())} placeholder="Origin (IATA)" />
        <Input value={dest} onChange={(e) => setDest(e.target.value.toUpperCase())} placeholder="Destination (IATA)" />
        <Input value={depart} onChange={(e) => setDepart(e.target.value)} placeholder="Departure YYYY-MM-DD" />
        <Input value={ret} onChange={(e) => setRet(e.target.value)} placeholder="Return YYYY-MM-DD" />
        <Input
          value={String(adults)}
          onChange={(e) => setAdults(Number(e.target.value || 1))}
          placeholder="Adults"
          inputMode="numeric"
        />
      </div>
      <div className="flex items-center gap-2">
        <Button onClick={search} disabled={busy}>
          <PlaneTakeoff className="h-4 w-4" />
          Search
        </Button>
        <div className="text-xs text-foreground/50">Trip: {tripId.slice(0, 8)}</div>
      </div>
      {error ? <div className="text-sm text-pink">{error}</div> : null}

      {offersSafe.length ? (
        <div className="grid gap-3">
          {offersSafe.slice(0, 8).map((o) => (
            <div key={o.id} className="hover-lift glass rounded-2xl p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm font-semibold">Offer #{o.id}</div>
                <div className="text-sm text-foreground/80">
                  {o.price?.currency} {o.price?.total}
                </div>
              </div>
              <div className="mt-2 text-xs text-foreground/60">
                {o.itineraries?.map((it, idx) => (
                  <div key={idx}>
                    Itinerary {idx + 1}: {it.duration} •{" "}
                    {(it.segments ?? []).slice(0, 3).map((s) => `${s.carrierCode}${s.number}`).join(" → ")}
                  </div>
                ))}
              </div>
              <div className="mt-3 text-xs text-foreground/50">
                One‑click add-to-itinerary + fare rules summary hooks next.
              </div>
            </div>
          ))}
        </div>
      ) : data ? (
        <pre className="glass overflow-auto rounded-2xl p-4 text-xs text-foreground/70">
          {JSON.stringify(data, null, 2)}
        </pre>
      ) : null}
    </GlassCard>
  );
}
