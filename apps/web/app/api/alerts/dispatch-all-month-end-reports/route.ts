import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";
import { isLastDayOfMonth, format, startOfMonth, endOfMonth } from "date-fns";
import {
  isLastDayOfEthiopianMonth,
  getEthiopianDate,
  getEthiopianMonthLabel,
  toGregorianDate,
  getDaysInEthiopianMonth,
} from "@mc-tracker/shared-types";
import { generateMonthlyReportPdf } from "@/lib/reports/generate-monthly-report-pdf";

const EMAIL_USER = process.env.EMAIL_USER || "mctrackernotification@gmail.com";
const EMAIL_PASS = process.env.EMAIL_PASS || "kmcveektvwxiqroo";

export async function POST(req: Request) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // Empty body is allowed
    }

    const url = new URL(req.url);
    const onlyIfMonthEnd = url.searchParams.get("onlyIfMonthEnd") === "true" || body.onlyIfMonthEnd === true;
    const now = new Date();
    const isGregorianMonthEnd = isLastDayOfMonth(now);
    const isEthiopianMonthEnd = isLastDayOfEthiopianMonth(now);

    if (onlyIfMonthEnd && !isGregorianMonthEnd && !isEthiopianMonthEnd) {
      return NextResponse.json({
        success: true,
        skipped: true,
        message: "Automated schedule skipped: Today is neither Gregorian nor Ethiopian month-end.",
        isGregorianMonthEnd,
        isEthiopianMonthEnd,
        dateChecked: now.toISOString(),
      });
    }

    const dryRun = body.dryRun ?? (url.searchParams.get("dryRun") === "true");
    const targetUserId = body.targetUserId || url.searchParams.get("targetUserId") || undefined;



    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://slmakefgxtupbpdolxib.supabase.co";
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!serviceRoleKey) {
      return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY is required for batch dispatch" }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    // 1. Fetch all registered users
    const { data: usersData, error: usersError } = await supabaseAdmin.auth.admin.listUsers({
      perPage: 1000,
    });

    if (usersError || !usersData) {
      return NextResponse.json({ error: usersError?.message || "Failed to list users" }, { status: 500 });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    });

    const results: {
      sent: Array<{ email: string; totalIncome: number; totalCosts: number; netProfitLoss: number; messageId?: string }>;
      skipped: Array<{ email?: string; reason: string }>;
    } = {
      sent: [],
      skipped: [],
    };

    const usersToProcess = targetUserId
      ? usersData.users.filter((u) => u.id === targetUserId)
      : usersData.users;

    for (const user of usersToProcess) {
      const email = user.email?.trim();

      // Skip invalid or placeholder dummy emails
      if (!email || email.endsWith("@example.com") || email.includes("ui-review")) {
        results.skipped.push({ email: email || "unknown", reason: "Dummy/invalid email" });
        continue;
      }

      // Respect the user's configured calendar preference (defaults to ethiopian)
      const userCalendarMode: "ethiopian" | "gregorian" =
        (user.user_metadata?.calendar_mode as any) === "gregorian" ? "gregorian" : "ethiopian";

      // If scheduled cron run, verify if today is the month-end for THIS user's chosen calendar:
      if (onlyIfMonthEnd) {
        if (userCalendarMode === "gregorian" && !isGregorianMonthEnd) {
          results.skipped.push({ email, reason: "Skipped: Today is not Gregorian month-end for user on Gregorian calendar" });
          continue;
        }
        if (userCalendarMode === "ethiopian" && !isEthiopianMonthEnd) {
          results.skipped.push({ email, reason: "Skipped: Today is not Ethiopian month-end for user on Ethiopian calendar" });
          continue;
        }
      }

      // Compute dynamic period label based on user's calendar mode
      let userPeriodLabel = body.periodLabel || url.searchParams.get("periodLabel");
      if (!userPeriodLabel) {
        if (userCalendarMode === "gregorian") {
          userPeriodLabel = format(now, "MMMM yyyy");
        } else {
          userPeriodLabel = getEthiopianMonthLabel(now);
        }
      }

      // 2. Fetch all user transactions & plan
      const [{ data: userCosts }, { data: userIncomes }, { data: userPlans }] = await Promise.all([
        supabaseAdmin.from("costs").select("amount, category, subcategory, date").eq("user_id", user.id),
        supabaseAdmin.from("incomes").select("amount, date").eq("user_id", user.id),
        supabaseAdmin.from("plans").select("target_cost_limit, month, year").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1),
      ]);

      const costsList = userCosts || [];
      const incomesList = userIncomes || [];

      // Calculate totals & subcategory breakdown
      const totalCosts = costsList.reduce((acc, c) => acc + Number(c.amount || 0), 0);
      const totalIncome = incomesList.reduce((acc, i) => acc + Number(i.amount || 0), 0);
      const netProfitLoss = totalIncome - totalCosts;

      let basicCost = 0;
      let fancyCost = 0;
      let extraCost = 0;
      const subcategoryMap: Record<string, { subcategory: string; category: string; amount: number }> = {};

      for (const cost of costsList) {
        const amt = Number(cost.amount || 0);
        if (cost.category === "basic") basicCost += amt;
        else if (cost.category === "fancy") fancyCost += amt;
        else if (cost.category === "extra") extraCost += amt;

        const subKey = (cost.subcategory || "other").toLowerCase();
        const catKey = cost.category || "basic";
        if (!subcategoryMap[subKey]) {
          subcategoryMap[subKey] = { subcategory: subKey, category: catKey, amount: 0 };
        }
        subcategoryMap[subKey].amount += amt;
      }

      const subcategoryCosts = Object.values(subcategoryMap).sort((a, b) => b.amount - a.amount);

      const activePlan = userPlans && userPlans.length > 0 ? userPlans[0] : null;
      const costLimit = activePlan?.target_cost_limit ? Number(activePlan.target_cost_limit) : undefined;

      const cleanPeriodName = userPeriodLabel.replace(/[^a-zA-Z0-9_-]/g, "_");
      const pdfFilename = `MC-Tracker-Monthly-Report-${cleanPeriodName}.pdf`;

      // 3. Generate customized PDF report with subcategory breakdown
      const pdfBytes = await generateMonthlyReportPdf({
        periodLabel: userPeriodLabel,
        totalIncome,
        totalCosts,
        netProfitLoss,
        costLimit,
        basicCost,
        fancyCost,
        extraCost,
        subcategoryCosts,
      });

      if (dryRun) {
        results.sent.push({
          email,
          totalIncome,
          totalCosts,
          netProfitLoss,
          messageId: `DRY_RUN (${userCalendarMode.toUpperCase()}: ${userPeriodLabel})`,
        });
        continue;
      }

      const isProfit = netProfitLoss >= 0;
      const netLabel = isProfit ? "Net Profit" : "Net Loss";
      const netColor = isProfit ? "#10b981" : "#ef4444";

      // 4. Dispatch email with PDF attachment to user's registered email
      const info = await transporter.sendMail({
        from: `"MC Tracker Reports" <${EMAIL_USER}>`,
        to: email,
        subject: `📅 Month-End Financial Summary (${userPeriodLabel}) - MC Tracker`,
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
                  ${userPeriodLabel}
                </div>
              </div>
            </div>

            <div style="padding: 20px 0;">
              <p>Hello,</p>
              <p>Here is your complete personal month-end financial summary report for <strong>${userPeriodLabel}</strong>.</p>
              
              <table style="width: 100%; border-collapse: separate; border-spacing: 10px; margin: 20px 0;">
                <tr>
                  <td style="background: #f0fdf4; padding: 14px; border-radius: 10px; border: 1px solid #bbf7d0; width: 50%;">
                    <div style="font-size: 11px; color: #15803d; font-weight: bold; text-transform: uppercase;">Total Income</div>
                    <div style="font-size: 20px; font-weight: 800; color: #166534; margin-top: 4px;">ETB ${Number(totalIncome).toFixed(2)}</div>
                  </td>
                  <td style="background: #fef2f2; padding: 14px; border-radius: 10px; border: 1px solid #fecaca; width: 50%;">
                    <div style="font-size: 11px; color: #b91c1c; font-weight: bold; text-transform: uppercase;">Total Costs</div>
                    <div style="font-size: 20px; font-weight: 800; color: #991b1b; margin-top: 4px;">ETB ${Number(totalCosts).toFixed(2)}</div>
                  </td>
                </tr>
                <tr>
                  <td style="background: #eff6ff; padding: 14px; border-radius: 10px; border: 1px solid #bfdbfe; width: 50%;">
                    <div style="font-size: 11px; color: #1d4ed8; font-weight: bold; text-transform: uppercase;">${netLabel}</div>
                    <div style="font-size: 20px; font-weight: 800; color: ${netColor}; margin-top: 4px;">ETB ${Number(netProfitLoss).toFixed(2)}</div>
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
                    ${subcategoryCosts.length > 0 ? subcategoryCosts.map((item, idx) => {
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
                     
                    </td>
                  </tr>
                </table>
              </div>

              <p style="color: #475569; font-size: 13px; line-height: 1.5;">
                Log into MC Tracker to view interactive charts, category breakdowns, and manage your budget goals.
              </p>
            </div>

            <div style="text-align: center; padding-top: 16px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 11px; margin-top: 24px;">
              Generated automatically by MC Tracker • All rights reserved © 2026
            </div>
          </div>
        `,
      });

      console.log(`[Batch Email] Dispatched to ${email} (Message ID: ${info.messageId})`);
      results.sent.push({
        email,
        totalIncome,
        totalCosts,
        netProfitLoss,
        messageId: info.messageId,
      });
    }

    return NextResponse.json({
      success: true,
      sender: EMAIL_USER,
      isGregorianMonthEnd,
      isEthiopianMonthEnd,
      totalProcessed: usersToProcess.length,
      sentCount: results.sent.length,
      skippedCount: results.skipped.length,
      details: results,
    });
  } catch (error: any) {
    console.error("[Batch Email Error]:", error);
    return NextResponse.json({ error: error.message || "Internal error during batch dispatch" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  return POST(req);
}

