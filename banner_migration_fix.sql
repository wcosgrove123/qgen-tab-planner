-- Fix: Make question_id_old nullable so new records can be inserted
ALTER TABLE banner_columns
ALTER COLUMN question_id_old DROP NOT NULL;

-- Verify the fix
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'banner_columns'
AND column_name IN ('question_id', 'question_id_old', 'project_id');
