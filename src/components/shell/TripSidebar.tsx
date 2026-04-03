"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bookmark,
  Compass,
  Lightbulb,
  MessageCircle,
  Plus,
  Sparkles,
  Upload,
  Wallet,
  Plane,
  Hotel,
  Map,
  Backpack,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { brand } from "@config/brand";

const primary = [
  { label: "Dashboard", icon: Sparkles, href: (id: string) => `/trip/${id}` },
  { label: "Chats", icon: MessageCircle, href: (id: string) => `/chat/${id}` },
  { label: "Trips", icon: Sparkles, href: () => "/" },
  { label: "Explore", icon: Compass, href: () => "/" },
  { label: "Saved", icon: Bookmark, href: () => "/" },
  { label: "Updates", icon: Upload, href: () => "/" },
  { label: "Inspiration", icon: Lightbulb, href: () => "/" },
  { label: "Create", icon: Plus, href: () => "/" },
];

const modules = [
  { label: "Flights", icon: Plane, href: (id: string) => `/plan/${id}/flights` },
  { label: "Hotels", icon: Hotel, href: (id: string) => `/plan/${id}/hotels` },
  { label: "City Hub", icon: Map, href: (id: string) => `/plan/${id}/city/demo-city` },
  { label: "Budget", icon: Wallet, href: (id: string) => `/plan/${id}/budget` },
  { label: "Packing", icon: Backpack, href: (id: string) => `/plan/${id}/packing` },
];

export function TripSidebar({ tripId }: { tripId: string }) {
  const pathname = usePathname();

  const Item = ({
    label,
    href,
    icon: Icon,
  }: {
    label: string;
    href: (id: string) => string;
    icon: React.ComponentType<{ className?: string }>;
  }) => {
    const to = href(tripId);
    const active = pathname === to;
    return (
      <Link
        href={to}
        className={cn(
          "focus-ring flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-foreground/70 hover:bg-cyan/5",
          active && "bg-cyan/10 text-foreground",
        )}
      >
        <Icon className={cn("h-4 w-4", active && "text-cyan")} />
        <span>{label}</span>
      </Link>
    );
  };

  return (
    <aside className="glass sticky top-0 hidden h-screen w-[270px] shrink-0 flex-col justify-between rounded-none border-r border-cyan/10 bg-background/80 p-4 backdrop-blur md:flex">
      <div>
        <Link href="/" className="flex items-baseline gap-3 px-2 py-3">
          <span className="text-sm tracking-[0.32em] text-foreground/70">{brand.logoText}</span>
          <span className="text-xs text-foreground/45">Trip OS</span>
        </Link>

        <div className="mt-3 space-y-1">
          {primary.map((it) => (
            <Item key={it.label} label={it.label} icon={it.icon} href={it.href} />
          ))}
        </div>

        <div className="mt-5 px-2 text-xs text-foreground/45">Modules</div>
        <div className="mt-2 space-y-1">
          {modules.map((it) => (
            <Item key={it.label} label={it.label} icon={it.icon} href={it.href} />
          ))}
        </div>
      </div>

      <div className="mt-6 px-2 text-xs text-foreground/45">
        Trip ID: <span className="text-foreground/60">{tripId.slice(0, 8)}</span>
      </div>
    </aside>
  );
}
