# MC Tracker — Project Structure

Full folder/file layout of the monorepo, with a one-line purpose for each
piece. See [`docs/SETUP.md`](./SETUP.md) for how to get it running and
[`README.md`](../README.md) for the high-level architecture summary.

```
MC Tracker/
├── apps/
│   ├── web/                          # Next.js (App Router) — the actual UI + all CRUD
│   │   ├── app/
│   │   │   ├── (auth)/                 # Public route group — centered card layout
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── login/page.tsx
│   │   │   │   ├── signup/page.tsx
│   │   │   │   ├── forgot-password/page.tsx
│   │   │   │   └── reset-password/page.tsx
│   │   │   ├── (app)/                  # Protected route group — Sidebar/Topbar shell
│   │   │   │   ├── layout.tsx            # Server-side session check (defense-in-depth)
│   │   │   │   ├── dashboard/{page,loading}.tsx
│   │   │   │   ├── income/{page.tsx, history/page.tsx}
│   │   │   │   ├── costs/{page.tsx, history/page.tsx}
│   │   │   │   └── plans/{page.tsx, new/page.tsx, [planId]/edit/page.tsx}
│   │   │   ├── auth/callback/route.ts    # Handles Supabase email-confirm / recovery links
│   │   │   ├── layout.tsx                # Root layout — providers, fonts, globals.css
│   │   │   ├── page.tsx                  # "/" → redirects to /dashboard or /login
│   │   │   └── globals.css               # Tailwind + light/dark chart-palette CSS vars
│   │   ├── components/
│   │   │   ├── ui/                       # Hand-built Radix + Tailwind primitives (Button, Select, Dialog, Card, Badge, Label, Input)
│   │   │   ├── layout/                   # Sidebar, Topbar, UserMenu
│   │   │   ├── auth/                     # One form component per auth page (client, useActionState)
│   │   │   ├── forms/
│   │   │   │   ├── row-array-list.tsx      # Generic add/remove-row shell (useFieldArray)
│   │   │   │   ├── income-entry-form.tsx + income-row.tsx
│   │   │   │   ├── cost-entry-form.tsx + cost-row.tsx
│   │   │   │   ├── category-subcategory-select.tsx   # The dependent dropdown pair
│   │   │   │   ├── plan-form.tsx + plan-month-year-picker.tsx
│   │   │   │   └── submit-button.tsx       # useFormStatus-aware submit button
│   │   │   ├── plans/                    # plan-year-grid.tsx, plan-month-card.tsx
│   │   │   ├── history/                  # income/cost history tables (edit + delete)
│   │   │   ├── dashboard/
│   │   │   │   ├── dashboard-client.tsx    # The client island — owns timeframe/date state
│   │   │   │   ├── timeframe-switcher.tsx
│   │   │   │   ├── summary-cards.tsx + variance-badge.tsx
│   │   │   │   ├── cost-category-pie-chart.tsx
│   │   │   │   ├── cost-subcategory-pie-chart.tsx    # Drill-down on category click
│   │   │   │   └── income-expense-trend-chart.tsx    # Recharts ComposedChart
│   │   │   └── providers.tsx             # TanStack Query + Sonner toaster wrapper
│   │   ├── lib/
│   │   │   ├── supabase/{client,server,middleware}.ts   # @supabase/ssr three-client pattern
│   │   │   ├── auth/actions.ts             # Server Actions: login/signup/reset/logout
│   │   │   ├── data/{incomes,costs,plans}.ts   # Thin Supabase query/insert wrappers
│   │   │   ├── dashboard/get-dashboard-data.ts # Fetch rows → feed shared-types calculations
│   │   │   └── utils.ts                    # cn(), formatCurrency(), formatPercent()
│   │   ├── hooks/use-dashboard-data.ts     # TanStack Query wrapper (keepPreviousData)
│   │   ├── middleware.ts                   # Route protection (delegates to lib/supabase/middleware)
│   │   ├── next.config.mjs / tailwind.config.ts / tsconfig.json / package.json
│   │   └── .env.example / .env.local       # NEXT_PUBLIC_SUPABASE_URL, ANON_KEY, SITE_URL
│   │
│   └── api/                          # NestJS — cron emails + the over-budget webhook ONLY
│       ├── src/
│       │   ├── main.ts                     # Loads dotenv first, then bootstraps Nest
│       │   ├── app.module.ts                # Wires every feature module together
│       │   ├── config/
│       │   │   ├── env.validation.ts         # Zod-validated startup env schema
│       │   │   └── app-timezone.ts           # APP_TIMEZONE constant (read before DI exists)
│       │   ├── common/
│       │   │   ├── guards/supabase-auth.guard.ts    # Verifies the Supabase JWT locally (HS256)
│       │   │   ├── guards/webhook-secret.guard.ts   # Shared-secret check for the webhook
│       │   │   └── decorators/current-user.decorator.ts
│       │   ├── supabase/{supabase.module,supabase.service}.ts   # Service-role client (bypasses RLS)
│       │   ├── mail/
│       │   │   ├── mail.module.ts + mail.service.ts   # @nestjs-modules/mailer, Gmail OAuth2
│       │   │   └── templates/*.hbs                    # daily-reminder, weekly/monthly-summary, over-budget-alert
│       │   ├── notifications/
│       │   │   ├── notifications-core.module.ts  # Leaf module (breaks a circular-import risk)
│       │   │   ├── notifications.module.ts       # Registers the 4 cron jobs
│       │   │   ├── notifications.service.ts      # Wraps the two shared Postgres RPC calls
│       │   │   └── jobs/
│       │   │       ├── daily-reminder.job.ts       # 11:30 PM daily + the over-budget safety net
│       │   │       ├── hourly-escalation.job.ts    # Every hour, all day
│       │   │       ├── weekly-summary.job.ts       # Sunday 8:00 PM
│       │   │       └── monthly-summary.job.ts      # Runs daily 9 PM, fires only on the last day of month
│       │   ├── budget-alerts/
│       │   │   ├── budget-alerts.module.ts / .service.ts / .controller.ts   # POST /webhooks/costs-insert
│       │   │   └── dto/costs-insert-webhook.dto.ts
│       │   ├── account/account.controller.ts   # DELETE /account (needs the admin API)
│       │   └── health/health.controller.ts     # GET /health — Docker healthcheck target
│       ├── Dockerfile                      # Multi-stage, turbo-prune based
│       ├── nest-cli.json / tsconfig*.json / package.json
│       └── .env.example / .env             # SUPABASE_*, GOOGLE_OAUTH_*, SUPABASE_WEBHOOK_SECRET, ...
│
├── packages/
│   └── shared-types/                 # The single source of truth both apps import
│       └── src/
│           ├── enums/                      # IncomeSourceType, CostCategory, CostSubcategory
│           ├── constants/category-subcategory-map.ts   # Mirrors the SQL CHECK constraint
│           ├── schemas/                    # Zod: income/cost/plan input validation
│           ├── calculations/               # Pure functions — the ONLY place dashboard/email math lives
│           │   ├── period.ts                 # getPeriodRange() — daily/weekly/monthly/yearly boundaries
│           │   ├── aggregate.ts               # sumIncome/sumCosts/groupCostsBy{Category,Subcategory}
│           │   ├── metrics.ts                 # calculatePeriodMetrics() — net profit, variance, % change
│           │   ├── trend.ts                   # buildTrendSeries() — the trend-chart bucket builder
│           │   └── *.test.ts                  # 22 Vitest unit tests, all deterministic (referenceDate injected)
│           ├── database.types.ts           # Generated via `pnpm gen:types` — do not hand-edit
│           ├── db.ts                       # Friendly row-type aliases over Database
│           └── dto.ts / index.ts
│
├── supabase/
│   ├── config.toml                   # Supabase CLI local-dev config
│   └── migrations/                   # Applied in filename order via `supabase db push`
│       ├── ..._enable_extensions.sql
│       ├── ..._create_enums.sql        # income_source_type, cost_category, cost_subcategory
│       ├── ..._create_users_table.sql  # + the auth.users sync triggers
│       ├── ..._create_incomes_table.sql
│       ├── ..._create_costs_table.sql  # + the category/subcategory CHECK constraint
│       ├── ..._create_plans_table.sql  # + the unique(user_id, year, month) constraint
│       └── ..._create_reporting_functions.sql   # get_users_missing_cost_for_date, get_period_summary
│
├── docs/
│   ├── SETUP.md                       # Full setup walkthrough — start here
│   └── PROJECT_STRUCTURE.md           # This file
│
├── docker-compose.yml                # Scoped to the `api` service only
├── turbo.json                        # Task pipeline (build/dev/lint/test/type-check)
├── pnpm-workspace.yaml                # Workspace globs + approved postinstall build scripts
├── tsconfig.base.json                 # Shared strict TS config every package/app extends
├── package.json                       # Root scripts (turbo run ...)
└── README.md                          # Project overview + architecture summary
```

## Quick orientation by task

| "I want to change..." | Start here |
|---|---|
| What counts as a valid subcategory | `packages/shared-types/src/constants/category-subcategory-map.ts` **and** `supabase/migrations/..._create_costs_table.sql`'s CHECK constraint (keep both in sync) |
| How net profit / variance / % change is computed | `packages/shared-types/src/calculations/metrics.ts` |
| The dashboard's charts | `apps/web/components/dashboard/` |
| The income or cost entry form | `apps/web/components/forms/` |
| Who can see/edit what data | RLS policies in `supabase/migrations/*.sql` (not application code) |
| When/what emails get sent | `apps/api/src/notifications/jobs/` and `apps/api/src/mail/templates/` |
| The over-budget alert logic | `apps/api/src/budget-alerts/budget-alerts.service.ts` |
| Route protection | `apps/web/middleware.ts` + `apps/web/lib/supabase/middleware.ts` |
