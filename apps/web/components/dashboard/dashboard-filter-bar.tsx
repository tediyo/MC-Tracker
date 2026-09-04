"use client";

import * as React from "react";
import { Filter, X, Tag } from "lucide-react";
import {
  COST_CATEGORIES,
  COST_CATEGORY_LABELS,
  COST_SUBCATEGORIES,
  COST_SUBCATEGORY_LABELS,
  CATEGORY_SUBCATEGORY_MAP,
  type CostCategory,
  type CostSubcategory,
} from "@mc-tracker/shared-types";
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

const CATEGORY_COLORS: Record<CostCategory, string> = {
  basic: "bg-blue-500",
  fancy: "bg-amber-500",
  extra: "bg-emerald-500",
};

interface DashboardFilterBarProps {
  selectedCategory: CostCategory | null;
  selectedSubcategory: CostSubcategory | null;
  onSelectCategory: (category: CostCategory | null) => void;
  onSelectSubcategory: (subcategory: CostSubcategory | null) => void;
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
  // Determine available subcategories based on whether a category is selected
  const availableSubcategories: readonly CostSubcategory[] = React.useMemo(() => {
    if (selectedCategory) {
      return CATEGORY_SUBCATEGORY_MAP[selectedCategory];
    }
    return COST_SUBCATEGORIES;
  }, [selectedCategory]);

  const hasActiveFilters = Boolean(selectedCategory || selectedSubcategory);

  const handleCategoryChange = (val: string) => {
    if (val === "all") {
      onSelectCategory(null);
      // Keep subcategory if still valid or reset
      onSelectSubcategory(null);
    } else {
      const cat = val as CostCategory;
      onSelectCategory(cat);
      // Reset subcategory if current selection is not valid for this category
      if (
        selectedSubcategory &&
        !CATEGORY_SUBCATEGORY_MAP[cat].includes(selectedSubcategory)
      ) {
        onSelectSubcategory(null);
      }
    }
  };

  const handleSubcategoryChange = (val: string) => {
    if (val === "all") {
      onSelectSubcategory(null);
    } else {
      const sub = val as CostSubcategory;
      onSelectSubcategory(sub);
      // If no category was selected, find which category this subcategory belongs to
      if (!selectedCategory) {
        for (const [cat, subs] of Object.entries(CATEGORY_SUBCATEGORY_MAP)) {
          if (subs.includes(sub)) {
            onSelectCategory(cat as CostCategory);
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
        <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-lg border border-border/40">
          <button
            type="button"
            onClick={() => handleCategoryChange("all")}
            className={cn(
              "px-2.5 py-1 text-xs font-medium rounded-md transition-all",
              !selectedCategory
                ? "bg-background text-foreground shadow-sm font-semibold"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            All
          </button>
          {COST_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategoryChange(cat)}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all",
                  isSelected
                    ? "bg-background text-foreground shadow-sm font-semibold"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    CATEGORY_COLORS[cat],
                  )}
                />
                <span>{COST_CATEGORY_LABELS[cat]}</span>
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
                  {COST_SUBCATEGORY_LABELS[sub] ?? sub}
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
                    CATEGORY_COLORS[selectedCategory],
                  )}
                />
                <span>{COST_CATEGORY_LABELS[selectedCategory]}</span>
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
                <span>{COST_SUBCATEGORY_LABELS[selectedSubcategory]}</span>
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
