-- Used by the NestJS daily-reminder and hourly-escalation cron jobs to find
-- every user who has not logged a cost for a given date. `target_date` is
-- ALWAYS computed by NestJS in APP_TIMEZONE (Africa/Addis_Ababa) and passed
-- in explicitly - never derived from Postgres's own now()/current_date,
-- which default to UTC on Supabase and would disagree with EAT for the
-- first few hours of each local day.
--
-- Locked down to service_role only: this returns every user's email, so it
-- must never be callable from a logged-in user's own session (which would
-- let any user enumerate every other user's email address).
create or replace function public.get_users_missing_cost_for_date(target_date date)
returns table (user_id uuid, email text)
language sql
stable
as $$
  select u.id, u.email
  from public.users u
  where not exists (
    select 1 from public.costs c
    where c.user_id = u.id and c.date = target_date
  );
$$;

revoke execute on function public.get_users_missing_cost_for_date(date) from public, anon, authenticated;
grant execute on function public.get_users_missing_cost_for_date(date) to service_role;

-- Total income, total cost, and cost-by-category for one user over one date
-- range. Runs SECURITY INVOKER (the default) rather than SECURITY DEFINER,
-- which is deliberate: it means this is safe to expose to `authenticated`
-- as well as `service_role` - even if a caller passes another user's
-- p_user_id, the underlying selects are still filtered by the
-- incomes_select_own/costs_select_own RLS policies (auth.uid() = user_id),
-- so a mismatched id simply returns zeros rather than leaking data. This
-- lets the frontend (own session, in-app widgets) and NestJS
-- (service-role, all users, for email content) share one implementation of
-- "totals for a period" instead of two.
create or replace function public.get_period_summary(p_user_id uuid, p_start date, p_end date)
returns table (total_income numeric, total_cost numeric, cost_by_category jsonb)
language sql
stable
as $$
  select
    coalesce((
      select sum(amount) from public.incomes
      where user_id = p_user_id and date between p_start and p_end
    ), 0) as total_income,
    coalesce((
      select sum(amount) from public.costs
      where user_id = p_user_id and date between p_start and p_end
    ), 0) as total_cost,
    coalesce((
      select jsonb_object_agg(category, category_total) from (
        select category, sum(amount) as category_total
        from public.costs
        where user_id = p_user_id and date between p_start and p_end
        group by category
      ) grouped
    ), '{}'::jsonb) as cost_by_category;
$$;

grant execute on function public.get_period_summary(uuid, date, date) to authenticated, service_role;
