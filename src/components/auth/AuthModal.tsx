"use client";

import { useEffect, useRef, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth/context";

const GOOGLE_ICON = (
  <svg className="h-4 w-4" viewBox="0 0 24 24">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  );
}

export function AuthModal() {
  const { authOpen, authTab, closeAuth } = useAuth();
  const supabase = getSupabaseBrowserClient();
  const overlayRef = useRef<HTMLDivElement>(null);

  const [tab, setTab] = useState<"login" | "signup">(authTab);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Sync tab when opened
  useEffect(() => {
    if (authOpen) {
      setTab(authTab);
      setError(null);
      setSuccess(null);
      setEmail("");
      setPassword("");
      setFullName("");
    }
  }, [authOpen, authTab]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeAuth();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [closeAuth]);

  if (!authOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) closeAuth();
  };

  const handleGoogleSignIn = async () => {
    if (!supabase) {
      setError("Sign in is unavailable because Supabase is not configured.");
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);

    const next = `${window.location.pathname}${window.location.search}` || "/trips";
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });

      if (oauthError) {
        setError(oauthError.message || "Google sign-in could not start. Please try again.");
        setLoading(false);
        return;
      }

      setSuccess("Redirecting to Google...");
    } catch {
      setError("Google sign-in could not start. Please try again.");
      setLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    if (!supabase) {
      setError("Sign in is unavailable because Supabase is not configured.");
      return;
    }
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
    } else {
      closeAuth();
    }
    setLoading(false);
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    if (!supabase) {
      setError("Sign up is unavailable because Supabase is not configured.");
      return;
    }
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent("/trips")}`,
      },
    });
    if (error) {
      setError(error.message);
    } else if (data.user && !data.session) {
      setSuccess("Check your email to confirm your account!");
    } else {
      closeAuth();
    }
    setLoading(false);
  };

  const handleForgotPassword = async () => {
    if (!supabase) {
      setError("Password reset is unavailable because Supabase is not configured.");
      return;
    }
    if (!email) {
      setError("Enter your email address first.");
      return;
    }
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?type=recovery&next=${encodeURIComponent("/login")}`,
    });
    if (error) {
      setError(error.message);
    } else {
      setSuccess("Password reset email sent!");
    }
    setLoading(false);
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      style={{ animation: "fadeIn 180ms ease" }}
    >
      <div
        className="relative mx-4 w-full max-w-md rounded-3xl bg-white shadow-2xl"
        style={{ animation: "slideUp 220ms cubic-bezier(0.16, 1, 0.3, 1)" }}
      >
        {/* Header gradient banner */}
        <div className="relative overflow-hidden rounded-t-3xl bg-gradient-to-br from-[#1a1a1a] via-[#2d1a0e] to-[#E8472A] px-8 pb-8 pt-8">
          <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-white/5 -translate-y-8 translate-x-8" />
          <div className="absolute bottom-0 left-12 h-20 w-20 rounded-full bg-[#E8472A]/20" />
          
          <button
            onClick={closeAuth}
            aria-label="Close"
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/70 transition hover:bg-white/20 hover:text-white"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>

          <div className="relative flex items-center gap-2">
            <div className="text-xl font-bold text-white">Wayfarer</div>
            <div className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold text-white/80 uppercase tracking-wide">
              AI Travel
            </div>
          </div>
          <h2 className="relative mt-3 text-2xl font-bold text-white">
            {tab === "login" ? "Welcome back" : "Start your journey"}
          </h2>
          <p className="relative mt-1 text-sm text-white/70">
            {tab === "login"
              ? "Sign in to access your saved trips and itineraries"
              : "Create an account to save and sync your trips anywhere"}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-neutral-100 px-8">
          {(["login", "signup"] as const).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setError(null); setSuccess(null); }}
              className={`relative flex-1 py-4 text-sm font-semibold transition-colors ${
                tab === t ? "text-[#E8472A]" : "text-neutral-400 hover:text-neutral-700"
              }`}
            >
              {t === "login" ? "Sign In" : "Create Account"}
              {tab === t && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E8472A] rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="px-8 py-6">
          {/* Google button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            aria-label="Continue with Google"
            aria-busy={loading}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-neutral-200 bg-white py-3 text-sm font-semibold text-neutral-700 shadow-sm transition-all hover:bg-neutral-50 hover:shadow-md disabled:opacity-60"
          >
            {loading ? <Spinner /> : GOOGLE_ICON}
            Continue with Google
          </button>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-neutral-100" />
            <span className="text-xs font-medium text-neutral-400">or</span>
            <div className="h-px flex-1 bg-neutral-100" />
          </div>

          {/* Form */}
          <form onSubmit={tab === "login" ? handleEmailSignIn : handleEmailSignUp} className="flex flex-col gap-3">
            {tab === "signup" && (
              <div>
                <label className="mb-1 block text-xs font-medium text-neutral-600" htmlFor="auth-fullname">
                  Full Name
                </label>
                <input
                  id="auth-fullname"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Alex Johnson"
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-foreground outline-none transition-all placeholder:text-neutral-400 focus:border-[#E8472A] focus:bg-white focus:ring-4 focus:ring-[#E8472A]/10"
                />
              </div>
            )}

            <div>
              <label className="mb-1 block text-xs font-medium text-neutral-600" htmlFor="auth-email">
                Email Address
              </label>
              <input
                id="auth-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-foreground outline-none transition-all placeholder:text-neutral-400 focus:border-[#E8472A] focus:bg-white focus:ring-4 focus:ring-[#E8472A]/10"
              />
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="text-xs font-medium text-neutral-600" htmlFor="auth-password">
                  Password
                </label>
                {tab === "login" && (
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-xs text-[#E8472A] hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <input
                id="auth-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={tab === "signup" ? "At least 8 characters" : "••••••••"}
                required
                minLength={tab === "signup" ? 8 : undefined}
                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-foreground outline-none transition-all placeholder:text-neutral-400 focus:border-[#E8472A] focus:bg-white focus:ring-4 focus:ring-[#E8472A]/10"
              />
            </div>

            {error && (
              <div role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-xs font-medium text-red-600">
                {error}
              </div>
            )}
            {success && (
              <div aria-live="polite" className="rounded-xl bg-green-50 px-4 py-3 text-xs font-medium text-green-700">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              aria-busy={loading}
              className="mt-1 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#1a1a1a] to-[#2d2d2d] text-sm font-bold text-white shadow-md transition-all hover:opacity-90 hover:shadow-lg disabled:opacity-60"
            >
              {loading ? <Spinner /> : null}
              {tab === "login" ? "Sign In" : "Create Account"}
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-neutral-400">
            {tab === "login" ? (
              <>
                Don&apos;t have an account?{" "}
                <button
                  onClick={() => { setTab("signup"); setError(null); setSuccess(null); }}
                  className="font-semibold text-[#E8472A] hover:underline"
                >
                  Sign up free
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  onClick={() => { setTab("login"); setError(null); setSuccess(null); }}
                  className="font-semibold text-[#E8472A] hover:underline"
                >
                  Sign in
                </button>
              </>
            )}
          </p>

          <p className="mt-4 text-center text-[10px] text-neutral-300">
            By continuing you agree to our Terms of Service & Privacy Policy
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(24px) scale(0.97) } to { opacity: 1; transform: none } }
      `}</style>
    </div>
  );
}
