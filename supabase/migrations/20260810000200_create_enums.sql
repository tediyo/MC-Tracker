-- income_source_type: mirrors packages/shared-types/src/enums/income-source-type.enum.ts
create type public.income_source_type as enum ('monthly', 'other');

-- cost_category: mirrors packages/shared-types/src/enums/cost-category.enum.ts
create type public.cost_category as enum ('basic', 'fancy', 'extra');

-- cost_subcategory: ONE unified enum covering every subcategory value across
-- all three categories, mirrors
-- packages/shared-types/src/enums/cost-subcategory.enum.ts.
--
-- Why one enum instead of per-category enum types or plain text: Postgres
-- cannot type a single column as "one of several enum types depending on
-- another column" without a discriminated-union-style schema (multiple
-- nullable columns) - real complexity for no benefit. The actual
-- conditional-validity rule (which subcategory is valid under which
-- category) is enforced by the `chk_category_subcategory` CHECK constraint
-- on public.costs, added in the next migration - that is what CHECK
-- constraints are for. The tradeoff of this choice is that enum values are
-- append-only (ALTER TYPE ... ADD VALUE, and never removable) - acceptable
-- here since this domain list is a stable, rarely-changing set.
create type public.cost_subcategory as enum (
  'food', 'asbeza', 'taxi',           -- basic
  'drunk', 'coffee', 'familia',       -- fancy
  'cks', 'cloth', 'shoe', 'holiday',  -- extra
  'other'                             -- shared literal, valid under any category
);
