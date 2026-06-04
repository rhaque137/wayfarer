"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { ensureUserProfile } from "@/lib/auth/context";

function safeNext(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/trips";
  return value;
}

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("Sign in is unavailable because Supabase is not configured.");
      return;
    }

    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const code = params.get("code");
      const authError = params.get("error") ?? hash.get("error");
      const authErrorDescription =
        params.get("error_description") ?? hash.get("error_description");
      const accessToken = hash.get("access_token");
      const refreshToken = hash.get("refresh_token");
      const type = params.get("type");
      const next = safeNext(params.get("next"));

      if (authError) {
        setError(authErrorDescription ?? authError);
        return;
      }

      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          setError(exchangeError.message || "We could not finish signing you in.");
          return;
        }
      } else if (accessToken && refreshToken) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (sessionError) {
          setError(sessionError.message || "We could not restore your sign-in session.");
          return;
        }
      } else {
        const { data } = await supabase.auth.getUser();
        if (!data.user) {
          setError("This sign-in link is missing the expected verification code. Please try signing in again.");
          return;
        }
      }

      const { data } = await supabase.auth.getUser();
      if (data.user) {
        await ensureUserProfile(supabase, data.user);
      }

      if (type === "recovery") {
        router.replace("/login?type=recovery");
      } else {
        router.replace(next);
      }
    };

    void handleCallback().catch(() => {
      setError("Something went wrong finishing sign-in. Please try again.");
    });
  }, [router]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="w-full max-w-md rounded-3xl border border-neutral-200 bg-white p-8 text-center shadow-xl">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
            !
          </div>
          <h1 className="mt-4 text-2xl font-bold text-neutral-950">Sign-in needs another try</h1>
          <p role="alert" className="mt-3 text-sm leading-6 text-neutral-600">
            {error}
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={() => router.replace("/login")}
              className="rounded-full bg-[#E8472A] px-5 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#c83a22]"
            >
              Try sign in again
            </button>
            <button
              type="button"
              onClick={() => router.replace("/support")}
              className="rounded-full border border-neutral-200 bg-white px-5 py-3 text-sm font-semibold text-neutral-700 transition-colors hover:border-[#E8472A] hover:text-[#E8472A]"
            >
              Contact support
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center" aria-live="polite" aria-busy="true">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-neutral-200 border-t-[#E8472A]" />
        <p className="mt-4 text-sm text-neutral-500">Signing you in…</p>
      </div>
    </div>
  );
}
