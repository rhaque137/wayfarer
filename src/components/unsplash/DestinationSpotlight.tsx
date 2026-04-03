"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";

export function DestinationSpotlight({
  query,
  kicker = "Destination Spotlight",
}: {
  query: string;
  kicker?: string;
}) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(true);

  const q = useMemo(() => query.trim(), [query]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/place-photo", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ placeName: q, city: q }),
    })
      .then((r) => r.json().then((j) => ({ ok: r.ok, j })))
      .then(({ ok, j }) => {
        if (!ok) throw new Error(j?.error ?? "Wikipedia lookup failed");
        const u = typeof j?.photoUrl === "string" ? (j.photoUrl as string) : null;
        if (!cancelled) setPhotoUrl(u);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Wikipedia lookup failed");
      })
      .finally(() => {
        if (!cancelled) setBusy(false);
      });
    return () => {
      cancelled = true;
    };
  }, [q]);

  return (
    <GlassCard className="relative overflow-hidden p-0">
      <div className="p-4">
        <div className="text-xs text-foreground/55">{kicker}</div>
        <div className="mt-1 text-base font-semibold">{query}</div>
      </div>

      <div className="relative aspect-[16/10] w-full">
        {busy ? (
          <div className="absolute inset-0 animate-pulse bg-cyan/5" />
        ) : photoUrl ? (
          <>
            <Image
              src={photoUrl}
              alt={query}
              fill
              sizes="(max-width: 768px) 100vw, 520px"
              className="object-cover"
              priority={false}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/85 via-background/25 to-transparent" />
          </>
        ) : error ? (
          <div className="absolute inset-0 flex items-center justify-center p-6 text-sm text-pink">{error}</div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center p-6 text-sm text-foreground/60">
            No photo found.
          </div>
        )}
      </div>
    </GlassCard>
  );
}
