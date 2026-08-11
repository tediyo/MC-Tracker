"use client";

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { CostCategory, CostRow } from "@mc-tracker/shared-types";
import { COST_CATEGORY_LABELS, COST_SUBCATEGORY_LABELS, groupCostsBySubcategory } from "@mc-tracker/shared-types";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const CATEGORY_SERIES_VAR: Record<CostCategory, string> = {
  basic: "--series-1",
  fancy: "--series-2",
  extra: "--series-3",
};

/**
 * Steps toward the chart surface via `color-mix`, from the selected
 * category's own hue down to a lighter/darker tint of it (lighter in light
 * mode, darker in dark mode, since it's mixed against `--surface-1` which
 * flips with the theme) - a single-hue "sequential-style" ramp tied to
 * whichever categorical slot was clicked.
 *
 * This is a pragmatic approximation of the dataviz skill's validated
 * sequential ramp (which only ships precomputed steps for the blue hue) -
 * for the orange/aqua parents there is no precomputed validated ramp, so
 * this generates steps procedurally instead. Because adjacent steps here
 * are not individually contrast-validated, every slice is mandatorily
 * direct-labeled (name + amount) so identity never depends on
 * distinguishing the color steps alone.
 */
function stepColor(seriesVar: string, mixPercent: number): string {
  return `color-mix(in srgb, var(${seriesVar}) ${mixPercent}%, var(--surface-1))`;
}

interface CostSubcategoryPieChartProps {
  category: CostCategory | null;
  costs: CostRow[];
  range: { start: Date; end: Date };
}

export function CostSubcategoryPieChart({ category, costs, range }: CostSubcategoryPieChartProps) {
  if (!category) {
    return (
      <Card className="viz-root" style={{ background: "var(--surface-1)" }}>
        <CardHeader>
          <CardTitle style={{ color: "var(--text-secondary)" }}>Subcategory Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Select a category above to see its breakdown.
          </p>
        </CardContent>
      </Card>
    );
  }

  const totals = groupCostsBySubcategory(costs, range, category);
  const subcategories = Object.keys(totals);
  const seriesVar = CATEGORY_SERIES_VAR[category];
  const chartData = subcategories.map((sub, index) => {
    // Evenly spaced mix percentages from 100% down to a 35% floor.
    const mixPercent = subcategories.length <= 1 ? 100 : 100 - (index * 65) / (subcategories.length - 1);
    return {
      subcategory: sub,
      label: COST_SUBCATEGORY_LABELS[sub as keyof typeof COST_SUBCATEGORY_LABELS] ?? sub,
      value: totals[sub],
      color: stepColor(seriesVar, mixPercent),
    };
  });
  const total = chartData.reduce((sum, d) => sum + d.value, 0);

  return (
    <Card className="viz-root" style={{ background: "var(--surface-1)" }}>
      <CardHeader>
        <CardTitle style={{ color: "var(--text-secondary)" }}>
          {COST_CATEGORY_LABELS[category]} Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            No {COST_CATEGORY_LABELS[category].toLowerCase()} costs logged for this period yet.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="label"
                outerRadius={100}
                paddingAngle={2}
                label={({ label, value }) => `${label}: ${formatCurrency(value)}`}
              >
                {chartData.map((entry) => (
                  <Cell key={entry.subcategory} fill={entry.color} stroke="var(--surface-1)" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
