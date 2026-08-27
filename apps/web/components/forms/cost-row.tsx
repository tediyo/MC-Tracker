"use client";

import { useWatch, type UseFormReturn } from "react-hook-form";
import type { CreateCostBatchInput } from "@mc-tracker/shared-types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CategorySubcategorySelect } from "@/components/forms/category-subcategory-select";

export function CostRow({ form, index }: { form: UseFormReturn<CreateCostBatchInput>; index: number }) {
  const { register, control, setValue, formState } = form;
  const rowErrors = formState.errors.rows?.[index];
  const subcategory = useWatch({ control, name: `rows.${index}.subcategory` });
  const isOther = subcategory === "other";

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
      <CategorySubcategorySelect control={control} setValue={setValue} index={index} />
      {rowErrors?.subcategory ? (
        <p className="col-span-1 -mt-2 text-xs text-destructive sm:col-span-2 md:col-span-4">{rowErrors.subcategory.message}</p>
      ) : null}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`rows.${index}.amount`}>Amount (USD)</Label>
        <Input id={`rows.${index}.amount`} type="number" step="0.01" min="0" className="rounded-xl" {...register(`rows.${index}.amount`)} />
        {rowErrors?.amount ? <p className="text-xs text-destructive">{rowErrors.amount.message}</p> : null}
      </div>
      <div className="flex flex-col gap-1.5 sm:col-span-2 md:col-span-1">
        <Label
          htmlFor={`rows.${index}.description`}
          className={isOther ? "font-semibold text-primary" : ""}
        >
          {isOther ? "Reason (Required) *" : "Description (optional)"}
        </Label>
        <Textarea
          id={`rows.${index}.description`}
          placeholder={isOther ? "State the reason for this expense..." : "Add details or notes..."}
          className={`min-h-[40px] h-10 py-2 resize-y ${isOther ? "border-primary/60 focus-visible:ring-primary" : ""}`}
          {...register(`rows.${index}.description`)}
        />
        {rowErrors?.description ? (
          <p className="text-xs text-destructive">{rowErrors.description.message}</p>
        ) : null}
      </div>
    </div>
  );
}
