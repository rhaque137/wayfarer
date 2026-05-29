"use client";

import dynamic from "next/dynamic";
import { Component, type ErrorInfo, type ReactNode, useState } from "react";

const HelpWidgetPanel = dynamic(
  () => import("@/components/home/HelpWidgetPanel").then((mod) => mod.HelpWidgetPanel),
  {
    ssr: false,
    loading: () => (
      <div className="mb-3 flex w-[320px] items-center justify-center rounded-2xl border border-neutral-200 bg-white p-6 text-xs text-neutral-500 shadow-lg">
        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-neutral-200 border-t-[#E8472A]" />
        Loading chat...
      </div>
    ),
  },
);

class HelpWidgetErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[help-widget] dynamic import failed", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="mb-3 w-[320px] rounded-2xl border border-neutral-200 bg-white p-4 text-xs text-neutral-600 shadow-lg">
          Chat unavailable. Please try again later.
        </div>
      );
    }

    return this.props.children;
  }
}

export function HelpWidget() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open && (
        <HelpWidgetErrorBoundary>
          <HelpWidgetPanel onClose={() => setOpen(false)} />
        </HelpWidgetErrorBoundary>
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
