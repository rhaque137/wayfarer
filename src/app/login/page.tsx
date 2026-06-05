"use client";

import { useEffect, useMemo, useState } from "react";
import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth/context";

const GOOGLE_ICON = (
  <svg className="h-5 w-5" viewBox="0 0 24 24">
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

function LoginPageContent() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") === "signup" ? "signup" : "login";
  const provider = searchParams.get("provider");
  const nextPath = searchParams.get("next") ?? "/trips";
  const authError = searchParams.get("error");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(authError);
  const [success, setSuccess] = useState<string | null>(null);
  const authEnabled = Boolean(supabase);

  useEffect(() => {
    if (!loading && user) {
      router.replace(nextPath.startsWith("/") && !nextPath.startsWith("//") ? nextPath : "/trips");
    }
  }, [user, loading, router, nextPath]);

  useEffect(() => {
    if (provider === "google" && authEnabled && !user && !loading) {
      void runGoogle();
    }
    // run once per query-state mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider, user, loading]);

  const runGoogle = async () => {
    if (!supabase) {
      setError("Sign in is unavailable because Supabase is not configured.");
      return;
    }
    setPending(true);
    setError(null);
    setSuccess(null);

    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(
            nextPath.startsWith("/") && !nextPath.startsWith("//") ? nextPath : "/trips",
          )}`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (oauthError) {
        setError(oauthError.message || "Google sign-in could not start. Please try again.");
        setPending(false);
        return;
      }

      setSuccess("Redirecting to Google...");
    } catch {
      setError("Google sign-in could not start. Please try again.");
      setPending(false);
    }
  };

  const runEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      setError("Sign in is unavailable because Supabase is not configured.");
      return;
    }
    setPending(true);
    setError(null);
    const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
    if (loginError) setError(loginError.message);
    else router.replace(nextPath.startsWith("/") && !nextPath.startsWith("//") ? nextPath : "/trips");
    setPending(false);
  };

  const runEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      setError("Sign up is unavailable because Supabase is not configured.");
      return;
    }
    setPending(true);
    setError(null);
    setSuccess(null);
    const { data, error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent("/trips")}`,
      },
    });
    if (signupError) {
      setError(signupError.message);
    } else if (data.user && !data.session) {
      setSuccess("Check your email to confirm your account.");
    } else {
      router.replace("/trips");
    }
    setPending(false);
  };

  const runForgot = async () => {
    if (!supabase) {
      setError("Password reset is unavailable because Supabase is not configured.");
      return;
    }
    if (!email) {
      setError("Enter your email address first.");
      return;
    }
    setPending(true);
    setError(null);
    setSuccess(null);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?type=recovery&next=${encodeURIComponent("/login")}`,
    });
    if (resetError) setError(resetError.message);
    else setSuccess("Password reset email sent.");
    setPending(false);
  };

  return (
    <main className="min-h-screen bg-[#fff4f3] text-[#4d2124]">
      <div className="flex min-h-screen flex-col md:flex-row">
        <section className="relative h-64 w-full overflow-hidden md:h-screen md:w-1/2 lg:w-3/5">
          <img
            src="https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1800&q=80"
            alt="Amalfi Coast"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-black/5" />
          <div className="absolute left-8 top-8 flex items-center gap-3 md:left-12 md:top-12">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-lg">
              <span className="text-3xl text-[#b22005]">◉</span>
            </div>
            <span className="text-4xl font-extrabold tracking-tight text-white">Wayfarer</span>
          </div>
          <div className="absolute bottom-12 left-12 right-12 hidden text-white lg:block">
            <h2 className="text-5xl font-bold leading-tight">
              Discover the art of
              <br />
              premium travel planning.
            </h2>
            <p className="mt-4 max-w-lg text-xl text-white/90">
              Join a community of sophisticated explorers utilizing AI-driven concierges to curate unforgettable journeys.
            </p>
          </div>
        </section>

        <section className="flex w-full items-center justify-center bg-[#fff4f3] p-6 md:w-1/2 md:p-12 lg:w-2/5 lg:p-20">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <h1 className="text-4xl font-extrabold tracking-tight text-[#4d2124] md:text-5xl">
                {tab === "signup" ? "Create your account" : "Plan a complete, editable trip in minutes."}
              </h1>
              <p className="mt-3 text-lg leading-relaxed text-[#834c4f] md:text-xl">
                Start as a guest on this device, then create a free account later for cloud sync and sharing.
              </p>
            </div>

            <Link
              href="/try"
              className="flex min-h-12 w-full items-center justify-center rounded-xl bg-[#b22005] px-5 py-4 text-lg font-bold text-[#ffefec] shadow-[0_12px_32px_rgba(178,32,5,0.16)] transition hover:bg-[#9e1700]"
            >
              Continue as guest
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-[#834c4f]">
              No credit card. Guest trips save on this device. Create an account later for cloud sync.
            </p>

            {authEnabled ? (
              <>
                <button
                  onClick={runGoogle}
                  disabled={pending}
                  aria-label="Continue with Google"
                  aria-busy={pending}
                  className="mt-6 flex min-h-12 w-full items-center justify-center gap-3 rounded-xl border border-[#df9c9e]/20 bg-white py-3.5 text-base font-semibold text-[#4d2124] shadow-[0_12px_32px_rgba(77,33,36,0.06)] transition hover:bg-[#ffedec] disabled:opacity-70"
                >
                  {pending ? <Spinner /> : GOOGLE_ICON}
                  {pending ? "Redirecting to Google..." : "Continue with Google"}
                </button>

                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#df9c9e]/30" />
                  </div>
                  <div className="relative flex justify-center text-sm font-bold uppercase tracking-[0.2em] text-[#834c4f]/70">
                    <span className="bg-[#fff4f3] px-3">or use email</span>
                  </div>
                </div>

                <form onSubmit={tab === "login" ? runEmailLogin : runEmailSignup} className="space-y-5">
              {tab === "signup" && (
                <div>
                  <label htmlFor="login-full-name" className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#834c4f]">
                    Full Name
                  </label>
                  <input
                    id="login-full-name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Alex Traveler"
                    autoComplete="name"
                    className="w-full rounded-xl border-none bg-[#ffedec] px-4 py-4 text-lg text-[#4d2124] outline-none transition placeholder:text-[#834c4f]/60 focus:bg-white focus:ring-0"
                  />
                </div>
              )}

              <div>
                <label htmlFor="login-email" className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#834c4f]">
                  Email Address
                </label>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@voyager.com"
                  autoComplete="email"
                  required
                  className="w-full rounded-xl border-none bg-[#ffedec] px-4 py-4 text-lg text-[#4d2124] outline-none transition placeholder:text-[#834c4f]/60 focus:bg-white focus:ring-0"
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label htmlFor="login-password" className="text-xs font-bold uppercase tracking-[0.16em] text-[#834c4f]">
                    Password
                  </label>
                  {tab === "login" && (
                    <button
                      type="button"
                      onClick={runForgot}
                      className="text-sm font-bold text-[#b22005] hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={tab === "signup" ? 8 : undefined}
                  placeholder="••••••••"
                  autoComplete={tab === "signup" ? "new-password" : "current-password"}
                  className="w-full rounded-xl border-none bg-[#ffedec] px-4 py-4 text-lg text-[#4d2124] outline-none transition placeholder:text-[#834c4f]/60 focus:bg-white focus:ring-0"
                />
              </div>

              {error && <div role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
              {success && <div aria-live="polite" className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">{success}</div>}

              <button
                type="submit"
                disabled={pending}
                aria-busy={pending}
                className="w-full rounded-xl bg-[#b22005] py-4 text-3xl font-bold text-[#ffefec] transition hover:bg-[#9e1700] disabled:opacity-70"
              >
                {pending ? "Please wait..." : tab === "login" ? "Log In" : "Create Account"}
              </button>
                </form>

                <div className="mt-8 border-t border-[#df9c9e]/20 pt-6 text-center text-lg text-[#834c4f]">
              {tab === "login" ? (
                <>
                  Don&apos;t have an account?{" "}
                  <Link href="/login?tab=signup" className="font-bold text-[#b22005] hover:underline">
                    Create account
                  </Link>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <Link href="/login" className="font-bold text-[#b22005] hover:underline">
                    Sign in
                  </Link>
                </>
              )}
                </div>
              </>
            ) : (
              <div className="mt-6 rounded-2xl border border-[#df9c9e]/30 bg-white/70 p-4 text-sm leading-relaxed text-[#834c4f]">
                Account login is currently hidden because cloud auth is not configured. You can still use Wayfarer as a guest and save trips locally on this device.
              </div>
            )}

            <div className="mt-10 text-center">
              <div className="mb-2 flex items-center justify-center gap-2">
                <span className="h-2 w-2 rounded-full bg-gradient-to-r from-[#652fe7] to-[#ff8fa9]" />
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#652fe7]/80">
                  Powered by Voyager Intelligence
                </span>
              </div>
              <p className="mx-auto max-w-xs text-[11px] leading-relaxed text-[#834c4f]/40">
                By logging in, you agree to Wayfarer&apos;s Terms of Service and Privacy Policy. Securely encrypted.
              </p>
              <Link href="/try" className="mt-6 inline-block text-sm font-semibold text-[#834c4f] hover:text-[#b22005]">
                Continue as guest
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#fff4f3] text-[#4d2124]">
          <div className="text-sm text-[#834c4f]">Loading login…</div>
        </main>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
