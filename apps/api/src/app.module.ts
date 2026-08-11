import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import { validateEnv } from "./config/env.validation";
import { SupabaseModule } from "./supabase/supabase.module";
import { HealthModule } from "./health/health.module";
import { AccountModule } from "./account/account.module";
import { NotificationsModule } from "./notifications/notifications.module";
import { BudgetAlertsModule } from "./budget-alerts/budget-alerts.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    ScheduleModule.forRoot(),
    SupabaseModule,
    HealthModule,
    AccountModule,
    BudgetAlertsModule,
    NotificationsModule,
  ],
})
export class AppModule {}
