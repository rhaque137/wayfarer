"use client";

import { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";

type Intel = {
  city: string;
  summary: string;
  gettingAround: string[];
  transportBooking: string[];
  money: string[];
  safety: string[];
  cultureEtiquette: string[];
  connectivity: string[];
  languageToolkit: string[];
  health: string[];
  bestTimeToVisit: string[];
  visaInfo: string[];
};

type Weather = {
  city?: string;
  daily?: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
  };
};

function titleFromSlug(slug: string) {
  return slug
    .split("-")
    .map((s) => (s ? s[0].toUpperCase() + s.slice(1) : s))
    .join(" ");
}

function Section({ title, items }: { title: string; items: string[] }) {
  return (
    <GlassCard className="hover-lift">
      <div className="text-xs text-foreground/55">{title}</div>
      <ul className="mt-3 space-y-2 text-sm text-foreground/80">
        {items.map((it) => (
          <li key={it} className="flex gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan" />
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </GlassCard>
  );
}

function WeatherWidget({ weather }: { weather: Weather }) {
  if (!weather?.daily) return null;

  const { time, temperature_2m_max, temperature_2m_min } = weather.daily;

  return (
    <GlassCard className="col-span-full mb-4">
      <div className="text-xs text-foreground/55 mb-4">14-Day Forecast</div>
      <div className="flex overflow-x-auto gap-4 pb-2 snap-x">
        {time.map((dateStr, i) => {
          const date = new Date(dateStr);
          const max = Math.round(temperature_2m_max[i]);
          const min = Math.round(temperature_2m_min[i]);
          return (
            <div key={dateStr} className="flex flex-col items-center justify-center min-w-[70px] snap-start bg-foreground/5 rounded-xl p-3">
              <span className="text-xs text-foreground/70">{date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
              <span className="text-[10px] text-foreground/40 mb-2">{date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              <span className="font-medium text-sm">{max}°</span>
              <span className="text-xs text-foreground/55">{min}°</span>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}

export function CityHub({ citySlug }: { citySlug: string }) {
  const [intel, setIntel] = useState<Intel | null>(null);
  const [weather, setWeather] = useState<Weather | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    let active = true;
    const city = titleFromSlug(citySlug);

    const fetchIntel = fetch("/api/city-intel", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ city }),
    })
      .then((r) => r.json().then((j) => ({ ok: r.ok, j })))
      .then((res) => {
        if (!active) return;
        if (!res.ok) {
          setError(res.j?.error ?? "Failed to load city intel");
          return;
        }
        setIntel(res.j.intel);
      })
      .catch((e) => {
        if (active) setError(e instanceof Error ? e.message : "Failed to load city intel");
      });

    const fetchWeather = fetch("/api/weather", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ city }),
    })
      .then((r) => r.json().then((j) => ({ ok: r.ok, j })))
      .then((res) => {
        if (!active) return;
        if (res.ok && res.j?.daily) {
          setWeather(res.j);
        }
      })
      .catch((e) => console.error("Failed to load weather:", e));

    Promise.allSettled([fetchIntel, fetchWeather]).finally(() => {
      if (active) setBusy(false);
    });

    return () => {
      active = false;
    };
  }, [citySlug]);

  if (busy) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="glass h-40 animate-pulse rounded-2xl" />
        ))}
      </div>
    );
  }

  if (error && !intel && !weather) return <div className="text-sm text-pink">{error}</div>;

  return (
    <div className="grid gap-4">
      {error && !intel && (
        <GlassCard className="border-pink/50 bg-pink/5">
          <div className="text-sm text-pink/80">
            {error}. The 14-day weather forecast is available below.
          </div>
        </GlassCard>
      )}

      {weather && <WeatherWidget weather={weather} />}

      {intel && (
        <>
          <GlassCard>
            <div className="text-xs text-foreground/55">{intel.city}</div>
            <div className="mt-2 text-lg text-foreground/80">{intel.summary}</div>
          </GlassCard>

      <div className="grid gap-4 md:grid-cols-2">
        <Section title="Getting Around" items={intel.gettingAround} />
        <Section title="Transport Booking" items={intel.transportBooking} />
        <Section title="Money" items={intel.money} />
        <Section title="Safety" items={intel.safety} />
        <Section title="Culture & Etiquette" items={intel.cultureEtiquette} />
        <Section title="Connectivity" items={intel.connectivity} />
        <Section title="Language Toolkit" items={intel.languageToolkit} />
        <Section title="Health" items={intel.health} />
        <Section title="Best Time to Visit" items={intel.bestTimeToVisit} />
            <Section title="Visa Info" items={intel.visaInfo} />
          </div>
        </>
      )}
    </div>
  );
}
