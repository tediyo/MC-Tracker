import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { MailerService } from "@nestjs-modules/mailer";
import { Resend } from "resend";
import * as handlebars from "handlebars";
import * as fs from "fs";
import * as path from "path";

interface DailyReminderContext {
  email: string;
  dateLabel: string;
}

interface WeeklySummaryContext {
  email: string;
  weekLabel: string;
  totalIncome: number;
  totalCost: number;
  netProfitLoss: number;
  costByCategory: Record<string, number>;
}

interface MonthlySummaryContext extends WeeklySummaryContext {
  targetCostLimit: number | null;
  targetSavingsGoal: number | null;
}

interface OverBudgetAlertContext {
  email: string;
  monthLabel: string;
  targetCostLimit: number;
  totalCost: number;
  overBy: number;
}

function formatUsd(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

/**
 * Thin wrapper around MailerService and Resend - one method per notification type,
 * rendering Handlebars templates. Automatically uses Resend (HTTPS Port 443) when
 * RESEND_API_KEY is configured, bypassing cloud provider SMTP port restrictions.
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly webAppUrl: string;
  private readonly resendClient: Resend | null = null;
  private readonly fromAddress: string;
  private readonly brevoApiKey: string | null = null;
  private readonly brevoFromEmail: string;
  private readonly brevoFromName: string;
  private readonly templatesDir: string;

  constructor(
    private readonly mailer: MailerService,
    config: ConfigService,
  ) {
    this.webAppUrl = config.get<string>("WEB_APP_URL", "http://localhost:3000");

    const brevoKey = config.get<string>("BREVO_API_KEY");
    if (brevoKey) {
      this.brevoApiKey = brevoKey;
      this.logger.log("[MailService] Brevo HTTPS transport initialized (Port 443)");
    }
    this.brevoFromEmail = config.get<string>("BREVO_FROM_EMAIL") || "mctrackernotification@gmail.com";
    this.brevoFromName = config.get<string>("BREVO_FROM_NAME") || "MC Tracker";

    const resendApiKey = config.get<string>("RESEND_API_KEY");
    if (resendApiKey) {
      this.resendClient = new Resend(resendApiKey);
      this.logger.log("[MailService] Resend HTTPS transport initialized");
    }
    this.fromAddress = config.get<string>("RESEND_FROM") || "MC Tracker <onboarding@resend.dev>";
    this.templatesDir = path.join(__dirname, "templates");
  }

  async sendDailyReminder(ctx: DailyReminderContext): Promise<void> {
    await this.send(ctx.email, "Log today's costs on MC Tracker", "daily-reminder", {
      dateLabel: ctx.dateLabel,
      costsUrl: `${this.webAppUrl}/costs`,
    });
  }

  async sendWeeklySummary(ctx: WeeklySummaryContext): Promise<void> {
    await this.send(ctx.email, `Your weekly summary - ${ctx.weekLabel}`, "weekly-summary", {
      weekLabel: ctx.weekLabel,
      totalIncome: formatUsd(ctx.totalIncome),
      totalCost: formatUsd(ctx.totalCost),
      netProfitLoss: formatUsd(ctx.netProfitLoss),
      costByCategory: Object.entries(ctx.costByCategory).map(([category, amount]) => ({
        category,
        amount: formatUsd(amount),
      })),
      dashboardUrl: `${this.webAppUrl}/dashboard`,
    });
  }

  async sendMonthlySummary(ctx: MonthlySummaryContext): Promise<void> {
    await this.send(ctx.email, `Your monthly summary - ${ctx.weekLabel}`, "monthly-summary", {
      monthLabel: ctx.weekLabel,
      totalIncome: formatUsd(ctx.totalIncome),
      totalCost: formatUsd(ctx.totalCost),
      netProfitLoss: formatUsd(ctx.netProfitLoss),
      targetCostLimit: ctx.targetCostLimit !== null ? formatUsd(ctx.targetCostLimit) : null,
      targetSavingsGoal: ctx.targetSavingsGoal !== null ? formatUsd(ctx.targetSavingsGoal) : null,
      costByCategory: Object.entries(ctx.costByCategory).map(([category, amount]) => ({
        category,
        amount: formatUsd(amount),
      })),
      dashboardUrl: `${this.webAppUrl}/dashboard`,
    });
  }

  async sendOverBudgetAlert(ctx: OverBudgetAlertContext): Promise<boolean> {
    return await this.send(ctx.email, `You're over budget for ${ctx.monthLabel}`, "over-budget-alert", {
      monthLabel: ctx.monthLabel,
      targetCostLimit: formatUsd(ctx.targetCostLimit),
      totalCost: formatUsd(ctx.totalCost),
      overBy: formatUsd(ctx.overBy),
      plansUrl: `${this.webAppUrl}/plans`,
    });
  }

  private async send(
    to: string,
    subject: string,
    template: string,
    context: Record<string, unknown>,
  ): Promise<boolean> {
    try {
      // 1. Compile template with Handlebars
      let html = "";
      try {
        const filePath = path.join(this.templatesDir, `${template}.hbs`);
        if (fs.existsSync(filePath)) {
          const source = fs.readFileSync(filePath, "utf-8");
          html = handlebars.compile(source)(context);
        }
      } catch (err: any) {
        this.logger.warn(`Failed to render template "${template}": ${err.message}`);
      }

      // 2. Dispatch via Brevo HTTPS API (Port 443 - free, no domain verification required, sends to any recipient)
      if (this.brevoApiKey) {
        try {
          const res = await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
              "api-key": this.brevoApiKey,
              "Content-Type": "application/json",
              "Accept": "application/json",
            },
            body: JSON.stringify({
              sender: {
                name: this.brevoFromName,
                email: this.brevoFromEmail,
              },
              to: [{ email: to }],
              subject,
              htmlContent: html || `<p>${subject}</p>`,
            }),
          });

          if (res.ok) {
            const data = await res.json().catch(() => ({}));
            this.logger.log(`Email "${template}" dispatched via Brevo to ${to} (MessageId: ${(data as any)?.messageId})`);
            return true;
          } else {
            const errData = await res.json().catch(() => ({}));
            this.logger.error(`Brevo failed to send "${template}" to ${to}: ${JSON.stringify(errData)}`);
          }
        } catch (err: any) {
          this.logger.error(`Brevo network error: ${err.message}`);
        }
      }

      // 3. Dispatch via Resend HTTPS API (if configured)
      if (this.resendClient) {
        try {
          const { data, error } = await this.resendClient.emails.send({
            from: this.fromAddress,
            to,
            subject,
            html: html || `<p>${subject}</p>`,
          });

          if (!error) {
            this.logger.log(`Email "${template}" dispatched via Resend to ${to} (ID: ${data?.id})`);
            return true;
          } else {
            this.logger.error(`Resend failed to send "${template}" to ${to}: ${error.message}`);
          }
        } catch (err: any) {
          this.logger.error(`Resend network error: ${err.message}`);
        }
      }

      // 4. Fallback to nodemailer SMTP (local dev)
      try {
        await this.mailer.sendMail({ to, subject, template, context });
        return true;
      } catch (smtpErr: any) {
        this.logger.error(`SMTP fallback failed: ${smtpErr.message}`);
      }

      return false;
    } catch (error) {
      // A failed send for one user must never abort the rest of a cron
      // run's loop over every user - log and move on.
      this.logger.error(`Failed to send "${template}" to ${to}: ${(error as Error).message}`);
      return false;
    }
  }
}
