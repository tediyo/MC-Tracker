"use client";

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { CostCategory, CostRow } from "@mc-tracker/shared-types";
import {
  COST_CATEGORY_LABELS,
  COST_SUBCATEGORY_LABELS,
  groupCostsBySubcategory,
  filterCostsInRange,
} from "@mc-tracker/shared-types";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const CATEGORY_SERIES_VAR: Record<CostCategory, string> = {
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
];

function stepColor(seriesVar: string, mixPercent: number): string {
  return `color-mix(in srgb, var(${seriesVar}) ${mixPercent}%, var(--surface-1))`;
}

interface CostSubcategoryPieChartProps {
  category: CostCategory | null;
  costs: CostRow[];
  range: { start: Date; end: Date };
}

export function CostSubcategoryPieChart({ category, costs, range }: CostSubcategoryPieChartProps) {
  let subcategoryMap: Record<string, number> = {};
  let titleText = "Subcategory Breakdown";
  let isAll = !category;

  if (category) {
    subcategoryMap = groupCostsBySubcategory(costs, range, category);
    titleText = `${COST_CATEGORY_LABELS[category]} Breakdown`;
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
    if (category) {
      const seriesVar = CATEGORY_SERIES_VAR[category];
      const mixPercent = subcategoriesToRender.length <= 1
        ? 100
        : 100 - (index * 65) / (subcategoriesToRender.length - 1);
      color = stepColor(seriesVar, mixPercent);
    }

    return {
      subcategory: sub,
      label: COST_SUBCATEGORY_LABELS[sub as keyof typeof COST_SUBCATEGORY_LABELS] ?? sub,
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
              Click a Category on left to filter
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <div className="flex h-[240px] items-center justify-center text-xs text-muted-foreground font-medium">
            No expense entries logged for this period
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart margin={{ top: 20, right: 25, left: 25, bottom: 10 }}>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="label"
                cx="50%"
                cy="42%"
                outerRadius={72}
                innerRadius={30}
                paddingAngle={3}
                labelLine={true}
                label={({ label, value }) => `${label}: ${formatCurrency(value)}`}
              >
                {chartData.map((entry) => (
                  <Cell key={entry.subcategory} fill={entry.color} stroke="var(--surface-1)" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend verticalAlign="bottom" wrapperStyle={{ paddingTop: 10 }} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
