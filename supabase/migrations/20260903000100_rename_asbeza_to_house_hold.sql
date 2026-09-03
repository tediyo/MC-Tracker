-- Migration to add 'house_hold' to public.cost_subcategory enum and update constraint

-- Step 1: Add 'house_hold' value to enum (Run separately first)
-- ALTER TYPE public.cost_subcategory ADD VALUE IF NOT EXISTS 'house_hold';

-- Step 2: Drop old constraint, update data, add new constraint
ALTER TABLE public.costs DROP CONSTRAINT IF EXISTS chk_category_subcategory;

UPDATE public.costs SET subcategory = 'house_hold' WHERE subcategory = 'asbeza';

ALTER TABLE public.costs ADD CONSTRAINT chk_category_subcategory CHECK (
  (category = 'basic' AND subcategory IN ('food', 'house_hold', 'taxi', 'rent', 'wifi', 'other'))
  OR (category = 'fancy' AND subcategory IN ('drunk', 'coffee', 'familia', 'other'))
  OR (category = 'extra' AND subcategory IN ('cks', 'cloth', 'shoe', 'holiday', 'other'))
);
