import { Injectable } from "@nestjs/common";
import type { GetPeriodSummaryRow, GetUsersMissingCostRow, PlanRow, UserRow } from "@mc-tracker/shared-types";
import { SupabaseService } from "../supabase/supabase.service";

/**
 * Thin wrapper around the two shared Postgres RPC functions
 * (get_users_missing_cost_for_date, get_period_summary - see
 * supabase/migrations/..._create_reporting_functions.sql) plus the couple
 * of plain-table reads the cron jobs need. Everything here uses the
 * service-role client (SupabaseService), so it sees every user regardless
 * of RLS.
 */
@Injectable()
export class NotificationsService {
  constructor(private readonly supabase: SupabaseService) {}

  async getUsersMissingCostForDate(targetDateIso: string): Promise<GetUsersMissingCostRow[]> {
    const { data, error } = await this.supabase
      .getClient()
      .rpc("get_users_missing_cost_for_date", { target_date: targetDateIso });
    if (error) throw error;
    return data ?? [];
  }

  async getAllUsers(): Promise<UserRow[]> {
    const { data, error } = await this.supabase.getClient().from("users").select("*");
    if (error) throw error;
    return data ?? [];
  }

  async getPeriodSummary(userId: string, startIso: string, endIso: string): Promise<GetPeriodSummaryRow> {
    const { data, error } = await this.supabase
      .getClient()
      .rpc("get_period_summary", { p_user_id: userId, p_start: startIso, p_end: endIso });
    if (error) throw error;
    const [row] = data ?? [];
    return row ?? { total_income: 0, total_cost: 0, cost_by_category: {} };
  }

  async getPlanForMonth(userId: string, year: number, month: number): Promise<PlanRow | null> {
    const { data, error } = await this.supabase
      .getClient()
      .from("plans")
      .select("*")
      .eq("user_id", userId)
      .eq("year", year)
      .eq("month", month)
      .maybeSingle();
    if (error) throw error;
    return data ?? null;
  }

  async getUserById(userId: string): Promise<UserRow | null> {
    const { data, error } = await this.supabase.getClient().from("users").select("*").eq("id", userId).maybeSingle();
    if (error) throw error;
    return data ?? null;
  }
}
