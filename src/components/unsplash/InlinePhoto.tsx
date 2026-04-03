"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

const cache = new Map<string, string>();

export function InlinePhoto({
  query,
  alt,
}: {
  query: string;
  alt: string;
}) {
  const [fetchedUrl, setFetchedUrl] = useState<string | null>(null);
  const q = useMemo(() => query.trim(), [query]);
  const cachedUrl = useMemo(() => (q ? cache.get(q) ?? null : null), [q]);

  useEffect(() => {
    if (!q) return;
    if (cachedUrl) return;

    let cancelled = false;
    fetch("/api/place-photo", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ placeName: q }),
    })
      .then((r) => r.json().then((j) => ({ ok: r.ok, j })))
      .then(({ ok, j }) => {
        if (!ok) return;
        const u = typeof j?.photoUrl === "string" ? (j.photoUrl as string) : null;
        if (!u) return;
        cache.set(q, u);
        if (!cancelled) setFetchedUrl(u);
      })
      .catch(() => {})
      .finally(() => {});

    return () => {
      cancelled = true;
    };
  }, [q, cachedUrl]);

  const url = cachedUrl ?? fetchedUrl;

  if (!url) {
    return <div className="h-full w-full animate-pulse rounded-2xl bg-cyan/5" />;
  }

  return (
    <Image
      src={url}
      alt={alt}
      fill
      sizes="220px"
      className="rounded-2xl object-cover"
    />
  );
}
