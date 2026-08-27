"use client";

import * as React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  GitCompare,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  ShieldAlert,
  DollarSign,
  Target,
  PieChart,
  ChevronDown,
  ChevronUp,
  Calendar,
} from "lucide-react";
import { ETHIOPIAN_MONTHS, getEthiopianDate, COST_CATEGORY_LABELS, type CostCategory } from "@mc-tracker/shared-types";
import { useComparisonData } from "@/hooks/use-comparison-data";
import type { ComparisonMode, GetComparisonParams } from "@/lib/dashboard/get-comparison-data";
import { formatCurrency, cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface MonthComparisonSectionProps {
  userId: string;
}

export function MonthComparisonSection({ userId }: MonthComparisonSectionProps) {
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const [mode, setMode] = React.useState<ComparisonMode>("monthly");

  const currentEth = React.useMemo(() => getEthiopianDate(new Date()), []);

  // Monthly State
  const defaultYearB = currentEth.year;
  const defaultMonthB = currentEth.month;
  const defaultMonthA = currentEth.month > 1 ? currentEth.month - 1 : 13;
  const defaultYearA = currentEth.month > 1 ? currentEth.year : currentEth.year - 1;

  const [yearA, setYearA] = React.useState<number>(defaultYearA);
  const [monthA, setMonthA] = React.useState<number>(defaultMonthA);
  const [yearB, setYearB] = React.useState<number>(defaultYearB);
  const [monthB, setMonthB] = React.useState<number>(defaultMonthB);

  // Yearly State
  const [yearOnlyA, setYearOnlyA] = React.useState<number>(currentEth.year - 1);
  const [yearOnlyB, setYearOnlyB] = React.useState<number>(currentEth.year);

  // Weekly State (Month selection -> select 2 weeks in that month)
  const [weekYear, setWeekYear] = React.useState<number>(currentEth.year);
  const [weekMonth, setWeekMonth] = React.useState<number>(currentEth.month);
  const [weekA, setWeekA] = React.useState<number>(1);
  const [weekB, setWeekB] = React.useState<number>(2);

  const years = React.useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => currentEth.year - 2 + i);
  }, [currentEth.year]);

  const queryParams: GetComparisonParams = React.useMemo(() => {
    return {
      mode,
      yearA,
      monthA,
      yearB,
      monthB,
      yearOnlyA,
      yearOnlyB,
      weekYear,
      weekMonth,
      weekA,
      weekB,
    };
  }, [mode, yearA, monthA, yearB, monthB, yearOnlyA, yearOnlyB, weekYear, weekMonth, weekA, weekB]);

  const { data, isFetching } = useComparisonData(userId, queryParams);

  // Overview Chart Data
  const overviewChartData = React.useMemo(() => {
    if (!data) return [];
    return [
      {
        metric: "Income",
        [data.summaryA.label]: data.summaryA.totalIncome,
        [data.summaryB.label]: data.summaryB.totalIncome,
      },
      {
        metric: "Expenses",
        [data.summaryA.label]: data.summaryA.totalCosts,
        [data.summaryB.label]: data.summaryB.totalCosts,
      },
      {
        metric: "Net Savings",
        [data.summaryA.label]: data.summaryA.netProfitLoss,
        [data.summaryB.label]: data.summaryB.netProfitLoss,
      },
      {
        metric: "Budget Target",
        [data.summaryA.label]: data.summaryA.targetCostLimit ?? 0,
        [data.summaryB.label]: data.summaryB.targetCostLimit ?? 0,
      },
    ];
  }, [data]);

  // Category Breakdown Comparison Chart Data
  const categoryChartData = React.useMemo(() => {
    if (!data) return [];
    const categories: CostCategory[] = ["basic", "fancy", "extra"];
    return categories.map((cat) => ({
      categoryLabel: COST_CATEGORY_LABELS[cat],
      [data.summaryA.label]: data.summaryA.costsByCategory[cat] ?? 0,
      [data.summaryB.label]: data.summaryB.costsByCategory[cat] ?? 0,
    }));
  }, [data]);

  return (
    <Card className="border-border/60 shadow-sm transition-all" style={{ background: "var(--surface-1)" }}>
      {/* Accordion Toggle Header */}
      <CardHeader className="cursor-pointer select-none pb-4" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-sm">
              <GitCompare className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-bold text-foreground sm:text-lg">
                  Period Comparison Analytics
                </CardTitle>
                <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary capitalize">
                  {mode} View
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Compare performance side-by-side (Weekly, Monthly, Yearly).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden text-xs font-semibold text-primary sm:inline-block">
              {isOpen ? "Collapse" : "Expand Comparison"}
            </span>
            <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-border/60">
              {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Collapsible Content */}
      {isOpen && (
        <CardContent className={cn("flex flex-col gap-6 pt-0 border-t border-border/50 transition-opacity", isFetching && "opacity-60")}>
          {/* Mode Switcher & Selectors Header */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between pt-4">
            {/* Mode Switcher Tabs */}
            <div className="flex items-center gap-1 rounded-xl bg-card border border-border/60 p-1 shadow-sm self-start">
              <button
                type="button"
                onClick={() => setMode("monthly")}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                  mode === "monthly" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                )}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setMode("weekly")}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                  mode === "weekly" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                )}
              >
                Weekly
              </button>
              <button
                type="button"
                onClick={() => setMode("yearly")}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                  mode === "yearly" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                )}
              >
                Yearly
              </button>
            </div>

            {/* Dynamic Controls based on Mode */}
            <div className="flex flex-wrap items-center gap-3 bg-card/80 p-2.5 rounded-xl border border-border/50">
              {/* MONTHLY CONTROLS */}
              {mode === "monthly" && (
                <>
                  <div className="flex items-center gap-1.5">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase">Month A</span>
                      <div className="flex items-center gap-1">
                        <Select value={String(monthA)} onValueChange={(v) => setMonthA(Number(v))}>
                          <SelectTrigger className="h-8 text-xs w-[125px] rounded-lg">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ETHIOPIAN_MONTHS.map((m) => (
                              <SelectItem key={m.number} value={String(m.number)}>
                                {m.nameEn}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Select value={String(yearA)} onValueChange={(v) => setYearA(Number(v))}>
                          <SelectTrigger className="h-8 text-xs w-[85px] rounded-lg">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {years.map((y) => (
                              <SelectItem key={y} value={String(y)}>
                                {y}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-center rounded-full bg-primary/10 px-2 py-1 text-xs font-black text-primary uppercase">
                    VS
                  </div>

                  <div className="flex items-center gap-1.5">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase">Month B</span>
                      <div className="flex items-center gap-1">
                        <Select value={String(monthB)} onValueChange={(v) => setMonthB(Number(v))}>
                          <SelectTrigger className="h-8 text-xs w-[125px] rounded-lg">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ETHIOPIAN_MONTHS.map((m) => (
                              <SelectItem key={m.number} value={String(m.number)}>
                                {m.nameEn}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Select value={String(yearB)} onValueChange={(v) => setYearB(Number(v))}>
                          <SelectTrigger className="h-8 text-xs w-[85px] rounded-lg">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {years.map((y) => (
                              <SelectItem key={y} value={String(y)}>
                                {y}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* WEEKLY CONTROLS: First select Month & Year, then select 2 weeks */}
              {mode === "weekly" && (
                <>
                  <div className="flex flex-col gap-0.5 border-r border-border/50 pr-3">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase">Select Month</span>
                    <div className="flex items-center gap-1">
                      <Select value={String(weekMonth)} onValueChange={(v) => setWeekMonth(Number(v))}>
                        <SelectTrigger className="h-8 text-xs w-[120px] rounded-lg">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ETHIOPIAN_MONTHS.map((m) => (
                            <SelectItem key={m.number} value={String(m.number)}>
                              {m.nameEn}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select value={String(weekYear)} onValueChange={(v) => setWeekYear(Number(v))}>
                        <SelectTrigger className="h-8 text-xs w-[85px] rounded-lg">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {years.map((y) => (
                            <SelectItem key={y} value={String(y)}>
                              {y}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase">Week A</span>
                      <Select value={String(weekA)} onValueChange={(v) => setWeekA(Number(v))}>
                        <SelectTrigger className="h-8 text-xs w-[95px] rounded-lg">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Week 1</SelectItem>
                          <SelectItem value="2">Week 2</SelectItem>
                          <SelectItem value="3">Week 3</SelectItem>
                          <SelectItem value="4">Week 4</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center justify-center rounded-full bg-primary/10 px-2 py-1 text-xs font-black text-primary uppercase">
                    VS
                  </div>

                  <div className="flex items-center gap-1.5">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase">Week B</span>
                      <Select value={String(weekB)} onValueChange={(v) => setWeekB(Number(v))}>
                        <SelectTrigger className="h-8 text-xs w-[95px] rounded-lg">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Week 1</SelectItem>
                          <SelectItem value="2">Week 2</SelectItem>
                          <SelectItem value="3">Week 3</SelectItem>
                          <SelectItem value="4">Week 4</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </>
              )}

              {/* YEARLY CONTROLS */}
              {mode === "yearly" && (
                <>
                  <div className="flex items-center gap-1.5">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase">Year A</span>
                      <Select value={String(yearOnlyA)} onValueChange={(v) => setYearOnlyA(Number(v))}>
                        <SelectTrigger className="h-8 text-xs w-[110px] rounded-lg">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {years.map((y) => (
                            <SelectItem key={y} value={String(y)}>
                              {y} E.C.
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center justify-center rounded-full bg-primary/10 px-2 py-1 text-xs font-black text-primary uppercase">
                    VS
                  </div>

                  <div className="flex items-center gap-1.5">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase">Year B</span>
                      <Select value={String(yearOnlyB)} onValueChange={(v) => setYearOnlyB(Number(v))}>
                        <SelectTrigger className="h-8 text-xs w-[110px] rounded-lg">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {years.map((y) => (
                            <SelectItem key={y} value={String(y)}>
                              {y} E.C.
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Render Data */}
          {data ? (
            <>
              {/* Highlights Grid */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {/* Income Delta */}
                <div className="flex flex-col justify-between rounded-xl border border-border/50 bg-card p-3.5 shadow-sm">
                  <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                    <span>Income Comparison</span>
                    <DollarSign className="h-4 w-4 text-emerald-500" />
                  </div>
                  <div className="mt-2 flex items-baseline justify-between gap-1">
                    <span className="text-xs text-muted-foreground tabular-nums truncate">
                      {formatCurrency(data.summaryA.totalIncome)}
                    </span>
                    <ArrowRight className="h-3 w-3 shrink-0 text-muted-foreground" />
                    <span className="text-sm font-bold text-foreground tabular-nums truncate">
                      {formatCurrency(data.summaryB.totalIncome)}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between border-t border-border/40 pt-2 text-xs">
                    <span className="text-[11px] text-muted-foreground">Change</span>
                    <span
                      className={cn(
                        "font-semibold tabular-nums flex items-center gap-1",
                        data.delta.income >= 0 ? "text-emerald-500" : "text-rose-500",
                      )}
                    >
                      {data.delta.income >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {data.delta.income >= 0 ? "+" : ""}
                      {formatCurrency(data.delta.income)}
                      {data.delta.incomePercent !== null && ` (${data.delta.incomePercent > 0 ? "+" : ""}${data.delta.incomePercent.toFixed(1)}%)`}
                    </span>
                  </div>
                </div>

                {/* Costs Delta */}
                <div className="flex flex-col justify-between rounded-xl border border-border/50 bg-card p-3.5 shadow-sm">
                  <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                    <span>Expense Comparison</span>
                    <ShieldAlert className="h-4 w-4 text-amber-500" />
                  </div>
                  <div className="mt-2 flex items-baseline justify-between gap-1">
                    <span className="text-xs text-muted-foreground tabular-nums truncate">
                      {formatCurrency(data.summaryA.totalCosts)}
                    </span>
                    <ArrowRight className="h-3 w-3 shrink-0 text-muted-foreground" />
                    <span className="text-sm font-bold text-foreground tabular-nums truncate">
                      {formatCurrency(data.summaryB.totalCosts)}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between border-t border-border/40 pt-2 text-xs">
                    <span className="text-[11px] text-muted-foreground">Change</span>
                    <span
                      className={cn(
                        "font-semibold tabular-nums flex items-center gap-1",
                        data.delta.costs <= 0 ? "text-emerald-500" : "text-rose-500",
                      )}
                    >
                      {data.delta.costs <= 0 ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
                      {data.delta.costs >= 0 ? "+" : ""}
                      {formatCurrency(data.delta.costs)}
                      {data.delta.costsPercent !== null && ` (${data.delta.costsPercent > 0 ? "+" : ""}${data.delta.costsPercent.toFixed(1)}%)`}
                    </span>
                  </div>
                </div>

                {/* Net Savings Delta */}
                <div className="flex flex-col justify-between rounded-xl border border-border/50 bg-card p-3.5 shadow-sm">
                  <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                    <span>Net Savings</span>
                    <TrendingUp className="h-4 w-4 text-primary" />
                  </div>
                  <div className="mt-2 flex items-baseline justify-between gap-1">
                    <span className="text-xs text-muted-foreground tabular-nums truncate">
                      {formatCurrency(data.summaryA.netProfitLoss)}
                    </span>
                    <ArrowRight className="h-3 w-3 shrink-0 text-muted-foreground" />
                    <span className="text-sm font-bold text-foreground tabular-nums truncate">
                      {formatCurrency(data.summaryB.netProfitLoss)}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between border-t border-border/40 pt-2 text-xs">
                    <span className="text-[11px] text-muted-foreground">Change</span>
                    <span
                      className={cn(
                        "font-semibold tabular-nums flex items-center gap-1",
                        data.delta.net >= 0 ? "text-emerald-500" : "text-rose-500",
                      )}
                    >
                      {data.delta.net >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {data.delta.net >= 0 ? "+" : ""}
                      {formatCurrency(data.delta.net)}
                    </span>
                  </div>
                </div>

                {/* Target Cost Limit Comparison */}
                <div className="flex flex-col justify-between rounded-xl border border-border/50 bg-card p-3.5 shadow-sm">
                  <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                    <span>Budget Limit</span>
                    <Target className="h-4 w-4 text-emerald-500" />
                  </div>
                  <div className="mt-2 flex items-baseline justify-between gap-1">
                    <span className="text-xs text-muted-foreground tabular-nums truncate">
                      {data.summaryA.targetCostLimit !== null ? formatCurrency(data.summaryA.targetCostLimit) : "No Plan"}
                    </span>
                    <ArrowRight className="h-3 w-3 shrink-0 text-muted-foreground" />
                    <span className="text-sm font-bold text-foreground tabular-nums truncate">
                      {data.summaryB.targetCostLimit !== null ? formatCurrency(data.summaryB.targetCostLimit) : "No Plan"}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between border-t border-border/40 pt-2 text-xs">
                    <span className="text-[11px] text-muted-foreground">Status B</span>
                    <span className="font-semibold text-foreground">
                      {data.summaryB.targetCostLimit !== null
                        ? data.summaryB.totalCosts <= data.summaryB.targetCostLimit
                          ? "Under Budget"
                          : "Over Budget"
                        : "Unplanned"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Financial Overview Grouped Bar Chart */}
                <div className="flex flex-col gap-2 rounded-xl border border-border/50 bg-card/60 p-4">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-primary" /> Overall Financial Comparison
                  </h3>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={overviewChartData} margin={{ top: 12, right: 12, left: 0, bottom: 4 }}>
                      <CartesianGrid stroke="var(--gridline)" vertical={false} />
                      <XAxis
                        dataKey="metric"
                        tick={{ fill: "var(--text-muted)", fontSize: 12 }}
                        axisLine={{ stroke: "var(--baseline)" }}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fill: "var(--text-muted)", fontSize: 12 }}
                        axisLine={{ stroke: "var(--baseline)" }}
                        tickLine={false}
                        tickFormatter={(v: number) => formatCurrency(v)}
                        width={75}
                      />
                      <Tooltip
                        formatter={(v: number) => formatCurrency(v)}
                        contentStyle={{ background: "var(--surface-1)", borderColor: "var(--gridline)", color: "var(--text-primary)" }}
                      />
                      <Legend wrapperStyle={{ color: "var(--text-secondary)", fontSize: 12 }} />
                      <Bar dataKey={data.summaryA.label} fill="var(--series-1)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey={data.summaryB.label} fill="var(--series-2)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Expense Category Comparison Grouped Bar Chart */}
                <div className="flex flex-col gap-2 rounded-xl border border-border/50 bg-card/60 p-4">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <PieChart className="h-4 w-4 text-amber-500" /> Expense Categories Comparison
                  </h3>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={categoryChartData} margin={{ top: 12, right: 12, left: 0, bottom: 4 }}>
                      <CartesianGrid stroke="var(--gridline)" vertical={false} />
                      <XAxis
                        dataKey="categoryLabel"
                        tick={{ fill: "var(--text-muted)", fontSize: 12 }}
                        axisLine={{ stroke: "var(--baseline)" }}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fill: "var(--text-muted)", fontSize: 12 }}
                        axisLine={{ stroke: "var(--baseline)" }}
                        tickLine={false}
                        tickFormatter={(v: number) => formatCurrency(v)}
                        width={75}
                      />
                      <Tooltip
                        formatter={(v: number) => formatCurrency(v)}
                        contentStyle={{ background: "var(--surface-1)", borderColor: "var(--gridline)", color: "var(--text-primary)" }}
                      />
                      <Legend wrapperStyle={{ color: "var(--text-secondary)", fontSize: 12 }} />
                      <Bar dataKey={data.summaryA.label} fill="var(--series-1)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey={data.summaryB.label} fill="var(--series-2)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          ) : (
            <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
              Loading comparison analytics…
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
