import { env } from "@/lib/env";

export async function getWeather(args: Record<string, unknown>) {
  const apiKey = env.server.ACCUWEATHER_API_KEY;
  const city = String(args.city ?? "");
  if (!apiKey || !city) {
    return { ok: false, error: "AccuWeather not configured" };
  }

  const locationRes = await fetch(
    `http://dataservice.accuweather.com/locations/v1/cities/search?q=${encodeURIComponent(city)}&apikey=${apiKey}`,
    { cache: "no-store" },
  );
  const locations = await locationRes.json().catch(() => []);
  const locationKey = locations?.[0]?.Key;
  if (!locationKey) return { ok: false, error: "City not found" };

  const currentRes = await fetch(
    `http://dataservice.accuweather.com/currentconditions/v1/${locationKey}?apikey=${apiKey}&details=true`,
    { cache: "no-store" },
  );
  const current = await currentRes.json().catch(() => []);

  const forecastRes = await fetch(
    `http://dataservice.accuweather.com/forecasts/v1/daily/5day/${locationKey}?apikey=${apiKey}&metric=true`,
    { cache: "no-store" },
  );
  const forecast = await forecastRes.json().catch(() => ({}));

  return {
    ok: true,
    current: current?.[0] ?? null,
    forecast,
  };
}

