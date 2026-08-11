import { Module } from "@nestjs/common";
import { MailModule } from "../mail/mail.module";
import { NotificationsCoreModule } from "../notifications/notifications-core.module";
import { BudgetAlertsController } from "./budget-alerts.controller";
import { BudgetAlertsService } from "./budget-alerts.service";

@Module({
  imports: [NotificationsCoreModule, MailModule],
  controllers: [BudgetAlertsController],
  providers: [BudgetAlertsService],
  exports: [BudgetAlertsService],
})
export class BudgetAlertsModule {}
