import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

const EMAIL_USER = process.env.EMAIL_USER || "tewodrosberhanu19@gmail.com";
const EMAIL_PASS = process.env.EMAIL_PASS || "nbloosgfbxsvfyux";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, periodLabel, totalIncome, totalCosts, netProfitLoss, costLimit } = body;

    const targetEmail = email || process.env.NOTIFICATION_EMAIL || "tewodrosberhanu16@gmail.com";

    console.log(`[Gmail SMTP] Dispatching Month-End Financial Summary Email to: ${targetEmail}`);

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

    const info = await transporter.sendMail({
      from: `"MC Tracker Reports" <${EMAIL_USER}>`,
      to: targetEmail,
      subject: `📅 Month-End Financial Summary (${periodLabel || "Active Period"}) - MC Tracker`,
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

            <p style="color: #475569; font-size: 13px; line-height: 1.5;">
              Log into MC Tracker to view full transaction logs, category breakdowns, and export print-friendly PDF reports.
            </p>
          </div>

          <div style="text-align: center; padding-top: 16px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 11px; margin-top: 24px;">
            Generated automatically by MC Tracker • All rights reserved © 2026
          </div>
        </div>
      `,
    });

    console.log("[Gmail SMTP] Month-End Email dispatched successfully:", info.messageId);
    return NextResponse.json({ success: true, messageId: info.messageId, recipient: targetEmail });
  } catch (error: any) {
    console.error("[Gmail SMTP Error]:", error);
    return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 });
  }
}
