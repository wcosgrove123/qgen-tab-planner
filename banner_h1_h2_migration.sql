-- Migration to add H1/H2 hierarchical support to banner_columns table
-- This allows creating grouped banner structures like the INFUSE example

-- Add columns to support H1/H2 hierarchy
ALTER TABLE banner_columns
ADD COLUMN IF NOT EXISTS column_type TEXT DEFAULT 'h2_column' CHECK (column_type IN ('h1_group', 'h2_column')),
ADD COLUMN IF NOT EXISTS parent_h1_id UUID REFERENCES banner_columns(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS group_title TEXT,
ADD COLUMN IF NOT EXISTS logic_equation TEXT;

-- Create index for faster H1/H2 queries
CREATE INDEX IF NOT EXISTS idx_banner_columns_parent_h1 ON banner_columns(parent_h1_id);
CREATE INDEX IF NOT EXISTS idx_banner_columns_type ON banner_columns(column_type);

-- Comments
COMMENT ON COLUMN banner_columns.column_type IS 'Type of banner column: h1_group (group header) or h2_column (individual column)';
COMMENT ON COLUMN banner_columns.parent_h1_id IS 'For H2 columns: references the H1 group they belong to';
COMMENT ON COLUMN banner_columns.group_title IS 'For H1 groups: the group header title';
COMMENT ON COLUMN banner_columns.logic_equation IS 'For H2 columns: the logic equation (e.g., "S7=2 AND Q1=1-9")';