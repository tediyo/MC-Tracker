"use client";

import type { UseFormReturn } from "react-hook-form";
import type { CreateCostBatchInput } from "@mc-tracker/shared-types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CategorySubcategorySelect } from "@/components/forms/category-subcategory-select";

export function CostRow({ form, index }: { form: UseFormReturn<CreateCostBatchInput>; index: number }) {
  const { register, control, setValue, formState } = form;
  const rowErrors = formState.errors.rows?.[index];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <CategorySubcategorySelect control={control} setValue={setValue} index={index} />
      {rowErrors?.subcategory ? (
        <p className="col-span-2 -mt-2 text-xs text-destructive md:col-span-4">{rowErrors.subcategory.message}</p>
      ) : null}
      <div className="flex flex-col gap-1">
        <Label htmlFor={`rows.${index}.amount`}>Amount (USD)</Label>
        <Input id={`rows.${index}.amount`} type="number" step="0.01" min="0" {...register(`rows.${index}.amount`)} />
        {rowErrors?.amount ? <p className="text-xs text-destructive">{rowErrors.amount.message}</p> : null}
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor={`rows.${index}.description`}>Description (optional)</Label>
        <Input id={`rows.${index}.description`} {...register(`rows.${index}.description`)} />
      </div>
    </div>
  );
}
