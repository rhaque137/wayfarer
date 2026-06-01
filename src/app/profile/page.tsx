"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth/context";

const TRAVEL_STYLES = [
  "Adventure & Outdoors",
  "Culture & History",
  "Food & Culinary",
  "Beach & Relaxation",
  "City Explorer",
  "Luxury Travel",
  "Budget Backpacker",
  "Family Travel",
];

export default function ProfilePage() {
  const { user, profile, loading, refreshProfile } = useAuth();
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [homeCity, setHomeCity] = useState("");
  const [travelStyle, setTravelStyle] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? "");
      setHomeCity(profile.home_city ?? "");
      setTravelStyle(profile.travel_style ?? "");
    }
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setError(null);
    setSaved(false);

    const res = await fetch("/api/profile", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        id: user.id,
        full_name: fullName || null,
        home_city: homeCity || null,
        travel_style: travelStyle || null,
      }),
    });

    if (res.ok) {
      await refreshProfile();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } else {
      const data = await res.json();
      setError(data.error ?? "Failed to save profile");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-neutral-200 border-t-[#E8472A]" />
      </div>
    );
  }

  if (!user) return null;

  const initial = profile?.full_name
    ? profile.full_name[0].toUpperCase()
    : user.email?.[0].toUpperCase() ?? "U";

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="sticky top-0 z-40 border-b border-neutral-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between px-6 py-4">
          <Link href="/" className="text-lg font-bold text-[#E8472A]">
            Wayfarer
          </Link>
          <Link
            href="/"
            className="rounded-full border border-neutral-200 px-4 py-2 text-xs font-semibold text-neutral-600 transition hover:border-[#E8472A] hover:text-[#E8472A]"
          >
            ← Back Home
          </Link>
        </div>
      </div>

      <div className="mx-auto w-full max-w-2xl px-6 py-12">
        {/* Header */}
        <div className="flex items-center gap-5">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#E8472A] to-[#ff7a5c] text-3xl font-bold text-white shadow-lg">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Avatar"
                className="h-20 w-20 rounded-full object-cover"
              />
            ) : (
              initial
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">
              {profile?.full_name || "Your Profile"}
            </h1>
            <p className="text-sm text-neutral-500">{user.email}</p>
            {profile?.home_city && (
              <p className="mt-1 text-xs text-neutral-400">📍 {profile.home_city}</p>
            )}
          </div>
        </div>

        {/* Stats strip */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          {[
            { label: "Trips Planned", value: "—" },
            { label: "Days Traveled", value: "—" },
            { label: "Countries", value: "—" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-neutral-200 bg-white p-4 text-center shadow-sm"
            >
              <div className="text-2xl font-bold text-[#E8472A]">{stat.value}</div>
              <div className="mt-1 text-xs text-neutral-500">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Edit form */}
        <form
          onSubmit={handleSave}
          className="mt-8 rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm"
        >
          <h2 className="mb-6 text-lg font-bold text-neutral-900">Edit Profile</h2>

          <div className="flex flex-col gap-5">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-neutral-600" htmlFor="profile-name">
                Full Name
              </label>
              <input
                id="profile-name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-foreground outline-none transition-all placeholder:text-neutral-400 focus:border-[#E8472A] focus:bg-white focus:ring-4 focus:ring-[#E8472A]/10"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-neutral-600" htmlFor="profile-email">
                Email Address
              </label>
              <input
                id="profile-email"
                type="email"
                value={user.email ?? ""}
                disabled
                className="w-full rounded-xl border border-neutral-100 bg-neutral-100 px-4 py-3 text-sm text-neutral-400 outline-none cursor-not-allowed"
              />
              <p className="mt-1 text-[10px] text-neutral-400">Email cannot be changed here.</p>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-neutral-600" htmlFor="profile-city">
                Home City
              </label>
              <input
                id="profile-city"
                type="text"
                value={homeCity}
                onChange={(e) => setHomeCity(e.target.value)}
                placeholder="e.g. New York, Paris, Tokyo"
                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-foreground outline-none transition-all placeholder:text-neutral-400 focus:border-[#E8472A] focus:bg-white focus:ring-4 focus:ring-[#E8472A]/10"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-neutral-600">
                Travel Style
              </label>
              <div className="flex flex-wrap gap-2">
                {TRAVEL_STYLES.map((style) => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => setTravelStyle(style === travelStyle ? "" : style)}
                    className={`rounded-full border px-4 py-2 text-xs font-semibold transition-all ${
                      travelStyle === style
                        ? "border-[#E8472A] bg-[#E8472A] text-white"
                        : "border-neutral-200 bg-white text-neutral-600 hover:border-[#E8472A]/50 hover:text-[#E8472A]"
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-xs text-red-600">
              ⚠️ {error}
            </div>
          )}
          {saved && (
            <div className="mt-4 rounded-xl bg-green-50 px-4 py-3 text-xs text-green-700">
              ✅ Profile saved successfully!
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            id="profile-save-btn"
            className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#1a1a1a] to-[#2d2d2d] text-sm font-bold text-white shadow-md transition-all hover:opacity-90 disabled:opacity-60"
          >
            {saving ? (
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            ) : null}
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </form>

        {/* Linked trips */}
        <div className="mt-6 rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-neutral-900">Your Trips</h2>
          <p className="text-sm text-neutral-500">
            Your planned trips will appear here once synced.{" "}
            <Link href="/trips" className="font-semibold text-[#E8472A] hover:underline">
              View all trips →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
