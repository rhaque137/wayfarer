import { NextRequest, NextResponse } from "next/server";
import { ensureUserProfile } from "@/lib/auth/profile";
import {
  applySupabaseCookies,
  createSupabaseRouteHandlerClient,
  type SupabaseCookieToSet,
} from "@/lib/supabase/server";

export const runtime = "nodejs";

function isSafeRelativePath(value: string | null) {
  return Boolean(value && value.startsWith("/") && !value.startsWith("//"));
}

function redirectWithCookies(
  requestUrl: URL,
  path: string,
  cookiesToSet: SupabaseCookieToSet[] = [],
) {
  return applySupabaseCookies(
    NextResponse.redirect(new URL(path, requestUrl.origin)),
    cookiesToSet,
  );
}

function redirectToLoginError(
  requestUrl: URL,
  message: string,
  cookiesToSet: SupabaseCookieToSet[] = [],
) {
  const params = new URLSearchParams({ error: message });
  return redirectWithCookies(requestUrl, `/login?${params.toString()}`, cookiesToSet);
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const authError = requestUrl.searchParams.get("error");
  const authErrorDescription = requestUrl.searchParams.get("error_description");
  const type = requestUrl.searchParams.get("type");
  const next = requestUrl.searchParams.get("next");

  if (authError) {
    return redirectToLoginError(requestUrl, authErrorDescription || authError);
  }

  if (!code) {
    return redirectToLoginError(requestUrl, "Missing authentication code. Please try signing in again.");
  }

  const { supabase, cookiesToSet } = createSupabaseRouteHandlerClient(request);

  if (!supabase) {
    return redirectToLoginError(
      requestUrl,
      "Authentication is not configured. Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    return redirectToLoginError(
      requestUrl,
      exchangeError.message || "Could not finish signing you in.",
      cookiesToSet,
    );
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return redirectToLoginError(
      requestUrl,
      "Could not load your account after sign in. Please try again.",
      cookiesToSet,
    );
  }

  try {
    await ensureUserProfile(supabase, user);
  } catch (error) {
    console.error("Wayfarer auth: profile upsert threw during callback", error);
  }

  if (type === "recovery") {
    return redirectWithCookies(requestUrl, "/login?type=recovery", cookiesToSet);
  }

  return redirectWithCookies(
    requestUrl,
    isSafeRelativePath(next) ? next as string : "/trips",
    cookiesToSet,
  );
}
