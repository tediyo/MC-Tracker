import type { SupabaseClient, PostgrestError } from "@supabase/supabase-js";
import type { Database, PlanRow, CreatePlanInput, UpdatePlanInput } from "@mc-tracker/shared-types";

type Client = SupabaseClient<Database>;

/** Postgres unique-violation error code - used to detect a duplicate (user_id, year, month). */
export const UNIQUE_VIOLATION = "23505";

export function isUniqueViolation(error: PostgrestError | null | undefined): boolean {
  return error?.code === UNIQUE_VIOLATION;
}

export async function fetchPlansForYear(supabase: Client, userId: string, year: number): Promise<PlanRow[]> {
  const { data, error } = await supabase
    .from("plans")
    .select("*")
    .eq("user_id", userId)
    .eq("year", year)
    .order("month", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function fetchAllPlans(supabase: Client, userId: string): Promise<PlanRow[]> {
  const { data, error } = await supabase
    .from("plans")
    .select("*")
    .eq("user_id", userId)
    .order("year", { ascending: false })
    .order("month", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchPlanById(supabase: Client, id: string): Promise<PlanRow | null> {
  const { data, error } = await supabase.from("plans").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ?? null;
}

export interface CreatePlanResult {
  plan: PlanRow | null;
  duplicate: boolean;
}

/**
 * Defense-in-depth layer 3 (see plan module docs): the UI (PlanYearGrid +
 * PlanMonthYearPicker) should make attempting a duplicate hard to reach at
 * all, but this still catches the unique-violation race (e.g. two open
 * tabs) and reports it distinctly rather than throwing, so the caller can
 * show a friendly "a plan for this month already exists" message.
 */
export async function createPlan(
  supabase: Client,
  userId: string,
  input: CreatePlanInput,
): Promise<CreatePlanResult> {
  const { data, error } = await supabase
    .from("plans")
    .insert({ user_id: userId, ...input })
    .select()
    .single();

  if (error) {
    if (isUniqueViolation(error)) return { plan: null, duplicate: true };
    throw error;
  }
  return { plan: data, duplicate: false };
}

export async function updatePlan(supabase: Client, id: string, input: UpdatePlanInput): Promise<PlanRow> {
  const { data, error } = await supabase.from("plans").update(input).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function deletePlan(supabase: Client, id: string): Promise<void> {
  const { error } = await supabase.from("plans").delete().eq("id", id);
  if (error) throw error;
}
