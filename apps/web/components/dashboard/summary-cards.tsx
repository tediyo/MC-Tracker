import type { PeriodMetrics } from "@mc-tracker/shared-types";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VarianceBadge } from "@/components/dashboard/variance-badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowDownRight, ArrowRight, TrendingUp, Receipt, Scale, Target, Eye, EyeOff } from "lucide-react";

function ChangeBadge({ value, invert = false }: { value: number | null; invert?: boolean }) {
  if (value === null) {
    return <span className="text-xs text-muted-foreground/50">—</span>;
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

interface SummaryCardsProps {
  metrics: PeriodMetrics;
  showBalances?: boolean;
  onToggleShowBalances?: () => void;
}

export function SummaryCards({ metrics, showBalances = true, onToggleShowBalances }: SummaryCardsProps) {
  const displayVal = (val: number) => (showBalances ? formatCurrency(val) : "••••••");

  return (
    <div className="flex flex-col gap-3">
      {onToggleShowBalances ? (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleShowBalances}
            className="h-8 rounded-xl gap-2 text-xs font-medium text-muted-foreground hover:text-foreground border-border/60"
          >
            {showBalances ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5 text-emerald-500" />}
            <span>{showBalances ? "Hide Balances" : "Show Balances"}</span>
          </Button>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Income */}
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Income</CardTitle>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <TrendingUp className="h-4 w-4" />
            </span>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="text-2xl font-bold tracking-tight tabular-nums text-foreground">
              {displayVal(metrics.totalIncome)}
            </p>
            <div className="pt-1">
              <ChangeBadge value={metrics.percentChangeIncome} />
            </div>
          </CardContent>
        </Card>

        {/* Total Costs */}
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Expenses</CardTitle>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Receipt className="h-4 w-4" />
            </span>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="text-2xl font-bold tracking-tight tabular-nums text-foreground">
              {displayVal(metrics.totalCosts)}
            </p>
            <div className="pt-1">
              <ChangeBadge value={metrics.percentChangeCosts} invert />
            </div>
          </CardContent>
        </Card>

        {/* Net Balance */}
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Net Balance</CardTitle>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Scale className="h-4 w-4" />
            </span>
          </CardHeader>
          <CardContent className="space-y-1">
            <p
              className={`text-2xl font-bold tracking-tight tabular-nums ${
                metrics.netProfitLoss >= 0 ? "text-primary" : "text-rose-600 dark:text-rose-400"
              }`}
            >
              {displayVal(metrics.netProfitLoss)}
            </p>
            <div className="pt-1">
              <ChangeBadge value={metrics.percentChangeNet} />
            </div>
          </CardContent>
        </Card>

        {/* Budget Variance */}
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Budget Variance</CardTitle>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
              <Target className="h-4 w-4" />
            </span>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 pt-1">
            <VarianceBadge label="Cost budget" value={metrics.costVariance} />
            <VarianceBadge label="Savings goal" value={metrics.savingsVariance} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
