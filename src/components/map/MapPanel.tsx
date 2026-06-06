"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import mapboxgl from "mapbox-gl";
import { useTripStore } from "@/store/tripStore";
import { PanelHeader } from "@/components/ui/PanelHeader";
import { useMapboxCss } from "@/lib/mapbox-css";
import { getActivityPhotoUrl } from "@/lib/activity-media";

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";
const DAY_COLORS = ["#E8472A", "#7C4DFF", "#FF4DB1", "#F4A261", "#2A9D8F", "#E76F51"];

// ── Custom dark-glass zoom control ──────────────────────────────────────────
class LightZoomControl implements mapboxgl.IControl {
  private container!: HTMLDivElement;
  private map!: mapboxgl.Map;

  onAdd(map: mapboxgl.Map) {
    this.map = map;
    this.container = document.createElement("div");
    this.container.style.cssText = `
      position: absolute;
      top: 12px;
      right: 12px;
      display: flex;
      flex-direction: column;
      gap: 4px;
      z-index: 10;
    `;

    const btn = (label: string, onClick: () => void) => {
      const b = document.createElement("button");
      b.textContent = label;
      b.style.cssText = `
        width: 34px;
        height: 34px;
        border-radius: 10px;
        background: rgba(255,255,255,0.95);
        backdrop-filter: blur(8px);
        border: 1px solid rgba(232,71,42,0.2);
        color: ${DAY_COLORS[0]};
        font-size: 18px;
        line-height: 1;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.15s, border-color 0.15s;
      `;
      b.addEventListener("mouseenter", () => {
        b.style.background = "rgba(232,71,42,0.08)";
        b.style.borderColor = "rgba(232,71,42,0.5)";
      });
      b.addEventListener("mouseleave", () => {
        b.style.background = "rgba(255,255,255,0.95)";
        b.style.borderColor = "rgba(232,71,42,0.2)";
      });
      b.addEventListener("click", onClick);
      return b;
    };

    this.container.appendChild(btn("+", () => this.map.zoomIn()));
    this.container.appendChild(btn("−", () => this.map.zoomOut()));
    return this.container;
  }

  onRemove() {
    this.container.remove();
  }
}

function normalizeCoords<T extends { lat?: number; lng?: number }>(act: T): T {
  const source = act as T & {
    latitude?: number | string;
    longitude?: number | string;
    location?: {
      lat?: number | string;
      lng?: number | string;
      latitude?: number | string;
      longitude?: number | string;
    };
    coordinates?: [number | string, number | string];
  };
  const fallbackLat = source.latitude ?? source.location?.lat ?? source.location?.latitude;
  const fallbackLng = source.longitude ?? source.location?.lng ?? source.location?.longitude;
  const coords = Array.isArray(source.coordinates) ? source.coordinates : null;
  const rawLat = act.lat ?? fallbackLat ?? (coords ? coords[1] : undefined);
  const rawLng = act.lng ?? fallbackLng ?? (coords ? coords[0] : undefined);
  const lat = typeof rawLat === "string" ? Number(rawLat) : rawLat;
  const lng = typeof rawLng === "string" ? Number(rawLng) : rawLng;
  if (lat == null || lng == null || Number.isNaN(lat) || Number.isNaN(lng)) {
    return { ...act, lat: undefined, lng: undefined };
  }
  if (Math.abs(lat) > 90 && Math.abs(lng) <= 90) {
    return { ...act, lat: lng, lng: lat };
  }
  if (Math.abs(lng) > 180 || Math.abs(lat) > 90) {
    return { ...act, lat: undefined, lng: undefined };
  }
  return { ...act, lat, lng };
}

function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function dedupeActivities<T extends { id?: string; name?: string; lat?: number; lng?: number }>(items: T[]) {
  const groups = new Map<string, { item: T; ids: string[] }>();
  for (const item of items) {
    if (item.lat == null || item.lng == null) continue;
    const nameKey = (item.name ?? "").toLowerCase().replace(/[^a-z0-9\s]/g, "").trim();
    const coordKey = `${item.lat.toFixed(4)}|${item.lng.toFixed(4)}`;
    const key = nameKey || coordKey;
    const id = item.id ?? coordKey;
    const existing = groups.get(key);
    if (existing) {
      existing.ids.push(id);
    } else {
      groups.set(key, { item, ids: [id] });
    }
  }
  return Array.from(groups.values()).map((g) => ({ ...g.item, _groupIds: g.ids }));
}

// ── Component ────────────────────────────────────────────────────────────────
export function MapPanel({
  isCollapsed = false,
  onToggle,
}: {
  isCollapsed?: boolean;
  onToggle?: () => void;
}) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const popupsRef = useRef<Map<string, mapboxgl.Popup>>(new Map());
  const renderIdRef = useRef(0);
  const locationsRef = useRef<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const { trip, activeActivityId, setActiveActivityId } = useTripStore();
  useMapboxCss(Boolean(TOKEN) && !isCollapsed);
  const selectIndex = useCallback(
    (idx: number | null) => {
      if (idx == null) {
        setSelectedIndex(null);
        setActiveActivityId(null);
        return;
      }
      setSelectedIndex(idx);
      const loc = locationsRef.current[idx];
      if (loc?.id) setActiveActivityId(loc.id);
    },
    [setActiveActivityId]
  );
  const selectById = useCallback(
    (id: string | null | undefined) => {
      if (!id) return selectIndex(null);
      const idx = locationsRef.current.findIndex((l) => l.id === id);
      if (idx === -1) return;
      selectIndex(idx);
    },
    [selectIndex]
  );

  // ── Init / teardown map ───────────────────────────────────────────────────
  useEffect(() => {
    if (isCollapsed) {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
      return;
    }
    if (map.current || !mapContainer.current || !TOKEN) return;

    mapboxgl.accessToken = TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [0, 20],
      zoom: 1.8,
      attributionControl: false,
    });

    map.current.addControl(new mapboxgl.AttributionControl({ compact: true }), "bottom-right");
    map.current.addControl(new LightZoomControl());
    map.current.on("load", () => map.current?.resize());

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [isCollapsed]);

  // ── Markers helper ───────────────────────────────────────────────────────
  const clearMarkers = useCallback(() => {
    markersRef.current.forEach((m) => m.remove());
    popupsRef.current.forEach((p) => p.remove());
    markersRef.current.clear();
    popupsRef.current.clear();
  }, []);

  // ── Rebuild markers when trip changes ────────────────────────────────────
  useEffect(() => {
    if (isCollapsed) return;
    if (!map.current || !trip) return;
    const renderId = ++renderIdRef.current;

    clearMarkers();

    const activitiesRaw = trip.days
      .flatMap((d, dayIdx) =>
        d.activities.map((act, actIdx) => ({
          ...act,
          _dayIdx: dayIdx,
          _actIdx: actIdx,
        })),
      )
      .map((a) => normalizeCoords(a))
      .filter((a) => a.lat != null && a.lng != null);
    const activitiesDeduped = dedupeActivities(activitiesRaw);
    if (activitiesDeduped.length === 0) return;

    const applyMarkers = (activities: typeof activitiesRaw) => {
      if (renderId !== renderIdRef.current) return;
      clearMarkers();
      locationsRef.current = activities;
      setLocations(activities);
      if (activities.length === 0) return;

      // Fly to destination at zoom 11
      map.current!.flyTo({
        center: [activities[0].lng!, activities[0].lat!],
        zoom: 11,
        duration: 2400,
        essential: true,
      });

      // Fit all markers after initial fly completes
      if (activities.length > 1) {
        map.current!.once("moveend", () => {
          if (!map.current) return;
          const bounds = new mapboxgl.LngLatBounds();
          activities.forEach((a) => bounds.extend([a.lng!, a.lat!]));
          map.current.fitBounds(bounds, { padding: 64, maxZoom: 13, duration: 1000 });
        });
      }

      activities.forEach((act, i) => {
        const pinColor = DAY_COLORS[act._dayIdx % DAY_COLORS.length];
      // ── Marker element ──
      const el = document.createElement("div");
      el.dataset.id = act.id;
      el.dataset.color = pinColor;
      el.setAttribute("role", "button");
      el.setAttribute("tabindex", "0");
      el.setAttribute("aria-label", `Select ${act.name} on the map`);
      el.style.cssText = `
        width: 28px;
        height: 36px;
        cursor: pointer;
        position: relative;
        filter: drop-shadow(0 2px 8px rgba(0,0,0,0.25));
        transition: filter 0.15s ease;
      `;
      el.innerHTML = `<div class="wayfarer-pin-inner" style="transition: transform 0.15s ease; transform-origin: 50% 100%;">
        <svg width="28" height="36" viewBox="0 0 28 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 0C6.268 0 0 6.268 0 14c0 9.333 14 22 14 22s14-12.667 14-22C28 6.268 21.732 0 14 0z" fill="${pinColor}"/>
          <text x="14" y="17" text-anchor="middle" dominant-baseline="middle" fill="white" font-size="12" font-weight="800" font-family="Plus Jakarta Sans, sans-serif">${i + 1}</text>
        </svg>
      </div>`;

      // Hover tooltip (name only)
      const popup = new mapboxgl.Popup({
        offset: 18,
        closeButton: false,
        closeOnClick: false,
        maxWidth: "220px",
        className: "wayfarer-tooltip",
      }).setHTML(`<div class="tooltip-name">${act.name}</div>`);

      // Show popup on hover
      el.addEventListener("mouseenter", () => {
        popup.setLngLat([act.lng!, act.lat!]).addTo(map.current!);
        if (useTripStore.getState().activeActivityId !== act.id) {
          const inner = el.querySelector(".wayfarer-pin-inner") as HTMLDivElement | null;
          if (inner) inner.style.transform = "scale(1.12)";
        }
      });
      el.addEventListener("mouseleave", () => {
        popup.remove();
        if (useTripStore.getState().activeActivityId !== act.id) {
          const inner = el.querySelector(".wayfarer-pin-inner") as HTMLDivElement | null;
          if (inner) inner.style.transform = "scale(1)";
        }
      });

      // Click → highlight itinerary card + open detail panel
      const selectMarker = (e?: Event) => {
        e?.stopPropagation();
        selectIndex(i);
        document.getElementById(`activity-${act.id}`)?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      };
      el.addEventListener("click", selectMarker);
      el.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          selectMarker(e);
        }
      });

      const marker = new mapboxgl.Marker({ element: el, anchor: "bottom" })
        .setLngLat([act.lng!, act.lat!])
        .addTo(map.current!);

        const ids = Array.isArray((act as any)._groupIds) ? (act as any)._groupIds : [act.id];
        ids.forEach((id: string) => {
          markersRef.current.set(id, marker);
          popupsRef.current.set(id, popup);
        });
      });
    };

    async function geocodeActivities(base: typeof activitiesRaw, destination: string) {
      const results = await Promise.all(
        base.map(async (act) => {
          try {
            const query = `${act.name} ${destination}`.trim();
            const res = await fetch(
              `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
                query,
              )}.json?access_token=${TOKEN}&limit=1`,
            );
            const data = await res.json().catch(() => ({}));
            const center = data?.features?.[0]?.center as [number, number] | undefined;
            if (!center) return act;
            const [lng, lat] = center;
            return { ...act, lat, lng };
          } catch {
            return act;
          }
        }),
      );
      return results.filter((a) => a.lat != null && a.lng != null);
    }

    if (trip.destination && TOKEN) {
      const destination = trip.destination;
      fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          destination,
        )}.json?access_token=${TOKEN}&limit=1`,
      )
        .then((r) => r.json())
        .then(async (data) => {
          if (renderId !== renderIdRef.current) return;
          const center = data?.features?.[0]?.center as [number, number] | undefined;
          if (!center) return applyMarkers(activitiesDeduped);
          const [lng, lat] = center;
          const filtered = activitiesDeduped.filter((a) => distanceKm(lat, lng, a.lat!, a.lng!) <= 800);
          if (filtered.length) {
            applyMarkers(filtered);
          } else {
            const geocoded = await geocodeActivities(activitiesDeduped, destination);
            applyMarkers(geocoded.length ? geocoded : activitiesDeduped);
          }
        })
        .catch(() => {
          if (renderId !== renderIdRef.current) return;
          applyMarkers(activitiesDeduped);
        });
    } else {
      applyMarkers(activitiesDeduped);
    }
  }, [trip, clearMarkers, setActiveActivityId, isCollapsed, selectById, selectIndex]);

  useEffect(() => {
    if (isCollapsed || !activeActivityId) return;
    const idx = locationsRef.current.findIndex((location) => location.id === activeActivityId);
    if (idx !== -1) setSelectedIndex(idx);
  }, [activeActivityId, isCollapsed]);

  // ── React to active activity (itinerary click → fly map) ─────────────────
  useEffect(() => {
    if (isCollapsed) return;
    if (!map.current) return;

    markersRef.current.forEach((marker, id) => {
      const el = marker.getElement();
      const isActive = id === activeActivityId;

      if (isActive) {
        const inner = el.querySelector(".wayfarer-pin-inner") as HTMLDivElement | null;
        if (inner) inner.style.transform = "scale(1.35)";
        const pinColor = el.dataset.color ?? "#00E5FF";
        el.style.boxShadow = `0 0 0 6px ${pinColor}66, 0 4px 18px rgba(0,0,0,0.7)`;
        el.style.zIndex = "5";
        map.current!.easeTo({
          center: marker.getLngLat(),
          zoom: Math.max(map.current!.getZoom(), 14),
          duration: 900,
        });
      } else {
        const inner = el.querySelector(".wayfarer-pin-inner") as HTMLDivElement | null;
        if (inner) inner.style.transform = "scale(1)";
        const pinColor = el.dataset.color ?? "#00E5FF";
        el.style.boxShadow = `0 0 0 3px ${pinColor}40, 0 2px 10px rgba(0,0,0,0.55)`;
        el.style.zIndex = "0";
      }
    });
  }, [activeActivityId, isCollapsed]);

  if (isCollapsed) {
    return <PanelHeader icon="🗺" label="Map" isCollapsed onToggle={onToggle} />;
  }

  if (!TOKEN) {
    return (
      <div className="flex h-full flex-col">
        <PanelHeader icon="🗺" label="Map" isCollapsed={isCollapsed} onToggle={onToggle} />
        <div className="flex flex-1 items-center justify-center p-8 text-center">
          <div className="max-w-sm text-sm text-neutral-500">
            <div>
              Add <code className="mx-1 rounded bg-neutral-100 px-1 text-xs">NEXT_PUBLIC_MAPBOX_TOKEN</code>
              to .env.local to enable the map.
            </div>
            <div className="mt-3">You can still edit the itinerary, save activities locally, or use Google Maps links.</div>
            <a
              href="/support"
              className="mt-4 inline-flex rounded-full border border-neutral-200 bg-white px-4 py-2 text-xs font-semibold text-neutral-700 focus:outline-none focus:ring-4 focus:ring-[#E8472A]/20"
            >
              Contact support
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <PanelHeader icon="🗺" label="Map" isCollapsed={isCollapsed} onToggle={onToggle} />
      <div className="relative flex-1 overflow-hidden">
        {!trip && (
          <div className="absolute inset-0 z-10 flex items-center justify-center text-sm text-neutral-500 pointer-events-none select-none">
            Describe a trip to see it on the map
          </div>
        )}

        <div ref={mapContainer} className="h-full w-full" />

        {selectedIndex != null && locations[selectedIndex] ? (
          <LocationDetailPanel
            location={locations[selectedIndex]}
            index={selectedIndex}
            total={locations.length}
            destination={trip?.destination}
            pinColor={DAY_COLORS[locations[selectedIndex]._dayIdx % DAY_COLORS.length]}
            pinNumber={selectedIndex + 1}
            onClose={() => selectIndex(null)}
            onPrev={() =>
              selectIndex(selectedIndex > 0 ? selectedIndex - 1 : selectedIndex)
            }
            onNext={() =>
              selectIndex(
                selectedIndex < locations.length - 1 ? selectedIndex + 1 : selectedIndex
              )
            }
          />
        ) : null}

        {/* Popup + control theming */}
        <style>{`
          /* Hover tooltip */
          .wayfarer-tooltip .mapboxgl-popup-content {
            background: #ffffff;
            color: #1a1a1a;
            border-radius: 10px;
            padding: 6px 8px;
            font-size: 11px;
            font-weight: 600;
            box-shadow: 0 8px 18px rgba(26,26,26,0.18);
            border: 1px solid rgba(232,71,42,0.15);
          }
          .wayfarer-tooltip .mapboxgl-popup-tip {
            border-top-color: #ffffff !important;
          }
          .wayfarer-tooltip .tooltip-name {
            max-width: 180px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .mapboxgl-popup { z-index: 30 !important; }
          /* Hide default Mapbox logo */
          .mapboxgl-ctrl-logo { display: none !important; }
          /* Compact attribution */
          .mapboxgl-ctrl-attrib {
            background: rgba(255,255,255,0.85) !important;
            color: rgba(26,26,26,0.45) !important;
            font-size: 9px !important;
            border-radius: 6px !important;
          }
          .mapboxgl-ctrl-attrib a { color: rgba(232,71,42,0.8) !important; }
        `}</style>
      </div>
    </div>
  );
}

function LocationDetailPanel({
  location,
  index,
  total,
  destination,
  pinColor,
  pinNumber,
  onClose,
  onPrev,
  onNext,
}: {
  location: any;
  index: number;
  total: number;
  destination?: string;
  pinColor: string;
  pinNumber: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const [fetchedPhoto, setFetchedPhoto] = useState<{ id: string; url: string } | null>(null);
  const [photoFailedFor, setPhotoFailedFor] = useState<string | null>(null);
  const setActivityPhoto = useTripStore((s) => s.setActivityPhoto);

  useEffect(() => {
    if (location.photoUrl || location.imageUrl) return;
    let mounted = true;
    fetch("/api/place-photo", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        placeName: location.name,
        address: location.address,
        city: destination,
        lat: location.lat,
        lng: location.lng,
      }),
    })
      .then((r) => r.json())
      .then(({ photoUrl }) => {
        if (mounted && photoUrl) {
          setFetchedPhoto({ id: location.id, url: photoUrl });
          if (location.id) setActivityPhoto(location.id, photoUrl);
        }
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, [location.name, location.address, location.photoUrl, location.imageUrl, destination, location.id, setActivityPhoto]);

  const cachedPhotoUrl = fetchedPhoto && fetchedPhoto.id === location.id ? fetchedPhoto.url : null;
  const photoUrl = cachedPhotoUrl ?? getActivityPhotoUrl(location, destination);
  const photoFailed = photoFailedFor === location.id;
  const categories =
    location.categories?.length
      ? location.categories
      : location.category
        ? [location.category]
        : [];
  return (
    <div className="absolute inset-x-3 bottom-3 z-50 rounded-2xl border border-neutral-200 bg-white p-4 shadow-lg text-neutral-900 md:left-auto md:right-3 md:bottom-3 md:top-3 md:h-[calc(100%-24px)] md:w-[380px]">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-full text-white text-sm font-bold"
            style={{ background: pinColor }}
          >
            {pinNumber}
          </span>
          <div className="text-lg font-semibold">{location.name}</div>
        </div>
        <button
          onClick={onClose}
          aria-label="Close details"
          className="flex h-7 w-7 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-500 hover:text-neutral-900 hover:border-[#E8472A] transition"
        >
          ✕
        </button>
      </div>

      <div className="mt-3 flex items-start gap-3">
        <div className="flex-1 text-sm text-neutral-600">
          {location.description ?? "No description available yet."}
          <div className="mt-3 flex flex-wrap gap-2">
            {categories.map((c: string) => (
              <span key={c} className="rounded-full border border-neutral-200 bg-[#F5F0EB] px-2 py-0.5 text-xs text-neutral-700">
                {c}
              </span>
            ))}
          </div>
          <div className="mt-3 text-xs text-neutral-500 flex items-center gap-1">
            <span>📍</span>
            <span>{location.address ?? "Address unavailable"}</span>
          </div>
          <div className="mt-1 text-xs text-neutral-500">
            Hours: {location.hours ?? "Unavailable"}
          </div>
          <div className="mt-2 text-xs text-neutral-600">
            {location.rating ? `★ ${location.rating}` : "★ —"} · {location.reviewCount ?? "Reviews unavailable"}
          </div>
        </div>
        <div className="h-20 w-28 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100">
          {photoUrl && !photoFailed ? (
            <img
              src={photoUrl}
              alt={location.name}
              loading="lazy"
              className="h-full w-full object-cover"
              onError={() => setPhotoFailedFor(location.id)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-orange-100 via-rose-100 to-sky-100 px-2 text-center text-[10px] font-semibold text-neutral-500">
              {location.name}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3 text-xs text-neutral-600">
        <button className="underline">About</button>
        <button className="underline">Book</button>
        <button className="underline">Reviews</button>
        <button className="underline">Photos</button>
        <button className="underline">Mentions</button>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-neutral-500">
        <button onClick={onPrev} className="underline">← Prev</button>
        <span>{index + 1} of {total}</span>
        <button onClick={onNext} className="underline">Next →</button>
      </div>
    </div>
  );
}
