-- Add logic_equation field to banner_columns table
-- This field will store complex equations like "S7=2 AND S1=1"

ALTER TABLE public.banner_columns
ADD COLUMN logic_equation TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.banner_columns.logic_equation IS 'Store complex filtering equations like "S7=2 AND S1=1" for advanced banner logic';