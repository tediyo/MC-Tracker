"use client";

import { Controller, useWatch, type Control, type UseFormSetValue } from "react-hook-form";
import {
  COST_CATEGORIES,
  COST_CATEGORY_LABELS,
  COST_SUBCATEGORY_LABELS,
  CATEGORY_SUBCATEGORY_MAP,
  type CreateCostBatchInput,
  type CostCategory,
} from "@mc-tracker/shared-types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface CategorySubcategorySelectProps {
  control: Control<CreateCostBatchInput>;
  setValue: UseFormSetValue<CreateCostBatchInput>;
  index: number;
}

/**
 * The dependent category -> subcategory dropdown pair. Changing category
 * resets subcategory to that category's first valid value (via
 * `setValue`), so a stale subcategory from the previous category can never
 * survive the switch - `useWatch` (rather than re-rendering the whole row)
 * is what lets the subcategory options list react to that change.
 */
export function CategorySubcategorySelect({ control, setValue, index }: CategorySubcategorySelectProps) {
  const category = useWatch({ control, name: `rows.${index}.category` }) as CostCategory;
  const validSubcategories = CATEGORY_SUBCATEGORY_MAP[category] ?? [];

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
                const nextValid = CATEGORY_SUBCATEGORY_MAP[value as CostCategory];
                // Non-null: every category maps to a known-nonempty literal
                // array (see CATEGORY_SUBCATEGORY_MAP), just not typed as
                // such under noUncheckedIndexedAccess.
                setValue(`rows.${index}.subcategory`, nextValid[0]!, { shouldValidate: true });
              }}
            >
              <SelectTrigger id={`rows.${index}.category`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COST_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {COST_CATEGORY_LABELS[c]}
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
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {validSubcategories.map((s) => (
                  <SelectItem key={s} value={s}>
                    {COST_SUBCATEGORY_LABELS[s]}
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
