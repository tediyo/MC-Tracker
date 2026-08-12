import Link from "next/link";
import { Plus, Edit2, CheckCircle2, CircleDashed, ShieldAlert, Target } from "lucide-react";
import type { PlanRow } from "@mc-tracker/shared-types";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function PlanMonthCard({ month, year, plan }: { month: number; year: number; plan?: PlanRow }) {
  const isCurrentMonth = new Date().getFullYear() === year && new Date().getMonth() + 1 === month;

  return (
    <Card className={`relative flex flex-col justify-between transition-all duration-200 ${
      isCurrentMonth ? "border-primary/50 shadow-md ring-1 ring-primary/20" : "border-border/60 hover:border-border"
    }`}>
      {isCurrentMonth && (
        <span className="absolute top-3 right-3 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary uppercase tracking-wide">
          Current Month
        </span>
      )}

      <div>
        <CardHeader className="pb-3">
          <CardTitle className="text-foreground flex items-center justify-between font-bold text-base tracking-tight">
            <span>{MONTH_NAMES[month - 1]}</span>
          </CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          {plan ? (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between rounded-lg bg-accent/40 p-2.5 border border-border/40 text-xs">
                <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                  <ShieldAlert className="h-3.5 w-3.5 text-amber-500" /> Cost Limit
                </span>
                <span className="font-bold text-foreground tabular-nums">
                  {formatCurrency(Number(plan.target_cost_limit))}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-accent/40 p-2.5 border border-border/40 text-xs">
                <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                  <Target className="h-3.5 w-3.5 text-emerald-500" /> Savings Goal
                </span>
                <span className="font-bold text-foreground tabular-nums">
                  {formatCurrency(Number(plan.target_savings_goal))}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-4 text-center rounded-xl bg-accent/20 border border-dashed border-border/60">
              <CircleDashed className="h-6 w-6 text-muted-foreground/60 mb-1" />
              <span className="text-xs text-muted-foreground font-medium">No budget plan set</span>
            </div>
          )}
        </CardContent>
      </div>

      <div className="p-5 pt-0 mt-3">
        {plan ? (
          <Button asChild variant="outline" size="sm" className="w-full gap-2 rounded-xl text-xs font-semibold">
            <Link href={`/plans/${plan.id}/edit`}>
              <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
              Edit Budget Plan
            </Link>
          </Button>
        ) : (
          <Button asChild variant="default" size="sm" className="w-full gap-2 rounded-xl text-xs font-semibold">
            <Link href={`/plans/new?month=${month}&year=${year}`}>
              <Plus className="h-3.5 w-3.5" />
              Create Plan
            </Link>
          </Button>
        )}
      </div>
    </Card>
  );
}
