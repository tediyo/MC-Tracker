import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { endOfMonth, format, isLastDayOfMonth, startOfMonth } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import {
  isLastDayOfEthiopianMonth,
  getEthiopianDate,
  getEthiopianMonthLabel,
  toGregorianDate,
  getDaysInEthiopianMonth,
} from "@mc-tracker/shared-types";
import { APP_TIMEZONE } from "../../config/app-timezone";
import { NotificationsService } from "../notifications.service";
import { MailService } from "../../mail/mail.service";

/**
 * Runs daily at 9:00 PM (APP_TIMEZONE).
 * Dynamically checks whether today is the last calendar day of either the
 * Ethiopian month (E.C.) or Gregorian month (G.C.), and dispatches
 * personalized summaries to each user according to their configured calendar toggle.
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
    const isGregorianEnd = isLastDayOfMonth(now);
    const isEthiopianEnd = isLastDayOfEthiopianMonth(now);

    if (!isGregorianEnd && !isEthiopianEnd) return;

    const users = await this.notifications.getAllUsers();
    this.logger.log(`Monthly summary: checking ${users.length} user(s) (GregorianEnd: ${isGregorianEnd}, EthiopianEnd: ${isEthiopianEnd})`);

    for (const user of users) {
      const mode = (user.user_metadata?.calendar_mode || "ethiopian").toLowerCase();
      if (mode === "gregorian" && !isGregorianEnd) continue;
      if (mode === "ethiopian" && !isEthiopianEnd) continue;

      let monthLabel: string;
      let startIso: string;
      let endIso: string;
      let year: number;
      let month: number;

      if (mode === "gregorian") {
        const start = startOfMonth(now);
        const end = endOfMonth(now);
        startIso = format(start, "yyyy-MM-dd");
        endIso = format(end, "yyyy-MM-dd");
        monthLabel = format(now, "MMMM yyyy");
        year = now.getFullYear();
        month = now.getMonth() + 1;
      } else {
        const ethNow = getEthiopianDate(now);
        monthLabel = getEthiopianMonthLabel(ethNow);
        const startEth = toGregorianDate(ethNow.year, ethNow.month, 1);
        const endEth = toGregorianDate(ethNow.year, ethNow.month, getDaysInEthiopianMonth(ethNow.year, ethNow.month));
        startIso = format(startEth, "yyyy-MM-dd");
        endIso = format(endEth, "yyyy-MM-dd");
        year = ethNow.year;
        month = ethNow.month;
      }

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
