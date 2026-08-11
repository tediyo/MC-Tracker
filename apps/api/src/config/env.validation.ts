import { z } from "zod";

/**
 * Validated once at startup (wired into ConfigModule.forRoot's `validate`
 * option in app.module.ts) so a missing/malformed env var fails fast with
 * a clear message instead of surfacing as a confusing runtime error the
 * first time a cron job or the webhook fires.
 */
export const envSchema = z.object({
  PORT: z.coerce.number().default(3001),
  APP_TIMEZONE: z.string().default("Africa/Addis_Ababa"),

  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  SUPABASE_JWT_SECRET: z.string().min(1),
  SUPABASE_WEBHOOK_SECRET: z.string().min(1),

  GMAIL_USER: z.string().email(),
  GOOGLE_OAUTH_CLIENT_ID: z.string().optional().default(""),
  GOOGLE_OAUTH_CLIENT_SECRET: z.string().optional().default(""),
  GOOGLE_OAUTH_REFRESH_TOKEN: z.string().optional().default(""),
  GMAIL_APP_PASSWORD: z.string().optional().default(""),
  SMTP_HOST: z.string().default("smtp.gmail.com"),
  SMTP_PORT: z.coerce.number().default(465),
  MAIL_FROM: z.string().default("MC Tracker <no-reply@example.com>"),

  WEB_APP_URL: z.string().url().default("http://localhost:3000"),
});

export type EnvConfig = z.infer<typeof envSchema>;

export function validateEnv(rawConfig: Record<string, unknown>): EnvConfig {
  const parsed = envSchema.safeParse(rawConfig);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`).join("\n");
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }
  return parsed.data;
}
