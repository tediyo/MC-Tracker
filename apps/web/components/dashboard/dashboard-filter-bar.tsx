"use client";

import * as React from "react";
import { Filter, X, Tag } from "lucide-react";
import {
  type CostCategory,
  type CostSubcategory,
} from "@mc-tracker/shared-types";
import { useCategories } from "@/components/providers/category-provider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const DEFAULT_CATEGORY_COLORS: Record<string, string> = {
  basic: "bg-blue-500",
  fancy: "bg-amber-500",
  extra: "bg-emerald-500",
};

interface DashboardFilterBarProps {
  selectedCategory: string | null;
  selectedSubcategory: string | null;
  onSelectCategory: (category: any) => void;
  onSelectSubcategory: (subcategory: any) => void;
  filteredCount?: number;
  totalCount?: number;
}

export function DashboardFilterBar({
  selectedCategory,
  selectedSubcategory,
  onSelectCategory,
  onSelectSubcategory,
  filteredCount,
  totalCount,
}: DashboardFilterBarProps) {
  const { categories, categoryLabels, categorySubcategoryMap, subcategoryLabels } = useCategories();

  // Determine available subcategories based on whether a category is selected
  const availableSubcategories: readonly string[] = React.useMemo(() => {
    if (selectedCategory) {
      return categorySubcategoryMap[selectedCategory] || ["other"];
    }
    const allSubs = new Set<string>();
    Object.values(categorySubcategoryMap).forEach((subs) => {
      subs.forEach((s) => allSubs.add(s));
    });
    return Array.from(allSubs);
  }, [selectedCategory, categorySubcategoryMap]);

  const hasActiveFilters = Boolean(selectedCategory || selectedSubcategory);

  const handleCategoryChange = (val: string) => {
    if (val === "all") {
      onSelectCategory(null);
      onSelectSubcategory(null);
    } else {
      onSelectCategory(val);
      const validSubs = categorySubcategoryMap[val] || [];
      if (selectedSubcategory && !validSubs.includes(selectedSubcategory)) {
        onSelectSubcategory(null);
      }
    }
  };

  const handleSubcategoryChange = (val: string) => {
    if (val === "all") {
      onSelectSubcategory(null);
    } else {
      onSelectSubcategory(val);
      if (!selectedCategory) {
        for (const [cat, subs] of Object.entries(categorySubcategoryMap)) {
          if (subs.includes(val)) {
            onSelectCategory(cat);
            break;
          }
        }
      }
    }
  };

  const clearAllFilters = () => {
    onSelectCategory(null);
    onSelectSubcategory(null);
  };

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card/60 p-3.5 backdrop-blur-sm shadow-sm transition-all sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          <Filter className="h-3.5 w-3.5 text-primary" />
          <span>Filter:</span>
        </div>

        {/* Quick Category Pills */}
        <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-lg border border-border/40 overflow-x-auto max-w-full">
          <button
            type="button"
            onClick={() => handleCategoryChange("all")}
            className={cn(
              "px-2.5 py-1 text-xs font-medium rounded-md transition-all whitespace-nowrap",
              !selectedCategory
                ? "bg-background text-foreground shadow-sm font-semibold"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            All
          </button>
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            const dotColor = DEFAULT_CATEGORY_COLORS[cat] || "bg-emerald-500";
            return (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategoryChange(cat)}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all whitespace-nowrap",
                  isSelected
                    ? "bg-background text-foreground shadow-sm font-semibold"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span className={cn("h-1.5 w-1.5 rounded-full", dotColor)} />
                <span>{categoryLabels[cat] || cat}</span>
              </button>
            );
          })}
        </div>

        {/* Subcategory Dropdown */}
        <div className="flex items-center gap-2 min-w-[170px]">
          <Select
            value={selectedSubcategory ?? "all"}
            onValueChange={handleSubcategoryChange}
          >
            <SelectTrigger className="h-8 text-xs bg-background/80 border-border/60">
              <div className="flex items-center gap-1.5 truncate">
                <Tag className="h-3 w-3 text-muted-foreground" />
                <SelectValue placeholder="All Subcategories" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">
                All Subcategories
              </SelectItem>
              {availableSubcategories.map((sub) => (
                <SelectItem key={sub} value={sub} className="text-xs">
                  {subcategoryLabels[sub] ?? sub}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Active Filter Indicators */}
        {hasActiveFilters && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {selectedCategory && (
              <Badge
                variant="secondary"
                className="h-6 text-[11px] gap-1 px-2 font-normal border border-border/60 bg-muted/70"
              >
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    DEFAULT_CATEGORY_COLORS[selectedCategory] || "bg-emerald-500",
                  )}
                />
                <span>{categoryLabels[selectedCategory] || selectedCategory}</span>
                <button
                  type="button"
                  onClick={() => handleCategoryChange("all")}
                  className="ml-0.5 hover:opacity-75"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </Badge>
            )}

            {selectedSubcategory && (
              <Badge
                variant="secondary"
                className="h-6 text-[11px] gap-1 px-2 font-normal border border-border/60 bg-muted/70"
              >
                <Tag className="h-2.5 w-2.5 text-primary" />
                <span>{subcategoryLabels[selectedSubcategory] || selectedSubcategory}</span>
                <button
                  type="button"
                  onClick={() => onSelectSubcategory(null)}
                  className="ml-0.5 hover:opacity-75"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </Badge>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="h-6 px-2 text-[11px] text-muted-foreground hover:text-foreground"
            >
              Reset
            </Button>
          </div>
        )}
      </div>

      {filteredCount !== undefined && totalCount !== undefined && (
        <div className="text-[11px] text-muted-foreground font-medium flex items-center gap-1.5">
          {hasActiveFilters ? (
            <span>
              Showing <strong className="text-foreground">{filteredCount}</strong> of{" "}
              {totalCount} expenses
            </span>
          ) : (
            <span>{totalCount} total expenses</span>
          )}
        </div>
      )}
    </div>
  );
}
