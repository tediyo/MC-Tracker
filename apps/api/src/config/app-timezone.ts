/**
 * Read directly from `process.env` (rather than via `ConfigService`)
 * because `@Cron`'s `timeZone` option is decorator metadata evaluated at
 * class-definition time, before Nest's DI container exists to inject a
 * ConfigService. `main.ts` loads `.env` via a bare `import "dotenv/config"`
 * as its very first line specifically so this value is already populated
 * by the time any cron job file is imported.
 */
export const APP_TIMEZONE = process.env.APP_TIMEZONE ?? "Africa/Addis_Ababa";
