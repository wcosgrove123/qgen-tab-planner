-- Fix Banner Schema: Allow Multiple Columns per Question
-- Remove restrictive constraint and add proper one

-- Step 1: Drop the overly restrictive constraint
ALTER TABLE banner_columns DROP CONSTRAINT IF EXISTS unique_group_question;

-- Step 2: Add a better constraint that allows multiple columns per question
-- but prevents duplicate question+option combinations in the same group
CREATE UNIQUE INDEX unique_group_question_option ON banner_columns(
    banner_group_id,
    question_id,
    (
        SELECT question_option_id
        FROM banner_column_options
        WHERE banner_column_options.banner_column_id = banner_columns.id
        LIMIT 1
    )
);

-- Alternative approach: Remove the constraint entirely since we handle uniqueness in the app
-- This is simpler and more flexible
DROP INDEX IF EXISTS unique_group_question_option;

-- Just ensure we don't have completely duplicate columns (same name in same group)
CREATE UNIQUE INDEX IF NOT EXISTS unique_group_column_name
ON banner_columns(banner_group_id, name);

-- Verify the constraint is removed
SELECT
    constraint_name,
    constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'banner_columns'
AND constraint_type = 'UNIQUE';

-- Success message
SELECT 'Banner schema constraint fixed! You can now create multiple columns per question.' as status;