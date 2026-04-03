"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Hotel } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { Input } from "@/components/ui/Input";
import { asArray, asNumber, asString, isRecord } from "@/lib/guards";

const HotelsMap = dynamic(() => import("./HotelsMap").then((m) => m.HotelsMap), { ssr: false });

type HotelPin = { id: string; name: string; lat: number; lon: number };

export function HotelsPanel({ tripId }: { tripId: string }) {
  const [cityCode, setCityCode] = useState("LIS");
  const [checkIn, setCheckIn] = useState("2026-09-10");
  const [checkOut, setCheckOut] = useState("2026-09-15");
  const [adults, setAdults] = useState(2);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<unknown | null>(null);

  const pins: HotelPin[] = useMemo(() => {
    const list: HotelPin[] = [];
    if (!isRecord(data)) return list;
    const arr = asArray(data["data"]) ?? [];
    for (const row of arr) {
      if (!isRecord(row)) continue;
      const hotel = isRecord(row["hotel"]) ? row["hotel"] : null;
      if (!hotel) continue;
      const id = asString(hotel["hotelId"]);
      const name = asString(hotel["name"]);
      const geo = isRecord(hotel["geoCode"]) ? hotel["geoCode"] : null;
      const lat = geo ? asNumber(geo["latitude"]) : null;
      const lon = geo ? asNumber(geo["longitude"]) : null;
      if (id && name && lat != null && lon != null) list.push({ id, name, lat, lon });
    }
    return list.slice(0, 30);
  }, [data]);

  const search = async () => {
    setBusy(true);
    setError(null);
    setData(null);
    try {
      const res = await fetch("/api/hotels", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ cityCode, checkInDate: checkIn, checkOutDate: checkOut, adults }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Hotel search failed");
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Hotel search failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <GlassCard className="grid gap-4">
      <div className="grid gap-3 md:grid-cols-5">
        <Input value={cityCode} onChange={(e) => setCityCode(e.target.value.toUpperCase())} placeholder="City (IATA)" />
        <Input value={checkIn} onChange={(e) => setCheckIn(e.target.value)} placeholder="Check-in YYYY-MM-DD" />
        <Input value={checkOut} onChange={(e) => setCheckOut(e.target.value)} placeholder="Check-out YYYY-MM-DD" />
        <Input
          value={String(adults)}
          onChange={(e) => setAdults(Number(e.target.value || 1))}
          placeholder="Adults"
          inputMode="numeric"
        />
        <Button onClick={search} disabled={busy}>
          <Hotel className="h-4 w-4" />
          Search
        </Button>
      </div>

      {error ? <div className="text-sm text-pink">{error}</div> : null}

      <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <div className="grid gap-3">
          {isRecord(data) && Array.isArray(data["data"]) && (data["data"] as unknown[]).length ? (
            (data["data"] as unknown[]).slice(0, 10).map((row, idx) => (
              <div key={idx} className="hover-lift glass rounded-2xl p-4">
                {(() => {
                  const r = isRecord(row) ? row : null;
                  const hotel = r && isRecord(r["hotel"]) ? r["hotel"] : null;
                  const offers = r && asArray(r["offers"]) ? (r["offers"] as unknown[]) : [];
                  const firstOffer = offers.length && isRecord(offers[0]) ? offers[0] : null;
                  const price = firstOffer && isRecord(firstOffer["price"]) ? firstOffer["price"] : null;

                  const name = hotel ? asString(hotel["name"]) : null;
                  const address = hotel && isRecord(hotel["address"]) ? hotel["address"] : null;
                  const city = address ? asString(address["cityName"]) : null;
                  const rating = hotel ? asString(hotel["rating"]) : null;
                  const total = price ? asString(price["total"]) : null;
                  const amenities = hotel && asArray(hotel["amenities"]) ? (hotel["amenities"] as unknown[]) : [];
                  const amenStr = amenities
                    .map((a) => asString(a))
                    .filter((x): x is string => Boolean(x))
                    .slice(0, 4)
                    .join(" • ");
                  return (
                    <>
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-sm font-semibold">{name ?? "Hotel"}</div>
                        <div className="text-xs text-foreground/60">{total ?? ""}</div>
                      </div>
                      <div className="mt-2 text-xs text-foreground/60">
                        {city ?? ""} • {rating ? `${rating}★` : "—"} • {amenStr}
                      </div>
                      <div className="mt-3 text-xs text-foreground/50">
                        AI “why this hotel” + itinerary proximity ranking hooks next.
                      </div>
                    </>
                  );
                })()}
              </div>
            ))
          ) : data ? (
            <pre className="glass overflow-auto rounded-2xl p-4 text-xs text-foreground/70">
              {JSON.stringify(data, null, 2)}
            </pre>
          ) : (
            <div className="glass rounded-2xl p-6 text-sm text-foreground/60">
              Search hotels to populate the map and compare options.
              <div className="mt-2 text-xs text-foreground/50">Trip: {tripId.slice(0, 8)}</div>
            </div>
          )}
        </div>

        <div className="glass overflow-hidden rounded-2xl">
          <HotelsMap pins={pins} />
        </div>
      </div>
    </GlassCard>
  );
}
