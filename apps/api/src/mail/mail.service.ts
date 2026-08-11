import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { MailerService } from "@nestjs-modules/mailer";

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
 * Thin wrapper around MailerService - one method per notification type,
 * each rendering its own Handlebars template. Kept intentionally simple:
 * callers (the cron jobs / budget-alerts service) build the context object,
 * this just renders + sends + logs failures without throwing (a failed
 * send for one user should never take down the whole cron run).
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly webAppUrl: string;

  constructor(
    private readonly mailer: MailerService,
    config: ConfigService,
  ) {
    this.webAppUrl = config.get<string>("WEB_APP_URL", "http://localhost:3000");
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

  async sendOverBudgetAlert(ctx: OverBudgetAlertContext): Promise<void> {
    await this.send(ctx.email, `You're over budget for ${ctx.monthLabel}`, "over-budget-alert", {
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
  ): Promise<void> {
    try {
      await this.mailer.sendMail({ to, subject, template, context });
    } catch (error) {
      // A failed send for one user must never abort the rest of a cron
      // run's loop over every user - log and move on.
      this.logger.error(`Failed to send "${template}" to ${to}: ${(error as Error).message}`);
    }
  }
}
