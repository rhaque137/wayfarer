"use client";

import React from "react";

interface Props {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export function ChatInputBar({ value, onChange, onSubmit, isLoading, placeholder }: Props) {
  return (
    <form onSubmit={onSubmit} className="flex items-center gap-2">
      <label htmlFor="trip-chat-input" className="sr-only">
        Ask Wayfarer to edit or improve your trip
      </label>
      <input
        id="trip-chat-input"
        type="text"
        value={value}
        onChange={onChange}
        disabled={isLoading}
        placeholder={placeholder ?? "Ask anything about your trip..."}
        className="flex-1 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm text-neutral-800 outline-none transition-all duration-200 focus:border-[#E8472A] focus:ring-4 focus:ring-[#E8472A]/15 disabled:opacity-50"
      />
      <button
        type="submit"
        aria-label={isLoading ? "Sending message" : "Send message"}
        disabled={isLoading || !value.trim()}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E8472A] text-white transition-all duration-200 hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-[#E8472A]/25 disabled:opacity-40"
      >
        {isLoading ? (
          <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
            <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
          </svg>
        )}
      </button>
    </form>
  );
}
