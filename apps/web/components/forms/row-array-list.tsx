"use client";

import * as React from "react";
import { useFieldArray, type ArrayPath, type Control, type FieldArray, type FieldValues } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RowArrayListProps<TFieldValues extends FieldValues, TName extends ArrayPath<TFieldValues>> {
  control: Control<TFieldValues>;
  name: TName;
  renderRow: (args: { index: number; remove: () => void }) => React.ReactNode;
  newRowDefaults: () => FieldArray<TFieldValues, TName>;
  minRows?: number;
  addLabel?: string;
}

/**
 * Generic add/remove-row shell built on react-hook-form's `useFieldArray`.
 * Both IncomeEntryForm and CostEntryForm build on this - it owns the
 * "+ Add row" button and per-row remove button (disabled once only
 * `minRows` remain), so each form only has to supply its own row fields
 * via `renderRow`.
 */
export function RowArrayList<TFieldValues extends FieldValues, TName extends ArrayPath<TFieldValues>>({
  control,
  name,
  renderRow,
  newRowDefaults,
  minRows = 1,
  addLabel = "Add another row",
}: RowArrayListProps<TFieldValues, TName>) {
  const { fields, append, remove } = useFieldArray({ control, name });

  return (
    <div className="flex flex-col gap-3">
      {fields.map((field, index) => (
        <div key={field.id} className="flex items-start gap-2 rounded-md border p-3">
          <div className="flex-1">{renderRow({ index, remove: () => remove(index) })}</div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="mt-1 shrink-0 text-muted-foreground hover:text-destructive"
            disabled={fields.length <= minRows}
            onClick={() => remove(index)}
            aria-label="Remove row"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" onClick={() => append(newRowDefaults())} className="self-start">
        <Plus className="h-4 w-4" />
        {addLabel}
      </Button>
    </div>
  );
}
