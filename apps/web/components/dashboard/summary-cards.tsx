import type { PeriodMetrics } from "@mc-tracker/shared-types";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VarianceBadge } from "@/components/dashboard/variance-badge";

function ChangeLabel({ value }: { value: number | null }) {
  return <p className="text-xs text-muted-foreground">{formatPercent(value)} vs previous period</p>;
}

export function SummaryCards({ metrics }: { metrics: PeriodMetrics }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Total Income</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold tabular-nums">{formatCurrency(metrics.totalIncome)}</p>
          <ChangeLabel value={metrics.percentChangeIncome} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Total Costs</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold tabular-nums">{formatCurrency(metrics.totalCosts)}</p>
          <ChangeLabel value={metrics.percentChangeCosts} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Net Profit / Loss</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold tabular-nums">{formatCurrency(metrics.netProfitLoss)}</p>
          <ChangeLabel value={metrics.percentChangeNet} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Target vs Actual</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-1.5">
          <VarianceBadge label="Cost budget" value={metrics.costVariance} />
          <VarianceBadge label="Savings goal" value={metrics.savingsVariance} />
        </CardContent>
      </Card>
    </div>
  );
}
