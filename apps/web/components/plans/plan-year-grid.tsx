import Link from "next/link";
import type { PlanRow } from "@mc-tracker/shared-types";
import { PlanMonthCard } from "@/components/plans/plan-month-card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

export function PlanYearGrid({ year, plans }: { year: number; plans: PlanRow[] }) {
  const planByMonth = new Map(plans.map((p) => [p.month, p]));
  const configuredCount = plans.length;

  return (
    <div className="flex flex-col gap-6">
      {/* Controls & Stat Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-card/60 p-4 rounded-2xl border border-border/50 shadow-sm">
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="icon" className="h-9 w-9 rounded-xl border-border/60">
            <Link href={`/plans?year=${year - 1}`} aria-label="Previous year">
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>

          <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-card px-4 py-1.5 font-bold text-lg text-foreground shadow-sm">
            <Calendar className="h-4 w-4 text-primary" />
            <span>{year}</span>
          </div>

          <Button asChild variant="outline" size="icon" className="h-9 w-9 rounded-xl border-border/60">
            <Link href={`/plans?year=${year + 1}`} aria-label="Next year">
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-primary">
            {configuredCount} of 12 months planned
          </span>
        </div>
      </div>

      {/* 12-Month Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
          <PlanMonthCard key={month} month={month} year={year} plan={planByMonth.get(month)} />
        ))}
      </div>
    </div>
  );
}
