create table public.plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  month int not null check (month between 1 and 12),
  year int not null check (year between 2000 and 2100),
  target_cost_limit numeric(12, 2) not null check (target_cost_limit >= 0),
  target_savings_goal numeric(12, 2) not null check (target_savings_goal >= 0),
  -- Tracks whether the "instant over-budget alert" has already fired for
  -- this plan/month, so it only sends once (see budget-alerts.service.ts in
  -- apps/api) rather than re-firing on every subsequent over-budget entry.
  over_budget_alert_sent_at timestamptz,
  created_at timestamptz not null default now(),

  -- Column order is (user_id, year, month) rather than the literal spec's
  -- (user_id, month, year): functionally identical for the point lookup
  -- "does a plan exist for this user/month/year", but this order also lets
  -- the same unique index serve "list this user's plans, most recent first".
  unique (user_id, year, month)
);

alter table public.plans enable row level security;

create policy "plans_select_own" on public.plans
  for select using (auth.uid() = user_id);

create policy "plans_insert_own" on public.plans
  for insert with check (auth.uid() = user_id);

create policy "plans_update_own" on public.plans
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "plans_delete_own" on public.plans
  for delete using (auth.uid() = user_id);
