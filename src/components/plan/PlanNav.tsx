"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plane, Hotel, Map, Wallet, Backpack, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";
import { brand } from "@config/brand";

const items = [
  { key: "workspace", label: "Plan", icon: LayoutGrid, href: (id: string) => `/plan/${id}` },
  { key: "flights", label: "Flights", icon: Plane, href: (id: string) => `/plan/${id}/flights` },
  { key: "hotels", label: "Hotels", icon: Hotel, href: (id: string) => `/plan/${id}/hotels` },
  { key: "city", label: "City Hub", icon: Map, href: (id: string) => `/plan/${id}/city/demo-city` },
  { key: "budget", label: "Budget", icon: Wallet, href: (id: string) => `/plan/${id}/budget` },
  { key: "packing", label: "Packing", icon: Backpack, href: (id: string) => `/plan/${id}/packing` },
];

export function PlanNav({ tripId }: { tripId: string }) {
  const pathname = usePathname();
  return (
    <>
      <div className="sticky top-0 z-30 border-b border-cyan/10 bg-background/70 backdrop-blur md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6">
          <Link href="/" className="text-sm tracking-[0.32em] text-foreground/70">
            {brand.logoText}
          </Link>
          <div className="hidden gap-1 md:flex">
            {items.map((it) => {
              const href = it.href(tripId);
              const active = pathname === href;
              const Icon = it.icon;
              return (
                <Link
                  key={it.key}
                  href={href}
                  className={cn(
                    "hover-lift glass inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-foreground/80",
                    active && "border-cyan/35 bg-cyan/10 text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {it.label}
                </Link>
              );
            })}
          </div>
          <div className="text-xs text-foreground/50">Trip: {tripId.slice(0, 8)}</div>
        </div>
      </div>

      <nav className="fixed bottom-3 left-1/2 z-40 w-[min(520px,calc(100%-24px))] -translate-x-1/2 md:hidden">
        <div className="glass grid grid-cols-6 rounded-2xl p-2">
          {items.map((it) => {
            const href = it.href(tripId);
            const active = pathname === href;
            const Icon = it.icon;
            return (
              <Link
                key={it.key}
                href={href}
                className={cn(
                  "focus-ring inline-flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-[10px] text-foreground/70",
                  active && "bg-cyan/10 text-foreground",
                )}
              >
                <Icon className={cn("h-4 w-4", active && "text-cyan")} />
                {it.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

