-- Banner Columns Cleanup Script
-- Run this to clean up your banner_columns table and establish proper structure

-- Step 1: Backup current data (optional - uncomment to create backup)
-- CREATE TABLE banner_columns_backup AS SELECT * FROM banner_columns;

-- Step 2: Check current data structure
SELECT
    column_type,
    column_label,
    source_question_id,
    parent_h1_id,
    group_title,
    COUNT(*) as count
FROM banner_columns
GROUP BY column_type, column_label, source_question_id, parent_h1_id, group_title
ORDER BY column_type, column_label;

-- Step 3: Identify orphaned H2 columns (H2s without valid H1 parents)
SELECT
    id,
    column_label,
    parent_h1_id,
    'ORPHANED - No H1 parent found' as issue
FROM banner_columns
WHERE column_type = 'h2_column'
AND parent_h1_id IS NOT NULL
AND parent_h1_id NOT IN (
    SELECT id FROM banner_columns WHERE column_type = 'h1_group'
);

-- Step 4: Identify H2 columns with NULL parent_h1_id (should be linked to an H1)
SELECT
    id,
    column_label,
    parent_h1_id,
    'NULL PARENT - Should be linked to H1' as issue
FROM banner_columns
WHERE column_type = 'h2_column'
AND parent_h1_id IS NULL;

-- Step 5: Clean up options (choose one approach):

-- APPROACH A: Delete all and start fresh (recommended for development)
-- DELETE FROM banner_columns;

-- APPROACH B: Keep only properly structured data
-- DELETE FROM banner_columns
-- WHERE column_type = 'h2_column'
-- AND (parent_h1_id IS NULL OR parent_h1_id NOT IN (
--     SELECT id FROM banner_columns WHERE column_type = 'h1_group'
-- ));

-- APPROACH C: Fix orphaned H2s by linking them to first available H1
-- UPDATE banner_columns
-- SET parent_h1_id = (
--     SELECT id FROM banner_columns
--     WHERE column_type = 'h1_group'
--     ORDER BY created_at
--     LIMIT 1
-- )
-- WHERE column_type = 'h2_column'
-- AND parent_h1_id IS NULL;

-- Step 6: Verify clean structure
SELECT
    'H1 Groups' as type,
    COUNT(*) as count
FROM banner_columns
WHERE column_type = 'h1_group'
UNION ALL
SELECT
    'H2 Columns' as type,
    COUNT(*) as count
FROM banner_columns
WHERE column_type = 'h2_column'
UNION ALL
SELECT
    'H2s with valid parents' as type,
    COUNT(*) as count
FROM banner_columns h2
WHERE h2.column_type = 'h2_column'
AND h2.parent_h1_id IN (
    SELECT h1.id FROM banner_columns h1 WHERE h1.column_type = 'h1_group'
);

-- Step 7: Apply performance indexes (after cleanup)
-- Run the banner_optimization_indexes.sql file after cleanup