import { Module } from "@nestjs/common";
import { MailModule } from "../mail/mail.module";
import { NotificationsCoreModule } from "./notifications-core.module";
import { BudgetAlertsModule } from "../budget-alerts/budget-alerts.module";
import { DailyReminderJob } from "./jobs/daily-reminder.job";
import { MonthlySummaryJob } from "./jobs/monthly-summary.job";

@Module({
  imports: [NotificationsCoreModule, MailModule, BudgetAlertsModule],
  providers: [DailyReminderJob, MonthlySummaryJob],
})
export class NotificationsModule {}
