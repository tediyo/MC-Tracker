"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  createCostBatchSchema,
  type CreateCostBatchInput,
  type CostRowInput,
  CATEGORY_SUBCATEGORY_MAP,
} from "@mc-tracker/shared-types";
import { createClient } from "@/lib/supabase/client";
import { insertCostBatch } from "@/lib/data/costs";
import { todayIsoDate } from "@/lib/utils";
import { RowArrayList } from "@/components/forms/row-array-list";
import { CostRow } from "@/components/forms/cost-row";
import { EthiopianDatePicker } from "@/components/ui/ethiopian-date-picker";
import { Button } from "@/components/ui/button";

function newRow(): CostRowInput {
  // Non-null: CATEGORY_SUBCATEGORY_MAP.basic is a known-nonempty literal
  // array, but its declared type (readonly CostSubcategory[]) doesn't
  // encode that for TS under noUncheckedIndexedAccess.
  return { category: "basic", subcategory: CATEGORY_SUBCATEGORY_MAP.basic[0]!, amount: 0, description: "" };
}

export function CostEntryForm({ userId }: { userId: string }) {
  const router = useRouter();
  const form = useForm<CreateCostBatchInput>({
    resolver: zodResolver(createCostBatchSchema),
    defaultValues: { date: todayIsoDate(), rows: [newRow()] },
  });

  async function onSubmit(values: CreateCostBatchInput) {
    try {
      const supabase = createClient();
      await insertCostBatch(supabase, userId, values.date, values.rows);
      toast.success(`Saved ${values.rows.length} cost row${values.rows.length > 1 ? "s" : ""}`);
      form.reset({ date: values.date, rows: [newRow()] });
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save costs");
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="flex w-fit max-w-[240px] flex-col gap-1">
        {/* <Controller
          control={form.control}
          name="date"
          render={({ field }) => (
            <EthiopianDatePicker
              label="Date (applies to every row below)"
              value={field.value}
              onChange={field.onChange}
              required
            />
          )}
        /> */}
        {form.formState.errors.date ? (
          <p className="text-xs text-destructive">{form.formState.errors.date.message}</p>
        ) : null}
      </div>
      <RowArrayList
        control={form.control}
        name="rows"
        newRowDefaults={newRow}
        addLabel="Add another cost row"
        renderRow={({ index }) => <CostRow form={form} index={index} />}
      />
      <Button type="submit" disabled={form.formState.isSubmitting} className="self-start">
        {form.formState.isSubmitting ? "Saving…" : "Save costs"}
      </Button>
    </form>
  );
}
