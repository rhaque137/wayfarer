"use client";

import { useMemo, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";

export function HelpPanel() {
  const bottomRef = useRef<HTMLDivElement>(null);
  const transport = useMemo(() => new DefaultChatTransport({ api: "/api/help-chat" }), []);

  const { messages, sendMessage, status, input, setInput } = useChat({
    transport,
    initialMessages: [
      {
        id: "help-welcome",
        role: "assistant",
        content: "Hi! Ask me anything about using Wayfarer — planning trips, editing itineraries, or troubleshooting.",
      } as any,
    ],
  });

  const isLoading = status === "streaming" || status === "submitted";

  return (
    <div className="flex h-full flex-col border-l border-panel-border bg-white/70">
      <div className="border-b border-panel-border px-3 py-2 text-xs font-semibold text-foreground">
        ✨ Wayfarer Help
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto p-3 text-xs">
        {messages.map((m) => (
          <div
            key={m.id}
            className={m.role === "user" ? "rounded-lg bg-foreground/5 p-2" : "rounded-lg bg-white p-2 border border-panel-border"}
          >
            {m.content}
          </div>
        ))}
        {isLoading && <div className="text-xs text-muted">Thinking…</div>}
        <div ref={bottomRef} />
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!input.trim()) return;
          sendMessage({ text: input });
          setInput("");
        }}
        className="border-t border-panel-border p-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about Wayfarer..."
          className="w-full rounded-full border border-panel-border bg-white px-3 py-2 text-xs outline-none"
        />
      </form>
    </div>
  );
}
