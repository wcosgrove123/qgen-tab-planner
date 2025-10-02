# Banner Persistence Fix

## Problem
Editing questionnaires deleted banner columns because:
1. `saveProject()` deletes ALL questions and recreates them (line 169 in `projects.js`)
2. Banner columns referenced `questions.id` (UUID) with CASCADE DELETE
3. When questions were deleted, banner columns were deleted too

## Solution
Changed banner columns to reference stable `question_id` text (like "S7") instead of UUID.

## Migration Steps

### 1. Run Database Migration
Execute `banner_question_id_migration.sql` in Supabase SQL Editor.

This migration:
- Adds `question_code` and `project_id` columns
- Populates them from existing data
- Creates composite foreign key `(project_id, question_id)`
- Renames old `question_id` to `question_id_old` (for rollback safety)
- Renames `question_code` to `question_id`
- Adds `ON DELETE RESTRICT` to prevent question deletion if banners reference it

### 2. Code Changes (Already Applied)

**Updated Files:**
- ✅ `bannerManager.js` - `createBannerColumn()` now includes `project_id` and uses text `question_id`
- ✅ `simpleBannerPage.js` - Passes `questionCode` (text) instead of `questionUUID`

### 3. Verify Migration

After running the migration, check:

```sql
-- Should show question_id as text (like "S7"), not UUID
SELECT
  bc.id,
  bc.name,
  bc.question_id,  -- Should be "S7", "Q1", etc.
  bc.project_id,
  q.question_text
FROM banner_columns bc
LEFT JOIN questions q ON q.project_id = bc.project_id AND q.question_id = bc.question_id;
```

### 4. Test

1. Create an H1 group in Banner Builder
2. Add H2 columns
3. Go to Questionnaire tab
4. Edit a question that's referenced in banners
5. Save the project
6. Go back to Banner Builder
7. **Verify**: H2 columns should still exist (previously they would disappear)

## Rollback

If something goes wrong:

```sql
-- Restore old schema
ALTER TABLE banner_columns DROP CONSTRAINT banner_columns_question_code_fkey;
ALTER TABLE banner_columns DROP COLUMN question_id;
ALTER TABLE banner_columns RENAME COLUMN question_id_old TO question_id;
ALTER TABLE banner_columns DROP COLUMN project_id;
```

Then revert code changes in Git.

## Future Improvements

Consider changing `saveProject()` to use UPSERT instead of DELETE+INSERT:
- Match questions by `(project_id, question_id)` instead of UUID
- Update existing questions instead of deleting
- Only delete questions that are truly removed from questionnaire

This would avoid the CASCADE DELETE issue entirely.

---
**Created**: 2025-09-30
**Issue**: Banner columns deleted when editing questionnaires
**Fix**: Reference stable question_id text instead of UUID
