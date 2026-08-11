"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createIncomeBatchSchema, type CreateIncomeBatchInput, type IncomeRowInput } from "@mc-tracker/shared-types";
import { createClient } from "@/lib/supabase/client";
import { insertIncomeBatch } from "@/lib/data/incomes";
import { todayIsoDate } from "@/lib/utils";
import { RowArrayList } from "@/components/forms/row-array-list";
import { IncomeRow } from "@/components/forms/income-row";
import { Button } from "@/components/ui/button";

function newRow(): IncomeRowInput {
  return { amount: 0, date: todayIsoDate(), source_type: "monthly", description: "" };
}

export function IncomeEntryForm({ userId }: { userId: string }) {
  const router = useRouter();
  const form = useForm<CreateIncomeBatchInput>({
    resolver: zodResolver(createIncomeBatchSchema),
    defaultValues: { rows: [newRow()] },
  });

  async function onSubmit(values: CreateIncomeBatchInput) {
    try {
      const supabase = createClient();
      await insertIncomeBatch(supabase, userId, values.rows);
      toast.success(`Saved ${values.rows.length} income row${values.rows.length > 1 ? "s" : ""}`);
      form.reset({ rows: [newRow()] });
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save income");
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <RowArrayList
        control={form.control}
        name="rows"
        newRowDefaults={newRow}
        addLabel="Add another income row"
        renderRow={({ index }) => <IncomeRow form={form} index={index} />}
      />
      {form.formState.errors.rows?.root ? (
        <p className="text-sm text-destructive">{form.formState.errors.rows.root.message}</p>
      ) : null}
      <Button type="submit" disabled={form.formState.isSubmitting} className="self-start">
        {form.formState.isSubmitting ? "Saving…" : "Save income"}
      </Button>
    </form>
  );
}
