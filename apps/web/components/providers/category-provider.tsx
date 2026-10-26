"use client";

import * as React from "react";
import {
  type CustomCategory,
  type CustomSubcategory,
  INTEREST_PRESETS,
  mergeCategories,
  mergeCategoryLabels,
  mergeCategorySubcategoryMap,
  mergeSubcategoryLabels,
  formatCategoryLabel,
  formatSubcategoryLabel,
} from "@mc-tracker/shared-types";
import { createClient } from "@/lib/supabase/client";
import { fetchUserCategories, saveUserCategories } from "@/lib/data/custom-categories";
import { toast } from "sonner";

interface CategoryContextType {
  customCategories: CustomCategory[];
  customSubcategories: CustomSubcategory[];
  categories: string[];
  categoryLabels: Record<string, string>;
  categorySubcategoryMap: Record<string, readonly string[]>;
  subcategoryLabels: Record<string, string>;
  activePresetIds: string[];
  addCategory: (category: { key: string; label: string; icon?: string; color?: string }) => Promise<void>;
  deleteCategory: (categoryKey: string) => Promise<void>;
  addSubcategory: (subcategory: { categoryKey: string; key: string; label: string }) => Promise<void>;
  deleteSubcategory: (categoryKey: string, subcategoryKey: string) => Promise<void>;
  toggleInterestPreset: (presetId: string) => Promise<void>;
  isLoading: boolean;
  refreshCategories: () => Promise<void>;
}

const CategoryContext = React.createContext<CategoryContextType | undefined>(undefined);

export function CategoryProvider({ children }: { children: React.ReactNode }) {
  const [customCategories, setCustomCategories] = React.useState<CustomCategory[]>([]);
  const [customSubcategories, setCustomSubcategories] = React.useState<CustomSubcategory[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const supabase = React.useMemo(() => createClient(), []);

  const refreshCategories = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchUserCategories(supabase);
      setCustomCategories(data.customCategories);
      setCustomSubcategories(data.customSubcategories);
    } catch (err) {
      console.error("Failed to load user categories:", err);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  React.useEffect(() => {
    refreshCategories();
  }, [refreshCategories]);

  // Derived collections
  const categories = React.useMemo(
    () => mergeCategories(customCategories),
    [customCategories]
  );

  const categoryLabels = React.useMemo(
    () => mergeCategoryLabels(customCategories),
    [customCategories]
  );

  const categorySubcategoryMap = React.useMemo(
    () => mergeCategorySubcategoryMap(customCategories, customSubcategories),
    [customCategories, customSubcategories]
  );

  const subcategoryLabels = React.useMemo(
    () => mergeSubcategoryLabels(customSubcategories),
    [customSubcategories]
  );

  const activePresetIds = React.useMemo(() => {
    const activeKeys = new Set(customCategories.map((c) => c.key));
    return INTEREST_PRESETS.filter((preset) => activeKeys.has(preset.category.key)).map(
      (p) => p.id
    );
  }, [customCategories]);

  // Add custom category
  const addCategory = React.useCallback(
    async (cat: { key: string; label: string; icon?: string; color?: string }) => {
      const normalizedKey = cat.key.trim().toLowerCase().replace(/\s+/g, "_");
      if (!normalizedKey) throw new Error("Category key is required");

      if (categories.includes(normalizedKey)) {
        throw new Error(`Category "${cat.label}" already exists`);
      }

      const newCategory: CustomCategory = {
        key: normalizedKey,
        label: cat.label.trim(),
        icon: cat.icon || "Tag",
        color: cat.color || "#10b981",
      };

      const updatedCategories = [...customCategories, newCategory];
      setCustomCategories(updatedCategories);

      try {
        await saveUserCategories(supabase, updatedCategories, customSubcategories);
        toast.success(`Category "${newCategory.label}" added and saved to database!`);
      } catch (err: any) {
        setCustomCategories(customCategories);
        toast.error(err.message || "Failed to save category to database");
        throw err;
      }
    },
    [customCategories, customSubcategories, categories, supabase]
  );

  // Delete custom category
  const deleteCategory = React.useCallback(
    async (categoryKey: string) => {
      const updatedCategories = customCategories.filter((c) => c.key !== categoryKey);
      const updatedSubcategories = customSubcategories.filter((s) => s.categoryKey !== categoryKey);

      setCustomCategories(updatedCategories);
      setCustomSubcategories(updatedSubcategories);

      try {
        await saveUserCategories(supabase, updatedCategories, updatedSubcategories);
        toast.success("Category removed successfully");
      } catch (err: any) {
        setCustomCategories(customCategories);
        setCustomSubcategories(customSubcategories);
        toast.error(err.message || "Failed to delete category");
        throw err;
      }
    },
    [customCategories, customSubcategories, supabase]
  );

  // Add custom subcategory
  const addSubcategory = React.useCallback(
    async (sub: { categoryKey: string; key: string; label: string }) => {
      const normalizedKey = sub.key.trim().toLowerCase().replace(/\s+/g, "_");
      if (!normalizedKey) throw new Error("Subcategory key is required");

      const currentSubs = categorySubcategoryMap[sub.categoryKey] || [];
      if (currentSubs.includes(normalizedKey)) {
        throw new Error(`Subcategory "${sub.label}" already exists in this category`);
      }

      const newSubcategory: CustomSubcategory = {
        categoryKey: sub.categoryKey,
        key: normalizedKey,
        label: sub.label.trim(),
      };

      const updatedSubcategories = [...customSubcategories, newSubcategory];
      setCustomSubcategories(updatedSubcategories);

      try {
        await saveUserCategories(supabase, customCategories, updatedSubcategories);
        toast.success(`Subcategory "${newSubcategory.label}" added to database!`);
      } catch (err: any) {
        setCustomSubcategories(customSubcategories);
        toast.error(err.message || "Failed to save subcategory to database");
        throw err;
      }
    },
    [customCategories, customSubcategories, categorySubcategoryMap, supabase]
  );

  // Delete custom subcategory
  const deleteSubcategory = React.useCallback(
    async (categoryKey: string, subcategoryKey: string) => {
      const updatedSubcategories = customSubcategories.filter(
        (s) => !(s.categoryKey === categoryKey && s.key === subcategoryKey)
      );

      setCustomSubcategories(updatedSubcategories);

      try {
        await saveUserCategories(supabase, customCategories, updatedSubcategories);
        toast.success("Subcategory removed successfully");
      } catch (err: any) {
        setCustomSubcategories(customSubcategories);
        toast.error(err.message || "Failed to delete subcategory");
        throw err;
      }
    },
    [customCategories, customSubcategories, supabase]
  );

  // Toggle user interest preset package
  const toggleInterestPreset = React.useCallback(
    async (presetId: string) => {
      const preset = INTEREST_PRESETS.find((p) => p.id === presetId);
      if (!preset) return;

      const isCurrentlyActive = customCategories.some((c) => c.key === preset.category.key);

      if (isCurrentlyActive) {
        // Remove preset category & its subcategories
        const updatedCats = customCategories.filter((c) => c.key !== preset.category.key);
        const updatedSubs = customSubcategories.filter((s) => s.categoryKey !== preset.category.key);

        setCustomCategories(updatedCats);
        setCustomSubcategories(updatedSubs);

        try {
          await saveUserCategories(supabase, updatedCats, updatedSubs);
          toast.success(`Removed "${preset.title}" interest package`);
        } catch (err: any) {
          setCustomCategories(customCategories);
          setCustomSubcategories(customSubcategories);
          toast.error(err.message || "Failed to update categories");
        }
      } else {
        // Add preset category and all its starter subcategories
        const updatedCats = [...customCategories, preset.category];
        const newSubs: CustomSubcategory[] = preset.subcategories.map((sub) => ({
          categoryKey: preset.category.key,
          key: sub.key,
          label: sub.label,
        }));

        const existingKeys = new Set(customSubcategories.map((s) => `${s.categoryKey}:::${s.key}`));
        const filteredNewSubs = newSubs.filter((s) => !existingKeys.has(`${s.categoryKey}:::${s.key}`));
        const updatedSubs = [...customSubcategories, ...filteredNewSubs];

        setCustomCategories(updatedCats);
        setCustomSubcategories(updatedSubs);

        try {
          await saveUserCategories(supabase, updatedCats, updatedSubs);
          toast.success(`Activated "${preset.title}"! Added category & ${newSubs.length} subcategories.`);
        } catch (err: any) {
          setCustomCategories(customCategories);
          setCustomSubcategories(customSubcategories);
          toast.error(err.message || "Failed to save interest package");
        }
      }
    },
    [customCategories, customSubcategories, supabase]
  );

  return (
    <CategoryContext.Provider
      value={{
        customCategories,
        customSubcategories,
        categories,
        categoryLabels,
        categorySubcategoryMap,
        subcategoryLabels,
        activePresetIds,
        addCategory,
        deleteCategory,
        addSubcategory,
        deleteSubcategory,
        toggleInterestPreset,
        isLoading,
        refreshCategories,
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
}

export function useCategories() {
  const context = React.useContext(CategoryContext);
  if (!context) {
    throw new Error("useCategories must be used within a CategoryProvider");
  }
  return context;
}
