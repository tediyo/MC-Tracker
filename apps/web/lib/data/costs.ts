import type { SupabaseClient } from "@supabase/supabase-js";
import {
  type Database,
  type CostRow,
  type CostRowInput,
  decodeCostRow,
  encodeDynamicDescription,
  COST_CATEGORIES,
  CATEGORY_SUBCATEGORY_MAP,
  type CostCategory,
  type CostSubcategory,
} from "@mc-tracker/shared-types";

type Client = any;

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
  return (data ?? []).map((row: any) => decodeCostRow(row) as CostRow);
}

export async function fetchAllCosts(supabase: Client, userId: string): Promise<CostRow[]> {
  const { data, error } = await supabase
    .from("costs")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row: any) => decodeCostRow(row) as CostRow);
}

/**
 * One batch `.insert([...])` call.
 * Intelligently handles custom/dynamic categories:
 * - If DB columns accept the custom string, writes directly.
 * - If DB enforces enum constraint, encodes dynamically in description seamlessly.
 */
export async function insertCostBatch(
  supabase: Client,
  userId: string,
  date: string,
  rows: CostRowInput[],
): Promise<CostRow[]> {
  // Check if any row has non-standard category or subcategory
  const needsDynamicEncoding = (cat: string, sub: string) => {
    const isStandardCat = COST_CATEGORIES.includes(cat as CostCategory);
    if (!isStandardCat) return true;
    const validSubs = CATEGORY_SUBCATEGORY_MAP[cat as CostCategory] || [];
    return !validSubs.includes(sub as CostSubcategory);
  };

  const directPayload = rows.map((row) => ({
    user_id: userId,
    date,
    amount: row.amount,
    category: row.category,
    subcategory: row.subcategory,
    description: row.description || null,
  }));

  // Try direct insertion first
  const { data, error } = await supabase.from("costs").insert(directPayload).select();

  if (!error) {
    return (data ?? []).map((row: any) => decodeCostRow(row) as CostRow);
  }

  // If error is due to enum or check constraint, apply resilient dynamic encoding
  const isEnumOrConstraintError =
    error.code === "22P02" ||
    error.message?.includes("enum") ||
    error.message?.includes("chk_category_subcategory");

  if (isEnumOrConstraintError) {
    const fallbackPayload = rows.map((row) => {
      const isDynamic = needsDynamicEncoding(row.category, row.subcategory);
      if (!isDynamic) {
        return {
          user_id: userId,
          date,
          amount: row.amount,
          category: row.category,
          subcategory: row.subcategory,
          description: row.description || null,
        };
      }

      // Encode custom category into description and use 'basic' / 'other' for DB enum compatibility
      const encodedDesc = encodeDynamicDescription(row.category, row.subcategory, row.description);
      return {
        user_id: userId,
        date,
        amount: row.amount,
        category: "basic",
        subcategory: "other",
        description: encodedDesc,
      };
    });

    const { data: fallbackData, error: fallbackError } = await supabase
      .from("costs")
      .insert(fallbackPayload)
      .select();

    if (fallbackError) throw fallbackError;
    return (fallbackData ?? []).map((row: any) => decodeCostRow(row) as CostRow);
  }

  throw error;
}

export async function updateCost(
  supabase: Client,
  id: string,
  patch: Partial<CostRowInput & { date: string }>,
): Promise<void> {
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
