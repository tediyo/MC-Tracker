import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { APP_TIMEZONE } from "../../config/app-timezone";
import { NotificationsService } from "../notifications.service";
import { MailService } from "../../mail/mail.service";

/**
 * Every hour, all 24 hours (per the literal spec): re-run the same "missing
 * a cost entry for today" query as the daily reminder. This is stateless by
 * construction - there is no separate "last reminded" tracking table -
 * because the query itself is the stopping condition: once a user logs a
 * cost for today, they simply drop out of the next hour's result set and
 * stop receiving this email.
 */
@Injectable()
export class HourlyEscalationJob {
  private readonly logger = new Logger(HourlyEscalationJob.name);

  constructor(
    private readonly notifications: NotificationsService,
    private readonly mail: MailService,
  ) {}

  @Cron("0 * * * *", { name: "hourly-escalation", timeZone: APP_TIMEZONE })
  async handle(): Promise<void> {
    const today = toZonedTime(new Date(), APP_TIMEZONE);
    const todayIso = format(today, "yyyy-MM-dd");
    const dateLabel = format(today, "MMMM d, yyyy");

    const missing = await this.notifications.getUsersMissingCostForDate(todayIso);
    this.logger.log(`Hourly escalation: ${missing.length} user(s) still missing a cost entry for ${todayIso}`);

    for (const user of missing) {
      await this.mail.sendDailyReminder({ email: user.email, dateLabel });
    }
  }
}
