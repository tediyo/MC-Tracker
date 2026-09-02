import Link from "next/link";
import { Plus, Edit2, ShieldAlert, Target } from "lucide-react";
import { type PlanRow, ETHIOPIAN_MONTHS, getEthiopianDate } from "@mc-tracker/shared-types";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function PlanMonthCard({ month, year, plan }: { month: number; year: number; plan?: PlanRow }) {
  const currentEth = getEthiopianDate(new Date());
  const isCurrentMonth = currentEth.year === year && currentEth.month === month;
  const monthInfo = ETHIOPIAN_MONTHS[month - 1];

  return (
    <Card className={`relative flex flex-col justify-between border ${
      isCurrentMonth ? "border-primary/60 bg-accent/20" : "border-border"
    }`}>
      {isCurrentMonth && (
        <span className="absolute top-3 right-3 rounded bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary uppercase tracking-wider">
          Current Month
        </span>
      )}

      <div>
        <CardHeader className="pb-3">
          <CardTitle className="text-foreground flex items-center justify-between font-semibold text-base tracking-tight">
            <span>{monthInfo ? monthInfo.label : `Month ${month}`}</span>
          </CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col gap-3">
          {plan ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-md bg-muted/40 p-2 text-xs">
                <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                  <ShieldAlert className="h-3.5 w-3.5 text-primary" /> Cost Limit
                </span>
                <span className="font-semibold text-foreground tabular-nums">
                  {formatCurrency(Number(plan.target_cost_limit))}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-md bg-muted/40 p-2 text-xs">
                <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                  <Target className="h-3.5 w-3.5 text-primary" /> Savings Goal
                </span>
                <span className="font-semibold text-foreground tabular-nums">
                  {formatCurrency(Number(plan.target_savings_goal))}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-4 text-center rounded-md bg-muted/20 border border-dashed border-border">
              <span className="text-xs text-muted-foreground font-medium">No budget plan set</span>
            </div>
          )}
        </CardContent>
      </div>

      <div className="p-4 pt-0 mt-2 flex justify-center">
        {plan ? (
          <Button asChild variant="outline" size="sm" className="h-9 px-6 rounded-xl gap-2 text-xs font-semibold shadow-sm border-border/80 hover:bg-accent">
            <Link href={`/plans/${plan.id}/edit`} prefetch={true}>
              <Edit2 className="h-3.5 w-3.5 text-primary" />
              Edit Budget Plan
            </Link>
          </Button>
        ) : (
          <Button asChild variant="default" size="sm" className="h-9 px-6 rounded-xl gap-2 text-xs font-semibold shadow-sm bg-primary hover:bg-primary/90 text-primary-foreground">
            <Link href={`/plans/new?month=${month}&year=${year}`} prefetch={true}>
              <Plus className="h-3.5 w-3.5 text-white" />
              Create Plan
            </Link>
          </Button>
        )}
      </div>
    </Card>
  );
}

