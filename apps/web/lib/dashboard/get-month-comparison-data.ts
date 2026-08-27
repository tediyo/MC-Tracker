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

export interface MonthSummary {
  year: number;
  month: number;
  label: string;
  totalIncome: number;
  totalCosts: number;
  netProfitLoss: number;
  targetCostLimit: number | null;
  targetSavingsGoal: number | null;
  costsByCategory: Record<CostCategory, number>;
}

export interface MonthComparisonData {
  monthA: MonthSummary;
  monthB: MonthSummary;
  delta: {
    income: number;
    incomePercent: number | null;
    costs: number;
    costsPercent: number | null;
    net: number;
    netPercent: number | null;
  };
}

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export async function getMonthComparisonData(
  supabase: any,
  userId: string,
  yearA: number,
  monthA: number,
  yearB: number,
  monthB: number,
): Promise<MonthComparisonData> {
  const daysInA = getDaysInEthiopianMonth(yearA, monthA);
  const startA = toGregorianDate(yearA, monthA, 1);
  const endA = toGregorianDate(yearA, monthA, daysInA);

  const daysInB = getDaysInEthiopianMonth(yearB, monthB);
  const startB = toGregorianDate(yearB, monthB, 1);
  const endB = toGregorianDate(yearB, monthB, daysInB);

  const [incomesA, costsA, incomesB, costsB, plans] = await Promise.all([
    fetchIncomesInRange(supabase, userId, toIsoDate(startA), toIsoDate(endA)),
    fetchCostsInRange(supabase, userId, toIsoDate(startA), toIsoDate(endA)),
    fetchIncomesInRange(supabase, userId, toIsoDate(startB), toIsoDate(endB)),
    fetchCostsInRange(supabase, userId, toIsoDate(startB), toIsoDate(endB)),
    fetchAllPlans(supabase, userId),
  ]);

  const rangeA = { start: startA, end: endOfDay(endA) };
  const totalIncomeA = sumIncome(incomesA, rangeA);
  const totalCostsA = sumCosts(costsA, rangeA);
  const netProfitLossA = totalIncomeA - totalCostsA;
  const planA = plans.find((p) => p.year === yearA && p.month === monthA);

  const rangeB = { start: startB, end: endOfDay(endB) };
  const totalIncomeB = sumIncome(incomesB, rangeB);
  const totalCostsB = sumCosts(costsB, rangeB);
  const netProfitLossB = totalIncomeB - totalCostsB;
  const planB = plans.find((p) => p.year === yearB && p.month === monthB);

  const monthInfoA = ETHIOPIAN_MONTHS[monthA - 1];
  const labelA = `${monthInfoA ? monthInfoA.nameEn : `Month ${monthA}`} ${yearA} E.C.`;

  const monthInfoB = ETHIOPIAN_MONTHS[monthB - 1];
  const labelB = `${monthInfoB ? monthInfoB.nameEn : `Month ${monthB}`} ${yearB} E.C.`;

  const summaryA: MonthSummary = {
    year: yearA,
    month: monthA,
    label: labelA,
    totalIncome: totalIncomeA,
    totalCosts: totalCostsA,
    netProfitLoss: netProfitLossA,
    targetCostLimit: planA ? Number(planA.target_cost_limit) : null,
    targetSavingsGoal: planA ? Number(planA.target_savings_goal) : null,
    costsByCategory: groupCostsByCategory(costsA, rangeA),
  };

  const summaryB: MonthSummary = {
    year: yearB,
    month: monthB,
    label: labelB,
    totalIncome: totalIncomeB,
    totalCosts: totalCostsB,
    netProfitLoss: netProfitLossB,
    targetCostLimit: planB ? Number(planB.target_cost_limit) : null,
    targetSavingsGoal: planB ? Number(planB.target_savings_goal) : null,
    costsByCategory: groupCostsByCategory(costsB, rangeB),
  };

  const deltaIncome = totalIncomeB - totalIncomeA;
  const deltaCosts = totalCostsB - totalCostsA;
  const deltaNet = netProfitLossB - netProfitLossA;

  return {
    monthA: summaryA,
    monthB: summaryB,
    delta: {
      income: deltaIncome,
      incomePercent: calculatePercentChange(totalIncomeB, totalIncomeA),
      costs: deltaCosts,
      costsPercent: calculatePercentChange(totalCostsB, totalCostsA),
      net: deltaNet,
      netPercent: calculatePercentChange(netProfitLossB, netProfitLossA),
    },
  };
}
