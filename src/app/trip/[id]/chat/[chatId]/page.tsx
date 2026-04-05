"use client";

import { useEffect, useRef, useState } from "react";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { MapPanel } from "@/components/map/MapPanel";
import { ItineraryPanel } from "@/components/itinerary/ItineraryPanel";
import { useTripStore } from "@/store/tripStore";

export default function TripChatPage() {
  const [chatCollapsed, setChatCollapsed] = useState(false);
  const [mapCollapsed, setMapCollapsed] = useState(false);
  const [itineraryCollapsed, setItineraryCollapsed] = useState(false);
  const [chatWidth, setChatWidth] = useState(400);
  const [itineraryWidth, setItineraryWidth] = useState(380);
  const [dragging, setDragging] = useState<null | "left" | "right">(null);
  const [activeTab, setActiveTab] = useState<"chat" | "map" | "itinerary">("chat");
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const trip = useTripStore((s) => s.trip);
  const lastQuery = useTripStore((s) => s.lastQuery);

  const canCollapseMap = !(chatCollapsed && itineraryCollapsed);

  useEffect(() => {
    function onMove(e: MouseEvent) {
      if (!dragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const minChat = 240;
      const minItin = 260;
      const minMap = 320;

      if (dragging === "left") {
        const maxChat = rect.width - (itineraryCollapsed ? 48 : itineraryWidth) - minMap - 8;
        const next = Math.max(minChat, Math.min(x, maxChat));
        setChatWidth(next);
      }
      if (dragging === "right") {
        const mapWidth = rect.width - (chatCollapsed ? 48 : chatWidth) - 8;
        const maxItin = mapWidth - minMap;
        const next = Math.max(minItin, Math.min(rect.width - x, maxItin));
        setItineraryWidth(next);
      }
    }

    function onUp() {
      setDragging(null);
    }

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [dragging, chatCollapsed, itineraryCollapsed, chatWidth, itineraryWidth]);

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 768);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    if (!trip) return;
    try {
      const key = "wayfarer_recent_trips";
      const raw = localStorage.getItem(key);
      const list = raw ? (JSON.parse(raw) as Array<any>) : [];
      const entry = {
        id: trip.id,
        name: trip.name,
        destination: trip.destination,
        query: lastQuery ?? undefined,
      };
      const filtered = list.filter((t) => t.id !== trip.id);
      const next = [entry, ...filtered].slice(0, 2);
      localStorage.setItem(key, JSON.stringify(next));
    } catch {
      // ignore localStorage errors
    }
  }, [trip, lastQuery]);

  return (
    <div ref={containerRef} className="flex h-screen flex-col overflow-hidden bg-background md:flex-row">
      {isMobile && (
        <div className="sticky top-0 z-30 flex items-center justify-between gap-2 border-b border-panel-border bg-white px-3 py-2 md:hidden">
          {[
            { id: "chat", label: "Chat" },
            { id: "map", label: "Map" },
            { id: "itinerary", label: "Itinerary" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as typeof activeTab)}
              className={[
                "flex-1 rounded-full px-3 py-2 text-xs font-semibold transition",
                activeTab === t.id ? "bg-foreground text-white" : "bg-slate-100 text-foreground/70",
              ].join(" ")}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {(!isMobile || activeTab === "chat") && (
        <div
          className={[
            "border-r border-panel-border transition-all duration-300 ease-in-out",
            chatCollapsed ? "w-12 overflow-hidden" : "",
            isMobile ? "w-full" : "",
          ].join(" ")}
          style={!chatCollapsed && !isMobile ? { width: chatWidth } : undefined}
        >
          <ChatPanel
            isCollapsed={chatCollapsed}
            onToggle={() => setChatCollapsed((v) => !v)}
          />
        </div>
      )}

      {!isMobile && (
        <div
          onMouseDown={() => setDragging("left")}
          className="w-2 cursor-col-resize bg-transparent hover:bg-slate-100"
        />
      )}

      {(!isMobile || activeTab === "map") && (
        <div
          className={[
            "border-r border-panel-border transition-all duration-300 ease-in-out",
            mapCollapsed ? "w-12 overflow-hidden" : "flex-1",
            isMobile ? "w-full" : "",
          ].join(" ")}
        >
          <MapPanel
            isCollapsed={mapCollapsed}
            onToggle={() => {
              if (!mapCollapsed && !canCollapseMap) return;
              setMapCollapsed((v) => !v);
            }}
          />
        </div>
      )}

      {!isMobile && (
        <div
          onMouseDown={() => setDragging("right")}
          className="w-2 cursor-col-resize bg-transparent hover:bg-slate-100"
        />
      )}

      {(!isMobile || activeTab === "itinerary") && (
        <div
          className={[
            "transition-all duration-300 ease-in-out",
            itineraryCollapsed ? "w-12 overflow-hidden" : "",
            isMobile ? "w-full" : "",
          ].join(" ")}
          style={!itineraryCollapsed && !isMobile ? { width: itineraryWidth } : undefined}
        >
          <ItineraryPanel
            isCollapsed={itineraryCollapsed}
            onToggle={() => setItineraryCollapsed((v) => !v)}
          />
        </div>
      )}
    </div>
  );
}
