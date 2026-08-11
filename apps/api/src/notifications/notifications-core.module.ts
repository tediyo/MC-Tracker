import { Module } from "@nestjs/common";
import { NotificationsService } from "./notifications.service";

/**
 * Split out from NotificationsModule specifically to avoid a circular
 * module dependency: BudgetAlertsModule needs NotificationsService, and
 * NotificationsModule needs BudgetAlertsService (DailyReminderJob's
 * same-day over-budget safety net). Both feature modules import this
 * leaf module instead of importing each other.
 */
@Module({
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsCoreModule {}
