"use client";

import Image from "next/image";
import { Heart, Plus, Star } from "lucide-react";
import { useTripStore } from "@/store/tripStore";

export type PlaceCardData = {
  id: string;
  name: string;
  category: string;
  rating?: number;
  description: string;
  imageUrl?: string;
  mentions?: number;
};

export function PlaceCardLight({ place }: { place: PlaceCardData }) {
  const savedActivities = useTripStore((s) => s.savedActivities);
  const saveActivity = useTripStore((s) => s.saveActivity);
  const unsaveActivity = useTripStore((s) => s.unsaveActivity);
  const saved = savedActivities.some((a) => a.id === place.id);

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className="text-sm text-neutral-500">{place.category}</div>
        <div className="flex items-center gap-1 text-amber-600 text-sm">
          <Star className="h-4 w-4 fill-amber-500 stroke-amber-500" />
          {place.rating?.toFixed(1) ?? "—"}
        </div>
      </div>
      <div className="mt-1 text-lg font-semibold text-neutral-900">{place.name}</div>
      <div className="mt-3 grid gap-3 md:grid-cols-[1fr_160px]">
        <p className="text-sm text-neutral-600">{place.description}</p>
        <div className="relative h-[120px] w-full overflow-hidden rounded-xl">
          {place.imageUrl ? (
            <Image src={place.imageUrl} alt={place.name} fill className="object-cover" />
          ) : (
            <div className="h-full w-full bg-neutral-100" />
          )}
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <div className="text-xs text-neutral-500">Mentioned by {place.mentions ?? 12} people</div>
        <div className="flex items-center gap-2">
          <button
            className={`rounded-full px-3 py-1 text-xs transition-all duration-200 ${saved ? "bg-[#E8472A] text-white" : "bg-neutral-100 text-neutral-700"}`}
            onClick={() =>
              saved
                ? unsaveActivity(place.id)
                : saveActivity({
                    id: place.id,
                    name: place.name,
                    category: place.category,
                    description: place.description,
                    rating: place.rating,
                    imageUrl: place.imageUrl,
                    verificationStatus: "ai_suggestion",
                    locked: false,
                  })
            }
          >
            <Heart className="mr-1 inline h-3 w-3" />
            {saved ? "Saved" : "Save"}
          </button>
          <button
            className="rounded-full px-3 py-1 text-xs bg-neutral-100 text-neutral-700 transition-all duration-200 hover:bg-[#E8472A] hover:text-white"
          >
            <Plus className="mr-1 inline h-3 w-3" />
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
