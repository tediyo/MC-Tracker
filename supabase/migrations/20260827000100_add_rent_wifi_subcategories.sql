-- Add rent and wifi to public.cost_subcategory enum
alter type public.cost_subcategory add value if not exists 'rent';
alter type public.cost_subcategory add value if not exists 'wifi';

-- Update chk_category_subcategory constraint on public.costs
alter table public.costs drop constraint if exists chk_category_subcategory;

alter table public.costs add constraint chk_category_subcategory check (
  (category = 'basic' and subcategory in ('food', 'asbeza', 'taxi', 'rent', 'wifi', 'other'))
  or (category = 'fancy' and subcategory in ('drunk', 'coffee', 'familia', 'other'))
  or (category = 'extra' and subcategory in ('cks', 'cloth', 'shoe', 'holiday', 'other'))
);
