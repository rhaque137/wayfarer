"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { MapPanel } from "@/components/map/MapPanel";
import { ItineraryPanel } from "@/components/itinerary/ItineraryPanel";
import { useTripStore } from "@/store/tripStore";
import type { BudgetItem } from "@/lib/trip-schema";

export default function TripChatPage() {
  const [chatCollapsed, setChatCollapsed] = useState(false);
  const [mapCollapsed, setMapCollapsed] = useState(false);
  const [itineraryCollapsed, setItineraryCollapsed] = useState(false);
  const [chatWidth, setChatWidth] = useState(400);
  const [itineraryWidth, setItineraryWidth] = useState(360);
  const [dragging, setDragging] = useState<null | "left" | "right">(null);
  const [activeTab, setActiveTab] = useState<"overview" | "itinerary" | "map" | "budget" | "notes" | "share" | "chat">("overview");
  const [workspaceNotice, setWorkspaceNotice] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const trip = useTripStore((s) => s.trip);
  const lastQuery = useTripStore((s) => s.lastQuery);
  const updateTrip = useTripStore((s) => s.updateTrip);

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
        createdAt: trip.createdAt ?? new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const filtered = list.filter((t) => t.id !== trip.id);
      const next = [entry, ...filtered].slice(0, 8);
      localStorage.setItem(key, JSON.stringify(next));
    } catch {
      // ignore localStorage errors
    }
  }, [trip, lastQuery]);

  const saveTrip = () => {
    if (!trip) return;
    try {
      const key = "wayfarer_saved_trips";
      const raw = localStorage.getItem(key);
      const list = raw ? (JSON.parse(raw) as Array<{ id: string }>) : [];
      const savedTrip = { ...trip, updatedAt: new Date().toISOString() };
      const next = [savedTrip, ...list.filter((item) => item.id !== trip.id)].slice(0, 20);
      localStorage.setItem(key, JSON.stringify(next));
      setWorkspaceNotice("Trip saved locally on this device.");
    } catch {
      setWorkspaceNotice("Save failed. You can still export or copy the share link.");
    }
  };

  const shareTrip = async () => {
    if (!trip) return;
    const shareId = trip.shareId ?? trip.id;
    updateTrip({ isPublic: true, shareId });
    const url = `${window.location.origin}/trip/share/${shareId}`;
    try {
      await navigator.clipboard.writeText(url);
      setWorkspaceNotice("Share link copied. Public view is read-only.");
    } catch {
      setWorkspaceNotice(`Share link ready: ${url}`);
    }
    setActiveTab("share");
  };

  return (
    <div ref={containerRef} className="flex h-dvh flex-col overflow-hidden bg-[#F5F0EB]">
      <header className="z-30 border-b border-neutral-200 bg-[#FAF7F3]/95 px-4 py-3 shadow-sm backdrop-blur">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <Link href="/" className="font-semibold text-[#E8472A] hover:underline">Wayfarer</Link>
              <span>/</span>
              <Link href="/trips" className="hover:text-neutral-900">Trips</Link>
            </div>
            <h1 className="mt-1 truncate text-xl font-bold text-neutral-900">
              {trip?.title ?? trip?.name ?? "Trip workspace"}
            </h1>
            <div className="mt-1 text-sm text-neutral-600">
              {trip?.destination ?? "Describe your trip to generate a day-by-day itinerary"}
              {trip?.tripLengthDays ? ` · ${trip.tripLengthDays} days` : null}
              {trip?.travelers ?? trip?.numPeople ? ` · ${trip.travelers ?? trip.numPeople} travelers` : null}
            </div>
          </div>
          <div className="hidden flex-wrap items-center gap-2 md:flex">
            <button
              type="button"
              onClick={saveTrip}
              disabled={!trip}
              className="rounded-full border border-neutral-200 bg-white px-4 py-2 text-xs font-semibold text-neutral-700 transition hover:border-[#E8472A] hover:text-[#E8472A] focus:outline-none focus:ring-2 focus:ring-[#E8472A]/25 disabled:opacity-50"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => void shareTrip()}
              disabled={!trip}
              className="rounded-full border border-neutral-200 bg-white px-4 py-2 text-xs font-semibold text-neutral-700 transition hover:border-[#E8472A] hover:text-[#E8472A] focus:outline-none focus:ring-2 focus:ring-[#E8472A]/25 disabled:opacity-50"
            >
              Share
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="rounded-full bg-[#E8472A] px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#E8472A]/30"
            >
              Export / Print
            </button>
          </div>
        </div>
        <div className="mt-3 hidden gap-2 overflow-x-auto pb-1 md:flex">
          {[
            ["itinerary", "Itinerary"],
            ["map", "Map"],
            ["budget", "Budget"],
            ["notes", "Notes"],
            ["share", "Share"],
            ["chat", "AI assistant"],
          ].map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id as typeof activeTab)}
              className={[
                "rounded-full px-3 py-1.5 text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-[#E8472A]/25",
                activeTab === id ? "bg-[#E8472A] text-white" : "bg-white text-neutral-600 hover:text-[#E8472A]",
              ].join(" ")}
            >
              {label}
            </button>
          ))}
        </div>
        {workspaceNotice ? (
          <div role="status" className="mt-2 rounded-xl bg-white px-3 py-2 text-xs font-medium text-neutral-600">
            {workspaceNotice}
          </div>
        ) : null}
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden md:flex-row">
      {(!isMobile || activeTab === "overview" || activeTab === "itinerary") && activeTab !== "budget" && activeTab !== "notes" && activeTab !== "share" && (
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

      {(!isMobile || ["map", "budget", "notes", "share"].includes(activeTab)) && (
        <div
          className={[
            "border-r border-neutral-200 bg-white transition-all duration-300 ease-in-out",
            mapCollapsed ? "w-12 overflow-hidden" : "flex-1",
            isMobile ? "w-full flex-1 min-h-0 pb-24" : "",
          ].join(" ")}
        >
          {activeTab === "budget" ? (
            <BudgetWorkspacePanel />
          ) : activeTab === "notes" ? (
            <NotesWorkspacePanel />
          ) : activeTab === "share" ? (
            <ShareWorkspacePanel onShare={() => void shareTrip()} />
          ) : (
            <MapPanel
              isCollapsed={mapCollapsed}
              onToggle={() => {
                if (!mapCollapsed && !canCollapseMap) return;
                setMapCollapsed((v) => !v);
              }}
            />
          )}
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
        <div className="fixed bottom-0 left-1/2 z-40 w-[min(520px,calc(100%-24px))] -translate-x-1/2 pb-[calc(0.75rem+env(safe-area-inset-bottom))] md:hidden">
          <div className="flex items-center justify-between rounded-2xl border border-neutral-200 bg-white/95 p-2 shadow-sm backdrop-blur">
            {[
              { id: "overview", label: "Overview", icon: "▦" },
              { id: "itinerary", label: "Itinerary", icon: "🗓" },
              { id: "map", label: "Map", icon: "⌖" },
              { id: "budget", label: "Budget", icon: "$" },
              { id: "chat", label: "AI Chat", icon: "✦" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as typeof activeTab)}
                aria-label={`Open ${t.label} panel`}
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
    </div>
  );
}

function BudgetWorkspacePanel() {
  const trip = useTripStore((s) => s.trip);
  const updateTrip = useTripStore((s) => s.updateTrip);
  const items = trip?.budgetItems?.length ? trip.budgetItems : defaultBudgetItems();
  const travelers = trip?.travelers ?? trip?.numPeople ?? 1;
  const total = items.reduce((sum, item) => sum + item.estimatedCost, 0);
  const currency = items[0]?.currency ?? trip?.budgetCurrency ?? "USD";

  const updateBudgetItem = (id: string, estimatedCost: number) => {
    const next = items.map((item) => (item.id === id ? { ...item, estimatedCost } : item));
    updateTrip({ budgetItems: next });
  };

  return (
    <section className="h-full overflow-y-auto bg-[#FAF7F3] p-5">
      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#E8472A]">Budget</div>
      <h2 className="mt-2 text-2xl font-bold text-neutral-900">Trip budget</h2>
      <p className="mt-2 text-sm text-neutral-600">
        Estimates are editable. Verify prices before booking.
      </p>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <Metric label="Estimated total" value={`${currency} ${Math.round(total).toLocaleString()}`} />
        <Metric label="Daily average" value={`${currency} ${Math.round(total / Math.max(trip?.days.length ?? 1, 1)).toLocaleString()}`} />
        <Metric label="Per person" value={`${currency} ${Math.round(total / Math.max(travelers, 1)).toLocaleString()}`} />
      </div>
      <div className="mt-5 space-y-3">
        {items.map((item) => (
          <label key={item.id} className="flex items-center justify-between gap-3 rounded-2xl border border-neutral-200 bg-white p-4">
            <span>
              <span className="block text-sm font-semibold text-neutral-900">{item.category}</span>
              <span className="block text-xs text-neutral-500">{item.label}</span>
            </span>
            <input
              value={item.estimatedCost}
              inputMode="numeric"
              onChange={(e) => updateBudgetItem(item.id, Number(e.target.value) || 0)}
              className="h-10 w-28 rounded-xl border border-neutral-200 px-3 text-right text-sm focus:border-[#E8472A] focus:outline-none focus:ring-2 focus:ring-[#E8472A]/20"
              aria-label={`${item.category} estimated cost`}
            />
          </label>
        ))}
      </div>
    </section>
  );
}

function NotesWorkspacePanel() {
  const trip = useTripStore((s) => s.trip);
  const updateTrip = useTripStore((s) => s.updateTrip);
  return (
    <section className="h-full overflow-y-auto bg-[#FAF7F3] p-5">
      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#E8472A]">Notes</div>
      <h2 className="mt-2 text-2xl font-bold text-neutral-900">Trip notes</h2>
      <p className="mt-2 text-sm text-neutral-600">Keep booking references, constraints, and ideas here. Notes save locally with the trip state.</p>
      <label className="mt-5 block">
        <span className="sr-only">Trip notes</span>
        <textarea
          value={trip?.notes ?? ""}
          onChange={(e) => updateTrip({ notes: e.target.value, updatedAt: new Date().toISOString() })}
          rows={10}
          className="w-full resize-none rounded-2xl border border-neutral-200 bg-white p-4 text-sm text-neutral-800 outline-none focus:border-[#E8472A] focus:ring-4 focus:ring-[#E8472A]/15"
          placeholder="Add reservation notes, accessibility needs, booking links, or reminders..."
        />
      </label>
    </section>
  );
}

function ShareWorkspacePanel({ onShare }: { onShare: () => void }) {
  const trip = useTripStore((s) => s.trip);
  const shareId = trip?.shareId ?? trip?.id;
  const href = shareId ? `/trip/share/${shareId}` : "";
  return (
    <section className="h-full overflow-y-auto bg-[#FAF7F3] p-5">
      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#E8472A]">Share</div>
      <h2 className="mt-2 text-2xl font-bold text-neutral-900">Share and export</h2>
      <p className="mt-2 text-sm text-neutral-600">
        Shared trip views are read-only. Export uses your browser print dialog for a clean PDF.
      </p>
      <div className="mt-5 rounded-2xl border border-neutral-200 bg-white p-4">
        <div className="text-sm font-semibold text-neutral-900">Public link</div>
        <div className="mt-2 break-all rounded-xl bg-neutral-50 p-3 text-xs text-neutral-600">
          {href || "Save or generate a trip first."}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button onClick={onShare} disabled={!trip} className="rounded-full bg-[#E8472A] px-4 py-2 text-xs font-semibold text-white disabled:opacity-50">
            Create/copy link
          </button>
          <button onClick={() => window.print()} className="rounded-full border border-neutral-200 bg-white px-4 py-2 text-xs font-semibold text-neutral-700">
            Print / Save PDF
          </button>
          {href ? (
            <Link href={href} className="rounded-full border border-neutral-200 bg-white px-4 py-2 text-xs font-semibold text-neutral-700">
              Open public view
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4">
      <div className="text-xs text-neutral-500">{label}</div>
      <div className="mt-1 text-lg font-bold text-neutral-900">{value}</div>
    </div>
  );
}

function defaultBudgetItems(): BudgetItem[] {
  return [
    { id: "lodging", category: "Lodging", label: "Hotels or apartments", estimatedCost: 0, currency: "USD" },
    { id: "food", category: "Food", label: "Meals, snacks, coffee", estimatedCost: 0, currency: "USD" },
    { id: "transit", category: "Transit", label: "Local transportation", estimatedCost: 0, currency: "USD" },
    { id: "activities", category: "Activities", label: "Tickets and tours", estimatedCost: 0, currency: "USD" },
    { id: "flights", category: "Flights", label: "Flights or trains", estimatedCost: 0, currency: "USD" },
    { id: "misc", category: "Misc", label: "Buffer and extras", estimatedCost: 0, currency: "USD" },
  ];
}
