import { endOfDay } from "date-fns";
import {
  toGregorianDate,
  getDaysInEthiopianMonth,
  ETHIOPIAN_MONTHS,
  sumIncome,
  sumCosts,
  groupCostsByCategory,
  calculatePercentChange,
  type CostCategory,
} from "@mc-tracker/shared-types";
import { fetchIncomesInRange } from "@/lib/data/incomes";
import { fetchCostsInRange } from "@/lib/data/costs";
import { fetchAllPlans } from "@/lib/data/plans";

export type ComparisonMode = "monthly" | "weekly" | "yearly";

export interface ComparisonSummary {
  label: string;
  totalIncome: number;
  totalCosts: number;
  netProfitLoss: number;
  targetCostLimit: number | null;
  targetSavingsGoal: number | null;
  costsByCategory: Record<CostCategory, number>;
}

export interface ComparisonData {
  mode: ComparisonMode;
  summaryA: ComparisonSummary;
  summaryB: ComparisonSummary;
  delta: {
    income: number;
    incomePercent: number | null;
    costs: number;
    costsPercent: number | null;
    net: number;
    netPercent: number | null;
  };
}

export interface GetComparisonParams {
  mode: ComparisonMode;
  // Monthly
  yearA?: number;
  monthA?: number;
  yearB?: number;
  monthB?: number;
  // Yearly
  yearOnlyA?: number;
  yearOnlyB?: number;
  // Weekly
  weekYear?: number;
  weekMonth?: number;
  weekA?: number; // 1, 2, 3, 4
  weekB?: number; // 1, 2, 3, 4
}

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function getWeekDayBounds(weekNum: number, daysInMonth: number): { startDay: number; endDay: number } {
  switch (weekNum) {
    case 1:
      return { startDay: 1, endDay: Math.min(7, daysInMonth) };
    case 2:
      return { startDay: 8, endDay: Math.min(14, daysInMonth) };
    case 3:
      return { startDay: 15, endDay: Math.min(21, daysInMonth) };
    case 4:
    default:
      return { startDay: 22, endDay: daysInMonth };
  }
}

export async function getComparisonData(
  supabase: any,
  userId: string,
  params: GetComparisonParams,
): Promise<ComparisonData> {
  const mode = params.mode;

  let startA: Date;
  let endA: Date;
  let startB: Date;
  let endB: Date;
  let labelA: string;
  let labelB: string;

  let targetCostA: number | null = null;
  let targetSavingsA: number | null = null;
  let targetCostB: number | null = null;
  let targetSavingsB: number | null = null;

  const plans = await fetchAllPlans(supabase, userId);

  if (mode === "yearly") {
    const yA = params.yearOnlyA ?? 2017;
    const yB = params.yearOnlyB ?? 2018;

    startA = toGregorianDate(yA, 1, 1);
    endA = toGregorianDate(yA, 13, getDaysInEthiopianMonth(yA, 13));
    startB = toGregorianDate(yB, 1, 1);
    endB = toGregorianDate(yB, 13, getDaysInEthiopianMonth(yB, 13));

    labelA = `${yA} E.C.`;
    labelB = `${yB} E.C.`;

    const plansA = plans.filter((p) => p.year === yA);
    if (plansA.length > 0) {
      targetCostA = plansA.reduce((sum, p) => sum + Number(p.target_cost_limit), 0);
      targetSavingsA = plansA.reduce((sum, p) => sum + Number(p.target_savings_goal), 0);
    }

    const plansB = plans.filter((p) => p.year === yB);
    if (plansB.length > 0) {
      targetCostB = plansB.reduce((sum, p) => sum + Number(p.target_cost_limit), 0);
      targetSavingsB = plansB.reduce((sum, p) => sum + Number(p.target_savings_goal), 0);
    }
  } else if (mode === "weekly") {
    const wYear = params.weekYear ?? 2018;
    const wMonth = params.weekMonth ?? 12;
    const wA = params.weekA ?? 1;
    const wB = params.weekB ?? 2;

    const daysInMonth = getDaysInEthiopianMonth(wYear, wMonth);
    const boundsA = getWeekDayBounds(wA, daysInMonth);
    const boundsB = getWeekDayBounds(wB, daysInMonth);

    startA = toGregorianDate(wYear, wMonth, boundsA.startDay);
    endA = toGregorianDate(wYear, wMonth, boundsA.endDay);

    startB = toGregorianDate(wYear, wMonth, boundsB.startDay);
    endB = toGregorianDate(wYear, wMonth, boundsB.endDay);

    const mInfo = ETHIOPIAN_MONTHS[wMonth - 1];
    const mName = mInfo ? mInfo.nameEn : `Month ${wMonth}`;

    labelA = `Wk ${wA} (${boundsA.startDay}-${boundsA.endDay} ${mName})`;
    labelB = `Wk ${wB} (${boundsB.startDay}-${boundsB.endDay} ${mName})`;

    const planObj = plans.find((p) => p.year === wYear && p.month === wMonth);
    if (planObj) {
      const daysA = boundsA.endDay - boundsA.startDay + 1;
      const daysB = boundsB.endDay - boundsB.startDay + 1;
      targetCostA = (Number(planObj.target_cost_limit) / daysInMonth) * daysA;
      targetSavingsA = (Number(planObj.target_savings_goal) / daysInMonth) * daysA;
      targetCostB = (Number(planObj.target_cost_limit) / daysInMonth) * daysB;
      targetSavingsB = (Number(planObj.target_savings_goal) / daysInMonth) * daysB;
    }
  } else {
    // Monthly (default)
    const yA = params.yearA ?? 2018;
    const mA = params.monthA ?? 11;
    const yB = params.yearB ?? 2018;
    const mB = params.monthB ?? 12;

    const daysA = getDaysInEthiopianMonth(yA, mA);
    const daysB = getDaysInEthiopianMonth(yB, mB);

    startA = toGregorianDate(yA, mA, 1);
    endA = toGregorianDate(yA, mA, daysA);

    startB = toGregorianDate(yB, mB, 1);
    endB = toGregorianDate(yB, mB, daysB);

    const mInfoA = ETHIOPIAN_MONTHS[mA - 1];
    labelA = `${mInfoA ? mInfoA.nameEn : `Month ${mA}`} ${yA} E.C.`;

    const mInfoB = ETHIOPIAN_MONTHS[mB - 1];
    labelB = `${mInfoB ? mInfoB.nameEn : `Month ${mB}`} ${yB} E.C.`;

    const planA = plans.find((p) => p.year === yA && p.month === mA);
    if (planA) {
      targetCostA = Number(planA.target_cost_limit);
      targetSavingsA = Number(planA.target_savings_goal);
    }

    const planB = plans.find((p) => p.year === yB && p.month === mB);
    if (planB) {
      targetCostB = Number(planB.target_cost_limit);
      targetSavingsB = Number(planB.target_savings_goal);
    }
  }

  const [incomesA, costsA, incomesB, costsB] = await Promise.all([
    fetchIncomesInRange(supabase, userId, toIsoDate(startA), toIsoDate(endA)),
    fetchCostsInRange(supabase, userId, toIsoDate(startA), toIsoDate(endA)),
    fetchIncomesInRange(supabase, userId, toIsoDate(startB), toIsoDate(endB)),
    fetchCostsInRange(supabase, userId, toIsoDate(startB), toIsoDate(endB)),
  ]);

  const rangeA = { start: startA, end: endOfDay(endA) };
  const totalIncomeA = sumIncome(incomesA, rangeA);
  const totalCostsA = sumCosts(costsA, rangeA);
  const netProfitLossA = totalIncomeA - totalCostsA;

  const rangeB = { start: startB, end: endOfDay(endB) };
  const totalIncomeB = sumIncome(incomesB, rangeB);
  const totalCostsB = sumCosts(costsB, rangeB);
  const netProfitLossB = totalIncomeB - totalCostsB;

  const summaryA: ComparisonSummary = {
    label: labelA,
    totalIncome: totalIncomeA,
    totalCosts: totalCostsA,
    netProfitLoss: netProfitLossA,
    targetCostLimit: targetCostA,
    targetSavingsGoal: targetSavingsA,
    costsByCategory: groupCostsByCategory(costsA, rangeA),
  };

  const summaryB: ComparisonSummary = {
    label: labelB,
    totalIncome: totalIncomeB,
    totalCosts: totalCostsB,
    netProfitLoss: netProfitLossB,
    targetCostLimit: targetCostB,
    targetSavingsGoal: targetSavingsB,
    costsByCategory: groupCostsByCategory(costsB, rangeB),
  };

  return {
    mode,
    summaryA,
    summaryB,
    delta: {
      income: totalIncomeB - totalIncomeA,
      incomePercent: calculatePercentChange(totalIncomeB, totalIncomeA),
      costs: totalCostsB - totalCostsA,
      costsPercent: calculatePercentChange(totalCostsB, totalCostsA),
      net: netProfitLossB - netProfitLossA,
      netPercent: calculatePercentChange(netProfitLossB, netProfitLossA),
    },
  };
}
