# MC Tracker (Monthly Cost & Income Tracker)

A modern, full-stack personal finance and expense tracking ecosystem consisting of a Next.js Web App, NestJS Backend Service, React Native Mobile App, Chrome Browser Extension, and Supabase Backend.

---

## 📁 Complete Project Folder Structure

```
MC Tracker/
├── apps/
│   ├── web/                              # Next.js 14 (App Router) Web Application
│   │   ├── app/                          # App Router pages & route handlers
│   │   │   ├── (auth)/                   # Public auth routes (login, signup, forgot/reset password)
│   │   │   ├── (app)/                    # Protected routes (dashboard, income, costs, plans, settings)
│   │   │   ├── api/                      # Web API endpoints (e.g. alerts dispatch, month-end triggers)
│   │   │   ├── globals.css               # Global styling, theme variables, and Tailwind CSS
│   │   │   └── layout.tsx                # Root layout, fonts, and global context providers
│   │   ├── components/                   # UI components
│   │   │   ├── auth/                     # Auth forms & client logic
│   │   │   ├── dashboard/                # Analytics charts, trend widgets, category breakdowns
│   │   │   ├── forms/                    # Income, cost, and budget planning form components
│   │   │   ├── history/                  # Searchable, filterable income & expense audit tables
│   │   │   ├── layout/                   # Sidebar navigation, Topbar, and User Profile menu
│   │   │   ├── providers/                # Calendar (Ethiopian/Gregorian) and React Query providers
│   │   │   └── ui/                       # Reusable UI primitives (Buttons, Modals, Cards, Badges)
│   │   ├── lib/                          # Client utilities, PDF report generation, Supabase clients
│   │   ├── public/                       # Static assets, logos, and icons
│   │   └── .env.local                    # Local web credentials (NEXT_PUBLIC_SUPABASE_URL, ANON_KEY)
│   │
│   └── api/                              # NestJS Backend Microservice & Cron Engine
│       ├── src/
│       │   ├── account/                  # Account management & admin user deletion endpoints
│       │   ├── budget-alerts/            # Instant over-budget notification webhook handlers
│       │   ├── common/                   # Global guards (Supabase auth guard, webhook secret guard)
│       │   ├── config/                   # Zod environment schema validation & timezone settings
│       │   ├── health/                   # GET /health health-check endpoint (Render Docker target)
│       │   ├── mail/                     # Nodemailer SMTP transporter & Handlebars email templates
│       │   ├── notifications/            # Cron jobs: daily reminders, weekly/monthly report dispatcher
│       │   ├── supabase/                 # Supabase Service-Role client (bypasses RLS for system jobs)
│       │   ├── app.module.ts             # Root application module wiring all features
│       │   └── main.ts                   # Server entrypoint and bootstrap logic
│       ├── Dockerfile                    # Optimized multi-stage Docker build for Render
│       └── .env                          # Local API credentials (SUPABASE_SERVICE_ROLE_KEY, SMTP, etc.)
│
├── Mobile/                               # React Native (CLI) Cross-Platform Mobile Application
│   ├── android/                          # Native Android project configuration, Gradle, and manifest
│   ├── assets/                           # App icons, splash screens, and image assets
│   ├── src/
│   │   ├── components/                   # Mobile UI components, history cards, quick-add modals
│   │   ├── context/                      # CalendarContext (Ethiopian/Gregorian dual mode state)
│   │   ├── lib/                          # Supabase client, local storage, API configuration
│   │   ├── navigation/                   # React Navigation stacks and tab navigators
│   │   ├── screens/                      # Screens: Dashboard, Income, Costs, Plans, Profile, Auth
│   │   ├── services/                     # Background notification scheduling & Notifee handlers
│   │   ├── shared-types/                 # Shared domain types, schemas, and calendar algorithms
│   │   └── types/                        # React Native environment & navigation typings
│   ├── App.tsx                           # Main React Native component root
│   └── .env                              # Mobile environment config (SUPABASE_URL, ANON_KEY, API_BASE_URL)
│
├── packages/
│   └── shared-types/                     # Shared TypeScript Monorepo Package
│       ├── src/
│       │   ├── calculations/             # Deterministic financial math (aggregations, metrics, trends)
│       │   ├── constants/                # Category-to-subcategory mapping matrices
│       │   ├── enums/                    # CostCategory, CostSubcategory, IncomeSourceType
│       │   ├── ethiopian-calendar.ts     # Complete Gregorian ↔ Ethiopian calendar conversion algorithms
│       │   ├── database.types.ts         # Supabase TypeScript database schema interfaces
│       │   └── schemas/                  # Zod validation schemas for forms and payloads
│       └── tsconfig.json                 # Shared CommonJS/ESM compilation configuration
│
├── supabase/
│   ├── config.toml                       # Supabase CLI local development settings
│   └── migrations/                       # Database Schema Migrations
│       └── 20260904000000_complete_schema.sql # Single consolidated, up-to-date database schema
│
├── extension/                            # Browser Extension (Chrome & Edge)
│   ├── manifest.json                     # Manifest V3 extension configuration
│   ├── content.js                        # Draggable floating action button & modal injection
│   ├── content.css                       # Extension styling and boundary clamping
│   ├── popup.html / popup.js             # Extension toolbar popup interface
│   └── icon.png                          # Extension icon asset
│
├── .gitignore                            # Git exclusion rules (safely ignores all active .env files)
├── docker-compose.yml                    # Docker orchestration for local microservices
├── package.json                          # Monorepo root scripts & pnpm configurations
├── pnpm-workspace.yaml                   # Turborepo workspace topology
├── tsconfig.base.json                    # Root TypeScript base compiler configuration
├── turbo.json                            # Turborepo build & lint pipeline definitions
└── README.md                             # Project overview and full documentation (this file)
```

---

## ⚡ Core Architecture

1. **Database & Auth (Supabase)**:
   - **Postgres Database**: Primary persistent store with Row Level Security (RLS) enforcing strict tenant isolation on every table (`users`, `incomes`, `costs`, `plans`).
   - **Supabase Auth**: Manages session JWTs, password resets, and user metadata (`calendar_mode`, `name`).
   - **Atomic Triggers**: `handle_new_user()` automatically synchronizes Supabase Auth signups into `public.users`.
2. **Web Frontend (`apps/web`)**:
   - Next.js 14 App Router communicating directly with Supabase via `@supabase/ssr`.
   - Client-side interactive dashboards with custom category drilldowns, trend analysis, and dynamic PDF generation.
3. **Backend Engine (`apps/api`)**:
   - NestJS microservice running background cron schedules and webhook listeners.
   - Dispatches scheduled month-end financial summary emails with attached PDF reports.
   - Listens for over-budget webhooks when costs exceed monthly plan limits.
4. **Mobile App (`Mobile`)**:
   - React Native mobile app with offline-first local persistence, push notification schedules, and full expense tracking.
   - Configured to point directly to Supabase and the production Render backend API.
5. **Browser Extension (`extension`)**:
   - Injects a draggable Quick-Action button across any website, allowing users to log expenses on the fly.

---

## 📅 Dual Calendar System (Ethiopian & Gregorian)

MC Tracker provides native, first-class support for both the **Gregorian (G.C.)** and **Ethiopian (E.C.)** calendars:

- **Per-User Preference**: Users can toggle between Gregorian and Ethiopian calendar modes in Settings / Profile on Web and Mobile.
- **Bi-directional Synchronization**: The active calendar mode is persisted to local storage and synchronized to `user.user_metadata.calendar_mode`.
- **Intelligent Month-End Dispatcher**:
  - Automatically detects whether today is the end of the Gregorian month or the end of the Ethiopian month (`Nehase 30`, `Pagumē 5/6`, `Meskerem 30`, etc.).
  - Evaluates each user's preference individually: Gregorian users receive their reports on Gregorian month-end, while Ethiopian calendar users receive their reports on Ethiopian month-end with Ethiopian date formatting (*"Nehase 2018 E.C."*).

---

## 🚀 Getting Started Locally

### 1. Prerequisites
- **Node.js**: `v20+`
- **pnpm**: `v9+` (`corepack enable && corepack prepare pnpm@latest --activate`)

### 2. Installation
```bash
git clone https://github.com/tediyo/MC-Tracker.git
cd "MC Tracker"
pnpm install
```

### 3. Environment Variables
Ensure the three active `.env` files are configured:

1. **Web** (`apps/web/.env.local`):
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://slmakefgxtupbpdolxib.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

2. **API** (`apps/api/.env`):
   ```env
   PORT=3001
   APP_TIMEZONE=Africa/Addis_Ababa
   SUPABASE_URL=https://slmakefgxtupbpdolxib.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
   SUPABASE_JWT_SECRET=your-supabase-jwt-secret
   SUPABASE_WEBHOOK_SECRET=your-database-webhook-secret
   GMAIL_USER=mctrackernotification@gmail.com
   GMAIL_APP_PASSWORD=your-gmail-app-password
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=465
   MAIL_FROM="MC Tracker <mctrackernotification@gmail.com>"
   WEB_APP_URL=http://localhost:3000
   ```

3. **Mobile** (`Mobile/.env`):
   ```env
   SUPABASE_URL=https://slmakefgxtupbpdolxib.supabase.co
   SUPABASE_ANON_KEY=your-supabase-anon-key
   API_BASE_URL=https://mc-tracker-bdm0.onrender.com
   ```

### 4. Running the Development Servers

- **Web**:
  ```bash
  pnpm --filter @mc-tracker/web dev    # Runs at http://localhost:3000
  ```
- **API**:
  ```bash
  pnpm --filter @mc-tracker/api dev    # Runs at http://localhost:3001
  ```
- **Mobile**:
  ```bash
  cd Mobile
  npm run start                        # Starts Metro bundler
  npm run android                      # Launches Android emulator / device
  ```

---

## 🌐 Production Deployment

- **NestJS API Service**:
  - Hosted on **Render** using the project Dockerfile:
  - **Live URL**: `https://mc-tracker-bdm0.onrender.com`
  - **Health Endpoint**: `https://mc-tracker-bdm0.onrender.com/health` (Returns `{"status":"ok"}`)
- **Database Migrations**:
  - Single consolidated migration located in `supabase/migrations/20260904000000_complete_schema.sql`.
  - Apply directly via Supabase CLI (`supabase db push`) or through the Supabase Dashboard SQL Editor.

---

## 🧩 Browser Extension Setup

1. Open your browser extension management page:
   - **Chrome**: `chrome://extensions`
   - **Edge**: `edge://extensions`
2. Enable **Developer mode** (top-right toggle).
3. Click **Load unpacked** and select the `extension/` folder inside this repository.
4. The green draggable Quick Action button will now appear across your browser tabs to quickly record financial entries.
