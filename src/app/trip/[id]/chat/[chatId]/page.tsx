"use client";

import Link from "next/link";
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
  const [itineraryWidth, setItineraryWidth] = useState(360);
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
        const maxItin = rect.width - (chatCollapsed ? 48 : chatWidth) - minMap - 8;
        const next = Math.max(minItin, Math.min(x, maxItin));
        setItineraryWidth(next);
      }
      if (dragging === "right") {
        const mapWidth = rect.width - (itineraryCollapsed ? 48 : itineraryWidth) - 8;
        const maxChat = mapWidth - minMap;
        const next = Math.max(minChat, Math.min(rect.width - x, maxChat));
        setChatWidth(next);
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
      const list = raw ? (JSON.parse(raw) as Array<{ id: string }>) : [];
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
    <div ref={containerRef} className="flex h-dvh flex-col overflow-hidden bg-[#F5F0EB] md:flex-row">
      {isMobile && (
        <div className="sticky top-0 z-30 flex items-center justify-between gap-2 border-b border-neutral-200 bg-[#FAF7F3] px-4 py-3 md:hidden">
          <Link
            href="/"
            className="text-sm font-bold text-neutral-900"
            aria-label="Back to home"
          >
            Wayfarer AI
          </Link>
          <div className="flex items-center gap-2 text-neutral-500">
            <button className="h-8 w-8 rounded-full border border-neutral-200 bg-white text-xs">⟲</button>
            <button className="h-8 w-8 rounded-full border border-neutral-200 bg-white text-xs">⤴︎</button>
            <div className="h-8 w-8 rounded-full bg-neutral-200 text-xs font-semibold text-neutral-700 flex items-center justify-center">
              U
            </div>
          </div>
        </div>
      )}

      {(!isMobile || activeTab === "itinerary") && (
        <div
          className={[
            "border-r border-neutral-200 bg-[#FAF7F3] transition-all duration-300 ease-in-out",
            itineraryCollapsed ? "w-12 overflow-hidden" : "",
            isMobile ? "w-full flex-1 min-h-0 pb-24" : "",
          ].join(" ")}
          style={!itineraryCollapsed && !isMobile ? { width: itineraryWidth } : undefined}
        >
          <ItineraryPanel
            isCollapsed={itineraryCollapsed}
            onToggle={() => setItineraryCollapsed((v) => !v)}
          />
        </div>
      )}

      {!isMobile && (
        <div
          onMouseDown={() => setDragging("left")}
          className="w-2 cursor-col-resize bg-transparent hover:bg-white/60"
        />
      )}

      {(!isMobile || activeTab === "map") && (
        <div
          className={[
            "border-r border-neutral-200 bg-white transition-all duration-300 ease-in-out",
            mapCollapsed ? "w-12 overflow-hidden" : "flex-1",
            isMobile ? "w-full flex-1 min-h-0 pb-24" : "",
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
          className="w-2 cursor-col-resize bg-transparent hover:bg-white/60"
        />
      )}

      {(!isMobile || activeTab === "chat") && (
        <div
          className={[
            "transition-all duration-300 ease-in-out",
            "bg-[#FAF7F3]",
            chatCollapsed ? "w-12 overflow-hidden" : "",
            isMobile ? "w-full flex-1 min-h-0 pb-24" : "",
          ].join(" ")}
          style={!chatCollapsed && !isMobile ? { width: chatWidth } : undefined}
        >
          <ChatPanel
            isCollapsed={chatCollapsed}
            onToggle={() => setChatCollapsed((v) => !v)}
          />
        </div>
      )}

      {isMobile && (
        <div className="fixed bottom-3 left-1/2 z-40 w-[min(520px,calc(100%-24px))] -translate-x-1/2 md:hidden">
          <div className="flex items-center justify-between rounded-2xl border border-neutral-200 bg-white/95 p-2 shadow-sm backdrop-blur">
            {[
              { id: "map", label: "Overview", icon: "▦" },
              { id: "itinerary", label: "Itinerary", icon: "🗓" },
              { id: "chat", label: "AI Chat", icon: "✦" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as typeof activeTab)}
                className={[
                  "flex flex-1 flex-col items-center gap-1 rounded-xl px-2 py-2 text-[10px] font-semibold transition-all duration-200",
                  activeTab === t.id
                    ? "bg-[#F5EAE6] text-[#E8472A]"
                    : "text-neutral-500",
                ].join(" ")}
              >
                <span className="text-sm">{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
