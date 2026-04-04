"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type AuthUser = { email?: string | null };

export function AuthBar() {
  const supabase = getSupabaseBrowserClient();
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    if (!supabase) return;
    let mounted = true;
    supabase.auth.getUser().then(({ data }) => {
      if (mounted) setUser(data.user ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => {
      mounted = false;
      sub.subscription?.unsubscribe();
    };
  }, [supabase]);

  if (!supabase) return null;

  return (
    <div className="flex items-center gap-3">
      {user ? (
        <>
          <span className="text-xs text-foreground/70">Signed in as {user.email}</span>
          <button
            onClick={() => supabase.auth.signOut()}
            className="rounded-full border border-panel-border bg-white px-4 py-2 text-xs font-semibold text-foreground shadow-sm hover:bg-slate-50"
          >
            Sign out
          </button>
        </>
      ) : (
        <button
          onClick={() =>
            supabase.auth.signInWithOAuth({
              provider: "google",
              options: { redirectTo: window.location.origin },
            })
          }
          className="rounded-full bg-foreground px-4 py-2 text-xs font-semibold text-white shadow-sm hover:opacity-90"
        >
          Sign in with Google
        </button>
      )}
    </div>
  );
}
