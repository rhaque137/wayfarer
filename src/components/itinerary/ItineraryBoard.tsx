"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, useSortable, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import { Sparkles, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";
import { asArray, asString, isRecord } from "@/lib/guards";

type Slot = "morning" | "afternoon" | "evening";

type Activity = {
  id: string;
  title: string;
  category: "culture" | "food" | "adventure" | "nightlife";
  durationMin?: number;
};

type Day = {
  day: number;
  base: string;
  headline: string;
  slots: Record<Slot, Activity[]>;
};

function toCategory(text: string): Activity["category"] {
  const t = text.toLowerCase();
  if (t.includes("wine") || t.includes("food") || t.includes("tapas") || t.includes("restaurant")) return "food";
  if (t.includes("bar") || t.includes("club") || t.includes("night")) return "nightlife";
  if (t.includes("hike") || t.includes("surf") || t.includes("adventure")) return "adventure";
  return "culture";
}

function colorFor(cat: Activity["category"]) {
  switch (cat) {
    case "culture":
      return "border-cyan/25 bg-cyan/5";
    case "food":
      return "border-amber/30 bg-amber/10";
    case "adventure":
      return "border-violet/30 bg-violet/10";
    case "nightlife":
      return "border-pink/30 bg-pink/10";
  }
}

function normalizeSpec(initialSpec: unknown): Day[] {
  if (!isRecord(initialSpec)) {
    return [
      {
        day: 1,
        base: "Your destination",
        headline: "Drop activities here",
        slots: { morning: [], afternoon: [], evening: [] },
      },
    ];
  }

  const skeleton = isRecord(initialSpec["skeleton"]) ? initialSpec["skeleton"] : null;
  const days = skeleton ? asArray(skeleton["days"]) : null;
  if (!days || !days.length) {
    return [
      {
        day: 1,
        base: "Your destination",
        headline: "Drop activities here",
        slots: { morning: [], afternoon: [], evening: [] },
      },
    ];
  }

  return days.map((dUnknown, dayIdx) => {
    const d = isRecord(dUnknown) ? dUnknown : {};
    const dayNumRaw = d["day"];
    const dayNum = typeof dayNumRaw === "number" && Number.isFinite(dayNumRaw) ? Math.max(1, Math.floor(dayNumRaw)) : dayIdx + 1;
    const base = asString(d["base"]) ?? "Base";
    const headline = asString(d["headline"]) ?? "Day plan";

    const mk = (slot: Slot, items: unknown) => {
      const arr = (asArray(items) ?? []).map((x) => asString(x)).filter((x): x is string => Boolean(x));
      return arr.slice(0, 6).map((t, idx) => ({
        id: `d${dayNum}-${slot}-${idx}`,
        title: t,
        category: toCategory(t),
      }));
    };

    return {
      day: dayNum,
      base,
      headline,
      slots: {
        morning: mk("morning", d["morning"]),
        afternoon: mk("afternoon", d["afternoon"]),
        evening: mk("evening", d["evening"]),
      },
    } satisfies Day;
  });
}

function SlotColumn({
  slot,
  activities,
}: {
  slot: Slot;
  activities: Activity[];
}) {
  const items = activities.map((a) => a.id);
  return (
    <div className="glass rounded-2xl p-3">
      <div className="px-1 text-xs text-foreground/55">
        {slot === "morning" ? "Morning" : slot === "afternoon" ? "Afternoon" : "Evening"}
      </div>
      <div className="mt-2 space-y-2">
        <SortableContext items={items}>
          {activities.map((a) => (
            <ActivityCard key={a.id} activity={a} />
          ))}
        </SortableContext>
        {activities.length === 0 ? (
          <div className="rounded-xl border border-dashed border-cyan/15 px-3 py-6 text-center text-xs text-foreground/45">
            Drop activity
          </div>
        ) : null}
      </div>
    </div>
  );
}

function ActivityCard({ activity }: { activity: Activity }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: activity.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      whileHover={{ y: -2 }}
      className={cn(
        "hover-lift rounded-xl border px-3 py-2 text-sm text-foreground/90",
        colorFor(activity.category),
        isDragging && "opacity-60",
      )}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="font-medium">{activity.title}</div>
        <div className="text-[10px] text-foreground/60">{activity.category}</div>
      </div>
      <div className="mt-1 text-xs text-foreground/60">
        Duration • Distance • Cost • Rating (live data hooks)
      </div>
    </motion.div>
  );
}

export function ItineraryBoard({ tripId, initialSpec }: { tripId: string; initialSpec: unknown }) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const initial = useMemo(() => normalizeSpec(initialSpec), [initialSpec]);
  const [days, setDays] = useState<Day[]>(initial);

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over) return;
    if (active.id === over.id) return;

    setDays((prev) => {
      // Minimal v1: only reorder within the same slot list.
      const clone = structuredClone(prev) as Day[];

      let from: { d: number; slot: Slot; idx: number } | null = null;
      let to: { d: number; slot: Slot; idx: number } | null = null;

      for (let di = 0; di < clone.length; di++) {
        const day = clone[di];
        for (const slot of ["morning", "afternoon", "evening"] as Slot[]) {
          const idx = day.slots[slot].findIndex((a) => a.id === active.id);
          if (idx !== -1) from = { d: di, slot, idx };
          const j = day.slots[slot].findIndex((a) => a.id === over.id);
          if (j !== -1) to = { d: di, slot, idx: j };
        }
      }
      if (!from || !to) return prev;

      if (from.d !== to.d || from.slot !== to.slot) return prev;

      const list = clone[from.d].slots[from.slot];
      clone[from.d].slots[from.slot] = arrayMove(list, from.idx, to.idx);
      return clone;
    });
  };

  return (
    <div className="grid gap-4">
      <GlassCard className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs text-foreground/55">Trip ID</div>
          <div className="mt-1 text-sm text-foreground/80">{tripId}</div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => alert("Coming next: gap fill + suggestions")}>
            <Sparkles className="h-4 w-4 text-violet" />
            Fill gaps
          </Button>
          <Button variant="primary" onClick={() => alert("Coming next: AI day optimization")}>
            <Wand2 className="h-4 w-4" />
            Optimize my day
          </Button>
        </div>
      </GlassCard>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <div className="grid gap-4">
          {days.map((d) => (
            <div key={d.day} className="grid gap-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <div className="text-xs text-foreground/55">Day {d.day} • Base</div>
                  <div className="text-xl font-semibold">{d.base}</div>
                </div>
                <div className="text-sm text-foreground/70">{d.headline}</div>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <SlotColumn slot="morning" activities={d.slots.morning} />
                <SlotColumn slot="afternoon" activities={d.slots.afternoon} />
                <SlotColumn slot="evening" activities={d.slots.evening} />
              </div>
            </div>
          ))}
        </div>
      </DndContext>
    </div>
  );
}
