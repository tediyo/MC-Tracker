import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@mc-tracker/shared-types";

/**
 * Holds the single service-role Supabase client used by every cron job,
 * the webhook receiver, and the account-deletion endpoint. The
 * service-role key bypasses RLS entirely - that's required here (cron jobs
 * scan across every user's data) - and this client must never be
 * constructed with anything other than the service-role key, and never be
 * reachable from apps/web.
 */
@Injectable()
export class SupabaseService {
  private readonly client: SupabaseClient<Database>;

  constructor(config: ConfigService) {
    this.client = createClient<Database>(
      config.getOrThrow<string>("SUPABASE_URL"),
      config.getOrThrow<string>("SUPABASE_SERVICE_ROLE_KEY"),
      { auth: { autoRefreshToken: false, persistSession: false } },
    );
  }

  getClient(): SupabaseClient<Database> {
    return this.client;
  }
}
