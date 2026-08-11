import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { endOfWeek, format, startOfWeek } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { APP_TIMEZONE } from "../../config/app-timezone";
import { NotificationsService } from "../notifications.service";
import { MailService } from "../../mail/mail.service";

// ISO week (Monday-Sunday) - matches packages/shared-types/src/calculations/period.ts's WEEK_STARTS_ON.
const WEEK_STARTS_ON = 1 as const;

/** Every Sunday at 8:00 PM (APP_TIMEZONE): email every user their weekly income/cost breakdown. */
@Injectable()
export class WeeklySummaryJob {
  private readonly logger = new Logger(WeeklySummaryJob.name);

  constructor(
    private readonly notifications: NotificationsService,
    private readonly mail: MailService,
  ) {}

  @Cron("0 20 * * 0", { name: "weekly-summary", timeZone: APP_TIMEZONE })
  async handle(): Promise<void> {
    const now = toZonedTime(new Date(), APP_TIMEZONE);
    const start = startOfWeek(now, { weekStartsOn: WEEK_STARTS_ON });
    const end = endOfWeek(now, { weekStartsOn: WEEK_STARTS_ON });
    const startIso = format(start, "yyyy-MM-dd");
    const endIso = format(end, "yyyy-MM-dd");
    const weekLabel = `Week of ${format(start, "MMM d, yyyy")}`;

    const users = await this.notifications.getAllUsers();
    this.logger.log(`Weekly summary: sending to ${users.length} user(s) for ${weekLabel}`);

    for (const user of users) {
      const summary = await this.notifications.getPeriodSummary(user.id, startIso, endIso);
      const costByCategory = (summary.cost_by_category ?? {}) as Record<string, number>;
      await this.mail.sendWeeklySummary({
        email: user.email,
        weekLabel,
        totalIncome: Number(summary.total_income),
        totalCost: Number(summary.total_cost),
        netProfitLoss: Number(summary.total_income) - Number(summary.total_cost),
        costByCategory,
      });
    }
  }
}
