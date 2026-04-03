import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

export function getSupabaseServiceClient() {
  const url = env.server.SUPABASE_URL;
  const key = env.server.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function getSupabaseAnonServerClient() {
  const url = env.server.SUPABASE_URL;
  const key = env.server.SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

