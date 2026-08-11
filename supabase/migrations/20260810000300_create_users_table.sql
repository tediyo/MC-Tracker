-- public.users mirrors (and is kept in sync with) auth.users. Every other
-- table's user_id FK points here rather than directly at auth.users so RLS
-- policies and joins stay entirely inside the public schema.
create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  created_at timestamptz not null default now()
);

alter table public.users enable row level security;

create policy "users_select_self" on public.users
  for select using (auth.uid() = id);

create policy "users_insert_self" on public.users
  for insert with check (auth.uid() = id);

create policy "users_update_self" on public.users
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- NOTE (risk, intentionally not blocked at the DB level - see docs/SETUP.md
-- and the plan): `users` cascades to incomes/costs/plans ON DELETE CASCADE,
-- so a raw `delete from users where id = auth.uid()` from an authenticated
-- client would wipe a user's entire financial history while leaving their
-- auth.users row (and login ability) intact. Account deletion should always
-- go through the NestJS `DELETE /account` endpoint (service-role,
-- `auth.admin.deleteUser`) instead - this policy exists to satisfy the
-- literal "RLS on all four tables" requirement, not to endorse the frontend
-- calling it directly.
create policy "users_delete_self" on public.users
  for delete using (auth.uid() = id);

-- Auto-populate public.users whenever a new Supabase Auth user is created.
-- This MUST be a DB trigger, not application code: signup can happen via
-- several Supabase Auth flows (password, magic link, invite) that NestJS
-- never observes, and a SECURITY DEFINER trigger is transactionally atomic
-- with the auth.users insert itself.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Keep public.users.email in sync if a user changes their email in
-- Supabase Auth (small addition beyond the literal spec, prevents drift).
create or replace function public.handle_user_email_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.users set email = new.email where id = new.id;
  return new;
end;
$$;

create trigger on_auth_user_email_updated
  after update of email on auth.users
  for each row execute procedure public.handle_user_email_update();
