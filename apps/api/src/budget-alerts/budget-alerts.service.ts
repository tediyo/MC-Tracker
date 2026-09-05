import { Injectable, Logger } from "@nestjs/common";
import { endOfMonth, format, parseISO, startOfMonth } from "date-fns";
import {
  getEthiopianDate,
  getEthiopianMonthLabel,
  toGregorianDate,
  getDaysInEthiopianMonth,
} from "@mc-tracker/shared-types";
import type { CostRow } from "@mc-tracker/shared-types";
import { SupabaseService } from "../supabase/supabase.service";
import { NotificationsService } from "../notifications/notifications.service";
import { MailService } from "../mail/mail.service";

/**
 * Reacts to a `costs` INSERT (delivered via the Supabase Database Webhook,
 * see budget-alerts.controller.ts) by checking whether that user just
 * crossed their monthly `target_cost_limit`, and if so sending exactly one
 * alert for that plan/month - `plans.over_budget_alert_sent_at` is the
 * dedup flag, per the plan's "once per month, then silent" default.
 *
 * Also used as a same-day safety net from DailyReminderJob (see that
 * file): since the webhook's delivery guarantees aren't something to take
 * fully on faith, the daily reminder cron re-runs this same check for every
 * user each night, catching anything a missed webhook call would
 * otherwise silently drop.
 */
@Injectable()
export class BudgetAlertsService {
  private readonly logger = new Logger(BudgetAlertsService.name);

  constructor(
    private readonly supabase: SupabaseService,
    private readonly notifications: NotificationsService,
    private readonly mail: MailService,
  ) {}

  /**
   * Entry point from the webhook - derives (userId, referenceDate) from the
   * inserted row. Uses date-fns's `parseISO` rather than the native `new
   * Date(dateOnlyString)`, which the ES spec parses as UTC midnight - on a
   * server not running in UTC, reading local getters (getFullYear/getMonth)
   * off that would silently roll the date to the wrong day near midnight,
   * misattributing the cost to the wrong month right at a month boundary.
   * `parseISO` parses a date-only string as local midnight instead, which
   * is what every other date-fns call in this file already assumes.
   */
  async checkAndAlert(cost: CostRow): Promise<void> {
    await this.checkAndAlertForUserMonth(cost.user_id, parseISO(cost.date));
  }

  /** Entry point from the daily-reminder safety net - one user, one reference date. */
  async checkAndAlertForUserMonth(userId: string, referenceDate: Date): Promise<void> {
    const user = await this.notifications.getUserById(userId);
    if (!user) {
      this.logger.warn(`Over-budget check: no users row found for ${userId}`);
      return;
    }

    const mode = (user.user_metadata?.calendar_mode || "ethiopian").toLowerCase();

    let year: number;
    let month: number;
    let monthStartIso: string;
    let monthEndIso: string;
    let monthLabel: string;

    if (mode === "gregorian") {
      year = referenceDate.getFullYear();
      month = referenceDate.getMonth() + 1;
      monthStartIso = format(startOfMonth(referenceDate), "yyyy-MM-dd");
      monthEndIso = format(endOfMonth(referenceDate), "yyyy-MM-dd");
      monthLabel = format(referenceDate, "MMMM yyyy");
    } else {
      const ethDate = getEthiopianDate(referenceDate);
      year = ethDate.year;
      month = ethDate.month;
      monthLabel = getEthiopianMonthLabel(ethDate);
      const startEth = toGregorianDate(ethDate.year, ethDate.month, 1);
      const endEth = toGregorianDate(ethDate.year, ethDate.month, getDaysInEthiopianMonth(ethDate.year, ethDate.month));
      monthStartIso = format(startEth, "yyyy-MM-dd");
      monthEndIso = format(endEth, "yyyy-MM-dd");
    }

    const plan = await this.notifications.getPlanForMonth(userId, year, month);
    if (!plan) return; // no plan for this month - nothing to compare against
    if (plan.over_budget_alert_sent_at) return; // already alerted this month - see the plan's documented re-fire semantics

    const summary = await this.notifications.getPeriodSummary(userId, monthStartIso, monthEndIso);

    const totalCost = Number(summary.total_cost);
    const targetCostLimit = Number(plan.target_cost_limit);
    if (totalCost <= targetCostLimit) return;

    await this.mail.sendOverBudgetAlert({
      email: user.email,
      monthLabel,
      targetCostLimit,
      totalCost,
      overBy: totalCost - targetCostLimit,
    });

    const { error } = await this.supabase
      .getClient()
      .from("plans")
      .update({ over_budget_alert_sent_at: new Date().toISOString() })
      .eq("id", plan.id);
    if (error) this.logger.error(`Failed to stamp over_budget_alert_sent_at for plan ${plan.id}: ${error.message}`);
  }
}
