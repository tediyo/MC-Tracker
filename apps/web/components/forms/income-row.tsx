"use client";

import { Controller, type UseFormReturn } from "react-hook-form";
import type { CreateIncomeBatchInput } from "@mc-tracker/shared-types";
import { INCOME_SOURCE_TYPES, INCOME_SOURCE_TYPE_LABELS } from "@mc-tracker/shared-types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { EthiopianDatePicker } from "@/components/ui/ethiopian-date-picker";

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
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`rows.${index}.amount`}>Amount (USD)</Label>
        <Input
          id={`rows.${index}.amount`}
          type="number"
          step="0.01"
          min="0"
          className="rounded-xl"
          {...register(`rows.${index}.amount`)}
        />
        {rowErrors?.amount ? <p className="text-xs text-destructive">{rowErrors.amount.message}</p> : null}
      </div>
      <div className="flex flex-col gap-1.5">
        <Controller
          control={control}
          name={`rows.${index}.date`}
          render={({ field }) => (
            <EthiopianDatePicker
              label="Date"
              value={field.value}
              onChange={field.onChange}
              required
            />
          )}
        />
        {rowErrors?.date ? <p className="text-xs text-destructive">{rowErrors.date.message}</p> : null}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`rows.${index}.source_type`}>Source</Label>
        <Controller
          control={control}
          name={`rows.${index}.source_type`}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id={`rows.${index}.source_type`} className="rounded-xl">
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
      <div className="flex flex-col gap-1.5 sm:col-span-2 md:col-span-1">
        <Label htmlFor={`rows.${index}.description`}>Description (optional)</Label>
        <Textarea
          id={`rows.${index}.description`}
          placeholder="Add details or notes..."
          className="min-h-[40px] h-10 py-2 resize-y"
          {...register(`rows.${index}.description`)}
        />
      </div>
    </div>
  );
}
