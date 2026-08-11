# MC Tracker — Setup Guide

This repo is scaffolded with placeholder env vars everywhere (`.env.example` in
`apps/web` and `apps/api`). Nothing is wired to a live Supabase project or
Google account yet. Follow this guide in order.

## 1. Local prerequisites

- Node.js 20+
- pnpm (`corepack enable && corepack prepare pnpm --activate`, or `npm i -g pnpm`)
- [Supabase CLI](https://supabase.com/docs/guides/cli) (`npm i -g supabase` or via your package manager)
- Docker Desktop (only needed for (a) `supabase start`'s local stack, and (b) building/running `apps/api`'s own Docker image later — not required for day-to-day `pnpm dev`)

Install workspace dependencies once, from the repo root:

```bash
pnpm install
```

## 2. Create the Supabase project

1. Create a new project at [supabase.com](https://supabase.com) (or use `supabase start` for a fully local instance — see §2b).
2. In the dashboard: **Settings → API** — copy the **Project URL**, **anon public key**, and **service_role key**.
3. **Settings → API → JWT Settings** — copy the **JWT Secret**.
4. Link this repo to the project and push the migrations:

   ```bash
   supabase login
   supabase link --project-ref <your-project-ref>
   supabase db push
   ```

   This applies every file in `supabase/migrations/` in order — the 4 tables, enums, RLS policies, triggers, and the two reporting RPC functions.

5. Regenerate the shared TypeScript types against the real schema:

   ```bash
   pnpm gen:types
   ```

### 2b. Or run Supabase entirely locally

```bash
supabase start
supabase db reset   # applies every migration to the fresh local DB
```

`supabase start` prints a local `API URL`, `anon key`, and `service_role key` —
use those instead of a hosted project's for local dev. It also runs Inbucket
(a fake SMTP inbox) at the printed URL, useful for testing Supabase Auth's own
confirmation/reset emails without real SMTP.

## 3. Configure `apps/web`

```bash
cp apps/web/.env.example apps/web/.env.local
```

Fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from step 2.
Run it:

```bash
pnpm --filter @mc-tracker/web dev
```

Visit `http://localhost:3000` — sign up, confirm your email (check Inbucket if
using the local stack), log in, and you should land on an empty dashboard.

## 4. Google Cloud OAuth2 app (for sending mail)

The mail system uses Gmail SMTP with OAuth2 (`apps/api`'s `MailModule`), per
the original requirement. This is a one-time setup:

1. Go to [Google Cloud Console](https://console.cloud.google.com/) → create a project (or use an existing one).
2. **APIs & Services → OAuth consent screen** — set it up (External is fine for a personal project). **Important:** while the app is in "Testing" status, refresh tokens can expire after ~7 days of inactivity. Move it to "In production" (doesn't require Google's review for personal/internal use) to avoid silent auth failures later.
3. **APIs & Services → Credentials → Create Credentials → OAuth client ID** → Application type: **Web application**. Add `https://developers.google.com/oauthplayground` as an authorized redirect URI (used only to mint the initial refresh token below).
4. Copy the generated **Client ID** and **Client Secret**.
5. Get a refresh token: go to the [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/), click the gear icon → check "Use your own OAuth credentials" → paste your Client ID/Secret. In the left panel, select the **Gmail API v1** scope `https://mail.google.com/`, authorize, exchange the auth code for tokens, and copy the **refresh token**.
6. Fill in `apps/api/.env`:

   ```
   GMAIL_USER=your-address@gmail.com
   GOOGLE_OAUTH_CLIENT_ID=...
   GOOGLE_OAUTH_CLIENT_SECRET=...
   GOOGLE_OAUTH_REFRESH_TOKEN=...
   ```

**Faster alternative for local testing:** skip OAuth2 entirely — enable 2FA on
the Gmail account, generate an **App Password** (Google Account → Security →
App passwords), and set `GMAIL_APP_PASSWORD` in `apps/api/.env` instead
(leave the `GOOGLE_OAUTH_*` vars blank). `MailModule` automatically prefers
the App Password transport when that var is set. Switch to real OAuth2 before
relying on this for anything long-running.

## 5. Configure `apps/api`

```bash
cp apps/api/.env.example apps/api/.env
```

Fill in:
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWT_SECRET` (step 2)
- `GMAIL_USER` + either the `GOOGLE_OAUTH_*` vars or `GMAIL_APP_PASSWORD` (step 4)
- `SUPABASE_WEBHOOK_SECRET` — any long random string, e.g. `openssl rand -hex 32`
- `APP_TIMEZONE` — defaults to `Africa/Addis_Ababa`; change if that's wrong for your users
- `WEB_APP_URL` — `http://localhost:3000` for local dev

Run it:

```bash
pnpm --filter @mc-tracker/api dev
```

`GET http://localhost:3001/health` should return `{"status":"ok",...}`. The
four cron jobs (daily reminder, hourly escalation, weekly summary, monthly
summary) are now scheduled per their `@Cron` expressions in
`src/notifications/jobs/`.

## 6. Wire up the instant over-budget alert (Database Webhook)

This is the one piece that needs the API reachable from the public internet,
even for local testing, because Supabase Cloud calls out to it.

1. Start a tunnel to your local API: `ngrok http 3001` (or `cloudflared tunnel --url http://localhost:3001`). Note the public HTTPS URL it prints.
2. In the Supabase dashboard: **Database → Webhooks → Create a new webhook**.
   - Table: `costs`
   - Events: `INSERT` only
   - Type: HTTP Request → **POST** `https://<your-tunnel-url>/webhooks/costs-insert`
   - HTTP Headers: add `X-Webhook-Secret: <the SUPABASE_WEBHOOK_SECRET you set in apps/api/.env>`
3. Test it: set a plan for the current month with a low `target_cost_limit`, log a cost that exceeds it, and confirm exactly one alert email arrives. Log a second over-budget cost the same month and confirm it does *not* send a second alert (`plans.over_budget_alert_sent_at` is now set).
4. Re-run `supabase db pull` afterward to capture the webhook's generated trigger into a versioned migration, so it's reproducible for a teammate or a fresh environment.

For a deployed environment, point the webhook at your real API's public URL
instead of a tunnel and skip step 1.

## 7. Docker (apps/api)

```bash
docker compose up --build
```

Builds `apps/api` via its multi-stage `Dockerfile` (using `turbo prune` so
the image only carries what `apps/api` actually needs) and runs it on
port 3001, reading `apps/api/.env`. This is scoped to just the API — `apps/web`
and Supabase are not part of this compose file (see the comment at the top
of `docker-compose.yml`).

## Summary of every env var

| File | Var | Where it comes from |
|---|---|---|
| `apps/web/.env.local` | `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API |
| | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API |
| | `NEXT_PUBLIC_SITE_URL` | Your app's base URL |
| `apps/api/.env` | `SUPABASE_URL` | Supabase → Settings → API |
| | `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API (keep secret!) |
| | `SUPABASE_JWT_SECRET` | Supabase → Settings → API → JWT Settings |
| | `SUPABASE_WEBHOOK_SECRET` | You generate this (§6) |
| | `APP_TIMEZONE` | IANA timezone, e.g. `Africa/Addis_Ababa` |
| | `GMAIL_USER` | Your Gmail address |
| | `GOOGLE_OAUTH_CLIENT_ID` / `_SECRET` / `_REFRESH_TOKEN` | Google Cloud Console (§4) |
| | `GMAIL_APP_PASSWORD` | Google Account → Security (alternative to OAuth2) |
| | `WEB_APP_URL` | The Next.js app's base URL (for email links) |
