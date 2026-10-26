"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pencil, Trash2, Search, ArrowUpDown, Filter } from "lucide-react";
import type { CostRow, CostCategory, CostSubcategory } from "@mc-tracker/shared-types";
import {
  formatCategoryLabel,
  formatSubcategoryLabel,
} from "@mc-tracker/shared-types";
import { createClient } from "@/lib/supabase/client";
import { fetchAllCosts, deleteCost, updateCost } from "@/lib/data/costs";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { WebTableSkeleton } from "@/components/ui/skeleton";
import { useCategories } from "@/components/providers/category-provider";

const CATEGORY_BADGE_STYLES: Record<string, string> = {
  basic: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  fancy: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  extra: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
};

export function CostHistoryTable({ userId }: { userId: string }) {
  const queryClient = useQueryClient();
  const supabase = React.useMemo(() => createClient(), []);
  const { categories, categoryLabels, categorySubcategoryMap, subcategoryLabels } = useCategories();

  const [editing, setEditing] = React.useState<CostRow | null>(null);
  const [editCategory, setEditCategory] = React.useState<string>("basic");
  const [editSubcategory, setEditSubcategory] = React.useState<string>("other");
  const [search, setSearch] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState<string>("all");

  const { data: costs = [], isLoading } = useQuery({
    queryKey: ["costs", userId],
    queryFn: () => fetchAllCosts(supabase, userId),
  });

  const filteredCosts = React.useMemo(() => {
    return costs.filter((r) => {
      if (categoryFilter !== "all" && r.category !== categoryFilter) return false;
      if (!search.trim()) return true;
      const term = search.toLowerCase();
      const catLabel = categoryLabels[r.category] || formatCategoryLabel(r.category);
      const subLabel = subcategoryLabels[r.subcategory] || formatSubcategoryLabel(r.subcategory);

      return (
        r.description?.toLowerCase().includes(term) ||
        catLabel.toLowerCase().includes(term) ||
        subLabel.toLowerCase().includes(term) ||
        r.date.includes(term) ||
        r.amount.toString().includes(term)
      );
    });
  }, [costs, search, categoryFilter, categoryLabels, subcategoryLabels]);

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
      category: string;
      subcategory: string;
      description: string;
    }) =>
      updateCost(supabase, input.id, {
        amount: input.amount,
        date: input.date,
        category: input.category as any,
        subcategory: input.subcategory as any,
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
    setEditSubcategory(row.subcategory);
    setEditing(row);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 text-sm text-muted-foreground">
        Loading cost history…
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search description, category, amount..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 rounded-xl h-10 bg-card"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-10 rounded-xl border border-input bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {categoryLabels[c] || formatCategoryLabel(c)}
              </option>
            ))}
          </select>
        </div>
        <div className="text-xs font-semibold text-muted-foreground">
          Showing {filteredCosts.length} of {costs.length} entries
        </div>
      </div>

      {isLoading ? (
        <WebTableSkeleton rows={5} />
      ) : filteredCosts.length === 0 ? (
        <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          {search || categoryFilter !== "all"
            ? "No matching records found."
            : "No cost entries recorded yet."}
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
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Subcategory</th>
                  <th className="px-4 py-3.5">Description</th>
                  <th className="px-4 py-3.5 text-right">Amount</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredCosts.map((row) => {
                  const badgeStyle =
                    CATEGORY_BADGE_STYLES[row.category] ||
                    "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
                  const catLabel = categoryLabels[row.category] || formatCategoryLabel(row.category);
                  const subLabel = subcategoryLabels[row.subcategory] || formatSubcategoryLabel(row.subcategory);

                  return (
                    <tr key={row.id} className="group hover:bg-accent/30 transition-colors">
                      <td className="px-4 py-3.5 font-medium text-foreground">{row.date}</td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold border ${badgeStyle}`}>
                          {catLabel}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-foreground font-medium">
                        {subLabel}
                      </td>
                      <td className="px-4 py-3.5 text-muted-foreground max-w-[200px] truncate">
                        {row.description || "—"}
                      </td>
                      <td className="px-4 py-3.5 text-right font-semibold text-foreground">
                        {formatCurrency(Number(row.amount))}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => openEdit(row)}
                            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm("Are you sure you want to delete this cost entry?")) {
                                deleteMutation.mutate(row.id);
                              }
                            }}
                            className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Edit Cost Entry</DialogTitle>
          </DialogHeader>
          {editing ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const amount = parseFloat((form.elements.namedItem("amount") as HTMLInputElement).value);
                const date = (form.elements.namedItem("date") as HTMLInputElement).value;
                const description = (form.elements.namedItem("description") as HTMLTextAreaElement).value;

                if (editSubcategory === "other" && !description.trim()) {
                  toast.error("Please specify a reason when selecting 'Other'");
                  return;
                }

                updateMutation.mutate({
                  id: editing.id,
                  amount,
                  date,
                  category: editCategory,
                  subcategory: editSubcategory,
                  description,
                });
              }}
              className="flex flex-col gap-4 py-2"
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    name="category"
                    value={editCategory}
                    onChange={(e) => {
                      const nextCat = e.target.value;
                      setEditCategory(nextCat);
                      const nextSubs = categorySubcategoryMap[nextCat] || ["other"];
                      if (nextSubs && nextSubs[0]) {
                        setEditSubcategory(nextSubs[0]);
                      }
                    }}
                    className="h-10 rounded-xl border border-input bg-card px-3 text-sm"
                  >
                    {categories.map((catKey) => (
                      <option key={catKey} value={catKey}>
                        {categoryLabels[catKey] || formatCategoryLabel(catKey)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="subcategory">Subcategory</Label>
                  <select
                    id="subcategory"
                    name="subcategory"
                    value={editSubcategory}
                    onChange={(e) => setEditSubcategory(e.target.value)}
                    key={editCategory}
                    className="h-10 rounded-xl border border-input bg-card px-3 text-sm"
                  >
                    {(categorySubcategoryMap[editCategory] || ["other"]).map((sub) => (
                      <option key={sub} value={sub}>
                        {subcategoryLabels[sub] || formatSubcategoryLabel(sub)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="amount">Amount (ETB / USD)</Label>
                <Input id="amount" name="amount" type="number" step="0.01" min="0" defaultValue={editing.amount} className="rounded-xl" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="date">Date</Label>
                <Input id="date" name="date" type="date" defaultValue={editing.date} className="rounded-xl" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="description"
                  className={editSubcategory === "other" ? "font-semibold text-primary" : ""}
                >
                  {editSubcategory === "other" ? "Reason (Required) *" : "Description"}
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={editing.description ?? ""}
                  placeholder={editSubcategory === "other" ? "State the reason for this expense..." : "Add notes or details..."}
                  className={`rounded-xl min-h-[70px] ${editSubcategory === "other" ? "border-primary/60 focus-visible:ring-primary" : ""}`}
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
