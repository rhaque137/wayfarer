"use client";

import { useMemo, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";

export function HelpWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const transport = useMemo(() => new DefaultChatTransport({ api: "/api/help-chat" }), []);
  const { messages, status, error, sendMessage } = useChat({ transport });
  const getText = (m: any) =>
    (m.parts ?? [])
      .filter((p: any) => p.type === "text")
      .map((p: any) => p.text)
      .join("");

  const isLoading = status === "streaming" || status === "submitted";

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open && (
        <div className="mb-3 w-[320px] overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-neutral-200 px-3 py-2 text-xs font-semibold">
            <span className="text-neutral-900">Wayfarer Help</span>
            <button onClick={() => setOpen(false)} className="text-neutral-500">
              ✕
            </button>
          </div>
          <div className="max-h-[280px] space-y-2 overflow-y-auto p-3 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={
                  m.role === "user"
                    ? "rounded-lg bg-[#E8472A]/10 p-2"
                    : "rounded-lg border border-neutral-200 bg-white p-2"
                }
              >
                {getText(m)}
              </div>
            ))}
            {messages.length === 0 && (
              <div className="rounded-lg border border-neutral-200 bg-white p-2 text-xs text-neutral-500">
                Hi! Ask me anything about using Wayfarer — planning trips, editing itineraries, or troubleshooting.
              </div>
            )}
            {isLoading && <div className="text-xs text-neutral-500">Thinking…</div>}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!input.trim()) return;
              sendMessage({ text: input });
              setInput("");
            }}
            className="border-t border-neutral-200 p-2"
          >
            <div className="flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about Wayfarer..."
                className="w-full rounded-full border border-neutral-200 bg-white px-3 py-2 text-xs outline-none"
              />
              <button
                type="submit"
                className="rounded-full bg-[#1A1A1A] px-3 py-2 text-xs font-semibold text-white transition-all duration-200 hover:opacity-90"
                aria-label="Send"
              >
                Send
              </button>
            </div>
            {error && (
              <div className="mt-2 text-[11px] text-red-600">
                {error.message || "Something went wrong. Please try again."}
              </div>
            )}
          </form>
        </div>
      )}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1A1A1A] text-white shadow-lg transition-all duration-200 hover:opacity-90"
        aria-label="Open help chat"
        title="Chat with support"
      >
        💬
      </button>
    </div>
  );
}
