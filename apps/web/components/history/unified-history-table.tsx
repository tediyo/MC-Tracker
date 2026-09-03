"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Pencil,
  Trash2,
  Search,
  Filter,
  TrendingUp,
  Receipt,
  ArrowUpDown,
  SlidersHorizontal,
  Plus,
  Eye,
  Calendar as CalendarIcon,
  Tag,
  FileText,
  Clock,
} from "lucide-react";
import Link from "next/link";
import {
  COST_CATEGORY_LABELS,
  COST_SUBCATEGORY_LABELS,
  CATEGORY_SUBCATEGORY_MAP,
  INCOME_SOURCE_TYPE_LABELS,
  INCOME_SOURCE_TYPES,
  getEthiopianDate,
  ETHIOPIAN_MONTHS,
  type CostRow,
  type CostCategory,
  type CostSubcategory,
  type IncomeRow,
  type IncomeSourceType,
} from "@mc-tracker/shared-types";
import { createClient } from "@/lib/supabase/client";
import { fetchAllCosts, deleteCost, updateCost } from "@/lib/data/costs";
import { fetchAllIncomes, deleteIncome, updateIncome } from "@/lib/data/incomes";
import { formatCurrency, cn } from "@/lib/utils";
import { useCalendarPreference } from "@/components/providers/calendar-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { WebTableSkeleton } from "@/components/ui/skeleton";

export type TransactionTypeFilter = "all" | "cost" | "income";

interface UnifiedHistoryItem {
  id: string;
  rawId: string;
  type: "cost" | "income";
  amount: number;
  date: string;
  categoryOrSource: string;
  subcategory?: CostSubcategory;
  category?: CostCategory;
  sourceType?: IncomeSourceType;
  description: string | null;
  rawCost?: CostRow;
  rawIncome?: IncomeRow;
}

const COST_CATEGORY_BADGE_STYLES: Record<CostCategory, string> = {
  basic: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  fancy: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  extra: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
};

export function UnifiedHistoryTable({
  userId,
  initialTypeFilter = "all",
}: {
  userId: string;
  initialTypeFilter?: TransactionTypeFilter;
}) {
  const queryClient = useQueryClient();
  const supabase = React.useMemo(() => createClient(), []);
  const { calendarMode } = useCalendarPreference();

  // Filters
  const [typeFilter, setTypeFilter] = React.useState<TransactionTypeFilter>(initialTypeFilter);
  const [categoryFilter, setCategoryFilter] = React.useState<string>("all");
  const [search, setSearch] = React.useState("");

  // Detail Modal
  const [selectedDetailItem, setSelectedDetailItem] = React.useState<UnifiedHistoryItem | null>(null);

  // Edit Modals
  const [editingCost, setEditingCost] = React.useState<CostRow | null>(null);
  const [editCostCategory, setEditCostCategory] = React.useState<CostCategory>("basic");
  const [editCostSubcategory, setEditCostSubcategory] = React.useState<CostSubcategory>("other");

  const [editingIncome, setEditingIncome] = React.useState<IncomeRow | null>(null);
  const [editIncomeSource, setEditIncomeSource] = React.useState<IncomeSourceType>("monthly");

  // Fetch Costs & Incomes
  const { data: costs = [], isLoading: isLoadingCosts } = useQuery({
    queryKey: ["costs", userId],
    queryFn: () => fetchAllCosts(supabase, userId),
  });

  const { data: incomes = [], isLoading: isLoadingIncomes } = useQuery({
    queryKey: ["incomes", userId],
    queryFn: () => fetchAllIncomes(supabase, userId),
  });

  const isLoading = isLoadingCosts || isLoadingIncomes;

  // Combine and Filter
  const items = React.useMemo(() => {
    const costItems: UnifiedHistoryItem[] = costs.map((c) => ({
      id: `cost-${c.id}`,
      rawId: c.id,
      type: "cost",
      amount: c.amount,
      date: c.date,
      categoryOrSource: COST_CATEGORY_LABELS[c.category] || c.category,
      subcategory: c.subcategory,
      category: c.category,
      description: c.description,
      rawCost: c,
    }));

    const incomeItems: UnifiedHistoryItem[] = incomes.map((i) => ({
      id: `inc-${i.id}`,
      rawId: i.id,
      type: "income",
      amount: i.amount,
      date: i.date,
      categoryOrSource: INCOME_SOURCE_TYPE_LABELS[i.source_type] || i.source_type,
      sourceType: i.source_type,
      description: i.description,
      rawIncome: i,
    }));

    let all: UnifiedHistoryItem[] = [];
    if (typeFilter === "all") {
      all = [...costItems, ...incomeItems];
    } else if (typeFilter === "cost") {
      all = costItems;
    } else if (typeFilter === "income") {
      all = incomeItems;
    }

    return all
      .filter((r) => {
        if (categoryFilter !== "all" && r.type === "cost" && r.category !== categoryFilter) {
          return false;
        }
        if (!search.trim()) return true;
        const term = search.toLowerCase();
        const subLabel = r.subcategory ? COST_SUBCATEGORY_LABELS[r.subcategory] : "";
        return (
          r.description?.toLowerCase().includes(term) ||
          r.categoryOrSource.toLowerCase().includes(term) ||
          subLabel.toLowerCase().includes(term) ||
          r.date.includes(term) ||
          r.amount.toString().includes(term)
        );
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [costs, incomes, typeFilter, categoryFilter, search]);

  // Totals for current filtered items
  const stats = React.useMemo(() => {
    let totalIncome = 0;
    let totalCost = 0;
    items.forEach((item) => {
      if (item.type === "income") totalIncome += Number(item.amount);
      else totalCost += Number(item.amount);
    });
    return {
      totalIncome,
      totalCost,
      net: totalIncome - totalCost,
      count: items.length,
    };
  }, [items]);

  // Mutations
  const deleteCostMutation = useMutation({
    mutationFn: (id: string) => deleteCost(supabase, id),
    onSuccess: () => {
      toast.success("Expense row deleted");
      queryClient.invalidateQueries({ queryKey: ["costs", userId] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Failed to delete expense"),
  });

  const deleteIncomeMutation = useMutation({
    mutationFn: (id: string) => deleteIncome(supabase, id),
    onSuccess: () => {
      toast.success("Income row deleted");
      queryClient.invalidateQueries({ queryKey: ["incomes", userId] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Failed to delete income"),
  });

  const updateCostMutation = useMutation({
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
      toast.success("Expense updated");
      setEditingCost(null);
      queryClient.invalidateQueries({ queryKey: ["costs", userId] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Failed to update expense"),
  });

  const updateIncomeMutation = useMutation({
    mutationFn: (input: { id: string; amount: number; date: string; source_type: IncomeSourceType; description: string }) =>
      updateIncome(supabase, input.id, {
        amount: input.amount,
        date: input.date,
        source_type: input.source_type,
        description: input.description,
      }),
    onSuccess: () => {
      toast.success("Income updated");
      setEditingIncome(null);
      queryClient.invalidateQueries({ queryKey: ["incomes", userId] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Failed to update income"),
  });

  const formatDateLabel = (isoDate: string) => {
    if (calendarMode === "gregorian") return isoDate;
    try {
      const eth = getEthiopianDate(isoDate);
      const ethMonth = ETHIOPIAN_MONTHS.find((m) => m.number === eth.month);
      return `${ethMonth?.nameEn || "Month"} ${eth.day}, ${eth.year} E.C.`;
    } catch {
      return isoDate;
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* 1. Summary Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-xl border border-border bg-card p-3.5 shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Total Income</span>
          <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{formatCurrency(stats.totalIncome)}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3.5 shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Total Expenses</span>
          <p className="text-lg font-bold text-rose-600 dark:text-rose-400 mt-0.5">{formatCurrency(stats.totalCost)}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3.5 shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Net Balance</span>
          <p className={cn("text-lg font-bold mt-0.5", stats.net >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400")}>
            {formatCurrency(stats.net)}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3.5 shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Filtered Items</span>
          <p className="text-lg font-bold text-foreground mt-0.5">{stats.count} entries</p>
        </div>
      </div>

      {/* 2. Controls & Dropdown Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card p-4 rounded-xl border border-border shadow-sm">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search history by keyword, amount, date..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs rounded-xl"
            />
          </div>

          {/* Transaction Type Filter Dropdown */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-emerald-500 shrink-0" />
            <Select value={typeFilter} onValueChange={(val) => setTypeFilter(val as TransactionTypeFilter)}>
              <SelectTrigger className="w-[180px] h-9 text-xs font-semibold rounded-xl">
                <SelectValue placeholder="Transaction Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">🌐 All Transactions</SelectItem>
                <SelectItem value="cost">🔴 Expenses Only</SelectItem>
                <SelectItem value="income">🟢 Income Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Category Filter Dropdown (when costs are enabled) */}
          {typeFilter !== "income" && (
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[140px] h-9 text-xs rounded-xl">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="basic">Basic</SelectItem>
                <SelectItem value="fancy">Fancy</SelectItem>
                <SelectItem value="extra">Extra</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Quick Log Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <Button asChild size="sm" variant="outline" className="gap-1 rounded-xl text-xs font-semibold">
            <Link href="/costs">
              <Plus className="h-3.5 w-3.5 text-rose-500" />
              <span>Log Expense</span>
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="gap-1 rounded-xl text-xs font-semibold">
            <Link href="/income">
              <Plus className="h-3.5 w-3.5 text-emerald-500" />
              <span>Log Income</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* 3. History Table */}
      {isLoading ? (
        <WebTableSkeleton rows={6} />
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground bg-card/40">
          {search || categoryFilter !== "all" || typeFilter !== "all"
            ? "No transactions match your filter criteria."
            : "No transaction records found yet."}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-4 py-3.5">Type</th>
                  <th className="px-4 py-3.5">Date</th>
                  <th className="px-4 py-3.5">Category / Source</th>
                  <th className="px-4 py-3.5">Details</th>
                  <th className="px-4 py-3.5 text-right">Amount</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {items.map((item) => {
                  const isIncome = item.type === "income";
                  return (
                    <tr key={item.id} className="transition-colors hover:bg-accent/40">
                      {/* Type Badge */}
                      <td className="px-4 py-3.5">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold border",
                            isIncome
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                              : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                          )}
                        >
                          {isIncome ? <TrendingUp className="h-3.5 w-3.5" /> : <Receipt className="h-3.5 w-3.5" />}
                          <span>{isIncome ? "Income" : "Expense"}</span>
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3.5 text-xs font-medium text-foreground whitespace-nowrap">
                        {formatDateLabel(item.date)}
                      </td>

                      {/* Category / Source */}
                      <td className="px-4 py-3.5">
                        {isIncome ? (
                          <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-semibold text-foreground">
                            {item.categoryOrSource}
                          </span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span
                              className={cn(
                                "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-bold uppercase tracking-wider",
                                COST_CATEGORY_BADGE_STYLES[item.category || "basic"]
                              )}
                            >
                              {item.categoryOrSource}
                            </span>
                            {item.subcategory && (
                              <span className="text-xs font-semibold text-foreground">
                                {COST_SUBCATEGORY_LABELS[item.subcategory]}
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Details / Description */}
                      <td className="px-4 py-3.5 max-w-[220px]">
                        <span className="text-xs text-muted-foreground line-clamp-1">
                          {item.description || "—"}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="px-4 py-3.5 text-right font-bold tabular-nums">
                        <span
                          className={cn(
                            "text-sm font-bold",
                            isIncome ? "text-emerald-600 dark:text-emerald-400" : "text-foreground"
                          )}
                        >
                          {isIncome ? "+" : "-"}
                          {formatCurrency(item.amount)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-emerald-500"
                            title="View Full Details"
                            onClick={() => setSelectedDetailItem(item)}
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            title="Edit"
                            onClick={() => {
                              if (isIncome && item.rawIncome) {
                                setEditIncomeSource(item.rawIncome.source_type);
                                setEditingIncome(item.rawIncome);
                              } else if (!isIncome && item.rawCost) {
                                setEditCostCategory(item.rawCost.category);
                                setEditCostSubcategory(item.rawCost.subcategory);
                                setEditingCost(item.rawCost);
                              }
                            }}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-rose-600 dark:hover:text-rose-400"
                            title="Delete"
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete this ${item.type}?`)) {
                                if (isIncome) deleteIncomeMutation.mutate(item.rawId);
                                else deleteCostMutation.mutate(item.rawId);
                              }
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
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

      {/* 4. Edit Cost Dialog */}
      {editingCost && (
        <Dialog open={!!editingCost} onOpenChange={(open) => !open && setEditingCost(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-bold">Edit Expense Entry</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formEl = e.currentTarget;
                const amount = parseFloat((formEl.elements.namedItem("amount") as HTMLInputElement).value);
                const date = (formEl.elements.namedItem("date") as HTMLInputElement).value;
                const category = (formEl.elements.namedItem("category") as HTMLSelectElement).value as CostCategory;
                const subcategory = (formEl.elements.namedItem("subcategory") as HTMLSelectElement).value as CostSubcategory;
                const description = (formEl.elements.namedItem("description") as HTMLTextAreaElement).value;

                if (isNaN(amount) || amount <= 0) {
                  toast.error("Please enter a valid positive amount");
                  return;
                }

                updateCostMutation.mutate({
                  id: editingCost.id,
                  amount,
                  date,
                  category,
                  subcategory,
                  description,
                });
              }}
              className="flex flex-col gap-4 py-2"
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <Label htmlFor="edit-cost-amount">Amount (USD)</Label>
                  <Input id="edit-cost-amount" name="amount" type="number" step="0.01" defaultValue={editingCost.amount} required className="rounded-xl" />
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor="edit-cost-date">Date</Label>
                  <Input id="edit-cost-date" name="date" type="date" defaultValue={editingCost.date} required className="rounded-xl" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <Label htmlFor="edit-cost-category">Category</Label>
                  <select
                    id="edit-cost-category"
                    name="category"
                    value={editCostCategory}
                    onChange={(e) => {
                      const nextCat = e.target.value as CostCategory;
                      setEditCostCategory(nextCat);
                      const nextSubs = CATEGORY_SUBCATEGORY_MAP[nextCat];
                      if (nextSubs && nextSubs[0]) {
                        setEditCostSubcategory(nextSubs[0]);
                      }
                    }}
                    className="flex h-9 w-full rounded-xl border border-input bg-transparent px-3 py-1 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="basic">Basic</option>
                    <option value="fancy">Fancy</option>
                    <option value="extra">Extra</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor="edit-cost-subcategory">Subcategory</Label>
                  <select
                    id="edit-cost-subcategory"
                    name="subcategory"
                    value={editCostSubcategory}
                    onChange={(e) => setEditCostSubcategory(e.target.value as CostSubcategory)}
                    className="flex h-9 w-full rounded-xl border border-input bg-transparent px-3 py-1 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    {CATEGORY_SUBCATEGORY_MAP[editCostCategory]?.map((sub) => (
                      <option key={sub} value={sub}>
                        {COST_SUBCATEGORY_LABELS[sub]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <Label htmlFor="edit-cost-desc">Description / Notes</Label>
                <Textarea id="edit-cost-desc" name="description" defaultValue={editingCost.description || ""} className="rounded-xl min-h-[60px]" />
              </div>

              <DialogFooter className="gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setEditingCost(null)} className="rounded-xl">
                  Cancel
                </Button>
                <Button type="submit" disabled={updateCostMutation.isPending} className="rounded-xl bg-primary text-primary-foreground">
                  {updateCostMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* 5. Edit Income Dialog */}
      {editingIncome && (
        <Dialog open={!!editingIncome} onOpenChange={(open) => !open && setEditingIncome(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-bold">Edit Income Entry</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formEl = e.currentTarget;
                const amount = parseFloat((formEl.elements.namedItem("amount") as HTMLInputElement).value);
                const date = (formEl.elements.namedItem("date") as HTMLInputElement).value;
                const source_type = (formEl.elements.namedItem("source_type") as HTMLSelectElement).value as IncomeSourceType;
                const description = (formEl.elements.namedItem("description") as HTMLTextAreaElement).value;

                if (isNaN(amount) || amount <= 0) {
                  toast.error("Please enter a valid positive amount");
                  return;
                }

                updateIncomeMutation.mutate({
                  id: editingIncome.id,
                  amount,
                  date,
                  source_type,
                  description,
                });
              }}
              className="flex flex-col gap-4 py-2"
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <Label htmlFor="edit-inc-amount">Amount (USD)</Label>
                  <Input id="edit-inc-amount" name="amount" type="number" step="0.01" defaultValue={editingIncome.amount} required className="rounded-xl" />
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor="edit-inc-date">Date</Label>
                  <Input id="edit-inc-date" name="date" type="date" defaultValue={editingIncome.date} required className="rounded-xl" />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <Label htmlFor="edit-inc-source">Source Type</Label>
                <select
                  id="edit-inc-source"
                  name="source_type"
                  value={editIncomeSource}
                  onChange={(e) => setEditIncomeSource(e.target.value as IncomeSourceType)}
                  className="flex h-9 w-full rounded-xl border border-input bg-transparent px-3 py-1 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {INCOME_SOURCE_TYPES.map((st) => (
                    <option key={st} value={st}>
                      {INCOME_SOURCE_TYPE_LABELS[st]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <Label htmlFor="edit-inc-desc">Description / Notes</Label>
                <Textarea id="edit-inc-desc" name="description" defaultValue={editingIncome.description || ""} className="rounded-xl min-h-[60px]" />
              </div>

              <DialogFooter className="gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setEditingIncome(null)} className="rounded-xl">
                  Cancel
                </Button>
                <Button type="submit" disabled={updateIncomeMutation.isPending} className="rounded-xl bg-primary text-primary-foreground">
                  {updateIncomeMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* 6. Transaction Details Dialog */}
      {selectedDetailItem && (
        <Dialog open={!!selectedDetailItem} onOpenChange={(open) => !open && setSelectedDetailItem(null)}>
          <DialogContent className="sm:max-w-md rounded-xl border-border">
            <DialogHeader className="pb-2">
              <DialogTitle className="text-lg font-bold text-foreground">Transaction Details</DialogTitle>
            </DialogHeader>

            <div className="py-2">
              <table className="w-full text-xs text-left border-collapse">
                <tbody className="divide-y divide-border border-t border-b border-border">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold text-muted-foreground bg-muted/30 w-1/3">Type</th>
                    <td className="py-2.5 px-3 font-medium text-foreground">
                      {selectedDetailItem.type === "income" ? "Income" : "Expense"}
                    </td>
                  </tr>
                  <tr>
                    <th className="py-2.5 px-3 font-semibold text-muted-foreground bg-muted/30">Amount</th>
                    <td className="py-2.5 px-3 font-bold text-foreground tabular-nums">
                      {selectedDetailItem.type === "income" ? "+" : "-"}
                      {formatCurrency(selectedDetailItem.amount)}
                    </td>
                  </tr>
                  <tr>
                    <th className="py-2.5 px-3 font-semibold text-muted-foreground bg-muted/30">Date</th>
                    <td className="py-2.5 px-3 font-medium text-foreground">
                      {formatDateLabel(selectedDetailItem.date)} ({selectedDetailItem.date} G.C.)
                    </td>
                  </tr>
                  <tr>
                    <th className="py-2.5 px-3 font-semibold text-muted-foreground bg-muted/30">
                      {selectedDetailItem.type === "income" ? "Source" : "Category"}
                    </th>
                    <td className="py-2.5 px-3 font-medium text-foreground">
                      {selectedDetailItem.type === "income"
                        ? selectedDetailItem.categoryOrSource
                        : `${selectedDetailItem.categoryOrSource}${
                            selectedDetailItem.subcategory
                              ? ` (${COST_SUBCATEGORY_LABELS[selectedDetailItem.subcategory]})`
                              : ""
                          }`}
                    </td>
                  </tr>
                  <tr>
                    <th className="py-2.5 px-3 font-semibold text-muted-foreground bg-muted/30">Description</th>
                    <td className="py-2.5 px-3 text-foreground whitespace-pre-wrap">
                      {selectedDetailItem.description || "—"}
                    </td>
                  </tr>
                  <tr>
                    <th className="py-2.5 px-3 font-semibold text-muted-foreground bg-muted/30">Record ID</th>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-muted-foreground">
                      {selectedDetailItem.rawId}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <DialogFooter className="flex-row items-center justify-between gap-2 pt-2">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-lg text-xs"
                  onClick={() => {
                    const item = selectedDetailItem;
                    setSelectedDetailItem(null);
                    if (item.type === "income" && item.rawIncome) {
                      setEditIncomeSource(item.rawIncome.source_type);
                      setEditingIncome(item.rawIncome);
                    } else if (item.type === "cost" && item.rawCost) {
                      setEditCostCategory(item.rawCost.category);
                      setEditCostSubcategory(item.rawCost.subcategory);
                      setEditingCost(item.rawCost);
                    }
                  }}
                >
                  Edit
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-lg text-xs text-rose-600 hover:text-rose-700"
                  onClick={() => {
                    const item = selectedDetailItem;
                    setSelectedDetailItem(null);
                    if (confirm(`Are you sure you want to delete this ${item.type}?`)) {
                      if (item.type === "income") deleteIncomeMutation.mutate(item.rawId);
                      else deleteCostMutation.mutate(item.rawId);
                    }
                  }}
                >
                  Delete
                </Button>
              </div>
              <Button type="button" size="sm" onClick={() => setSelectedDetailItem(null)} className="rounded-lg text-xs">
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
