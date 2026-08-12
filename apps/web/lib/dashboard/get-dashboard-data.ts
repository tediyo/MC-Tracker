import { subDays, subWeeks, subMonths, subYears, startOfYear, endOfDay } from "date-fns";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  calculatePeriodMetrics,
  buildTrendSeries,
  groupCostsByCategory,
  filterCostsInRange,
  type TimeFrame,
  type PeriodMetrics,
  type TrendPoint,
  type Database,
  type CostRow,
  type CostCategory,
} from "@mc-tracker/shared-types";
import { fetchIncomesInRange } from "@/lib/data/incomes";
import { fetchCostsInRange } from "@/lib/data/costs";
import { fetchAllPlans } from "@/lib/data/plans";

export interface DashboardData {
  metrics: PeriodMetrics;
  trend: TrendPoint[];
  costsByCategory: Record<CostCategory, number>;
  /** Cost rows within the current (to-date) period - used by the subcategory drill-down pie on category click. */
  currentPeriodCosts: CostRow[];
}

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * How far back to fetch, wide enough to cover both the metrics'
 * previous-period comparison AND the trend chart's bucket window for each
 * timeframe. A documented simplification: this always fetches full rows
 * for the window rather than a narrower per-widget range, which is
 * generously wasteful for daily/weekly views but simple and correct - fine
 * at personal-tracker data volumes.
 */
function fetchWindowStart(timeframe: TimeFrame, referenceDate: Date): Date {
  switch (timeframe) {
    case "daily":
      return subDays(referenceDate, 31);
    case "weekly":
      return subWeeks(referenceDate, 9);
    case "monthly":
      return subMonths(startOfYear(referenceDate), 1);
    case "yearly":
      return subYears(referenceDate, 6);
  }
}

/**
 * Orchestrator: fetches raw rows for a window wide enough to cover the
 * current/previous period comparison and the trend chart, then hands them
 * to the pure `@mc-tracker/shared-types` calculation functions. Written
 * against the generic `SupabaseClient` type so it works identically
 * whether called with the server client (first paint) or the browser
 * client (subsequent timeframe switches) - this is what keeps all the
 * metrics math in exactly one place regardless of which client fetched
 * the rows.
 */
export async function getDashboardData(
  supabase: SupabaseClient<Database, any, any>,
  userId: string,
  timeframe: TimeFrame,
  referenceDate: Date,
): Promise<DashboardData> {
  const start = toIsoDate(fetchWindowStart(timeframe, referenceDate));
  const end = toIsoDate(endOfDay(referenceDate));

  const [incomes, costs, plans] = await Promise.all([
    fetchIncomesInRange(supabase, userId, start, end),
    fetchCostsInRange(supabase, userId, start, end),
    fetchAllPlans(supabase, userId),
  ]);

  const metrics = calculatePeriodMetrics(incomes, costs, plans, timeframe, referenceDate);
  const trend = buildTrendSeries(incomes, costs, plans, timeframe, referenceDate);
  // Reuses the same pure filter shared-types' own metrics/aggregate
  // functions are built on (parseISO-based, so a date-only string is read
  // as local midnight consistently - not the native `new Date(dateOnly)`,
  // which parses as UTC and can misattribute a row's date near a server
  // timezone's midnight boundary).
  const currentRange = { start: metrics.range.start, end: referenceDate };
  const costsByCategory = groupCostsByCategory(costs, currentRange);
  const currentPeriodCosts = filterCostsInRange(costs, currentRange);

  return { metrics, trend, costsByCategory, currentPeriodCosts };
}
