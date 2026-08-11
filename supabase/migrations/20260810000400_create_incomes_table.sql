create table public.incomes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  amount numeric(12, 2) not null check (amount > 0),
  source_type public.income_source_type not null,
  description text,
  date date not null,
  created_at timestamptz not null default now()
);

-- Leading-column equality (user_id) + range (date) index, matching the
-- dashboard's "this user, this date range" query pattern. A composite index
-- covering source_type too is deliberately deferred until real usage shows
-- it's needed.
create index idx_incomes_user_date on public.incomes (user_id, date);

alter table public.incomes enable row level security;

create policy "incomes_select_own" on public.incomes
  for select using (auth.uid() = user_id);

create policy "incomes_insert_own" on public.incomes
  for insert with check (auth.uid() = user_id);

create policy "incomes_update_own" on public.incomes
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "incomes_delete_own" on public.incomes
  for delete using (auth.uid() = user_id);
