import type { PeriodMetrics } from "@mc-tracker/shared-types";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VarianceBadge } from "@/components/dashboard/variance-badge";
import { ArrowUpRight, ArrowDownRight, ArrowRight, PiggyBank, Receipt, Scale, Target } from "lucide-react";

function ChangeBadge({ value, invert = false }: { value: number | null; invert?: boolean }) {
  if (value === null) {
    return <span className="text-xs text-muted-foreground">No prior data</span>;
  }
  
  const isPositive = value > 0;
  const isGood = invert ? !isPositive : isPositive;

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ${
        isGood
          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
      }`}
    >
      {value > 0 ? (
        <ArrowUpRight className="h-3 w-3" />
      ) : value < 0 ? (
        <ArrowDownRight className="h-3 w-3" />
      ) : (
        <ArrowRight className="h-3 w-3" />
      )}
      <span>{formatPercent(value)}</span>
    </div>
  );
}

export function SummaryCards({ metrics }: { metrics: PeriodMetrics }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Total Income */}
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Income</CardTitle>
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-500">
            <PiggyBank className="h-4 w-4" />
          </span>
        </CardHeader>
        <CardContent className="space-y-1">
          <p className="text-2xl font-bold tracking-tight tabular-nums text-foreground">
            {formatCurrency(metrics.totalIncome)}
          </p>
          <div className="flex items-center gap-2 pt-1">
            <ChangeBadge value={metrics.percentChangeIncome} />
            <span className="text-xs text-muted-foreground">vs prev period</span>
          </div>
        </CardContent>
      </Card>

      {/* Total Costs */}
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Costs</CardTitle>
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-500">
            <Receipt className="h-4 w-4" />
          </span>
        </CardHeader>
        <CardContent className="space-y-1">
          <p className="text-2xl font-bold tracking-tight tabular-nums text-foreground">
            {formatCurrency(metrics.totalCosts)}
          </p>
          <div className="flex items-center gap-2 pt-1">
            <ChangeBadge value={metrics.percentChangeCosts} invert />
            <span className="text-xs text-muted-foreground">vs prev period</span>
          </div>
        </CardContent>
      </Card>

      {/* Net Profit / Loss */}
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Net Profit / Loss</CardTitle>
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-500">
            <Scale className="h-4 w-4" />
          </span>
        </CardHeader>
        <CardContent className="space-y-1">
          <p
            className={`text-2xl font-bold tracking-tight tabular-nums ${
              metrics.netProfitLoss >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
            }`}
          >
            {formatCurrency(metrics.netProfitLoss)}
          </p>
          <div className="flex items-center gap-2 pt-1">
            <ChangeBadge value={metrics.percentChangeNet} />
            <span className="text-xs text-muted-foreground">vs prev period</span>
          </div>
        </CardContent>
      </Card>

      {/* Budget Variance */}
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Budget Variance</CardTitle>
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-500">
            <Target className="h-4 w-4" />
          </span>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 pt-1">
          <VarianceBadge label="Cost budget" value={metrics.costVariance} />
          <VarianceBadge label="Savings goal" value={metrics.savingsVariance} />
        </CardContent>
      </Card>
    </div>
  );
}

