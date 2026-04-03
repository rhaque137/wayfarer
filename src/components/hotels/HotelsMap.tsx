"use client";

import mapboxgl from "mapbox-gl";
import { useEffect, useMemo, useRef } from "react";
import { env } from "@/lib/env";

type Pin = { id: string; name: string; lat: number; lon: number };

export function HotelsMap({ pins }: { pins: Pin[] }) {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const token = env.client.NEXT_PUBLIC_MAPBOX_TOKEN ?? process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  const center = useMemo(() => {
    if (!pins.length) return { lat: 38.7223, lon: -9.1393 }; // Lisbon fallback
    const p = pins[0];
    return { lat: p.lat, lon: p.lon };
  }, [pins]);

  useEffect(() => {
    if (!containerRef.current) return;
    if (!token) return;
    mapboxgl.accessToken = token;

    if (mapRef.current) return;
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/navigation-night-v1",
      center: [center.lon, center.lat],
      zoom: pins.length ? 11 : 10,
      attributionControl: false,
    });

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (!pins.length) return;

    const markers: mapboxgl.Marker[] = [];
    for (const p of pins) {
      const el = document.createElement("div");
      el.style.width = "10px";
      el.style.height = "10px";
      el.style.borderRadius = "999px";
      el.style.background = "#00E5FF";
      el.style.boxShadow = "0 0 16px rgba(0,229,255,0.45)";
      el.style.border = "1px solid rgba(0,229,255,0.55)";

      const marker = new mapboxgl.Marker({ element: el }).setLngLat([p.lon, p.lat]).setPopup(
        new mapboxgl.Popup({ closeButton: false, offset: 14 }).setText(p.name),
      );
      marker.addTo(map);
      markers.push(marker);
    }

    return () => {
      markers.forEach((m) => m.remove());
    };
  }, [pins]);

  if (!token) {
    return (
      <div className="flex h-[420px] items-center justify-center p-6 text-sm text-foreground/60">
        Set `NEXT_PUBLIC_MAPBOX_TOKEN` to enable the hotel map.
      </div>
    );
  }

  return <div ref={containerRef} className="h-[420px] w-full" />;
}

