import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, IncomeRow, IncomeRowInput } from "@mc-tracker/shared-types";

/**
 * Written against the generic `SupabaseClient` type (not "browser" or
 * "server" specifically) so these work identically whether called with the
 * server client (first paint) or the browser client (subsequent
 * timeframe/history refetches).
 */
type Client = SupabaseClient<Database, any, any>;

export async function fetchIncomesInRange(
  supabase: Client,
  userId: string,
  startIso: string,
  endIso: string,
): Promise<IncomeRow[]> {
  const { data, error } = await supabase
    .from("incomes")
    .select("*")
    .eq("user_id", userId)
    .gte("date", startIso)
    .lte("date", endIso)
    .order("date", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchAllIncomes(supabase: Client, userId: string): Promise<IncomeRow[]> {
  const { data, error } = await supabase
    .from("incomes")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

/** One batch `.insert([...])` call for every row added in the form session. */
export async function insertIncomeBatch(
  supabase: Client,
  userId: string,
  rows: IncomeRowInput[],
): Promise<IncomeRow[]> {
  const payload = rows.map((row) => ({
    user_id: userId,
    amount: row.amount,
    date: row.date,
    source_type: row.source_type,
    description: row.description || null,
  }));
  const { data, error } = await supabase.from("incomes").insert(payload).select();
  if (error) throw error;
  return data ?? [];
}

export async function updateIncome(
  supabase: Client,
  id: string,
  patch: Partial<IncomeRowInput>,
): Promise<void> {
  const { error } = await supabase
    .from("incomes")
    .update({ ...patch, description: patch.description || null })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteIncome(supabase: Client, id: string): Promise<void> {
  const { error } = await supabase.from("incomes").delete().eq("id", id);
  if (error) throw error;
}
