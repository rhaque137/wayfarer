"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/context";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function UserMenu() {
  const { user, profile, loading, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const supabase = getSupabaseBrowserClient();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (loading) {
    return (
      <div
        aria-live="polite"
        className="rounded-full border border-neutral-200 bg-white px-4 py-2 text-xs font-semibold text-neutral-500 shadow-sm"
      >
        Checking sign in
      </div>
    );
  }

  if (!supabase) {
    return (
      <Link
        href="/login"
        title="Create a free account when authentication is configured. You can keep planning as a guest for now."
        className="rounded-full border border-neutral-200 bg-white px-4 py-2 text-xs font-semibold text-neutral-700 shadow-sm transition-colors hover:border-[#E8472A] hover:text-[#E8472A]"
      >
        Guest mode
      </Link>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link
          id="nav-google-btn"
          href="/login?provider=google"
          className="rounded-full border border-neutral-200 bg-white px-4 py-2 text-xs font-semibold text-neutral-700 shadow-sm transition-colors hover:border-[#E8472A] hover:text-[#E8472A]"
          aria-label="Continue with Google"
        >
          Google
        </Link>
        <Link
          id="nav-signin-btn"
          href="/login"
          className="rounded-full border border-neutral-200 bg-white px-4 py-2 text-xs font-semibold text-neutral-700 shadow-sm transition-colors hover:border-[#E8472A] hover:text-[#E8472A]"
        >
          Log In
        </Link>
        <Link
          id="nav-signup-btn"
          href="/login?tab=signup"
          className="rounded-full bg-gradient-to-r from-[#1a1a1a] to-[#2d2d2d] px-4 py-2 text-xs font-bold text-white shadow-sm transition-opacity hover:opacity-90"
        >
          Get Started
        </Link>
      </div>
    );
  }

  const initial = profile?.full_name
    ? profile.full_name[0].toUpperCase()
    : user.email?.[0].toUpperCase() ?? "U";

  const displayName = profile?.full_name || user.email?.split("@")[0] || "Traveler";

  return (
    <div ref={menuRef} className="relative">
      <button
        id="nav-user-avatar"
        onClick={() => setOpen((v) => !v)}
        aria-label="Open user menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white py-1 pl-1 pr-3 shadow-sm transition-colors hover:border-[#E8472A]/40"
      >
        {profile?.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={displayName}
            className="h-7 w-7 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#E8472A] to-[#ff7a5c] text-xs font-bold text-white">
            {initial}
          </div>
        )}
        <span className="hidden max-w-[100px] truncate text-xs font-semibold text-neutral-700 sm:block">
          {displayName}
        </span>
        <svg
          className={`h-3 w-3 text-neutral-400 transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute right-0 top-12 z-50 w-64 overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-xl"
          style={{ animation: "slideDown 160ms cubic-bezier(0.16,1,0.3,1)" }}
        >
          {/* User info header */}
          <div className="border-b border-neutral-100 bg-gradient-to-br from-neutral-50 to-white px-4 py-4">
            <div className="flex items-center gap-3">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={displayName}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#E8472A] to-[#ff7a5c] text-sm font-bold text-white">
                  {initial}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-bold text-neutral-900">{displayName}</div>
                <div className="truncate text-xs text-neutral-500">{user.email}</div>
              </div>
            </div>
            {profile?.home_city && (
              <div className="mt-2 flex items-center gap-1 text-xs text-neutral-400">
                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                  <circle cx="12" cy="9" r="2.5" />
                </svg>
                {profile.home_city}
              </div>
            )}
          </div>

          {/* Menu items */}
          <div className="py-2">
            {[
              { label: "My Trips", href: "/trips", icon: "Trips" },
              { label: "My Profile", href: "/profile", icon: "Profile" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 transition-colors hover:bg-neutral-50 hover:text-[#E8472A]"
              >
                <span className="w-12 text-[10px] font-semibold uppercase tracking-wide text-neutral-400">
                  {item.icon}
                </span>
                {item.label}
              </Link>
            ))}
          </div>

          <div className="border-t border-neutral-100 py-2">
            <button
              id="user-signout-btn"
              onClick={() => {
                setOpen(false);
                signOut();
              }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-neutral-500 transition-colors hover:bg-red-50 hover:text-red-600"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points="16 17 21 12 16 7" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="21" y1="12" x2="9" y2="12" strokeLinecap="round" />
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideDown { from { opacity: 0; transform: translateY(-8px) } to { opacity: 1; transform: none } }
      `}</style>
    </div>
  );
}
