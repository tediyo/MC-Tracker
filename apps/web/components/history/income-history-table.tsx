"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pencil, Trash2, Search, ArrowUpDown } from "lucide-react";
import type { IncomeRow } from "@mc-tracker/shared-types";
import { INCOME_SOURCE_TYPE_LABELS } from "@mc-tracker/shared-types";
import { createClient } from "@/lib/supabase/client";
import { fetchAllIncomes, deleteIncome, updateIncome } from "@/lib/data/incomes";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  const [search, setSearch] = React.useState("");

  const { data: incomes = [], isLoading } = useQuery({
    queryKey: ["incomes", userId],
    queryFn: () => fetchAllIncomes(supabase, userId),
  });

  const filteredIncomes = React.useMemo(() => {
    if (!search.trim()) return incomes;
    const term = search.toLowerCase();
    return incomes.filter(
      (r) =>
        r.description?.toLowerCase().includes(term) ||
        INCOME_SOURCE_TYPE_LABELS[r.source_type]?.toLowerCase().includes(term) ||
        r.date.includes(term) ||
        r.amount.toString().includes(term),
    );
  }, [incomes, search]);

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 text-sm text-muted-foreground">
        Loading income history…
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Search & Stats Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search income history..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-xs rounded-xl"
          />
        </div>
        <div className="text-xs font-semibold text-muted-foreground">
          Showing {filteredIncomes.length} of {incomes.length} entries
        </div>
      </div>

      {filteredIncomes.length === 0 ? (
        <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          {search ? "No matching income records found." : "No income logged yet."}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border/50">
                <tr>
                  <th className="px-4 py-3.5">
                    <span className="flex items-center gap-1">
                      Date <ArrowUpDown className="h-3 w-3" />
                    </span>
                  </th>
                  <th className="px-4 py-3.5">Source</th>
                  <th className="px-4 py-3.5">Description</th>
                  <th className="px-4 py-3.5 text-right">Amount</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredIncomes.map((row) => (
                  <tr key={row.id} className="group hover:bg-accent/30 transition-colors">
                    <td className="px-4 py-3.5 font-medium text-foreground">{row.date}</td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center rounded-md bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        {INCOME_SOURCE_TYPE_LABELS[row.source_type]}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground max-w-[200px] truncate">
                      {row.description || "—"}
                    </td>
                    <td className="px-4 py-3.5 text-right font-bold text-foreground tabular-nums">
                      {formatCurrency(Number(row.amount))}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
                          onClick={() => setEditing(row)}
                          aria-label="Edit"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => {
                            if (confirm("Delete this income entry?")) deleteMutation.mutate(row.id);
                          }}
                          aria-label="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Income Entry</DialogTitle>
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
              className="flex flex-col gap-4 py-2"
            >
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="amount">Amount (USD)</Label>
                <Input id="amount" name="amount" type="number" step="0.01" min="0" defaultValue={editing.amount} className="rounded-xl" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="date">Date</Label>
                <Input id="date" name="date" type="date" defaultValue={editing.date} className="rounded-xl" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={editing.description ?? ""}
                  placeholder="Add notes or details..."
                  className="rounded-xl min-h-[70px]"
                />
              </div>
              <DialogFooter className="pt-2">
                <Button type="submit" disabled={updateMutation.isPending} className="rounded-xl">
                  {updateMutation.isPending ? "Saving…" : "Save changes"}
                </Button>
              </DialogFooter>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
