-- Banner System Performance Optimization Indexes
-- Apply these for optimal H1/H2 hierarchy performance

-- Composite index for efficient hierarchy queries (most important)
CREATE INDEX IF NOT EXISTS idx_banner_columns_hierarchy_lookup
ON banner_columns(banner_id, column_type, parent_h1_id, order_index)
WHERE is_active = true;

-- Covering index for hierarchy queries (includes commonly selected fields)
CREATE INDEX IF NOT EXISTS idx_banner_columns_hierarchy_covering
ON banner_columns(banner_id, column_type, parent_h1_id)
INCLUDE (id, column_id, column_label, source_question_id, group_title, logic_equation, order_index)
WHERE is_active = true;

-- Fast parent lookups for H2 columns
CREATE INDEX IF NOT EXISTS idx_banner_columns_parent_lookup
ON banner_columns(parent_h1_id, order_index)
WHERE column_type = 'h2_column' AND is_active = true;

-- Fast H1 group lookups
CREATE INDEX IF NOT EXISTS idx_banner_columns_h1_groups
ON banner_columns(banner_id, order_index)
WHERE column_type = 'h1_group' AND is_active = true;

-- Unique constraint optimization (already exists, but ensure it's efficient)
-- This should already exist: unique_banner_column (banner_id, column_id)

-- Statistics update for better query planning
ANALYZE banner_columns;

-- Performance monitoring query (run to check index usage)
-- SELECT schemaname, tablename, indexname, idx_tup_read, idx_tup_fetch
-- FROM pg_stat_user_indexes
-- WHERE tablename = 'banner_columns';