import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { generateMonthlyReportPdf } from "@/lib/reports/generate-monthly-report-pdf";

const EMAIL_USER = process.env.EMAIL_USER || "mctrackernotification@gmail.com";
const EMAIL_PASS = process.env.EMAIL_PASS || "kmcveektvwxiqroo";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      email,
      periodLabel,
      totalIncome,
      totalCosts,
      netProfitLoss,
      costLimit,
      basicCost,
      fancyCost,
      extraCost,
      subcategoryCosts,
    } = body;

    const targetEmail = email || process.env.NOTIFICATION_EMAIL;
    if (!targetEmail) {
      return NextResponse.json({ error: "Recipient email is required" }, { status: 400 });
    }

    console.log(`[Gmail SMTP] Dispatching Month-End Financial Summary Email with PDF to: ${targetEmail}`);

    // Generate downloadable official PDF Report with subcategories
    const pdfBytes = await generateMonthlyReportPdf({
      periodLabel,
      totalIncome,
      totalCosts,
      netProfitLoss,
      costLimit,
      basicCost,
      fancyCost,
      extraCost,
      subcategoryCosts,
    });

    const cleanPeriodName = (periodLabel || "Period").replace(/[^a-zA-Z0-9_-]/g, "_");
    const pdfFilename = `MC-Tracker-Monthly-Report-${cleanPeriodName}.pdf`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    });

    const isProfit = (netProfitLoss || 0) >= 0;
    const netLabel = isProfit ? "Net Profit" : "Net Loss";
    const netColor = isProfit ? "#10b981" : "#ef4444";

    // Normalize subcategories for email HTML rendering
    let subcategoryList: Array<{ subcategory: string; category: string; amount: number }> = [];
    if (Array.isArray(subcategoryCosts)) {
      subcategoryList = subcategoryCosts.map((i: any) => ({
        subcategory: String(i.subcategory || "other"),
        category: String(i.category || "basic"),
        amount: Number(i.amount || 0),
      }));
    } else if (subcategoryCosts && typeof subcategoryCosts === "object") {
      subcategoryList = Object.entries(subcategoryCosts).map(([key, val]) => ({
        subcategory: key,
        category: "basic",
        amount: Number(val || 0),
      }));
    }
    subcategoryList.sort((a, b) => b.amount - a.amount);

    const info = await transporter.sendMail({
      from: `"MC Tracker Reports" <${EMAIL_USER}>`,
      to: targetEmail,
      subject: `📅 Month-End Financial Summary (${periodLabel || "Active Period"}) - MC Tracker`,
      attachments: [
        {
          filename: pdfFilename,
          content: Buffer.from(pdfBytes),
          contentType: "application/pdf",
        },
      ],
      html: `
        <div style="font-family: Arial, Helvetica, sans-serif; padding: 24px; color: #0f172a; max-width: 680px; margin: 0 auto; border: 1px solid #cbd5e1; border-radius: 16px; background-color: #ffffff;">
          <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 16px; border-bottom: 2px solid #10b981;">
            <div>
              <h1 style="color: #10b981; margin: 0; font-size: 22px; font-weight: 800;">MC TRACKER</h1>
              <p style="color: #64748b; font-size: 13px; margin: 2px 0 0 0;">Monthly Financial Summary & Report</p>
            </div>
            <div style="text-align: right;">
              <div style="background: #ecfdf5; color: #047857; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: bold; display: inline-block;">
                ${periodLabel || "Active Period"}
              </div>
            </div>
          </div>

          <div style="padding: 20px 0;">
            <p>Hello,</p>
            <p>Here is your complete month-end financial summary report for <strong>${periodLabel || "Active Period"}</strong>.</p>
            
            <table style="width: 100%; border-collapse: separate; border-spacing: 10px; margin: 20px 0;">
              <tr>
                <td style="background: #f0fdf4; padding: 14px; border-radius: 10px; border: 1px solid #bbf7d0; width: 50%;">
                  <div style="font-size: 11px; color: #15803d; font-weight: bold; text-transform: uppercase;">Total Income</div>
                  <div style="font-size: 20px; font-weight: 800; color: #166534; margin-top: 4px;">ETB ${Number(totalIncome || 0).toFixed(2)}</div>
                </td>
                <td style="background: #fef2f2; padding: 14px; border-radius: 10px; border: 1px solid #fecaca; width: 50%;">
                  <div style="font-size: 11px; color: #b91c1c; font-weight: bold; text-transform: uppercase;">Total Costs</div>
                  <div style="font-size: 20px; font-weight: 800; color: #991b1b; margin-top: 4px;">ETB ${Number(totalCosts || 0).toFixed(2)}</div>
                </td>
              </tr>
              <tr>
                <td style="background: #eff6ff; padding: 14px; border-radius: 10px; border: 1px solid #bfdbfe; width: 50%;">
                  <div style="font-size: 11px; color: #1d4ed8; font-weight: bold; text-transform: uppercase;">${netLabel}</div>
                  <div style="font-size: 20px; font-weight: 800; color: ${netColor}; margin-top: 4px;">ETB ${Number(netProfitLoss || 0).toFixed(2)}</div>
                </td>
                <td style="background: #f8fafc; padding: 14px; border-radius: 10px; border: 1px solid #e2e8f0; width: 50%;">
                  <div style="font-size: 11px; color: #475569; font-weight: bold; text-transform: uppercase;">Cost Budget Limit</div>
                  <div style="font-size: 20px; font-weight: 800; color: #334155; margin-top: 4px;">${costLimit ? `ETB ${Number(costLimit).toFixed(2)}` : "Unbudgeted"}</div>
                </td>
              </tr>
            </table>

            <!-- Detailed Subcategory Costs Breakdown -->
            <div style="margin: 20px 0 16px 0; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden;">
              <div style="background-color: #f8fafc; padding: 10px 14px; font-size: 12px; font-weight: 700; color: #334155; text-transform: uppercase; border-bottom: 1px solid #e2e8f0;">
                Detailed Subcategory Expenses
              </div>
              <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                <thead>
                  <tr style="background-color: #f1f5f9; color: #64748b; text-align: left; font-size: 11px;">
                    <th style="padding: 8px 12px; font-weight: 600;">SUBCATEGORY</th>
                    <th style="padding: 8px 12px; font-weight: 600;">CATEGORY</th>
                    <th style="padding: 8px 12px; font-weight: 600; text-align: right;">AMOUNT (ETB)</th>
                    <th style="padding: 8px 12px; font-weight: 600; text-align: right;">% SHARE</th>
                  </tr>
                </thead>
                <tbody>
                  ${subcategoryList.length > 0 ? subcategoryList.map((item, idx) => {
                    const subLabel = item.subcategory.charAt(0).toUpperCase() + item.subcategory.slice(1).replace(/_/g, " ");
                    const pct = totalCosts > 0 ? ((item.amount / totalCosts) * 100).toFixed(1) : "0.0";
                    const isEven = idx % 2 === 0;
                    return `
                      <tr style="background-color: ${isEven ? "#ffffff" : "#f8fafc"}; border-bottom: 1px solid #f1f5f9;">
                        <td style="padding: 8px 12px; font-weight: 600; color: #0f172a;">${subLabel}</td>
                        <td style="padding: 8px 12px; color: #475569; text-transform: capitalize;">${item.category}</td>
                        <td style="padding: 8px 12px; font-weight: 700; color: #dc2626; text-align: right;">ETB ${Number(item.amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td style="padding: 8px 12px; color: #64748b; text-align: right;">${pct}%</td>
                      </tr>
                    `;
                  }).join("") : `
                    <tr>
                      <td colspan="4" style="padding: 14px; text-align: center; color: #94a3b8;">No subcategory expenses recorded for this period.</td>
                    </tr>
                  `}
                </tbody>
              </table>
            </div>

            <!-- Attached PDF Download Notice -->
            <div style="margin: 22px 0 16px 0; padding: 14px 18px; background-color: #f0fdf4; border: 1px solid #86efac; border-radius: 10px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="width: 32px; font-size: 22px; vertical-align: middle;">📄</td>
                  <td style="vertical-align: middle;">
                    <div style="font-size: 13px; font-weight: 700; color: #15803d;">
                      Downloadable PDF Report Attached
                    </div>
                    <div style="font-size: 12px; color: #166534; margin-top: 2px;">
                      <strong>${pdfFilename}</strong> has been generated and attached to this email. You can download or print it directly from your email client.
                    </div>
                  </td>
                </tr>
              </table>
            </div>

            <p style="color: #475569; font-size: 13px; line-height: 1.5;">
              Log into MC Tracker to view full interactive charts, category drilldowns, and export custom reports.
            </p>
          </div>

          <div style="text-align: center; padding-top: 16px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 11px; margin-top: 24px;">
            Generated automatically by MC Tracker • All rights reserved © 2026
          </div>
        </div>
      `,
    });

    console.log("[Gmail SMTP] Month-End Email with PDF dispatched successfully:", info.messageId);
    return NextResponse.json({
      success: true,
      messageId: info.messageId,
      recipient: targetEmail,
      pdfAttached: true,
      pdfFilename,
    });
  } catch (error: any) {
    console.error("[Gmail SMTP Error]:", error);
    return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 });
  }
}
