"use client";

import { Controller, type UseFormReturn } from "react-hook-form";
import type { CreateIncomeBatchInput } from "@mc-tracker/shared-types";
import { INCOME_SOURCE_TYPES, INCOME_SOURCE_TYPE_LABELS } from "@mc-tracker/shared-types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function IncomeRow({
  form,
  index,
}: {
  form: UseFormReturn<CreateIncomeBatchInput>;
  index: number;
}) {
  const { register, control, formState } = form;
  const rowErrors = formState.errors.rows?.[index];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <div className="flex flex-col gap-1">
        <Label htmlFor={`rows.${index}.amount`}>Amount (USD)</Label>
        <Input
          id={`rows.${index}.amount`}
          type="number"
          step="0.01"
          min="0"
          {...register(`rows.${index}.amount`)}
        />
        {rowErrors?.amount ? <p className="text-xs text-destructive">{rowErrors.amount.message}</p> : null}
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor={`rows.${index}.date`}>Date</Label>
        <Input id={`rows.${index}.date`} type="date" {...register(`rows.${index}.date`)} />
        {rowErrors?.date ? <p className="text-xs text-destructive">{rowErrors.date.message}</p> : null}
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor={`rows.${index}.source_type`}>Source</Label>
        <Controller
          control={control}
          name={`rows.${index}.source_type`}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id={`rows.${index}.source_type`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INCOME_SOURCE_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {INCOME_SOURCE_TYPE_LABELS[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor={`rows.${index}.description`}>Description (optional)</Label>
        <Input id={`rows.${index}.description`} {...register(`rows.${index}.description`)} />
      </div>
    </div>
  );
}
