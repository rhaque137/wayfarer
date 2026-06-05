"use client";

import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

let client: ReturnType<typeof createClient> | null = null;
let warnedMissingSupabase = false;

export function getSupabaseBrowserClient() {
  if (client) return client;
  const url = env.client.NEXT_PUBLIC_SUPABASE_URL;
  const key = env.client.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    if (process.env.NODE_ENV !== "production" && !warnedMissingSupabase) {
      console.warn(
        "Wayfarer auth: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is missing; sign-in is unavailable.",
      );
      warnedMissingSupabase = true;
    }
    return null;
  }
  client = createClient(url, key);
  return client;
}
