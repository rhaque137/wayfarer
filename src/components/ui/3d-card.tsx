"use client";

import * as React from "react";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Props for the InteractiveTravelCard component.
 */
export interface InteractiveTravelCardProps {
  /** The main title for the card, e.g., "Sapa Valley" */
  title: string;
  /** A subtitle or location, e.g., "Vietnam" */
  subtitle: string;
  /** The URL for the background image. */
  imageUrl: string;
  /** The text for the primary action button, e.g., "Book your trip" */
  actionText: string;
  /** The destination URL for the top-right link. */
  href: string;
  /** Callback function when the primary action button is clicked. */
  onActionClick: () => void;
  /** Optional additional class names for custom styling. */
  className?: string;
}

export const InteractiveTravelCard = React.forwardRef<
  HTMLDivElement,
  InteractiveTravelCardProps
>(
  (
    { title, subtitle, imageUrl, actionText, href, onActionClick, className },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "group relative h-[26rem] w-80 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition-[box-shadow,border-color] duration-200 hover:border-neutral-300 hover:shadow-md",
          className
        )}
      >
        <div className="absolute inset-0 grid h-full w-full grid-rows-[1fr_auto]">
          <img
            src={imageUrl}
            alt={`${title}, ${subtitle}`}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />

          <div className="absolute inset-0 h-full w-full bg-gradient-to-b from-black/20 via-transparent to-black/60" />

          <div className="relative flex flex-col justify-between p-4 text-white">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold">
                  {title}
                </h2>
                <p className="text-sm font-light text-white/80">
                  {subtitle}
                </p>
              </div>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Learn more about ${title}`}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm ring-1 ring-inset ring-white/30 transition-colors hover:bg-white/30"
              >
                <ArrowUpRight className="h-5 w-5 text-white" />
              </a>
            </div>

            <button
              onClick={onActionClick}
              className={cn(
                "w-full rounded-lg py-3 text-center font-semibold text-white transition-colors",
                "bg-white/10 backdrop-blur-md ring-1 ring-inset ring-white/20 hover:bg-white/20"
              )}
            >
              {actionText}
            </button>
          </div>
        </div>
      </div>
    );
  }
);
InteractiveTravelCard.displayName = "InteractiveTravelCard";

type Tilt3DProps = {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
  hoverScale?: number;
};

/**
 * Stable wrapper kept for backwards compatibility with older card call sites.
 * The previous implementation applied 3D rotation, scale, and lift on hover,
 * which made grid cards overlap and images appear distorted.
 */
export function Tilt3D({
  children,
  className,
}: Tilt3DProps) {
  return <div className={cn("h-full w-full", className)}>{children}</div>;
}
