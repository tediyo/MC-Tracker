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

import { useCalendarPreference, type CalendarMode } from "@/components/providers/calendar-provider";

interface DonutSlice {
  label: string;
  value: number;
  color: string;
  percent: number;
}

function generateDonutChartSvg({
  slices,
  total,
  displayTotal,
  size = 170,
  innerRadius = 44,
  outerRadius = 72,
}: {
  slices: DonutSlice[];
  total: number;
  displayTotal: string;
  size?: number;
  innerRadius?: number;
  outerRadius?: number;
}): string {
  const cx = size / 2;
  const cy = size / 2;

  if (total <= 0 || slices.length === 0) {
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="display: block; margin: 0 auto;">
        <circle cx="${cx}" cy="${cy}" r="${outerRadius}" fill="#f8fafc" stroke="#e2e8f0" stroke-width="2" />
        <circle cx="${cx}" cy="${cy}" r="${innerRadius}" fill="#ffffff" />
        <text x="${cx}" y="${cy + 4}" text-anchor="middle" font-size="11" fill="#94a3b8" font-weight="600">No Data</text>
      </svg>
    `;
  }

  const positiveSlices = slices.filter((s) => s.value > 0);
  if (positiveSlices.length === 1 && positiveSlices[0]) {
    const s = positiveSlices[0];
    const strokeWidth = outerRadius - innerRadius;
    const midRadius = innerRadius + strokeWidth / 2;
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="display: block; margin: 0 auto;">
        <circle cx="${cx}" cy="${cy}" r="${midRadius}" fill="none" stroke="${s.color}" stroke-width="${strokeWidth}" />
        <circle cx="${cx}" cy="${cy}" r="${innerRadius}" fill="#ffffff" />
        <text x="${cx}" y="${cy - 6}" text-anchor="middle" font-size="9" font-weight="700" fill="#64748b" letter-spacing="0.5">TOTAL</text>
        <text x="${cx}" y="${cy + 10}" text-anchor="middle" font-size="12" font-weight="800" fill="#0f172a">${displayTotal}</text>
      </svg>
    `;
  }

  let startAngle = -Math.PI / 2;
  const paths = positiveSlices
    .map((s) => {
      const angle = (s.value / total) * 2 * Math.PI;
      const endAngle = startAngle + angle;

      const x1 = cx + outerRadius * Math.cos(startAngle);
      const y1 = cy + outerRadius * Math.sin(startAngle);
      const x2 = cx + outerRadius * Math.cos(endAngle);
      const y2 = cy + outerRadius * Math.sin(endAngle);
      const x3 = cx + innerRadius * Math.cos(endAngle);
      const y3 = cy + innerRadius * Math.sin(endAngle);
      const x4 = cx + innerRadius * Math.cos(startAngle);
      const y4 = cy + innerRadius * Math.sin(startAngle);

      const largeArc = angle > Math.PI ? 1 : 0;
      const d = `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} L ${x3.toFixed(2)} ${y3.toFixed(2)} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4.toFixed(2)} ${y4.toFixed(2)} Z`;

      startAngle = endAngle;
      return `<path d="${d}" fill="${s.color}" stroke="#ffffff" stroke-width="2" />`;
    })
    .join("");

  return `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="display: block; margin: 0 auto;">
      ${paths}
      <circle cx="${cx}" cy="${cy}" r="${innerRadius}" fill="#ffffff" />
      <text x="${cx}" y="${cy - 6}" text-anchor="middle" font-size="9" font-weight="700" fill="#64748b" letter-spacing="0.5">TOTAL</text>
      <text x="${cx}" y="${cy + 10}" text-anchor="middle" font-size="12" font-weight="800" fill="#0f172a">${displayTotal}</text>
    </svg>
  `;
}

function generateTrendBarChartSvg({
  trend,
  displayAmount,
}: {
  trend: { bucketLabel: string; income: number; cost: number }[];
  displayAmount: (num: number) => string;
}): string {
  if (trend.length === 0) return "";

  const width = 740;
  const height = 210;
  const padLeft = 68;
  const padRight = 20;
  const padTop = 24;
  const padBottom = 38;
  const plotWidth = width - padLeft - padRight;
  const plotHeight = height - padTop - padBottom;

  const rawMax = Math.max(...trend.map((t) => Math.max(t.income, t.cost)), 0);
  const roughMax = rawMax > 0 ? rawMax * 1.15 : 1000;
  const magnitude = Math.pow(10, Math.floor(Math.log10(roughMax)));
  const roundedMax = Math.ceil(roughMax / (magnitude / 2)) * (magnitude / 2) || 1000;

  const gridSteps = [0, roundedMax / 3, (2 * roundedMax) / 3, roundedMax];
  const gridlines = gridSteps
    .map((val) => {
      const y = padTop + plotHeight - (val / roundedMax) * plotHeight;
      return `
        <line x1="${padLeft}" y1="${y.toFixed(1)}" x2="${(padLeft + plotWidth).toFixed(1)}" y2="${y.toFixed(1)}" stroke="#e2e8f0" stroke-width="1" stroke-dasharray="3,3" />
        <text x="${padLeft - 8}" y="${(y + 3.5).toFixed(1)}" text-anchor="end" font-size="10" font-weight="600" fill="#94a3b8">${displayAmount(Math.round(val))}</text>
      `;
    })
    .join("");

  const n = trend.length;
  const slotWidth = plotWidth / n;
  const barWidth = Math.max(Math.min(slotWidth * 0.36, 22), 6);
  const barGap = 2;

  const barsAndLabels = trend
    .map((pt, i) => {
      const slotCenter = padLeft + i * slotWidth + slotWidth / 2;
      const incH = Math.min((pt.income / roundedMax) * plotHeight, plotHeight);
      const costH = Math.min((pt.cost / roundedMax) * plotHeight, plotHeight);

      const xInc = slotCenter - barWidth - barGap / 2;
      const yInc = padTop + plotHeight - incH;

      const xCost = slotCenter + barGap / 2;
      const yCost = padTop + plotHeight - costH;

      return `
        <g>
          ${
            incH > 0
              ? `<rect x="${xInc.toFixed(1)}" y="${yInc.toFixed(1)}" width="${barWidth.toFixed(1)}" height="${Math.max(incH, 1).toFixed(1)}" fill="#10b981" rx="3" />`
              : ""
          }
          ${
            costH > 0
              ? `<rect x="${xCost.toFixed(1)}" y="${yCost.toFixed(1)}" width="${barWidth.toFixed(1)}" height="${Math.max(costH, 1).toFixed(1)}" fill="#ef4444" rx="3" />`
              : ""
          }
          <text x="${slotCenter.toFixed(1)}" y="${(padTop + plotHeight + 18).toFixed(1)}" text-anchor="middle" font-size="10" font-weight="600" fill="#64748b">${pt.bucketLabel}</text>
        </g>
      `;
    })
    .join("");

  return `
    <div style="margin-bottom: 20px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
        <span style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Income vs Expense Comparison Graph</span>
        <div style="display: flex; gap: 16px; font-size: 11px; font-weight: 700;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="display: inline-block; width: 10px; height: 10px; background: #10b981; border-radius: 2px;"></span>
            <span style="color: #047857;">Income</span>
          </div>
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="display: inline-block; width: 10px; height: 10px; background: #ef4444; border-radius: 2px;"></span>
            <span style="color: #b91c1c;">Expenses</span>
          </div>
        </div>
      </div>
      <svg width="100%" height="${height}" viewBox="0 0 ${width} ${height}" style="display: block; background: #f8fafc; border-radius: 10px; border: 1px solid #f1f5f9;">
        ${gridlines}
        <!-- Baseline -->
        <line x1="${padLeft}" y1="${padTop + plotHeight}" x2="${padLeft + plotWidth}" y2="${padTop + plotHeight}" stroke="#cbd5e1" stroke-width="1.5" />
        ${barsAndLabels}
      </svg>
    </div>
  `;
}

interface PdfReportButtonProps {
  data: DashboardData;
  showBalances?: boolean;
  timeframe?: TimeFrame;
  calendarMode?: CalendarMode;
}

export function PdfReportButton({
  data,
  showBalances = true,
  timeframe = "monthly",
  calendarMode: propCalendarMode,
}: PdfReportButtonProps) {
  const { calendarMode: contextCalendarMode } = useCalendarPreference();
  const calendarMode = propCalendarMode || contextCalendarMode || "ethiopian";
  const isEthiopian = calendarMode === "ethiopian";

  const handlePrintReport = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to generate the report.");
      return;
    }

    const { metrics, costsByCategory, currentPeriodCosts, trend } = data;
    const ethToday = getEthiopianDate(new Date());
    const ethMonthToday = ETHIOPIAN_MONTHS.find((m) => m.number === ethToday.month);
    const nowFormatted = isEthiopian
      ? `${ethMonthToday?.nameEn || "Month"} ${ethToday.day}, ${ethToday.year} E.C. (${new Date().toLocaleDateString()} G.C.)`
      : `${new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })} G.C.`;

    const displayAmount = (num: number) => (showBalances ? formatCurrency(num) : "••••••");

    // Percent Change helper
    const formatChangeText = (val: number | null) => {
      if (val === null) return "No prior data vs prev period";
      const sign = val > 0 ? "+" : "";
      return `${sign}${val.toFixed(1)}% vs prev period`;
    };

    // Category Breakdown math
    const totalCategoryCosts = Object.values(costsByCategory).reduce((a, b) => a + b, 0);
    const categoryColors: Record<CostCategory, string> = {
      basic: "#3b82f6", // Blue
      fancy: "#f97316", // Orange
      extra: "#10b981", // Emerald
    };
    const categoryEntries = (Object.entries(costsByCategory) as [CostCategory, number][]).map(
      ([cat, val]) => ({
        category: cat,
        label: COST_CATEGORY_LABELS[cat] || cat,
        total: val,
        color: categoryColors[cat] || "#64748b",
        percentage: totalCategoryCosts > 0 ? (val / totalCategoryCosts) * 100 : 0,
      })
    );

    const categoryDonutSvg = generateDonutChartSvg({
      slices: categoryEntries.map((c) => ({
        label: c.label,
        value: c.total,
        color: c.color,
        percent: c.percentage,
      })),
      total: totalCategoryCosts,
      displayTotal: displayAmount(totalCategoryCosts),
    });

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

    const subcategoryPalette = [
      "#10b981",
      "#3b82f6",
      "#f59e0b",
      "#8b5cf6",
      "#ec4899",
      "#06b6d4",
      "#f97316",
      "#64748b",
    ];
    const topSubcategories = subcategoryEntries.slice(0, 5);
    const remainingSubcategoriesTotal = subcategoryEntries.slice(5).reduce((sum, s) => sum + s.total, 0);
    const subcategorySlices: DonutSlice[] = topSubcategories.map((s, idx) => ({
      label: s.label,
      value: s.total,
      color: subcategoryPalette[idx % subcategoryPalette.length] ?? "#64748b",
      percent: s.percentage,
    }));
    if (remainingSubcategoriesTotal > 0) {
      subcategorySlices.push({
        label: "Other",
        value: remainingSubcategoriesTotal,
        color: subcategoryPalette[5 % subcategoryPalette.length] ?? "#64748b",
        percent: totalCategoryCosts > 0 ? (remainingSubcategoriesTotal / totalCategoryCosts) * 100 : 0,
      });
    }

    const subcategoryDonutSvg = generateDonutChartSvg({
      slices: subcategorySlices,
      total: totalCategoryCosts,
      displayTotal: displayAmount(totalCategoryCosts),
    });

    // Trend Graph SVG
    const trendGraphSvg = generateTrendBarChartSvg({
      trend,
      displayAmount,
    });

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
              break-inside: avoid;
              page-break-inside: avoid;
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
              .box { break-inside: avoid; page-break-inside: avoid; }
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

          <!-- Two Column Breakdown with Donut Charts -->
          <div class="two-col">
            <!-- Cost By Category -->
            <div class="box">
              <h3 class="box-title">Cost by Category</h3>
              ${
                totalCategoryCosts === 0
                  ? '<p class="empty-text">—</p>'
                  : `
                <div style="margin-bottom: 16px; padding: 10px 0 14px 0; border-bottom: 1px dashed #e2e8f0; display: flex; justify-content: center;">
                  ${categoryDonutSvg}
                </div>
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
                          <div style="display: flex; align-items: center; gap: 6px;">
                            <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: ${cat.color};"></span>
                            <span class="font-bold">${cat.label}</span>
                          </div>
                          <div class="progress-bar-bg">
                            <div class="progress-bar-fill" style="width: ${cat.percentage.toFixed(1)}%; background: ${cat.color};"></div>
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
                <div style="margin-bottom: 16px; padding: 10px 0 14px 0; border-bottom: 1px dashed #e2e8f0; display: flex; justify-content: center;">
                  ${subcategoryDonutSvg}
                </div>
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
                        (sub, idx) => {
                          const dotColor = subcategoryPalette[idx % subcategoryPalette.length];
                          return `
                      <tr>
                        <td>
                          <div style="display: flex; align-items: center; gap: 6px;">
                            <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: ${dotColor};"></span>
                            <span class="font-bold">${sub.label}</span>
                          </div>
                        </td>
                        <td>${sub.categoryLabel}</td>
                        <td class="text-right font-bold">${displayAmount(sub.total)}</td>
                      </tr>
                    `;
                        }
                      )
                      .join("")}
                  </tbody>
                </table>
              `
              }
            </div>
          </div>

          <!-- Cash Flow Trend with Dual-Bar Comparison Graph -->
          ${
            trend.length > 0
              ? `
            <div class="box" style="margin-bottom: 24px;">
              <h3 class="box-title">Cash Flow &amp; Trend Intervals (${isEthiopian ? "Ethiopian Calendar" : "Gregorian Calendar"})</h3>
              ${trendGraphSvg}
              <table>
                <thead>
                  <tr>
                    <th>Period Interval (${isEthiopian ? "E.C." : "G.C."})</th>
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

          <!-- Footer -->
          <div class="footer-note">
            <span>MC Tracker Personal Finance Overview (${isEthiopian ? "Ethiopian Calendar" : "Gregorian Calendar"})</span>
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
