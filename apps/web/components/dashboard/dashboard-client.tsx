"use client";

import * as React from "react";
import { addDays, subDays, addWeeks, subWeeks, addMonths, subMonths, addYears, subYears } from "date-fns";
import type {
  TimeFrame,
  CostCategory,
  CostSubcategory,
} from "@mc-tracker/shared-types";
import {
  getEthiopianDate,
  toGregorianDate,
  getDaysInEthiopianMonth,
  COST_CATEGORY_LABELS,
  COST_SUBCATEGORY_LABELS,
  CATEGORY_SUBCATEGORY_MAP,
} from "@mc-tracker/shared-types";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import type { DashboardData } from "@/lib/dashboard/get-dashboard-data";
import { TimeframeSwitcher } from "@/components/dashboard/timeframe-switcher";
import { useCalendarPreference, type CalendarMode } from "@/components/providers/calendar-provider";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { CostCategoryPieChart } from "@/components/dashboard/cost-category-pie-chart";
import { CostSubcategoryPieChart } from "@/components/dashboard/cost-subcategory-pie-chart";
import { IncomeExpenseTrendChart } from "@/components/dashboard/income-expense-trend-chart";
import { MonthComparisonSection } from "@/components/dashboard/month-comparison-section";
import { PdfReportButton } from "@/components/dashboard/pdf-report-button";
import { RecentTransactionsWidget } from "@/components/dashboard/recent-transactions-widget";
import { DashboardFilterBar } from "@/components/dashboard/dashboard-filter-bar";
import { WebDashboardSkeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

function stepCalendarDate(
  timeframe: TimeFrame,
  date: Date,
  direction: 1 | -1,
  mode: CalendarMode,
): Date {
  if (mode === "gregorian") {
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

  // Ethiopian Calendar Stepping
  const eth = getEthiopianDate(date);
  if (timeframe === "monthly") {
    let nextYear = eth.year;
    let nextMonth = eth.month + direction;
    if (nextMonth < 1) {
      nextMonth = 13;
      nextYear -= 1;
    } else if (nextMonth > 13) {
      nextMonth = 1;
      nextYear += 1;
    }
    return toGregorianDate(nextYear, nextMonth, 1);
  }

  if (timeframe === "yearly") {
    return toGregorianDate(eth.year + direction, 1, 1);
  }

  if (timeframe === "daily") {
    const daysInMonth = getDaysInEthiopianMonth(eth.year, eth.month);
    let nextYear = eth.year;
    let nextMonth = eth.month;
    let nextDay = eth.day + direction;

    if (nextDay < 1) {
      nextMonth -= 1;
      if (nextMonth < 1) {
        nextMonth = 13;
        nextYear -= 1;
      }
      nextDay = getDaysInEthiopianMonth(nextYear, nextMonth);
    } else if (nextDay > daysInMonth) {
      nextMonth += 1;
      if (nextMonth > 13) {
        nextMonth = 1;
        nextYear += 1;
      }
      nextDay = 1;
    }
    return toGregorianDate(nextYear, nextMonth, nextDay);
  }

  // weekly
  return direction === 1 ? addWeeks(date, 1) : subWeeks(date, 1);
}

interface DashboardClientProps {
  userId: string;
  initialTimeframe: TimeFrame;
  initialReferenceDate: Date;
  initialData: DashboardData;
}

export function DashboardClient({
  userId,
  initialTimeframe,
  initialReferenceDate,
  initialData,
}: DashboardClientProps) {
  const initialRefDate = React.useMemo(() => new Date(initialReferenceDate), [initialReferenceDate]);
  const [timeframe, setTimeframe] = React.useState<TimeFrame>(initialTimeframe);
  const [referenceDate, setReferenceDate] = React.useState<Date>(initialRefDate);
  const [selectedCategory, setSelectedCategory] = React.useState<CostCategory | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = React.useState<CostSubcategory | null>(null);
  const [showBalances, setShowBalances] = React.useState<boolean>(true);
  const { calendarMode, setCalendarMode } = useCalendarPreference();

  const isDefaultKey =
    timeframe === initialTimeframe &&
    referenceDate.toISOString().slice(0, 10) === initialRefDate.toISOString().slice(0, 10);
  const { data, isFetching } = useDashboardData(
    userId,
    timeframe,
    referenceDate,
    isDefaultKey ? initialData : undefined,
  );

  function handleTimeframeChange(next: TimeFrame) {
    setTimeframe(next);
    setSelectedCategory(null);
    setSelectedSubcategory(null);
  }

  const handleCategorySelect = (cat: CostCategory | null) => {
    setSelectedCategory(cat);
    if (!cat) {
      setSelectedSubcategory(null);
    } else if (
      selectedSubcategory &&
      !CATEGORY_SUBCATEGORY_MAP[cat].includes(selectedSubcategory)
    ) {
      setSelectedSubcategory(null);
    }
  };

  const handleSubcategorySelect = (sub: CostSubcategory | null) => {
    setSelectedSubcategory(sub);
    if (sub && !selectedCategory) {
      for (const [cat, subs] of Object.entries(CATEGORY_SUBCATEGORY_MAP)) {
        if (subs.includes(sub)) {
          setSelectedCategory(cat as CostCategory);
          break;
        }
      }
    }
  };

  const filteredCosts = React.useMemo(() => {
    if (!data?.currentPeriodCosts) return [];
    return data.currentPeriodCosts.filter((c) => {
      if (selectedCategory && c.category !== selectedCategory) return false;
      if (selectedSubcategory && c.subcategory !== selectedSubcategory) return false;
      return true;
    });
  }, [data?.currentPeriodCosts, selectedCategory, selectedSubcategory]);

  const effectiveMetrics = React.useMemo(() => {
    if (!data?.metrics) return null;
    if (!selectedCategory && !selectedSubcategory) return data.metrics;

    const filteredTotalCosts = filteredCosts.reduce((sum, c) => sum + Number(c.amount), 0);
    const filteredNetProfitLoss = data.metrics.totalIncome - filteredTotalCosts;
    const filteredCostVariance =
      data.metrics.targetCostLimit !== null
        ? data.metrics.targetCostLimit - filteredTotalCosts
        : null;
    const filteredSavingsVariance =
      data.metrics.targetSavingsGoal !== null
        ? filteredNetProfitLoss - data.metrics.targetSavingsGoal
        : null;

    return {
      ...data.metrics,
      totalCosts: filteredTotalCosts,
      netProfitLoss: filteredNetProfitLoss,
      costVariance: filteredCostVariance,
      savingsVariance: filteredSavingsVariance,
    };
  }, [data?.metrics, filteredCosts, selectedCategory, selectedSubcategory]);

  const filterLabel = React.useMemo(() => {
    if (selectedCategory && selectedSubcategory) {
      return `${COST_CATEGORY_LABELS[selectedCategory]} › ${COST_SUBCATEGORY_LABELS[selectedSubcategory] ?? selectedSubcategory}`;
    }
    if (selectedCategory) {
      return COST_CATEGORY_LABELS[selectedCategory];
    }
    if (selectedSubcategory) {
      return COST_SUBCATEGORY_LABELS[selectedSubcategory] ?? selectedSubcategory;
    }
    return null;
  }, [selectedCategory, selectedSubcategory]);

  const reportData = React.useMemo(() => {
    if (!data) return null;
    if (!selectedCategory && !selectedSubcategory) return data;
    return {
      ...data,
      metrics: effectiveMetrics || data.metrics,
      currentPeriodCosts: filteredCosts,
    };
  }, [data, effectiveMetrics, filteredCosts, selectedCategory, selectedSubcategory]);

  const showSkeleton = isFetching || !data;

  return (
    <div className="viz-root flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <TimeframeSwitcher
          timeframe={timeframe}
          onTimeframeChange={handleTimeframeChange}
          periodLabel={data?.metrics.range.label || "Loading..."}
          referenceDate={referenceDate}
          calendarMode={calendarMode}
          onPrevious={() => setReferenceDate((d) => stepCalendarDate(timeframe, d, -1, calendarMode))}
          onNext={() => setReferenceDate((d) => stepCalendarDate(timeframe, d, 1, calendarMode))}
        />
        {reportData ? (
          <PdfReportButton data={reportData} showBalances={showBalances} timeframe={timeframe} />
        ) : null}
      </div>

      <DashboardFilterBar
        selectedCategory={selectedCategory}
        selectedSubcategory={selectedSubcategory}
        onSelectCategory={handleCategorySelect}
        onSelectSubcategory={handleSubcategorySelect}
        filteredCount={filteredCosts.length}
        totalCount={data?.currentPeriodCosts?.length || 0}
      />

      {showSkeleton ? (
        <WebDashboardSkeleton />
      ) : (
        <>
          <SummaryCards
            metrics={effectiveMetrics || data.metrics}
            showBalances={showBalances}
            onToggleShowBalances={() => setShowBalances(!showBalances)}
            filterLabel={filterLabel}
          />

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <CostCategoryPieChart
              data={data.costsByCategory}
              selectedCategory={selectedCategory}
              onSelectCategory={(cat) => handleCategorySelect(selectedCategory === cat ? null : cat)}
            />
            <CostSubcategoryPieChart
              category={selectedCategory}
              costs={data.currentPeriodCosts}
              range={{ start: data.metrics.range.start, end: referenceDate }}
              selectedSubcategory={selectedSubcategory}
              onSelectSubcategory={(sub) =>
                handleSubcategorySelect(selectedSubcategory === sub ? null : sub)
              }
            />
          </div>

          <IncomeExpenseTrendChart data={data.trend} />
          <MonthComparisonSection userId={userId} />

          <RecentTransactionsWidget
            costs={filteredCosts}
            incomes={data.currentPeriodIncomes || []}
            showBalances={showBalances}
          />
        </>
      )}
    </div>
  );
}
