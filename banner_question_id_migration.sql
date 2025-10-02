-- Banner Question ID Migration
-- Fixes the issue where editing questionnaires deletes banner columns
-- by changing from UUID reference to stable question_id text reference

-- Step 1: Add new column for question_id text (without dropping old one yet)
ALTER TABLE banner_columns
ADD COLUMN question_code text;

-- Step 2: Populate new column from existing data
-- Get the question_id text from questions table using the UUID
UPDATE banner_columns bc
SET question_code = q.question_id
FROM questions q
WHERE bc.question_id = q.id;

-- Step 3: Add project_id to banner_columns for composite foreign key
ALTER TABLE banner_columns
ADD COLUMN project_id uuid;

-- Step 4: Populate project_id from banner hierarchy
UPDATE banner_columns bc
SET project_id = bd.project_id
FROM banner_groups bg
JOIN banner_definitions bd ON bg.banner_id = bd.id
WHERE bc.banner_group_id = bg.id;

-- Step 5: Make new columns NOT NULL
ALTER TABLE banner_columns
ALTER COLUMN question_code SET NOT NULL,
ALTER COLUMN project_id SET NOT NULL;

-- Step 6: Add composite unique constraint on questions table
ALTER TABLE questions
ADD CONSTRAINT questions_project_question_unique
UNIQUE (project_id, question_id);

-- Step 7: Add composite foreign key for new columns
ALTER TABLE banner_columns
ADD CONSTRAINT banner_columns_question_code_fkey
FOREIGN KEY (project_id, question_code)
REFERENCES questions(project_id, question_id)
ON DELETE RESTRICT;  -- Prevents deletion if banners reference it

-- Step 8: Drop old question_id UUID column (rename first for safety)
ALTER TABLE banner_columns
RENAME COLUMN question_id TO question_id_old;

-- Step 9: Rename new column to question_id
ALTER TABLE banner_columns
RENAME COLUMN question_code TO question_id;

-- Step 10 (Optional): After verifying everything works, drop the old column
-- ALTER TABLE banner_columns DROP COLUMN question_id_old;

-- Verification query
SELECT
  bc.id,
  bc.name,
  bc.question_id,
  bc.project_id,
  q.question_text
FROM banner_columns bc
LEFT JOIN questions q ON q.project_id = bc.project_id AND q.question_id = bc.question_id
ORDER BY bc.banner_group_id, bc.display_order;
