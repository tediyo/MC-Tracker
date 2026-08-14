import type { UserRow } from "@mc-tracker/shared-types";

type Client = any;

export async function fetchUserProfile(supabase: Client, userId: string): Promise<UserRow | null> {
  const { data, error } = await supabase.from("users").select("*").eq("id", userId).maybeSingle();
  if (error) throw error;
  return data ?? null;
}
