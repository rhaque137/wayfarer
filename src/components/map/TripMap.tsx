"use client";

import mapboxgl from "mapbox-gl";
import { useEffect, useMemo, useRef } from "react";
import { env } from "@/lib/env";

export type TripPin = {
  id: string;
  name: string;
  lat: number;
  lon: number;
  kind?: "attraction" | "activity" | "food" | "hotel";
};

export function TripMap({
  pins,
  activeId,
  onSelect,
}: {
  pins: TripPin[];
  activeId?: string | null;
  onSelect?: (id: string) => void;
}) {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const token = env.client.NEXT_PUBLIC_MAPBOX_TOKEN ?? process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  const center = useMemo(() => {
    if (!pins.length) return { lat: 53.3498, lon: -6.2603 }; // Dublin fallback
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
      zoom: pins.length ? 12 : 10,
      attributionControl: false,
    });
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "bottom-right");
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

    const markers: mapboxgl.Marker[] = [];
    for (const p of pins) {
      const el = document.createElement("div");
      el.style.width = p.id === activeId ? "14px" : "10px";
      el.style.height = p.id === activeId ? "14px" : "10px";
      el.style.borderRadius = "999px";
      el.style.background = p.id === activeId ? "#00E5FF" : "rgba(0,229,255,0.85)";
      el.style.boxShadow = p.id === activeId ? "0 0 22px rgba(0,229,255,0.55)" : "0 0 14px rgba(0,229,255,0.35)";
      el.style.border = "1px solid rgba(0,229,255,0.55)";

      el.addEventListener("click", () => onSelect?.(p.id));

      const marker = new mapboxgl.Marker({ element: el }).setLngLat([p.lon, p.lat]).setPopup(
        new mapboxgl.Popup({ closeButton: false, offset: 14 }).setText(p.name),
      );
      marker.addTo(map);
      markers.push(marker);
    }

    if (pins.length) {
      const bounds = new mapboxgl.LngLatBounds();
      pins.forEach((p) => bounds.extend([p.lon, p.lat]));
      map.fitBounds(bounds, { padding: 60, duration: 450 });
    }

    return () => markers.forEach((m) => m.remove());
  }, [pins, activeId, onSelect]);

  useEffect(() => {
    if (!activeId) return;
    const map = mapRef.current;
    if (!map) return;
    const match = pins.find((p) => p.id === activeId);
    if (!match) return;
    map.flyTo({ center: [match.lon, match.lat], zoom: 13, duration: 650 });
  }, [activeId, pins]);

  if (!token) {
    return (
      <div className="flex h-[640px] items-center justify-center p-6 text-sm text-foreground/60">
        Set `NEXT_PUBLIC_MAPBOX_TOKEN` to enable the map panel.
      </div>
    );
  }

  return <div ref={containerRef} className="h-[640px] w-full" />;
}
