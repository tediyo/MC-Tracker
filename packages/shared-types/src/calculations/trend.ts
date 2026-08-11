import {
  startOfDay,
  endOfDay,
  subDays,
  startOfWeek,
  endOfWeek,
  subWeeks,
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfYear,
  endOfYear,
  subYears,
  format,
} from "date-fns";
import type { TimeFrame } from "./period";
import { WEEK_STARTS_ON } from "./period";
import { sumIncome, sumCosts, type DateRange } from "./aggregate";
import type { IncomeRow, CostRow, PlanRow } from "../db";

export interface TrendPoint {
  bucketLabel: string;
  bucketStart: Date;
  bucketEnd: Date;
  income: number;
  cost: number;
  /** Running total of `cost` across the buckets returned in this call (not reset at month/year boundaries — see module doc). */
  cumulativeCost: number;
  /** The owning month's plan target_cost_limit, unprorated, or `null` if no plan covers that bucket's month. */
  targetCostLimit: number | null;
}

/** Matches the plan's documented defaults: daily→30d, weekly→8wk, monthly→12mo (of the selected year), yearly→5yr. */
export const DEFAULT_BUCKET_COUNT: Record<TimeFrame, number> = {
  daily: 30,
  weekly: 8,
  monthly: 12,
  yearly: 5,
};

function bucketBounds(timeframe: TimeFrame, date: Date): DateRange {
  switch (timeframe) {
    case "daily":
      return { start: startOfDay(date), end: endOfDay(date) };
    case "weekly":
      return {
        start: startOfWeek(date, { weekStartsOn: WEEK_STARTS_ON }),
        end: endOfWeek(date, { weekStartsOn: WEEK_STARTS_ON }),
      };
    case "monthly":
      return { start: startOfMonth(date), end: endOfMonth(date) };
    case "yearly":
      return { start: startOfYear(date), end: endOfYear(date) };
  }
}

function stepBack(timeframe: TimeFrame, date: Date, n: number): Date {
  switch (timeframe) {
    case "daily":
      return subDays(date, n);
    case "weekly":
      return subWeeks(date, n);
    case "monthly":
      return subMonths(date, n);
    case "yearly":
      return subYears(date, n);
  }
}

function labelFor(timeframe: TimeFrame, start: Date): string {
  switch (timeframe) {
    case "daily":
      return format(start, "MMM d");
    case "weekly":
      return `Wk of ${format(start, "MMM d")}`;
    case "monthly":
      return format(start, "MMM");
    case "yearly":
      return format(start, "yyyy");
  }
}

/**
 * Builds the bucketed series behind the income/expense trend chart.
 *
 * Simplifications, documented rather than hidden:
 *  - `cumulativeCost` runs across the whole returned window (e.g. the
 *    trailing 30 days for "daily"), not reset at calendar-month boundaries,
 *    even though those 30 days may span two months.
 *  - `targetCostLimit` per bucket is that bucket's owning month's plan
 *    value, unprorated — for daily/weekly buckets this renders as a flat
 *    step per month, not a smoothly pro-rated per-day amount (that
 *    proration is only applied in `metrics.ts`'s summary-card numbers).
 *  - For "monthly", the window is always Jan–Dec of `referenceDate`'s
 *    calendar year (matching "12 months of the selected year" in the plan),
 *    and `bucketCount` is ignored. Every other timeframe uses a trailing
 *    window of `bucketCount` buckets ending at `referenceDate`.
 */
export function buildTrendSeries(
  incomes: readonly IncomeRow[],
  costs: readonly CostRow[],
  plans: readonly PlanRow[],
  timeframe: TimeFrame,
  referenceDate: Date,
  bucketCount: number = DEFAULT_BUCKET_COUNT[timeframe],
): TrendPoint[] {
  const anchors: Date[] =
    timeframe === "monthly"
      ? Array.from({ length: 12 }, (_, i) => new Date(referenceDate.getFullYear(), i, 1))
      : Array.from({ length: bucketCount }, (_, i) => stepBack(timeframe, referenceDate, bucketCount - 1 - i));

  const planForMonth = (start: Date): PlanRow | undefined =>
    plans.find((p) => p.year === start.getFullYear() && p.month === start.getMonth() + 1);

  let cumulativeCost = 0;
  return anchors.map((anchorDate) => {
    const bounds = bucketBounds(timeframe, anchorDate);
    const income = sumIncome(incomes, bounds);
    const cost = sumCosts(costs, bounds);
    cumulativeCost += cost;
    const plan = planForMonth(bounds.start);
    return {
      bucketLabel: labelFor(timeframe, bounds.start),
      bucketStart: bounds.start,
      bucketEnd: bounds.end,
      income,
      cost,
      cumulativeCost,
      targetCostLimit: plan ? Number(plan.target_cost_limit) : null,
    };
  });
}
