"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pencil, Trash2, Search, ArrowUpDown, Filter } from "lucide-react";
import type { CostRow, CostCategory, CostSubcategory } from "@mc-tracker/shared-types";
import { COST_CATEGORY_LABELS, COST_SUBCATEGORY_LABELS, CATEGORY_SUBCATEGORY_MAP } from "@mc-tracker/shared-types";
import { createClient } from "@/lib/supabase/client";
import { fetchAllCosts, deleteCost, updateCost } from "@/lib/data/costs";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const CATEGORY_BADGE_STYLES: Record<CostCategory, string> = {
  basic: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  fancy: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  extra: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
};

export function CostHistoryTable({ userId }: { userId: string }) {
  const queryClient = useQueryClient();
  const supabase = React.useMemo(() => createClient(), []);
  const [editing, setEditing] = React.useState<CostRow | null>(null);
  const [editCategory, setEditCategory] = React.useState<CostCategory>("basic");
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
      return (
        r.description?.toLowerCase().includes(term) ||
        COST_CATEGORY_LABELS[r.category]?.toLowerCase().includes(term) ||
        COST_SUBCATEGORY_LABELS[r.subcategory]?.toLowerCase().includes(term) ||
        r.date.includes(term) ||
        r.amount.toString().includes(term)
      );
    });
  }, [costs, search, categoryFilter]);

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

  const [editing, setEditing] = React.useState<CostRow | null>(null);
  const [editCategory, setEditCategory] = React.useState<CostCategory>("basic");
  const [editSubcategory, setEditSubcategory] = React.useState<CostSubcategory>("other");

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
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search expenses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs rounded-xl"
            />
          </div>
          <div className="flex items-center gap-1.5 rounded-xl border border-border/60 bg-card px-3 py-1.5 text-xs text-muted-foreground">
            <Filter className="h-3.5 w-3.5" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent font-medium text-foreground outline-none cursor-pointer"
            >
              <option value="all">All Categories</option>
              {Object.entries(COST_CATEGORY_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="text-xs font-semibold text-muted-foreground">
          Showing {filteredCosts.length} of {costs.length} entries
        </div>
      </div>

      {filteredCosts.length === 0 ? (
        <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          {search || categoryFilter !== "all"
            ? "No matching cost records found."
            : "No costs logged yet."}
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
                {filteredCosts.map((row) => (
                  <tr key={row.id} className="group hover:bg-accent/30 transition-colors">
                    <td className="px-4 py-3.5 font-medium text-foreground">{row.date}</td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold border ${
                          CATEGORY_BADGE_STYLES[row.category]
                        }`}
                      >
                        {COST_CATEGORY_LABELS[row.category]}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-foreground font-medium">
                      {COST_SUBCATEGORY_LABELS[row.subcategory]}
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
                          onClick={() => openEdit(row)}
                          aria-label="Edit"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => {
                            if (confirm("Delete this cost entry?")) deleteMutation.mutate(row.id);
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
            <DialogTitle>Edit Cost Entry</DialogTitle>
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
                if (subcategory === "other" && !description.trim()) {
                  toast.error("Please specify a reason when selecting 'Other'");
                  return;
                }
                updateMutation.mutate({ id: editing.id, amount, date, category, subcategory, description });
              }}
              className="flex flex-col gap-4 py-2"
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    name="category"
                    defaultValue={editing.category}
                    onChange={(e) => {
                      const nextCat = e.target.value as CostCategory;
                      setEditCategory(nextCat);
                      const nextSubs = CATEGORY_SUBCATEGORY_MAP[nextCat];
                      if (nextSubs && nextSubs.length > 0) {
                        setEditSubcategory(nextSubs[0]);
                      }
                    }}
                    className="h-10 rounded-xl border border-input bg-card px-3 text-sm"
                  >
                    {Object.entries(COST_CATEGORY_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
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
                    onChange={(e) => setEditSubcategory(e.target.value as CostSubcategory)}
                    key={editCategory}
                    className="h-10 rounded-xl border border-input bg-card px-3 text-sm"
                  >
                    {CATEGORY_SUBCATEGORY_MAP[editCategory].map((sub) => (
                      <option key={sub} value={sub}>
                        {COST_SUBCATEGORY_LABELS[sub]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="amount">Amount (USD)</Label>
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
