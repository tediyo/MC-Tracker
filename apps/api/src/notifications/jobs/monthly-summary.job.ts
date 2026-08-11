import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { endOfMonth, format, isLastDayOfMonth, startOfMonth } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { APP_TIMEZONE } from "../../config/app-timezone";
import { NotificationsService } from "../notifications.service";
import { MailService } from "../../mail/mail.service";

/**
 * `@nestjs/schedule`'s cron parser has no native "last day of month"
 * pattern, so this runs every day at 9:00 PM (APP_TIMEZONE) and
 * short-circuits unless today actually is the last calendar day of the
 * month - `date-fns`'s `isLastDayOfMonth` handles Feb 28/29 correctly, so
 * there's no hand-rolled date math to get wrong.
 */
@Injectable()
export class MonthlySummaryJob {
  private readonly logger = new Logger(MonthlySummaryJob.name);

  constructor(
    private readonly notifications: NotificationsService,
    private readonly mail: MailService,
  ) {}

  @Cron("0 21 * * *", { name: "monthly-summary-check", timeZone: APP_TIMEZONE })
  async handle(): Promise<void> {
    const now = toZonedTime(new Date(), APP_TIMEZONE);
    if (!isLastDayOfMonth(now)) return;

    const start = startOfMonth(now);
    const end = endOfMonth(now);
    const startIso = format(start, "yyyy-MM-dd");
    const endIso = format(end, "yyyy-MM-dd");
    const monthLabel = format(now, "MMMM yyyy");
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    const users = await this.notifications.getAllUsers();
    this.logger.log(`Monthly summary: sending to ${users.length} user(s) for ${monthLabel}`);

    for (const user of users) {
      const [summary, plan] = await Promise.all([
        this.notifications.getPeriodSummary(user.id, startIso, endIso),
        this.notifications.getPlanForMonth(user.id, year, month),
      ]);
      const costByCategory = (summary.cost_by_category ?? {}) as Record<string, number>;
      const totalIncome = Number(summary.total_income);
      const totalCost = Number(summary.total_cost);

      await this.mail.sendMonthlySummary({
        email: user.email,
        weekLabel: monthLabel,
        totalIncome,
        totalCost,
        netProfitLoss: totalIncome - totalCost,
        costByCategory,
        targetCostLimit: plan ? Number(plan.target_cost_limit) : null,
        targetSavingsGoal: plan ? Number(plan.target_savings_goal) : null,
      });
    }
  }
}
