"use client";

import { Controller, useWatch, type Control, type UseFormSetValue } from "react-hook-form";
import type { CreateCostBatchInput } from "@mc-tracker/shared-types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useCategories } from "@/components/providers/category-provider";

interface CategorySubcategorySelectProps {
  control: Control<CreateCostBatchInput>;
  setValue: UseFormSetValue<CreateCostBatchInput>;
  index: number;
}

/**
 * Dynamic category -> subcategory dropdown pair.
 * Reactively uses user-defined dynamic categories and subcategories from CategoryProvider.
 */
export function CategorySubcategorySelect({ control, setValue, index }: CategorySubcategorySelectProps) {
  const { categories, categoryLabels, categorySubcategoryMap, subcategoryLabels } = useCategories();
  const category = useWatch({ control, name: `rows.${index}.category` }) || "basic";
  const validSubcategories = categorySubcategoryMap[category] ?? ["other"];

  return (
    <>
      <div className="flex flex-col gap-1">
        <Label htmlFor={`rows.${index}.category`}>Category</Label>
        <Controller
          control={control}
          name={`rows.${index}.category`}
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={(value) => {
                field.onChange(value);
                const nextValid = categorySubcategoryMap[value] || ["other"];
                setValue(`rows.${index}.subcategory`, nextValid[0] ?? "other", { shouldValidate: true });
              }}
            >
              <SelectTrigger id={`rows.${index}.category`}>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {categoryLabels[c] || c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor={`rows.${index}.subcategory`}>Subcategory</Label>
        <Controller
          control={control}
          name={`rows.${index}.subcategory`}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id={`rows.${index}.subcategory`}>
                <SelectValue placeholder="Select subcategory" />
              </SelectTrigger>
              <SelectContent>
                {validSubcategories.map((s) => (
                  <SelectItem key={s} value={s}>
                    {subcategoryLabels[s] || s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>
    </>
  );
}
