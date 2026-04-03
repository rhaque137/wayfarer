"use client";

import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

let client: ReturnType<typeof createClient> | null = null;

export function getSupabaseBrowserClient() {
  if (client) return client;
  const url = env.client.NEXT_PUBLIC_SUPABASE_URL ?? env.server.SUPABASE_URL;
  const key = env.client.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? env.server.SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  client = createClient(url, key);
  return client;
}

