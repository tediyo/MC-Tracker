"use client";

import * as React from "react";
import { addDays, subDays, addWeeks, subWeeks, addMonths, subMonths, addYears, subYears } from "date-fns";
import type { TimeFrame, CostCategory } from "@mc-tracker/shared-types";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import type { DashboardData } from "@/lib/dashboard/get-dashboard-data";
import { TimeframeSwitcher } from "@/components/dashboard/timeframe-switcher";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { CostCategoryPieChart } from "@/components/dashboard/cost-category-pie-chart";
import { CostSubcategoryPieChart } from "@/components/dashboard/cost-subcategory-pie-chart";
import { IncomeExpenseTrendChart } from "@/components/dashboard/income-expense-trend-chart";
import { MonthComparisonSection } from "@/components/dashboard/month-comparison-section";
import { cn } from "@/lib/utils";

function stepDate(timeframe: TimeFrame, date: Date, direction: 1 | -1): Date {
  switch (timeframe) {
    case "daily":
      return direction === 1 ? addDays(date, 1) : subDays(date, 1);
    case "weekly":
      return direction === 1 ? addWeeks(date, 1) : subWeeks(date, 1);
    case "monthly":
      return direction === 1 ? addMonths(date, 1) : subMonths(date, 1);
    case "yearly":
      return direction === 1 ? addYears(date, 1) : subYears(date, 1);
  }
}

interface DashboardClientProps {
  userId: string;
  initialTimeframe: TimeFrame;
  initialReferenceDate: Date;
  initialData: DashboardData;
}

/**
 * The client island: owns timeframe/reference-date state and TanStack
 * Query, ties the summary cards + both pie charts + the trend chart +
 * month comparison section together. Server-rendered `initialData` seeds
 * the query cache for the default (timeframe, referenceDate) pair so
 * there's no refetch flash on first paint.
 */
export function DashboardClient({ userId, initialTimeframe, initialReferenceDate, initialData }: DashboardClientProps) {
  const [timeframe, setTimeframe] = React.useState<TimeFrame>(initialTimeframe);
  const [referenceDate, setReferenceDate] = React.useState<Date>(initialReferenceDate);
  const [selectedCategory, setSelectedCategory] = React.useState<CostCategory | null>(null);

  const isDefaultKey =
    timeframe === initialTimeframe && referenceDate.getTime() === initialReferenceDate.getTime();
  const { data, isFetching } = useDashboardData(
    userId,
    timeframe,
    referenceDate,
    isDefaultKey ? initialData : undefined,
  );

  function handleTimeframeChange(next: TimeFrame) {
    setTimeframe(next);
    setSelectedCategory(null);
  }

  if (!data) {
    return <p className="text-sm text-muted-foreground">Loading dashboard…</p>;
  }

  return (
    <div className={cn("viz-root flex flex-col gap-6 transition-opacity", isFetching && "opacity-70")}>
      <TimeframeSwitcher
        timeframe={timeframe}
        onTimeframeChange={handleTimeframeChange}
        periodLabel={data.metrics.range.label}
        onPrevious={() => setReferenceDate((d) => stepDate(timeframe, d, -1))}
        onNext={() => setReferenceDate((d) => stepDate(timeframe, d, 1))}
      />
      <SummaryCards metrics={data.metrics} />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <CostCategoryPieChart
          data={data.costsByCategory}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
        <CostSubcategoryPieChart
          category={selectedCategory}
          costs={data.currentPeriodCosts}
          range={{ start: data.metrics.range.start, end: referenceDate }}
        />
      </div>
      <IncomeExpenseTrendChart data={data.trend} />
      <MonthComparisonSection userId={userId} />
    </div>
  );
}
