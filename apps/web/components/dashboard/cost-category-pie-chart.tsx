"use client";

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { CostCategory } from "@mc-tracker/shared-types";
import { COST_CATEGORY_LABELS } from "@mc-tracker/shared-types";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Categorical slots 1-3 (blue/orange/aqua) - the dataviz skill's validated
// palette's first three slots are the ones that clear the all-pairs CVD
// floor in both light and dark mode, which is required for a pie chart
// (every slice sits beside every other slice at once).
const CATEGORY_COLORS: Record<CostCategory, string> = {
  basic: "var(--series-1)",
  fancy: "var(--series-2)",
  extra: "var(--series-3)",
};

interface CostCategoryPieChartProps {
  data: Record<CostCategory, number>;
  selectedCategory: CostCategory | null;
  onSelectCategory: (category: CostCategory) => void;
}

export function CostCategoryPieChart({ data, selectedCategory, onSelectCategory }: CostCategoryPieChartProps) {
  const chartData = (Object.keys(data) as CostCategory[]).map((category) => ({
    category,
    label: COST_CATEGORY_LABELS[category],
    value: data[category],
  }));
  const total = chartData.reduce((sum, d) => sum + d.value, 0);

  return (
    <Card className="viz-root" style={{ background: "var(--surface-1)" }}>
      <CardHeader>
        <CardTitle style={{ color: "var(--text-secondary)" }}>Cost by Category</CardTitle>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            No costs logged for this period yet.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="label"
                innerRadius={0}
                outerRadius={100}
                paddingAngle={2}
                label={({ label, value }) => `${label}: ${formatCurrency(value)}`}
                onClick={(entry) => onSelectCategory(entry.category as CostCategory)}
                cursor="pointer"
              >
                {chartData.map((entry) => (
                  <Cell
                    key={entry.category}
                    fill={CATEGORY_COLORS[entry.category]}
                    stroke="var(--surface-1)"
                    strokeWidth={2}
                    opacity={selectedCategory && selectedCategory !== entry.category ? 0.5 : 1}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
        <p className="mt-2 text-xs" style={{ color: "var(--text-muted)" }}>
          Click a slice to see its subcategory breakdown below.
        </p>
      </CardContent>
    </Card>
  );
}
