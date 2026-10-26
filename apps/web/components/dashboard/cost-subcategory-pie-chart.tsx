"use client";

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { CostCategory, CostSubcategory, CostRow } from "@mc-tracker/shared-types";
import {
  COST_CATEGORY_LABELS,
  COST_SUBCATEGORY_LABELS,
  groupCostsBySubcategory,
  filterCostsInRange,
  formatCategoryLabel,
  formatSubcategoryLabel,
} from "@mc-tracker/shared-types";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCategories } from "@/components/providers/category-provider";

const CATEGORY_SERIES_VAR: Record<string, string> = {
  basic: "--series-1",
  fancy: "--series-2",
  extra: "--series-3",
};

const DEFAULT_PALETTE = [
  "hsl(120, 97%, 35%)", // Brand Green
  "hsl(217, 91%, 60%)", // Blue
  "hsl(38, 92%, 50%)",  // Amber
  "hsl(270, 70%, 60%)", // Purple
  "hsl(340, 75%, 55%)", // Pink
  "hsl(180, 70%, 45%)", // Teal
  "hsl(15, 85%, 55%)",  // Coral
  "hsl(160, 80%, 40%)", // Mint
];

function stepColor(seriesVar: string, mixPercent: number): string {
  return `color-mix(in srgb, var(${seriesVar}) ${mixPercent}%, var(--surface-1))`;
}

interface CostSubcategoryPieChartProps {
  category: string | null;
  costs: CostRow[];
  range: { start: Date; end: Date };
  selectedSubcategory?: string | null;
  onSelectSubcategory?: (subcategory: any) => void;
}

export function CostSubcategoryPieChart({
  category,
  costs,
  range,
  selectedSubcategory,
  onSelectSubcategory,
}: CostSubcategoryPieChartProps) {
  const { categoryLabels, subcategoryLabels, categorySubcategoryMap } = useCategories();
  let subcategoryMap: Record<string, number> = {};
  let titleText = "Subcategory Breakdown";
  let isAll = !category;

  if (category) {
    const validSubs = categorySubcategoryMap[category] || [];
    subcategoryMap = groupCostsBySubcategory(costs, range, category, validSubs);
    const catLabel = categoryLabels[category] || formatCategoryLabel(category);
    titleText = `${catLabel} Breakdown`;
  } else {
    // Calculate subcategory totals across all costs in date range
    const filteredCosts = filterCostsInRange(costs, range);
    filteredCosts.forEach((row) => {
      if (row.subcategory) {
        subcategoryMap[row.subcategory] = (subcategoryMap[row.subcategory] || 0) + Number(row.amount);
      }
    });
  }

  // Filter down to subcategories that have amount > 0
  const activeSubcategories = Object.keys(subcategoryMap).filter(
    (sub) => (subcategoryMap[sub] || 0) > 0
  );

  const subcategoriesToRender = activeSubcategories.length > 0
    ? activeSubcategories
    : Object.keys(subcategoryMap);

  const chartData = subcategoriesToRender.map((sub, index) => {
    let color = DEFAULT_PALETTE[index % DEFAULT_PALETTE.length];
    if (category && CATEGORY_SERIES_VAR[category]) {
      const seriesVar = CATEGORY_SERIES_VAR[category];
      const mixPercent = subcategoriesToRender.length <= 1
        ? 100
        : 100 - (index * 65) / (subcategoriesToRender.length - 1);
      color = stepColor(seriesVar, mixPercent);
    }

    const subLabel = subcategoryLabels[sub] || formatSubcategoryLabel(sub);

    return {
      subcategory: sub,
      label: subLabel,
      value: subcategoryMap[sub] ?? 0,
      color,
    };
  });

  const total = chartData.reduce((sum, d) => sum + d.value, 0);

  return (
    <Card className="viz-root border-border/60 shadow-sm" style={{ background: "var(--surface-1)" }}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-base font-bold text-foreground">
            {titleText}
          </CardTitle>
          {isAll && (
            <span className="text-[11px] font-medium text-muted-foreground bg-muted/60 px-2.5 py-0.5 rounded-full">
              Click a Category to filter
            </span>
          )}
          {selectedSubcategory && (
            <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
              Selected: {subcategoryLabels[selectedSubcategory] || formatSubcategoryLabel(selectedSubcategory)}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 || total === 0 ? (
          <div className="flex h-[240px] items-center justify-center text-sm text-muted-foreground">
            No expenses logged for this selection
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    outerRadius={85}
                    innerRadius={45}
                    paddingAngle={2}
                    cursor="pointer"
                    onClick={(entry) => {
                      if (onSelectSubcategory && entry && entry.subcategory) {
                        onSelectSubcategory(entry.subcategory);
                      }
                    }}
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke="var(--surface-1)"
                        strokeWidth={2}
                        opacity={
                          selectedSubcategory
                            ? selectedSubcategory === entry.subcategory
                              ? 1
                              : 0.35
                            : 1
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0]?.payload;
                        const percent = total > 0 ? ((data.value / total) * 100).toFixed(1) : 0;
                        return (
                          <div
                            className="rounded-lg border border-border/80 p-2 shadow-md text-xs backdrop-blur-md"
                            style={{ background: "var(--surface-2)" }}
                          >
                            <div className="font-semibold text-foreground flex items-center gap-1.5">
                              <span
                                className="h-2 w-2 rounded-full"
                                style={{ backgroundColor: data.color }}
                              />
                              {data.label}
                            </div>
                            <div className="text-muted-foreground mt-0.5">
                              {formatCurrency(data.value)} ({percent}%)
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => (
                      <span className="text-xs text-foreground/80">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              Total: <strong className="text-foreground">{formatCurrency(total)}</strong>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
