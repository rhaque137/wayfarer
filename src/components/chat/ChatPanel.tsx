"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTripStore } from "@/store/tripStore";
import Link from "next/link";
import { PanelHeader } from "@/components/ui/PanelHeader";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { QuickActions } from "@/components/chat/QuickActions";
import { ChatInputBar } from "@/components/chat/ChatInputBar";

export function ChatPanel({
  isCollapsed = false,
  onToggle,
}: {
  isCollapsed?: boolean;
  onToggle?: () => void;
}) {
  const { trip, setTrip, setPendingAIChanges, lastQuery, setLastQuery, messages: storedMessages, setMessages } = useTripStore();
  const bottomRef = useRef<HTMLDivElement>(null);
  const sentRef = useRef(false);

  const [input, setInput] = useState("");
  const transport = useMemo(() => new DefaultChatTransport({ api: "/api/chat" }), []);

  const { messages, sendMessage, status, error, stop, clearError, setMessages: setChatMessages } = useChat({
    transport,
    onFinish: ({ message }) => {
      let handled = false;
      const toolParts = message.parts
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ?.filter((p: any) => typeof p.type === "string" && p.type.startsWith("tool-")) ?? [];

      for (const part of toolParts) {
        const toolName = String((part as any).type).replace("tool-", "");
        if (toolName === "create_trip" && (part as any).state === "output-available") {
          const tripData = (part as any).output?.trip;
          if (tripData) {
            setTrip(normalizeTrip(tripData));
            setPendingAIChanges(true);
            handled = true;
          }
        }
      }

      if (handled) return;

      // Fallback: parse JSON from assistant text
      const textContent = message.parts
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ?.filter((p: any) => p.type === "text")
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((p: any) => p.text)
        .join("") ?? "";

      try {
        const cleaned = textContent.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();
        const data = JSON.parse(cleaned);
        if (data.trip) {
          if (isBudgetOnlyTrip(data.trip)) return;
          const tripData = data.trip;
          setTrip(normalizeTrip(tripData));
          setPendingAIChanges(true);
        }
      } catch {
        // Not JSON or follow-up message — that's fine, just display the text
      }
    },
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const displayMessages = useMemo(() => {
    if (messages.length) return messages;
    return (storedMessages ?? []).map((m: any) => ({
      id: m.id,
      role: m.role,
      content: m.content ?? "",
      parts: [{ type: "text", text: m.content ?? "" }],
    }));
  }, [messages, storedMessages]);

  const hydratedRef = useRef(false);
  useEffect(() => {
    if (hydratedRef.current) return;
    if (!storedMessages?.length) return;
    if (messages.length) {
      hydratedRef.current = true;
      return;
    }
    const hydrated = storedMessages.map((m: any) => ({
      id: m.id,
      role: m.role,
      parts: [{ type: "text", text: m.content ?? "" }],
    }));
    setChatMessages(hydrated as any);
    hydratedRef.current = true;
  }, [storedMessages, messages.length, setChatMessages]);

  useEffect(() => {
    if (messages.length) {
      // persist messages for reload
      setMessages(
        messages.map((m: any) => ({
          id: m.id,
          role: m.role,
          content: m.content ?? "",
          timestamp: m.createdAt ? new Date(m.createdAt).getTime() : Date.now(),
        }))
      );
    }
  }, [messages, setMessages]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get("q");
    if (initialQuery && !sentRef.current) {
      sentRef.current = true;
      window.history.replaceState({}, "", window.location.pathname);
      setLastQuery(initialQuery);
      sendMessage({ text: initialQuery });
      return;
    }
    if (!initialQuery && lastQuery && !sentRef.current && !trip) {
      sentRef.current = true;
      sendMessage({ text: lastQuery });
    }
  }, [sendMessage, lastQuery, trip, setLastQuery]);

  const quickActions = [
    { label: "Build a day-by-day itinerary", prompt: "Build me a detailed day-by-day itinerary with timings and tips" },
    { label: "Search for restaurants", prompt: "What are the best local restaurants and food experiences I should try?" },
    { label: "Add a day trip", prompt: "Can you suggest a great day trip from the main destination?" },
    { label: "Budget breakdown", prompt: "Give me a realistic budget breakdown for this trip in the chat only. Do not change the itinerary." },
  ];

  if (isCollapsed) {
    return <PanelHeader icon="💬" label="Chat" isCollapsed onToggle={onToggle} />;
  }

  return (
    <div className="flex h-full flex-col bg-[#FAF7F3]">
      <div className="flex flex-col border-b border-neutral-200">
        <div className="flex items-center justify-between px-4 pt-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
            <span className="h-2 w-2 rounded-full bg-[#E8472A]" />
            Wayfarer AI
          </div>
          <div className="flex items-center gap-2 text-neutral-400">
            <button
              onClick={onToggle}
              className="rounded-full border border-neutral-200 bg-white px-2 py-1 text-xs text-neutral-600 transition-all duration-200 hover:border-[#E8472A] hover:text-[#E8472A]"
            >
              ✕
            </button>
          </div>
        </div>
        <PanelHeader icon="💬" label="Chat" isCollapsed={false} onToggle={onToggle} />

        {trip && (
          <div className="px-4 pb-2">
            <div className="text-xs text-neutral-500">
              <Link href="/" className="font-semibold text-neutral-900 hover:underline">
                Home
              </Link>{" "}
              › {trip.destination}
            </div>
            <div className="mt-1 text-sm font-semibold text-neutral-900">{trip.name}</div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error.message || "Something went wrong while contacting the AI."}
            <button
              onClick={() => clearError?.()}
              className="ml-2 text-xs underline"
            >
              Dismiss
            </button>
          </div>
        )}
        {displayMessages.length === 0 && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-neutral-200 bg-white p-4 text-sm text-neutral-600 shadow-sm">
              Try: <span className="text-neutral-900">&quot;4 days in Kyoto for 2 people, love temples and food&quot;</span>
            </div>
            <QuickActions actions={quickActions} onAction={(prompt) => sendMessage({ text: prompt })} />
          </div>
        )}

        {displayMessages.map((msg: any) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {(status === "streaming" || status === "submitted") && (
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <span className="animate-pulse">✦</span> Planning your trip...
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {trip && displayMessages.length > 0 && (
        <div className="border-t border-neutral-200 px-4 py-2 bg-white/70">
          <QuickActions actions={quickActions} onAction={(prompt) => sendMessage({ text: prompt })} />
        </div>
      )}

      <div className="border-t border-neutral-200 p-3 bg-white/80">
        <ChatInputBar
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onSubmit={(e) => {
            e.preventDefault();
            if (!input.trim()) return;
            setLastQuery(input.trim());
            sendMessage({ text: input });
            setInput("");
          }}
          isLoading={status === "streaming" || status === "submitted"}
          placeholder={trip ? "Ask me to change anything..." : "Describe your dream trip..."}
        />
        {(status === "streaming" || status === "submitted") && (
          <button
            onClick={() => stop()}
            className="mt-2 text-xs text-neutral-500 underline"
          >
            Stop response
          </button>
        )}
      </div>
    </div>
  );
}

function isBudgetOnlyTrip(tripData: any) {
  const name = String(tripData?.name ?? "").toLowerCase();
  if (name.includes("budget") || name.includes("estimate") || name.includes("cost")) return true;
  const days = Array.isArray(tripData?.days) ? tripData.days : [];
  if (days.length === 0) return false;
  const acts = days.flatMap((d: any) => d.activities ?? []);
  if (acts.length === 0) return false;
  const budgetLike = ["budget", "accommodation", "meals", "food", "transport", "activities", "flights", "hotels"];
  const hits = acts.filter((a: any) => {
    const n = String(a?.name ?? "").toLowerCase();
    const c = String(a?.category ?? "").toLowerCase();
    return budgetLike.some((k) => n.includes(k) || c.includes(k));
  });
  const allNoCoords = acts.every((a: any) => a.lat == null || a.lng == null);
  return hits.length >= Math.ceil(acts.length * 0.7) && allNoCoords;
}

function normalizeTrip(tripData: any) {
  const numDays = Math.max(1, Number(tripData.numDays ?? tripData.days?.length ?? 1));
  const rawDays = Array.isArray(tripData.days) ? tripData.days : [];
  const byNumber = new Map<number, any>();
  rawDays.forEach((d: any) => {
    const n = Number(d.dayNumber ?? d.day ?? 0);
    if (n) byNumber.set(n, d);
  });

  const days = Array.from({ length: numDays }, (_, i) => {
    const dayNumber = i + 1;
    const d = byNumber.get(dayNumber) ?? rawDays[i] ?? {};
    return {
      id: d.id ?? `day${dayNumber}`,
      dayNumber,
      date: d.date ?? `Day ${dayNumber}`,
      theme: d.theme,
        activities: (d.activities ?? []).map((a: any) => ({
          id: a.id ?? crypto.randomUUID(),
          name: a.name,
          category: a.category,
          description: a.description,
          address: a.address,
          rating: a.rating,
          photoUrl: a.photoUrl,
          imageUrl: a.imageUrl,
          lat: a.lat,
          lng: a.lng,
        })),
    };
  });

  return {
    id: Date.now().toString(),
    name: tripData.name ?? "Trip Plan",
    destination: tripData.destination ?? "",
    numPeople: tripData.numPeople ?? 2,
    days,
  };
}
