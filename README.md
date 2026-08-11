# MC Tracker

Monthly Cost & Income Tracker — a full-stack personal finance app. Turborepo
monorepo:

```
apps/web            Next.js (App Router) - auth, entry forms, plan module, dashboard
apps/api            NestJS - scheduled email notifications + the over-budget webhook only
packages/shared-types  Enums, DB row types, Zod schemas, shared calculation functions
supabase/migrations  SQL migrations (tables, RLS, triggers, RPC functions)
docs/SETUP.md        Full setup walkthrough - start here
docs/PROJECT_STRUCTURE.md  Full annotated file/folder tree
```

**Architecture in one line:** Supabase (Postgres + Auth + RLS) is the
database and API — `apps/web` talks to it directly. `apps/api` is a narrow
side service that owns only what must run server-side regardless of who
wrote the data: the four scheduled emails, the over-budget webhook, and
account deletion.

## Quick start

```bash
pnpm install
pnpm --filter @mc-tracker/shared-types test   # 22 unit tests, no external services needed
```

Everything else (a running Supabase project, Google OAuth2 for email) needs
one-time setup — see **[docs/SETUP.md](docs/SETUP.md)**.

Once configured:

```bash
pnpm --filter @mc-tracker/web dev   # http://localhost:3000
pnpm --filter @mc-tracker/api dev   # http://localhost:3001/health
```

## Where things live

| Concern | Location |
|---|---|
| Database schema, RLS, triggers, RPC functions | `supabase/migrations/*.sql` |
| Shared enums / category↔subcategory rule | `packages/shared-types/src/{enums,constants}` |
| Dashboard math (net profit, variance, % change) | `packages/shared-types/src/calculations` |
| Supabase client setup (`@supabase/ssr`) | `apps/web/lib/supabase` |
| Dynamic income/cost entry forms | `apps/web/components/forms` |
| Plan module (duplicate prevention) | `apps/web/components/plans`, `apps/web/lib/data/plans.ts` |
| Dashboard + Recharts | `apps/web/components/dashboard` |
| Cron jobs (daily/hourly/weekly/monthly) | `apps/api/src/notifications/jobs` |
| Over-budget webhook receiver | `apps/api/src/budget-alerts` |
| Email templates | `apps/api/src/mail/templates` |

The plan this was built from — including the couple of assumptions flagged
for review (timezone, over-budget re-fire cadence, etc.) — is preserved at
the top of the project's planning history; the same decisions are called
out inline in the relevant files' doc comments.
