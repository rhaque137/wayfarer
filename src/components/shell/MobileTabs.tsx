"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle, Map, Plane, Hotel, Wallet, Backpack } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: (id: string) => `/chat/${id}`, icon: MessageCircle, label: "Chat" },
  { href: (id: string) => `/trip/${id}`, icon: Map, label: "Trip" },
  { href: (id: string) => `/plan/${id}/flights`, icon: Plane, label: "Flights" },
  { href: (id: string) => `/plan/${id}/hotels`, icon: Hotel, label: "Hotels" },
  { href: (id: string) => `/plan/${id}/budget`, icon: Wallet, label: "Budget" },
  { href: (id: string) => `/plan/${id}/packing`, icon: Backpack, label: "Packing" },
];

export function MobileTabs({ tripId }: { tripId: string }) {
  const pathname = usePathname();
  return (
    <nav className="glass fixed bottom-3 left-1/2 z-40 w-[min(560px,calc(100%-24px))] -translate-x-1/2 rounded-2xl p-2 md:hidden">
      <div className="grid grid-cols-6 gap-1">
        {tabs.map((t) => {
          const href = t.href(tripId);
          const active = pathname === href;
          const Icon = t.icon;
          return (
            <Link
              key={t.label}
              href={href}
              className={cn(
                "focus-ring flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-[10px] text-foreground/70",
                active && "bg-cyan/10 text-foreground",
              )}
            >
              <Icon className={cn("h-4 w-4", active && "text-cyan")} />
              {t.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

