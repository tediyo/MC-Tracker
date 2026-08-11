import Link from "next/link";
import type { PlanRow } from "@mc-tracker/shared-types";
import { PlanMonthCard } from "@/components/plans/plan-month-card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Duplicate-prevention layer 1: visually shows which months already have a
 * plan (Edit) vs which don't (Create), so normal navigation can't even
 * attempt creating a second plan for the same month/year.
 */
export function PlanYearGrid({ year, plans }: { year: number; plans: PlanRow[] }) {
  const planByMonth = new Map(plans.map((p) => [p.month, p]));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-center gap-4">
        <Button asChild variant="outline" size="icon">
          <Link href={`/plans?year=${year - 1}`} aria-label="Previous year">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <span className="text-lg font-semibold">{year}</span>
        <Button asChild variant="outline" size="icon">
          <Link href={`/plans?year=${year + 1}`} aria-label="Next year">
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
          <PlanMonthCard key={month} month={month} year={year} plan={planByMonth.get(month)} />
        ))}
      </div>
    </div>
  );
}
