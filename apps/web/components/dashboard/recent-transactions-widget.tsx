"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUpRight, ArrowDownRight, ChevronRight, Receipt, TrendingUp, History } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import {
  getEthiopianDate,
  ETHIOPIAN_MONTHS,
  COST_CATEGORY_LABELS,
  INCOME_SOURCE_TYPE_LABELS,
  type CostRow,
  type IncomeRow,
} from "@mc-tracker/shared-types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface RecentTransactionsWidgetProps {
  costs: CostRow[];
  incomes: IncomeRow[];
  showBalances?: boolean;
}

interface CombinedTransaction {
  id: string;
  type: "income" | "cost";
  amount: number;
  date: string;
  categoryOrSource: string;
  description: string | null;
}

export function RecentTransactionsWidget({
  costs,
  incomes,
  showBalances = true,
}: RecentTransactionsWidgetProps) {
  const combined = React.useMemo(() => {
    const costItems: CombinedTransaction[] = costs.map((c) => ({
      id: `cost-${c.id}`,
      type: "cost",
      amount: c.amount,
      date: c.date,
      categoryOrSource: COST_CATEGORY_LABELS[c.category] || c.category,
      description: c.description,
    }));

    const incomeItems: CombinedTransaction[] = incomes.map((i) => ({
      id: `inc-${i.id}`,
      type: "income",
      amount: i.amount,
      date: i.date,
      categoryOrSource: INCOME_SOURCE_TYPE_LABELS[i.source_type] || i.source_type,
      description: i.description,
    }));

    return [...costItems, ...incomeItems]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [costs, incomes]);

  const formatDateLabel = (isoDate: string) => {
    try {
      const eth = getEthiopianDate(isoDate);
      const ethMonth = ETHIOPIAN_MONTHS.find((m) => m.number === eth.month);
      return `${ethMonth?.nameEn || "Month"} ${eth.day}, ${eth.year} E.C.`;
    } catch {
      return isoDate;
    }
  };

  return (
    <Card className="border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-emerald-500" />
          <CardTitle className="text-base font-bold">Recent Transactions</CardTitle>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="h-8 text-xs font-semibold text-emerald-600 dark:text-emerald-400 gap-1">
            <Link href="/costs/history">
              <span>View Full History</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {combined.length === 0 ? (
          <p className="text-sm text-muted-foreground/60 py-4 text-center">—</p>
        ) : (
          <div className="flex flex-col divide-y divide-border/50">
            {combined.map((tx) => {
              const isIncome = tx.type === "income";
              return (
                <div key={tx.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                        isIncome ? "bg-primary/10 text-primary" : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {isIncome ? <TrendingUp className="h-4 w-4" /> : <Receipt className="h-4 w-4" />}
                    </span>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-foreground">
                        {tx.description || tx.categoryOrSource}
                      </span>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 font-medium">
                          {tx.categoryOrSource}
                        </span>
                        <span>•</span>
                        <span>{formatDateLabel(tx.date)}</span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-sm font-bold tabular-nums ${
                      isIncome ? "text-emerald-600 dark:text-emerald-400" : "text-foreground"
                    }`}
                  >
                    {isIncome ? "+" : "-"}
                    {showBalances ? formatCurrency(tx.amount) : "••••••"}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
