"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import type { CostRow, CostCategory, CostSubcategory } from "@mc-tracker/shared-types";
import { COST_CATEGORY_LABELS, COST_SUBCATEGORY_LABELS, CATEGORY_SUBCATEGORY_MAP } from "@mc-tracker/shared-types";
import { createClient } from "@/lib/supabase/client";
import { fetchAllCosts, deleteCost, updateCost } from "@/lib/data/costs";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function CostHistoryTable({ userId }: { userId: string }) {
  const queryClient = useQueryClient();
  const supabase = React.useMemo(() => createClient(), []);
  const [editing, setEditing] = React.useState<CostRow | null>(null);
  const [editCategory, setEditCategory] = React.useState<CostCategory>("basic");

  const { data: costs = [], isLoading } = useQuery({
    queryKey: ["costs", userId],
    queryFn: () => fetchAllCosts(supabase, userId),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCost(supabase, id),
    onSuccess: () => {
      toast.success("Cost row deleted");
      queryClient.invalidateQueries({ queryKey: ["costs", userId] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to delete"),
  });

  const updateMutation = useMutation({
    mutationFn: (input: {
      id: string;
      amount: number;
      date: string;
      category: CostCategory;
      subcategory: CostSubcategory;
      description: string;
    }) =>
      updateCost(supabase, input.id, {
        amount: input.amount,
        date: input.date,
        category: input.category,
        subcategory: input.subcategory,
        description: input.description,
      }),
    onSuccess: () => {
      toast.success("Cost row updated");
      setEditing(null);
      queryClient.invalidateQueries({ queryKey: ["costs", userId] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to update"),
  });

  function openEdit(row: CostRow) {
    setEditCategory(row.category);
    setEditing(row);
  }

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (costs.length === 0) return <p className="text-sm text-muted-foreground">No costs logged yet.</p>;

  return (
    <>
      <div className="overflow-x-auto rounded-md border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-muted-foreground">
            <tr>
              <th className="px-3 py-2 font-medium">Date</th>
              <th className="px-3 py-2 font-medium">Category</th>
              <th className="px-3 py-2 font-medium">Subcategory</th>
              <th className="px-3 py-2 font-medium">Description</th>
              <th className="px-3 py-2 text-right font-medium">Amount</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {costs.map((row) => (
              <tr key={row.id} className="border-t">
                <td className="px-3 py-2">{row.date}</td>
                <td className="px-3 py-2">{COST_CATEGORY_LABELS[row.category]}</td>
                <td className="px-3 py-2">{COST_SUBCATEGORY_LABELS[row.subcategory]}</td>
                <td className="px-3 py-2 text-muted-foreground">{row.description || "—"}</td>
                <td className="px-3 py-2 text-right font-medium">{formatCurrency(Number(row.amount))}</td>
                <td className="px-3 py-2">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(row)} aria-label="Edit">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => {
                        if (confirm("Delete this cost row?")) deleteMutation.mutate(row.id);
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
            <DialogTitle>Edit cost row</DialogTitle>
          </DialogHeader>
          {editing ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formEl = e.currentTarget;
                const amount = Number((formEl.elements.namedItem("amount") as HTMLInputElement).value);
                const date = (formEl.elements.namedItem("date") as HTMLInputElement).value;
                const category = (formEl.elements.namedItem("category") as HTMLSelectElement).value as CostCategory;
                const subcategory = (formEl.elements.namedItem("subcategory") as HTMLSelectElement)
                  .value as CostSubcategory;
                const description = (formEl.elements.namedItem("description") as HTMLInputElement).value;
                updateMutation.mutate({ id: editing.id, amount, date, category, subcategory, description });
              }}
              className="flex flex-col gap-4"
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    name="category"
                    defaultValue={editing.category}
                    onChange={(e) => setEditCategory(e.target.value as CostCategory)}
                    className="h-10 rounded-md border border-input bg-transparent px-3 text-sm"
                  >
                    {Object.entries(COST_CATEGORY_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor="subcategory">Subcategory</Label>
                  <select
                    id="subcategory"
                    name="subcategory"
                    defaultValue={editing.subcategory}
                    key={editCategory}
                    className="h-10 rounded-md border border-input bg-transparent px-3 text-sm"
                  >
                    {CATEGORY_SUBCATEGORY_MAP[editCategory].map((sub) => (
                      <option key={sub} value={sub}>
                        {COST_SUBCATEGORY_LABELS[sub]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
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
