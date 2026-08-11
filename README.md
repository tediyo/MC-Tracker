# MC Tracker

Monthly Cost & Income Tracker — a full-stack personal finance app. Turborepo
monorepo:

```
apps/web            Next.js (App Router) - auth, entry forms, plan module, dashboard
apps/api            NestJS - scheduled email notifications + the over-budget webhook only
packages/shared-types  Enums, DB row types, Zod schemas, shared calculation functions
supabase/migrations  SQL migrations (tables, RLS, triggers, RPC functions)
docs/SETUP.md        Full setup walkthrough - start here
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
