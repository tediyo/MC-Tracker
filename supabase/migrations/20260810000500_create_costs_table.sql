create table public.costs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  amount numeric(12, 2) not null check (amount > 0),
  category public.cost_category not null,
  subcategory public.cost_subcategory not null,
  date date not null,
  description text,
  created_at timestamptz not null default now(),

  -- The actual conditional-validity rule for the unified cost_subcategory
  -- enum (see 20260810000200_create_enums.sql for why it's one enum, not
  -- several). Mirrored on the TS side by
  -- packages/shared-types/src/constants/category-subcategory-map.ts - keep
  -- both in sync if this list ever changes.
  constraint chk_category_subcategory check (
    (category = 'basic' and subcategory in ('food', 'asbeza', 'taxi', 'other'))
    or (category = 'fancy' and subcategory in ('drunk', 'coffee', 'familia', 'other'))
    or (category = 'extra' and subcategory in ('cks', 'cloth', 'shoe', 'holiday', 'other'))
  )
);

create index idx_costs_user_date on public.costs (user_id, date);
-- A (user_id, category, date) index for category-breakdown widgets is
-- deliberately deferred - at personal-tracker row volumes, filtering on top
-- of the date-range index above is fine; add it only if a real query proves
-- slow.

alter table public.costs enable row level security;

create policy "costs_select_own" on public.costs
  for select using (auth.uid() = user_id);

create policy "costs_insert_own" on public.costs
  for insert with check (auth.uid() = user_id);

create policy "costs_update_own" on public.costs
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "costs_delete_own" on public.costs
  for delete using (auth.uid() = user_id);
