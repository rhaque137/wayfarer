"use client";

import { useState } from "react";
import { Heart, Plus, Check, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { InlinePhoto } from "@/components/unsplash/InlinePhoto";
import { cn } from "@/lib/utils";

export type Place = {
  id: string;
  name: string;
  category: string;
  rating?: number;
  description: string;
  mentions?: number;
  lat?: number;
  lng?: number;
  photoQuery?: string;
};

export function PlaceCard({
  place,
  active,
  onSelect,
}: {
  place: Place;
  active?: boolean;
  onSelect?: (place: Place) => void;
}) {
  const [saved, setSaved] = useState(false);
  const [added, setAdded] = useState(false);

  return (
    <motion.button
      whileHover={{ y: -3 }}
      onClick={() => onSelect?.(place)}
      className={cn(
        "glass hover-lift w-full rounded-2xl border border-neutral-200 p-4 text-left",
        active && "border-[#E8472A]/50 bg-[#E8472A]/10",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm text-foreground/70">
            <MapPin className="h-4 w-4 text-[#E8472A]" />
            {place.category}
          </div>
          <div className="mt-1 text-lg font-semibold">{place.name}</div>
        </div>
        <div className="text-sm text-amber">
          {place.rating ? `★ ${place.rating.toFixed(1)}` : "★ —"}
        </div>
      </div>

      <div className="mt-3 grid gap-4 md:grid-cols-[1fr_180px] md:items-center">
        <div className="text-sm text-foreground/75">{place.description}</div>
        <div className="relative h-[120px] w-full overflow-hidden rounded-2xl border border-neutral-200">
          <InlinePhoto query={place.photoQuery ?? place.name} alt={place.name} />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs text-foreground/50">
          Mentioned by {place.mentions ?? 14} people
        </div>
        <div className="flex items-center gap-2">
          <button
            className={cn(
              "focus-ring flex h-9 items-center gap-2 rounded-full px-3 text-xs",
              saved ? "bg-[#FF4DB1]/20 text-foreground" : "glass text-foreground/70",
            )}
            onClick={(e) => {
              e.stopPropagation();
              setSaved((v) => !v);
            }}
          >
            <Heart className={cn("h-4 w-4", saved && "fill-foreground")} />
            {saved ? "Saved" : "Save"}
          </button>
          <button
            className={cn(
              "focus-ring flex h-9 items-center gap-2 rounded-full px-3 text-xs",
              added ? "bg-[#E8472A]/20 text-foreground" : "glass text-foreground/70",
            )}
            onClick={(e) => {
              e.stopPropagation();
              setAdded(true);
            }}
          >
            {added ? <Check className="h-4 w-4 text-[#E8472A]" /> : <Plus className="h-4 w-4" />}
            {added ? "Added" : "Add"}
          </button>
        </div>
      </div>
    </motion.button>
  );
}
