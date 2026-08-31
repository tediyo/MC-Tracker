"use client";

import * as React from "react";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DashboardData } from "@/lib/dashboard/get-dashboard-data";
import { formatCurrency } from "@/lib/utils";
import { getEthiopianDate, ETHIOPIAN_MONTHS, COST_CATEGORY_LABELS, type CostCategory } from "@mc-tracker/shared-types";

interface PdfReportButtonProps {
  data: DashboardData;
}

export function PdfReportButton({ data }: PdfReportButtonProps) {
  const handlePrintReport = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to generate the report.");
      return;
    }

    const { metrics, costsByCategory } = data;
    const eth = getEthiopianDate(new Date());
    const ethMonth = ETHIOPIAN_MONTHS.find((m) => m.number === eth.month);
    const dateStr = `${ethMonth?.nameEn || "Month"} ${eth.day}, ${eth.year} E.C. (${new Date().toLocaleDateString()})`;

    const totalCategoryCosts = Object.values(costsByCategory).reduce((a, b) => a + b, 0);
    const categoryEntries = (Object.entries(costsByCategory) as [CostCategory, number][]).map(
      ([cat, val]) => ({
        category: cat,
        total: val,
        percentage: totalCategoryCosts > 0 ? (val / totalCategoryCosts) * 100 : 0,
      })
    );

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>MC Tracker Financial Report - ${metrics.range.label}</title>
          <style>
            body {
              font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              margin: 40px;
              color: #1e293b;
              background: #fff;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 2px solid #10b981;
              padding-bottom: 16px;
              margin-bottom: 24px;
            }
            .title {
              font-size: 24px;
              font-weight: 800;
              color: #065f46;
              margin: 0;
            }
            .subtitle {
              font-size: 14px;
              color: #64748b;
              margin-top: 4px;
            }
            .period-tag {
              background: #ecfdf5;
              color: #047857;
              padding: 6px 12px;
              border-radius: 8px;
              font-weight: 700;
              font-size: 14px;
            }
            .grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 16px;
              margin-bottom: 32px;
            }
            .card {
              border: 1px solid #e2e8f0;
              border-radius: 12px;
              padding: 16px;
              background: #f8fafc;
            }
            .card-label {
              font-size: 12px;
              font-weight: 600;
              color: #64748b;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .card-val {
              font-size: 22px;
              font-weight: 800;
              margin-top: 8px;
            }
            .income-text { color: #059669; }
            .cost-text { color: #dc2626; }
            .net-text { color: ${metrics.netProfitLoss >= 0 ? "#059669" : "#dc2626"}; }
            
            section { margin-bottom: 32px; }
            h2 {
              font-size: 16px;
              font-weight: 700;
              color: #334155;
              margin-bottom: 12px;
              border-left: 4px solid #10b981;
              padding-left: 8px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 8px;
            }
            th, td {
              text-align: left;
              padding: 10px 12px;
              border-bottom: 1px solid #e2e8f0;
              font-size: 14px;
            }
            th {
              background: #f1f5f9;
              font-weight: 700;
              color: #475569;
            }
            .footer {
              margin-top: 40px;
              padding-top: 16px;
              border-top: 1px solid #e2e8f0;
              font-size: 12px;
              color: #94a3b8;
              text-align: center;
            }
            @media print {
              body { margin: 0; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1 class="title">MC Tracker - Overview Report</h1>
              <div class="subtitle">Generated on ${dateStr}</div>
            </div>
            <div class="period-tag">${metrics.range.label}</div>
          </div>

          <div class="grid">
            <div class="card">
              <div class="card-label">Total Income</div>
              <div class="card-val income-text">${formatCurrency(metrics.totalIncome)}</div>
            </div>
            <div class="card">
              <div class="card-label">Total Expenses</div>
              <div class="card-val cost-text">${formatCurrency(metrics.totalCosts)}</div>
            </div>
            <div class="card">
              <div class="card-label">Net Profit / Loss</div>
              <div class="card-val net-text">${formatCurrency(metrics.netProfitLoss)}</div>
            </div>
          </div>

          <section>
            <h2>Expense Breakdown by Category</h2>
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>% of Total</th>
                </tr>
              </thead>
              <tbody>
                ${categoryEntries.map((c) => `
                  <tr>
                    <td><strong>${COST_CATEGORY_LABELS[c.category]}</strong></td>
                    <td class="cost-text">${formatCurrency(c.total)}</td>
                    <td>${c.percentage.toFixed(1)}%</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </section>

          <div class="footer">
            Confidential Financial Report • MC Tracker (Monthly Cost & Income Tracker)
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
