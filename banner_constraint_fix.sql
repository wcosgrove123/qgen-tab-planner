-- PHASE 1: Fix Database Constraints for Market Research Banner System
-- Remove blocking constraint that prevents multiple H2 columns per question

-- Step 1: Remove the problematic constraint
ALTER TABLE banner_columns DROP CONSTRAINT IF EXISTS unique_group_question;

-- Step 2: Add a better constraint that prevents true duplicates but allows multiple options per question
ALTER TABLE banner_columns ADD CONSTRAINT unique_group_column_name UNIQUE(banner_group_id, name);

-- Step 3: Verify constraint removal
SELECT
    constraint_name,
    constraint_type,
    table_name
FROM information_schema.table_constraints
WHERE table_name = 'banner_columns'
AND constraint_type = 'UNIQUE';

-- Success message
SELECT 'Database constraints fixed! Multiple H2 columns per question now allowed.' as status;