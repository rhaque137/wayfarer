import { createClient } from "@supabase/supabase-js";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { NextRequest, NextResponse } from "next/server";
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

export type SupabaseCookieToSet = {
  name: string;
  value: string;
  options: CookieOptions;
};

export function createSupabaseRouteHandlerClient(request: NextRequest) {
  const url = env.client.NEXT_PUBLIC_SUPABASE_URL;
  const key = env.client.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const cookiesToSet: SupabaseCookieToSet[] = [];

  if (!url || !key) {
    return { supabase: null, cookiesToSet };
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll().map(({ name, value }) => ({ name, value }));
      },
      setAll(nextCookies) {
        cookiesToSet.push(...nextCookies);
      },
    },
  });

  return { supabase, cookiesToSet };
}

export function applySupabaseCookies(
  response: NextResponse,
  cookiesToSet: SupabaseCookieToSet[],
) {
  cookiesToSet.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options);
  });
  return response;
}
