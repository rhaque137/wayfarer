"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export type UserProfile = {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  home_city: string | null;
  travel_style: string | null;
  created_at: string;
  updated_at?: string | null;
};

type SupabaseBrowserClient = NonNullable<ReturnType<typeof getSupabaseBrowserClient>>;

function metadataString(user: User, key: string) {
  const value = (user.user_metadata as Record<string, unknown> | null)?.[key];
  return typeof value === "string" && value.trim() ? value : null;
}

function profilePayload(user: User) {
  const fullName =
    metadataString(user, "full_name") ??
    metadataString(user, "name") ??
    user.email?.split("@")[0] ??
    null;

  return {
    id: user.id,
    email: user.email ?? null,
    full_name: fullName,
    avatar_url: metadataString(user, "avatar_url") ?? metadataString(user, "picture"),
    updated_at: new Date().toISOString(),
  };
}

export async function ensureUserProfile(
  supabase: SupabaseBrowserClient,
  user: User,
): Promise<UserProfile | null> {
  const { data: existing, error: fetchError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (existing && !fetchError) return existing as UserProfile;

  if (fetchError) {
    console.warn("Wayfarer auth: profile lookup failed, attempting upsert", fetchError.message);
  }

  const { data, error } = await supabase
    .from("profiles")
    .upsert(profilePayload(user) as never, { onConflict: "id" })
    .select("*")
    .maybeSingle();

  if (error) {
    console.warn("Wayfarer auth: profile upsert failed", error.message);
    return existing ? (existing as UserProfile) : null;
  }

  return data as UserProfile | null;
}

type AuthContextValue = {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  openAuth: (tab?: "login" | "signup") => void;
  closeAuth: () => void;
  authOpen: boolean;
  authTab: "login" | "signup";
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = getSupabaseBrowserClient();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "signup">("login");

  const fetchProfile = useCallback(
    async (nextUser: User) => {
      if (!supabase) return;
      const nextProfile = await ensureUserProfile(supabase, nextUser);
      setProfile(nextProfile);
    },
    [supabase],
  );

  const refreshProfile = useCallback(async () => {
    if (user) await fetchProfile(user);
  }, [user, fetchProfile]);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
      if (data.user) {
        void fetchProfile(data.user);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        void fetchProfile(session.user);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, fetchProfile]);

  const openAuth = useCallback((tab: "login" | "signup" = "login") => {
    setAuthTab(tab);
    setAuthOpen(true);
  }, []);

  const closeAuth = useCallback(() => setAuthOpen(false), []);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setProfile(null);
  }, [supabase]);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        openAuth,
        closeAuth,
        authOpen,
        authTab,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
