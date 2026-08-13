# MC Tracker — Render Deployment Guide

This guide covers deploying the **NestJS Backend API** (`apps/api`) to [Render](https://render.com/), enabling scheduled notification emails (daily reminders, weekly/monthly summaries, hourly escalation) and instant over-budget database webhooks in production.

---

## Architecture Overview

In MC Tracker:
- **`apps/web`** (Next.js): Talked directly to Supabase for data and authentication.
- **`apps/api`** (NestJS): Runs server-side tasks:
  - **Daily Reminder**: Checks pending unlogged costs for yesterday/today.
  - **Hourly Escalation**: Alerts if unlogged costs persist beyond 24 hours.
  - **Weekly Summary**: Sends Sunday performance reports.
  - **Monthly Summary**: Sends 1st-of-the-month recap.
  - **Instant Alert Webhook**: Triggered by Supabase `costs` `INSERT` when a plan limit is breached.

---

## Option 1: Deploy with Render Blueprint (Recommended)

Render Blueprints use the [`render.yaml`](../render.yaml) file at the root of this repository.

1. **Push your code to GitHub** (or GitLab).
2. Go to the [Render Dashboard](https://dashboard.render.com/) and click **New +** → **Blueprint**.
3. Connect your GitHub repository.
4. Render will detect `render.yaml` and configure the **mc-tracker-api** Docker web service automatically.
5. In the environment variable prompt, enter the secret credentials listed in the table below.
6. Click **Apply**. Render will build the Docker container and deploy the API.

---

## Option 2: Manual Web Service Setup

If you prefer to configure the service manually via the Render UI:

1. In the Render Dashboard, click **New +** → **Web Service**.
2. Connect your GitHub repository.
3. Configure the following settings:
   - **Name**: `mc-tracker-api`
   - **Environment**: `Docker`
   - **Region**: Select your preferred region
   - **Branch**: `main` (or your primary branch)
   - **Root Directory**: Leave blank (repo root)
   - **Dockerfile Path**: `apps/api/Dockerfile`
   - **Docker Context**: `.` (a single dot)
   - **Health Check Path**: `/health`
4. Click **Create Web Service**.

---

## Required Environment Variables

Configure these under **Environment** in your Render Web Service settings:

| Environment Variable | Recommended Value / Source | Description |
|---|---|---|
| `PORT` | `3001` (or dynamic) | Internal application port |
| `APP_TIMEZONE` | `Africa/Addis_Ababa` | IANA timezone for cron schedules |
| `SUPABASE_URL` | `https://<ref>.supabase.co` | Supabase Settings → API → Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | `ey...` | Supabase Settings → API → `service_role` key |
| `SUPABASE_JWT_SECRET` | `secret...` | Supabase Settings → API → JWT Settings → JWT Secret |
| `SUPABASE_WEBHOOK_SECRET` | Long random string | Secret header matched by Supabase Database Webhook |
| `GMAIL_USER` | `your-email@gmail.com` | Sender Gmail address |
| `GOOGLE_OAUTH_CLIENT_ID` | `...apps.googleusercontent.com` | Google Cloud Console OAuth2 Client ID |
| `GOOGLE_OAUTH_CLIENT_SECRET` | `...` | Google Cloud Console OAuth2 Client Secret |
| `GOOGLE_OAUTH_REFRESH_TOKEN` | `1//...` | Minted OAuth2 Refresh Token |
| `GMAIL_APP_PASSWORD` | *(Optional alternative)* | Use if skipping OAuth2 (Google 2FA App Password) |
| `WEB_APP_URL` | `https://your-web-app.vercel.app` | Base URL of deployed web frontend (for email links) |

---

## Keeping the Free Tier API Active (Preventing Sleep)

> [!IMPORTANT]
> Render's **Free Tier** Web Services automatically go to sleep after 15 minutes of inbound network inactivity.
> When the service is asleep, NestJS internal cron jobs (`@nestjs/schedule`) will **not** trigger at their scheduled times.

To keep the service awake 24/7 on Render's free tier without upgrading to a paid plan:

1. Sign up for a free uptime monitoring service such as [UptimeRobot](https://uptimerobot.com/) or [Cron-Job.org](https://cron-job.org/).
2. Create a new HTTP/HTTPS monitor:
   - **URL**: `https://<your-render-app-name>.onrender.com/health`
   - **Monitoring Interval**: Every **5 or 10 minutes**
   - **HTTP Method**: GET
3. Save the monitor. This periodic health ping prevents Render from spinning down your instance, keeping your scheduled jobs running reliably.

---

## Configuring the Supabase Database Webhook

Once your API is live on Render:

1. Copy your public Render API URL: `https://<your-render-app-name>.onrender.com`.
2. Open your [Supabase Dashboard](https://supabase.com/dashboard).
3. Navigate to **Database** → **Webhooks**.
4. Create or edit the webhook for instant budget alerts:
   - **Name**: `Over-Budget Email Alert`
   - **Table**: `costs`
   - **Events**: Check `INSERT`
   - **Type**: HTTP Request → **POST**
   - **URL**: `https://<your-render-app-name>.onrender.com/webhooks/costs-insert`
   - **HTTP Headers**: Add Header:
     - Name: `X-Webhook-Secret`
     - Value: `<your SUPABASE_WEBHOOK_SECRET>`
5. Save the webhook.

---

## Verifying Deployment

1. **Health Check**:
   Open `https://<your-render-app-name>.onrender.com/health` in your browser. You should receive:
   ```json
   {
     "status": "ok",
     "timestamp": "2026-08-13T09:55:00.000Z",
     "uptime": 123.45,
     "environment": "production",
     "timezone": "Africa/Addis_Ababa"
   }
   ```
2. **Logs Verification**:
   In Render Dashboard under **Logs**, verify that NestJS bootstraps clean without env validation errors:
   ```text
   [Nest] LOG [Bootstrap] MC Tracker API listening on port 3001
   ```
3. **Over-Budget Webhook Test**:
   Log a cost in the web app that exceeds your plan's target limit. Check your email to confirm the alert email is received and check Render logs for `[BudgetAlertsService] Processing over-budget event`.
