import type { CostRow } from "@mc-tracker/shared-types";

/**
 * Shape of a Supabase Database Webhook payload for a `costs` INSERT.
 * https://supabase.com/docs/guides/database/webhooks
 */
export interface CostsInsertWebhookPayload {
  type: "INSERT";
  table: "costs";
  schema: "public";
  record: CostRow;
  old_record: null;
}
