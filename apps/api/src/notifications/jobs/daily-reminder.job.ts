import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { APP_TIMEZONE } from "../../config/app-timezone";
import { NotificationsService } from "../notifications.service";
import { MailService } from "../../mail/mail.service";
import { BudgetAlertsService } from "../../budget-alerts/budget-alerts.service";

/**
 * Every day at 11:30 PM (APP_TIMEZONE):
 *  1. Email every user who hasn't logged a single cost row for today yet.
 *  2. Re-run the over-budget check for every user as a same-day safety net
 *     (see BudgetAlertsService's doc comment) - the Database Webhook is the
 *     primary trigger for that alert, this just catches a missed delivery.
 */
@Injectable()
export class DailyReminderJob {
  private readonly logger = new Logger(DailyReminderJob.name);

  constructor(
    private readonly notifications: NotificationsService,
    private readonly mail: MailService,
    private readonly budgetAlerts: BudgetAlertsService,
  ) {}

  @Cron("30 23 * * *", { name: "daily-reminder", timeZone: APP_TIMEZONE })
  async handle(): Promise<void> {
    const today = toZonedTime(new Date(), APP_TIMEZONE);
    const todayIso = format(today, "yyyy-MM-dd");
    const dateLabel = format(today, "MMMM d, yyyy");

    const missing = await this.notifications.getUsersMissingCostForDate(todayIso);
    this.logger.log(`${missing.length} user(s) missing a cost entry for ${todayIso}`);
    for (const user of missing) {
      await this.mail.sendDailyReminder({ email: user.email, dateLabel });
    }

    await this.runOverBudgetSafetyNet(today);
  }

  private async runOverBudgetSafetyNet(today: Date): Promise<void> {
    const users = await this.notifications.getAllUsers();
    for (const user of users) {
      try {
        await this.budgetAlerts.checkAndAlertForUserMonth(user.id, today);
      } catch (error) {
        this.logger.error(`Over-budget safety-net check failed for ${user.id}: ${(error as Error).message}`);
      }
    }
  }
}
