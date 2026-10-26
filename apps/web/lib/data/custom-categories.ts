import {
  type CustomCategory,
  type CustomSubcategory,
  INTEREST_PRESETS,
} from "@mc-tracker/shared-types";

type Client = any;

export interface UserCategoriesData {
  customCategories: CustomCategory[];
  customSubcategories: CustomSubcategory[];
}

/**
 * Fetch custom categories and subcategories for the current user.
 * Reads from Supabase user_metadata for instant, reliable persistence across devices,
 * with graceful fallback/sync to the custom_categories and custom_subcategories DB tables.
 */
export async function fetchUserCategories(supabase: Client): Promise<UserCategoriesData> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return { customCategories: [], customSubcategories: [] };
    }

    const metadata = user.user_metadata || {};
    const metaCategories: CustomCategory[] = Array.isArray(metadata.custom_categories)
      ? metadata.custom_categories
      : [];
    const metaSubcategories: CustomSubcategory[] = Array.isArray(metadata.custom_subcategories)
      ? metadata.custom_subcategories
      : [];

    // Also attempt reading from custom_categories table if it exists
    try {
      const { data: dbCategories } = await supabase
        .from("custom_categories")
        .select("key, label, icon, color")
        .eq("user_id", user.id);

      const { data: dbSubcategories } = await supabase
        .from("custom_subcategories")
        .select("key, category_key, label")
        .eq("user_id", user.id);

      if (dbCategories && dbCategories.length > 0) {
        const mergedCategoriesMap = new Map<string, CustomCategory>();
        metaCategories.forEach((c) => mergedCategoriesMap.set(c.key, c));
        dbCategories.forEach((c: any) => mergedCategoriesMap.set(c.key, c));

        const mergedSubcategoriesMap = new Map<string, CustomSubcategory>();
        metaSubcategories.forEach((s) => mergedSubcategoriesMap.set(`${s.categoryKey}:::${s.key}`, s));
        if (dbSubcategories) {
          dbSubcategories.forEach((s: any) =>
            mergedSubcategoriesMap.set(`${s.category_key}:::${s.key}`, {
              key: s.key,
              categoryKey: s.category_key,
              label: s.label,
            }),
          );
        }

        return {
          customCategories: Array.from(mergedCategoriesMap.values()),
          customSubcategories: Array.from(mergedSubcategoriesMap.values()),
        };
      }
    } catch {
      // Ignore if table does not exist yet
    }

    return {
      customCategories: metaCategories,
      customSubcategories: metaSubcategories,
    };
  } catch (error) {
    console.error("Failed to fetch user custom categories:", error);
    return { customCategories: [], customSubcategories: [] };
  }
}

/**
 * Save custom categories and subcategories to Supabase user_metadata and database tables.
 */
export async function saveUserCategories(
  supabase: Client,
  customCategories: CustomCategory[],
  customSubcategories: CustomSubcategory[],
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Authentication required to save categories");

  // 1. Persist directly in Supabase user_metadata
  const { error: authError } = await supabase.auth.updateUser({
    data: {
      custom_categories: customCategories,
      custom_subcategories: customSubcategories,
    },
  });

  if (authError) {
    console.warn("Could not save to auth user_metadata:", authError.message);
  }

  // 2. Try persisting to custom_categories & custom_subcategories tables if migration applied
  try {
    // Delete removed categories
    await supabase.from("custom_categories").delete().eq("user_id", user.id);
    if (customCategories.length > 0) {
      await supabase.from("custom_categories").insert(
        customCategories.map((c) => ({
          user_id: user.id,
          key: c.key,
          label: c.label,
          icon: c.icon || null,
          color: c.color || null,
        })),
      );
    }

    await supabase.from("custom_subcategories").delete().eq("user_id", user.id);
    if (customSubcategories.length > 0) {
      await supabase.from("custom_subcategories").insert(
        customSubcategories.map((s) => ({
          user_id: user.id,
          category_key: s.categoryKey,
          key: s.key,
          label: s.label,
        })),
      );
    }
  } catch {
    // Graceful fallback: user_metadata already stored it safely!
  }
}
