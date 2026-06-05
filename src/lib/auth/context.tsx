"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { User } from "@supabase/supabase-js";
import { ensureUserProfile, type UserProfile } from "@/lib/auth/profile";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

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
