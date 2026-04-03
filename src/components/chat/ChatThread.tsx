"use client";

import { useMemo } from "react";
import { PlaceCard, type Place } from "@/components/chat/PlaceCard";
import { cn } from "@/lib/utils";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  places?: Place[];
};

export function ChatThread({
  messages,
  activePlaceId,
  onSelectPlace,
}: {
  messages: ChatMessage[];
  activePlaceId?: string | null;
  onSelectPlace?: (place: Place) => void;
}) {
  const placeIds = useMemo(() => new Set(messages.flatMap((m) => m.places?.map((p) => p.id) ?? [])), [messages]);

  return (
    <div className="space-y-4">
      {messages.map((m) => (
        <div key={m.id} className="glass rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold",
                m.role === "assistant" ? "bg-violet/20 text-violet" : "bg-cyan/10 text-cyan",
              )}
            >
              {m.role === "assistant" ? "✦" : "You"}
            </div>
            <div className="text-sm text-foreground/85">{m.content}</div>
          </div>

          {m.places?.length ? (
            <div className="mt-4 grid gap-3">
              {m.places.map((p) => (
                <PlaceCard
                  key={p.id}
                  place={p}
                  active={activePlaceId === p.id}
                  onSelect={onSelectPlace}
                />
              ))}
            </div>
          ) : null}
        </div>
      ))}
      {placeIds.size === 0 ? (
        <div className="text-xs text-foreground/50">Ask for places to see rich cards here.</div>
      ) : null}
    </div>
  );
}

