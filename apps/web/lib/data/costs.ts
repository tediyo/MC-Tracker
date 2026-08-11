import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, CostRow, CostRowInput } from "@mc-tracker/shared-types";

type Client = SupabaseClient<Database>;

export async function fetchCostsInRange(
  supabase: Client,
  userId: string,
  startIso: string,
  endIso: string,
): Promise<CostRow[]> {
  const { data, error } = await supabase
    .from("costs")
    .select("*")
    .eq("user_id", userId)
    .gte("date", startIso)
    .lte("date", endIso)
    .order("date", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchAllCosts(supabase: Client, userId: string): Promise<CostRow[]> {
  const { data, error } = await supabase
    .from("costs")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

/**
 * One batch `.insert([...])` call. `date` is shared across every row in
 * the session (one date selector for the whole batch, per spec) and
 * hoisted onto each row here.
 */
export async function insertCostBatch(
  supabase: Client,
  userId: string,
  date: string,
  rows: CostRowInput[],
): Promise<CostRow[]> {
  const payload = rows.map((row) => ({
    user_id: userId,
    date,
    amount: row.amount,
    category: row.category,
    subcategory: row.subcategory,
    description: row.description || null,
  }));
  const { data, error } = await supabase.from("costs").insert(payload).select();
  if (error) throw error;
  return data ?? [];
}

export async function updateCost(supabase: Client, id: string, patch: Partial<CostRowInput & { date: string }>): Promise<void> {
  const { error } = await supabase
    .from("costs")
    .update({ ...patch, description: patch.description || null })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteCost(supabase: Client, id: string): Promise<void> {
  const { error } = await supabase.from("costs").delete().eq("id", id);
  if (error) throw error;
}
