// One-off manual verification that the mail transport (SMTP/OAuth2 or Gmail
// App Password, whichever MailModule picked based on env) actually delivers.
// Not part of the app's runtime - run it directly with `pnpm send-test-email`.
//
// Sends one real email per template (daily reminder, weekly summary, monthly
// summary, over-budget alert) to NOTIFICATION_EMAIL using MailService, so a
// successful run here means every notification the cron jobs send will work.
import "dotenv/config";
import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { Logger } from "@nestjs/common";
import { AppModule } from "../src/app.module";
import { MailService } from "../src/mail/mail.service";

const sampleCostByCategory = { Food: 120.5, Transport: 45, Rent: 600, Utilities: 80.25 };

async function main() {
  const to = process.env.NOTIFICATION_EMAIL;
  if (!to) {
    throw new Error("NOTIFICATION_EMAIL is not set in apps/api/.env");
  }

  const app = await NestFactory.createApplicationContext(AppModule);
  const logger = new Logger("SendTestEmail");
  try {
    const mail = app.get(MailService);

    logger.log("Sending daily-reminder...");
    await mail.sendDailyReminder({
      email: to,
      dateLabel: new Date().toLocaleDateString("en-US", { dateStyle: "long" }),
    });

    logger.log("Sending weekly-summary...");
    await mail.sendWeeklySummary({
      email: to,
      weekLabel: "Aug 4 - Aug 10, 2026",
      totalIncome: 1500,
      totalCost: 845.75,
      netProfitLoss: 654.25,
      costByCategory: sampleCostByCategory,
    });

    logger.log("Sending monthly-summary...");
    await mail.sendMonthlySummary({
      email: to,
      weekLabel: "July 2026",
      totalIncome: 6000,
      totalCost: 3382.4,
      netProfitLoss: 2617.6,
      targetCostLimit: 3500,
      targetSavingsGoal: 2000,
      costByCategory: sampleCostByCategory,
    });

    logger.log("Sending over-budget-alert...");
    await mail.sendOverBudgetAlert({
      email: to,
      monthLabel: "August 2026",
      targetCostLimit: 3500,
      totalCost: 3782.4,
      overBy: 282.4,
    });

    logger.log(`All 4 test emails sent to ${to} (check MailService logs above for any per-send failures).`);
  } finally {
    await app.close();
  }
}

main().catch((error) => {
  Logger.error(error instanceof Error ? error.message : String(error), "SendTestEmail");
  process.exit(1);
});
