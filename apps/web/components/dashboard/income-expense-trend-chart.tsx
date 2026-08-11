"use client";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TrendPoint } from "@mc-tracker/shared-types";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface IncomeExpenseTrendChartProps {
  data: TrendPoint[];
}

/**
 * Single Y-axis (everything is USD) - never dual-axis, per the dataviz
 * skill's #1 anti-pattern. Income and cost are real measured series (bars,
 * categorical slots 1/2); cumulative cost is cost's own hue one step
 * darker (still "cost", tracked differently, not a 4th independent
 * identity); the plan's target_cost_limit is rendered as a dashed
 * baseline-ink line rather than a categorical color, because it's a
 * threshold, not a measured quantity - it only reads as flat when every
 * visible bucket shares the same month's plan (e.g. a daily/weekly view
 * within one month); across a 12-month view it steps between different
 * months' targets instead of misrepresenting them as one number.
 */
export function IncomeExpenseTrendChart({ data }: IncomeExpenseTrendChartProps) {
  const hasTarget = data.some((d) => d.targetCostLimit !== null);

  return (
    <Card className="viz-root" style={{ background: "var(--surface-1)" }}>
      <CardHeader>
        <CardTitle style={{ color: "var(--text-secondary)" }}>Income vs Expense Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <ComposedChart data={data} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
            <CartesianGrid stroke="var(--gridline)" vertical={false} />
            <XAxis
              dataKey="bucketLabel"
              tick={{ fill: "var(--text-muted)", fontSize: 12 }}
              axisLine={{ stroke: "var(--baseline)" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "var(--text-muted)", fontSize: 12 }}
              axisLine={{ stroke: "var(--baseline)" }}
              tickLine={false}
              tickFormatter={(value: number) => formatCurrency(value)}
              width={80}
            />
            <Tooltip
              cursor={{ stroke: "var(--gridline)", strokeWidth: 1 }}
              formatter={(value: number) => formatCurrency(value)}
              contentStyle={{ background: "var(--surface-1)", borderColor: "var(--gridline)", color: "var(--text-primary)" }}
            />
            <Legend wrapperStyle={{ color: "var(--text-secondary)" }} />
            <Bar dataKey="income" name="Income" fill="var(--series-1)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="cost" name="Cost" fill="var(--series-2)" radius={[4, 4, 0, 0]} />
            <Line
              type="monotone"
              dataKey="cumulativeCost"
              name="Cumulative cost"
              stroke="color-mix(in srgb, var(--series-2) 100%, black 25%)"
              strokeWidth={2}
              dot={false}
            />
            {hasTarget ? (
              <Line
                type="stepAfter"
                dataKey="targetCostLimit"
                name="Target limit"
                stroke="var(--baseline)"
                strokeWidth={2}
                strokeDasharray="6 4"
                dot={false}
                connectNulls
              />
            ) : null}
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
