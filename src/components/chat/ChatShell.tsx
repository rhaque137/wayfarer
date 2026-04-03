"use client";

import { useMemo, useState } from "react";
import { TripSidebar } from "@/components/shell/TripSidebar";
import { TripTopbar } from "@/components/shell/TripTopbar";
import { MobileTabs } from "@/components/shell/MobileTabs";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatThread, type ChatMessage } from "@/components/chat/ChatThread";
import { TripMap, type TripPin } from "@/components/map/TripMap";
import { asArray, asString, isRecord } from "@/lib/guards";

const seedMessages: ChatMessage[] = [
  {
    id: "m1",
    role: "user",
    content: "I am doing 2 days in Dublin at the end of June. What should I do?",
  },
  {
    id: "m2",
    role: "assistant",
    content: "Here are top things to do for a memorable 2‑day Dublin itinerary:",
    places: [
      {
        id: "temple-bar",
        name: "The Temple Bar Pub",
        category: "Attraction",
        rating: 4.6,
        description:
          "An iconic stop in the heart of Temple Bar. Expect lively music, warm energy, and classic Irish pub vibes.",
        mentions: 14,
        lat: 53.3455,
        lng: -6.2642,
        photoQuery: "Temple Bar Pub Dublin night",
      },
      {
        id: "trinity",
        name: "Trinity College & Book of Kells",
        category: "Culture",
        rating: 4.7,
        description:
          "Pair the Book of Kells with a walk through the Long Room library. Ideal for history and design lovers.",
        mentions: 19,
        lat: 53.3438,
        lng: -6.2546,
        photoQuery: "Trinity College Library Dublin",
      },
    ],
  },
];

export function ChatShell({ chatId }: { chatId: string }) {
  const tripId = chatId;
  const [messages, setMessages] = useState<ChatMessage[]>(seedMessages);
  const [input, setInput] = useState("");
  const [activePlaceId, setActivePlaceId] = useState<string | null>(null);

  const places = useMemo(() => {
    const all = messages.flatMap((m) => m.places ?? []);
    return all;
  }, [messages]);

  const pins: TripPin[] = useMemo(
    () =>
      places
        .filter((p) => typeof p.lat === "number" && typeof p.lng === "number")
        .map((p) => ({ id: p.id, name: p.name, lat: p.lat!, lon: p.lng!, kind: "attraction" })),
    [places],
  );

  const tripMeta = useMemo(() => {
    return {
      title: "Trip to Dublin",
      chips: ["Dublin", "2 days in Jun", "1 traveler", "Budget"],
    };
  }, []);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);

    const res = await fetch("/api/chat?stream=1", {
      method: "POST",
      headers: { "content-type": "application/json", accept: "text/event-stream" },
      body: JSON.stringify({ message: text, chatId }),
    });

    if (!res.body) {
      const data = await res.json().catch(() => null);
      if (data?.reply) {
        setMessages((prev) => [
          ...prev,
          { id: crypto.randomUUID(), role: "assistant", content: data.reply, places: data.places ?? [] },
        ]);
      }
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let assistantText = "";
    let assistantPlaces: unknown[] = [];
    const id = crypto.randomUUID();

    setMessages((prev) => [...prev, { id, role: "assistant", content: "" }]);

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      const lines = chunk.split("\n");
      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        const payload = line.replace(/^data:\s*/, "");
        if (payload === "[DONE]") continue;
        try {
          const json = JSON.parse(payload);
          if (json.type === "delta") {
            assistantText += json.text ?? "";
            setMessages((prev) =>
              prev.map((m) => (m.id === id ? { ...m, content: assistantText } : m)),
            );
          }
          if (json.type === "places") {
            assistantPlaces = asArray(json.places) ?? [];
            setMessages((prev) =>
              prev.map((m) =>
                m.id === id
                  ? {
                      ...m,
                      places: assistantPlaces
                        .map((p) => (isRecord(p) ? p : null))
                        .filter(Boolean)
                        .map((p) => ({
                          id: asString(p?.id) ?? crypto.randomUUID(),
                          name: asString(p?.name) ?? "Place",
                          category: asString(p?.category) ?? "Attraction",
                          rating: typeof p?.rating === "number" ? p.rating : undefined,
                          description: asString(p?.description) ?? "",
                          mentions: typeof p?.mentions === "number" ? p.mentions : 14,
                          lat: typeof p?.lat === "number" ? p.lat : undefined,
                          lng: typeof p?.lng === "number" ? p.lng : undefined,
                          photoQuery: asString(p?.photoQuery) ?? undefined,
                        })),
                    }
                  : m,
              ),
            );
          }
        } catch {
          // ignore bad chunks
        }
      }
    }
  };

  const onTranscribe = async (audio: Blob) => {
    const fd = new FormData();
    fd.append("file", audio, "voice.webm");
    const res = await fetch("/api/transcribe", { method: "POST", body: fd });
    const data = await res.json();
    if (res.ok && data?.text) {
      setInput(data.text);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-[1400px] md:flex">
        <TripSidebar tripId={tripId} />
        <div className="flex-1 px-4 pb-24 pt-6 md:px-6 md:pb-10 md:pt-8">
          <TripTopbar meta={tripMeta} />
          <div className="mt-5 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-4">
              <ChatThread
                messages={messages}
                activePlaceId={activePlaceId}
                onSelectPlace={(p) => setActivePlaceId(p.id)}
              />
              <ChatInput
                value={input}
                onChange={setInput}
                onSend={sendMessage}
                onTranscribe={onTranscribe}
              />
            </div>
            <div className="glass overflow-hidden rounded-2xl">
              <TripMap pins={pins} activeId={activePlaceId} onSelect={(id) => setActivePlaceId(id)} />
            </div>
          </div>
        </div>
      </div>
      <MobileTabs tripId={tripId} />
    </div>
  );
}

