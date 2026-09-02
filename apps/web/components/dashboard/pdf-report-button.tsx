"use client";

import * as React from "react";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DashboardData } from "@/lib/dashboard/get-dashboard-data";
import { formatCurrency, formatPercent } from "@/lib/utils";
import {
  getEthiopianDate,
  ETHIOPIAN_MONTHS,
  COST_CATEGORY_LABELS,
  COST_SUBCATEGORY_LABELS,
  INCOME_SOURCE_TYPE_LABELS,
  type CostCategory,
  type CostSubcategory,
  type TimeFrame,
} from "@mc-tracker/shared-types";

interface PdfReportButtonProps {
  data: DashboardData;
  showBalances?: boolean;
  timeframe?: TimeFrame;
}

export function PdfReportButton({
  data,
  showBalances = true,
  timeframe = "monthly",
}: PdfReportButtonProps) {
  const handlePrintReport = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to generate the report.");
      return;
    }

    const { metrics, costsByCategory, currentPeriodCosts, currentPeriodIncomes, trend } = data;
    const ethToday = getEthiopianDate(new Date());
    const ethMonthToday = ETHIOPIAN_MONTHS.find((m) => m.number === ethToday.month);
    const nowFormatted = `${ethMonthToday?.nameEn || "Month"} ${ethToday.day}, ${ethToday.year} E.C. (${new Date().toLocaleDateString()})`;

    const displayAmount = (num: number) => (showBalances ? formatCurrency(num) : "••••••");

    // Percent Change helper
    const formatChangeText = (val: number | null) => {
      if (val === null) return "No prior data vs prev period";
      const sign = val > 0 ? "+" : "";
      return `${sign}${val.toFixed(1)}% vs prev period`;
    };

    // Category Breakdown math
    const totalCategoryCosts = Object.values(costsByCategory).reduce((a, b) => a + b, 0);
    const categoryEntries = (Object.entries(costsByCategory) as [CostCategory, number][]).map(
      ([cat, val]) => ({
        category: cat,
        label: COST_CATEGORY_LABELS[cat] || cat,
        total: val,
        percentage: totalCategoryCosts > 0 ? (val / totalCategoryCosts) * 100 : 0,
      })
    );

    // Subcategory Breakdown math
    const subcategoryMap: Record<string, { category: CostCategory; total: number }> = {};
    currentPeriodCosts.forEach((c) => {
      if (!subcategoryMap[c.subcategory]) {
        subcategoryMap[c.subcategory] = { category: c.category, total: 0 };
      }
      subcategoryMap[c.subcategory]!.total += Number(c.amount);
    });
    const subcategoryEntries = Object.entries(subcategoryMap).map(([subKey, info]) => ({
      subcategory: subKey as CostSubcategory,
      label: COST_SUBCATEGORY_LABELS[subKey as CostSubcategory] || subKey,
      categoryLabel: COST_CATEGORY_LABELS[info.category] || info.category,
      total: info.total,
      percentage: totalCategoryCosts > 0 ? (info.total / totalCategoryCosts) * 100 : 0,
    })).sort((a, b) => b.total - a.total);

    // Variance strings
    const costBudgetStr =
      metrics.costVariance === null
        ? "no plan set"
        : metrics.costVariance >= 0
        ? `${displayAmount(metrics.costVariance)} under budget limit`
        : `${displayAmount(Math.abs(metrics.costVariance))} over budget limit`;

    const savingsGoalStr =
      metrics.savingsVariance === null
        ? "no plan set"
        : metrics.savingsVariance >= 0
        ? `${displayAmount(metrics.savingsVariance)} ahead of savings goal`
        : `${displayAmount(Math.abs(metrics.savingsVariance))} behind savings goal`;

    // Recent Transactions (top 10)
    const combinedTx = [
      ...currentPeriodCosts.map((c) => ({
        id: c.id,
        type: "cost" as const,
        amount: Number(c.amount),
        date: c.date,
        tag: COST_CATEGORY_LABELS[c.category] || c.category,
        desc: c.description || COST_SUBCATEGORY_LABELS[c.subcategory] || c.subcategory,
      })),
      ...currentPeriodIncomes.map((i) => ({
        id: i.id,
        type: "income" as const,
        amount: Number(i.amount),
        date: i.date,
        tag: INCOME_SOURCE_TYPE_LABELS[i.source_type] || i.source_type,
        desc: i.description || "Income Deposit",
      })),
    ]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);

    const formatEthDateString = (isoDate: string) => {
      try {
        const ed = getEthiopianDate(isoDate);
        const m = ETHIOPIAN_MONTHS.find((item) => item.number === ed.month);
        return `${m?.nameEn || ""} ${ed.day}, ${ed.year} E.C.`;
      } catch {
        return isoDate;
      }
    };

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>MC Tracker - Dashboard Overview Report (${metrics.range.label})</title>
          <style>
            * { box-sizing: border-box; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              margin: 0;
              padding: 32px;
              color: #0f172a;
              background: #ffffff;
            }
            .header-bar {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              border-bottom: 3px solid #10b981;
              padding-bottom: 20px;
              margin-bottom: 24px;
            }
            .brand-title {
              font-size: 26px;
              font-weight: 800;
              color: #047857;
              margin: 0 0 6px 0;
              letter-spacing: -0.5px;
            }
            .brand-subtitle {
              font-size: 13px;
              color: #64748b;
              margin: 0;
            }
            .badge-group {
              display: flex;
              flex-direction: column;
              align-items: flex-end;
              gap: 4px;
            }
            .timeframe-pill {
              background: #ecfdf5;
              color: #047857;
              border: 1px solid #a7f3d0;
              padding: 6px 14px;
              border-radius: 20px;
              font-size: 13px;
              font-weight: 700;
            }
            .date-stamp {
              font-size: 11px;
              color: #94a3b8;
            }

            /* Metric Cards Grid */
            .section-title {
              font-size: 15px;
              font-weight: 700;
              color: #1e293b;
              margin: 24px 0 12px 0;
              display: flex;
              align-items: center;
              gap: 8px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .cards-grid {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 14px;
              margin-bottom: 24px;
            }
            .metric-card {
              border: 1px solid #e2e8f0;
              border-radius: 14px;
              padding: 16px;
              background: #f8fafc;
            }
            .card-label {
              font-size: 11px;
              font-weight: 700;
              color: #64748b;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 8px;
            }
            .card-value {
              font-size: 22px;
              font-weight: 800;
              margin-bottom: 6px;
              font-variant-numeric: tabular-nums;
            }
            .income-val { color: #059669; }
            .cost-val { color: #0f172a; }
            .net-val { color: ${metrics.netProfitLoss >= 0 ? "#059669" : "#dc2626"}; }
            
            .change-subtext {
              font-size: 11px;
              color: #64748b;
              display: flex;
              align-items: center;
              gap: 4px;
            }

            .variance-list {
              font-size: 12px;
              color: #334155;
              display: flex;
              flex-direction: column;
              gap: 6px;
              margin-top: 4px;
            }
            .variance-item {
              display: flex;
              align-items: center;
              gap: 6px;
            }
            .bullet { color: #10b981; font-weight: bold; }

            /* Two Column Tables */
            .two-col {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin-bottom: 24px;
            }
            .box {
              border: 1px solid #e2e8f0;
              border-radius: 14px;
              padding: 16px;
              background: #ffffff;
            }
            .box-title {
              font-size: 14px;
              font-weight: 700;
              color: #0f172a;
              margin: 0 0 12px 0;
              padding-bottom: 8px;
              border-bottom: 1px solid #f1f5f9;
            }

            table {
              width: 100%;
              border-collapse: collapse;
            }
            th {
              font-size: 11px;
              font-weight: 700;
              text-transform: uppercase;
              color: #64748b;
              background: #f8fafc;
              padding: 8px 10px;
              text-align: left;
              border-bottom: 1px solid #e2e8f0;
            }
            td {
              font-size: 12px;
              padding: 8px 10px;
              border-bottom: 1px solid #f1f5f9;
              color: #334155;
            }
            .text-right { text-align: right; }
            .font-bold { font-weight: 700; }
            .progress-bar-bg {
              height: 6px;
              background: #e2e8f0;
              border-radius: 3px;
              overflow: hidden;
              margin-top: 4px;
            }
            .progress-bar-fill {
              height: 100%;
              background: #10b981;
              border-radius: 3px;
            }

            .empty-text {
              font-size: 12px;
              color: #94a3b8;
              font-style: italic;
              padding: 12px 0;
            }

            .footer-note {
              margin-top: 40px;
              padding-top: 16px;
              border-top: 1px solid #e2e8f0;
              display: flex;
              justify-content: space-between;
              font-size: 11px;
              color: #94a3b8;
            }

            @media print {
              body { padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <!-- Document Header -->
          <div class="header-bar">
            <div>
              <h1 class="brand-title">Dashboard Overview</h1>
              <p class="brand-subtitle">Track your real-time financial metrics, cash flow trends, and budget targets.</p>
            </div>
            <div class="badge-group">
              <div class="timeframe-pill">${timeframe.toUpperCase()} • ${metrics.range.label}</div>
              <div class="date-stamp">Generated: ${nowFormatted}</div>
            </div>
          </div>

          <!-- Section: Summary Cards -->
          <div class="cards-grid">
            <!-- Card 1: Total Income -->
            <div class="metric-card">
              <div class="card-label">Total Income</div>
              <div class="card-value income-val">${displayAmount(metrics.totalIncome)}</div>
              <div class="change-subtext">
                <span>${formatChangeText(metrics.percentChangeIncome)}</span>
              </div>
            </div>

            <!-- Card 2: Total Costs -->
            <div class="metric-card">
              <div class="card-label">Total Costs</div>
              <div class="card-value cost-val">${displayAmount(metrics.totalCosts)}</div>
              <div class="change-subtext">
                <span>${formatChangeText(metrics.percentChangeCosts)}</span>
              </div>
            </div>

            <!-- Card 3: Net Profit / Loss -->
            <div class="metric-card">
              <div class="card-label">Net Profit / Loss</div>
              <div class="card-value net-val">${displayAmount(metrics.netProfitLoss)}</div>
              <div class="change-subtext">
                <span>${formatChangeText(metrics.percentChangeNet)}</span>
              </div>
            </div>

            <!-- Card 4: Budget Variance -->
            <div class="metric-card">
              <div class="card-label">Budget Variance</div>
              <div class="variance-list">
                <div class="variance-item">
                  <span class="bullet">—</span>
                  <span>Cost budget: ${costBudgetStr}</span>
                </div>
                <div class="variance-item">
                  <span class="bullet">—</span>
                  <span>Savings goal: ${savingsGoalStr}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Two Column Breakdown -->
          <div class="two-col">
            <!-- Cost By Category -->
            <div class="box">
              <h3 class="box-title">Cost by Category</h3>
              ${
                totalCategoryCosts === 0
                  ? '<p class="empty-text">—</p>'
                  : `
                <table>
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th class="text-right">Amount</th>
                      <th class="text-right">% Share</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${categoryEntries
                      .map(
                        (cat) => `
                      <tr>
                        <td>
                          <div class="font-bold">${cat.label}</div>
                          <div class="progress-bar-bg">
                            <div class="progress-bar-fill" style="width: ${cat.percentage.toFixed(1)}%;"></div>
                          </div>
                        </td>
                        <td class="text-right font-bold">${displayAmount(cat.total)}</td>
                        <td class="text-right">${cat.percentage.toFixed(1)}%</td>
                      </tr>
                    `
                      )
                      .join("")}
                  </tbody>
                </table>
              `
              }
            </div>

            <!-- Subcategory Breakdown -->
            <div class="box">
              <h3 class="box-title">Subcategory Breakdown</h3>
              ${
                subcategoryEntries.length === 0
                  ? '<p class="empty-text">—</p>'
                  : `
                <table>
                  <thead>
                    <tr>
                      <th>Subcategory</th>
                      <th>Category</th>
                      <th class="text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${subcategoryEntries
                      .slice(0, 7)
                      .map(
                        (sub) => `
                      <tr>
                        <td class="font-bold">${sub.label}</td>
                        <td>${sub.categoryLabel}</td>
                        <td class="text-right font-bold">${displayAmount(sub.total)}</td>
                      </tr>
                    `
                      )
                      .join("")}
                  </tbody>
                </table>
              `
              }
            </div>
          </div>

          <!-- Cash Flow Trend Points -->
          ${
            trend.length > 0
              ? `
            <div class="box" style="margin-bottom: 24px;">
              <h3 class="box-title">Income & Expense Trend Intervals</h3>
              <table>
                <thead>
                  <tr>
                    <th>Period Interval</th>
                    <th class="text-right">Income</th>
                    <th class="text-right">Expenses</th>
                    <th class="text-right">Net Profit / Loss</th>
                  </tr>
                </thead>
                <tbody>
                  ${trend
                    .map((pt) => {
                      const net = pt.income - pt.cost;
                      return `
                    <tr>
                      <td class="font-bold">${pt.bucketLabel}</td>
                      <td class="text-right income-val font-bold">${displayAmount(pt.income)}</td>
                      <td class="text-right cost-val font-bold">${displayAmount(pt.cost)}</td>
                      <td class="text-right ${net >= 0 ? "income-val" : "cost-val"} font-bold">${displayAmount(net)}</td>
                    </tr>
                  `;
                    })
                    .join("")}
                </tbody>
              </table>
            </div>
          `
              : ""
          }

          <!-- Recent Transactions -->
          <div class="box">
            <h3 class="box-title">Recent Transactions</h3>
            ${
              combinedTx.length === 0
                ? '<p class="empty-text">No recent transactions logged yet.</p>'
                : `
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type / Category</th>
                    <th>Description</th>
                    <th class="text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${combinedTx
                    .map(
                      (tx) => `
                    <tr>
                      <td>${tx.date} (${formatEthDateString(tx.date)})</td>
                      <td><span class="font-bold">${tx.tag}</span> (${tx.type.toUpperCase()})</td>
                      <td>${tx.desc}</td>
                      <td class="text-right font-bold ${tx.type === "income" ? "income-val" : ""}">
                        ${tx.type === "income" ? "+" : "-"}${displayAmount(tx.amount)}
                      </td>
                    </tr>
                  `
                    )
                    .join("")}
                </tbody>
              </table>
            `
            }
          </div>

          <!-- Footer -->
          <div class="footer-note">
            <span>MC Tracker Personal Finance Overview</span>
            <span>Confidential Financial Document</span>
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handlePrintReport}
      className="h-9 rounded-xl gap-2 text-xs font-semibold border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
    >
      <Printer className="h-4 w-4" />
      <span>Export PDF Report</span>
    </Button>
  );
}
