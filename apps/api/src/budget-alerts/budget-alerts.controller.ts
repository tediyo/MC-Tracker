import { Body, Controller, HttpCode, HttpStatus, Logger, Post, UseGuards } from "@nestjs/common";
import { WebhookSecretGuard } from "../common/guards/webhook-secret.guard";
import { BudgetAlertsService } from "./budget-alerts.service";
import type { CostsInsertWebhookPayload } from "./dto/costs-insert-webhook.dto";

/**
 * Target for the Supabase Database Webhook configured on `costs` INSERT
 * (see docs/SETUP.md). This is the mechanism chosen for the instant
 * over-budget alert specifically because it fires as part of the insert's
 * server-side trigger, independent of whether the browser tab that made
 * the request is still open.
 */
@Controller("webhooks")
export class BudgetAlertsController {
  private readonly logger = new Logger(BudgetAlertsController.name);

  constructor(private readonly budgetAlerts: BudgetAlertsService) {}

  @Post("costs-insert")
  @UseGuards(WebhookSecretGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async handleCostsInsert(@Body() payload: CostsInsertWebhookPayload): Promise<void> {
    if (payload.type !== "INSERT" || payload.table !== "costs") return;

    try {
      await this.budgetAlerts.checkAndAlert(payload.record);
    } catch (error) {
      // Never let a failed alert check surface as a webhook error back to
      // Supabase - log it. The daily-reminder cron's own budget check
      // (documented as a same-day safety net) covers a missed webhook call.
      this.logger.error(`Over-budget check failed: ${(error as Error).message}`);
    }
  }
}
