import type { SupabaseClient, User } from "@supabase/supabase-js";

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

function metadataString(user: User, key: string) {
  const value = (user.user_metadata as Record<string, unknown> | null)?.[key];
  return typeof value === "string" && value.trim() ? value : null;
}

export function buildUserProfilePayload(user: User) {
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
  supabase: SupabaseClient,
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
    .upsert(buildUserProfilePayload(user) as never, { onConflict: "id" })
    .select("*")
    .maybeSingle();

  if (error) {
    console.warn("Wayfarer auth: profile upsert failed", error.message);
    return existing ? (existing as UserProfile) : null;
  }

  return data as UserProfile | null;
}
