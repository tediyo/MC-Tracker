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
    <div className="flex flex-col gap-3.5">
      {fields.map((field, index) => (
        <div
          key={field.id}
          className="flex items-start gap-3 rounded-xl border border-border/60 bg-accent/20 p-4 transition-all hover:bg-accent/30 hover:border-border"
        >
          <div className="flex-1">{renderRow({ index, remove: () => remove(index) })}</div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="mt-1 shrink-0 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
            disabled={fields.length <= minRows}
            onClick={() => remove(index)}
            aria-label="Remove row"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        onClick={() => append(newRowDefaults())}
        className="self-start gap-2 border-dashed border-border/80 hover:border-primary/50 hover:bg-primary/5"
      >
        <Plus className="h-4 w-4 text-primary" />
        {addLabel}
      </Button>
    </div>
  );
}
