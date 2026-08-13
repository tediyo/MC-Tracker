import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@mc-tracker/shared-types";

/**
 * Browser Supabase client - used from Client Components for all direct
 * CRUD on incomes/costs/plans (relying on RLS for per-user isolation; see
 * the plan's core architecture decision). Auth *mutations* go through the
 * server client + Server Actions instead (lib/auth/actions.ts) so the
 * session cookie is set before any redirect.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";

  return createBrowserClient<Database>(url, anonKey);
}
