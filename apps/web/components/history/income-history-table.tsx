"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import type { IncomeRow } from "@mc-tracker/shared-types";
import { INCOME_SOURCE_TYPE_LABELS } from "@mc-tracker/shared-types";
import { createClient } from "@/lib/supabase/client";
import { fetchAllIncomes, deleteIncome, updateIncome } from "@/lib/data/incomes";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function IncomeHistoryTable({ userId }: { userId: string }) {
  const queryClient = useQueryClient();
  const supabase = React.useMemo(() => createClient(), []);
  const [editing, setEditing] = React.useState<IncomeRow | null>(null);

  const { data: incomes = [], isLoading } = useQuery({
    queryKey: ["incomes", userId],
    queryFn: () => fetchAllIncomes(supabase, userId),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteIncome(supabase, id),
    onSuccess: () => {
      toast.success("Income row deleted");
      queryClient.invalidateQueries({ queryKey: ["incomes", userId] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to delete"),
  });

  const updateMutation = useMutation({
    mutationFn: (input: { id: string; amount: number; date: string; description: string }) =>
      updateIncome(supabase, input.id, { amount: input.amount, date: input.date, description: input.description }),
    onSuccess: () => {
      toast.success("Income row updated");
      setEditing(null);
      queryClient.invalidateQueries({ queryKey: ["incomes", userId] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to update"),
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (incomes.length === 0) return <p className="text-sm text-muted-foreground">No income logged yet.</p>;

  return (
    <>
      <div className="overflow-x-auto rounded-md border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-muted-foreground">
            <tr>
              <th className="px-3 py-2 font-medium">Date</th>
              <th className="px-3 py-2 font-medium">Source</th>
              <th className="px-3 py-2 font-medium">Description</th>
              <th className="px-3 py-2 text-right font-medium">Amount</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {incomes.map((row) => (
              <tr key={row.id} className="border-t">
                <td className="px-3 py-2">{row.date}</td>
                <td className="px-3 py-2">{INCOME_SOURCE_TYPE_LABELS[row.source_type]}</td>
                <td className="px-3 py-2 text-muted-foreground">{row.description || "—"}</td>
                <td className="px-3 py-2 text-right font-medium">{formatCurrency(Number(row.amount))}</td>
                <td className="px-3 py-2">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => setEditing(row)} aria-label="Edit">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => {
                        if (confirm("Delete this income row?")) deleteMutation.mutate(row.id);
                      }}
                      aria-label="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit income row</DialogTitle>
          </DialogHeader>
          {editing ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formEl = e.currentTarget;
                const amount = Number((formEl.elements.namedItem("amount") as HTMLInputElement).value);
                const date = (formEl.elements.namedItem("date") as HTMLInputElement).value;
                const description = (formEl.elements.namedItem("description") as HTMLInputElement).value;
                updateMutation.mutate({ id: editing.id, amount, date, description });
              }}
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col gap-1">
                <Label htmlFor="amount">Amount (USD)</Label>
                <Input id="amount" name="amount" type="number" step="0.01" min="0" defaultValue={editing.amount} />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="date">Date</Label>
                <Input id="date" name="date" type="date" defaultValue={editing.date} />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="description">Description</Label>
                <Input id="description" name="description" defaultValue={editing.description ?? ""} />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "Saving…" : "Save changes"}
                </Button>
              </DialogFooter>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
